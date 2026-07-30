import { useMemo } from 'react'
import { AFFIX_EXERCISES } from '../data/affixes'
import { shuffle } from '../utils'
import { AnswerBar, ChoiceOptions, QuizProgress, QuizResult } from './QuizUI'
import { useQuizRound } from '../hooks/useQuizRound'
import { SpeakButton } from './SpeakButton'

interface AffixTrainerProps {
  onAnswer: (correct: boolean, topic: string) => void
}

/** Drill the affix system: pick the correctly affixed form of a root word. */
export function AffixTrainer({ onAnswer }: AffixTrainerProps) {
  const round = useQuizRound({
    makeItems: () => shuffle(AFFIX_EXERCISES),
    isCorrect: (ex, choice) => choice === ex.answer,
    onAnswer: (_ex, _choice, correct) => onAnswer(correct, 'Affixes'),
  })
  const { item: exercise, selected, answered, isLast } = round
  const options = useMemo(() => shuffle([exercise.answer, ...exercise.distractors]), [exercise])

  if (round.finished) {
    return (
      <QuizResult
        score={round.score}
        total={round.total}
        onRestart={() => round.restart()}
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

  const isCorrect = selected === exercise.answer
  const [before, after] = exercise.sentence.split('___')

  return (
    <div className={`quiz grammar ${answered ? 'quiz-answered' : ''}`}>
      <QuizProgress current={round.current} total={round.total} />

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
        onChoose={round.choose}
      />

      {answered && (
        <AnswerBar correct={isCorrect} isLast={isLast} onNext={round.next}>
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
