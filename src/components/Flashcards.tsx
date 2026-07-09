import { useMemo, useState } from 'react'
import type { CategoryId, SrsCard, Word, WordStatus } from '../types'
import { CATEGORIES, SAVED_CATEGORY, WORDS } from '../data/vocabulary'
import { shuffle } from '../utils'
import { dueWords } from '../srs'
import { SpeakButton } from './SpeakButton'

type DeckFilter = CategoryId | 'all' | 'review'

interface FlashcardsProps {
  wordStatus: Record<string, WordStatus>
  savedWords: Word[]
  srs: Record<string, SrsCard>
  startInReview?: boolean
  onReview: (wordId: string, remembered: boolean) => void
}

export function Flashcards({
  wordStatus,
  savedWords,
  srs,
  startInReview,
  onReview,
}: FlashcardsProps) {
  const [category, setCategory] = useState<DeckFilter>(startInReview ? 'review' : 'all')
  const [deckSeed, setDeckSeed] = useState(0)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const allWords = useMemo(() => [...WORDS, ...savedWords], [savedWords])
  const categories = savedWords.length > 0 ? [...CATEGORIES, SAVED_CATEGORY] : CATEGORIES
  const reviewCount = useMemo(() => dueWords(allWords, srs).length, [allWords, srs])

  const deck = useMemo(() => {
    if (category === 'review') return dueWords(allWords, srs)
    const pool = category === 'all' ? allWords : allWords.filter((w) => w.category === category)
    return shuffle(pool)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, deckSeed, allWords])

  const word = deck[index]

  const selectCategory = (c: DeckFilter) => {
    setCategory(c)
    setIndex(0)
    setFlipped(false)
  }

  const advance = (remembered?: boolean) => {
    if (remembered !== undefined && word) onReview(word.id, remembered)
    setFlipped(false)
    if (index + 1 >= deck.length) {
      setDeckSeed((s) => s + 1)
      setIndex(0)
    } else {
      setIndex(index + 1)
    }
  }

  const reviewPill = reviewCount > 0 && (
    <button
      className={`pill pill-review ${category === 'review' ? 'pill-active' : ''}`}
      onClick={() => selectCategory('review')}
    >
      ⏰ Review ({reviewCount})
    </button>
  )

  if (!word) {
    return (
      <div className="flashcards">
        <div className="category-pills">
          {reviewPill}
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
        <p className="review-empty">
          🎉 No words due for review right now. Study a category above, and words you grade will
          come back for review on a spaced schedule.
        </p>
      </div>
    )
  }

  const status = wordStatus[word.id] ?? 'new'

  return (
    <div className="flashcards">
      <div className="category-pills">
        {reviewPill}
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

      {category === 'review' && (
        <p className="review-note">
          ⏰ Reviewing {deck.length} word{deck.length === 1 ? '' : 's'} due today
        </p>
      )}

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
            <SpeakButton text={word.indonesian} size="lg" className="flashcard-speak" />
            <span className="flashcard-hint">Tap to reveal</span>
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="flashcard-lang">English</span>
            <span className="flashcard-word">{word.english}</span>
            <SpeakButton text={word.indonesian} size="lg" className="flashcard-speak" />
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
          <button className="btn btn-warn" onClick={() => advance(false)}>
            Still learning
          </button>
          <button className="btn btn-success" onClick={() => advance(true)}>
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
