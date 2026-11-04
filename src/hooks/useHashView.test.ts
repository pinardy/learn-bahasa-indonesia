import { describe, expect, it } from 'vitest'
import { hashFor, viewFromHash } from './useHashView'
import { VIEWS } from '../views'

describe('viewFromHash', () => {
  it('parses known views', () => {
    expect(viewFromHash('#/quiz')).toBe('quiz')
    expect(viewFromHash('#news')).toBe('news')
  })
  it('maps the bare root hash to home', () => {
    expect(viewFromHash('#/')).toBe('home')
    expect(viewFromHash('#')).toBe('home')
  })
  it('returns null for no hash or an unknown view', () => {
    expect(viewFromHash('')).toBeNull()
    expect(viewFromHash('#/nope')).toBeNull()
  })
  it('round-trips every view', () => {
    for (const v of VIEWS) expect(viewFromHash(hashFor(v))).toBe(v)
  })
})
