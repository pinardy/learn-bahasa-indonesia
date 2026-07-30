import { useMemo, useState } from 'react'
import { GRAMMAR_EXERCISES } from '../data/grammar'
import { shuffle } from '../utils'
import { useQuizRound } from '../hooks/useQuizRound'
import { AnswerBar, ChoiceOptions, QuizProgress, QuizResult } from './QuizUI'
import { AffixTrainer } from './AffixTrainer'
import { GrammarLessons } from './GrammarLessons'

interface GrammarProps {
  onAnswer: (correct: boolean, topic: string) => void
  byTopic: Record<string, { correct: number; total: number }>
}

type GrammarMode = 'practice' | 'affixes' | 'lessons'

const MODES: { id: GrammarMode; label: string }[] = [
  { id: 'practice', label: '✏️ Practice' },
  { id: 'affixes', label: '🔧 Affixes' },
  { id: 'lessons', label: '📚 Lessons' },
]

export function Grammar({ onAnswer, byTopic }: GrammarProps) {
  const [mode, setMode] = useState<GrammarMode>('practice')

  return (
    <div className="grammar-tab">
      <div className="category-pills">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`pill ${mode === m.id ? 'pill-active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'practice' && <GrammarPractice onAnswer={onAnswer} />}
      {mode === 'affixes' && <AffixTrainer onAnswer={onAnswer} />}
      {mode === 'lessons' && <GrammarLessons byTopic={byTopic} />}
    </div>
  )
}

function GrammarPractice({ onAnswer }: Pick<GrammarProps, 'onAnswer'>) {
  const round = useQuizRound({
    makeItems: () => shuffle(GRAMMAR_EXERCISES),
    isCorrect: (ex, choice) => choice === ex.answer,
    onAnswer: (ex, _choice, correct) => onAnswer(correct, ex.topic),
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
        topEmoji="🏆"
        messages={[
          'Hebat! Your grammar is getting strong!',
          'Bagus! Review the explanations and go again.',
          'Grammar takes repetition — another round will help it stick!',
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
        onChoose={round.choose}
      />

      {answered && (
        <AnswerBar correct={isCorrect} isLast={isLast} onNext={round.next}>
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
