import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { dueCount, dueWords, isDue, schedule, todayStr } from './srs'
import type { SrsCard, Word } from './types'

const word = (id: string): Word => ({
  id,
  indonesian: id,
  english: id,
  category: 'greetings',
})

const card = (box: number, due: string, reps = 1): SrsCard => ({ box, due, reps })

// Freeze "today" so interval math is deterministic (dates are local time).
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-11T12:00:00'))
})
afterEach(() => {
  vi.useRealTimers()
})

describe('todayStr', () => {
  it('formats the local date as YYYY-MM-DD', () => {
    expect(todayStr()).toBe('2026-07-11')
    expect(todayStr(new Date('2026-01-05T00:00:00'))).toBe('2026-01-05')
  })
})

describe('schedule', () => {
  it('starts an unscheduled word in box 1, due tomorrow, whether remembered or not', () => {
    expect(schedule(undefined, true)).toEqual({ box: 1, due: '2026-07-12', reps: 1 })
    expect(schedule(undefined, false)).toEqual({ box: 1, due: '2026-07-12', reps: 1 })
  })

  it('moves up one box per remembered review, with growing intervals (1, 2, 4, 9, 18 days)', () => {
    expect(schedule(card(1, '2026-07-11'), true)).toEqual({ box: 2, due: '2026-07-13', reps: 2 })
    expect(schedule(card(2, '2026-07-11'), true)).toEqual({ box: 3, due: '2026-07-15', reps: 2 })
    expect(schedule(card(3, '2026-07-11'), true)).toEqual({ box: 4, due: '2026-07-20', reps: 2 })
    expect(schedule(card(4, '2026-07-11'), true)).toEqual({ box: 5, due: '2026-07-29', reps: 2 })
  })

  it('caps at box 5', () => {
    expect(schedule(card(5, '2026-07-11'), true)).toEqual({ box: 5, due: '2026-07-29', reps: 2 })
  })

  it('sends a missed word back to box 1 from any box', () => {
    expect(schedule(card(4, '2026-07-11'), false)).toEqual({ box: 1, due: '2026-07-12', reps: 2 })
  })

  it('counts every review in reps', () => {
    expect(schedule(card(2, '2026-07-11', 7), false).reps).toBe(8)
  })

  it('schedules across month boundaries', () => {
    vi.setSystemTime(new Date('2026-07-30T12:00:00'))
    expect(schedule(card(2, '2026-07-30'), true).due).toBe('2026-08-03')
  })
})

describe('isDue', () => {
  it('is due on or before its due date, not after', () => {
    expect(isDue(card(1, '2026-07-10'))).toBe(true)
    expect(isDue(card(1, '2026-07-11'))).toBe(true)
    expect(isDue(card(1, '2026-07-12'))).toBe(false)
  })
})

describe('dueWords', () => {
  it('returns only scheduled words that are due, most overdue first', () => {
    const words = [word('a'), word('b'), word('c'), word('d')]
    const srs = {
      a: card(1, '2026-07-11'), // due today
      b: card(2, '2026-07-01'), // most overdue
      c: card(3, '2026-08-01'), // not due yet
      // d: never scheduled
    }
    expect(dueWords(words, srs).map((w) => w.id)).toEqual(['b', 'a'])
  })
})

describe('dueCount', () => {
  it('counts due cards even when the word list is not at hand', () => {
    expect(
      dueCount({ a: card(1, '2026-07-11'), b: card(2, '2026-07-01'), c: card(3, '2026-08-01') })
    ).toBe(2)
    expect(dueCount({})).toBe(0)
  })
})
