import { useEffect, useMemo, useState } from 'react'
import type { CategoryId } from './types'
import { useProgress } from './hooks/useProgress'
import { useNavOrder } from './hooks/useNavOrder'
import { useTheme } from './hooks/useTheme'
import { STORAGE_KEYS } from './storage'
import { Home } from './components/Home'
import { Flashcards } from './components/Flashcards'
import type { DeckFilter } from './decks'
import { Phrases } from './components/Phrases'
import { CheckpointQuiz } from './components/CheckpointQuiz'
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
  | 'phrases'
  | 'vocabulary'
  | 'news'

const NAV_ITEMS: { view: View; label: string; emoji: string }[] = [
  { view: 'home', label: 'Home', emoji: '🏠' },
  { view: 'flashcards', label: 'Flashcards', emoji: '🃏' },
  { view: 'quiz', label: 'Quiz', emoji: '❓' },
  { view: 'sentences', label: 'Sentences', emoji: '🧩' },
  { view: 'grammar', label: 'Grammar', emoji: '📝' },
  { view: 'numbers', label: 'Numbers', emoji: '🔢' },
  { view: 'phrases', label: 'Phrases', emoji: '🗣️' },
  { view: 'vocabulary', label: 'Vocabulary', emoji: '📖' },
  { view: 'news', label: 'News', emoji: '📰' },
]

const VIEWS = NAV_ITEMS.map((i) => i.view)
const isView = (v: unknown): v is View =>
  typeof v === 'string' && VIEWS.includes(v as View)

// Restore the user's custom tab order. Views added in later versions (missing
// from the saved order) are appended in their default position.
function loadNavOrder(): View[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.navOrder) ?? 'null')
    if (Array.isArray(saved)) {
      const order = saved.filter(isView)
      return [...order, ...VIEWS.filter((v) => !order.includes(v))]
    }
    // Migrate from the old pin feature (pinned tabs floated to the front).
    const pinned = JSON.parse(localStorage.getItem(STORAGE_KEYS.pinned) ?? '[]')
    if (Array.isArray(pinned)) {
      const front = pinned.filter(isView)
      if (front.length) return [...front, ...VIEWS.filter((v) => !front.includes(v))]
    }
  } catch {
    // corrupted storage — fall back to the default order
  }
  return VIEWS
}

export default function App() {
  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.view)
    return isView(saved) ? saved : 'home'
  })
  // A deck to open Flashcards with (review from the home banner, or a
  // category from the learning path); cleared on normal navigation.
  const [deckLaunch, setDeckLaunch] = useState<DeckFilter | null>(null)
  // When set, a learning-path checkpoint quiz overlays the current view.
  const [checkpoint, setCheckpoint] = useState<CategoryId | null>(null)

  const { theme, toggleTheme } = useTheme()
  const { navOrder, navRef, navHasMore, updateNavFade, dragView, wasDrag, pressProps } =
    useNavOrder<View>(loadNavOrder)

  const orderedNav = useMemo(
    () =>
      navOrder
        .map((v) => NAV_ITEMS.find((i) => i.view === v))
        .filter((i): i is (typeof NAV_ITEMS)[number] => Boolean(i)),
    [navOrder]
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.view, view)
  }, [view])

  const {
    progress,
    reviewWord,
    recordQuizAnswer,
    recordGrammarAnswer,
    markSentenceSolved,
    saveWord,
    removeSavedWord,
    markUnitPassed,
    resetProgress,
    replaceProgress,
  } = useProgress()

  // navigate normally (resets any pending deck launch or checkpoint)
  const navigate = (v: View) => {
    setDeckLaunch(null)
    setCheckpoint(null)
    setView(v)
  }

  const startReview = () => {
    setDeckLaunch('review')
    setView('flashcards')
  }

  const openUnit = (categoryId: CategoryId) => {
    setDeckLaunch(categoryId)
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
                className={`nav-btn ${view === item.view ? 'nav-btn-active' : ''} ${
                  dragView === item.view ? 'nav-btn-dragging' : ''
                }`}
                title="Hold, then drag to rearrange"
                onClick={() => {
                  if (!wasDrag()) navigate(item.view)
                }}
                {...pressProps(item.view)}
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
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="app-main">
        {checkpoint && (
          <CheckpointQuiz
            categoryId={checkpoint}
            onPass={() => {
              markUnitPassed(checkpoint)
              navigate('home')
            }}
            onClose={() => navigate('home')}
          />
        )}
        {!checkpoint && view === 'home' && (
          <Home
            progress={progress}
            dueCount={dueCount(progress.srs)}
            onNavigate={(v) => navigate(v as View)}
            onStartReview={startReview}
            onOpenUnit={openUnit}
            onStartCheckpoint={setCheckpoint}
            onReset={resetProgress}
            onImport={replaceProgress}
          />
        )}
        {view === 'flashcards' && (
          <Flashcards
            wordStatus={progress.wordStatus}
            savedWords={progress.savedWords}
            srs={progress.srs}
            initialDeck={deckLaunch ?? undefined}
            onReview={reviewWord}
          />
        )}
        {view === 'phrases' && <Phrases />}
        {view === 'quiz' && (
          <Quiz savedWords={progress.savedWords} srs={progress.srs} onAnswer={recordQuizAnswer} />
        )}
        {view === 'sentences' && (
          <SentenceBuilder solved={progress.sentencesSolved} onSolved={markSentenceSolved} />
        )}
        {view === 'grammar' && (
          <Grammar onAnswer={recordGrammarAnswer} byTopic={progress.grammarByTopic} />
        )}
        {view === 'numbers' && <NumbersTime />}
        {view === 'vocabulary' && (
          <Vocabulary
            wordStatus={progress.wordStatus}
            savedWords={progress.savedWords}
            onRemoveSaved={removeSavedWord}
            onSaveWord={saveWord}
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
