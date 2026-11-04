/** Every top-level screen, its nav tab, and its Home activity card. */
export const NAV_ITEMS = [
  { view: 'home', label: 'Home', emoji: '🏠' },
  {
    view: 'flashcards',
    label: 'Flashcards',
    emoji: '🃏',
    card: { title: 'Flashcards', desc: 'Flip cards to memorize new words' },
  },
  {
    view: 'quiz',
    label: 'Quiz',
    emoji: '❓',
    card: { title: 'Quiz', desc: 'Test yourself with multiple choice' },
  },
  {
    view: 'sentences',
    label: 'Sentences',
    emoji: '🧩',
    card: { title: 'Sentence Builder', desc: 'Arrange words into sentences' },
  },
  {
    view: 'grammar',
    label: 'Grammar',
    emoji: '📝',
    card: { title: 'Grammar', desc: 'Fill in the blank, learn the rules' },
  },
  {
    view: 'numbers',
    label: 'Numbers',
    emoji: '🔢',
    card: { title: 'Numbers & Time', desc: 'Practice numbers and telling time' },
  },
  {
    view: 'phrases',
    label: 'Phrases',
    emoji: '🗣️',
    card: { title: 'Phrases', desc: 'Survival phrases and pronunciation' },
  },
  {
    view: 'vocabulary',
    label: 'Vocabulary',
    emoji: '📖',
    card: { title: 'Vocabulary', desc: 'Browse and search all words' },
  },
  {
    view: 'news',
    label: 'News',
    emoji: '📰',
    card: { title: 'News', desc: 'Read real Indonesian news bilingually' },
  },
] as const satisfies readonly NavItemShape[]

interface NavItemShape {
  view: string
  label: string
  emoji: string
  /** Shown as an activity card on Home (omitted for Home itself) */
  card?: { title: string; desc: string }
}

export type NavItem = (typeof NAV_ITEMS)[number]
export type View = NavItem['view']

export const VIEWS: readonly View[] = NAV_ITEMS.map((i) => i.view)

export const isView = (v: unknown): v is View =>
  typeof v === 'string' && (VIEWS as readonly string[]).includes(v)

/** The screens shown as activity cards on Home (everything but Home itself). */
export const ACTIVITY_ITEMS = NAV_ITEMS.filter(
  (i): i is Extract<NavItem, { card: unknown }> => 'card' in i
)
