import { useMemo, useState } from 'react'
import type { CategoryId, Word, WordStatus } from '../types'
import { CATEGORIES, SAVED_CATEGORY, WORDS } from '../data/vocabulary'
import { shuffle } from '../utils'

interface FlashcardsProps {
  wordStatus: Record<string, WordStatus>
  savedWords: Word[]
  onSetStatus: (wordId: string, status: WordStatus) => void
}

export function Flashcards({ wordStatus, savedWords, onSetStatus }: FlashcardsProps) {
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [deckSeed, setDeckSeed] = useState(0)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const allWords = useMemo(() => [...WORDS, ...savedWords], [savedWords])
  const categories = savedWords.length > 0 ? [...CATEGORIES, SAVED_CATEGORY] : CATEGORIES

  const deck = useMemo(() => {
    const pool = category === 'all' ? allWords : allWords.filter((w) => w.category === category)
    return shuffle(pool)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, deckSeed, allWords])

  const word = deck[index]

  const selectCategory = (c: CategoryId | 'all') => {
    setCategory(c)
    setIndex(0)
    setFlipped(false)
  }

  const advance = (status?: WordStatus) => {
    if (status && word) onSetStatus(word.id, status)
    setFlipped(false)
    if (index + 1 >= deck.length) {
      setDeckSeed((s) => s + 1)
      setIndex(0)
    } else {
      setIndex(index + 1)
    }
  }

  if (!word) return null

  const status = wordStatus[word.id] ?? 'new'

  return (
    <div className="flashcards">
      <div className="category-pills">
        <button
          className={`pill ${category === 'all' ? 'pill-active' : ''}`}
          onClick={() => selectCategory('all')}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`pill ${category === c.id ? 'pill-active' : ''}`}
            onClick={() => selectCategory(c.id)}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      <div className="deck-position">
        Card {index + 1} of {deck.length}
        {status !== 'new' && (
          <span className={`status-badge status-${status}`}>
            {status === 'known' ? '✓ known' : '~ learning'}
          </span>
        )}
      </div>

      <div
        className={`flashcard ${flipped ? 'flashcard-flipped' : ''}`}
        onClick={() => setFlipped(!flipped)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            setFlipped(!flipped)
          }
        }}
      >
        <div className="flashcard-inner">
          <div className="flashcard-face flashcard-front">
            <span className="flashcard-lang">Bahasa Indonesia</span>
            <span className="flashcard-word">{word.indonesian}</span>
            <span className="flashcard-hint">Tap to reveal</span>
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="flashcard-lang">English</span>
            <span className="flashcard-word">{word.english}</span>
            {word.example && (
              <div className="flashcard-example">
                <em>{word.example}</em>
                <span>{word.exampleTranslation}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {flipped ? (
        <div className="flashcard-actions">
          <button className="btn btn-warn" onClick={() => advance('learning')}>
            Still learning
          </button>
          <button className="btn btn-success" onClick={() => advance('known')}>
            I know this ✓
          </button>
        </div>
      ) : (
        <div className="flashcard-actions">
          <button className="btn btn-ghost" onClick={() => advance()}>
            Skip →
          </button>
        </div>
      )}
    </div>
  )
}
