import type { ReactNode } from 'react'

/** Progress bar + "n / total" counter shared by the quiz-style screens. */
export function QuizProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="quiz-progress">
      <div className="quiz-progress-track">
        <div className="quiz-progress-fill" style={{ width: `${(current / total) * 100}%` }} />
      </div>
      <span>
        {current + 1} / {total}
      </span>
    </div>
  )
}

interface ChoiceOptionsProps {
  options: string[]
  answer: string
  selected: string | null
  onChoose: (option: string) => void
}

/** Multiple-choice grid that highlights correct/wrong/dimmed once answered. */
export function ChoiceOptions({ options, answer, selected, onChoose }: ChoiceOptionsProps) {
  const answered = selected !== null
  return (
    <div className="quiz-options">
      {options.map((option) => {
        let cls = 'quiz-option'
        if (answered) {
          if (option === answer) cls += ' quiz-option-correct'
          else if (option === selected) cls += ' quiz-option-wrong'
          else cls += ' quiz-option-dim'
        }
        return (
          <button key={option} className={cls} onClick={() => onChoose(option)}>
            {option}
          </button>
        )
      })}
    </div>
  )
}

interface AnswerBarProps {
  correct: boolean
  isLast: boolean
  onNext: () => void
  children: ReactNode
}

/** Fixed bottom feedback bar with a Next/See-results button; content via children. */
export function AnswerBar({ correct, isLast, onNext, children }: AnswerBarProps) {
  return (
    <div className={`answer-bar ${correct ? 'answer-bar-correct' : 'answer-bar-wrong'}`}>
      <div className="answer-bar-inner">
        <div className="answer-bar-text">{children}</div>
        <button className="btn btn-primary" onClick={onNext}>
          {isLast ? 'See results' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

interface QuizResultProps {
  score: number
  total: number
  onRestart: () => void
  buttonLabel: string
  /** messages for [>=80%, >=50%, below] */
  messages: [string, string, string]
  /** emoji shown at >=80% (💪 / 📚 are used below that) */
  topEmoji?: string
}

/** End-of-round score screen. */
export function QuizResult({
  score,
  total,
  onRestart,
  buttonLabel,
  messages,
  topEmoji = '🎉',
}: QuizResultProps) {
  const pct = Math.round((score / total) * 100)
  const emoji = pct >= 80 ? topEmoji : pct >= 50 ? '💪' : '📚'
  const message = pct >= 80 ? messages[0] : pct >= 50 ? messages[1] : messages[2]
  return (
    <div className="quiz-result">
      <span className="quiz-result-emoji">{emoji}</span>
      <h2>
        {score} / {total}
      </h2>
      <p>{message}</p>
      <button className="btn btn-primary" onClick={onRestart}>
        {buttonLabel}
      </button>
    </div>
  )
}
