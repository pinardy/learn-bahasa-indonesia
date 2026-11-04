import { useEffect, useRef } from 'react'
import { STORAGE_KEYS } from '../storage'
import { isView, type View } from '../views'
import { usePersistedState } from './usePersistedState'

/** `#/quiz` → 'quiz'; `#/` → 'home'; no or unknown hash → null. */
export function viewFromHash(hash: string): View | null {
  if (hash === '#/' || hash === '#') return 'home'
  const v = hash.replace(/^#\/?/, '')
  return isView(v) ? v : null
}

export const hashFor = (view: View) => (view === 'home' ? '#/' : `#/${view}`)

/**
 * The current screen, kept in the URL hash so the browser/Android back button
 * and links work. A URL without a hash (e.g. the installed PWA's start URL)
 * restores the last screen from localStorage.
 *
 * `go` pushes a history entry. `onHistoryNav` runs when the view changes from
 * outside the app (back/forward, or an edited URL) — e.g. to clear overlays.
 */
export function useHashView(onHistoryNav?: () => void) {
  const [view, setView] = usePersistedState<View>(
    STORAGE_KEYS.view,
    (saved) => viewFromHash(window.location.hash) ?? (isView(saved) ? saved : 'home')
  )

  const onHistoryNavRef = useRef(onHistoryNav)
  onHistoryNavRef.current = onHistoryNav

  useEffect(() => {
    // reflect a restored view in the URL without adding a history entry
    window.history.replaceState(null, '', hashFor(view))
    // pushState never fires hashchange, so this only sees back/forward/edits
    const onHashChange = () => {
      const next = viewFromHash(window.location.hash) ?? 'home'
      // tidy an unknown or non-canonical hash (e.g. #/bogus) in place
      if (window.location.hash !== hashFor(next)) {
        window.history.replaceState(null, '', hashFor(next))
      }
      setView(next)
      onHistoryNavRef.current?.()
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const go = (next: View) => {
    if (next !== view) window.history.pushState(null, '', hashFor(next))
    setView(next)
  }

  return [view, go] as const
}
