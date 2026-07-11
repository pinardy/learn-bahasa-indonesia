import { describe, expect, it } from 'vitest'
import { levenshtein, sample, shuffle } from './utils'

describe('levenshtein', () => {
  it('is 0 for identical strings', () => {
    expect(levenshtein('kucing', 'kucing')).toBe(0)
    expect(levenshtein('', '')).toBe(0)
  })

  it('is the other length when one string is empty', () => {
    expect(levenshtein('', 'abc')).toBe(3)
    expect(levenshtein('abc', '')).toBe(3)
  })

  it('counts substitutions, insertions, and deletions', () => {
    expect(levenshtein('makan', 'makam')).toBe(1) // substitution
    expect(levenshtein('terima kasih', 'terimakasih')).toBe(1) // deletion
    expect(levenshtein('mkan', 'makan')).toBe(1) // insertion
    expect(levenshtein('ab', 'ba')).toBe(2) // swap = two edits
    expect(levenshtein('selamat', 'siang')).toBe(5)
  })
})

describe('shuffle', () => {
  it('keeps the same elements and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(result).toHaveLength(5)
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5])
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
})

describe('sample', () => {
  it('returns count distinct elements from the source', () => {
    const input = ['a', 'b', 'c', 'd', 'e']
    const result = sample(input, 3)
    expect(result).toHaveLength(3)
    expect(new Set(result).size).toBe(3)
    for (const item of result) expect(input).toContain(item)
  })

  it('returns the whole array when count exceeds its length', () => {
    expect(sample([1, 2], 10)).toHaveLength(2)
  })
})
