import { useCallback, useEffect, useRef, useState } from 'react'
import type { Word } from '../types'
import { WORDS } from '../data/vocabulary'
import { levenshtein, sample, shuffle } from '../utils'
import { SpeakButton } from './SpeakButton'

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

type QuizMode = 'choice' | 'typed'

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

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Edit distance allowed before a typed answer counts as wrong */
function typoTolerance(answer: string): number {
  return answer.length >= 5 ? 1 : 0
}

export function Quiz({ savedWords, onAnswer }: QuizProps) {
  const [mode, setMode] = useState<QuizMode>('choice')
  const [questions, setQuestions] = useState<Question[]>(() =>
    makeQuiz([...WORDS, ...savedWords])
  )
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const question = questions[current]
  // typed mode always tests recall: English prompt → type the Indonesian
  const typedAnswer = question?.word.indonesian ?? ''

  useEffect(() => {
    if (mode === 'typed' && !finished && selected === null) inputRef.current?.focus()
  }, [mode, current, finished, selected])

  const restart = useCallback(() => {
    setQuestions(makeQuiz([...WORDS, ...savedWords]))
    setCurrent(0)
    setSelected(null)
    setTyped('')
    setScore(0)
    setFinished(false)
  }, [savedWords])

  const switchMode = (m: QuizMode) => {
    if (m === mode) return
    setMode(m)
    restart()
  }

  const gradeTyped = (attempt: string) =>
    levenshtein(normalize(attempt), normalize(typedAnswer)) <= typoTolerance(typedAnswer)

  const choose = (option: string) => {
    if (selected !== null) return
    setSelected(option)
    const correct = mode === 'choice' ? option === question.answer : gradeTyped(option)
    if (correct) setScore((s) => s + 1)
    onAnswer(correct)
  }

  const next = () => {
    if (current + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrent(current + 1)
      setSelected(null)
      setTyped('')
    }
  }

  const modePills = (
    <div className="category-pills">
      <button
        className={`pill ${mode === 'choice' ? 'pill-active' : ''}`}
        onClick={() => switchMode('choice')}
      >
        🔘 Multiple choice
      </button>
      <button
        className={`pill ${mode === 'typed' ? 'pill-active' : ''}`}
        onClick={() => switchMode('typed')}
      >
        ⌨️ Type the answer
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
                : 'Keep going — review the flashcards and try again!'}
          </p>
          <button className="btn btn-primary" onClick={restart}>
            Try another quiz
          </button>
        </div>
      </div>
    )
  }

  const answered = selected !== null
  const isCorrect = answered
    ? mode === 'choice'
      ? selected === question.answer
      : gradeTyped(selected)
    : false
  const isTypo =
    answered && mode === 'typed' && isCorrect && normalize(selected) !== normalize(typedAnswer)

  const prompt =
    mode === 'typed' || question.direction === 'en-id'
      ? question.word.english
      : question.word.indonesian
  const promptLang = mode === 'typed' || question.direction === 'en-id' ? 'English' : 'Bahasa Indonesia'
  const targetLang = promptLang === 'English' ? 'Bahasa Indonesia' : 'English'
  const correctAnswer = mode === 'typed' ? typedAnswer : question.answer

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
          {promptLang} → {targetLang}
        </span>
        <h2>{prompt}</h2>
      </div>

      {mode === 'choice' ? (
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
      ) : (
        <form
          className="typed-form"
          onSubmit={(e) => {
            e.preventDefault()
            choose(typed)
          }}
        >
          <input
            ref={inputRef}
            className={`typed-input ${
              answered ? (isCorrect ? 'typed-input-correct' : 'typed-input-wrong') : ''
            }`}
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Type the Indonesian…"
            disabled={answered}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
          />
          {!answered && (
            <button className="btn btn-primary" type="submit">
              Check
            </button>
          )}
        </form>
      )}

      {answered && (
        <div className={`answer-bar ${isCorrect ? 'answer-bar-correct' : 'answer-bar-wrong'}`}>
          <div className="answer-bar-inner">
            <div className="answer-bar-text">
              {isCorrect ? (
                <strong className="text-success">
                  {isTypo ? `Benar! Close enough — it's spelled “${correctAnswer}”` : 'Benar! (Correct!)'}
                  <SpeakButton text={question.word.indonesian} size="sm" />
                </strong>
              ) : (
                <strong className="text-error">
                  Salah — the answer is “{correctAnswer}”
                  <SpeakButton text={question.word.indonesian} size="sm" />
                </strong>
              )}
              {question.word.example && (
                <p>
                  <em>{question.word.example}</em> — {question.word.exampleTranslation}
                </p>
              )}
            </div>
            <button className="btn btn-primary" onClick={next} autoFocus={mode === 'typed'}>
              {current + 1 >= questions.length ? 'See results' : 'Next →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
