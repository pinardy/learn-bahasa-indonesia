import { describe, expect, it } from 'vitest'
import {
  BACKUP_VERSION,
  backupFilename,
  deserializeProgress,
  normalizeProgress,
  serializeProgress,
} from './progressIO'
import type { Progress } from '../types'

const fullProgress = (): Progress => ({
  wordStatus: { gre1: 'known', gre2: 'learning' },
  quizStats: { correct: 7, total: 10 },
  grammarStats: { correct: 2, total: 3 },
  sentencesSolved: ['s1', 's2'],
  savedWords: [{ id: 'x', indonesian: 'buku', english: 'book', category: 'saved' }],
  srs: { gre1: { box: 3, due: '2026-07-20', reps: 5 } },
  unitsPassed: ['greetings'],
})

describe('serializeProgress / deserializeProgress', () => {
  it('round-trips a full progress object through the envelope', () => {
    const p = fullProgress()
    const restored = deserializeProgress(serializeProgress(p, '2026-07-19T00:00:00.000Z'))
    expect(restored).toEqual(p)
  })

  it('writes a versioned envelope with metadata', () => {
    const backup = JSON.parse(serializeProgress(fullProgress(), '2026-07-19T00:00:00.000Z'))
    expect(backup.app).toBe('belajar-indonesia')
    expect(backup.version).toBe(BACKUP_VERSION)
    expect(backup.exportedAt).toBe('2026-07-19T00:00:00.000Z')
    expect(backup.progress.quizStats).toEqual({ correct: 7, total: 10 })
  })

  it('accepts a bare progress object (no envelope)', () => {
    const p = fullProgress()
    const restored = deserializeProgress(JSON.stringify(p))
    expect(restored).toEqual(p)
  })

  it('fills missing fields with defaults so older/partial backups still import', () => {
    const restored = deserializeProgress(JSON.stringify({ progress: { quizStats: { correct: 1, total: 2 } } }))
    expect(restored.quizStats).toEqual({ correct: 1, total: 2 })
    expect(restored.wordStatus).toEqual({})
    expect(restored.savedWords).toEqual([])
    expect(restored.srs).toEqual({})
    expect(restored.unitsPassed).toEqual([]) // seeded from empty wordStatus
  })

  it('throws on invalid JSON', () => {
    expect(() => deserializeProgress('{ not json')).toThrow(/valid JSON/)
  })

  it('throws on JSON that is not a progress payload, rather than wiping data', () => {
    expect(() => deserializeProgress(JSON.stringify({ hello: 'world' }))).toThrow(
      /Belajar progress file/
    )
    expect(() => deserializeProgress(JSON.stringify([1, 2, 3]))).toThrow(/Belajar progress file/)
    expect(() => deserializeProgress(JSON.stringify('a string'))).toThrow(/Belajar progress file/)
  })
})

describe('normalizeProgress', () => {
  it('returns full defaults for a null/garbage input', () => {
    expect(normalizeProgress(null)).toEqual({
      wordStatus: {},
      quizStats: { correct: 0, total: 0 },
      grammarStats: { correct: 0, total: 0 },
      sentencesSolved: [],
      savedWords: [],
      srs: {},
      unitsPassed: [],
    })
  })

  it('coerces wrong-typed fields to safe defaults', () => {
    const result = normalizeProgress({
      wordStatus: 'nope',
      quizStats: null,
      sentencesSolved: 'x',
      savedWords: { not: 'an array' },
      srs: 42,
    })
    expect(result.wordStatus).toEqual({})
    expect(result.quizStats).toEqual({ correct: 0, total: 0 })
    expect(result.sentencesSolved).toEqual([])
    expect(result.savedWords).toEqual([])
    expect(result.srs).toEqual({})
  })

  it('seeds unitsPassed from known words when the field is absent', () => {
    // an empty wordStatus clears no units
    expect(normalizeProgress({ wordStatus: {} }).unitsPassed).toEqual([])
  })
})

describe('backupFilename', () => {
  it('embeds the given date', () => {
    expect(backupFilename('2026-07-19')).toBe('belajar-progress-2026-07-19.json')
  })
})
