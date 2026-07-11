import { describe, expect, it } from 'vitest'
import { formatClock, numberToIndonesian, timeToIndonesian } from './numbers'

describe('numberToIndonesian', () => {
  it('handles zero and single digits', () => {
    expect(numberToIndonesian(0)).toBe('nol')
    expect(numberToIndonesian(1)).toBe('satu')
    expect(numberToIndonesian(9)).toBe('sembilan')
  })

  it('uses the irregular se- forms (sepuluh, sebelas, seratus, seribu)', () => {
    expect(numberToIndonesian(10)).toBe('sepuluh')
    expect(numberToIndonesian(11)).toBe('sebelas')
    expect(numberToIndonesian(100)).toBe('seratus')
    expect(numberToIndonesian(1000)).toBe('seribu')
  })

  it('builds teens with belas and tens with puluh', () => {
    expect(numberToIndonesian(12)).toBe('dua belas')
    expect(numberToIndonesian(17)).toBe('tujuh belas')
    expect(numberToIndonesian(20)).toBe('dua puluh')
    expect(numberToIndonesian(21)).toBe('dua puluh satu')
    expect(numberToIndonesian(99)).toBe('sembilan puluh sembilan')
  })

  it('builds hundreds and thousands compositionally', () => {
    expect(numberToIndonesian(101)).toBe('seratus satu')
    expect(numberToIndonesian(250)).toBe('dua ratus lima puluh')
    expect(numberToIndonesian(999)).toBe('sembilan ratus sembilan puluh sembilan')
    expect(numberToIndonesian(1500)).toBe('seribu lima ratus')
    expect(numberToIndonesian(2026)).toBe('dua ribu dua puluh enam')
    expect(numberToIndonesian(12345)).toBe('dua belas ribu tiga ratus empat puluh lima')
    expect(numberToIndonesian(999999)).toBe(
      'sembilan ratus sembilan puluh sembilan ribu sembilan ratus sembilan puluh sembilan'
    )
  })
})

describe('timeToIndonesian', () => {
  it('says whole hours plainly', () => {
    expect(timeToIndonesian(7, 0)).toBe('jam tujuh')
  })

  it('uses lewat/kurang seperempat for quarter past and quarter to', () => {
    expect(timeToIndonesian(7, 15)).toBe('jam tujuh lewat seperempat')
    expect(timeToIndonesian(7, 45)).toBe('jam delapan kurang seperempat')
  })

  it('expresses half past as setengah of the NEXT hour', () => {
    expect(timeToIndonesian(7, 30)).toBe('jam setengah delapan')
    // 12:30 wraps to "half one", not "half thirteen"
    expect(timeToIndonesian(12, 30)).toBe('jam setengah satu')
  })

  it('uses lewat below the half hour and kurang above it', () => {
    expect(timeToIndonesian(7, 10)).toBe('jam tujuh lewat sepuluh')
    expect(timeToIndonesian(7, 50)).toBe('jam delapan kurang sepuluh')
  })
})

describe('formatClock', () => {
  it('zero-pads minutes only', () => {
    expect(formatClock(7, 5)).toBe('7:05')
    expect(formatClock(12, 30)).toBe('12:30')
  })
})
