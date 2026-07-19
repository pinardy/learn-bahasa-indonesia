import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { gradeTypedAnswer, poolWords, typoTolerance } from './Quiz'
import type { SrsCard, Word } from '../types'

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

describe('poolWords', () => {
  it('returns everything for the "all" pool', () => {
    expect(poolWords('all', allWords, {}).map((x) => x.id)).toEqual(['g1', 'g2', 'f1', 'f2', 'n1'])
  })

  it('filters to a single category', () => {
    expect(poolWords('food', allWords, {}).map((x) => x.id)).toEqual(['f1', 'f2'])
  })

  it('returns due words for the "review" pool', () => {
    const card = (due: string): SrsCard => ({ box: 1, due, reps: 1 })
    const srs = { g1: card('2000-01-01'), n1: card('2999-01-01') } // g1 overdue, n1 far future
    expect(poolWords('review', allWords, srs).map((x) => x.id)).toEqual(['g1'])
  })
})

describe('typoTolerance', () => {
  it('allows one edit for words of 5+ letters, none for short words', () => {
    expect(typoTolerance('kabar')).toBe(1) // 5 letters
    expect(typoTolerance('makan')).toBe(1)
    expect(typoTolerance('dua')).toBe(0) // 3 letters
    expect(typoTolerance('')).toBe(0)
  })
})

describe('gradeTypedAnswer', () => {
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
  afterEach(() => vi.restoreAllMocks())

  it('accepts an exact match, ignoring case and surrounding space', () => {
    expect(gradeTypedAnswer('makan', 'makan')).toBe(true)
    expect(gradeTypedAnswer('  Makan ', 'makan')).toBe(true)
  })

  it('collapses internal whitespace', () => {
    expect(gradeTypedAnswer('terima  kasih', 'terima kasih')).toBe(true)
  })

  it('forgives a single typo in a long word', () => {
    expect(gradeTypedAnswer('makam', 'makan')).toBe(true) // 1 edit, 5 letters
  })

  it('rejects a typo in a short word (no tolerance)', () => {
    expect(gradeTypedAnswer('dux', 'dua')).toBe(false)
  })

  it('rejects answers more than one edit away', () => {
    expect(gradeTypedAnswer('siang', 'selamat')).toBe(false)
  })
})
