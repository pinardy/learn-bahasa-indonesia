import { useCallback, useMemo, useState } from 'react'
import { GRAMMAR_EXERCISES } from '../data/grammar'
import { shuffle } from '../utils'
import { useEnterKey } from '../hooks/useEnterKey'
import { AnswerBar, ChoiceOptions, QuizProgress, QuizResult } from './QuizUI'

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
    return (
      <QuizResult
        score={score}
        total={exercises.length}
        onRestart={restart}
        buttonLabel="Practice again"
        topEmoji="🏆"
        messages={[
          'Hebat! Your grammar is getting strong!',
          'Bagus! Review the explanations and go again.',
          'Grammar takes repetition — another round will help it stick!',
        ]}
      />
    )
  }

  const answered = selected !== null
  const isCorrect = selected === exercise.answer
  const [before, after] = exercise.sentence.split('___')

  return (
    <div className={`quiz grammar ${answered ? 'quiz-answered' : ''}`}>
      <QuizProgress current={current} total={exercises.length} />

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

      <ChoiceOptions
        options={options}
        answer={exercise.answer}
        selected={selected}
        onChoose={choose}
      />

      {answered && (
        <AnswerBar
          correct={isCorrect}
          isLast={current + 1 >= exercises.length}
          onNext={next}
        >
          {isCorrect ? (
            <strong className="text-success">Benar! (Correct!)</strong>
          ) : (
            <strong className="text-error">Salah — the answer is “{exercise.answer}”</strong>
          )}
          <p>{exercise.explanation}</p>
        </AnswerBar>
      )}
    </div>
  )
}
