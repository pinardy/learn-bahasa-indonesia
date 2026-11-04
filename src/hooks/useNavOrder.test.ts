import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadNavOrder } from './useNavOrder'
import { STORAGE_KEYS } from '../storage'

const DEFAULT = ['home', 'a', 'b', 'c'] as const

describe('loadNavOrder', () => {
  let store: Record<string, string>
  beforeEach(() => {
    store = {}
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => void (store[k] = v),
      removeItem: (k: string) => void delete store[k],
    })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('falls back to the default order', () => {
    expect(loadNavOrder(DEFAULT)).toEqual(['home', 'a', 'b', 'c'])
  })

  it('restores a saved order, dropping unknown tabs and appending new ones', () => {
    store[STORAGE_KEYS.navOrder] = JSON.stringify(['c', 'gone', 'a'])
    expect(loadNavOrder(DEFAULT)).toEqual(['c', 'a', 'home', 'b'])
  })

  it('migrates legacy pinned tabs to the front', () => {
    store[STORAGE_KEYS.pinned] = JSON.stringify(['b'])
    expect(loadNavOrder(DEFAULT)).toEqual(['b', 'home', 'a', 'c'])
  })

  it('survives corrupted storage', () => {
    store[STORAGE_KEYS.navOrder] = '{not json'
    expect(loadNavOrder(DEFAULT)).toEqual(['home', 'a', 'b', 'c'])
  })
})
