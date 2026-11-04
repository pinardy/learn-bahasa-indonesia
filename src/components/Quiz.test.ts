import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { gradeTypedAnswer, typoTolerance } from './Quiz'

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
