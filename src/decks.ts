import type { CategoryId, SrsCard, Word } from './types'
import { dueWords } from './srs'

/** A selection of words to study: one category, everything, or what's due. */
export type DeckFilter = CategoryId | 'all' | 'review'

/** The words in a deck, in source order (callers shuffle as needed). */
export function deckWords(
  deck: DeckFilter,
  allWords: Word[],
  srs: Record<string, SrsCard>
): Word[] {
  if (deck === 'review') return dueWords(allWords, srs)
  if (deck === 'all') return allWords
  return allWords.filter((w) => w.category === deck)
}
