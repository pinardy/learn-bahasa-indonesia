import { useEffect, useMemo, useState } from 'react'
import type { CategoryId, Word, WordStatus } from '../types'
import { CATEGORIES, SAVED_CATEGORY, WORDS } from '../data/vocabulary'
import { SpeakButton } from './SpeakButton'

interface VocabularyProps {
  wordStatus: Record<string, WordStatus>
  savedWords: Word[]
  onRemoveSaved: (wordId: string) => void
  onSaveWord: (word: Word) => void
}

const PAGE_SIZE = 30

export function Vocabulary({ wordStatus, savedWords, onRemoveSaved, onSaveWord }: VocabularyProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [showTopBtn, setShowTopBtn] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newIndonesian, setNewIndonesian] = useState('')
  const [newEnglish, setNewEnglish] = useState('')

  const addWord = () => {
    const indonesian = newIndonesian.trim().toLowerCase()
    const english = newEnglish.trim().toLowerCase()
    if (!indonesian || !english) return
    onSaveWord({ id: `saved-${indonesian}`, indonesian, english, category: 'saved' })
    setNewIndonesian('')
    setNewEnglish('')
    setAdding(false)
    setCategory('saved')
  }

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
  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const w of allWords) m[w.category] = (m[w.category] ?? 0) + 1
    return m
  }, [allWords])

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

      {adding ? (
        <form
          className="add-word-form"
          onSubmit={(e) => {
            e.preventDefault()
            addWord()
          }}
        >
          <input
            className="typed-input"
            placeholder="Indonesian word…"
            value={newIndonesian}
            onChange={(e) => setNewIndonesian(e.target.value)}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
          />
          <input
            className="typed-input"
            placeholder="English meaning…"
            value={newEnglish}
            onChange={(e) => setNewEnglish(e.target.value)}
            autoComplete="off"
          />
          <div className="add-word-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newIndonesian.trim() || !newEnglish.trim()}
            >
              Save to ⭐ My Words
            </button>
          </div>
        </form>
      ) : (
        <button className="btn btn-ghost add-word-toggle" onClick={() => setAdding(true)}>
          ＋ Add your own word
        </button>
      )}

      <select
        className="filter-select"
        value={category}
        onChange={(e) => setCategory(e.target.value as CategoryId | 'all')}
        aria-label="Filter by category"
      >
        <option value="all">All words ({allWords.length})</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.emoji} {c.name} ({counts[c.id] ?? 0})
          </option>
        ))}
      </select>

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
