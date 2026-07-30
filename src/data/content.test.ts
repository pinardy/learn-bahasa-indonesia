import { describe, expect, it } from 'vitest'
import { SCENARIOS } from './phrases'
import { STORIES, STORY_QUESTIONS } from './stories'

describe('phrase scenarios', () => {
  it('have unique ids', () => {
    const ids = SCENARIOS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every scenario has a name, emoji, and at least one phrase', () => {
    for (const s of SCENARIOS) {
      expect(s.name.trim(), s.id).not.toBe('')
      expect(s.emoji.trim(), s.id).not.toBe('')
      expect(s.phrases.length, s.id).toBeGreaterThan(0)
    }
  })

  it('every phrase has non-empty Indonesian and English', () => {
    for (const s of SCENARIOS) {
      for (const p of s.phrases) {
        expect(p.indonesian.trim(), `${s.id}: ${p.english}`).not.toBe('')
        expect(p.english.trim(), `${s.id}: ${p.indonesian}`).not.toBe('')
      }
    }
  })
})

describe('beginner stories', () => {
  it('have unique ids', () => {
    const ids = STORIES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every story has a title, snippet, and a full English translation', () => {
    for (const s of STORIES) {
      expect(s.title.trim(), s.id).not.toBe('')
      expect(s.snippet.trim(), s.id).not.toBe('')
      expect(s.sampleEnglish?.title.trim(), s.id).toBeTruthy()
      expect(s.sampleEnglish?.snippet.trim(), s.id).toBeTruthy()
    }
  })
})

describe('story comprehension questions', () => {
  it('every story has at least one question', () => {
    for (const s of STORIES) {
      expect(STORY_QUESTIONS[s.id]?.length ?? 0, s.id).toBeGreaterThan(0)
    }
  })

  it('questions never point at a story that does not exist', () => {
    const storyIds = new Set(STORIES.map((s) => s.id))
    for (const id of Object.keys(STORY_QUESTIONS)) {
      expect(storyIds.has(id), id).toBe(true)
    }
  })

  it('every answer is one of its own options, and options are unique', () => {
    for (const [id, questions] of Object.entries(STORY_QUESTIONS)) {
      for (const q of questions) {
        expect(q.options, `${id}: ${q.question}`).toContain(q.answer)
        expect(new Set(q.options).size, `${id}: ${q.question}`).toBe(q.options.length)
      }
    }
  })
})
