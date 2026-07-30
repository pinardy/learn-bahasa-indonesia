import { useState } from 'react'
import { useEnterKey } from './useEnterKey'

interface QuizRoundConfig<T> {
  /** Build a fresh round of items (called on mount and on restart). */
  makeItems: () => T[]
  /** Whether the chosen option is correct for the given item. */
  isCorrect: (item: T, choice: string) => boolean
  /** Optional side effect per answer (e.g. record accuracy stats). */
  onAnswer?: (item: T, choice: string, correct: boolean) => void
}

/**
 * The shared state machine behind every single-choice drill (quiz, grammar,
 * affixes, phrases, numbers, checkpoints): current item, selection, running
 * score, and finished flag, with choose/next/restart and Enter-to-advance.
 *
 * Components own only what's unique to them — the item shape, how options are
 * rendered, and the result screen. Extra per-question state (e.g. a typed
 * input) can be reset by watching the returned `current`.
 */
export function useQuizRound<T>({ makeItems, isCorrect, onAnswer }: QuizRoundConfig<T>) {
  const [items, setItems] = useState<T[]>(makeItems)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const item = items[current]
  const answered = selected !== null
  const isLast = current + 1 >= items.length

  const choose = (choice: string) => {
    if (selected !== null) return
    setSelected(choice)
    const correct = isCorrect(item, choice)
    if (correct) setScore((s) => s + 1)
    onAnswer?.(item, choice, correct)
  }

  const next = () => {
    if (isLast) setFinished(true)
    else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  /** Start a new round — with fresh items from makeItems(), or explicit ones. */
  const restart = (nextItems?: T[]) => {
    setItems(nextItems ?? makeItems())
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  useEnterKey(answered && !finished, next)

  return {
    items,
    item,
    current,
    total: items.length,
    selected,
    answered,
    isLast,
    score,
    finished,
    choose,
    next,
    restart,
  }
}
