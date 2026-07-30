import { describe, expect, it } from 'vitest'
import { CATEGORIES, SAVED_CATEGORY, WORDS } from './vocabulary'
import { SENTENCES } from './sentences'
import { GRAMMAR_EXERCISES } from './grammar'
import { AFFIX_EXERCISES } from './affixes'
import { GRAMMAR_LESSONS } from './grammarLessons'

const dupes = <T>(arr: T[]): T[] => arr.filter((v, i) => arr.indexOf(v) !== i)

describe('vocabulary', () => {
  it('has unique word ids', () => {
    expect(dupes(WORDS.map((w) => w.id))).toEqual([])
  })

  it('has no duplicate Indonesian entries', () => {
    // case-sensitive: "minggu" (week) and "Minggu" (Sunday) are a legit pair
    expect(dupes(WORDS.map((w) => w.indonesian))).toEqual([])
  })

  it('every word has non-empty text and a real category', () => {
    const known = new Set([...CATEGORIES, SAVED_CATEGORY].map((c) => c.id))
    for (const w of WORDS) {
      expect(w.indonesian.trim(), w.id).not.toBe('')
      expect(w.english.trim(), w.id).not.toBe('')
      expect(known.has(w.category), `${w.id}: ${w.category}`).toBe(true)
    }
  })

  it('has unique category ids and every category has words', () => {
    expect(dupes(CATEGORIES.map((c) => c.id))).toEqual([])
    for (const c of CATEGORIES) {
      expect(WORDS.some((w) => w.category === c.id), c.id).toBe(true)
    }
  })
})

describe('sentences', () => {
  it('has unique ids and positive levels', () => {
    expect(dupes(SENTENCES.map((s) => s.id))).toEqual([])
    for (const s of SENTENCES) {
      expect(s.indonesian.trim(), s.id).not.toBe('')
      expect(s.english.trim(), s.id).not.toBe('')
      expect(s.level, s.id).toBeGreaterThanOrEqual(1)
    }
  })

  it('levels are contiguous from 1 (no gaps)', () => {
    const levels = [...new Set(SENTENCES.map((s) => s.level))].sort((a, b) => a - b)
    expect(levels).toEqual(levels.map((_, i) => i + 1))
  })
})

// Fill-in-the-blank exercises share a shape: one ___ blank, an answer, and
// distractors that must differ from the answer and each other.
const blankExercises = [
  ...GRAMMAR_EXERCISES.map((e) => ({ ...e, kind: 'grammar' as const })),
  ...AFFIX_EXERCISES.map((e) => ({ ...e, id: e.root, kind: 'affix' as const })),
]

describe('blank exercises (grammar + affixes)', () => {
  it('each sentence has exactly one ___ blank', () => {
    for (const e of blankExercises) {
      const blanks = e.sentence.split('___').length - 1
      expect(blanks, `${e.kind} ${e.id}: "${e.sentence}"`).toBe(1)
    }
  })

  it('the answer is never also a distractor, and options are unique', () => {
    for (const e of blankExercises) {
      const label = `${e.kind} ${e.id}`
      expect(e.distractors, label).not.toContain(e.answer)
      const options = [e.answer, ...e.distractors]
      expect(dupes(options), label).toEqual([])
      expect(e.distractors.length, label).toBeGreaterThanOrEqual(2)
    }
  })

  it('grammar exercise ids are unique', () => {
    expect(dupes(GRAMMAR_EXERCISES.map((e) => e.id))).toEqual([])
  })
})

describe('grammar lessons', () => {
  it('every drill topic has a matching lesson', () => {
    const lessonTopics = new Set(GRAMMAR_LESSONS.map((l) => l.topic))
    const drillTopics = new Set([...GRAMMAR_EXERCISES.map((e) => e.topic), 'Affixes'])
    for (const topic of drillTopics) {
      expect(lessonTopics.has(topic), `no lesson for drilled topic "${topic}"`).toBe(true)
    }
  })

  it('every lesson has a summary and at least one example', () => {
    for (const l of GRAMMAR_LESSONS) {
      expect(l.summary.trim(), l.topic).not.toBe('')
      expect(l.examples.length, l.topic).toBeGreaterThan(0)
    }
  })
})
