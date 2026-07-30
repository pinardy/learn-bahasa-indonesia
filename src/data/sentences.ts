import type { Sentence } from '../types'

// IDs are stored in saved progress — never renumber existing entries.
export const SENTENCES: Sentence[] = [
  // Level 1 — short sentences
  { id: 's16', indonesian: 'Saya lapar sekali', english: 'I am very hungry', level: 1 },
  { id: 's17', indonesian: 'Air ini dingin', english: 'This water is cold', level: 1 },
  { id: 's18', indonesian: 'Dia teman saya', english: 'He is my friend', level: 1 },
  { id: 's3', indonesian: 'Kami belajar bahasa Indonesia', english: 'We are learning Indonesian', level: 1 },
  { id: 's5', indonesian: 'Hari ini sangat panas', english: 'Today is very hot', level: 1 },
  { id: 's6', indonesian: 'Saya mau minum kopi', english: 'I want to drink coffee', level: 1 },
  { id: 's8', indonesian: 'Pantai ini sangat cantik', english: 'This beach is very beautiful', level: 1 },
  { id: 's9', indonesian: 'Mereka tidur di hotel', english: 'They sleep at the hotel', level: 1 },
  { id: 's10', indonesian: 'Kamu bekerja di mana', english: 'Where do you work', level: 1 },
  { id: 's11', indonesian: 'Makanan ini enak sekali', english: 'This food is very delicious', level: 1 },

  // Level 2 — medium sentences
  { id: 's1', indonesian: 'Saya suka makan nasi goreng', english: 'I like to eat fried rice', level: 2 },
  { id: 's2', indonesian: 'Dia pergi ke pasar setiap hari', english: 'She goes to the market every day', level: 2 },
  { id: 's4', indonesian: 'Ibu saya membeli buah di pasar', english: 'My mother buys fruit at the market', level: 2 },
  { id: 's7', indonesian: 'Teman saya datang dari Jakarta', english: 'My friend comes from Jakarta', level: 2 },
  { id: 's12', indonesian: 'Saya membaca buku setiap malam', english: 'I read a book every night', level: 2 },
  { id: 's13', indonesian: 'Besok kita pergi ke pantai', english: 'Tomorrow we go to the beach', level: 2 },
  { id: 's14', indonesian: 'Adik saya suka minum teh manis', english: 'My younger sibling likes to drink sweet tea', level: 2 },
  { id: 's15', indonesian: 'Rumah dia dekat dari sini', english: 'Her house is near from here', level: 2 },
  { id: 's19', indonesian: 'Ayah saya bekerja di kota', english: 'My father works in the city', level: 2 },
  { id: 's20', indonesian: 'Kami minum kopi setiap pagi', english: 'We drink coffee every morning', level: 2 },

  // Level 3 — longer sentences
  { id: 's21', indonesian: 'Ibu saya pergi ke pasar besok pagi', english: 'My mother goes to the market tomorrow morning', level: 3 },
  { id: 's22', indonesian: 'Kami makan malam di rumah teman kami', english: 'We eat dinner at the house of our friend', level: 3 },
  { id: 's23', indonesian: 'Ayah saya bekerja di kantor yang besar', english: 'My father works in a big office', level: 3 },
  { id: 's24', indonesian: 'Dia menulis surat untuk ibunya setiap minggu', english: 'She writes a letter for her mother every week', level: 3 },
  { id: 's25', indonesian: 'Anak itu membaca buku di bawah pohon', english: 'That child reads a book under a tree', level: 3 },
  { id: 's26', indonesian: 'Saya harus pergi ke bandara sekarang juga', english: 'I must go to the airport right now', level: 3 },
  { id: 's27', indonesian: 'Mereka mau pergi ke gunung minggu depan', english: 'They want to go to the mountain next week', level: 3 },
  { id: 's28', indonesian: 'Teman saya suka minum kopi tanpa gula', english: 'My friend likes to drink coffee without sugar', level: 3 },
  { id: 's29', indonesian: 'Kami menonton film bagus di kota kemarin', english: 'We watched a good movie in the city yesterday', level: 3 },
  { id: 's30', indonesian: 'Cuaca hari ini lebih dingin dari kemarin', english: 'The weather today is colder than yesterday', level: 3 },

  // Level 4 — joined sentences with conjunctions (karena, tetapi, kalau, dan, atau)
  { id: 's31', indonesian: 'Saya minum teh karena kopi sudah habis', english: 'I drink tea because the coffee is finished', level: 4 },
  { id: 's32', indonesian: 'Dia mau datang tetapi hari ini hujan', english: 'He wants to come but today it is raining', level: 4 },
  { id: 's33', indonesian: 'Kalau hujan kita tidak pergi ke pantai', english: 'If it rains we do not go to the beach', level: 4 },
  { id: 's34', indonesian: 'Saya suka kopi dan adik saya suka teh', english: 'I like coffee and my younger sibling likes tea', level: 4 },
  { id: 's35', indonesian: 'Kamu mau makan di rumah atau di restoran', english: 'Do you want to eat at home or at a restaurant', level: 4 },
  { id: 's36', indonesian: 'Ibu pergi ke pasar karena tidak ada sayur', english: 'Mother goes to the market because there are no vegetables', level: 4 },
  { id: 's37', indonesian: 'Saya lelah tetapi saya harus bekerja', english: 'I am tired but I have to work', level: 4 },
  { id: 's38', indonesian: 'Kami belajar bahasa Indonesia karena kami suka Indonesia', english: 'We learn Indonesian because we like Indonesia', level: 4 },
  { id: 's39', indonesian: 'Kalau kamu lapar kamu bisa makan nasi goreng', english: 'If you are hungry you can eat fried rice', level: 4 },
  { id: 's40', indonesian: 'Dia tidak datang karena anaknya sakit', english: 'He does not come because his child is sick', level: 4 },
]
