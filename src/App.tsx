import { useState } from 'react'
import { useProgress } from './hooks/useProgress'
import { Home } from './components/Home'
import { Flashcards } from './components/Flashcards'
import { Quiz } from './components/Quiz'
import { SentenceBuilder } from './components/SentenceBuilder'
import { Vocabulary } from './components/Vocabulary'
import { News } from './components/News'
import { Grammar } from './components/Grammar'
import './App.css'

type View = 'home' | 'flashcards' | 'quiz' | 'sentences' | 'grammar' | 'vocabulary' | 'news'

const NAV_ITEMS: { view: View; label: string; emoji: string }[] = [
  { view: 'home', label: 'Home', emoji: '🏠' },
  { view: 'flashcards', label: 'Flashcards', emoji: '🃏' },
  { view: 'quiz', label: 'Quiz', emoji: '❓' },
  { view: 'sentences', label: 'Sentences', emoji: '🧩' },
  { view: 'grammar', label: 'Grammar', emoji: '📝' },
  { view: 'vocabulary', label: 'Vocabulary', emoji: '📖' },
  { view: 'news', label: 'News', emoji: '📰' },
]

export default function App() {
  const [view, setView] = useState<View>('home')
  const {
    progress,
    setWordStatus,
    recordQuizAnswer,
    recordGrammarAnswer,
    markSentenceSolved,
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
      </header>

      <main className="app-main">
        {view === 'home' && (
          <Home progress={progress} onNavigate={(v) => setView(v as View)} onReset={resetProgress} />
        )}
        {view === 'flashcards' && (
          <Flashcards wordStatus={progress.wordStatus} onSetStatus={setWordStatus} />
        )}
        {view === 'quiz' && <Quiz onAnswer={recordQuizAnswer} />}
        {view === 'sentences' && (
          <SentenceBuilder solved={progress.sentencesSolved} onSolved={markSentenceSolved} />
        )}
        {view === 'grammar' && <Grammar onAnswer={recordGrammarAnswer} />}
        {view === 'vocabulary' && <Vocabulary wordStatus={progress.wordStatus} />}
        {view === 'news' && <News />}
      </main>
    </div>
  )
}
