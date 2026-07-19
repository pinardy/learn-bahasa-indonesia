// Browser-native Indonesian text-to-speech via the Web Speech API.
// Voices are on-device, so this also works offline in the installed PWA.

let cachedVoices: SpeechSynthesisVoice[] = []

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function refreshVoices() {
  if (isSpeechSupported()) cachedVoices = window.speechSynthesis.getVoices()
}

if (isSpeechSupported()) {
  refreshVoices()
  // voices load asynchronously in most browsers
  window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices)
}

function indonesianVoice(): SpeechSynthesisVoice | undefined {
  if (!cachedVoices.length) refreshVoices()
  return (
    cachedVoices.find((v) => v.lang === 'id-ID') ??
    cachedVoices.find((v) => v.lang.toLowerCase().startsWith('id'))
  )
}

// ---- Speech recognition (speaking practice) ----

type RecognitionCtor = new () => SpeechRecognitionLike
interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  abort: () => void
}

function recognitionCtor(): RecognitionCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor
    webkitSpeechRecognition?: RecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export function isRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && recognitionCtor() !== undefined
}

/**
 * Listen once for Indonesian speech and resolve with the transcript.
 * Rejects on mic errors, no-speech, or lack of browser support.
 */
export function listenOnce(): Promise<string> {
  return new Promise((resolve, reject) => {
    const Ctor = recognitionCtor()
    if (!Ctor) return reject(new Error('unsupported'))
    const recognition = new Ctor()
    recognition.lang = 'id-ID'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    let settled = false
    recognition.onresult = (event) => {
      settled = true
      resolve(event.results[0]?.[0]?.transcript ?? '')
    }
    recognition.onerror = (event) => {
      settled = true
      reject(new Error(event.error))
    }
    recognition.onend = () => {
      if (!settled) reject(new Error('no-speech'))
    }
    recognition.start()
  })
}

/** Speak Indonesian text aloud. Cancels any in-progress utterance first. */
export function speak(text: string) {
  if (!isSpeechSupported()) return
  const trimmed = text.trim()
  if (!trimmed) return

  const synth = window.speechSynthesis
  synth.cancel()

  const utterance = new SpeechSynthesisUtterance(trimmed)
  utterance.lang = 'id-ID'
  const voice = indonesianVoice()
  if (voice) utterance.voice = voice
  utterance.rate = 0.9 // a touch slower, for learners
  synth.speak(utterance)
}
