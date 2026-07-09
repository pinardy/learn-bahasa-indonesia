import { useCallback, useEffect, useState } from 'react'
import type { Progress, WordStatus } from '../types'

const STORAGE_KEY = 'bahasa-learner-progress'

const DEFAULT_PROGRESS: Progress = {
  wordStatus: {},
  quizStats: { correct: 0, total: 0 },
  sentencesSolved: [],
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PROGRESS
    const parsed = JSON.parse(raw) as Partial<Progress>
    return {
      wordStatus: parsed.wordStatus ?? {},
      quizStats: parsed.quizStats ?? { correct: 0, total: 0 },
      sentencesSolved: parsed.sentencesSolved ?? [],
    }
  } catch {
    return DEFAULT_PROGRESS
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

  const recordQuizAnswer = useCallback((correct: boolean) => {
    setProgress((p) => ({
      ...p,
      quizStats: {
        correct: p.quizStats.correct + (correct ? 1 : 0),
        total: p.quizStats.total + 1,
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

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS)
  }, [])

  return { progress, setWordStatus, recordQuizAnswer, markSentenceSolved, resetProgress }
}
