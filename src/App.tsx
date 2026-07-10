import { useEffect, useMemo, useRef, useState } from 'react'
import { useProgress } from './hooks/useProgress'
import { Home } from './components/Home'
import { Flashcards } from './components/Flashcards'
import { Quiz } from './components/Quiz'
import { SentenceBuilder } from './components/SentenceBuilder'
import { Vocabulary } from './components/Vocabulary'
import { News } from './components/News'
import { Grammar } from './components/Grammar'
import { NumbersTime } from './components/NumbersTime'
import { dueCount } from './srs'
import './App.css'

type View =
  | 'home'
  | 'flashcards'
  | 'quiz'
  | 'sentences'
  | 'grammar'
  | 'numbers'
  | 'vocabulary'
  | 'news'

const NAV_ITEMS: { view: View; label: string; emoji: string }[] = [
  { view: 'home', label: 'Home', emoji: '🏠' },
  { view: 'flashcards', label: 'Flashcards', emoji: '🃏' },
  { view: 'quiz', label: 'Quiz', emoji: '❓' },
  { view: 'sentences', label: 'Sentences', emoji: '🧩' },
  { view: 'grammar', label: 'Grammar', emoji: '📝' },
  { view: 'numbers', label: 'Numbers', emoji: '🔢' },
  { view: 'vocabulary', label: 'Vocabulary', emoji: '📖' },
  { view: 'news', label: 'News', emoji: '📰' },
]

const VIEWS = NAV_ITEMS.map((i) => i.view)
const isView = (v: unknown): v is View =>
  typeof v === 'string' && VIEWS.includes(v as View)

export default function App() {
  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem('bahasa-view')
    return isView(saved) ? saved : 'home'
  })
  const [startInReview, setStartInReview] = useState(false)

  // Tabs the user has pinned to the front of the nav (persisted, order matters).
  const [pinned, setPinned] = useState<View[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('bahasa-pinned') ?? '[]')
      return Array.isArray(raw) ? raw.filter(isView) : []
    } catch {
      return []
    }
  })
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  )

  // Show a fade/chevron hint while the nav can still be scrolled to the right
  // (so mobile users know off-screen tabs like News exist).
  const navRef = useRef<HTMLElement>(null)
  const [navHasMore, setNavHasMore] = useState(false)

  const updateNavFade = () => {
    const el = navRef.current
    if (!el) return
    setNavHasMore(el.scrollWidth - el.clientWidth - el.scrollLeft > 1)
  }

  // Pinned tabs float to the front (in pin order); the rest keep their order.
  const orderedNav = useMemo(() => {
    const set = new Set(pinned)
    const front = pinned
      .map((v) => NAV_ITEMS.find((i) => i.view === v))
      .filter((i): i is (typeof NAV_ITEMS)[number] => Boolean(i))
    return [...front, ...NAV_ITEMS.filter((i) => !set.has(i.view))]
  }, [pinned])

  const togglePin = (v: View) =>
    setPinned((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))

  // Long-press (touch-hold or mouse-hold) toggles a tab's pinned state. A
  // scroll drag moves the pointer past a threshold, which cancels the timer so
  // it won't pin; small jitter is ignored.
  const pressTimer = useRef<number>()
  const didLongPress = useRef(false)
  const pressStart = useRef<{ x: number; y: number } | null>(null)
  const startPress = (v: View, e: React.PointerEvent) => {
    didLongPress.current = false
    pressStart.current = { x: e.clientX, y: e.clientY }
    pressTimer.current = window.setTimeout(() => {
      didLongPress.current = true
      togglePin(v)
    }, 500)
  }
  const onPressMove = (e: React.PointerEvent) => {
    const s = pressStart.current
    if (!s) return
    if (Math.abs(e.clientX - s.x) > 10 || Math.abs(e.clientY - s.y) > 10) cancelPress()
  }
  const cancelPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current)
    pressStart.current = null
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('bahasa-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('bahasa-view', view)
  }, [view])

  useEffect(() => {
    localStorage.setItem('bahasa-pinned', JSON.stringify(pinned))
  }, [pinned])

  // Recompute the fade whenever the tab order changes.
  useEffect(() => {
    updateNavFade()
  }, [pinned])

  useEffect(() => {
    updateNavFade()
    // Bring the restored/active tab into view (it may start off-screen).
    navRef.current
      ?.querySelector('.nav-btn-active')
      ?.scrollIntoView({ inline: 'center', block: 'nearest' })
    window.addEventListener('resize', updateNavFade)
    return () => window.removeEventListener('resize', updateNavFade)
  }, [])
  const {
    progress,
    reviewWord,
    recordQuizAnswer,
    recordGrammarAnswer,
    markSentenceSolved,
    saveWord,
    removeSavedWord,
    resetProgress,
  } = useProgress()

  // navigate normally (resets any pending review launch)
  const navigate = (v: View) => {
    setStartInReview(false)
    setView(v)
  }

  const startReview = () => {
    setStartInReview(true)
    setView('flashcards')
  }

  return (
    <div className="app">
      <header className="app-header">
        <button className="brand" onClick={() => navigate('home')}>
          <span className="brand-flag">🇮🇩</span> Belajar!
        </button>
        <div className={`app-nav-wrap ${navHasMore ? 'has-more' : ''}`}>
          <nav className="app-nav" ref={navRef} onScroll={updateNavFade}>
            {orderedNav.map((item) => (
              <button
                key={item.view}
                className={`nav-btn ${view === item.view ? 'nav-btn-active' : ''}`}
                title="Hold to pin / unpin"
                onClick={(e) => {
                  if (didLongPress.current) {
                    e.preventDefault()
                    return
                  }
                  navigate(item.view)
                }}
                onPointerDown={(e) => startPress(item.view, e)}
                onPointerUp={cancelPress}
                onPointerLeave={cancelPress}
                onPointerCancel={cancelPress}
                onPointerMove={onPressMove}
              >
                <span className="nav-emoji">{item.emoji}</span>
                <span className="nav-label">{item.label}</span>
                {pinned.includes(item.view) && (
                  <span className="nav-pin" aria-hidden="true">📌</span>
                )}
              </button>
            ))}
          </nav>
          <span className="nav-scroll-hint" aria-hidden="true">›</span>
        </div>
        <button
          className="icon-btn theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="app-main">
        {view === 'home' && (
          <Home
            progress={progress}
            dueCount={dueCount(progress.srs)}
            onNavigate={(v) => navigate(v as View)}
            onStartReview={startReview}
            onReset={resetProgress}
          />
        )}
        {view === 'flashcards' && (
          <Flashcards
            wordStatus={progress.wordStatus}
            savedWords={progress.savedWords}
            srs={progress.srs}
            startInReview={startInReview}
            onReview={reviewWord}
          />
        )}
        {view === 'quiz' && <Quiz savedWords={progress.savedWords} onAnswer={recordQuizAnswer} />}
        {view === 'sentences' && (
          <SentenceBuilder solved={progress.sentencesSolved} onSolved={markSentenceSolved} />
        )}
        {view === 'grammar' && <Grammar onAnswer={recordGrammarAnswer} />}
        {view === 'numbers' && <NumbersTime />}
        {view === 'vocabulary' && (
          <Vocabulary
            wordStatus={progress.wordStatus}
            savedWords={progress.savedWords}
            onRemoveSaved={removeSavedWord}
          />
        )}
        {view === 'news' && (
          <News
            savedWords={progress.savedWords}
            wordStatus={progress.wordStatus}
            onSaveWord={saveWord}
          />
        )}
      </main>
    </div>
  )
}
