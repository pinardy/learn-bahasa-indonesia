import type { SrsCard, Word } from './types'

// Leitner box intervals in days: box 1 → tomorrow, up to box 5 → ~3 weeks.
const BOX_INTERVALS = [1, 2, 4, 9, 18]
const MAX_BOX = BOX_INTERVALS.length

/** Local date as YYYY-MM-DD (avoids UTC off-by-one from toISOString). */
export function todayStr(date = new Date()): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + days)
  return todayStr(d)
}

/**
 * Compute the next schedule for a word after a review.
 * Remembered → move up a box (longer interval); missed → back to box 1.
 */
export function schedule(card: SrsCard | undefined, remembered: boolean): SrsCard {
  const reps = (card?.reps ?? 0) + 1
  const box = remembered ? Math.min((card?.box ?? 0) + 1, MAX_BOX) : 1
  const interval = BOX_INTERVALS[box - 1]
  return { box, due: addDays(todayStr(), interval), reps }
}

export function isDue(card: SrsCard, today = todayStr()): boolean {
  return card.due <= today
}

/** Words that are scheduled and due for review today, most overdue first. */
export function dueWords(
  words: Word[],
  srs: Record<string, SrsCard>,
  today = todayStr()
): Word[] {
  return words
    .filter((w) => srs[w.id] && isDue(srs[w.id], today))
    .sort((a, b) => srs[a.id].due.localeCompare(srs[b.id].due))
}

export function dueCount(srs: Record<string, SrsCard>, today = todayStr()): number {
  return Object.values(srs).filter((card) => isDue(card, today)).length
}
