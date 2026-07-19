import { useState } from 'react'
import { WORDS } from '../data/vocabulary'
import { SCENARIOS } from '../data/phrases'
import { levenshtein, sample, shuffle } from '../utils'
import { isRecognitionSupported, listenOnce, speak } from '../services/speech'

interface SpeakingItem {
  text: string
  meaning: string
}

function makeRound(): SpeakingItem[] {
  const words = sample(WORDS, 6).map((w) => ({ text: w.indonesian, meaning: w.english }))
  const shortPhrases = SCENARIOS.flatMap((s) => s.phrases).filter(
    (p) => p.indonesian.split(' ').length <= 4 && !p.indonesian.includes('/')
  )
  const phrases = sample(shortPhrases, 4).map((p) => ({ text: p.indonesian, meaning: p.english }))
  return shuffle([...words, ...phrases])
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"’“”-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isCloseEnough(heard: string, target: string): boolean {
  const a = normalize(heard)
  const b = normalize(target)
  if (!a) return false
  return levenshtein(a, b) <= Math.max(1, Math.floor(b.length * 0.25))
}

type MicState = 'idle' | 'listening' | 'done' | 'error'

/** Say the Indonesian word/phrase aloud; the browser checks what it heard. */
export function SpeakingPractice() {
  const [items, setItems] = useState<SpeakingItem[]>(makeRound)
  const [current, setCurrent] = useState(0)
  const [micState, setMicState] = useState<MicState>('idle')
  const [heard, setHeard] = useState('')
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  if (!isRecognitionSupported()) {
    return (
      <p className="news-tip">
        🎤 Speaking practice needs the browser's speech recognition, which isn't available here.
        It works in Chrome and on most Android devices.
      </p>
    )
  }

  const item = items[current]
  const correct = micState === 'done' && isCloseEnough(heard, item.text)

  const listen = async () => {
    if (micState === 'listening') return
    setMicState('listening')
    setHeard('')
    try {
      const transcript = await listenOnce()
      setHeard(transcript)
      setMicState('done')
      if (isCloseEnough(transcript, item.text)) setScore((s) => s + 1)
    } catch {
      setMicState('error')
    }
  }

  const next = () => {
    if (current + 1 >= items.length) setFinished(true)
    else {
      setCurrent(current + 1)
      setMicState('idle')
      setHeard('')
    }
  }

  const restart = () => {
    setItems(makeRound())
    setCurrent(0)
    setMicState('idle')
    setHeard('')
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <div className="quiz-result">
        <span className="quiz-result-emoji">{score >= 8 ? '🎤' : score >= 5 ? '💪' : '📚'}</span>
        <h2>
          {score} / {items.length}
        </h2>
        <p>
          {score >= 8
            ? 'Pengucapan bagus! (Great pronunciation!)'
            : 'Keep practicing — listen to each word first, then repeat it.'}
        </p>
        <button className="btn btn-primary" onClick={restart}>
          Practice again
        </button>
      </div>
    )
  }

  return (
    <div className="speaking">
      <p className="news-tip">
        🎤 Say the Indonesian out loud, and the browser checks what it heard. Tap 🔊 first if you
        want to hear it. Your first attempt may ask for microphone permission.
      </p>

      <div className="quiz-progress">
        <div className="quiz-progress-track">
          <div
            className="quiz-progress-fill"
            style={{ width: `${(current / items.length) * 100}%` }}
          />
        </div>
        <span>
          {current + 1} / {items.length}
        </span>
      </div>

      <div className="quiz-question">
        <span className="quiz-direction">Say this in Indonesian</span>
        <h2 className="speaking-target">
          {item.text}
          <button
            type="button"
            className="speak-btn speak-btn-lg"
            onClick={() => speak(item.text)}
            aria-label="Hear it first"
            title="Hear it first"
          >
            🔊
          </button>
        </h2>
        <p className="speaking-meaning">“{item.meaning}”</p>
      </div>

      <button
        type="button"
        className={`listen-replay mic-btn ${micState === 'listening' ? 'mic-listening' : ''}`}
        onClick={() => void listen()}
        aria-label="Hold on — speak after tapping"
      >
        🎤
      </button>
      <p className="speaking-status">
        {micState === 'idle' && 'Tap the mic, then speak'}
        {micState === 'listening' && 'Listening…'}
        {micState === 'error' && "Didn't catch that — tap the mic and try again"}
        {micState === 'done' && (
          <>
            You said: <strong>“{heard}”</strong> —{' '}
            {correct ? (
              <strong className="text-success">Benar! 🎉</strong>
            ) : (
              <strong className="text-error">not quite, try again or skip</strong>
            )}
          </>
        )}
      </p>

      <div className="flashcard-actions">
        <button className="btn btn-ghost" onClick={next}>
          {correct ? 'Next →' : 'Skip →'}
        </button>
      </div>
    </div>
  )
}
