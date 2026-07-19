import type { CategoryId, WordStatus } from '../types'
import { CATEGORIES, WORDS } from '../data/vocabulary'
import { PATH_ORDER, UNIT_MASTERY } from '../data/path'

interface LearningPathProps {
  wordStatus: Record<string, WordStatus>
  unitsPassed: CategoryId[]
  onOpenUnit: (categoryId: CategoryId) => void
  onStartCheckpoint: (categoryId: CategoryId) => void
}

/**
 * The guided path for new learners: study a unit's flashcards to 70% known,
 * then pass its checkpoint quiz to complete it and unlock the next.
 */
export function LearningPath({
  wordStatus,
  unitsPassed,
  onOpenUnit,
  onStartCheckpoint,
}: LearningPathProps) {
  const units = PATH_ORDER.map((id) => {
    const cat = CATEGORIES.find((c) => c.id === id)!
    const words = WORDS.filter((w) => w.category === id)
    const known = words.filter((w) => wordStatus[w.id] === 'known').length
    const target = Math.ceil(words.length * UNIT_MASTERY)
    return { cat, known, target, passed: unitsPassed.includes(id) }
  })

  const doneCount = units.filter((u) => u.passed).length
  const currentIndex = units.findIndex((u) => !u.passed)

  return (
    <div className="path-section">
      <div className="path-header">
        <h2>🎯 Learning path</h2>
        <span className="path-count">
          {doneCount}/{units.length} units
        </span>
      </div>
      <div className="path-row">
        {units.map((u, i) => {
          const ready = !u.passed && u.known >= u.target
          const state = u.passed ? 'done' : i === currentIndex ? (ready ? 'ready' : 'current') : 'locked'
          return (
            <button
              key={u.cat.id}
              className={`path-unit path-unit-${state}`}
              disabled={state === 'locked'}
              onClick={() =>
                state === 'ready' ? onStartCheckpoint(u.cat.id) : onOpenUnit(u.cat.id)
              }
              title={
                state === 'locked'
                  ? 'Complete the previous unit to unlock'
                  : state === 'ready'
                    ? `Take the ${u.cat.name} checkpoint quiz`
                    : `Study ${u.cat.name} flashcards`
              }
            >
              <span className="path-emoji">{state === 'locked' ? '🔒' : u.cat.emoji}</span>
              <span className="path-name">{u.cat.name}</span>
              <span className="path-progress">
                {u.passed
                  ? '✓ done'
                  : ready
                    ? '✍️ checkpoint!'
                    : `${u.known}/${u.target} known`}
              </span>
            </button>
          )
        })}
      </div>
      <p className="path-hint">
        Mark 70% of a unit's words as known in Flashcards, then pass its checkpoint quiz to unlock
        the next unit.
      </p>
    </div>
  )
}
