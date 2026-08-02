import { useCallback, useEffect, useMemo, useState } from 'react'
import type { NewsArticle, Word, WordStatus } from '../types'
import { fetchNews, NEWS_SOURCES, SAMPLE_ARTICLES, type NewsSource } from '../services/news'
import { STORIES } from '../data/stories'
import { translateIdToEn } from '../services/translate'
import { cleanWord, computeReadability, sentenceContaining } from '../services/readability'
import { WORDS } from '../data/vocabulary'
import {
  ArticleCard,
  LOOKUP_FAILED,
  type Translation,
  type WordLookup,
} from './ArticleCard'

interface NewsProps {
  savedWords: Word[]
  wordStatus: Record<string, WordStatus>
  onSaveWord: (word: Word) => void
}

const PAGE_SIZE = 10

export function News({ savedWords, wordStatus, onSaveWord }: NewsProps) {
  const [readingMode, setReadingMode] = useState<'news' | 'stories'>('news')
  const [source, setSource] = useState<NewsSource>(NEWS_SOURCES[0])
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [translations, setTranslations] = useState<Record<string, Translation>>({})
  const [lookup, setLookup] = useState<WordLookup | null>(null)
  const [saving, setSaving] = useState(false)

  // learning status per lowercase Indonesian word, for highlighting in snippets;
  // saved words without an explicit status count as "learning"
  const statusByWord = useMemo(() => {
    const map = new Map<string, WordStatus>()
    for (const w of WORDS) {
      const status = wordStatus[w.id]
      if (status && status !== 'new') map.set(w.indonesian.toLowerCase(), status)
    }
    for (const w of savedWords) {
      const status = wordStatus[w.id] ?? 'learning'
      if (status !== 'new') map.set(w.indonesian.toLowerCase(), status)
    }
    return map
  }, [savedWords, wordStatus])

  const load = useCallback(async (src: NewsSource) => {
    setLoading(true)
    setOffline(false)
    setExpandedId(null)
    setLookup(null)
    setVisibleCount(PAGE_SIZE)
    try {
      const fetched = await fetchNews(src)
      if (fetched.length === 0) throw new Error('No articles')
      setArticles(fetched)
    } catch {
      setArticles(SAMPLE_ARTICLES)
      setOffline(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(source)
  }, [source, load])

  const toggleExpand = (article: NewsArticle) => {
    setLookup(null)
    setExpandedId(expandedId === article.id ? null : article.id)
  }

  const showEnglish = async (article: NewsArticle) => {
    if (article.sampleEnglish) {
      setTranslations((t) => ({
        ...t,
        [article.id]: { status: 'done', ...article.sampleEnglish },
      }))
      return
    }
    setTranslations((t) => ({ ...t, [article.id]: { status: 'loading' } }))
    try {
      const [title, snippet] = await Promise.all([
        translateIdToEn(article.title),
        article.snippet ? translateIdToEn(article.snippet) : Promise.resolve(''),
      ])
      setTranslations((t) => ({ ...t, [article.id]: { status: 'done', title, snippet } }))
    } catch {
      setTranslations((t) => ({ ...t, [article.id]: { status: 'error' } }))
    }
  }

  const lookupWord = async (articleId: string, token: string) => {
    const word = cleanWord(token)
    if (!word) return
    setLookup({ articleId, word, translation: null })
    try {
      const translation = await translateIdToEn(word.toLowerCase())
      setLookup((current) =>
        current && current.word === word && current.articleId === articleId
          ? { ...current, translation }
          : current
      )
    } catch {
      setLookup((current) =>
        current && current.word === word && current.articleId === articleId
          ? { ...current, translation: LOOKUP_FAILED }
          : current
      )
    }
  }

  const isInVocabulary = (word: string) => {
    const lower = word.toLowerCase()
    return [...WORDS, ...savedWords].some((w) => w.indonesian.toLowerCase() === lower)
  }

  const saveLookup = async (activeLookup: WordLookup, article: NewsArticle) => {
    if (!activeLookup.translation || activeLookup.translation === LOOKUP_FAILED) return
    const indonesian = activeLookup.word.toLowerCase()

    // keep the sentence the word appeared in as the flashcard example
    const example = sentenceContaining(article.snippet, activeLookup.word)
    let exampleTranslation: string | undefined
    if (example) {
      setSaving(true)
      try {
        exampleTranslation = await translateIdToEn(example)
      } catch {
        exampleTranslation = undefined
      } finally {
        setSaving(false)
      }
    }

    onSaveWord({
      id: `saved-${indonesian}`,
      indonesian,
      english: activeLookup.translation.toLowerCase(),
      category: 'saved',
      example,
      exampleTranslation,
    })
  }

  const displayed = readingMode === 'stories' ? STORIES : articles
  const readabilityByArticle = useMemo(
    () => computeReadability(displayed, statusByWord),
    [displayed, statusByWord]
  )

  return (
    <div className="news">
      <div className="category-pills">
        <button
          className={`pill ${readingMode === 'news' ? 'pill-active' : ''}`}
          onClick={() => setReadingMode('news')}
        >
          📰 Live news
        </button>
        <button
          className={`pill ${readingMode === 'stories' ? 'pill-active' : ''}`}
          onClick={() => setReadingMode('stories')}
        >
          📖 Beginner stories
        </button>
      </div>

      {readingMode === 'news' && (
        <div className="category-pills">
          {NEWS_SOURCES.map((s) => (
            <button
              key={s.id}
              className={`pill ${source.id === s.id ? 'pill-active' : ''}`}
              onClick={() => setSource(s)}
            >
              {s.emoji} {s.name}
            </button>
          ))}
        </div>
      )}

      <p className="news-tip">
        💡 Read the Indonesian first, tap any word for its meaning, then reveal the English
        translation to check yourself. Words are tinted by your progress:{' '}
        <span className="news-word-known tip-chip">known</span>{' '}
        <span className="news-word-learning tip-chip">learning</span>. Each article shows how
        familiar its words are to you — a higher % is easier to read.
      </p>

      {readingMode === 'news' && (
        <div className="news-toolbar">
          <span className="news-toolbar-info">
            {source.emoji} {source.name}
            {!loading && !offline && ` · ${articles.length} articles`}
          </span>
          <button
            className={`icon-btn ${loading ? 'icon-btn-spinning' : ''}`}
            onClick={() => void load(source)}
            disabled={loading}
            aria-label="Refresh news"
            title="Refresh news"
          >
            ↻
          </button>
        </div>
      )}

      {readingMode === 'news' && offline && (
        <div className="news-offline">
          Couldn’t reach the news service — showing practice articles instead. Use ↻ Refresh to
          try again.
        </div>
      )}

      {readingMode === 'news' && loading ? (
        <div className="news-loading" role="status" aria-label="Loading news">
          <span className="spinner" />
        </div>
      ) : (
        <ul className="news-list">
          {displayed
            .slice(0, readingMode === 'stories' ? displayed.length : visibleCount)
            .map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                expanded={expandedId === article.id}
                score={readabilityByArticle.get(article.id) ?? null}
                fallbackMeta={
                  readingMode === 'stories'
                    ? 'Beginner story'
                    : article.sampleEnglish
                      ? 'Practice article'
                      : ''
                }
                sourceName={source.name}
                statusByWord={statusByWord}
                translation={translations[article.id]}
                activeLookup={lookup?.articleId === article.id ? lookup : null}
                saving={saving}
                isInVocabulary={isInVocabulary}
                onToggle={() => toggleExpand(article)}
                onTapWord={(token) => void lookupWord(article.id, token)}
                onSaveLookup={(activeLookup) => void saveLookup(activeLookup, article)}
                onCloseLookup={() => setLookup(null)}
                onShowEnglish={() => void showEnglish(article)}
              />
            ))}
        </ul>
      )}

      {readingMode === 'news' && !loading && articles.length > visibleCount && (
        <button
          className="btn btn-ghost show-more"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
        >
          Show more articles ({articles.length - visibleCount} more)
        </button>
      )}
    </div>
  )
}
