import { useMemo, useState } from 'react'
import type { CategoryId, WordStatus } from '../types'
import { CATEGORIES, WORDS } from '../data/vocabulary'

interface VocabularyProps {
  wordStatus: Record<string, WordStatus>
}

export function Vocabulary({ wordStatus }: VocabularyProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return WORDS.filter((w) => {
      if (category !== 'all' && w.category !== category) return false
      if (!q) return true
      return w.indonesian.toLowerCase().includes(q) || w.english.toLowerCase().includes(q)
    })
  }, [search, category])

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
          All ({WORDS.length})
        </button>
        {CATEGORIES.map((c) => (
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
          {filtered.map((w) => {
            const status = wordStatus[w.id] ?? 'new'
            return (
              <li key={w.id} className="vocab-item">
                <div className="vocab-words">
                  <span className="vocab-id">{w.indonesian}</span>
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
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
