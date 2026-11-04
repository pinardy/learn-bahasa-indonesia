import type { Category } from '../types'
import type { DeckFilter } from '../decks'

interface DeckSelectProps {
  value: DeckFilter
  onChange: (deck: DeckFilter) => void
  categories: Category[]
  /** Words currently due; the review option is shown only when this is > 0 */
  reviewCount: number
  ariaLabel: string
}

/** Dropdown for picking a deck: due-for-review, all words, or a category. */
export function DeckSelect({ value, onChange, categories, reviewCount, ariaLabel }: DeckSelectProps) {
  return (
    <select
      className="filter-select"
      value={value}
      onChange={(e) => onChange(e.target.value as DeckFilter)}
      aria-label={ariaLabel}
    >
      {reviewCount > 0 && <option value="review">⏰ Review ({reviewCount} due)</option>}
      <option value="all">All words</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.emoji} {c.name}
        </option>
      ))}
    </select>
  )
}
