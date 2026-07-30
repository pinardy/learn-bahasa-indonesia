import { useState } from 'react'
import type { StoryQuestion } from '../data/stories'

interface StoryQuizProps {
  questions: StoryQuestion[]
}

/** Inline comprehension check under a story: answer in Indonesian, instant feedback. */
export function StoryQuiz({ questions }: StoryQuizProps) {
  const [picked, setPicked] = useState<Record<number, string>>({})

  const answeredCount = Object.keys(picked).length
  const correctCount = questions.filter((q, i) => picked[i] === q.answer).length

  return (
    <div className="story-quiz" onClick={(e) => e.stopPropagation()}>
      <p className="story-quiz-title">
        📝 Cek pemahaman <span>(check your understanding)</span>
        {answeredCount === questions.length && (
          <strong className={correctCount === questions.length ? 'text-success' : ''}>
            {' '}
            — {correctCount}/{questions.length}
          </strong>
        )}
      </p>
      {questions.map((q, i) => {
        const chosen = picked[i]
        return (
          <div key={q.question} className="story-question">
            <p className="story-question-text">{q.question}</p>
            <div className="story-options">
              {q.options.map((option) => {
                let cls = 'story-option'
                if (chosen !== undefined) {
                  if (option === q.answer) cls += ' story-option-correct'
                  else if (option === chosen) cls += ' story-option-wrong'
                }
                return (
                  <button
                    key={option}
                    className={cls}
                    onClick={() => {
                      if (chosen === undefined) setPicked((p) => ({ ...p, [i]: option }))
                    }}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
