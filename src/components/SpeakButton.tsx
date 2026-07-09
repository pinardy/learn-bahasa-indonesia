import { isSpeechSupported, speak } from '../services/speech'

interface SpeakButtonProps {
  text: string
  /** Larger icon for prominent placements like the flashcard */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/** A 🔊 button that speaks Indonesian text. Renders nothing if TTS is unsupported. */
export function SpeakButton({ text, size = 'md', className = '' }: SpeakButtonProps) {
  if (!isSpeechSupported()) return null
  return (
    <button
      type="button"
      className={`speak-btn speak-btn-${size} ${className}`}
      aria-label={`Listen to “${text}”`}
      title="Listen"
      onClick={(e) => {
        e.stopPropagation()
        speak(text)
      }}
    >
      🔊
    </button>
  )
}
