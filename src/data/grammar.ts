import type { GrammarExercise } from '../types'

export const GRAMMAR_EXERCISES: GrammarExercise[] = [
  // Negation: tidak vs bukan
  {
    id: 'gr1',
    topic: 'Negation',
    sentence: 'Saya ___ suka makanan pedas',
    answer: 'tidak',
    distractors: ['bukan', 'jangan', 'belum'],
    translation: 'I do not like spicy food',
    explanation:
      'Use "tidak" to negate verbs and adjectives. "Bukan" negates nouns, "jangan" means don\'t (commands), and "belum" means not yet.',
  },
  {
    id: 'gr2',
    topic: 'Negation',
    sentence: 'Dia ___ orang Indonesia',
    answer: 'bukan',
    distractors: ['tidak', 'jangan', 'tanpa'],
    translation: 'He is not an Indonesian person',
    explanation:
      '"Bukan" negates nouns ("orang Indonesia" is a noun phrase). "Tidak" is only for verbs and adjectives.',
  },

  // Time/aspect markers
  {
    id: 'gr3',
    topic: 'Time markers',
    sentence: 'Saya ___ pergi ke Bali',
    answer: 'sudah',
    distractors: ['sedang', 'akan', 'masih'],
    translation: 'I have already gone to Bali',
    explanation:
      'Indonesian verbs never change form. Time is shown with markers: "sudah" = already, "sedang" = in progress, "akan" = will, "masih" = still.',
  },
  {
    id: 'gr4',
    topic: 'Time markers',
    sentence: 'Mereka ___ datang besok',
    answer: 'akan',
    distractors: ['sudah', 'sedang', 'kemarin'],
    translation: 'They will come tomorrow',
    explanation:
      '"Akan" marks the future — no verb conjugation needed. "Sudah" (already) and "sedang" (currently) would contradict "besok" (tomorrow).',
  },
  {
    id: 'gr5',
    topic: 'Time markers',
    sentence: 'Adik saya ___ tidur',
    answer: 'masih',
    distractors: ['sedang', 'sudah', 'akan'],
    translation: 'My younger sibling is still sleeping',
    explanation:
      '"Masih" = still (continuing state). "Sedang" also marks an ongoing action but doesn\'t carry the meaning of "still".',
  },

  // Prepositions di / ke / dari
  {
    id: 'gr6',
    topic: 'Prepositions',
    sentence: 'Ibu pergi ___ pasar',
    answer: 'ke',
    distractors: ['di', 'dari', 'pada'],
    translation: 'Mother goes to the market',
    explanation:
      'Three core prepositions: "ke" = to (direction), "di" = at/in (location), "dari" = from (origin).',
  },
  {
    id: 'gr7',
    topic: 'Prepositions',
    sentence: 'Ayah bekerja ___ kantor',
    answer: 'di',
    distractors: ['ke', 'dari', 'untuk'],
    translation: 'Father works at the office',
    explanation: '"Di" marks a static location (at/in). "Ke" would imply movement toward the office.',
  },
  {
    id: 'gr8',
    topic: 'Prepositions',
    sentence: 'Teman saya datang ___ Jakarta',
    answer: 'dari',
    distractors: ['di', 'ke', 'pada'],
    translation: 'My friend comes from Jakarta',
    explanation: '"Dari" marks origin (from). Movement toward would be "ke", location would be "di".',
  },

  // Possession
  {
    id: 'gr9',
    topic: 'Possession',
    sentence: 'Ini buku ___',
    answer: 'saya',
    distractors: ['kamu', 'dia', 'kami'],
    translation: 'This is my book',
    explanation:
      'Possession is just noun + owner: "buku saya" = my book. The owner always comes after the thing owned — no special possessive words.',
  },

  // Question words
  {
    id: 'gr10',
    topic: 'Question words',
    sentence: '___ nama kamu?',
    answer: 'Siapa',
    distractors: ['Apa', 'Di mana', 'Kapan'],
    translation: 'What is your name?',
    explanation:
      'A classic trap: Indonesian asks "Siapa nama kamu?" — literally "WHO is your name" — because names refer to people. "Apa" (what) is for things.',
  },
  {
    id: 'gr11',
    topic: 'Question words',
    sentence: 'Kamu tinggal ___?',
    answer: 'di mana',
    distractors: ['ke mana', 'dari mana', 'kapan'],
    translation: 'Where do you live?',
    explanation:
      '"Di mana" = where (location), "ke mana" = where to (direction), "dari mana" = where from. Living somewhere is a location, so "di mana".',
  },
  {
    id: 'gr12',
    topic: 'Question words',
    sentence: '___ harga tiket ini?',
    answer: 'Berapa',
    distractors: ['Apa', 'Siapa', 'Bagaimana'],
    translation: 'How much is this ticket?',
    explanation:
      '"Berapa" asks about numbers and amounts (price, age, quantity). "Bagaimana" = how (in what way), "apa" = what.',
  },

  // me- verbs
  {
    id: 'gr13',
    topic: 'me- verbs',
    sentence: 'Dia ___ buku di pasar',
    answer: 'membeli',
    distractors: ['membaca', 'menulis', 'melihat'],
    translation: 'She buys a book at the market',
    explanation:
      'Active verbs often take the "meN-" prefix: beli → membeli (buy). The prefix shape changes with the root\'s first letter (baca → membaca, tulis → menulis).',
  },
  {
    id: 'gr14',
    topic: 'me- verbs',
    sentence: 'Saya ___ surat untuk ibu',
    answer: 'menulis',
    distractors: ['membaca', 'menonton', 'membeli'],
    translation: 'I write a letter for mother',
    explanation:
      'Root "tulis" (write) + meN- → "menulis". With roots starting in t, the t drops: tulis → menulis, not "mentulis".',
  },

  // ber- verbs
  {
    id: 'gr15',
    topic: 'ber- verbs',
    sentence: 'Dia bisa ___ tiga bahasa',
    answer: 'berbicara',
    distractors: ['belajar', 'bekerja', 'membaca'],
    translation: 'She can speak three languages',
    explanation:
      'The "ber-" prefix forms verbs that don\'t take a direct object in the same way: berbicara (speak), bekerja (work), berjalan (walk).',
  },
  {
    id: 'gr16',
    topic: 'ber- verbs',
    sentence: 'Kami ___ di kafe besok',
    answer: 'bertemu',
    distractors: ['berbicara', 'bekerja', 'berjalan'],
    translation: 'We meet at the cafe tomorrow',
    explanation: 'Root "temu" + ber- → "bertemu" (to meet). Many social/reciprocal verbs use ber-.',
  },

  // Plural by reduplication
  {
    id: 'gr17',
    topic: 'Plurals',
    sentence: '___ di Bali sangat indah',
    answer: 'Pantai-pantai',
    distractors: ['Pantainya', 'Sepantai', 'Berpantai'],
    translation: 'The beaches in Bali are very beautiful',
    explanation:
      'Indonesian makes an explicit plural by doubling the noun: pantai-pantai = beaches. Often the plural is just left unmarked when context is clear.',
  },

  // yang
  {
    id: 'gr18',
    topic: 'yang',
    sentence: 'Saya suka rumah ___ besar',
    answer: 'yang',
    distractors: ['itu', 'ini', 'untuk'],
    translation: 'I like the house that is big',
    explanation:
      '"Yang" links a noun to its description, like "that/which/who": rumah yang besar = the house that is big. It\'s one of the most used words in Indonesian.',
  },

  // Classifiers
  {
    id: 'gr19',
    topic: 'Classifiers',
    sentence: 'Saya membeli dua ___ buku',
    answer: 'buah',
    distractors: ['orang', 'ekor', 'lembar'],
    translation: 'I buy two books',
    explanation:
      'Counting uses classifiers: "buah" for things (dua buah buku), "orang" for people, "ekor" for animals, "lembar" for sheets of paper.',
  },
  {
    id: 'gr20',
    topic: 'Classifiers',
    sentence: 'Ada tiga ___ guru di sekolah',
    answer: 'orang',
    distractors: ['buah', 'ekor', 'lembar'],
    translation: 'There are three teachers at the school',
    explanation: 'People are counted with "orang": tiga orang guru = three teachers. "Buah" is for objects.',
  },

  // Word order: adjectives follow nouns
  {
    id: 'gr21',
    topic: 'Word order',
    sentence: 'Dia punya mobil ___',
    answer: 'baru',
    distractors: ['yang', 'sangat', 'sekali'],
    translation: 'He has a new car',
    explanation:
      'Adjectives come AFTER the noun: mobil baru = new car (literally "car new"). "Sekali" (very) would follow an adjective, not a noun.',
  },
]
