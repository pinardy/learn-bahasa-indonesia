import { useState } from 'react'
import { makeNumberQuestion, makeTimeQuestion, type TrainerQuestion } from '../numbers'
import { SpeakButton } from './SpeakButton'
import { useQuizRound } from '../hooks/useQuizRound'
import { AnswerBar, ChoiceOptions, QuizProgress, QuizResult } from './QuizUI'

type TrainerMode = 'numbers' | 'time'

const ROUND_LENGTH = 10

function makeRound(mode: TrainerMode): TrainerQuestion[] {
  const make = mode === 'numbers' ? makeNumberQuestion : makeTimeQuestion
  return Array.from({ length: ROUND_LENGTH }, make)
}

export function NumbersTime() {
  const [mode, setMode] = useState<TrainerMode>('numbers')
  const round = useQuizRound<TrainerQuestion>({
    makeItems: () => makeRound(mode),
    isCorrect: (q, choice) => choice === q.answer,
  })
  const { item: question, selected, answered, isLast } = round

  const switchMode = (m: TrainerMode) => {
    if (m === mode) return
    setMode(m)
    round.restart(makeRound(m))
  }

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

  if (round.finished) {
    return (
      <div className="quiz">
        {modePills}
        <QuizResult
          score={round.score}
          total={round.total}
          onRestart={() => round.restart()}
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

  return (
    <div className={`quiz ${answered ? 'quiz-answered' : ''}`}>
      {modePills}

      <QuizProgress current={round.current} total={round.total} />

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
        onChoose={round.choose}
      />

      {answered && (
        <AnswerBar correct={selected === question.answer} isLast={isLast} onNext={round.next}>
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
