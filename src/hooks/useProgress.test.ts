import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyQuizAnswer } from './useProgress'
import type { Progress } from '../types'

const baseProgress = (): Progress => ({
  wordStatus: { tracked: 'known' },
  quizStats: { correct: 3, total: 5 },
  grammarStats: { correct: 0, total: 0 },
  sentencesSolved: [],
  savedWords: [],
  srs: { tracked: { box: 3, due: '2026-07-11', reps: 4 } },
})

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-11T12:00:00'))
})
afterEach(() => {
  vi.useRealTimers()
})

describe('applyQuizAnswer', () => {
  it('always updates quiz accuracy stats', () => {
    expect(applyQuizAnswer(baseProgress(), true).quizStats).toEqual({ correct: 4, total: 6 })
    expect(applyQuizAnswer(baseProgress(), false).quizStats).toEqual({ correct: 3, total: 6 })
  })

  it('does not add an unstudied word to the review rotation on a correct answer', () => {
    const next = applyQuizAnswer(baseProgress(), true, 'unstudied')
    expect(next.srs).not.toHaveProperty('unstudied')
    expect(next.wordStatus).not.toHaveProperty('unstudied')
  })

  it('advances the box of an already-tracked word on a correct answer', () => {
    const next = applyQuizAnswer(baseProgress(), true, 'tracked')
    expect(next.srs.tracked).toEqual({ box: 4, due: '2026-07-20', reps: 5 })
    // status stays whatever the flashcards set it to
    expect(next.wordStatus.tracked).toBe('known')
  })

  it('pulls an unstudied word into the rotation on a miss', () => {
    const next = applyQuizAnswer(baseProgress(), false, 'unstudied')
    expect(next.srs.unstudied).toEqual({ box: 1, due: '2026-07-12', reps: 1 })
    expect(next.wordStatus.unstudied).toBe('learning')
  })

  it('demotes a tracked word to box 1 and marks it learning on a miss', () => {
    const next = applyQuizAnswer(baseProgress(), false, 'tracked')
    expect(next.srs.tracked).toEqual({ box: 1, due: '2026-07-12', reps: 5 })
    expect(next.wordStatus.tracked).toBe('learning')
  })

  it('does not mutate the previous progress object', () => {
    const before = baseProgress()
    applyQuizAnswer(before, false, 'tracked')
    expect(before).toEqual(baseProgress())
  })
})
