import type { CategoryId, Progress, Word, WordStatus, SrsCard } from '../types'
import { WORDS } from '../data/vocabulary'
import { PATH_ORDER, UNIT_MASTERY } from '../data/path'

/** Bump when the Progress shape changes in a way old backups can't satisfy. */
export const BACKUP_VERSION = 1

/** Envelope written to disk on export — metadata wraps the raw progress. */
export interface ProgressBackup {
  app: 'belajar-indonesia'
  version: number
  exportedAt: string
  progress: Progress
}

export const DEFAULT_PROGRESS: Progress = {
  wordStatus: {},
  quizStats: { correct: 0, total: 0 },
  grammarStats: { correct: 0, total: 0 },
  sentencesSolved: [],
  savedWords: [],
  srs: {},
  unitsPassed: [],
}

// Checkpoint quizzes were added after the learning path: grandfather units
// that were already complete under the old rule (70% of words known).
export function seedUnitsPassed(wordStatus: Record<string, WordStatus>): CategoryId[] {
  return PATH_ORDER.filter((id) => {
    const words = WORDS.filter((w) => w.category === id)
    const known = words.filter((w) => wordStatus[w.id] === 'known').length
    return known >= Math.ceil(words.length * UNIT_MASTERY)
  })
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const asArray = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

const asStats = (v: unknown): { correct: number; total: number } => {
  const o = isObject(v) ? v : {}
  const correct = typeof o.correct === 'number' ? o.correct : 0
  const total = typeof o.total === 'number' ? o.total : 0
  return { correct, total }
}

/**
 * Coerce arbitrary parsed JSON into a valid Progress, defaulting every field.
 * Shared by localStorage loading and file import so both tolerate partial or
 * older data (e.g. a backup taken before `unitsPassed` existed).
 */
export function normalizeProgress(parsed: unknown): Progress {
  const p = isObject(parsed) ? parsed : {}
  const wordStatus = isObject(p.wordStatus) ? (p.wordStatus as Record<string, WordStatus>) : {}
  return {
    wordStatus,
    quizStats: asStats(p.quizStats),
    grammarStats: asStats(p.grammarStats),
    sentencesSolved: asArray<string>(p.sentencesSolved),
    savedWords: asArray<Word>(p.savedWords),
    srs: isObject(p.srs) ? (p.srs as Record<string, SrsCard>) : {},
    unitsPassed: Array.isArray(p.unitsPassed)
      ? (p.unitsPassed as CategoryId[])
      : seedUnitsPassed(wordStatus),
  }
}

/** Keys that mark an object as (some version of) a progress payload. */
const PROGRESS_KEYS = [
  'wordStatus',
  'quizStats',
  'grammarStats',
  'sentencesSolved',
  'savedWords',
  'srs',
  'unitsPassed',
]

const looksLikeProgress = (v: unknown): boolean =>
  isObject(v) && PROGRESS_KEYS.some((k) => k in v)

export function serializeProgress(progress: Progress, exportedAt: string): string {
  const backup: ProgressBackup = {
    app: 'belajar-indonesia',
    version: BACKUP_VERSION,
    exportedAt,
    progress,
  }
  return JSON.stringify(backup, null, 2)
}

/**
 * Parse an exported file back into Progress. Accepts either the versioned
 * envelope or a bare progress object. Throws a user-facing Error if the text
 * isn't valid JSON or doesn't resemble a Belajar backup — so an unrelated
 * file can never silently wipe the learner's progress.
 */
export function deserializeProgress(text: string): Progress {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error("This file isn't valid JSON.")
  }

  // Unwrap the envelope if present.
  const candidate =
    isObject(parsed) && 'progress' in parsed ? (parsed as { progress: unknown }).progress : parsed

  if (!looksLikeProgress(candidate)) {
    throw new Error("This doesn't look like a Belajar progress file.")
  }
  return normalizeProgress(candidate)
}

/** Suggested download filename, e.g. belajar-progress-2026-07-19.json */
export function backupFilename(dateStr: string): string {
  return `belajar-progress-${dateStr}.json`
}
