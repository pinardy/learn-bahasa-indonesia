export interface LessonExample {
  id: string
  en: string
}

export interface GrammarLesson {
  /** Must match the exercise topics exactly so per-topic accuracy lines up */
  topic: string
  emoji: string
  summary: string
  examples: LessonExample[]
}

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    topic: 'Word order',
    emoji: '🔀',
    summary:
      'Sentences follow subject–verb–object like English, but adjectives and owners come AFTER the noun: "car new" not "new car", "house my" not "my house".',
    examples: [
      { id: 'mobil baru', en: 'a new car (lit. "car new")' },
      { id: 'rumah saya', en: 'my house (lit. "house my")' },
      { id: 'Saya minum kopi panas.', en: 'I drink hot coffee.' },
    ],
  },
  {
    topic: 'Negation',
    emoji: '🚫',
    summary:
      'Two words for "not": tidak negates verbs and adjectives, bukan negates nouns. jangan means "don\'t!" (commands) and belum means "not yet".',
    examples: [
      { id: 'Saya tidak lapar.', en: 'I am not hungry. (adjective → tidak)' },
      { id: 'Dia bukan guru.', en: 'He is not a teacher. (noun → bukan)' },
      { id: 'Saya belum makan.', en: "I haven't eaten yet." },
    ],
  },
  {
    topic: 'Time markers',
    emoji: '⏳',
    summary:
      'Verbs never change form. Time is shown with little markers before the verb: sudah = already, sedang = right now, akan = will, masih = still.',
    examples: [
      { id: 'Saya sudah makan.', en: 'I have already eaten.' },
      { id: 'Dia sedang tidur.', en: 'She is sleeping (right now).' },
      { id: 'Kami akan pergi besok.', en: 'We will go tomorrow.' },
    ],
  },
  {
    topic: 'Prepositions',
    emoji: '📍',
    summary:
      'Three tiny words cover most location needs: di = at/in (location), ke = to (direction), dari = from (origin).',
    examples: [
      { id: 'Saya di rumah.', en: 'I am at home.' },
      { id: 'Kami pergi ke pasar.', en: 'We go to the market.' },
      { id: 'Dia datang dari Bali.', en: 'He comes from Bali.' },
    ],
  },
  {
    topic: 'Possession',
    emoji: '🤝',
    summary:
      'To say who owns something, just put the owner after the thing: buku saya = my book. No special words like "my/your/his" needed.',
    examples: [
      { id: 'buku saya', en: 'my book' },
      { id: 'rumah teman saya', en: "my friend's house (house-friend-my)" },
      { id: 'Ini tas kamu.', en: 'This is your bag.' },
    ],
  },
  {
    topic: 'Question words',
    emoji: '❓',
    summary:
      'apa = what, siapa = who, kapan = when, di mana = where, mengapa = why, bagaimana = how, berapa = how much/many. Fun trap: names use siapa — "Siapa nama kamu?" is literally "WHO is your name?"',
    examples: [
      { id: 'Siapa nama kamu?', en: 'What is your name?' },
      { id: 'Berapa harganya?', en: 'How much does it cost?' },
      { id: 'Kamu tinggal di mana?', en: 'Where do you live?' },
    ],
  },
  {
    topic: 'me- verbs',
    emoji: '⚡',
    summary:
      'Active verbs usually take the meN- prefix, whose sound adapts to the root: beli → membeli, tulis → menulis (t drops), baca → membaca. In casual speech the prefix is often dropped.',
    examples: [
      { id: 'Saya membeli nasi.', en: 'I buy rice. (beli → membeli)' },
      { id: 'Dia menulis surat.', en: 'She writes a letter. (tulis → menulis)' },
      { id: 'Kami membaca buku.', en: 'We read books. (baca → membaca)' },
    ],
  },
  {
    topic: 'ber- verbs',
    emoji: '🏃',
    summary:
      'ber- forms verbs that don\'t take a direct object — activities and states: bekerja = work, berjalan = walk, berbicara = speak, bermain = play.',
    examples: [
      { id: 'Ayah bekerja di kantor.', en: 'Father works at the office.' },
      { id: 'Kami berjalan ke sekolah.', en: 'We walk to school.' },
      { id: 'Dia bisa berbicara tiga bahasa.', en: 'She can speak three languages.' },
    ],
  },
  {
    topic: 'Affixes',
    emoji: '🔧',
    summary:
      'One root grows a whole word family: ajar (teach) → mengajar (to teach), belajar (to study), pelajar (student), pelajaran (a lesson). Key patterns: meN- active, di- passive, pe- the doer, -an the thing, ter- most/accidentally.',
    examples: [
      { id: 'menjual / dijual / penjual', en: 'to sell / sold / seller (root: jual)' },
      { id: 'makanan, minuman', en: 'food, drinks (root + -an = the thing)' },
      { id: 'terbesar, tertidur', en: 'the biggest; fell asleep (ter-)' },
    ],
  },
  {
    topic: 'Plurals',
    emoji: '👯',
    summary:
      'Plurals are usually left unmarked when context is clear. To be explicit, double the noun: anak-anak = children, buku-buku = books.',
    examples: [
      { id: 'Anak-anak bermain di taman.', en: 'The children play in the park.' },
      { id: 'dua buku', en: 'two books (no doubling after a number)' },
      { id: 'orang-orang', en: 'people' },
    ],
  },
  {
    topic: 'yang',
    emoji: '🔗',
    summary:
      'yang links a noun to its description, like "that/which/who". It also builds "the ___ one": yang merah = the red one. One of the most used words in the language.',
    examples: [
      { id: 'rumah yang besar', en: 'the house that is big' },
      { id: 'orang yang bekerja di bank', en: 'the person who works at the bank' },
      { id: 'Saya mau yang manis.', en: 'I want the sweet one.' },
    ],
  },
  {
    topic: 'Classifiers',
    emoji: '🔢',
    summary:
      'Counting often uses a measure word: orang for people, ekor for animals, buah for things. Casual speech frequently skips them.',
    examples: [
      { id: 'tiga orang guru', en: 'three teachers' },
      { id: 'dua ekor kucing', en: 'two cats' },
      { id: 'lima buah apel', en: 'five apples' },
    ],
  },
]
