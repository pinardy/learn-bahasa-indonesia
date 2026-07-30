/**
 * Every localStorage key the app uses, in one place — so keys can't drift or
 * collide across the components that read and write them.
 */
export const STORAGE_KEYS = {
  progress: 'bahasa-learner-progress',
  theme: 'bahasa-theme',
  view: 'bahasa-view',
  navOrder: 'bahasa-nav-order',
  pinned: 'bahasa-pinned', // legacy; migrated into navOrder
  translationCache: 'bahasa-news-tx-cache',
} as const
