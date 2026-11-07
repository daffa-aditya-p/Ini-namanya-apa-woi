export interface BankQuestion {
  id: string;
  conceptId: string;
  subBab: string;
  question: string;
  codeSnippet?: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface ChapterData {
  chapterId: string;
  chapterNumber: number;
  level: string;
  slug: string;
  title: string;
  summary: string;
  subBabs: {
    id: string;
    number: string;
    title: string;
    hash: string;
    description: string;
  }[];
  questions: BankQuestion[];
}

export const PYTHON_CHAPTERS: ChapterData[] = [
  {
    chapterId: 'python-bab1',
    chapterNumber: 1,
    level: 'P1',
    slug: 'curriculum/python/p1',
    title: 'Dasar Pemrograman & Variabel',
    summary: 'Fondasi utama eksekusi Python 3.12: pencetakan data, name binding variabel dinamis, operator aritmatika presisi, dan konversi tipe data.',
    subBabs: [
      {
        id: 'subbab-1-1',
        number: '1.1',
        title: 'Cetak Pertama & Hello World',
        hash: '#subbab-1-1',
        description: 'Mengenal fungsi bawaan print(), string literal, dan parameter sep serta end.',
      },
      {
        id: 'subbab-1-2',
        number: '1.2',
        title: 'Variabel & Tipe Primitif',
        hash: '#subbab-1-2',
        description: 'Mekanisme dynamic name binding di CPython, tipe int, float, str, dan bool.',
      },
      {
        id: 'subbab-1-3',
        number: '1.3',
        title: 'Operator & Ekspresi',
        hash: '#subbab-1-3',
        description: 'Aritmatika presisi: pembagian riil (/), pembagian bulat (//), modulo (%), dan eksponen (**).',
      },
      {
        id: 'subbab-1-4',
        number: '1.4',
        title: 'Input Pengguna & Konversi Tipe',
        hash: '#subbab-1-4',
        description: 'Membaca input teks, casting tipe (int/float/str), dan formatting string modern f-string (PEP 498).',
      },
    ],
    questions: [
      {
        id: 'p1-q1',
        conceptId: 'python.print.sep_end',
        subBab: '1.1',
        question: 'Apa output yang dihasilkan dari pemanggilan fungsi print() berikut?',
        codeSnippet: 'print("Belajar", "Python", sep="-", end="!\\n")',
        options: [
          {
            text: 'Belajar-Python!',
            isCorrect: true,
            explanation: 'Parameter sep="-" memisahkan argumen dengan tanda hubung, dan end="!\\n" menambahkan tanda seru sebelum baris baru.',
          },
          {
            text: 'Belajar Python!',
            isCorrect: false,
            explanation: 'Parameter sep diganti menjadi "-", bukan spasi bawaan.',
          },
          {
            text: 'Belajar-Python',
            isCorrect: false,
            explanation: 'Parameter end="!\\n" mencetak tanda seru di akhir.',
          },
          {
            text: 'Belajar\\nPython!',
            isCorrect: false,
            explanation: 'Pemisah antar kata adalah "-" karena sep="-".',
          },
        ],
      },
      {
        id: 'p1-q2',
        conceptId: 'python.variables.binding',
        subBab: '1.2',
        question: 'Bagaimana cara kerja variabel di Python (CPython) ketika kita menulis x = 42 lalu x = "teks"?',
        options: [
          {
            text: 'Variabel x adalah label referensi (pointer) yang diarahkan dari objek integer 42 ke objek string "teks" baru di heap memory.',
            isCorrect: true,
            explanation: 'Di Python variabel adalah dynamic name binding yang merujuk ke PyObject di heap, bukan kotak statis bersegel tipe.',
          },
          {
            text: 'Python mengonversi memori integer 42 secara in-place menjadi teks.',
            isCorrect: false,
            explanation: 'Objek integer bersifat immutable; Python tidak memodifikasi memori integer asal.',
          },
          {
            text: 'Kode menghasilkan galat kompilasi karena tipe variabel tidak boleh berubah.',
            isCorrect: false,
            explanation: 'Python adalah bahasa berpengetikan dinamis (dynamically typed).',
          },
          {
            text: 'Variabel x digandakan menjadi dua variabel di memori.',
            isCorrect: false,
            explanation: 'Nama x hanya menunjuk satu objek aktif dalam namespace lokal.',
          },
        ],
      },
      {
        id: 'p1-q3',
        conceptId: 'python.operators.division',
        subBab: '1.3',
        question: 'Berapakah hasil dan tipe data dari ekspresi 17 // 5 dan 17 / 5 di Python 3?',
        codeSnippet: 'bulat = 17 // 5\nriil = 17 / 5',
        options: [
          {
            text: 'bulat bernilai 3 (int), riil bernilai 3.4 (float)',
            isCorrect: true,
            explanation: 'Operator // adalah floor division menghasilkan int bulat ke bawah (3), sedangkan / selalu menghasilkan float desimal (3.4).',
          },
          {
            text: 'bulat bernilai 3.0 (float), riil bernilai 3.4 (float)',
            isCorrect: false,
            explanation: 'Floor division antar integer menghasilkan tipe integer, bukan float.',
          },
          {
            text: 'Keduanya menghasilkan 3.4 bertipe float',
            isCorrect: false,
            explanation: 'Operator // membuang bagian pecahan desimal.',
          },
          {
            text: 'bulat bernilai 3 (int), riil bernilai 3 (int)',
            isCorrect: false,
            explanation: 'Di Python 3, pembagian tunggal / selalu menghasilkan float desimal.',
          },
        ],
      },
      {
        id: 'p1-q4',
        conceptId: 'python.fstrings.formatting',
        subBab: '1.4',
        question: 'Sintaks format string manakah yang merupakan konvensi modern PEP 498 di Python?',
        options: [
          {
            text: 'f"Nama: {nama}, Skor: {skor * 10}"',
            isCorrect: true,
            explanation: 'Prefiks f sebelum tanda petik (f-string) memungkinkan ekspresi Python dievaluasi langsung di dalam kurung kurawal.',
          },
          {
            text: '"Nama: %s, Skor: %d" % (nama, skor * 10)',
            isCorrect: false,
            explanation: 'Ini adalah gaya lama C-style printf formatting yang kurang terbaca.',
          },
          {
            text: '"Nama: {}, Skor: {}".format(nama, skor * 10)',
            isCorrect: false,
            explanation: 'str.format() adalah format Python 2.7/3.0 lama, bukan f-string PEP 498.',
          },
          {
            text: '`Nama: ${nama}, Skor: ${skor * 10}`',
            isCorrect: false,
            explanation: 'Ini adalah sintaks template literal JavaScript, bukan Python.',
          },
        ],
      },
      {
        id: 'p1-q5',
        conceptId: 'python.type_casting.conversion',
        subBab: '1.4',
        question: 'Apa hasil evaluasi ekspresi int("42") + float("3.5")?',
        options: [
          {
            text: '45.5 bertipe float',
            isCorrect: true,
            explanation: 'int("42") menghasilkan 42, float("3.5") menghasilkan 3.5. Penjumlahan int + float mempromosikan nilai menjadi 45.5 (float).',
          },
          {
            text: '"423.5" bertipe str',
            isCorrect: false,
            explanation: 'Nilai string telah dikonversi secara eksplisit menjadi angka numerik.',
          },
          {
            text: '45 bertipe int',
            isCorrect: false,
            explanation: 'Penjumlahan angka bulat dengan angka desimal mempertahankan bagian presisi desimal (.5).',
          },
          {
            text: 'Menghasilkan TypeError',
            isCorrect: false,
            explanation: 'String numerik valid dapat dikonversi via int() dan float() tanpa galat.',
          },
        ],
      },
      {
        id: 'p1-q6',
        conceptId: 'python.operators.precedence',
        subBab: '1.3',
        question: 'Berapakah output dari kode aritmatika berikut?',
        codeSnippet: 'hasil = 2 + 3 * 4 ** 2\nprint(hasil)',
        options: [
          {
            text: '50',
            isCorrect: true,
            explanation: 'Urutan presisi operator: eksponen (4 ** 2 = 16), lalu perkalian (3 * 16 = 48), lalu penjumlahan (2 + 48 = 50).',
          },
          {
            text: '80',
            isCorrect: false,
            explanation: 'Perkalian tidak dihitung sebelum pemangkatan.',
          },
          {
            text: '400',
            isCorrect: false,
            explanation: 'Penjumlahan 2+3 tidak dievaluasi terlebih dahulu karena presisinya lebih rendah dari * dan **.',
          },
          {
            text: '144',
            isCorrect: false,
            explanation: 'Perhatikan urutan evaluasi operator matematika standar PEMDAS.',
          },
        ],
      },
      {
        id: 'p1-q7',
        conceptId: 'python.types.boolean',
        subBab: '1.2',
        question: 'Manakah nilai di Python yang dievaluasi sebagai Falsy (False dalam konteks boolean)?',
        options: [
          {
            text: '0, "", None, [], dan False',
            isCorrect: true,
            explanation: 'Di Python angka 0, string kosong, None, koleksi kosong, dan boolean False adalah nilai yang bernilai Falsy.',
          },
          {
            text: 'Semua angka di atas 0 dan string "False"',
            isCorrect: false,
            explanation: 'String "False" bernilai Truthy karena panjang karakternya tidak kosong.',
          },
          {
            text: 'Hanya kata kunci False',
            isCorrect: false,
            explanation: 'Python memiliki aturan truthiness untuk berbagai tipe data bawaan.',
          },
          {
            text: 'Angka negatif (-1, -10)',
            isCorrect: false,
            explanation: 'Angka integer bukan 0 (termasuk negatif) bernilai Truthy.',
          },
        ],
      },
      {
        id: 'p1-q8',
        conceptId: 'python.operators.modulo',
        subBab: '1.3',
        question: 'Operator apa yang digunakan untuk memeriksa apakah suatu bilangan bulat x adalah bilangan genap?',
        codeSnippet: 'apakah_genap = (x % 2 == 0)',
        options: [
          {
            text: 'Operator sisa bagi (modulus) %',
            isCorrect: true,
            explanation: 'x % 2 menghasilkan sisa pembagian x oleh 2. Jika sisa bernilai 0, bilangan tersebut pasti genap.',
          },
          {
            text: 'Operator pembagian riil /',
            isCorrect: false,
            explanation: 'x / 2 menghasilkan pecahan desimal, bukan sisa bagi integer.',
          },
          {
            text: 'Operator eksponen **',
            isCorrect: false,
            explanation: '** digunakan untuk perpangkatan.',
          },
          {
            text: 'Operator floor division //',
            isCorrect: false,
            explanation: '// menghasilkan hasil bagi bulat, bukan sisa baginya.',
          },
        ],
      },
      {
        id: 'p1-q9',
        conceptId: 'python.input.return_type',
        subBab: '1.4',
        question: 'Tipe data apa yang selalu dikembalikan oleh fungsi bawaan input() di Python?',
        options: [
          {
            text: 'Selalu mengembalikan tipe str (string teks)',
            isCorrect: true,
            explanation: 'Fungsi input() selalu membaca input sebagai string teks, sehingga harus di-cast jika ingin diproses sebagai angka.',
          },
          {
            text: 'Mengembalikan int jika user mengetik angka',
            isCorrect: false,
            explanation: 'Python tidak melakukan auto-casting otomatis pada kembalian input().',
          },
          {
            text: 'Mengembalikan tipe object generik',
            isCorrect: false,
            explanation: 'Kembalian input() bertipe eksplisit str.',
          },
          {
            text: 'Mengembalikan None',
            isCorrect: false,
            explanation: 'input() mengembalikan baris teks yang diketikkan pengguna.',
          },
        ],
      },
      {
        id: 'p1-q10',
        conceptId: 'python.print.multiple_args',
        subBab: '1.1',
        question: 'Bagaimana perilaku bawaan print(a, b) jika parameter sep tidak ditentukan?',
        options: [
          {
            text: 'Menghubungkan nilai a dan b dengan satu karakter spasi (" ")',
            isCorrect: true,
            explanation: 'Nilai default untuk parameter sep pada print() adalah satu karakter spasi (" ").',
          },
          {
            text: 'Menggabungkan kedua teks tanpa spasi sama sekali ("")',
            isCorrect: false,
            explanation: 'Tanpa sep="", Python selalu menyisipkan spasi antar nilai.',
          },
          {
            text: 'Mencetak nilai b di baris baru di bawah nilai a',
            isCorrect: false,
            explanation: 'Nilai b dicetak di baris yang sama kecuali argumen sep berupa newline "\\n".',
          },
          {
            text: 'Menghasilkan galat argumen ganda',
            isCorrect: false,
            explanation: 'print() menerima argumen posisi variabel (*objects) tanpa batas.',
          },
        ],
      },
    ],
  },
  {
    chapterId: 'python-bab2',
    chapterNumber: 2,
    level: 'P2',
    slug: 'curriculum/python/p2',
    title: 'Logika & Alur Kontrol',
    summary: 'Kuasai pembuatan keputusan terstruktur: percabangan if-elif-else, iterasi sekuensial for & range(), serta perulangan berbasis kondisi while & break/continue.',
    subBabs: [
      {
        id: 'subbab-2-1',
        number: '2.1',
        title: 'Percabangan if-elif-else',
        hash: '#subbab-2-1',
        description: 'Pengambilan keputusan logika, aturan indentasi 4 spasi (PEP 8), dan operator perbandingan & logika.',
      },
      {
        id: 'subbab-2-2',
        number: '2.2',
        title: 'Perulangan for & range',
        hash: '#subbab-2-2',
        description: 'Iterasi sekuensial koleksi dan penjelajahan rentang angka deterministik menggunakan fungsi range().',
      },
      {
        id: 'subbab-2-3',
        number: '2.3',
        title: 'Perulangan while & Break/Continue',
        hash: '#subbab-2-3',
        description: 'Perulangan berdasar kondisi dinamis, pencegahan infinite loop, penghentian dini (break), dan peloncatan iterasi (continue).',
      },
    ],
    questions: [
      {
        id: 'p2-q1',
        conceptId: 'python.control.if_elif',
        subBab: '2.1',
        question: 'Apa output yang dihasilkan dari blok percabangan berikut?',
        codeSnippet: `skor = 75
if skor >= 90:
    print("A")
elif skor >= 70:
    print("B")
elif skor >= 60:
    print("C")
else:
    print("D")`,
        options: [
          {
            text: 'B',
            isCorrect: true,
            explanation: 'Kondisi skor >= 90 salah (False), tetapi kondisi skor >= 70 benar (True), sehingga mencetak "B" dan keluar dari rangkaian if-elif.',
          },
          {
            text: 'B lalu C',
            isCorrect: false,
            explanation: 'Hanya blok elif pertama yang bernilai True yang dieksekusi, cabang berikutnya diabaikan.',
          },
          {
            text: 'C',
            isCorrect: false,
            explanation: 'skor 75 telah cocok pada cabang elif skor >= 70.',
          },
          {
            text: 'D',
            isCorrect: false,
            explanation: 'Cabang else hanya dijalankan jika seluruh if dan elif bernilai False.',
          },
        ],
      },
      {
        id: 'p2-q2',
        conceptId: 'python.control.for_range_step',
        subBab: '2.2',
        question: 'Berapa kali perulangan berikut dieksekusi dan apa nilai terakhir dari i yang dicetak?',
        codeSnippet: `for i in range(2, 10, 3):
    print(i, end=" ")`,
        options: [
          {
            text: '3 kali, mencetak: 2 5 8',
            isCorrect: true,
            explanation: 'range(2, 10, 3) dimulai dari 2, melompat 3 langkah: 2 -> 5 -> 8. Langkah berikutnya (11) >= 10 sehingga berhenti.',
          },
          {
            text: '4 kali, mencetak: 2 5 8 10',
            isCorrect: false,
            explanation: 'Batas akhir (stop=10) bersifat eksklusif (tidak diikutsertakan).',
          },
          {
            text: '8 kali, mencetak dari 2 sampai 9',
            isCorrect: false,
            explanation: 'Parameter ketiga (step=3) membuat loop melompat 3 angka per iterasi.',
          },
          {
            text: '3 kali, mencetak: 3 6 9',
            isCorrect: false,
            explanation: 'Nilai awal (start) adalah 2, bukan 3.',
          },
        ],
      },
      {
        id: 'p2-q3',
        conceptId: 'python.control.while_break',
        subBab: '2.3',
        question: 'Apa output dari kode perulangan while dengan klausa break berikut?',
        codeSnippet: `n = 1
total = 0
while n <= 10:
    total += n
    if total > 10:
        break
    n += 1
print(f"n={n}, total={total}")`,
        options: [
          {
            text: 'n=4, total=10 salah, yang benar n=5, total=15',
            isCorrect: true,
            explanation: 'Iterasi 1: total=1, n=2. Iterasi 2: total=3, n=3. Iterasi 3: total=6, n=4. Iterasi 4: total=10, n=5. Iterasi 5: total=15 (>10) -> break langsung aktif saat n=5.',
          },
          {
            text: 'n=10, total=55',
            isCorrect: false,
            explanation: 'Klausa break menghentikan perulangan saat total melampaui 10.',
          },
          {
            text: 'n=4, total=10',
            isCorrect: false,
            explanation: 'Saat total bernilai 10, kondisi total > 10 belum terpenuhi (10 tidak lebih besar dari 10).',
          },
          {
            text: 'Perulangan tidak pernah berhenti (infinite loop)',
            isCorrect: false,
            explanation: 'Nilai n terus bertambah dan total pasti melampaui 10.',
          },
        ],
      },
      {
        id: 'p2-q4',
        conceptId: 'python.control.continue_statement',
        subBab: '2.3',
        question: 'Apa fungsi dari instruksi continue di dalam sebuah loop Python?',
        options: [
          {
            text: 'Melewati sisa kode pada iterasi saat ini dan langsung melompat ke iterasi berikutnya.',
            isCorrect: true,
            explanation: 'continue menghentikan iterasi aktif saat itu juga dan melanjutkan evaluasi ke awal siklus perulangan berikutnya.',
          },
          {
            text: 'Menghentikan loop secara permanen dan keluar dari blok perulangan.',
            isCorrect: false,
            explanation: 'Menghentikan loop secara permanen adalah tugas dari instruksi break.',
          },
          {
            text: 'Mengulang baris kode yang sama sampai tidak ada galat.',
            isCorrect: false,
            explanation: 'continue tidak mengulang baris kode yang sama, melainkan maju ke putaran berikutnya.',
          },
          {
            text: 'Mengembalikan nilai fungsi pemanggil.',
            isCorrect: false,
            explanation: 'Mengembalikan nilai fungsi adalah tugas kata kunci return.',
          },
        ],
      },
      {
        id: 'p2-q5',
        conceptId: 'python.control.nested_indentation',
        subBab: '2.1',
        question: 'Mengapa indentasi di Python sangat esensial menurut standar PEP 8?',
        options: [
          {
            text: 'Karena Python menggunakan indentasi untuk menentukan hierarki cakupan blok logika, bukan tanda kurung kurawal {}.',
            isCorrect: true,
            explanation: 'CPython mengandalkan token INDENT dan DEDENT untuk membentuk pohon sintaks blok program.',
          },
          {
            text: 'Hanya untuk mempercantik tampilan agar kode tampak rapi bagi manusia.',
            isCorrect: false,
            explanation: 'Indentasi di Python berdampak langsung pada keabsahan sintaks dan eksekusi program.',
          },
          {
            text: 'Indentasi boleh dicampur secara acak antara spasi dan tab dalam satu file.',
            isCorrect: false,
            explanation: 'PEP 8 melarang keras pencampuran tab dan spasi karena dapat memicu TabError.',
          },
          {
            text: 'Agar compiler Python dapat mengalokasikan memori register CPU.',
            isCorrect: false,
            explanation: 'Indentasi adalah aturan leksikal bahasa untuk pembagian blok kode.',
          },
        ],
      },
      {
        id: 'p2-q6',
        conceptId: 'python.control.range_negative_step',
        subBab: '2.2',
        question: 'Bagaimana cara membuat perulangan hitung mundur dari 5 hingga 1 menggunakan fungsi range()?',
        options: [
          {
            text: 'for i in range(5, 0, -1):',
            isCorrect: true,
            explanation: 'start=5, stop=0 (eksklusif sehingga berhenti di 1), step=-1 untuk melangkah mundur.',
          },
          {
            text: 'for i in range(1, 5, -1):',
            isCorrect: false,
            explanation: 'Jika start < stop dengan step negatif, range akan kosong (0 iterasi).',
          },
          {
            text: 'for i in range(5, 1):',
            isCorrect: false,
            explanation: 'Default step adalah +1 sehingga tidak dapat berjalan mundur.',
          },
          {
            text: 'for i in range(5, -1, 1):',
            isCorrect: false,
            explanation: 'Step bernilai positif tidak dapat bergerak dari 5 ke -1.',
          },
        ],
      },
      {
        id: 'p2-q7',
        conceptId: 'python.control.logical_shortcircuit',
        subBab: '2.1',
        question: 'Bagaimana evaluasi short-circuit pada ekspresi logika (A or B) di Python?',
        options: [
          {
            text: 'Jika A bernilai True, Python tidak akan mengevaluasi ekspresi B sama sekali.',
            isCorrect: true,
            explanation: 'Operator or langsung mengembalikan nilai True begitu menemukan operan pertama bernilai Truthy tanpa memeriksa operan kedua.',
          },
          {
            text: 'Python selalu mengevaluasi kedua ekspresi A dan B apapun nilainya.',
            isCorrect: false,
            explanation: 'Python mengoptimalkan eksekusi dengan aturan short-circuit evaluation.',
          },
          {
            text: 'Ekspresi B selalu dievaluasi terlebih dahulu sebelum ekspresi A.',
            isCorrect: false,
            explanation: 'Evaluasi ekspresi berjalan dari kiri ke kanan.',
          },
          {
            text: 'A or B selalu mengembalikan nilai boolean False.',
            isCorrect: false,
            explanation: 'Jika salah satu operan bernilai True, hasilnya adalah True.',
          },
        ],
      },
      {
        id: 'p2-q8',
        conceptId: 'python.control.loop_accumulator',
        subBab: '2.2',
        question: 'Apa output yang dihasilkan dari kode akumulasi berikut?',
        codeSnippet: `angka = [1, 2, 3, 4]
hasil = 1
for x in angka:
    if x % 2 == 0:
        hasil *= x
print(hasil)`,
        options: [
          {
            text: '8',
            isCorrect: true,
            explanation: 'Angka genap dalam list adalah 2 dan 4. Perkaliannya adalah 1 * 2 * 4 = 8.',
          },
          {
            text: '24',
            isCorrect: false,
            explanation: '24 adalah hasil perkalian seluruh angka (1*2*3*4), bukan hanya angka genap.',
          },
          {
            text: '6',
            isCorrect: false,
            explanation: '6 adalah hasil penjumlahan 2 + 4, sedangkan operator pada kode adalah perkalian (*=).',
          },
          {
            text: '4',
            isCorrect: false,
            explanation: 'Nilai 2 juga ikut dikalikan karena 2 % 2 == 0.',
          },
        ],
      },
      {
        id: 'p2-q9',
        conceptId: 'python.control.while_infinite_guard',
        subBab: '2.3',
        question: 'Kesalahan apa yang paling sering menyebabkan program mengalami freeze/hang pada perulangan while?',
        options: [
          {
            text: 'Lupa memperbarui variabel kondisi di dalam badan loop sehingga kondisinya selalu bernilai True (infinite loop).',
            isCorrect: true,
            explanation: 'Jika variabel penghitung atau kondisi tidak pernah berubah menuju status terminasi, loop akan berputar tanpa henti.',
          },
          {
            text: 'Menulis variabel bernilai int.',
            isCorrect: false,
            explanation: 'Variabel int adalah tipe standar yang sangat lazim digunakan dalam loop.',
          },
          {
            text: 'Menempatkan komentar di dalam loop.',
            isCorrect: false,
            explanation: 'Komentar diabaikan oleh parser CPython.',
          },
          {
            text: 'Menggunakan indentasi 4 spasi.',
            isCorrect: false,
            explanation: 'Indentasi 4 spasi adalah konvensi resmi PEP 8.',
          },
        ],
      },
      {
        id: 'p2-q10',
        conceptId: 'python.control.ternary_expression',
        subBab: '2.1',
        question: 'Bagaimana sintaks ekspresi kondisional satu baris (ternary operator) yang valid di Python?',
        options: [
          {
            text: 'nilai = "Lulus" if skor >= 80 else "Ulang"',
            isCorrect: true,
            explanation: 'Sintaks kondisional Python: [nilai_jika_true] if [kondisi] else [nilai_jika_false].',
          },
          {
            text: 'nilai = skor >= 80 ? "Lulus" : "Ulang"',
            isCorrect: false,
            explanation: 'Tanda tanya dan titik dua adalah sintaks bahasa C/JavaScript/Java, bukan Python.',
          },
          {
            text: 'nilai = if (skor >= 80) "Lulus" else "Ulang"',
            isCorrect: false,
            explanation: 'Sintaks if di depan tidak valid sebagai inline expression di Python.',
          },
          {
            text: 'nilai = ifelse(skor >= 80, "Lulus", "Ulang")',
            isCorrect: false,
            explanation: 'ifelse adalah fungsi bahasa R, bukan bawaan Python.',
          },
        ],
      },
    ],
  },
  {
    chapterId: 'python-bab3',
    chapterNumber: 3,
    level: 'P3',
    slug: 'curriculum/python/p3',
    title: 'Struktur Data Koleksi',
    summary: 'Kuasai empat pilar struktur data bawaan Python: List terurut & slicing, Tuple immutable, Dictionary hash map O(1), dan Set operasi himpunan unik.',
    subBabs: [
      {
        id: 'subbab-3-1',
        number: '3.1',
        title: 'List & Slicing',
        hash: '#subbab-3-1',
        description: 'Manipulasi deret mutable, indeks negatif, pemotongan lanjut [start:stop:step], dan pembalikan data.',
      },
      {
        id: 'subbab-3-2',
        number: '3.2',
        title: 'Tuple & Immutability',
        hash: '#subbab-3-2',
        description: 'Koleksi tetap yang aman dari mutasi, tuple unpacking, efisiensi alokasi memori, dan penggunaan sebagai dictionary key.',
      },
      {
        id: 'subbab-3-3',
        number: '3.3',
        title: 'Dictionary & Hash Map',
        hash: '#subbab-3-3',
        description: 'Struktur pemetaan kunci-nilai cepat O(1), metode .get() aman, iterasi pasangan .items(), dan operator penggabungan (|).',
      },
      {
        id: 'subbab-3-4',
        number: '3.4',
        title: 'Set & Himpunan',
        hash: '#subbab-3-4',
        description: 'Koleksi tanpa duplikasi berkecepatan tinggi, operasi gabungan (|), irisan (&), dan selisih (-).',
      },
    ],
    questions: [
      {
        id: 'p3-q1',
        conceptId: 'python.collections.list_slicing',
        subBab: '3.1',
        question: 'Diberikan data = [10, 20, 30, 40, 50, 60]. Berapakah hasil dari data[1:5:2] dan data[::-1]?',
        options: [
          {
            text: 'data[1:5:2] menghasilkan [20, 40], dan data[::-1] membalikkan seluruh list menjadi [60, 50, 40, 30, 20, 10]',
            isCorrect: true,
            explanation: 'Slicing [1:5:2] mengambil indeks 1 (20) dan 3 (40). Slicing [::-1] dengan step negatif membalik urutan elemen.',
          },
          {
            text: 'data[1:5:2] menghasilkan [10, 30, 50], dan data[::-1] menghasilkan list kosong',
            isCorrect: false,
            explanation: 'Indeks awal 1 bernilai 20, bukan 10.',
          },
          {
            text: 'data[1:5:2] menghasilkan [20, 40, 60]',
            isCorrect: false,
            explanation: 'Batas akhir 5 eksklusif, indeks 5 (60) tidak diikutsertakan.',
          },
          {
            text: 'Keduanya memicu IndexError',
            isCorrect: false,
            explanation: 'Slicing di Python aman dari IndexError sekalipun batas melebihi panjang koleksi.',
          },
        ],
      },
      {
        id: 'p3-q2',
        conceptId: 'python.collections.tuple_immutability',
        subBab: '3.2',
        question: 'Apa yang terjadi jika kita mencoba mengeksekusi koordinat[0] = 99 pada tuple koordinat = (10, 20)?',
        options: [
          {
            text: 'Memunculkan TypeError: "tuple" object does not support item assignment',
            isCorrect: true,
            explanation: 'Tuple bersifat immutable (tidak dapat diubah) setelah pertama kali diinstansiasi.',
          },
          {
            text: 'Nilai tuple berhasil diperbarui menjadi (99, 20)',
            isCorrect: false,
            explanation: 'Hanya List yang mendukung mutasi elemen secara in-place via assignment.',
          },
          {
            text: 'Tuple secara otomatis berubah menjadi List',
            isCorrect: false,
            explanation: 'Python tidak mengubah tipe data struktur secara implisit.',
          },
          {
            text: 'Nilai 99 ditambahkan ke akhir tuple',
            isCorrect: false,
            explanation: 'Item assignment tidak dapat menambah elemen baru.',
          },
        ],
      },
      {
        id: 'p3-q3',
        conceptId: 'python.collections.dict_merge',
        subBab: '3.3',
        question: 'Sejak Python 3.9+, operator apa yang digunakan untuk menggabungkan dua dictionary secara elegan?',
        codeSnippet: `profil = {"nama": "Budi", "umur": 20}
kontak = {"email": "budi@mail.com", "umur": 21}
gabung = profil | kontak`,
        options: [
          {
            text: 'Operator union pipe (|), dengan nilai kunci yang sama diambil dari dictionary sebelah kanan ("umur": 21)',
            isCorrect: true,
            explanation: 'Operator | (PEP 584) menggabungkan dua dictionary di mana dictionary sisi kanan mengesampingkan kunci duplikat sisi kiri.',
          },
          {
            text: 'Operator tambah (+)',
            isCorrect: false,
            explanation: 'Operator + tidak didukung untuk tipe dictionary dan akan memicu TypeError.',
          },
          {
            text: 'Operator ampersand (&)',
            isCorrect: false,
            explanation: '& digunakan untuk irisan himpunan (intersection), bukan penggabungan kamus.',
          },
          {
            text: 'Operator bintang ganda (**)',
            isCorrect: false,
            explanation: '{**profil, **kontak} adalah cara lama unpacking, bukan operator biner resmi antar dua dict.',
          },
        ],
      },
      {
        id: 'p3-q4',
        conceptId: 'python.collections.set_operations',
        subBab: '3.4',
        question: 'Diberikan himpunan A = {1, 2, 3} dan B = {3, 4, 5}. Apa hasil dari A & B dan A - B?',
        options: [
          {
            text: 'A & B menghasilkan {3} (irisan), dan A - B menghasilkan {1, 2} (selisih)',
            isCorrect: true,
            explanation: '& mengambil elemen yang ada di kedua set (3), sedangkan - mengambil elemen yang ada di A namun tidak ada di B (1 dan 2).',
          },
          {
            text: 'A & B menghasilkan {1, 2, 3, 4, 5}, dan A - B menghasilkan {4, 5}',
            isCorrect: false,
            explanation: 'Operasi & adalah irisan (bukan gabungan), dan A - B adalah selisih anggota A terhadap B.',
          },
          {
            text: 'A & B menghasilkan {3}, dan A - B menghasilkan {-2}',
            isCorrect: false,
            explanation: 'Operasi selisih set bukan pengurangan aritmatika numerik.',
          },
          {
            text: 'Keduanya menghasilkan set kosong set()',
            isCorrect: false,
            explanation: 'Ada elemen persekutuan (3) dan elemen unik di A (1, 2).',
          },
        ],
      },
      {
        id: 'p3-q5',
        conceptId: 'python.collections.dict_get_safe',
        subBab: '3.3',
        question: 'Mengapa metode dict.get(key, default) lebih direkomendasikan daripada pengaksesan langsung dict[key] saat kunci belum tentu ada?',
        options: [
          {
            text: 'Karena dict.get() mengembalikan nilai default (atau None) tanpa menimbulkan galat fatal KeyError.',
            isCorrect: true,
            explanation: 'Pengaksesan langsung dict[key] melempar KeyError jika kunci tidak ditemukan, sedangkan .get() mengembalikan fallback yang aman.',
          },
          {
            text: 'Karena dict.get() berjalan lebih cepat hingga 100 kali lipat.',
            isCorrect: false,
            explanation: 'Kompleksitas keduanya sama-sama O(1) amortized hash lookup.',
          },
          {
            text: 'Karena dict[key] menghapus elemen dari dictionary.',
            isCorrect: false,
            explanation: 'dict[key] hanya membaca nilai, bukan menghapusnya.',
          },
          {
            text: 'Karena dict.get() mengonversi nilai menjadi tipe string.',
            isCorrect: false,
            explanation: 'dict.get() mempertahankan tipe asli nilai yang tersimpan.',
          },
        ],
      },
      {
        id: 'p3-q6',
        conceptId: 'python.collections.list_methods',
        subBab: '3.1',
        question: 'Metode mana yang menambahkan seluruh elemen dari iterable lain ke akhir list asal secara in-place?',
        options: [
          {
            text: 'list.extend(iterable)',
            isCorrect: true,
            explanation: 'extend() memperluas list dengan memasukkan tiap elemen satu per satu, berbeda dengan append() yang memasukkan iterable sebagai satu sub-elemen tunggal.',
          },
          {
            text: 'list.append(iterable)',
            isCorrect: false,
            explanation: 'append() akan memasukkan seluruh iterable sebagai elemen nested bersarang di indeks terakhir.',
          },
          {
            text: 'list.insert(0, iterable)',
            isCorrect: false,
            explanation: 'insert(0, ...) menyisipkan di indeks paling awal.',
          },
          {
            text: 'list.push(iterable)',
            isCorrect: false,
            explanation: 'push() adalah metode JavaScript, bukan metode list Python.',
          },
        ],
      },
      {
        id: 'p3-q7',
        conceptId: 'python.collections.tuple_unpacking',
        subBab: '3.2',
        question: 'Diberikan titik = (10, 20, 30). Bagaimana cara melakukan tuple unpacking untuk mengambil nilai pertama ke variabel x dan sisanya ke list rest?',
        options: [
          {
            text: 'x, *rest = titik',
            isCorrect: true,
            explanation: 'Extended iterable unpacking menggunakan tanda bintang (*rest) mengumpulkan sisa elemen ke dalam list.',
          },
          {
            text: 'x, ...rest = titik',
            isCorrect: false,
            explanation: 'Tanda titik tiga (...rest) adalah sintaks rest operator JavaScript, bukan Python.',
          },
          {
            text: 'x, rest[] = titik',
            isCorrect: false,
            explanation: 'Sintaks tidak valid di Python.',
          },
          {
            text: 'x = titik[0]; rest = titik[1]',
            isCorrect: false,
            explanation: 'titik[1] hanya mengambil satu nilai indeks ke-1, bukan sisa seluruh elemen.',
          },
        ],
      },
      {
        id: 'p3-q8',
        conceptId: 'python.collections.set_deduplication',
        subBab: '3.4',
        question: 'Bagaimana cara tercepat dan paling ringkas untuk menghapus nilai duplikat dari list angka = [1, 2, 2, 3, 3, 3, 4] di Python?',
        options: [
          {
            text: 'list(set(angka))',
            isCorrect: true,
            explanation: 'Mengonversi list ke set secara instan membuang duplikat karena sifat keunikan hash set, lalu dikembalikan ke list.',
          },
          {
            text: 'angka.unique()',
            isCorrect: false,
            explanation: 'Metode list Python tidak memiliki atribut bawaan .unique().',
          },
          {
            text: 'angka.filter_duplicates()',
            isCorrect: false,
            explanation: 'Tidak ada metode bawaan bernama filter_duplicates pada list.',
          },
          {
            text: 'tuple(angka)',
            isCorrect: false,
            explanation: 'Tuple tetap mempertahankan seluruh elemen duplikat.',
          },
        ],
      },
      {
        id: 'p3-q9',
        conceptId: 'python.collections.hashability',
        subBab: '3.3',
        question: 'Tipe data manakah yang TIDAK BOLEH dijadikan sebagai kunci (key) di dalam sebuah dictionary Python?',
        options: [
          {
            text: 'Tipe mutable seperti list ([1, 2]) atau set ({1, 2})',
            isCorrect: true,
            explanation: 'Kunci dictionary wajib berupa objek hashable yang immutable (seperti str, int, float, atau tuple). Objek mutable memicu TypeError: unhashable type.',
          },
          {
            text: 'Tipe string ("nama")',
            isCorrect: false,
            explanation: 'String adalah objek immutable yang sangat umum dijadikan dictionary key.',
          },
          {
            text: 'Tipe tuple murni berisi angka ((1, 2))',
            isCorrect: false,
            explanation: 'Tuple bernilai immutable dan memiliki fungsi hash deterministik.',
          },
          {
            text: 'Tipe integer (42)',
            isCorrect: false,
            explanation: 'Integer dapat dijadikan kunci dictionary dengan andal.',
          },
        ],
      },
      {
        id: 'p3-q10',
        conceptId: 'python.collections.dict_items_iteration',
        subBab: '3.3',
        question: 'Metode apa yang digunakan untuk mengiterasi kunci dan nilai secara bersamaan dalam sebuah perulangan for?',
        codeSnippet: `for k, v in data.items():\n    print(k, v)`,
        options: [
          {
            text: 'data.items() yang menghasilkan pasangan tuple (key, value)',
            isCorrect: true,
            explanation: '.items() mengembalikan view berisikan pasangan (kunci, nilai) yang dapat di-unpack secara simultan.',
          },
          {
            text: 'data.keys()',
            isCorrect: false,
            explanation: '.keys() hanya mengembalikan daftar kunci tanpa nilainya.',
          },
          {
            text: 'data.values()',
            isCorrect: false,
            explanation: '.values() hanya mengembalikan daftar nilai tanpa kuncinya.',
          },
          {
            text: 'data.entries()',
            isCorrect: false,
            explanation: 'entries() adalah metode JavaScript Object/Map, bukan Python.',
          },
        ],
      },
    ],
  },
  {
    chapterId: 'python-bab4',
    chapterNumber: 4,
    level: 'P4',
    slug: 'curriculum/python/p4',
    title: 'Fungsi & Modularitas',
    summary: 'Bangun kode modular dan ekspresif: pendefinisian fungsi dengan *args/**kwargs, pemisahan scope variabel lokal/global, fungsi anonim lambda, dan list/dict comprehension.',
    subBabs: [
      {
        id: 'subbab-4-1',
        number: '4.1',
        title: 'Definisi Fungsi & Parameter',
        hash: '#subbab-4-1',
        description: 'Sintaks def, argumen posisi, default parameter, serta parameter fleksibel *args dan **kwargs.',
      },
      {
        id: 'subbab-4-2',
        number: '4.2',
        title: 'Nilai Balik & Scope',
        hash: '#subbab-4-2',
        description: 'Pernyataan return multi-nilai via tuple, aturan leksikal LEGB (Local, Enclosing, Global, Builtin).',
      },
      {
        id: 'subbab-4-3',
        number: '4.3',
        title: 'Lambda & Comprehensions',
        hash: '#subbab-4-3',
        description: 'Fungsi mini satu baris lambda, list comprehension deklaratif, dan dictionary comprehension transformatif.',
      },
    ],
    questions: [
      {
        id: 'p4-q1',
        conceptId: 'python.functions.args_kwargs',
        subBab: '4.1',
        question: 'Tipe struktur data apa yang diterima oleh parameter *args dan **kwargs di dalam fungsi Python?',
        codeSnippet: `def cetak_data(*args, **kwargs):\n    pass`,
        options: [
          {
            text: '*args diterima sebagai Tuple, sedangkan **kwargs diterima sebagai Dictionary',
            isCorrect: true,
            explanation: '*args mengemas argumen posisi berlebih menjadi tuple immutable, dan **kwargs mengemas argumen kata kunci menjadi dictionary.',
          },
          {
            text: '*args sebagai List, dan **kwargs sebagai Tuple',
            isCorrect: false,
            explanation: '*args dikemas menjadi tuple, bukan list.',
          },
          {
            text: 'Keduanya diterima sebagai List',
            isCorrect: false,
            explanation: '**kwargs berpasangan kunci-nilai sehingga dikemas menjadi dictionary.',
          },
          {
            text: 'Keduanya diterima sebagai Set',
            isCorrect: false,
            explanation: 'Argumen mempertahankan urutan posisi dan kunci kata kunci.',
          },
        ],
      },
      {
        id: 'p4-q2',
        conceptId: 'python.functions.return_multiple',
        subBab: '4.2',
        question: 'Bagaimana mekanisme pengembalian multi-nilai pada fungsi berikut?',
        codeSnippet: `def kalkulasi(a, b):
    return a + b, a * b

hasil = kalkulasi(3, 4)`,
        options: [
          {
            text: 'Python mengemas nilai kembalian ke dalam sebuah Tuple: (7, 12)',
            isCorrect: true,
            explanation: 'Di Python penulisan beberapa nilai yang dipisahkan koma pada pernyataan return otomatis membentuk tuple.',
          },
          {
            text: 'Hanya nilai pertama (7) yang dikembalikan, nilai kedua dibuang.',
            isCorrect: false,
            explanation: 'Semua nilai dikembalikan dalam satu kesatuan tuple.',
          },
          {
            text: 'Fungsi menghasilkan SyntaxError karena fungsi hanya boleh memiliki satu return value.',
            isCorrect: false,
            explanation: 'Python secara resmi mendukung multiple return values melalui tuple packing.',
          },
          {
            text: 'Mengembalikan array bertipe float.',
            isCorrect: false,
            explanation: 'Tipe bawaan kembalian adalah tuple bilangan integer.',
          },
        ],
      },
      {
        id: 'p4-q3',
        conceptId: 'python.functions.list_comprehension',
        subBab: '4.3',
        question: 'Apa output dari list comprehension dengan filter kondisional berikut?',
        codeSnippet: `angka = [1, 2, 3, 4, 5, 6]
genap_kuadrat = [x ** 2 for x in angka if x % 2 == 0]
print(genap_kuadrat)`,
        options: [
          {
            text: '[4, 16, 36]',
            isCorrect: true,
            explanation: 'Angka genap dalam list adalah 2, 4, 6. Pemangkatan kuadratnya adalah 2**2 = 4, 4**2 = 16, 6**2 = 36.',
          },
          {
            text: '[1, 4, 9, 16, 25, 36]',
            isCorrect: false,
            explanation: 'Klausa if x % 2 == 0 memfilter angka ganjil sehingga hanya genap yang diproses.',
          },
          {
            text: '[2, 4, 6]',
            isCorrect: false,
            explanation: 'Ekspresi di depan adalah x ** 2, bukan x saja.',
          },
          {
            text: '[4, 16]',
            isCorrect: false,
            explanation: 'Angka 6 juga genap dan kuadratnya (36) harus masuk ke dalam list.',
          },
        ],
      },
      {
        id: 'p4-q4',
        conceptId: 'python.functions.lambda_expression',
        subBab: '4.3',
        question: 'Kapan ekspresi fungsi anonim lambda paling tepat digunakan dalam idiom Python modern?',
        options: [
          {
            text: 'Untuk fungsi mini satu baris yang dijadikan argumen sementara (misal parameter key pada sorted() atau min()).',
            isCorrect: true,
            explanation: 'Lambda dirancang untuk operasi fungsional sederhana tanpa perlu membuat definisi def formal yang berlebihan.',
          },
          {
            text: 'Untuk menggantikan seluruh fungsi def yang memiliki logika kompleks bertingkat.',
            isCorrect: false,
            explanation: 'PEP 8 menyarankan penggunaan def biasa jika fungsi memiliki nama atau logika yang kompleks.',
          },
          {
            text: 'Untuk membuat class baru secara dinamis.',
            isCorrect: false,
            explanation: 'Lambda adalah fungsi, bukan class builder.',
          },
          {
            text: 'Untuk mengeksekusi perulangan while tak berhingga.',
            isCorrect: false,
            explanation: 'Lambda Python dibatasi pada satu baris ekspresi dan tidak dapat memuat pernyataan alur seperti while atau for bertingkat.',
          },
        ],
      },
      {
        id: 'p4-q5',
        conceptId: 'python.functions.default_mutable_trap',
        subBab: '4.1',
        question: 'Mengapa menulis nilai default argumen berupa objek mutable seperti def tambah(item, daftar=[]) dianggap sebagai bad practice / perangkap umum di Python?',
        options: [
          {
            text: 'Karena nilai default dievaluasi sekali saja saat fungsi didefinisikan, sehingga list daftar akan dibagi dan terakumulasi di antara setiap pemanggilan fungsi.',
            isCorrect: true,
            explanation: 'Objek list default menempel pada objek fungsi di heap memory. Gunakan None sebagai default lalu inisialisasi list baru di dalam fungsi.',
          },
          {
            text: 'Karena Python langsung melempar SyntaxError.',
            isCorrect: false,
            explanation: 'Secara sintaksis kode diizinkan, tetapi perilakunya memicu bug logika runtime.',
          },
          {
            text: 'Karena objek list tidak diizinkan berada di dalam parameter.',
            isCorrect: false,
            explanation: 'Tipe data apapun dapat dijadikan argumen, namun mutable default berbahaya.',
          },
          {
            text: 'Karena list akan otomatis terhapus oleh Garbage Collector sebelum fungsi selesai.',
            isCorrect: false,
            explanation: 'Justru sebaliknya: list tetap bertahan di memori objek fungsi selamanya.',
          },
        ],
      },
      {
        id: 'p4-q6',
        conceptId: 'python.functions.legb_scope',
        subBab: '4.2',
        question: 'Apa urutan pencarian nama variabel (Scope Resolution) berdasarkan aturan LEGB di Python?',
        options: [
          {
            text: 'Local -> Enclosing -> Global -> Built-in',
            isCorrect: true,
            explanation: 'Python mencari variabel pertama di namespace fungsi lokal, lalu fungsi luar yang membungkus (enclosing), lalu modul global, dan terakhir pustaka built-in bawaan.',
          },
          {
            text: 'Global -> Local -> Enclosing -> Built-in',
            isCorrect: false,
            explanation: 'Local selalu diutamakan terlebih dahulu untuk menghindari penimpaan variabel global tanpa sengaja.',
          },
          {
            text: 'Built-in -> Global -> Local -> Enclosing',
            isCorrect: false,
            explanation: 'Built-in adalah lapisan paling luar dan dicari paling akhir.',
          },
          {
            text: 'Local -> Global -> Enclosing -> Built-in',
            isCorrect: false,
            explanation: 'Enclosing scope (seperti pada closure) diperiksa sebelum modul global.',
          },
        ],
      },
      {
        id: 'p4-q7',
        conceptId: 'python.functions.dict_comprehension',
        subBab: '4.3',
        question: 'Apa hasil yang dibentuk oleh dictionary comprehension berikut?',
        codeSnippet: `nama_siswa = ["Ani", "Budi", "Citra"]
panjang_nama = {nama: len(nama) for nama in nama_siswa}
print(panjang_nama)`,
        options: [
          {
            text: '{"Ani": 3, "Budi": 4, "Citra": 5}',
            isCorrect: true,
            explanation: 'Kunci dictionary adalah nama siswa dan nilainya adalah hasil fungsi len() dari nama tersebut.',
          },
          {
            text: '{3: "Ani", 4: "Budi", 5: "Citra"}',
            isCorrect: false,
            explanation: 'Sintaks {nama: len(nama)} menempatkan nama sebagai key dan panjangnya sebagai value.',
          },
          {
            text: '["Ani": 3, "Budi": 4, "Citra": 5]',
            isCorrect: false,
            explanation: 'Dictionary menggunakan kurung kurawal {}, bukan kurung siku [].',
          },
          {
            text: '{"Ani", "Budi", "Citra"}',
            isCorrect: false,
            explanation: 'Ini adalah set, bukan dictionary pasangan key: value.',
          },
        ],
      },
      {
        id: 'p4-q8',
        conceptId: 'python.functions.positional_vs_keyword',
        subBab: '4.1',
        question: 'Diberikan fungsi def pesan(nama, salam="Halo", tanda="!"): ... Pemanggilan mana yang VALID?',
        options: [
          {
            text: 'pesan("Dina", tanda=".")',
            isCorrect: true,
            explanation: '"Dina" mengisi argumen posisi nama, salam menggunakan default "Halo", dan tanda diganti secara eksplisit menjadi ".".',
          },
          {
            text: 'pesan(salam="Hai", "Dina")',
            isCorrect: false,
            explanation: 'SyntaxError: argumen posisi tidak boleh berada setelah argumen kata kunci (keyword arguments).',
          },
          {
            text: 'pesan()',
            isCorrect: false,
            explanation: 'TypeError: argumen posisi nama wajib diisi karena tidak memiliki nilai default.',
          },
          {
            text: 'pesan("Dina", nama="Dina")',
            isCorrect: false,
            explanation: 'TypeError: argumen nama menerima nilai ganda.',
          },
        ],
      },
      {
        id: 'p4-q9',
        conceptId: 'python.functions.global_keyword',
        subBab: '4.2',
        question: 'Kata kunci apa yang harus dideklarasikan di dalam fungsi jika kita ingin memodifikasi variabel yang berada di tingkat global modul?',
        options: [
          {
            text: 'global',
            isCorrect: true,
            explanation: 'Deklarasi global nama_var memberitahu CPython agar penugasan (=) memperbarui referensi di namespace global modul, bukan membuat variabel lokal baru.',
          },
          {
            text: 'nonlocal',
            isCorrect: false,
            explanation: 'nonlocal digunakan untuk merujuk ke scope penutup (enclosing function) pada fungsi bersarang (closure), bukan scope modul global.',
          },
          {
            text: 'public',
            isCorrect: false,
            explanation: 'Python tidak memiliki kata kunci visibilitas public.',
          },
          {
            text: 'export',
            isCorrect: false,
            explanation: 'export adalah kata kunci JavaScript/TypeScript.',
          },
        ],
      },
      {
        id: 'p4-q10',
        conceptId: 'python.functions.higher_order',
        subBab: '4.3',
        question: 'Apa output dari pengurutan list tuple berikut menggunakan fungsi anonim lambda sebagai kunci?',
        codeSnippet: `produk = [("Laptop", 1200), ("Mouse", 25), ("Monitor", 300)]
produk_urut = sorted(produk, key=lambda item: item[1])
print([p[0] for p in produk_urut])`,
        options: [
          {
            text: "['Mouse', 'Monitor', 'Laptop']",
            isCorrect: true,
            explanation: 'Fungsi lambda mengambil indeks ke-1 (harga: 25, 300, 1200). sorted() mengurutkan dari harga termurah ke termahal.',
          },
          {
            text: "['Laptop', 'Monitor', 'Mouse']",
            isCorrect: false,
            explanation: 'Ini adalah urutan dari harga termahal (descending), sedangkan bawaan sorted() adalah ascending.',
          },
          {
            text: "['Laptop', 'Mouse', 'Monitor']",
            isCorrect: false,
            explanation: 'Ini adalah urutan alfabetis nama barang, bukan berdasarkan harga item[1].',
          },
          {
            text: '[25, 300, 1200]',
            isCorrect: false,
            explanation: 'List comprehension mengambil p[0] (nama barang), bukan angkanya.',
          },
        ],
      },
    ],
  },
  {
    chapterId: 'python-bab5',
    chapterNumber: 5,
    level: 'P5',
    slug: 'curriculum/python/p5',
    title: 'Pemrograman Berorientasi Objek',
    summary: 'Kuasai arsitektur OOP modern: pendefinisian Class & Object, parameter self & atribut instance, pewarisan hierarkis super(), enkapsulasi @property, dan magic dunder methods.',
    subBabs: [
      {
        id: 'subbab-5-1',
        number: '5.1',
        title: 'Class & Object',
        hash: '#subbab-5-1',
        description: 'Mendefinisikan cetak biru (class), konstruktor __init__, dan instansiasi objek di memori heap.',
      },
      {
        id: 'subbab-5-2',
        number: '5.2',
        title: 'Atribut & Method self',
        hash: '#subbab-5-2',
        description: 'Peran eksplisit argumen self sebagai pointer ke instance aktif, atribut instance vs atribut class.',
      },
      {
        id: 'subbab-5-3',
        number: '5.3',
        title: 'Pewarisan & super()',
        hash: '#subbab-5-3',
        description: 'Pewarisan sifat (inheritance), overriding method, pemanggilan konstruktor induk via super(), dan MRO.',
      },
      {
        id: 'subbab-5-4',
        number: '5.4',
        title: 'Enkapsulasi @property & Dunder',
        hash: '#subbab-5-4',
        description: 'Enkapsulasi terkendali dekorator @property/@setter, konvensi _protected, dan dunder methods (__str__, __repr__, __len__, __eq__).',
      },
    ],
    questions: [
      {
        id: 'p5-q1',
        conceptId: 'python.oop.self_parameter',
        subBab: '5.2',
        question: 'Mengapa method di dalam class Python wajib menyertakan parameter self sebagai parameter pertamanya?',
        codeSnippet: `class Akun:\n    def setor(self, nominal):\n        self.saldo += nominal`,
        options: [
          {
            text: 'Karena self adalah referensi eksplisit ke objek instance spesifik yang sedang memanggil method tersebut di memori.',
            isCorrect: true,
            explanation: 'Saat kita memanggil akun_a.setor(500), Python otomatis menerjemahkannya di belakang layar menjadi Akun.setor(akun_a, 500).',
          },
          {
            text: 'self adalah kata kunci wajib yang telah dipatenkan oleh compiler CPython.',
            isCorrect: false,
            explanation: 'self sebenarnya hanyalah konvensi penamaan parameter (PEP 8), secara teknis namanya bisa apapun namun self adalah standar mutlak.',
          },
          {
            text: 'Agar method tersebut dapat diakses tanpa perlu membuat instance class.',
            isCorrect: false,
            explanation: 'Method yang dapat dipanggil tanpa instance adalah staticmethod atau classmethod.',
          },
          {
            text: 'Untuk menghapus objek dari memori secara otomatis.',
            isCorrect: false,
            explanation: 'Penghapusan objek ditangani oleh Garbage Collector.',
          },
        ],
      },
      {
        id: 'p5-q2',
        conceptId: 'python.oop.init_constructor',
        subBab: '5.1',
        question: 'Apa peran utama dari dunder method __init__ pada sebuah class Python?',
        options: [
          {
            text: 'Menginisialisasi atribut-atribut awal instance begitu objek baru selesai dialokasikan di memori.',
            isCorrect: true,
            explanation: '__init__ berfungsi sebagai konstruktor inisialisasi status awal objek ketika nama kelas dipanggil.',
          },
          {
            text: 'Menghancurkan objek ketika program selesai.',
            isCorrect: false,
            explanation: 'Penghancuran objek ditangani oleh __del__.',
          },
          {
            text: 'Mengonversi class menjadi format JSON.',
            isCorrect: false,
            explanation: '__init__ tidak bertugas melakukan serialisasi data.',
          },
          {
            text: 'Mencegah pewarisan oleh subclass lain.',
            isCorrect: false,
            explanation: 'Di Python seluruh kelas dapat diwariskan secara alami.',
          },
        ],
      },
      {
        id: 'p5-q3',
        conceptId: 'python.oop.super_inheritance',
        subBab: '5.3',
        question: 'Bagaimana cara memanggil konstruktor class induk di dalam subclass anak?',
        codeSnippet: `class PegawaiTetap(Pegawai):\n    def __init__(self, nama, gaji, bonus):\n        super().__init__(nama, gaji)\n        self.bonus = bonus`,
        options: [
          {
            text: 'Menggunakan fungsi delegasi super().__init__(nama, gaji)',
            isCorrect: true,
            explanation: 'super() mendelegasikan inisialisasi ke kelas induk sesuai urutan Method Resolution Order (MRO) tanpa perlu menyebutkan nama kelas induk secara kaku.',
          },
          {
            text: 'Menggunakan kata kunci parent.__init__(self, nama, gaji)',
            isCorrect: false,
            explanation: 'Python tidak memiliki kata kunci parent.',
          },
          {
            text: 'Konstruktor induk otomatis terpanggil tanpa perlu kode apapun.',
            isCorrect: false,
            explanation: 'Jika subclass mendefinisikan __init__ sendiri, konstruktor induk tidak akan dieksekusi kecuali dipanggil via super().',
          },
          {
            text: 'this.__super__(nama, gaji)',
            isCorrect: false,
            explanation: 'this bukan sintaks Python.',
          },
        ],
      },
      {
        id: 'p5-q4',
        conceptId: 'python.oop.property_decorator',
        subBab: '5.4',
        question: 'Apa manfaat utama dari penggunaan dekorator @property pada getter method di Python?',
        codeSnippet: `class Lingkaran:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius`,
        options: [
          {
            text: 'Memungkinkan method dipanggil layaknya mengakses atribut biasa (lingkaran.radius) sambil menjaga kendali enkapsulasi dan validasi.',
            isCorrect: true,
            explanation: '@property menyediakan antarmuka atribut yang elegan tanpa sintaks method lingkaran.get_radius() gaya Java.',
          },
          {
            text: 'Mengunci atribut agar tidak bisa dibaca oleh siapapun.',
            isCorrect: false,
            explanation: '@property justru membuka akses baca yang bersih untuk atribut internal.',
          },
          {
            text: 'Menggandakan performa komputasi sebesar 50%.',
            isCorrect: false,
            explanation: '@property adalah pola desain sintaksis, bukan pemicu optimasi compiler numerik.',
          },
          {
            text: 'Mengubah class menjadi sebuah dictionary.',
            isCorrect: false,
            explanation: '@property adalah implementasi protokol Descriptors pada atribut class.',
          },
        ],
      },
      {
        id: 'p5-q5',
        conceptId: 'python.oop.dunder_str_vs_repr',
        subBab: '5.4',
        question: 'Apa perbedaan mendasar antara magic method __str__ dan __repr__ pada objek Python?',
        options: [
          {
            text: '__str__ ditujukan untuk representasi ramah pengguna (human-readable via print()), sedangkan __repr__ untuk informasi debugging teknis yang unambiguous.',
            isCorrect: true,
            explanation: 'Slogan resmi Python: __str__ adalah untuk pembaca akhir manusia, sedangkan __repr__ untuk developer debugging dan sedapat mungkin menyerupai kode inisialisasi.',
          },
          {
            text: '__str__ hanya untuk angka, sedangkan __repr__ hanya untuk teks.',
            isCorrect: false,
            explanation: 'Keduanya mengembalikan nilai bertipe str untuk objek apapun.',
          },
          {
            text: '__repr__ dijalankan otomatis saat program crash.',
            isCorrect: false,
            explanation: '__repr__ dipanggil oleh fungsi bawaan repr(obj) atau ketika objek dievaluasi di konsol REPL.',
          },
          {
            text: 'Tidak ada perbedaan sama sekali.',
            isCorrect: false,
            explanation: 'Keduanya memiliki tujuan semantik yang berbeda dalam CPython data model.',
          },
        ],
      },
      {
        id: 'p5-q6',
        conceptId: 'python.oop.class_vs_instance_attr',
        subBab: '5.2',
        question: 'Apa perbedaan antara atribut class dan atribut instance pada kode berikut?',
        codeSnippet: `class Robot:
    populasi = 0 # atribut class

    def __init__(self, nama):
        self.nama = nama # atribut instance
        Robot.populasi += 1`,
        options: [
          {
            text: 'populasi dibagi bersama oleh seluruh instance Robot, sedangkan nama bersifat unik untuk masing-masing instance objek.',
            isCorrect: true,
            explanation: 'Atribut class terikat pada objek class itu sendiri, sedangkan atribut instance terikat pada frame memori spesifik masing-masing instance.',
          },
          {
            text: 'populasi akan terhapus saat objek pertama selesai dibuat.',
            isCorrect: false,
            explanation: 'populasi tersimpan di namespace class Robot dan terus bertambah.',
          },
          {
            text: 'Keduanya memiliki sifat yang identik.',
            isCorrect: false,
            explanation: 'Cakupan kepemilikan memorinya sangat berbeda.',
          },
          {
            text: 'nama dapat diakses langsung tanpa membuat instance Robot.',
            isCorrect: false,
            explanation: 'nama melekat pada self saat instansiasi, tidak dapat diakses langsung via Robot.nama.',
          },
        ],
      },
      {
        id: 'p5-q7',
        conceptId: 'python.oop.encapsulation_convention',
        subBab: '5.4',
        question: 'Bagaimana konvensi resmi Python (PEP 8) untuk menandai bahwa suatu atribut bersifat internal / non-public?',
        options: [
          {
            text: 'Memberi awalan satu garis bawah, misal: _saldo',
            isCorrect: true,
            explanation: 'Di Python tidak ada kata kunci private kaku; konvensi prefiks _ menandai atribut internal yang sebaiknya tidak disentuh langsung dari luar class.',
          },
          {
            text: 'Menggunakan kata kunci private _saldo',
            isCorrect: false,
            explanation: 'Python tidak memiliki kata kunci private.',
          },
          {
            text: 'Menulis seluruh nama atribut dengan huruf kapital, misal: SALDO',
            isCorrect: false,
            explanation: 'HURUF_KAPITAL digunakan untuk konvensi konstanta.',
          },
          {
            text: 'Menambahkan tanda pagar (#) di depan nama variabel',
            isCorrect: false,
            explanation: 'Tanda pagar di Python adalah komentar, bukan private field seperti di JavaScript ES2022.',
          },
        ],
      },
      {
        id: 'p5-q8',
        conceptId: 'python.oop.dunder_eq',
        subBab: '5.4',
        question: 'Dunder method apa yang harus diimplementasikan agar dua objek kustom kita dapat dibandingkan kesamaannya menggunakan operator ==?',
        codeSnippet: `if titik_a == titik_b:\n    print("Titik identik")`,
        options: [
          {
            text: '__eq__(self, other)',
            isCorrect: true,
            explanation: 'Operator == secara internal memicu method a.__eq__(b) untuk menentukan kesamaan isi objek.',
          },
          {
            text: '__equals__(self, other)',
            isCorrect: false,
            explanation: 'Nama dunder resmi Python adalah __eq__, bukan __equals__.',
          },
          {
            text: '__compare__(self, other)',
            isCorrect: false,
            explanation: '__compare__ bukan magic method bawaan Python 3.',
          },
          {
            text: '__same__(self, other)',
            isCorrect: false,
            explanation: 'Gunakan protokol __eq__ untuk kesetaraan nilai.',
          },
        ],
      },
      {
        id: 'p5-q9',
        conceptId: 'python.oop.isinstance_check',
        subBab: '5.3',
        question: 'Fungsi bawaan manakah yang direkomendasikan untuk memeriksa apakah sebuah objek merupakan instance dari suatu class (atau turunannya)?',
        options: [
          {
            text: 'isinstance(obj, ClassName)',
            isCorrect: true,
            explanation: 'isinstance() mengecek relasi objek terhadap class sekaligus memperhitungkan hierarki pewarisan (inheritance-aware).',
          },
          {
            text: 'type(obj) == ClassName',
            isCorrect: false,
            explanation: 'Pengecekan type() kaku dan tidak mengenali bahwa objek anak adalah turunan sah dari kelas induk.',
          },
          {
            text: 'obj.instanceOf(ClassName)',
            isCorrect: false,
            explanation: 'instanceOf adalah operator JavaScript/Java, bukan Python.',
          },
          {
            text: 'obj.hasType(ClassName)',
            isCorrect: false,
            explanation: 'Tidak ada metode bawaan bernama hasType di Python.',
          },
        ],
      },
      {
        id: 'p5-q10',
        conceptId: 'python.oop.setter_validation',
        subBab: '5.4',
        question: 'Bagaimana cara menambahkan validasi nilai saat atribut yang didekorasi @property diisi nilai baru?',
        options: [
          {
            text: 'Membuat method dengan dekorator @nama_atribut.setter dan melempar ValueError jika nilai tidak valid.',
            isCorrect: true,
            explanation: 'Pasangan @property dan @nama_atribut.setter memungkinkan validasi data secara otomatis setiap kali sintaks penugasan obj.atribut = nilai dieksekusi.',
          },
          {
            text: 'Menulis fungsi validate() terpisah di luar class.',
            isCorrect: false,
            explanation: 'Cara ini tidak membungkus penugasan secara transparan pada akses atribut.',
          },
          {
            text: 'Menambahkan tipe data statis di baris pertama file.',
            isCorrect: false,
            explanation: 'Python tidak melakukan runtime validation otomatis dari type hints tanpa library eksternal.',
          },
          {
            text: 'Menggunakan dekorator @immutable.',
            isCorrect: false,
            explanation: '@immutable bukan dekorator bawaan untuk setter class.',
          },
        ],
      },
    ],
  },
];
