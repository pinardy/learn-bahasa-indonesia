import { useCallback, useEffect, useState } from 'react'
import type { NewsArticle } from '../types'
import { fetchNews, NEWS_SOURCES, SAMPLE_ARTICLES, type NewsSource } from '../services/news'
import { translateIdToEn } from '../services/translate'

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

function cleanWord(token: string): string {
  return token.replace(/[.,!?;:"'()[\]«»„“”%–—]/g, '')
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

export function News() {
  const [source, setSource] = useState<NewsSource>(NEWS_SOURCES[0])
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [translations, setTranslations] = useState<Record<string, Translation>>({})
  const [lookup, setLookup] = useState<WordLookup | null>(null)

  const load = useCallback(async (src: NewsSource) => {
    setLoading(true)
    setOffline(false)
    setExpandedId(null)
    setLookup(null)
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
          ? { ...current, translation: '(translation unavailable)' }
          : current
      )
    }
  }

  const renderTappableText = (article: NewsArticle, text: string) =>
    text.split(/(\s+)/).map((token, i) =>
      /\S/.test(token) ? (
        <button
          key={i}
          className="news-word"
          onClick={(e) => {
            e.stopPropagation()
            void lookupWord(article.id, token)
          }}
        >
          {token}
        </button>
      ) : (
        token
      )
    )

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
        <button className="pill pill-refresh" onClick={() => void load(source)} title="Refresh">
          ↻ Refresh
        </button>
      </div>

      <p className="news-tip">
        💡 Read the Indonesian first, tap any word for its meaning, then reveal the English
        translation to check yourself.
      </p>

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
          {articles.map((article) => {
            const expanded = expandedId === article.id
            const tx = translations[article.id]
            const activeLookup = lookup?.articleId === article.id ? lookup : null
            return (
              <li key={article.id} className={`news-item ${expanded ? 'news-item-expanded' : ''}`}>
                <button className="news-item-head" onClick={() => toggleExpand(article)}>
                  {article.image && (
                    <img className="news-thumb" src={article.image} alt="" loading="lazy" />
                  )}
                  <span className="news-head-text">
                    <span className="news-title">{article.title}</span>
                    <span className="news-meta">
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
    </div>
  )
}
