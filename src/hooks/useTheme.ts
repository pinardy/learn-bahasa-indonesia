import { useEffect, useState } from 'react'
import { STORAGE_KEYS } from '../storage'

type Theme = 'light' | 'dark'

/**
 * Light/dark theme, persisted and reflected on <html data-theme>. The initial
 * value is read from the data-theme the no-flash inline script set before paint.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_KEYS.theme, theme)
    // keep the mobile browser chrome matching the theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#1c1917' : '#ce1126')
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return { theme, toggleTheme }
}
