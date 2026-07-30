import { describe, expect, it } from 'vitest'
import { cleanWord, computeReadability, readabilityBand, sentenceContaining } from './readability'
import type { NewsArticle, WordStatus } from '../types'

const article = (id: string, title: string, snippet: string): NewsArticle => ({
  id,
  title,
  snippet,
  link: '',
})

describe('cleanWord', () => {
  it('strips surrounding punctuation but keeps letters', () => {
    expect(cleanWord('“Jakarta,”')).toBe('Jakarta')
    expect(cleanWord('(pasar)!')).toBe('pasar')
    expect(cleanWord('hati-hati')).toBe('hati-hati') // hyphens stay
  })
})

describe('sentenceContaining', () => {
  const text = 'Saya pergi ke pasar. Di sana saya membeli buah! Lalu saya pulang.'
  it('returns the sentence containing the word', () => {
    expect(sentenceContaining(text, 'membeli')).toBe('Di sana saya membeli buah!')
  })
  it('is case-insensitive and returns undefined when absent', () => {
    expect(sentenceContaining(text, 'PASAR')).toBe('Saya pergi ke pasar.')
    expect(sentenceContaining(text, 'zzz')).toBeUndefined()
  })
})

describe('computeReadability', () => {
  const vocab = new Map<string, WordStatus>([
    ['kopi', 'known'],
    ['pasar', 'learning'],
  ])

  it('returns an empty map when the learner has no vocabulary', () => {
    const scores = computeReadability([article('a', 'Kopi enak', 'Saya suka kopi.')], new Map())
    expect(scores.size).toBe(0)
  })

  it('counts vocabulary words and common function words as familiar', () => {
    // tokens: kopi(known) di(common) pasar(learning) enak(unknown) → 3/4 = 75
    const scores = computeReadability([article('a', 'Kopi di pasar', 'enak')], vocab)
    expect(scores.get('a')).toBe(75)
  })

  it('omits articles with no scorable tokens', () => {
    const scores = computeReadability([article('a', '123', '456 !!')], vocab)
    expect(scores.has('a')).toBe(false)
  })
})

describe('readabilityBand', () => {
  it('maps scores to bands at the calibrated thresholds', () => {
    expect(readabilityBand(45)).toBe('high')
    expect(readabilityBand(44)).toBe('mid')
    expect(readabilityBand(20)).toBe('mid')
    expect(readabilityBand(19)).toBe('low')
  })
})
