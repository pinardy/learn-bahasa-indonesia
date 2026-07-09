import { shuffle } from './utils'

const ONES = [
  '',
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'delapan',
  'sembilan',
]

function below1000(n: number): string {
  let out = ''
  const hundreds = Math.floor(n / 100)
  const rest = n % 100

  if (hundreds === 1) out = 'seratus'
  else if (hundreds > 1) out = `${ONES[hundreds]} ratus`

  if (rest > 0) {
    if (out) out += ' '
    if (rest < 10) {
      out += ONES[rest]
    } else if (rest === 10) {
      out += 'sepuluh'
    } else if (rest === 11) {
      out += 'sebelas'
    } else if (rest < 20) {
      out += `${ONES[rest - 10]} belas`
    } else {
      const tens = Math.floor(rest / 10)
      const ones = rest % 10
      out += `${ONES[tens]} puluh`
      if (ones > 0) out += ` ${ONES[ones]}`
    }
  }
  return out
}

/** Convert 0–999,999 to its Indonesian words. */
export function numberToIndonesian(n: number): string {
  if (n === 0) return 'nol'
  let out = ''
  const thousands = Math.floor(n / 1000)
  const rest = n % 1000

  if (thousands === 1) out = 'seribu'
  else if (thousands > 1) out = `${below1000(thousands)} ribu`

  if (rest > 0) {
    if (out) out += ' '
    out += below1000(rest)
  }
  return out
}

/**
 * Convert a 12-hour clock time to natural colloquial Indonesian.
 * Notably, :30 is expressed as "half to the next hour" (setengah).
 */
export function timeToIndonesian(hour: number, minute: number): string {
  const h = numberToIndonesian(hour)
  const next = numberToIndonesian((hour % 12) + 1)
  if (minute === 0) return `jam ${h}`
  if (minute === 15) return `jam ${h} lewat seperempat`
  if (minute === 30) return `jam setengah ${next}`
  if (minute === 45) return `jam ${next} kurang seperempat`
  if (minute < 30) return `jam ${h} lewat ${numberToIndonesian(minute)}`
  return `jam ${next} kurang ${numberToIndonesian(60 - minute)}`
}

export function formatClock(hour: number, minute: number): string {
  return `${hour}:${minute.toString().padStart(2, '0')}`
}

export interface TrainerQuestion {
  prompt: string
  answer: string
  options: string[]
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function optionsFrom(answer: string, makeDistractor: () => string): string[] {
  const set = new Set<string>([answer])
  let guard = 0
  while (set.size < 4 && guard++ < 50) set.add(makeDistractor())
  return shuffle([...set])
}

/** A number question: show the numeral, choose the Indonesian words. */
export function makeNumberQuestion(): TrainerQuestion {
  // weight toward smaller, more common numbers
  const n = Math.random() < 0.7 ? randInt(0, 100) : randInt(100, 9999)
  const answer = numberToIndonesian(n)
  const spread = Math.max(10, Math.round(n * 0.3))
  const options = optionsFrom(answer, () => {
    const delta = randInt(-spread, spread) || 1
    return numberToIndonesian(Math.max(0, n + delta))
  })
  return { prompt: n.toLocaleString('en-US'), answer, options }
}

// bias toward the distinctive o'clock / quarter / half forms
const MINUTES = [0, 0, 15, 30, 30, 45, 5, 10, 20, 40, 50]

function randomTime(): { hour: number; minute: number } {
  return { hour: randInt(1, 12), minute: MINUTES[randInt(0, MINUTES.length - 1)] }
}

/** A time question: show the digital clock, choose the Indonesian phrase. */
export function makeTimeQuestion(): TrainerQuestion {
  const { hour, minute } = randomTime()
  const answer = timeToIndonesian(hour, minute)
  const options = optionsFrom(answer, () => {
    const t = randomTime()
    return timeToIndonesian(t.hour, t.minute)
  })
  return { prompt: formatClock(hour, minute), answer, options }
}
