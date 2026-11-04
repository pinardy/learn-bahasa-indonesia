import { describe, expect, it } from 'vitest'
import { deckWords } from './decks'
import type { SrsCard, Word } from './types'

const w = (id: string, category: Word['category'], indonesian = id): Word => ({
  id,
  indonesian,
  english: id,
  category,
})

const allWords: Word[] = [
  w('g1', 'greetings'),
  w('g2', 'greetings'),
  w('f1', 'food'),
  w('f2', 'food'),
  w('n1', 'numbers'),
]

describe('deckWords', () => {
  it('returns everything for the "all" deck', () => {
    expect(deckWords('all', allWords, {}).map((x) => x.id)).toEqual(['g1', 'g2', 'f1', 'f2', 'n1'])
  })

  it('filters to a single category', () => {
    expect(deckWords('food', allWords, {}).map((x) => x.id)).toEqual(['f1', 'f2'])
  })

  it('returns due words for the "review" deck', () => {
    const card = (due: string): SrsCard => ({ box: 1, due, reps: 1 })
    const srs = { g1: card('2000-01-01'), n1: card('2999-01-01') } // g1 overdue, n1 far future
    expect(deckWords('review', allWords, srs).map((x) => x.id)).toEqual(['g1'])
  })
})
