import { useState } from 'react'
import { SCENARIOS } from '../data/phrases'
import { SOUNDS } from '../data/pronunciation'
import { SpeakButton } from './SpeakButton'
import { PhrasePractice } from './PhrasePractice'
import { SpeakingPractice } from './SpeakingPractice'

type PhrasesMode = 'phrasebook' | 'practice' | 'speaking' | 'sounds'

const MODES: { id: PhrasesMode; label: string }[] = [
  { id: 'phrasebook', label: '💬 Phrasebook' },
  { id: 'practice', label: '✏️ Practice' },
  { id: 'speaking', label: '🎤 Speaking' },
  { id: 'sounds', label: '🔤 Pronunciation' },
]

export function Phrases() {
  const [mode, setMode] = useState<PhrasesMode>('phrasebook')
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id)

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]

  return (
    <div className="phrases">
      <div className="category-pills">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`pill ${mode === m.id ? 'pill-active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'practice' && <PhrasePractice />}
      {mode === 'speaking' && <SpeakingPractice />}

      {mode === 'phrasebook' && (
        <>
          <p className="news-tip">
            💡 Ready-to-use phrases for real situations — tap 🔊 to hear each one spoken.
          </p>

          <select
            className="filter-select"
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
            aria-label="Choose a scenario"
          >
            {SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.emoji} {s.name} ({s.phrases.length})
              </option>
            ))}
          </select>

          <ul className="vocab-list">
            {scenario.phrases.map((p) => (
              <li key={p.indonesian} className="vocab-item">
                <div className="vocab-words">
                  <span className="vocab-id">
                    {p.indonesian}
                    <SpeakButton text={p.indonesian} size="sm" />
                  </span>
                  <span className="vocab-en">{p.english}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {mode === 'sounds' && (
        <>
          <p className="news-tip">
            💡 Indonesian is phonetic — words sound exactly as they're written, and stress usually
            falls on the second-to-last syllable. These are the only sounds that differ from what
            an English reader would guess:
          </p>

          <ul className="sound-list">
            {SOUNDS.map((s) => (
              <li key={s.letters} className="sound-row">
                <span className="sound-letters">{s.letters}</span>
                <span className="sound-desc">{s.description}</span>
                <span className="sound-example">
                  <em>{s.example}</em> ({s.exampleMeaning})
                  <SpeakButton text={s.example} size="sm" />
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
