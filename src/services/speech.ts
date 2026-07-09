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
