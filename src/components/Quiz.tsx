import { useEffect, useMemo, useRef, useState } from 'react'
import type { CategoryId, SrsCard, Word } from '../types'
import { CATEGORIES, SAVED_CATEGORY, WORDS } from '../data/vocabulary'
import { buildOptions, levenshtein, sample, shuffle } from '../utils'
import { dueWords } from '../srs'
import { SpeakButton } from './SpeakButton'
import { speak } from '../services/speech'
import { useQuizRound } from '../hooks/useQuizRound'
import { AnswerBar, ChoiceOptions, QuizProgress, QuizResult } from './QuizUI'

interface QuizProps {
  savedWords: Word[]
  srs: Record<string, SrsCard>
  onAnswer: (correct: boolean, wordId: string) => void
}

interface Question {
  word: Word
  direction: 'id-en' | 'en-id'
  options: string[]
  answer: string
}

type QuizMode = 'choice' | 'typed' | 'listen'
// Which words the quiz draws its questions from.
type QuizPool = CategoryId | 'all' | 'review'

const QUIZ_LENGTH = 10

function makeQuestion(
  word: Word,
  distractorPool: Word[],
  forcedDirection?: Question['direction']
): Question {
  const direction: Question['direction'] =
    forcedDirection ?? (Math.random() < 0.5 ? 'id-en' : 'en-id')
  const text = (w: Word) => (direction === 'id-en' ? w.english : w.indonesian)
  const answer = text(word)
  const options = buildOptions(
    answer,
    shuffle(distractorPool)
      .filter((w) => w.id !== word.id)
      .map(text)
  )
  return { word, direction, options, answer }
}

/**
 * Build a quiz. Questions are sampled from `questionPool` (the focused
 * selection), but distractors always come from `distractorPool` (the full
 * word list) so a small pool — e.g. a handful of due words — still yields
 * four plausible options.
 */
function makeQuiz(
  questionPool: Word[],
  distractorPool: Word[],
  forcedDirection?: Question['direction']
): Question[] {
  return sample(questionPool, QUIZ_LENGTH).map((word) =>
    makeQuestion(word, distractorPool, forcedDirection)
  )
}

export function poolWords(
  pool: QuizPool,
  allWords: Word[],
  srs: Record<string, SrsCard>
): Word[] {
  if (pool === 'review') return dueWords(allWords, srs)
  if (pool === 'all') return allWords
  return allWords.filter((w) => w.category === pool)
}

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Edit distance allowed before a typed answer counts as wrong */
export function typoTolerance(answer: string): number {
  return answer.length >= 5 ? 1 : 0
}

/** Whether a typed attempt matches the expected answer within typo tolerance. */
export function gradeTypedAnswer(attempt: string, expected: string): boolean {
  return levenshtein(normalize(attempt), normalize(expected)) <= typoTolerance(expected)
}

export function Quiz({ savedWords, srs, onAnswer }: QuizProps) {
  const allWords = useMemo(() => [...WORDS, ...savedWords], [savedWords])
  const reviewCount = useMemo(() => dueWords(allWords, srs).length, [allWords, srs])
  const categories = savedWords.length > 0 ? [...CATEGORIES, SAVED_CATEGORY] : CATEGORIES

  const [mode, setMode] = useState<QuizMode>('choice')
  const [pool, setPool] = useState<QuizPool>('all')
  const [typed, setTyped] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const roundItems = (m: QuizMode, p: QuizPool) =>
    makeQuiz(poolWords(p, allWords, srs), allWords, m === 'listen' ? 'id-en' : undefined)

  const round = useQuizRound<Question>({
    makeItems: () => roundItems(mode, pool),
    isCorrect: (q, choice) =>
      mode === 'typed' ? gradeTypedAnswer(choice, q.word.indonesian) : choice === q.answer,
    onAnswer: (q, _choice, correct) => onAnswer(correct, q.word.id),
  })
  const { item: question, selected, isLast } = round
  // local alias (not round.answered) so TS narrows `selected` to string below
  const answered = selected !== null
  // typed mode always tests recall: English prompt → type the Indonesian
  const typedAnswer = question?.word.indonesian ?? ''

  // clear the typed input whenever the question changes (advance or restart)
  useEffect(() => setTyped(''), [round.current])

  useEffect(() => {
    if (mode === 'typed' && !round.finished && selected === null) inputRef.current?.focus()
  }, [mode, round.current, round.finished, selected])

  // in listening mode, play the Indonesian word when a new question appears
  useEffect(() => {
    if (mode === 'listen' && !round.finished && question) speak(question.word.indonesian)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, round.current, round.finished])

  const switchMode = (m: QuizMode) => {
    if (m === mode) return
    setMode(m)
    setTyped('')
    round.restart(roundItems(m, pool))
  }

  const selectPool = (p: QuizPool) => {
    if (p === pool) return
    setPool(p)
    setTyped('')
    round.restart(roundItems(mode, p))
  }

  const gradeTyped = (attempt: string) => gradeTypedAnswer(attempt, typedAnswer)

  const poolSelect = (
    <select
      className="filter-select"
      value={pool}
      onChange={(e) => selectPool(e.target.value as QuizPool)}
      aria-label="Choose which words to quiz"
    >
      {reviewCount > 0 && <option value="review">⏰ Due for review ({reviewCount})</option>}
      <option value="all">All words</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.emoji} {c.name}
        </option>
      ))}
    </select>
  )

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

  const controls = (
    <div className="quiz-controls">
      {poolSelect}
      {modePills}
    </div>
  )

  if (round.finished) {
    return (
      <div className="quiz">
        {controls}
        <QuizResult
          score={round.score}
          total={round.total}
          onRestart={() => round.restart()}
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
      {controls}

      <QuizProgress current={round.current} total={round.total} />

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
          onChoose={round.choose}
        />
      ) : (
        <form
          className="typed-form"
          onSubmit={(e) => {
            e.preventDefault()
            round.choose(typed)
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
        <AnswerBar correct={isCorrect} isLast={isLast} onNext={round.next}>
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
