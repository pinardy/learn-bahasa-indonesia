import type { NewsArticle } from '../types'

/**
 * Hand-written beginner stories, deliberately built from taught vocabulary.
 * Shaped as pre-translated articles so the whole News reading experience
 * (tap-a-word, save words, highlighting, readability score) applies.
 */
export const STORIES: NewsArticle[] = [
  {
    id: 'story-1',
    title: 'Hari pertama di Jakarta',
    snippet:
      'Saya datang ke Jakarta kemarin. Kota ini besar dan panas sekali. Pagi ini saya minum kopi dan makan nasi goreng. Kopi di sini enak dan murah. Setelah itu, saya pergi ke pasar dekat hotel. Di pasar, saya membeli buah dan air. Orang-orang di Jakarta ramah. Saya senang sekali.',
    link: '',
    sampleEnglish: {
      title: 'First day in Jakarta',
      snippet:
        'I arrived in Jakarta yesterday. This city is big and very hot. This morning I drank coffee and ate fried rice. The coffee here is delicious and cheap. After that, I went to the market near the hotel. At the market, I bought fruit and water. The people in Jakarta are friendly. I am very happy.',
    },
  },
  {
    id: 'story-2',
    title: 'Keluarga saya',
    snippet:
      'Nama saya Sari. Keluarga saya tidak besar. Ayah saya seorang guru dan ibu saya bekerja di rumah sakit. Kakak saya suka membaca buku, dan adik saya suka bermain dengan kucing kami. Setiap malam, kami makan malam bersama. Hari Minggu, kami pergi ke taman. Saya sayang keluarga saya.',
    link: '',
    sampleEnglish: {
      title: 'My family',
      snippet:
        'My name is Sari. My family is not big. My father is a teacher and my mother works at a hospital. My older sibling likes to read books, and my younger sibling likes to play with our cat. Every evening, we have dinner together. On Sundays, we go to the park. I love my family.',
    },
  },
  {
    id: 'story-3',
    title: 'Liburan di pantai',
    snippet:
      'Minggu depan kami pergi ke Bali. Kami mau berenang di pantai dan melihat matahari terbenam. Pantai di Bali cantik sekali. Ombaknya besar, tetapi airnya hangat. Adik saya mau makan ikan bakar. Ibu mau membeli baju baru di pasar. Kami akan tinggal di hotel kecil dekat pantai untuk tiga malam.',
    link: '',
    sampleEnglish: {
      title: 'Holiday at the beach',
      snippet:
        'Next week we are going to Bali. We want to swim at the beach and watch the sunset. The beaches in Bali are very beautiful. The waves are big, but the water is warm. My younger sibling wants to eat grilled fish. Mother wants to buy new clothes at the market. We will stay in a small hotel near the beach for three nights.',
    },
  },
  {
    id: 'story-4',
    title: 'Kucing saya hilang',
    snippet:
      'Kemarin kucing saya hilang. Saya mencari di rumah, di taman, dan di jalan. Saya bertanya kepada teman saya: “Kamu melihat kucing kecil hitam?” Dia berkata tidak. Saya sedih sekali. Tetapi malam ini, saya mendengar suara di dapur. Kucing saya ada di bawah meja! Dia lapar dan mau makan ikan. Sekarang saya senang.',
    link: '',
    sampleEnglish: {
      title: 'My cat went missing',
      snippet:
        'Yesterday my cat went missing. I searched in the house, in the park, and on the street. I asked my friend: "Have you seen a small black cat?" He said no. I was very sad. But tonight, I heard a sound in the kitchen. My cat was under the table! He was hungry and wanted to eat fish. Now I am happy.',
    },
  },
  {
    id: 'story-5',
    title: 'Di warung Bu Tini',
    snippet:
      'Dekat kantor saya ada warung kecil. Setiap siang, saya makan di sana. Bu Tini, pemilik warung, memasak ayam goreng yang enak sekali. Hari ini saya pesan ayam goreng, sayur, dan es teh manis. Semuanya lima belas ribu rupiah — murah sekali! “Terima kasih, Bu,” kata saya. “Sama-sama. Sampai besok!” kata Bu Tini.',
    link: '',
    sampleEnglish: {
      title: "At Bu Tini's food stall",
      snippet:
        'Near my office there is a small food stall. Every midday, I eat there. Bu Tini, the owner of the stall, cooks very delicious fried chicken. Today I ordered fried chicken, vegetables, and sweet iced tea. Everything was fifteen thousand rupiah — very cheap! "Thank you, ma\'am," I said. "You\'re welcome. See you tomorrow!" said Bu Tini.',
    },
  },
  {
    id: 'story-6',
    title: 'Belajar bahasa Indonesia',
    snippet:
      'Saya belajar bahasa Indonesia setiap hari. Pagi ini saya belajar sepuluh kata baru. Bahasa Indonesia tidak terlalu sulit, tetapi saya masih sering lupa. Teman saya, Budi, membantu saya. Dia berkata, “Pelan-pelan saja. Kamu pasti bisa!” Sekarang saya bisa memesan makanan dan bertanya arah. Saya senang sekali.',
    link: '',
    sampleEnglish: {
      title: 'Learning Indonesian',
      snippet:
        'I study Indonesian every day. This morning I learned ten new words. Indonesian is not too difficult, but I still often forget. My friend, Budi, helps me. He said, "Just take it slow. You can definitely do it!" Now I can order food and ask for directions. I am very happy.',
    },
  },
  {
    id: 'story-7',
    title: 'Hari hujan',
    snippet:
      'Hari ini hujan sejak pagi. Saya tidak bisa pergi ke luar. Saya tinggal di rumah dan minum teh panas. Saya membaca buku dan mendengar musik. Kucing saya tidur di sofa. Sore hari, hujan berhenti dan matahari keluar. Saya pergi ke taman dengan teman saya. Udara segar sekali setelah hujan.',
    link: '',
    sampleEnglish: {
      title: 'A rainy day',
      snippet:
        'Today it has rained since morning. I could not go outside. I stayed at home and drank hot tea. I read a book and listened to music. My cat slept on the sofa. In the afternoon, the rain stopped and the sun came out. I went to the park with my friend. The air was very fresh after the rain.',
    },
  },
  {
    id: 'story-8',
    title: 'Naik ojek online',
    snippet:
      'Saya harus ke kantor, tetapi hari sudah siang dan jalan macet. Saya memesan ojek online lewat aplikasi. Lima menit kemudian, pengemudi datang. “Selamat pagi, Pak. Ke Jalan Sudirman, ya?” kata saya. Dia memberi saya helm. Kami lewat jalan kecil supaya cepat. Perjalanan hanya lima belas menit. Saya bayar pakai aplikasi. “Terima kasih, Pak!”',
    link: '',
    sampleEnglish: {
      title: 'Taking an online ojek',
      snippet:
        'I had to get to the office, but it was already midday and the roads were jammed. I ordered an online motorbike taxi through the app. Five minutes later, the driver arrived. "Good morning, sir. To Jalan Sudirman, right?" I said. He gave me a helmet. We took small roads to be quick. The trip was only fifteen minutes. I paid with the app. "Thank you, sir!"',
    },
  },
  {
    id: 'story-9',
    title: 'Ulang tahun teman saya',
    snippet:
      'Hari ini teman saya, Dewi, berulang tahun. Dia dua puluh lima tahun. Kami membuat pesta kecil di rumahnya. Saya membeli kue cokelat dan bunga. Teman-teman datang membawa makanan. Kami makan, bernyanyi, dan tertawa bersama. Dewi sangat senang. “Terima kasih, teman-teman,” katanya. Malam itu indah sekali.',
    link: '',
    sampleEnglish: {
      title: "My friend's birthday",
      snippet:
        'Today my friend, Dewi, had her birthday. She is twenty-five years old. We threw a small party at her house. I bought a chocolate cake and flowers. Friends came bringing food. We ate, sang, and laughed together. Dewi was very happy. "Thank you, everyone," she said. That night was very lovely.',
    },
  },
  {
    id: 'story-10',
    title: 'Ke dokter',
    snippet:
      'Kemarin saya kurang enak badan. Kepala saya sakit dan saya demam. Pagi ini saya pergi ke dokter. Dokter bertanya, “Sudah berapa lama sakit?” Saya berkata, “Dua hari.” Dia memberi saya obat dan berkata, “Minum obat ini tiga kali sehari, dan banyak istirahat.” Saya membeli obat di apotek. Sekarang saya sudah lebih baik.',
    link: '',
    sampleEnglish: {
      title: 'Going to the doctor',
      snippet:
        'Yesterday I was not feeling well. My head hurt and I had a fever. This morning I went to the doctor. The doctor asked, "How long have you been sick?" I said, "Two days." He gave me medicine and said, "Take this medicine three times a day, and rest a lot." I bought the medicine at the pharmacy. Now I am already better.',
    },
  },
  {
    id: 'story-11',
    title: 'Akhir pekan di rumah',
    snippet:
      'Akhir pekan ini saya tidak pergi ke mana-mana. Sabtu pagi, saya membersihkan rumah dan mencuci baju. Setelah itu, saya memasak nasi goreng untuk keluarga. Siang hari, kami menonton film bersama. Adik saya bermain di luar dengan teman-temannya. Malam hari, kami makan bersama dan bercerita. Akhir pekan yang tenang, tetapi menyenangkan.',
    link: '',
    sampleEnglish: {
      title: 'A weekend at home',
      snippet:
        'This weekend I did not go anywhere. Saturday morning, I cleaned the house and washed clothes. After that, I cooked fried rice for the family. In the afternoon, we watched a film together. My younger sibling played outside with his friends. In the evening, we ate together and told stories. A quiet weekend, but an enjoyable one.',
    },
  },
]
