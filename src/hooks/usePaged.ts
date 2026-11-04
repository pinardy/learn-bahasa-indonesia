import { useCallback, useState } from 'react'

/**
 * Client-side "Show more" paging: exposes the first `visibleCount` items and
 * grows by `pageSize` on demand. Call `reset()` when the underlying list
 * changes meaning (new search, new source) to collapse back to one page.
 */
export function usePaged<T>(items: T[], pageSize: number) {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  // stable identity, so callers can use it inside effects and callbacks
  const reset = useCallback(() => setVisibleCount(pageSize), [pageSize])
  return {
    visible: items.slice(0, visibleCount),
    remaining: Math.max(items.length - visibleCount, 0),
    showMore: () => setVisibleCount((c) => c + pageSize),
    reset,
  }
}
