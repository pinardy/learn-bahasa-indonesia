import { useCallback, useEffect, useRef, useState } from 'react'
import type { Word } from '../types'
import { WORDS } from '../data/vocabulary'
import { levenshtein, sample, shuffle } from '../utils'
import { SpeakButton } from './SpeakButton'
import { speak } from '../services/speech'
import { useEnterKey } from '../hooks/useEnterKey'
import { AnswerBar, ChoiceOptions, QuizProgress, QuizResult } from './QuizUI'

interface QuizProps {
  savedWords: Word[]
  onAnswer: (correct: boolean, wordId: string) => void
}

interface Question {
  word: Word
  direction: 'id-en' | 'en-id'
  options: string[]
  answer: string
}

type QuizMode = 'choice' | 'typed' | 'listen'

const QUIZ_LENGTH = 10

function makeQuestion(
  word: Word,
  pool: Word[],
  forcedDirection?: Question['direction']
): Question {
  const direction: Question['direction'] =
    forcedDirection ?? (Math.random() < 0.5 ? 'id-en' : 'en-id')
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

function makeQuiz(pool: Word[], forcedDirection?: Question['direction']): Question[] {
  return sample(pool, QUIZ_LENGTH).map((word) => makeQuestion(word, pool, forcedDirection))
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

  // in listening mode, play the Indonesian word when a new question appears
  useEffect(() => {
    if (mode === 'listen' && !finished && question) speak(question.word.indonesian)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, current, finished])

  const restart = useCallback(
    (m: QuizMode) => {
      setQuestions(makeQuiz([...WORDS, ...savedWords], m === 'listen' ? 'id-en' : undefined))
      setCurrent(0)
      setSelected(null)
      setTyped('')
      setScore(0)
      setFinished(false)
    },
    [savedWords]
  )

  const switchMode = (m: QuizMode) => {
    if (m === mode) return
    setMode(m)
    restart(m)
  }

  const gradeTyped = (attempt: string) =>
    levenshtein(normalize(attempt), normalize(typedAnswer)) <= typoTolerance(typedAnswer)

  const choose = (option: string) => {
    if (selected !== null) return
    setSelected(option)
    const correct = mode === 'typed' ? gradeTyped(option) : option === question.answer
    if (correct) setScore((s) => s + 1)
    onAnswer(correct, question.word.id)
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

  // press Enter to advance once a question is answered
  useEnterKey(selected !== null && !finished, next)

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
      <button
        className={`pill ${mode === 'listen' ? 'pill-active' : ''}`}
        onClick={() => switchMode('listen')}
      >
        🎧 Listening
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
          buttonLabel="Try another quiz"
          messages={[
            'Luar biasa! (Amazing!)',
            'Bagus! Keep practicing!',
            'Keep going — review the flashcards and try again!',
          ]}
        />
      </div>
    )
  }

  const answered = selected !== null
  const isCorrect = answered
    ? mode === 'typed'
      ? gradeTyped(selected)
      : selected === question.answer
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

      <QuizProgress current={current} total={questions.length} />

      <div className="quiz-question">
        {mode === 'listen' ? (
          <>
            <span className="quiz-direction">Listen and choose the meaning</span>
            <button
              type="button"
              className="listen-replay"
              onClick={() => speak(question.word.indonesian)}
              aria-label="Play the word again"
            >
              🔊
            </button>
          </>
        ) : (
          <>
            <span className="quiz-direction">
              {promptLang} → {targetLang}
            </span>
            <h2>{prompt}</h2>
          </>
        )}
      </div>

      {mode !== 'typed' ? (
        <ChoiceOptions
          options={question.options}
          answer={question.answer}
          selected={selected}
          onChoose={choose}
        />
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
        <AnswerBar correct={isCorrect} isLast={current + 1 >= questions.length} onNext={next}>
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
          {mode === 'listen' && (
            <p>
              You heard: <strong>{question.word.indonesian}</strong>
            </p>
          )}
          {question.word.example && (
            <p>
              <em>{question.word.example}</em> — {question.word.exampleTranslation}
            </p>
          )}
        </AnswerBar>
      )}
    </div>
  )
}
