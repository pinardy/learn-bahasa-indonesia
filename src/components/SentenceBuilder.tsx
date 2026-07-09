import { useMemo, useState } from 'react'
import { SENTENCES } from '../data/sentences'
import { shuffle } from '../utils'

interface SentenceBuilderProps {
  solved: string[]
  onSolved: (sentenceId: string) => void
}

interface Tile {
  key: number
  text: string
}

export function SentenceBuilder({ solved, onSolved }: SentenceBuilderProps) {
  const [sentenceIndex, setSentenceIndex] = useState(() => {
    const firstUnsolved = SENTENCES.findIndex((s) => !solved.includes(s.id))
    return firstUnsolved === -1 ? 0 : firstUnsolved
  })
  const [attempt, setAttempt] = useState(0)
  const [placed, setPlaced] = useState<Tile[]>([])
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)

  const sentence = SENTENCES[sentenceIndex]
  const targetWords = useMemo(() => sentence.indonesian.split(' '), [sentence])

  const tiles = useMemo<Tile[]>(
    () => shuffle(targetWords.map((text, key) => ({ key, text }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sentence, attempt]
  )

  const available = tiles.filter((t) => !placed.some((p) => p.key === t.key))

  const placeTile = (tile: Tile) => {
    if (result === 'correct') return
    setResult(null)
    setPlaced([...placed, tile])
  }

  const removeTile = (tile: Tile) => {
    if (result === 'correct') return
    setResult(null)
    setPlaced(placed.filter((p) => p.key !== tile.key))
  }

  const check = () => {
    const isCorrect = placed.map((p) => p.text).join(' ') === sentence.indonesian
    setResult(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) onSolved(sentence.id)
  }

  const retry = () => {
    setPlaced([])
    setResult(null)
    setAttempt((a) => a + 1)
  }

  const goTo = (index: number) => {
    setSentenceIndex(index)
    setPlaced([])
    setResult(null)
    setAttempt((a) => a + 1)
  }

  return (
    <div className="sentence-builder">
      <div className="sentence-nav">
        {SENTENCES.map((s, i) => (
          <button
            key={s.id}
            className={`sentence-dot ${i === sentenceIndex ? 'sentence-dot-active' : ''} ${
              solved.includes(s.id) ? 'sentence-dot-solved' : ''
            }`}
            onClick={() => goTo(i)}
            title={`Sentence ${i + 1}${solved.includes(s.id) ? ' (solved)' : ''}`}
          >
            {solved.includes(s.id) ? '✓' : i + 1}
          </button>
        ))}
      </div>

      <div className="sentence-prompt">
        <span className="sentence-label">Translate into Indonesian:</span>
        <h2>“{sentence.english}”</h2>
      </div>

      <div className={`sentence-slots ${result === 'wrong' ? 'sentence-slots-wrong' : ''} ${result === 'correct' ? 'sentence-slots-correct' : ''}`}>
        {placed.length === 0 && <span className="sentence-placeholder">Tap words below in order…</span>}
        {placed.map((tile) => (
          <button key={tile.key} className="word-tile word-tile-placed" onClick={() => removeTile(tile)}>
            {tile.text}
          </button>
        ))}
      </div>

      <div className="sentence-bank">
        {available.map((tile) => (
          <button key={tile.key} className="word-tile" onClick={() => placeTile(tile)}>
            {tile.text}
          </button>
        ))}
      </div>

      {result === 'correct' ? (
        <div className="sentence-feedback">
          <p className="text-success">
            <strong>Benar! 🎉</strong> “{sentence.indonesian}”
          </p>
          <button
            className="btn btn-primary"
            onClick={() => goTo((sentenceIndex + 1) % SENTENCES.length)}
          >
            Next sentence →
          </button>
        </div>
      ) : (
        <div className="sentence-feedback">
          {result === 'wrong' && (
            <p className="text-error">Not quite — tap a word to remove it, or start over.</p>
          )}
          <div className="sentence-actions">
            <button className="btn btn-ghost" onClick={retry}>
              Clear
            </button>
            <button
              className="btn btn-primary"
              onClick={check}
              disabled={placed.length !== targetWords.length}
            >
              Check answer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
