import { useEffect } from 'react'

/**
 * Calls `handler` when Enter is pressed, but only while `active` is true.
 * Used to advance to the next question/sentence after answering.
 */
export function useEnterKey(active: boolean, handler: () => void) {
  useEffect(() => {
    if (!active) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handler()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, handler])
}
