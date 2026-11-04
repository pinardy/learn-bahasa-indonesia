import { useMemo } from 'react'
import type { Word } from '../types'
import { CATEGORIES, SAVED_CATEGORY, WORDS } from '../data/vocabulary'

/**
 * The built-in vocabulary plus the learner's saved words, and the category
 * list to filter it by (with ⭐ My Words only once something has been saved).
 */
export function useWordPool(savedWords: Word[]) {
  const allWords = useMemo(() => [...WORDS, ...savedWords], [savedWords])
  const hasSaved = savedWords.length > 0
  const categories = useMemo(
    () => (hasSaved ? [...CATEGORIES, SAVED_CATEGORY] : CATEGORIES),
    [hasSaved]
  )
  return { allWords, categories }
}
