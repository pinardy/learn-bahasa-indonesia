export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * A multiple-choice option set: the answer plus up to `size - 1` distinct
 * distractors taken in order from `candidates`, shuffled together. Candidates
 * equal to the answer (or to each other) are skipped, so callers can pass a
 * loosely-filtered pool. Order matters: put preferred distractors first.
 */
export function buildOptions(answer: string, candidates: Iterable<string>, size = 4): string[] {
  const options = new Set([answer])
  if (options.size < size) {
    for (const c of candidates) {
      options.add(c)
      if (options.size >= size) break
    }
  }
  return shuffle([...options])
}

export function sample<T>(array: T[], count: number): T[] {
  return shuffle(array).slice(0, count)
}

export function levenshtein(a: string, b: string): number {
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const curr = [i]
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
    prev = curr
  }
  return prev[b.length]
}

/** Whole-number accuracy percentage, or null when nothing has been answered yet. */
export function accuracyPct(stats: { correct: number; total: number } | undefined): number | null {
  if (!stats || stats.total <= 0) return null
  return Math.round((stats.correct / stats.total) * 100)
}
