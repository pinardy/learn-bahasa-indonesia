import { useEffect, useState } from 'react'

/**
 * useState for a string value mirrored to localStorage. `parse` validates the
 * stored value (null when absent) and returns the initial state.
 */
export function usePersistedState<T extends string>(key: string, parse: (raw: string | null) => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      return parse(localStorage.getItem(key))
    } catch {
      return parse(null)
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // storage full or blocked — the value just won't survive a reload
    }
  }, [key, value])

  return [value, setValue] as const
}
