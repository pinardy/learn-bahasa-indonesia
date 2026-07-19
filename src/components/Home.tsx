import { useRef, useState } from 'react'
import type { CategoryId, Progress } from '../types'
import { WORDS } from '../data/vocabulary'
import { SENTENCES } from '../data/sentences'
import { todayStr } from '../srs'
import {
  backupFilename,
  deserializeProgress,
  serializeProgress,
} from '../services/progressIO'
import { LearningPath } from './LearningPath'

interface HomeProps {
  progress: Progress
  dueCount: number
  onNavigate: (view: string) => void
  onStartReview: () => void
  onOpenUnit: (categoryId: CategoryId) => void
  onStartCheckpoint: (categoryId: CategoryId) => void
  onReset: () => void
  onImport: (progress: Progress) => void
}

export function Home({
  progress,
  dueCount,
  onNavigate,
  onStartReview,
  onOpenUnit,
  onStartCheckpoint,
  onReset,
  onImport,
}: HomeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [ioMessage, setIoMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const handleExport = () => {
    const text = serializeProgress(progress, new Date().toISOString())
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = backupFilename(todayStr())
    a.click()
    URL.revokeObjectURL(url)
    setIoMessage({ kind: 'ok', text: 'Progress exported.' })
  }

  const handleImportFile = async (file: File) => {
    try {
      const imported = deserializeProgress(await file.text())
      if (
        !window.confirm(
          'Import this file? It will replace your current progress on this device.'
        )
      )
        return
      onImport(imported)
      setIoMessage({ kind: 'ok', text: 'Progress imported.' })
    } catch (e) {
      setIoMessage({ kind: 'err', text: e instanceof Error ? e.message : 'Could not import file.' })
    }
  }
  const knownCount = Object.values(progress.wordStatus).filter((s) => s === 'known').length
  const learningCount = Object.values(progress.wordStatus).filter((s) => s === 'learning').length
  const { correct, total } = progress.quizStats
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const grammar = progress.grammarStats
  const grammarAccuracy =
    grammar.total > 0 ? Math.round((grammar.correct / grammar.total) * 100) : 0

  const activities = [
    { view: 'flashcards', emoji: '🃏', title: 'Flashcards', desc: 'Flip cards to memorize new words' },
    { view: 'quiz', emoji: '❓', title: 'Quiz', desc: 'Test yourself with multiple choice' },
    { view: 'sentences', emoji: '🧩', title: 'Sentence Builder', desc: 'Arrange words into sentences' },
    { view: 'grammar', emoji: '📝', title: 'Grammar', desc: 'Fill in the blank, learn the rules' },
    { view: 'numbers', emoji: '🔢', title: 'Numbers & Time', desc: 'Practice numbers and telling time' },
    { view: 'phrases', emoji: '🗣️', title: 'Phrases', desc: 'Survival phrases and pronunciation' },
    { view: 'vocabulary', emoji: '📖', title: 'Vocabulary', desc: 'Browse and search all words' },
    { view: 'news', emoji: '📰', title: 'News', desc: 'Read real Indonesian news bilingually' },
  ]

  return (
    <div className="home">
      <div className="hero">
        <h1>
          Selamat datang! <span className="wave">👋</span>
        </h1>
        <p className="hero-subtitle">
          Welcome! Learn Bahasa Indonesia through flashcards, quizzes, and sentence puzzles.
        </p>
      </div>

      {dueCount > 0 && (
        <button className="review-banner" onClick={onStartReview}>
          <span className="review-banner-icon">⏰</span>
          <span className="review-banner-text">
            <strong>
              {dueCount} word{dueCount === 1 ? '' : 's'} due for review
            </strong>
            <span>Tap to review words right before you forget them</span>
          </span>
          <span className="review-banner-go">Review →</span>
        </button>
      )}

      <LearningPath
        wordStatus={progress.wordStatus}
        unitsPassed={progress.unitsPassed}
        onOpenUnit={onOpenUnit}
        onStartCheckpoint={onStartCheckpoint}
      />

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{knownCount}</span>
          <span className="stat-label">words known</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{learningCount}</span>
          <span className="stat-label">still learning</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{total > 0 ? `${accuracy}%` : '—'}</span>
          <span className="stat-label">quiz accuracy</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{grammar.total > 0 ? `${grammarAccuracy}%` : '—'}</span>
          <span className="stat-label">grammar accuracy</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {progress.sentencesSolved.length}/{SENTENCES.length}
          </span>
          <span className="stat-label">sentences solved</span>
        </div>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-label">
          <span>Overall vocabulary progress</span>
          <span>
            {knownCount} / {WORDS.length + progress.savedWords.length}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              width: `${(knownCount / (WORDS.length + progress.savedWords.length)) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="activity-grid">
        {activities.map((a) => (
          <button key={a.view} className="activity-card" onClick={() => onNavigate(a.view)}>
            <span className="activity-emoji">{a.emoji}</span>
            <span className="activity-title">{a.title}</span>
            <span className="activity-desc">{a.desc}</span>
          </button>
        ))}
      </div>

      <div className="data-tools">
        <div className="data-tools-actions">
          <button className="data-btn" onClick={handleExport}>
            ⬇️ Export progress
          </button>
          <button className="data-btn" onClick={() => fileInputRef.current?.click()}>
            ⬆️ Import progress
          </button>
          {(knownCount > 0 ||
            total > 0 ||
            grammar.total > 0 ||
            progress.sentencesSolved.length > 0) && (
            <button
              className="data-btn data-btn-danger"
              onClick={() => {
                if (window.confirm('Reset all progress? This cannot be undone.')) {
                  onReset()
                  setIoMessage(null)
                }
              }}
            >
              Reset progress
            </button>
          )}
        </div>
        {ioMessage && (
          <p className={`data-tools-msg ${ioMessage.kind === 'err' ? 'is-error' : ''}`}>
            {ioMessage.text}
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImportFile(file)
            // reset so selecting the same file again re-triggers onChange
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
