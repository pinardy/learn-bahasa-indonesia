import type { CategoryId } from '../types'

/**
 * The guided learning path: vocabulary categories in a pedagogical order.
 * A unit is complete when 70% of its words are marked known; completing a
 * unit unlocks the next one.
 */
export const PATH_ORDER: CategoryId[] = [
  'greetings',
  'numbers',
  'family',
  'question',
  'food',
  'verbs',
  'adjectives',
  'time',
  'places',
  'travel',
  'transport',
  'money',
  'feelings',
  'colors',
  'body',
  'animals',
  'weather',
  'household',
  'jobs',
]

export const UNIT_MASTERY = 0.7
