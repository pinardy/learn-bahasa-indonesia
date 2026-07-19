import { useCallback, useEffect, useState } from 'react'
import type { CategoryId, Progress, Word, WordStatus } from '../types'
import { schedule } from '../srs'
import { DEFAULT_PROGRESS, normalizeProgress } from '../services/progressIO'

const STORAGE_KEY = 'bahasa-learner-progress'

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PROGRESS
    return normalizeProgress(JSON.parse(raw))
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

  // Replace all progress wholesale (used by the import-from-file flow). The
  // caller is expected to pass an already-normalized Progress.
  const replaceProgress = useCallback((next: Progress) => {
    setProgress(next)
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
    replaceProgress,
  }
}
