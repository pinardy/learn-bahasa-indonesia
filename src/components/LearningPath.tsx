import type { CategoryId, WordStatus } from '../types'
import { CATEGORIES, WORDS } from '../data/vocabulary'
import { PATH_ORDER, UNIT_MASTERY } from '../data/path'

interface LearningPathProps {
  wordStatus: Record<string, WordStatus>
  onOpenUnit: (categoryId: CategoryId) => void
}

/**
 * The guided path for new learners: categories in order, each unlocked by
 * mastering 70% of the previous one. Clicking a unit opens its flashcard deck.
 */
export function LearningPath({ wordStatus, onOpenUnit }: LearningPathProps) {
  const units = PATH_ORDER.map((id) => {
    const cat = CATEGORIES.find((c) => c.id === id)!
    const words = WORDS.filter((w) => w.category === id)
    const known = words.filter((w) => wordStatus[w.id] === 'known').length
    const target = Math.ceil(words.length * UNIT_MASTERY)
    return { cat, known, target, complete: known >= target }
  })

  const doneCount = units.filter((u) => u.complete).length
  const currentIndex = units.findIndex((u) => !u.complete)

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
          const state = u.complete ? 'done' : i === currentIndex ? 'current' : 'locked'
          return (
            <button
              key={u.cat.id}
              className={`path-unit path-unit-${state}`}
              disabled={state === 'locked'}
              onClick={() => onOpenUnit(u.cat.id)}
              title={
                state === 'locked'
                  ? 'Complete the previous unit to unlock'
                  : `Study ${u.cat.name} flashcards`
              }
            >
              <span className="path-emoji">{state === 'locked' ? '🔒' : u.cat.emoji}</span>
              <span className="path-name">{u.cat.name}</span>
              <span className="path-progress">
                {u.complete ? '✓ done' : `${u.known}/${u.target} known`}
              </span>
            </button>
          )
        })}
      </div>
      <p className="path-hint">
        Mark 70% of a unit's words as known in Flashcards to complete it and unlock the next.
      </p>
    </div>
  )
}
