import type { NewsArticle } from '../types'

const API_BASE = 'https://berita-indo-api-next.vercel.app/api'

export interface NewsSource {
  id: string
  name: string
  emoji: string
  path: string
}

export const NEWS_SOURCES: NewsSource[] = [
  { id: 'cnn', name: 'CNN Indonesia', emoji: '🗞️', path: 'cnn-news' },
  { id: 'antara', name: 'Antara', emoji: '📡', path: 'antara-news/terkini' },
  { id: 'cnbc', name: 'CNBC Indonesia', emoji: '💹', path: 'cnbc-news' },
  { id: 'tempo', name: 'Tempo', emoji: '📰', path: 'tempo-news/nasional' },
  { id: 'republika', name: 'Republika', emoji: '🗒️', path: 'republika-news' },
]

interface ApiArticle {
  title?: string
  link?: string
  contentSnippet?: string
  description?: string
  isoDate?: string
  image?: string | { small?: string; large?: string }
}

interface ApiResponse {
  data?: ApiArticle[]
}

const MAX_ARTICLES = 20

export async function fetchNews(source: NewsSource): Promise<NewsArticle[]> {
  const res = await fetch(`${API_BASE}/${source.path}`)
  if (!res.ok) throw new Error(`News request failed (${res.status})`)
  const json = (await res.json()) as ApiResponse
  const items = json.data ?? []

  return items
    .filter((item) => item.title && item.link)
    .slice(0, MAX_ARTICLES)
    .map((item, i) => ({
      id: `${source.id}-${i}-${item.link}`,
      title: item.title!.trim(),
      snippet: (item.contentSnippet ?? item.description ?? '').trim(),
      link: item.link!,
      image:
        typeof item.image === 'string'
          ? item.image
          : item.image?.small ?? item.image?.large,
      date: item.isoDate,
    }))
}

/**
 * Bundled bilingual articles shown when the news API is unreachable,
 * so the News tab still works offline.
 */
export const SAMPLE_ARTICLES: NewsArticle[] = [
  {
    id: 'sample-1',
    title: 'Wisatawan asing semakin tertarik mengunjungi desa-desa di Bali',
    snippet:
      'Desa-desa tradisional di Bali menarik semakin banyak wisatawan asing yang ingin merasakan budaya lokal. Mereka belajar menari, memasak makanan khas, dan mengikuti upacara adat bersama penduduk desa.',
    link: 'https://www.indonesia.travel',
    sampleEnglish: {
      title: 'Foreign tourists increasingly interested in visiting villages in Bali',
      snippet:
        'Traditional villages in Bali are attracting more and more foreign tourists who want to experience local culture. They learn to dance, cook traditional food, and join traditional ceremonies with the villagers.',
    },
  },
  {
    id: 'sample-2',
    title: 'Harga kopi Indonesia naik karena permintaan dunia meningkat',
    snippet:
      'Petani kopi di Sumatera dan Jawa menikmati harga yang lebih tinggi tahun ini. Permintaan kopi Indonesia dari luar negeri terus meningkat, terutama dari Eropa dan Amerika Serikat.',
    link: 'https://www.antaranews.com',
    sampleEnglish: {
      title: 'Indonesian coffee prices rise as world demand increases',
      snippet:
        'Coffee farmers in Sumatra and Java are enjoying higher prices this year. Demand for Indonesian coffee from abroad continues to increase, especially from Europe and the United States.',
    },
  },
  {
    id: 'sample-3',
    title: 'Pemerintah membangun jalur kereta baru di Sulawesi',
    snippet:
      'Proyek kereta api baru akan menghubungkan beberapa kota besar di Sulawesi. Pemerintah berharap proyek ini selesai dalam lima tahun dan dapat membantu ekonomi daerah.',
    link: 'https://www.kemenhub.go.id',
    sampleEnglish: {
      title: 'Government builds new railway line in Sulawesi',
      snippet:
        'A new railway project will connect several major cities in Sulawesi. The government hopes the project will be finished within five years and can help the regional economy.',
    },
  },
  {
    id: 'sample-4',
    title: 'Tim nasional sepak bola Indonesia menang dua kali berturut-turut',
    snippet:
      'Tim nasional Indonesia menunjukkan permainan yang bagus bulan ini. Para pemain muda memberikan harapan baru untuk masa depan sepak bola Indonesia.',
    link: 'https://www.pssi.org',
    sampleEnglish: {
      title: 'Indonesian national football team wins twice in a row',
      snippet:
        'The Indonesian national team showed good play this month. The young players are giving new hope for the future of Indonesian football.',
    },
  },
]
