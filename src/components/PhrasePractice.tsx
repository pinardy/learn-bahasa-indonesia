import { useState } from 'react'
import { SCENARIOS, type Phrase } from '../data/phrases'
import { sample, shuffle } from '../utils'
import { AnswerBar, ChoiceOptions, QuizProgress, QuizResult } from './QuizUI'
import { useEnterKey } from '../hooks/useEnterKey'
import { SpeakButton } from './SpeakButton'

const ROUND_LENGTH = 10

interface Question {
  phrase: Phrase
  options: string[]
}

const ALL_PHRASES = SCENARIOS.flatMap((s) => s.phrases)

function makeRound(): Question[] {
  return sample(ALL_PHRASES, ROUND_LENGTH).map((phrase) => {
    const options = new Set<string>([phrase.english])
    for (const p of shuffle(ALL_PHRASES)) {
      if (options.size >= 4) break
      if (p.indonesian === phrase.indonesian) continue
      options.add(p.english)
    }
    return { phrase, options: shuffle([...options]) }
  })
}

/** Quiz over the phrasebook: read (or hear) the Indonesian, pick the meaning. */
export function PhrasePractice() {
  const [questions, setQuestions] = useState<Question[]>(makeRound)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = questions[current]

  const choose = (option: string) => {
    if (selected !== null) return
    setSelected(option)
    if (option === question.phrase.english) setScore((s) => s + 1)
  }

  const next = () => {
    if (current + 1 >= questions.length) setFinished(true)
    else {
      setCurrent(current + 1)
      setSelected(null)
    }
  }

  const restart = () => {
    setQuestions(makeRound())
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
        total={questions.length}
        onRestart={restart}
        buttonLabel="Practice again"
        messages={[
          'Luar biasa! Ready for the streets of Jakarta!',
          'Bagus! A few more rounds and they will stick.',
          'Keep going — read the phrasebook, then try again!',
        ]}
      />
    )
  }

  return (
    <div className={`quiz ${selected !== null ? 'quiz-answered' : ''}`}>
      <QuizProgress current={current} total={questions.length} />

      <div className="quiz-question">
        <span className="quiz-direction">What does this mean?</span>
        <h2>
          {question.phrase.indonesian}
          <SpeakButton text={question.phrase.indonesian} size="md" />
        </h2>
      </div>

      <ChoiceOptions
        options={question.options}
        answer={question.phrase.english}
        selected={selected}
        onChoose={choose}
      />

      {selected !== null && (
        <AnswerBar
          correct={selected === question.phrase.english}
          isLast={current + 1 >= questions.length}
          onNext={next}
        >
          {selected === question.phrase.english ? (
            <strong className="text-success">
              Benar! (Correct!)
              <SpeakButton text={question.phrase.indonesian} size="sm" />
            </strong>
          ) : (
            <strong className="text-error">
              Salah — “{question.phrase.indonesian}” means “{question.phrase.english}”
              <SpeakButton text={question.phrase.indonesian} size="sm" />
            </strong>
          )}
        </AnswerBar>
      )}
    </div>
  )
}
