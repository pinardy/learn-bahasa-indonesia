import { useEffect, useRef, useState } from 'react'
import { useDragReorder } from './useDragReorder'
import { STORAGE_KEYS } from '../storage'

/**
 * Owns the persisted, hold-and-drag-reorderable nav: the tab order, the
 * scrollable container ref, the right-edge "more tabs" fade hint, and the
 * drag handlers. The caller renders the tabs and maps `navOrder` to items.
 */
export function useNavOrder<T extends string>(defaultOrder: readonly T[]) {
  const [navOrder, setNavOrder] = useState<T[]>(() => loadNavOrder(defaultOrder))
  const navRef = useRef<HTMLElement>(null)
  const [navHasMore, setNavHasMore] = useState(false)

  const updateNavFade = () => {
    const el = navRef.current
    if (!el) return
    setNavHasMore(el.scrollWidth - el.clientWidth - el.scrollLeft > 1)
  }

  const { dragging, wasDrag, pressProps } = useDragReorder(navRef, setNavOrder)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.navOrder, JSON.stringify(navOrder))
    localStorage.removeItem(STORAGE_KEYS.pinned) // superseded by the full order
    updateNavFade()
  }, [navOrder])

  useEffect(() => {
    updateNavFade()
    // Bring the restored/active tab into view (it may start off-screen).
    navRef.current
      ?.querySelector('.nav-btn-active')
      ?.scrollIntoView({ inline: 'center', block: 'nearest' })
    window.addEventListener('resize', updateNavFade)
    return () => window.removeEventListener('resize', updateNavFade)
  }, [])

  return { navOrder, navRef, navHasMore, updateNavFade, dragView: dragging, wasDrag, pressProps }
}

/**
 * Restore the user's custom tab order. Unknown entries are dropped, and tabs
 * added in later versions (missing from the saved order) are appended in their
 * default position.
 */
export function loadNavOrder<T extends string>(defaultOrder: readonly T[]): T[] {
  const known = (v: unknown): v is T => (defaultOrder as readonly unknown[]).includes(v)
  const withRest = (front: T[]) => [...front, ...defaultOrder.filter((v) => !front.includes(v))]
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.navOrder) ?? 'null')
    if (Array.isArray(saved)) return withRest(saved.filter(known))
    // Migrate from the old pin feature (pinned tabs floated to the front).
    const pinned = JSON.parse(localStorage.getItem(STORAGE_KEYS.pinned) ?? '[]')
    if (Array.isArray(pinned)) {
      const front = pinned.filter(known)
      if (front.length) return withRest(front)
    }
  } catch {
    // corrupted storage — fall back to the default order
  }
  return [...defaultOrder]
}
