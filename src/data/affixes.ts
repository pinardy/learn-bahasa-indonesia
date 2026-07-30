export interface AffixExercise {
  root: string
  rootMeaning: string
  /** Indonesian sentence containing exactly one ___ blank */
  sentence: string
  answer: string
  distractors: string[]
  translation: string
  explanation: string
}

// Drills for the affix system: pick the correctly affixed form of the root.
export const AFFIX_EXERCISES: AffixExercise[] = [
  {
    root: 'beli',
    rootMeaning: 'buy',
    sentence: 'Saya ___ buku di toko.',
    answer: 'membeli',
    distractors: ['dibeli', 'pembeli', 'belian'],
    translation: 'I buy a book at the shop.',
    explanation:
      'meN- makes the active verb: membeli = to buy. dibeli is the passive (was bought), pembeli is the person who buys.',
  },
  {
    root: 'beli',
    rootMeaning: 'buy',
    sentence: 'Buku itu ___ oleh ayah.',
    answer: 'dibeli',
    distractors: ['membeli', 'pembeli', 'terbeli'],
    translation: 'That book was bought by father.',
    explanation: 'di- makes the passive: dibeli = was bought. The doer follows with "oleh".',
  },
  {
    root: 'kerja',
    rootMeaning: 'work',
    sentence: 'Ibu saya ___ di rumah sakit.',
    answer: 'bekerja',
    distractors: ['mengerja', 'pekerja', 'kerjaan'],
    translation: 'My mother works at the hospital.',
    explanation: 'ber- forms verbs with no object: bekerja = to work. pekerja = a worker (person).',
  },
  {
    root: 'kerja',
    rootMeaning: 'work',
    sentence: 'Para ___ makan siang di warung.',
    answer: 'pekerja',
    distractors: ['bekerja', 'dikerja', 'kerja'],
    translation: 'The workers eat lunch at the food stall.',
    explanation: 'pe- names the doer: pekerja = worker. "Para" marks a group of people.',
  },
  {
    root: 'ajar',
    rootMeaning: 'teach / learn',
    sentence: 'Guru itu ___ matematika.',
    answer: 'mengajar',
    distractors: ['belajar', 'pelajar', 'diajar'],
    translation: 'That teacher teaches mathematics.',
    explanation:
      'meN- + ajar = mengajar (to teach). belajar = to study, pelajar = a student — all from one root!',
  },
  {
    root: 'ajar',
    rootMeaning: 'teach / learn',
    sentence: 'Saya ___ bahasa Indonesia setiap hari.',
    answer: 'belajar',
    distractors: ['mengajar', 'diajar', 'pengajar'],
    translation: 'I study Indonesian every day.',
    explanation: 'belajar (an irregular ber- form of ajar) = to study or learn.',
  },
  {
    root: 'tulis',
    rootMeaning: 'write',
    sentence: 'Surat itu ___ minggu lalu.',
    answer: 'ditulis',
    distractors: ['menulis', 'penulis', 'tertulis'],
    translation: 'That letter was written last week.',
    explanation: 'di- passive: ditulis = was written. menulis is active, penulis is the writer.',
  },
  {
    root: 'tulis',
    rootMeaning: 'write',
    sentence: 'Dia ___ buku anak-anak.',
    answer: 'penulis',
    distractors: ['menulis', 'ditulis', 'tulisan'],
    translation: 'She is a writer of children’s books.',
    explanation:
      'peN- names the doer: penulis = writer. (With menulis the sentence would need a different meaning: "she writes children’s books".)',
  },
  {
    root: 'jual',
    rootMeaning: 'sell',
    sentence: 'Bu Tini ___ nasi goreng.',
    answer: 'menjual',
    distractors: ['dijual', 'penjual', 'terjual'],
    translation: 'Bu Tini sells fried rice.',
    explanation: 'meN- active: menjual = to sell. penjual = seller, dijual = is/was sold.',
  },
  {
    root: 'jual',
    rootMeaning: 'sell',
    sentence: 'Rumah itu sudah ___.',
    answer: 'dijual',
    distractors: ['menjual', 'penjual', 'jualan'],
    translation: 'That house is already sold.',
    explanation: 'di- passive: dijual. You’ll see "DIJUAL" on for-sale signs everywhere in Indonesia.',
  },
  {
    root: 'makan',
    rootMeaning: 'eat',
    sentence: '___ Indonesia pedas tapi enak.',
    answer: 'Makanan',
    distractors: ['Memakan', 'Dimakan', 'Pemakan'],
    translation: 'Indonesian food is spicy but delicious.',
    explanation: '-an turns a verb into a thing: makanan = food (that which is eaten).',
  },
  {
    root: 'minum',
    rootMeaning: 'drink',
    sentence: 'Es teh manis adalah ___ favorit saya.',
    answer: 'minuman',
    distractors: ['meminum', 'diminum', 'peminum'],
    translation: 'Sweet iced tea is my favourite drink.',
    explanation: '-an noun: minuman = a drink (the thing drunk).',
  },
  {
    root: 'besar',
    rootMeaning: 'big',
    sentence: 'Jakarta adalah kota ___ di Indonesia.',
    answer: 'terbesar',
    distractors: ['membesar', 'besaran', 'dibesar'],
    translation: 'Jakarta is the biggest city in Indonesia.',
    explanation: 'ter- + adjective = superlative: terbesar = the biggest, tertinggi = the tallest.',
  },
  {
    root: 'tidur',
    rootMeaning: 'sleep',
    sentence: 'Dia ___ di kelas karena lelah.',
    answer: 'tertidur',
    distractors: ['meniduri', 'ditidur', 'penidur'],
    translation: 'He fell asleep in class because he was tired.',
    explanation:
      'ter- can also mean accidental/unintentional: tertidur = fell asleep (without meaning to).',
  },
  {
    root: 'jalan',
    rootMeaning: 'walk / road',
    sentence: 'Kami ___ di pantai sore ini.',
    answer: 'berjalan',
    distractors: ['menjalan', 'dijalan', 'terjalan'],
    translation: 'We walk on the beach this afternoon.',
    explanation:
      'ber-: berjalan = to walk. Doubled, berjalan-jalan = to stroll around for fun — very common!',
  },
  {
    root: 'main',
    rootMeaning: 'play',
    sentence: 'Anak-anak ___ di taman.',
    answer: 'bermain',
    distractors: ['memain', 'dimain', 'pemain'],
    translation: 'The children play in the park.',
    explanation: 'ber-: bermain = to play. pemain = a player (of a game, instrument, or team).',
  },
]
