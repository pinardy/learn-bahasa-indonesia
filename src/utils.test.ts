import { describe, expect, it } from 'vitest'
import { accuracyPct, buildOptions, levenshtein, sample, shuffle } from './utils'

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

describe('accuracyPct', () => {
  it('is null before anything is answered', () => {
    expect(accuracyPct(undefined)).toBeNull()
    expect(accuracyPct({ correct: 0, total: 0 })).toBeNull()
  })
  it('rounds to a whole percentage', () => {
    expect(accuracyPct({ correct: 2, total: 3 })).toBe(67)
    expect(accuracyPct({ correct: 0, total: 4 })).toBe(0)
  })
})

describe('buildOptions', () => {
  it('includes the answer plus distinct distractors up to the size', () => {
    const opts = buildOptions('a', ['b', 'c', 'd', 'e'])
    expect(opts).toHaveLength(4)
    expect(opts).toContain('a')
    expect(new Set(opts).size).toBe(4)
  })
  it('skips candidates equal to the answer or already chosen', () => {
    const opts = buildOptions('a', ['a', 'b', 'b', 'c', 'd'])
    expect([...opts].sort()).toEqual(['a', 'b', 'c', 'd'])
  })
  it('prefers earlier candidates', () => {
    expect([...buildOptions('a', ['b', 'c', 'd', 'x', 'y'])].sort()).toEqual(['a', 'b', 'c', 'd'])
  })
  it('returns fewer options when candidates run out', () => {
    expect(buildOptions('a', ['b'])).toHaveLength(2)
  })
  it('accepts a lazy iterable and stops consuming once full', () => {
    let pulled = 0
    function* gen() {
      for (;;) yield `x${pulled++}`
    }
    expect(buildOptions('a', gen(), 3)).toHaveLength(3)
    expect(pulled).toBe(2)
  })
})
