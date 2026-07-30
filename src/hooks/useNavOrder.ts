import { useEffect, useRef, useState } from 'react'
import { useDragReorder } from './useDragReorder'
import { STORAGE_KEYS } from '../storage'

/**
 * Owns the persisted, hold-and-drag-reorderable nav: the tab order, the
 * scrollable container ref, the right-edge "more tabs" fade hint, and the
 * drag handlers. The caller renders the tabs and maps `navOrder` to items.
 */
export function useNavOrder<T extends string>(loadOrder: () => T[]) {
  const [navOrder, setNavOrder] = useState<T[]>(loadOrder)
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
