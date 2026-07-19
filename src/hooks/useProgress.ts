import { useCallback, useEffect, useState } from 'react'
import type { CategoryId, Progress, Word, WordStatus } from '../types'
import { schedule } from '../srs'
import { WORDS } from '../data/vocabulary'
import { PATH_ORDER, UNIT_MASTERY } from '../data/path'

const STORAGE_KEY = 'bahasa-learner-progress'

const DEFAULT_PROGRESS: Progress = {
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
function seedUnitsPassed(wordStatus: Record<string, WordStatus>): CategoryId[] {
  return PATH_ORDER.filter((id) => {
    const words = WORDS.filter((w) => w.category === id)
    const known = words.filter((w) => wordStatus[w.id] === 'known').length
    return known >= Math.ceil(words.length * UNIT_MASTERY)
  })
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PROGRESS
    const parsed = JSON.parse(raw) as Partial<Progress>
    return {
      wordStatus: parsed.wordStatus ?? {},
      quizStats: parsed.quizStats ?? { correct: 0, total: 0 },
      grammarStats: parsed.grammarStats ?? { correct: 0, total: 0 },
      sentencesSolved: parsed.sentencesSolved ?? [],
      savedWords: parsed.savedWords ?? [],
      srs: parsed.srs ?? {},
      unitsPassed: parsed.unitsPassed ?? seedUnitsPassed(parsed.wordStatus ?? {}),
    }
  } catch {
    return DEFAULT_PROGRESS
  }
}

// A quiz answer also counts as a spaced-repetition review of the word:
// wrong pulls it into the review rotation (back to box 1, marked
// "learning"); correct only advances words already scheduled — otherwise
// every quiz round would flood the due deck with random unstudied words.
export function applyQuizAnswer(p: Progress, correct: boolean, wordId?: string): Progress {
  const quizStats = {
    correct: p.quizStats.correct + (correct ? 1 : 0),
    total: p.quizStats.total + 1,
  }
  if (!wordId) return { ...p, quizStats }
  if (correct) {
    if (!p.srs[wordId]) return { ...p, quizStats }
    return { ...p, quizStats, srs: { ...p.srs, [wordId]: schedule(p.srs[wordId], true) } }
  }
  return {
    ...p,
    quizStats,
    wordStatus: { ...p.wordStatus, [wordId]: 'learning' },
    srs: { ...p.srs, [wordId]: schedule(p.srs[wordId], false) },
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(loadProgress)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const setWordStatus = useCallback((wordId: string, status: WordStatus) => {
    setProgress((p) => ({
      ...p,
      wordStatus: { ...p.wordStatus, [wordId]: status },
    }))
  }, [])

  // A flashcard review: updates the spaced-repetition schedule and the status
  // badge together. "Remembered" keeps the existing "known" badge behaviour.
  const reviewWord = useCallback((wordId: string, remembered: boolean) => {
    setProgress((p) => ({
      ...p,
      wordStatus: { ...p.wordStatus, [wordId]: remembered ? 'known' : 'learning' },
      srs: { ...p.srs, [wordId]: schedule(p.srs[wordId], remembered) },
    }))
  }, [])

  const recordQuizAnswer = useCallback((correct: boolean, wordId?: string) => {
    setProgress((p) => applyQuizAnswer(p, correct, wordId))
  }, [])

  const recordGrammarAnswer = useCallback((correct: boolean) => {
    setProgress((p) => ({
      ...p,
      grammarStats: {
        correct: p.grammarStats.correct + (correct ? 1 : 0),
        total: p.grammarStats.total + 1,
      },
    }))
  }, [])

  const markSentenceSolved = useCallback((sentenceId: string) => {
    setProgress((p) =>
      p.sentencesSolved.includes(sentenceId)
        ? p
        : { ...p, sentencesSolved: [...p.sentencesSolved, sentenceId] }
    )
  }, [])

  const saveWord = useCallback((word: Word) => {
    setProgress((p) =>
      p.savedWords.some((w) => w.indonesian.toLowerCase() === word.indonesian.toLowerCase())
        ? p
        : { ...p, savedWords: [...p.savedWords, word] }
    )
  }, [])

  const removeSavedWord = useCallback((wordId: string) => {
    setProgress((p) => {
      const wordStatus = { ...p.wordStatus }
      delete wordStatus[wordId]
      const srs = { ...p.srs }
      delete srs[wordId]
      return {
        ...p,
        wordStatus,
        srs,
        savedWords: p.savedWords.filter((w) => w.id !== wordId),
      }
    })
  }, [])

  const markUnitPassed = useCallback((categoryId: CategoryId) => {
    setProgress((p) =>
      p.unitsPassed.includes(categoryId)
        ? p
        : { ...p, unitsPassed: [...p.unitsPassed, categoryId] }
    )
  }, [])

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS)
  }, [])

  return {
    progress,
    setWordStatus,
    reviewWord,
    recordQuizAnswer,
    recordGrammarAnswer,
    markSentenceSolved,
    saveWord,
    removeSavedWord,
    markUnitPassed,
    resetProgress,
  }
}
