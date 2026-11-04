import { useState } from 'react'
import { GRAMMAR_LESSONS } from '../data/grammarLessons'
import { SpeakButton } from './SpeakButton'
import { accuracyPct } from '../utils'

interface GrammarLessonsProps {
  byTopic: Record<string, { correct: number; total: number }>
}

/** Short readable lessons per grammar topic, with your drill accuracy. */
export function GrammarLessons({ byTopic }: GrammarLessonsProps) {
  const [open, setOpen] = useState<string | null>(GRAMMAR_LESSONS[0].topic)

  return (
    <div className="lessons">
      <p className="news-tip">
        💡 Read a lesson, then drill it in Practice (or Affixes). Your accuracy per topic shows
        where to focus.
      </p>
      <ul className="lesson-list">
        {GRAMMAR_LESSONS.map((lesson) => {
          const stats = byTopic[lesson.topic]
          const accuracy = accuracyPct(stats)
          const isOpen = open === lesson.topic
          return (
            <li key={lesson.topic} className={`lesson-item ${isOpen ? 'lesson-item-open' : ''}`}>
              <button
                className="lesson-head"
                onClick={() => setOpen(isOpen ? null : lesson.topic)}
              >
                <span className="lesson-title">
                  {lesson.emoji} {lesson.topic}
                </span>
                {accuracy !== null && (
                  <span
                    className={`lesson-accuracy ${
                      accuracy >= 80 ? 'lesson-accuracy-high' : accuracy >= 50 ? 'lesson-accuracy-mid' : 'lesson-accuracy-low'
                    }`}
                    title={`${stats!.correct}/${stats!.total} correct in drills`}
                  >
                    {accuracy}%
                  </span>
                )}
                <span className="lesson-chevron">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="lesson-body">
                  <p>{lesson.summary}</p>
                  <ul className="lesson-examples">
                    {lesson.examples.map((ex) => (
                      <li key={ex.id}>
                        <em>{ex.id}</em>
                        <SpeakButton text={ex.id} size="sm" /> — {ex.en}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
