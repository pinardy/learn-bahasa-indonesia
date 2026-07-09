import { useCallback, useEffect, useMemo, useState } from 'react'
import type { NewsArticle, Word, WordStatus } from '../types'
import { fetchNews, NEWS_SOURCES, SAMPLE_ARTICLES, type NewsSource } from '../services/news'
import { translateIdToEn } from '../services/translate'
import { WORDS } from '../data/vocabulary'

const LOOKUP_FAILED = '(translation unavailable)'

// High-frequency Indonesian function/grammar words — the "glue" that fills any
// text and that the Grammar tab teaches (yang, di/ke/dari, tidak, sudah/akan…).
// Counted toward readability so the score reflects real text coverage, not just
// content words from the flashcard list.
const COMMON_WORDS = new Set([
  'yang', 'di', 'ke', 'dari', 'dan', 'atau', 'ini', 'itu', 'untuk', 'dengan',
  'pada', 'dalam', 'adalah', 'akan', 'sudah', 'telah', 'sedang', 'masih', 'tidak',
  'bukan', 'belum', 'juga', 'saja', 'hanya', 'sangat', 'lebih', 'paling', 'karena',
  'jika', 'kalau', 'tetapi', 'tapi', 'namun', 'saat', 'ketika', 'setelah', 'sebelum',
  'oleh', 'para', 'sebagai', 'agar', 'bahwa', 'ada', 'ia', 'nya', 'seorang', 'sebuah',
  'banyak', 'semua', 'bisa', 'dapat', 'harus', 'ingin', 'menjadi', 'tersebut', 'lewat',
])

interface Translation {
  status: 'loading' | 'done' | 'error'
  title?: string
  snippet?: string
}

interface WordLookup {
  articleId: string
  word: string
  translation: string | null // null while loading
}

interface NewsProps {
  savedWords: Word[]
  wordStatus: Record<string, WordStatus>
  onSaveWord: (word: Word) => void
}

/** Find the sentence within a snippet that contains the given word */
function sentenceContaining(text: string, word: string): string | undefined {
  const lower = word.toLowerCase()
  return text
    .split(/(?<=[.!?])\s+/)
    .find((s) => s.toLowerCase().includes(lower))
    ?.trim()
}

function cleanWord(token: string): string {
  return token.replace(/[.,!?;:"'()[\]«»„“”%–—]/g, '')
}

function NewsThumb({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <span className="news-thumb-wrap">
      <img
        className={`news-thumb ${loaded ? 'news-thumb-loaded' : ''}`}
        src={src}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        ref={(img) => {
          // cached images can finish before React attaches onLoad
          if (img?.complete && img.naturalWidth > 0) setLoaded(true)
        }}
      />
    </span>
  )
}

function formatDate(iso?: string): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const PAGE_SIZE = 10

export function News({ savedWords, wordStatus, onSaveWord }: NewsProps) {
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

  // Share of an article's words that are in your vocabulary (known + learning +
  // saved), as a rough readability estimate. Consistent with the word highlighting.
  // Returns null until you have some vocabulary, so it isn't 0% for everyone.
  const readabilityFor = (article: NewsArticle): number | null => {
    if (statusByWord.size === 0) return null
    const tokens = `${article.title} ${article.snippet}`
      .split(/\s+/)
      .map((t) => cleanWord(t).toLowerCase())
      .filter((t) => /[a-z]/.test(t))
    if (tokens.length === 0) return null
    const familiar = tokens.filter((t) => statusByWord.has(t) || COMMON_WORDS.has(t)).length
    return Math.round((familiar / tokens.length) * 100)
  }

  const renderTappableText = (article: NewsArticle, text: string) =>
    text.split(/(\s+)/).map((token, i) => {
      if (!/\S/.test(token)) return token
      const status = statusByWord.get(cleanWord(token).toLowerCase())
      return (
        <button
          key={i}
          className={`news-word ${status ? `news-word-${status}` : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            void lookupWord(article.id, token)
          }}
        >
          {token}
        </button>
      )
    })

  return (
    <div className="news">
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

      <p className="news-tip">
        💡 Read the Indonesian first, tap any word for its meaning, then reveal the English
        translation to check yourself. Words are tinted by your progress:{' '}
        <span className="news-word-known tip-chip">known</span>{' '}
        <span className="news-word-learning tip-chip">learning</span>. Each article shows how
        familiar its words are to you — a higher % is easier to read.
      </p>

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

      {offline && (
        <div className="news-offline">
          Couldn’t reach the news service — showing practice articles instead. Use ↻ Refresh to
          try again.
        </div>
      )}

      {loading ? (
        <div className="news-loading" role="status" aria-label="Loading news">
          <span className="spinner" />
        </div>
      ) : (
        <ul className="news-list">
          {articles.slice(0, visibleCount).map((article) => {
            const expanded = expandedId === article.id
            const tx = translations[article.id]
            const activeLookup = lookup?.articleId === article.id ? lookup : null
            const score = readabilityFor(article)
            // real news is dense, so a learner's coverage sits low; calibrate the
            // colour scale to that range rather than to an idealised 60/30 split
            const band = score === null ? '' : score >= 45 ? 'high' : score >= 20 ? 'mid' : 'low'
            return (
              <li key={article.id} className={`news-item ${expanded ? 'news-item-expanded' : ''}`}>
                <button className="news-item-head" onClick={() => toggleExpand(article)}>
                  {article.image && <NewsThumb src={article.image} />}
                  <span className="news-head-text">
                    <span className="news-title">{article.title}</span>
                    <span className="news-meta">
                      {score !== null && (
                        <span
                          className={`news-score news-score-${band}`}
                          title="Share of this article's words that are in your vocabulary"
                        >
                          📊 {score}% familiar
                        </span>
                      )}
                      {formatDate(article.date) ?? (article.sampleEnglish ? 'Practice article' : '')}
                      <span className="news-expand-hint">{expanded ? '▲ close' : '▼ read'}</span>
                    </span>
                  </span>
                </button>

                {expanded && (
                  <div className="news-body">
                    <p className="news-snippet">
                      {article.snippet
                        ? renderTappableText(article, article.snippet)
                        : 'No summary available for this article.'}
                    </p>

                    {activeLookup && (
                      <div className="news-word-lookup">
                        <strong>{activeLookup.word}</strong>
                        <span> → {activeLookup.translation ?? '…'}</span>
                        {activeLookup.translation &&
                          activeLookup.translation !== LOOKUP_FAILED &&
                          (isInVocabulary(activeLookup.word) ? (
                            <span className="lookup-saved-note">✓ in your vocabulary</span>
                          ) : (
                            <button
                              className="lookup-save-btn"
                              disabled={saving}
                              onClick={() => void saveLookup(activeLookup, article)}
                            >
                              {saving ? 'Saving…' : '＋ Save word'}
                            </button>
                          ))}
                      </div>
                    )}

                    {tx?.status === 'done' ? (
                      <div className="news-translation">
                        <span className="news-translation-label">English</span>
                        <p className="news-translation-title">{tx.title}</p>
                        {tx.snippet && <p>{tx.snippet}</p>}
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => void showEnglish(article)}
                        disabled={tx?.status === 'loading'}
                      >
                        {tx?.status === 'loading'
                          ? 'Translating…'
                          : tx?.status === 'error'
                            ? 'Translation failed — retry'
                            : 'Show English translation'}
                      </button>
                    )}

                    <a
                      className="news-link"
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read full article on {source.name} ↗
                    </a>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {!loading && articles.length > visibleCount && (
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
