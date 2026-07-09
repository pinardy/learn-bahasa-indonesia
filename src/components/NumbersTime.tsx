import { useCallback, useState } from 'react'
import { makeNumberQuestion, makeTimeQuestion, type TrainerQuestion } from '../numbers'
import { SpeakButton } from './SpeakButton'
import { useEnterKey } from '../hooks/useEnterKey'

type TrainerMode = 'numbers' | 'time'

const ROUND_LENGTH = 10

function makeRound(mode: TrainerMode): TrainerQuestion[] {
  const make = mode === 'numbers' ? makeNumberQuestion : makeTimeQuestion
  return Array.from({ length: ROUND_LENGTH }, make)
}

export function NumbersTime() {
  const [mode, setMode] = useState<TrainerMode>('numbers')
  const [questions, setQuestions] = useState<TrainerQuestion[]>(() => makeRound('numbers'))
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = questions[current]

  const restart = useCallback((m: TrainerMode) => {
    setQuestions(makeRound(m))
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }, [])

  const switchMode = (m: TrainerMode) => {
    if (m === mode) return
    setMode(m)
    restart(m)
  }

  const choose = (option: string) => {
    if (selected !== null) return
    setSelected(option)
    if (option === question.answer) setScore((s) => s + 1)
  }

  const next = () => {
    if (current + 1 >= questions.length) setFinished(true)
    else {
      setCurrent(current + 1)
      setSelected(null)
    }
  }

  // press Enter to advance once a question is answered
  useEnterKey(selected !== null && !finished, next)

  const modePills = (
    <div className="category-pills">
      <button
        className={`pill ${mode === 'numbers' ? 'pill-active' : ''}`}
        onClick={() => switchMode('numbers')}
      >
        🔢 Numbers
      </button>
      <button
        className={`pill ${mode === 'time' ? 'pill-active' : ''}`}
        onClick={() => switchMode('time')}
      >
        🕐 Time
      </button>
    </div>
  )

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="quiz">
        {modePills}
        <div className="quiz-result">
          <span className="quiz-result-emoji">{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}</span>
          <h2>
            {score} / {questions.length}
          </h2>
          <p>
            {pct >= 80
              ? 'Luar biasa! (Amazing!)'
              : pct >= 50
                ? 'Bagus! Keep practicing!'
                : 'Keep going — numbers take repetition!'}
          </p>
          <button className="btn btn-primary" onClick={() => restart(mode)}>
            Practice again
          </button>
        </div>
      </div>
    )
  }

  const answered = selected !== null

  return (
    <div className={`quiz ${answered ? 'quiz-answered' : ''}`}>
      {modePills}

      <div className="quiz-progress">
        <div className="quiz-progress-track">
          <div
            className="quiz-progress-fill"
            style={{ width: `${(current / questions.length) * 100}%` }}
          />
        </div>
        <span>
          {current + 1} / {questions.length}
        </span>
      </div>

      <div className="quiz-question">
        <span className="quiz-direction">
          {mode === 'numbers' ? 'What is this number in Indonesian?' : 'How do you say this time?'}
        </span>
        <h2 className="trainer-prompt">{question.prompt}</h2>
      </div>

      <div className="quiz-options">
        {question.options.map((option) => {
          let cls = 'quiz-option'
          if (answered) {
            if (option === question.answer) cls += ' quiz-option-correct'
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
        <div
          className={`answer-bar ${
            selected === question.answer ? 'answer-bar-correct' : 'answer-bar-wrong'
          }`}
        >
          <div className="answer-bar-inner">
            <div className="answer-bar-text">
              {selected === question.answer ? (
                <strong className="text-success">
                  Benar! (Correct!)
                  <SpeakButton text={question.answer} size="sm" />
                </strong>
              ) : (
                <strong className="text-error">
                  Salah — the answer is “{question.answer}”
                  <SpeakButton text={question.answer} size="sm" />
                </strong>
              )}
            </div>
            <button className="btn btn-primary" onClick={next}>
              {current + 1 >= questions.length ? 'See results' : 'Next →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
