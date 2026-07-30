import { useState } from 'react'
import type { NewsArticle, WordStatus } from '../types'
import { STORY_QUESTIONS } from '../data/stories'
import { cleanWord, readabilityBand } from '../services/readability'
import { StoryQuiz } from './StoryQuiz'
import { SpeakButton } from './SpeakButton'

export const LOOKUP_FAILED = '(translation unavailable)'

export interface Translation {
  status: 'loading' | 'done' | 'error'
  title?: string
  snippet?: string
}

export interface WordLookup {
  articleId: string
  word: string
  translation: string | null // null while loading
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

interface ArticleCardProps {
  article: NewsArticle
  expanded: boolean
  /** null → no badge (learner has no vocabulary yet, or nothing scorable) */
  score: number | null
  /** meta text when the article has no date, e.g. 'Beginner story' */
  fallbackMeta: string
  /** outlet name for the "read full article" link */
  sourceName: string
  statusByWord: Map<string, WordStatus>
  translation: Translation | undefined
  activeLookup: WordLookup | null
  saving: boolean
  isInVocabulary: (word: string) => boolean
  onToggle: () => void
  onTapWord: (token: string) => void
  onSaveLookup: (lookup: WordLookup) => void
  onShowEnglish: () => void
}

/** One article/story in the reading list: header row plus the expanded reader. */
export function ArticleCard({
  article,
  expanded,
  score,
  fallbackMeta,
  sourceName,
  statusByWord,
  translation: tx,
  activeLookup,
  saving,
  isInVocabulary,
  onToggle,
  onTapWord,
  onSaveLookup,
  onShowEnglish,
}: ArticleCardProps) {
  // every word is tappable for a lookup, tinted by learning status
  const tappableText = (text: string) =>
    text.split(/(\s+)/).map((token, i) => {
      if (!/\S/.test(token)) return token
      const status = statusByWord.get(cleanWord(token).toLowerCase())
      return (
        <button
          key={i}
          className={`news-word ${status ? `news-word-${status}` : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onTapWord(token)
          }}
        >
          {token}
        </button>
      )
    })

  return (
    <li className={`news-item ${expanded ? 'news-item-expanded' : ''}`}>
      <button className="news-item-head" onClick={onToggle}>
        {article.image && <NewsThumb src={article.image} />}
        <span className="news-head-text">
          <span className="news-title">{article.title}</span>
          <span className="news-meta">
            {score !== null && (
              <span
                className={`news-score news-score-${readabilityBand(score)}`}
                title="Share of this article's words that are in your vocabulary"
              >
                📊 {score}% familiar
              </span>
            )}
            {formatDate(article.date) ?? fallbackMeta}
            <span className="news-expand-hint">{expanded ? '▲ close' : '▼ read'}</span>
          </span>
        </span>
      </button>

      {expanded && (
        <div className="news-body">
          <p className="news-snippet">
            {article.snippet ? tappableText(article.snippet) : 'No summary available for this article.'}
          </p>

          {activeLookup && (
            <div className="news-word-lookup">
              <strong>{activeLookup.word}</strong>
              <SpeakButton text={activeLookup.word} size="sm" />
              <span> → {activeLookup.translation ?? '…'}</span>
              {activeLookup.translation &&
                activeLookup.translation !== LOOKUP_FAILED &&
                (isInVocabulary(activeLookup.word) ? (
                  <span className="lookup-saved-note">✓ in your vocabulary</span>
                ) : (
                  <button
                    className="lookup-save-btn"
                    disabled={saving}
                    onClick={() => onSaveLookup(activeLookup)}
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
              onClick={onShowEnglish}
              disabled={tx?.status === 'loading'}
            >
              {tx?.status === 'loading'
                ? 'Translating…'
                : tx?.status === 'error'
                  ? 'Translation failed — retry'
                  : 'Show English translation'}
            </button>
          )}

          {STORY_QUESTIONS[article.id] && <StoryQuiz questions={STORY_QUESTIONS[article.id]} />}

          {article.link && (
            <a className="news-link" href={article.link} target="_blank" rel="noopener noreferrer">
              Read full article on {sourceName} ↗
            </a>
          )}
        </div>
      )}
    </li>
  )
}
