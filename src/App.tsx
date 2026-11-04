import { useMemo, useState } from 'react'
import type { CategoryId } from './types'
import { useProgress } from './hooks/useProgress'
import { useNavOrder } from './hooks/useNavOrder'
import { usePersistedState } from './hooks/usePersistedState'
import { useTheme } from './hooks/useTheme'
import { STORAGE_KEYS } from './storage'
import { NAV_ITEMS, VIEWS, isView, type NavItem, type View } from './views'
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

export default function App() {
  const [view, setView] = usePersistedState<View>(STORAGE_KEYS.view, (saved) =>
    isView(saved) ? saved : 'home'
  )
  // A deck to open Flashcards with (review from the home banner, or a
  // category from the learning path); cleared on normal navigation.
  const [deckLaunch, setDeckLaunch] = useState<DeckFilter | null>(null)
  // When set, a learning-path checkpoint quiz overlays the current view.
  const [checkpoint, setCheckpoint] = useState<CategoryId | null>(null)

  const { theme, toggleTheme } = useTheme()
  const { navOrder, navRef, navHasMore, updateNavFade, dragView, wasDrag, pressProps } =
    useNavOrder<View>(VIEWS)

  const orderedNav = useMemo(
    () =>
      navOrder
        .map((v) => NAV_ITEMS.find((i) => i.view === v))
        .filter((i): i is NavItem => Boolean(i)),
    [navOrder]
  )

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
            onNavigate={navigate}
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
