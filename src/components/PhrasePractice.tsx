import { SCENARIOS, type Phrase } from '../data/phrases'
import { buildOptions, sample, shuffle } from '../utils'
import { AnswerBar, ChoiceOptions, QuizProgress, QuizResult } from './QuizUI'
import { useQuizRound } from '../hooks/useQuizRound'
import { SpeakButton } from './SpeakButton'

const ROUND_LENGTH = 10

interface Question {
  phrase: Phrase
  options: string[]
}

const ALL_PHRASES = SCENARIOS.flatMap((s) => s.phrases)

function makeRound(): Question[] {
  return sample(ALL_PHRASES, ROUND_LENGTH).map((phrase) => ({
    phrase,
    options: buildOptions(
      phrase.english,
      shuffle(ALL_PHRASES)
        .filter((p) => p.indonesian !== phrase.indonesian)
        .map((p) => p.english)
    ),
  }))
}

/** Quiz over the phrasebook: read (or hear) the Indonesian, pick the meaning. */
export function PhrasePractice() {
  const round = useQuizRound<Question>({
    makeItems: makeRound,
    isCorrect: (q, choice) => choice === q.phrase.english,
  })
  const { item: question, selected, answered, isLast } = round

  if (round.finished) {
    return (
      <QuizResult
        score={round.score}
        total={round.total}
        onRestart={() => round.restart()}
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
    <div className={`quiz ${answered ? 'quiz-answered' : ''}`}>
      <QuizProgress current={round.current} total={round.total} />

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
        onChoose={round.choose}
      />

      {answered && (
        <AnswerBar correct={selected === question.phrase.english} isLast={isLast} onNext={round.next}>
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
