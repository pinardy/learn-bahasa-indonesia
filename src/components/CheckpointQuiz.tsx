import { useState } from 'react'
import type { CategoryId } from '../types'
import { CATEGORIES, WORDS } from '../data/vocabulary'
import { sample, shuffle } from '../utils'
import { AnswerBar, ChoiceOptions, QuizProgress } from './QuizUI'
import { useEnterKey } from '../hooks/useEnterKey'
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
    const answer = direction === 'id-en' ? word.english : word.indonesian
    // same-category distractors first, so the checkpoint really tests the unit
    const options = new Set<string>([answer])
    for (const w of [...shuffle(catWords), ...shuffle(WORDS)]) {
      if (options.size >= 4) break
      if (w.id === word.id) continue
      options.add(direction === 'id-en' ? w.english : w.indonesian)
    }
    return {
      prompt: direction === 'id-en' ? word.indonesian : word.english,
      indonesian: word.indonesian,
      answer,
      options: shuffle([...options]),
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
  const [questions, setQuestions] = useState<Question[]>(() => makeQuestions(categoryId))
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const needed = Math.ceil(questions.length * PASS_RATIO)
  const question = questions[current]

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

  const retry = () => {
    setQuestions(makeQuestions(categoryId))
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  useEnterKey(selected !== null && !finished, next)

  if (!category || questions.length === 0) return null

  if (finished) {
    const passed = score >= needed
    return (
      <div className="quiz">
        <div className="quiz-result">
          <span className="quiz-result-emoji">{passed ? '🏅' : '📚'}</span>
          <h2>
            {score} / {questions.length}
          </h2>
          <p>
            {passed
              ? `Unit complete — ${category.name} checkpoint passed!`
              : `You need ${needed}/${questions.length} to pass. Review the flashcards and try again!`}
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
              <button className="btn btn-primary" onClick={retry}>
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`quiz ${selected !== null ? 'quiz-answered' : ''}`}>
      <div className="checkpoint-header">
        <button className="btn btn-ghost btn-small" onClick={onClose}>
          ← Back
        </button>
        <span className="checkpoint-title">
          ✍️ Checkpoint: {category.emoji} {category.name} — pass with {needed}/{questions.length}
        </span>
      </div>

      <QuizProgress current={current} total={questions.length} />

      <div className="quiz-question">
        <h2>{question.prompt}</h2>
      </div>

      <ChoiceOptions
        options={question.options}
        answer={question.answer}
        selected={selected}
        onChoose={choose}
      />

      {selected !== null && (
        <AnswerBar
          correct={selected === question.answer}
          isLast={current + 1 >= questions.length}
          onNext={next}
        >
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
