import { useMemo, useState } from 'react'
import { AFFIX_EXERCISES } from '../data/affixes'
import { shuffle } from '../utils'
import { AnswerBar, ChoiceOptions, QuizProgress, QuizResult } from './QuizUI'
import { useEnterKey } from '../hooks/useEnterKey'
import { SpeakButton } from './SpeakButton'

interface AffixTrainerProps {
  onAnswer: (correct: boolean, topic: string) => void
}

/** Drill the affix system: pick the correctly affixed form of a root word. */
export function AffixTrainer({ onAnswer }: AffixTrainerProps) {
  const [exercises, setExercises] = useState(() => shuffle(AFFIX_EXERCISES))
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
    onAnswer(correct, 'Affixes')
  }

  const next = () => {
    if (current + 1 >= exercises.length) setFinished(true)
    else {
      setCurrent(current + 1)
      setSelected(null)
    }
  }

  const restart = () => {
    setExercises(shuffle(AFFIX_EXERCISES))
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  useEnterKey(selected !== null && !finished, next)

  if (finished) {
    return (
      <QuizResult
        score={score}
        total={exercises.length}
        onRestart={restart}
        buttonLabel="Practice again"
        topEmoji="🔧"
        messages={[
          'Hebat! The affix system is clicking!',
          'Bagus! Read the explanations and go again.',
          'Affixes take time — the Lessons tab has the patterns!',
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
        <span className="topic-badge">
          root: {exercise.root} ({exercise.rootMeaning})
        </span>
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
        <AnswerBar correct={isCorrect} isLast={current + 1 >= exercises.length} onNext={next}>
          {isCorrect ? (
            <strong className="text-success">
              Benar! (Correct!)
              <SpeakButton text={exercise.answer} size="sm" />
            </strong>
          ) : (
            <strong className="text-error">
              Salah — the answer is “{exercise.answer}”
              <SpeakButton text={exercise.answer} size="sm" />
            </strong>
          )}
          <p>{exercise.explanation}</p>
        </AnswerBar>
      )}
    </div>
  )
}
