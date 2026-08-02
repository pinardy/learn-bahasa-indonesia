import { useMemo, useRef, useState } from 'react'
import type { CategoryId, SrsCard, Word, WordStatus } from '../types'
import { CATEGORIES, SAVED_CATEGORY, WORDS } from '../data/vocabulary'
import { shuffle } from '../utils'
import { dueWords } from '../srs'
import { SpeakButton } from './SpeakButton'

export type DeckFilter = CategoryId | 'all' | 'review'

interface FlashcardsProps {
  wordStatus: Record<string, WordStatus>
  savedWords: Word[]
  srs: Record<string, SrsCard>
  /** Deck to open with (e.g. 'review' from the home banner, a category from the learning path) */
  initialDeck?: DeckFilter
  onReview: (wordId: string, remembered: boolean) => void
}

export function Flashcards({
  wordStatus,
  savedWords,
  srs,
  initialDeck,
  onReview,
}: FlashcardsProps) {
  const [category, setCategory] = useState<DeckFilter>(initialDeck ?? 'all')
  const [deckSeed, setDeckSeed] = useState(0)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // Swipe-to-grade: drag the card right ("I know this") or left ("still
  // learning"). A tap still flips; a mostly-vertical drag is left to the page.
  const [dragX, setDragX] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const didSwipe = useRef(false)
  const SWIPE_THRESHOLD = 90

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

  // Fly the card off-screen in the swipe direction, then grade + advance.
  const commitSwipe = (remembered: boolean) => {
    setLeaving(true)
    setDragX(remembered ? 520 : -520)
    window.setTimeout(() => {
      advance(remembered)
      setLeaving(false)
      setDragX(0)
    }, 180)
  }

  const onCardPointerDown = (e: React.PointerEvent) => {
    if (leaving) return
    dragStart.current = { x: e.clientX, y: e.clientY }
    didSwipe.current = false
    // keep receiving move/up even if the finger leaves the card during a swipe
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onCardPointerMove = (e: React.PointerEvent) => {
    const start = dragStart.current
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    // let the page scroll if the gesture is mostly vertical
    if (Math.abs(dy) > Math.abs(dx)) return
    if (Math.abs(dx) > 10) didSwipe.current = true
    setDragX(dx)
  }
  const onCardPointerUp = (e: React.PointerEvent) => {
    const start = dragStart.current
    dragStart.current = null
    if (!start) return
    // read the offset from the event, not from React state (which may not have
    // committed the latest drag value yet by the time pointerup fires)
    const dx = e.clientX - start.x
    if (dx > SWIPE_THRESHOLD) commitSwipe(true)
    else if (dx < -SWIPE_THRESHOLD) commitSwipe(false)
    else setDragX(0)
  }
  const onCardPointerCancel = () => {
    dragStart.current = null
    setDragX(0)
  }

  const categorySelect = (
    <select
      className="filter-select"
      value={category}
      onChange={(e) => selectCategory(e.target.value as DeckFilter)}
      aria-label="Choose a deck"
    >
      {reviewCount > 0 && <option value="review">⏰ Review ({reviewCount} due)</option>}
      <option value="all">All words</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.emoji} {c.name}
        </option>
      ))}
    </select>
  )

  if (!word) {
    return (
      <div className="flashcards">
        {categorySelect}
        <p className="review-empty">
          🎉 No words due for review right now. Choose a deck above, and words you grade will come
          back for review on a spaced schedule.
        </p>
      </div>
    )
  }

  const status = wordStatus[word.id] ?? 'new'

  return (
    <div className="flashcards">
      {categorySelect}

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
        style={{
          transform: `translateX(${dragX}px) rotate(${dragX * 0.03}deg)`,
          transition: dragStart.current && !leaving ? 'none' : 'transform 0.18s ease',
          opacity: leaving ? 0 : 1,
        }}
        onClick={() => {
          if (didSwipe.current) {
            didSwipe.current = false
            return
          }
          setFlipped(!flipped)
        }}
        onPointerDown={onCardPointerDown}
        onPointerMove={onCardPointerMove}
        onPointerUp={onCardPointerUp}
        onPointerCancel={onCardPointerCancel}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            setFlipped(!flipped)
          }
        }}
      >
        <span
          className="swipe-hint swipe-hint-know"
          style={{ opacity: Math.min(Math.max(dragX, 0) / SWIPE_THRESHOLD, 1) }}
          aria-hidden="true"
        >
          I know this ✓
        </span>
        <span
          className="swipe-hint swipe-hint-learn"
          style={{ opacity: Math.min(Math.max(-dragX, 0) / SWIPE_THRESHOLD, 1) }}
          aria-hidden="true"
        >
          Still learning
        </span>
        <div className="flashcard-inner" key={`${deckSeed}-${index}`}>
          <div className="flashcard-face flashcard-front">
            <span className="flashcard-lang">Bahasa Indonesia</span>
            <span className="flashcard-word">{word.indonesian}</span>
            <SpeakButton text={word.indonesian} size="lg" className="flashcard-speak" />
            <span className="flashcard-hint">Tap to flip · swipe to grade</span>
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
