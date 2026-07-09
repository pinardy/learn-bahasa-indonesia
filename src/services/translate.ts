const CACHE_KEY = 'bahasa-news-tx-cache'
const MAX_CACHE_ENTRIES = 400

type TxCache = Record<string, string>

function loadCache(): TxCache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') as TxCache
  } catch {
    return {}
  }
}

function saveCache(cache: TxCache) {
  const keys = Object.keys(cache)
  if (keys.length > MAX_CACHE_ENTRIES) {
    for (const key of keys.slice(0, keys.length - MAX_CACHE_ENTRIES)) {
      delete cache[key]
    }
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // storage full — drop the cache and carry on
    localStorage.removeItem(CACHE_KEY)
  }
}

/**
 * Translate Indonesian text to English using Google's free web endpoint.
 * Results are cached in localStorage so repeat lookups are instant/offline.
 */
export async function translateIdToEn(text: string): Promise<string> {
  const trimmed = text.trim()
  if (!trimmed) return ''

  const cache = loadCache()
  const cached = cache[trimmed]
  if (cached) return cached

  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=' +
    encodeURIComponent(trimmed)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Translation failed (${res.status})`)

  // Response shape: [[[translated, original, ...], ...], ...]
  const data = (await res.json()) as [Array<[string, string]> | null, ...unknown[]]
  const translated = (data[0] ?? [])
    .map((segment) => segment[0])
    .join('')
    .trim()
  if (!translated) throw new Error('Empty translation')

  cache[trimmed] = translated
  saveCache(cache)
  return translated
}
