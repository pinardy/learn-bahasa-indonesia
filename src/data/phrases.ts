export interface Phrase {
  indonesian: string
  english: string
}

export interface Scenario {
  id: string
  name: string
  emoji: string
  phrases: Phrase[]
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'basics',
    name: 'Basics',
    emoji: '🙏',
    phrases: [
      { indonesian: 'Ya / Tidak', english: 'Yes / No' },
      { indonesian: 'Tolong', english: 'Please (asking for help)' },
      { indonesian: 'Terima kasih banyak', english: 'Thank you very much' },
      { indonesian: 'Sama-sama', english: "You're welcome" },
      { indonesian: 'Permisi', english: 'Excuse me' },
      { indonesian: 'Maaf, saya tidak mengerti', english: "Sorry, I don't understand" },
      { indonesian: 'Bisa bicara pelan-pelan?', english: 'Can you speak slowly?' },
      { indonesian: 'Saya sedang belajar bahasa Indonesia', english: "I'm learning Indonesian" },
    ],
  },
  {
    id: 'meeting',
    name: 'Meeting People',
    emoji: '🤝',
    phrases: [
      { indonesian: 'Siapa nama kamu?', english: 'What is your name?' },
      { indonesian: 'Nama saya…', english: 'My name is…' },
      { indonesian: 'Apa kabar?', english: 'How are you?' },
      { indonesian: 'Baik-baik saja', english: "I'm fine" },
      { indonesian: 'Senang bertemu dengan Anda', english: 'Nice to meet you' },
      { indonesian: 'Saya dari…', english: "I'm from…" },
      { indonesian: 'Sampai jumpa lagi', english: 'See you again' },
    ],
  },
  {
    id: 'restaurant',
    name: 'At a Restaurant',
    emoji: '🍽️',
    phrases: [
      { indonesian: 'Minta menu, ya', english: 'The menu, please' },
      { indonesian: 'Saya mau pesan ini', english: 'I would like to order this' },
      { indonesian: 'Tidak pedas, ya', english: 'Not spicy, please' },
      { indonesian: 'Minta air putih', english: 'Water, please' },
      { indonesian: 'Saya vegetarian', english: "I'm vegetarian" },
      { indonesian: 'Enak sekali!', english: 'Very delicious!' },
      { indonesian: 'Minta bon, ya', english: 'The bill, please' },
      { indonesian: 'Berapa semuanya?', english: 'How much altogether?' },
    ],
  },
  {
    id: 'directions',
    name: 'Asking Directions',
    emoji: '🧭',
    phrases: [
      { indonesian: 'Di mana kamar kecil?', english: 'Where is the restroom?' },
      { indonesian: 'Bagaimana cara ke sana?', english: 'How do I get there?' },
      { indonesian: 'Belok kiri', english: 'Turn left' },
      { indonesian: 'Belok kanan', english: 'Turn right' },
      { indonesian: 'Lurus saja', english: 'Go straight' },
      { indonesian: 'Dekat atau jauh?', english: 'Is it near or far?' },
      { indonesian: 'Saya tersesat', english: "I'm lost" },
    ],
  },
  {
    id: 'shopping',
    name: 'Shopping',
    emoji: '🛍️',
    phrases: [
      { indonesian: 'Berapa harganya?', english: 'How much is it?' },
      { indonesian: 'Terlalu mahal!', english: 'Too expensive!' },
      { indonesian: 'Boleh kurang?', english: 'Can you lower the price?' },
      { indonesian: 'Saya mau beli ini', english: 'I want to buy this' },
      { indonesian: 'Boleh saya lihat?', english: 'May I see it?' },
      { indonesian: 'Saya cuma lihat-lihat', english: "I'm just looking" },
    ],
  },
  {
    id: 'transport',
    name: 'Getting Around',
    emoji: '🚕',
    phrases: [
      { indonesian: 'Ke bandara, ya', english: 'To the airport, please' },
      { indonesian: 'Berhenti di sini', english: 'Stop here' },
      { indonesian: 'Berapa lama perjalanannya?', english: 'How long is the trip?' },
      { indonesian: 'Jam berapa berangkat?', english: 'What time does it leave?' },
      { indonesian: 'Satu tiket ke Bandung', english: 'One ticket to Bandung' },
    ],
  },
  {
    id: 'hotel',
    name: 'At the Hotel',
    emoji: '🏨',
    phrases: [
      { indonesian: 'Saya sudah pesan kamar', english: 'I have a reservation' },
      { indonesian: 'Ada kamar kosong?', english: 'Is there a room available?' },
      { indonesian: 'Untuk dua malam', english: 'For two nights' },
      { indonesian: 'Boleh minta handuk?', english: 'Could I have a towel?' },
      { indonesian: 'Jam berapa check-out?', english: 'What time is check-out?' },
    ],
  },
  {
    id: 'emergency',
    name: 'Emergencies',
    emoji: '🚨',
    phrases: [
      { indonesian: 'Tolong!', english: 'Help!' },
      { indonesian: 'Panggil dokter!', english: 'Call a doctor!' },
      { indonesian: 'Saya sakit', english: "I'm sick" },
      { indonesian: 'Saya butuh bantuan', english: 'I need help' },
      { indonesian: 'Hati-hati!', english: 'Be careful!' },
      { indonesian: 'Di mana rumah sakit terdekat?', english: 'Where is the nearest hospital?' },
    ],
  },
]
