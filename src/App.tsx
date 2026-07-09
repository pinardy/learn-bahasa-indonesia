import { useEffect, useState } from 'react'
import { useProgress } from './hooks/useProgress'
import { Home } from './components/Home'
import { Flashcards } from './components/Flashcards'
import { Quiz } from './components/Quiz'
import { SentenceBuilder } from './components/SentenceBuilder'
import { Vocabulary } from './components/Vocabulary'
import { News } from './components/News'
import { Grammar } from './components/Grammar'
import { NumbersTime } from './components/NumbersTime'
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
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('bahasa-theme', theme)
  }, [theme])
  const {
    progress,
    setWordStatus,
    recordQuizAnswer,
    recordGrammarAnswer,
    markSentenceSolved,
    saveWord,
    removeSavedWord,
    resetProgress,
  } = useProgress()

  return (
    <div className="app">
      <header className="app-header">
        <button className="brand" onClick={() => setView('home')}>
          <span className="brand-flag">🇮🇩</span> Belajar!
        </button>
        <nav className="app-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              className={`nav-btn ${view === item.view ? 'nav-btn-active' : ''}`}
              onClick={() => setView(item.view)}
            >
              <span className="nav-emoji">{item.emoji}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
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
          <Home progress={progress} onNavigate={(v) => setView(v as View)} onReset={resetProgress} />
        )}
        {view === 'flashcards' && (
          <Flashcards
            wordStatus={progress.wordStatus}
            savedWords={progress.savedWords}
            onSetStatus={setWordStatus}
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
