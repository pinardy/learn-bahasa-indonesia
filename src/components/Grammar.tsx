import { useCallback, useMemo, useState } from 'react'
import { GRAMMAR_EXERCISES } from '../data/grammar'
import { shuffle } from '../utils'
import { useEnterKey } from '../hooks/useEnterKey'

interface GrammarProps {
  onAnswer: (correct: boolean) => void
}

export function Grammar({ onAnswer }: GrammarProps) {
  const [exercises, setExercises] = useState(() => shuffle(GRAMMAR_EXERCISES))
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const exercise = exercises[current]
  const options = useMemo(
    () => shuffle([exercise.answer, ...exercise.distractors]),
    [exercise]
  )

  const choose = (option: string) => {
    if (selected !== null) return
    setSelected(option)
    const correct = option === exercise.answer
    if (correct) setScore((s) => s + 1)
    onAnswer(correct)
  }

  const next = () => {
    if (current + 1 >= exercises.length) {
      setFinished(true)
    } else {
      setCurrent(current + 1)
      setSelected(null)
    }
  }

  const restart = useCallback(() => {
    setExercises(shuffle(GRAMMAR_EXERCISES))
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }, [])

  // press Enter to advance once an exercise is answered
  useEnterKey(selected !== null && !finished, next)

  if (finished) {
    const pct = Math.round((score / exercises.length) * 100)
    return (
      <div className="quiz-result">
        <span className="quiz-result-emoji">{pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📚'}</span>
        <h2>
          {score} / {exercises.length}
        </h2>
        <p>
          {pct >= 80
            ? 'Hebat! Your grammar is getting strong!'
            : pct >= 50
              ? 'Bagus! Review the explanations and go again.'
              : 'Grammar takes repetition — another round will help it stick!'}
        </p>
        <button className="btn btn-primary" onClick={restart}>
          Practice again
        </button>
      </div>
    )
  }

  const answered = selected !== null
  const isCorrect = selected === exercise.answer
  const [before, after] = exercise.sentence.split('___')

  return (
    <div className={`quiz grammar ${answered ? 'quiz-answered' : ''}`}>
      <div className="quiz-progress">
        <div className="quiz-progress-track">
          <div
            className="quiz-progress-fill"
            style={{ width: `${(current / exercises.length) * 100}%` }}
          />
        </div>
        <span>
          {current + 1} / {exercises.length}
        </span>
      </div>

      <div className="quiz-question">
        <span className="topic-badge">{exercise.topic}</span>
        <p className="grammar-translation">“{exercise.translation}”</p>
        <h2 className="grammar-sentence">
          {before}
          <span className={`blank ${answered ? 'blank-filled' : ''}`}>
            {answered ? exercise.answer : '____'}
          </span>
          {after}
        </h2>
      </div>

      <div className="quiz-options">
        {options.map((option) => {
          let cls = 'quiz-option'
          if (answered) {
            if (option === exercise.answer) cls += ' quiz-option-correct'
            else if (option === selected) cls += ' quiz-option-wrong'
            else cls += ' quiz-option-dim'
          }
          return (
            <button key={option} className={cls} onClick={() => choose(option)}>
              {option}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className={`answer-bar ${isCorrect ? 'answer-bar-correct' : 'answer-bar-wrong'}`}>
          <div className="answer-bar-inner">
            <div className="answer-bar-text">
              {isCorrect ? (
                <strong className="text-success">Benar! (Correct!)</strong>
              ) : (
                <strong className="text-error">Salah — the answer is “{exercise.answer}”</strong>
              )}
              <p>{exercise.explanation}</p>
            </div>
            <button className="btn btn-primary" onClick={next}>
              {current + 1 >= exercises.length ? 'See results' : 'Next →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
