import { useState } from 'react'
import { SCENARIOS } from '../data/phrases'
import { SOUNDS } from '../data/pronunciation'
import { SpeakButton } from './SpeakButton'

type PhrasesMode = 'phrasebook' | 'sounds'

export function Phrases() {
  const [mode, setMode] = useState<PhrasesMode>('phrasebook')
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id)

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]

  return (
    <div className="phrases">
      <div className="category-pills">
        <button
          className={`pill ${mode === 'phrasebook' ? 'pill-active' : ''}`}
          onClick={() => setMode('phrasebook')}
        >
          💬 Phrasebook
        </button>
        <button
          className={`pill ${mode === 'sounds' ? 'pill-active' : ''}`}
          onClick={() => setMode('sounds')}
        >
          🔤 Pronunciation
        </button>
      </div>

      {mode === 'phrasebook' ? (
        <>
          <p className="news-tip">
            💡 Ready-to-use phrases for real situations — tap 🔊 to hear each one spoken.
          </p>

          <div className="category-pills">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                className={`pill ${scenarioId === s.id ? 'pill-active' : ''}`}
                onClick={() => setScenarioId(s.id)}
              >
                {s.emoji} {s.name}
              </button>
            ))}
          </div>

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
      ) : (
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
