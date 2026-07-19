export interface Word {
  id: string
  indonesian: string
  english: string
  category: CategoryId
  example?: string
  exampleTranslation?: string
}

export type CategoryId =
  | 'greetings'
  | 'numbers'
  | 'food'
  | 'family'
  | 'travel'
  | 'verbs'
  | 'adjectives'
  | 'time'
  | 'colors'
  | 'body'
  | 'animals'
  | 'weather'
  | 'household'
  | 'question'
  | 'places'
  | 'transport'
  | 'jobs'
  | 'feelings'
  | 'clothing'
  | 'money'
  | 'saved'

export interface Category {
  id: CategoryId
  name: string
  emoji: string
}

export interface Sentence {
  id: string
  indonesian: string
  english: string
  level: number
}

export interface NewsArticle {
  id: string
  title: string
  snippet: string
  link: string
  image?: string
  date?: string
  /** Pre-translated English for bundled sample articles (offline fallback) */
  sampleEnglish?: { title: string; snippet: string }
}

export interface GrammarExercise {
  id: string
  topic: string
  /** Indonesian sentence containing exactly one ___ blank */
  sentence: string
  answer: string
  distractors: string[]
  /** English meaning of the completed sentence — disambiguates the answer */
  translation: string
  explanation: string
}

export type WordStatus = 'new' | 'learning' | 'known'

/** Spaced-repetition schedule for a single word (Leitner box system) */
export interface SrsCard {
  /** 1–5; higher box = longer interval between reviews */
  box: number
  /** local date (YYYY-MM-DD) the word is next due for review */
  due: string
  /** total number of times reviewed */
  reps: number
}

export interface Progress {
  wordStatus: Record<string, WordStatus>
  quizStats: { correct: number; total: number }
  grammarStats: { correct: number; total: number }
  sentencesSolved: string[]
  /** Words the user saved while reading news articles */
  savedWords: Word[]
  /** Per-word spaced-repetition schedule, keyed by word id */
  srs: Record<string, SrsCard>
  /** Learning-path units whose checkpoint quiz has been passed */
  unitsPassed: CategoryId[]
}
