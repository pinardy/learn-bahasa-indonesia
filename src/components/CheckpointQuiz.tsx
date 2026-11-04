import type { CategoryId, Word } from '../types'
import { CATEGORIES, WORDS } from '../data/vocabulary'
import { buildOptions, sample, shuffle } from '../utils'
import { AnswerBar, ChoiceOptions, QuizProgress } from './QuizUI'
import { useQuizRound } from '../hooks/useQuizRound'
import { SpeakButton } from './SpeakButton'

const QUIZ_LENGTH = 8
const PASS_RATIO = 0.8

interface Question {
  prompt: string
  indonesian: string
  answer: string
  options: string[]
}

function makeQuestions(categoryId: CategoryId): Question[] {
  const catWords = WORDS.filter((w) => w.category === categoryId)
  return sample(catWords, Math.min(QUIZ_LENGTH, catWords.length)).map((word) => {
    const direction = Math.random() < 0.5 ? 'id-en' : 'en-id'
    const text = (w: Word) => (direction === 'id-en' ? w.english : w.indonesian)
    const answer = text(word)
    // same-category distractors first, so the checkpoint really tests the unit
    const candidates = [...shuffle(catWords), ...shuffle(WORDS)]
      .filter((w) => w.id !== word.id)
      .map(text)
    return {
      prompt: direction === 'id-en' ? word.indonesian : word.english,
      indonesian: word.indonesian,
      answer,
      options: buildOptions(answer, candidates),
    }
  })
}

interface CheckpointQuizProps {
  categoryId: CategoryId
  onPass: () => void
  onClose: () => void
}

/** The short quiz that completes a learning-path unit (pass at 80%). */
export function CheckpointQuiz({ categoryId, onPass, onClose }: CheckpointQuizProps) {
  const category = CATEGORIES.find((c) => c.id === categoryId)
  const round = useQuizRound<Question>({
    makeItems: () => makeQuestions(categoryId),
    isCorrect: (q, choice) => choice === q.answer,
  })
  const { item: question, selected, answered, isLast, total } = round
  const needed = Math.ceil(total * PASS_RATIO)

  if (!category || total === 0) return null

  if (round.finished) {
    const passed = round.score >= needed
    return (
      <div className="quiz">
        <div className="quiz-result">
          <span className="quiz-result-emoji">{passed ? '🏅' : '📚'}</span>
          <h2>
            {round.score} / {total}
          </h2>
          <p>
            {passed
              ? `Unit complete — ${category.name} checkpoint passed!`
              : `You need ${needed}/${total} to pass. Review the flashcards and try again!`}
          </p>
          {passed ? (
            <button className="btn btn-success" onClick={onPass}>
              Continue →
            </button>
          ) : (
            <div className="flashcard-actions">
              <button className="btn btn-ghost" onClick={onClose}>
                ← Back
              </button>
              <button className="btn btn-primary" onClick={() => round.restart()}>
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`quiz ${answered ? 'quiz-answered' : ''}`}>
      <div className="checkpoint-header">
        <button className="btn btn-ghost btn-small" onClick={onClose}>
          ← Back
        </button>
        <span className="checkpoint-title">
          ✍️ Checkpoint: {category.emoji} {category.name} — pass with {needed}/{total}
        </span>
      </div>

      <QuizProgress current={round.current} total={total} />

      <div className="quiz-question">
        <h2>{question.prompt}</h2>
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
              <SpeakButton text={question.indonesian} size="sm" />
            </strong>
          ) : (
            <strong className="text-error">
              Salah — the answer is “{question.answer}”
              <SpeakButton text={question.indonesian} size="sm" />
            </strong>
          )}
        </AnswerBar>
      )}
    </div>
  )
}
