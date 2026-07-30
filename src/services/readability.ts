import type { NewsArticle, WordStatus } from '../types'

// High-frequency Indonesian function/grammar words — the "glue" that fills any
// text and that the Grammar tab teaches (yang, di/ke/dari, tidak, sudah/akan…).
// Counted toward readability so the score reflects real text coverage, not just
// content words from the flashcard list.
export const COMMON_WORDS = new Set([
  'yang', 'di', 'ke', 'dari', 'dan', 'atau', 'ini', 'itu', 'untuk', 'dengan',
  'pada', 'dalam', 'adalah', 'akan', 'sudah', 'telah', 'sedang', 'masih', 'tidak',
  'bukan', 'belum', 'juga', 'saja', 'hanya', 'sangat', 'lebih', 'paling', 'karena',
  'jika', 'kalau', 'tetapi', 'tapi', 'namun', 'saat', 'ketika', 'setelah', 'sebelum',
  'oleh', 'para', 'sebagai', 'agar', 'bahwa', 'ada', 'ia', 'nya', 'seorang', 'sebuah',
  'banyak', 'semua', 'bisa', 'dapat', 'harus', 'ingin', 'menjadi', 'tersebut', 'lewat',
])

/** Strip punctuation from a token so it can be matched against the vocabulary. */
export function cleanWord(token: string): string {
  return token.replace(/[.,!?;:"'()[\]«»„“”%–—]/g, '')
}

/** Find the sentence within a snippet that contains the given word. */
export function sentenceContaining(text: string, word: string): string | undefined {
  const lower = word.toLowerCase()
  return text
    .split(/(?<=[.!?])\s+/)
    .find((s) => s.toLowerCase().includes(lower))
    ?.trim()
}

/**
 * Share of each article's words that are familiar (known/learning/saved
 * vocabulary plus the COMMON_WORDS baseline), as a rough readability estimate.
 * Returns an empty map when the learner has no vocabulary yet, so new users
 * don't see 0% everywhere. Articles with no scorable tokens are omitted.
 */
export function computeReadability(
  articles: NewsArticle[],
  statusByWord: Map<string, WordStatus>
): Map<string, number> {
  const scores = new Map<string, number>()
  if (statusByWord.size === 0) return scores
  for (const article of articles) {
    const tokens = `${article.title} ${article.snippet}`
      .split(/\s+/)
      .map((t) => cleanWord(t).toLowerCase())
      .filter((t) => /[a-z]/.test(t))
    if (tokens.length === 0) continue
    const familiar = tokens.filter((t) => statusByWord.has(t) || COMMON_WORDS.has(t)).length
    scores.set(article.id, Math.round((familiar / tokens.length) * 100))
  }
  return scores
}

/**
 * Colour band for a readability score. Real news is dense, so a learner's
 * coverage sits low; the scale is calibrated to that range rather than to an
 * idealised split.
 */
export function readabilityBand(score: number): 'high' | 'mid' | 'low' {
  return score >= 45 ? 'high' : score >= 20 ? 'mid' : 'low'
}
