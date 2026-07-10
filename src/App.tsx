import { useEffect, useRef, useState } from 'react'
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

export default function App() {
  const [view, setView] = useState<View>('home')
  const [startInReview, setStartInReview] = useState(false)
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('bahasa-theme', theme)
  }, [theme])

  useEffect(() => {
    updateNavFade()
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
            {NAV_ITEMS.map((item) => (
              <button
                key={item.view}
                className={`nav-btn ${view === item.view ? 'nav-btn-active' : ''}`}
                onClick={() => navigate(item.view)}
              >
                <span className="nav-emoji">{item.emoji}</span>
                <span className="nav-label">{item.label}</span>
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
