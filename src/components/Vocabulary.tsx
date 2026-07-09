import { useEffect, useMemo, useState } from 'react'
import type { CategoryId, Word, WordStatus } from '../types'
import { CATEGORIES, SAVED_CATEGORY, WORDS } from '../data/vocabulary'
import { SpeakButton } from './SpeakButton'

interface VocabularyProps {
  wordStatus: Record<string, WordStatus>
  savedWords: Word[]
  onRemoveSaved: (wordId: string) => void
}

const PAGE_SIZE = 30

export function Vocabulary({ wordStatus, savedWords, onRemoveSaved }: VocabularyProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [showTopBtn, setShowTopBtn] = useState(false)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, category])

  useEffect(() => {
    const onScroll = () => setShowTopBtn(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const allWords = useMemo(() => [...WORDS, ...savedWords], [savedWords])
  const categories = savedWords.length > 0 ? [...CATEGORIES, SAVED_CATEGORY] : CATEGORIES

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allWords.filter((w) => {
      if (category !== 'all' && w.category !== category) return false
      if (!q) return true
      return w.indonesian.toLowerCase().includes(q) || w.english.toLowerCase().includes(q)
    })
  }, [search, category, allWords])

  return (
    <div className="vocabulary">
      <input
        type="search"
        className="vocab-search"
        placeholder="Search Indonesian or English…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="category-pills">
        <button
          className={`pill ${category === 'all' ? 'pill-active' : ''}`}
          onClick={() => setCategory('all')}
        >
          All ({allWords.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`pill ${category === c.id ? 'pill-active' : ''}`}
            onClick={() => setCategory(c.id)}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="vocab-empty">No words match “{search}”.</p>
      ) : (
        <ul className="vocab-list">
          {filtered.slice(0, visibleCount).map((w) => {
            const status = wordStatus[w.id] ?? 'new'
            return (
              <li key={w.id} className="vocab-item">
                <div className="vocab-words">
                  <span className="vocab-id">
                    {w.indonesian}
                    <SpeakButton text={w.indonesian} size="sm" />
                  </span>
                  <span className="vocab-en">{w.english}</span>
                  {w.example && (
                    <span className="vocab-example">
                      <em>{w.example}</em> — {w.exampleTranslation}
                    </span>
                  )}
                </div>
                <span className={`status-badge status-${status}`}>
                  {status === 'known' ? '✓ known' : status === 'learning' ? '~ learning' : 'new'}
                </span>
                {w.category === 'saved' && (
                  <button
                    className="vocab-remove"
                    onClick={() => onRemoveSaved(w.id)}
                    aria-label={`Remove "${w.indonesian}" from saved words`}
                    title="Remove from My Words"
                  >
                    ✕
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {filtered.length > visibleCount && (
        <button
          className="btn btn-ghost show-more"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
        >
          Show more ({filtered.length - visibleCount} remaining)
        </button>
      )}

      {showTopBtn && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          title="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  )
}
