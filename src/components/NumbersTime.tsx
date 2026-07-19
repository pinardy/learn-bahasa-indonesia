import { useCallback, useState } from 'react'
import { makeNumberQuestion, makeTimeQuestion, type TrainerQuestion } from '../numbers'
import { SpeakButton } from './SpeakButton'
import { useEnterKey } from '../hooks/useEnterKey'
import { AnswerBar, ChoiceOptions, QuizProgress, QuizResult } from './QuizUI'

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
    return (
      <div className="quiz">
        {modePills}
        <QuizResult
          score={score}
          total={questions.length}
          onRestart={() => restart(mode)}
          buttonLabel="Practice again"
          messages={[
            'Luar biasa! (Amazing!)',
            'Bagus! Keep practicing!',
            'Keep going — numbers take repetition!',
          ]}
        />
      </div>
    )
  }

  const answered = selected !== null

  return (
    <div className={`quiz ${answered ? 'quiz-answered' : ''}`}>
      {modePills}

      <QuizProgress current={current} total={questions.length} />

      <div className="quiz-question">
        <span className="quiz-direction">
          {mode === 'numbers' ? 'What is this number in Indonesian?' : 'How do you say this time?'}
        </span>
        <h2 className="trainer-prompt">{question.prompt}</h2>
      </div>

      <ChoiceOptions
        options={question.options}
        answer={question.answer}
        selected={selected}
        onChoose={choose}
      />

      {answered && (
        <AnswerBar
          correct={selected === question.answer}
          isLast={current + 1 >= questions.length}
          onNext={next}
        >
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
        </AnswerBar>
      )}
    </div>
  )
}
