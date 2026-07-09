import { useCallback, useState } from 'react'
import type { Word } from '../types'
import { WORDS } from '../data/vocabulary'
import { sample, shuffle } from '../utils'

interface QuizProps {
  savedWords: Word[]
  onAnswer: (correct: boolean) => void
}

interface Question {
  word: Word
  direction: 'id-en' | 'en-id'
  options: string[]
  answer: string
}

const QUIZ_LENGTH = 10

function makeQuestion(word: Word, pool: Word[]): Question {
  const direction: Question['direction'] = Math.random() < 0.5 ? 'id-en' : 'en-id'
  const answer = direction === 'id-en' ? word.english : word.indonesian
  // Set dedupes distractors that share text with the answer or each other
  const options = new Set<string>([answer])
  for (const w of shuffle(pool)) {
    if (options.size >= 4) break
    if (w.id === word.id) continue
    options.add(direction === 'id-en' ? w.english : w.indonesian)
  }
  return { word, direction, options: shuffle([...options]), answer }
}

function makeQuiz(pool: Word[]): Question[] {
  return sample(pool, QUIZ_LENGTH).map((word) => makeQuestion(word, pool))
}

export function Quiz({ savedWords, onAnswer }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>(() =>
    makeQuiz([...WORDS, ...savedWords])
  )
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = questions[current]

  const choose = (option: string) => {
    if (selected !== null) return
    setSelected(option)
    const correct = option === question.answer
    if (correct) setScore((s) => s + 1)
    onAnswer(correct)
  }

  const next = () => {
    if (current + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrent(current + 1)
      setSelected(null)
    }
  }

  const restart = useCallback(() => {
    setQuestions(makeQuiz([...WORDS, ...savedWords]))
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }, [savedWords])

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    return (
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
              : 'Keep going — review the flashcards and try again!'}
        </p>
        <button className="btn btn-primary" onClick={restart}>
          Try another quiz
        </button>
      </div>
    )
  }

  const prompt = question.direction === 'id-en' ? question.word.indonesian : question.word.english
  const promptLang = question.direction === 'id-en' ? 'Bahasa Indonesia' : 'English'
  const targetLang = question.direction === 'id-en' ? 'English' : 'Bahasa Indonesia'

  return (
    <div className={`quiz ${selected !== null ? 'quiz-answered' : ''}`}>
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
          {promptLang} → {targetLang}
        </span>
        <h2>{prompt}</h2>
      </div>

      <div className="quiz-options">
        {question.options.map((option) => {
          let cls = 'quiz-option'
          if (selected !== null) {
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

      {selected !== null && (
        <div
          className={`answer-bar ${
            selected === question.answer ? 'answer-bar-correct' : 'answer-bar-wrong'
          }`}
        >
          <div className="answer-bar-inner">
            <div className="answer-bar-text">
              {selected === question.answer ? (
                <strong className="text-success">Benar! (Correct!)</strong>
              ) : (
                <strong className="text-error">
                  Salah — the answer is “{question.answer}”
                </strong>
              )}
              {question.word.example && (
                <p>
                  <em>{question.word.example}</em> — {question.word.exampleTranslation}
                </p>
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
