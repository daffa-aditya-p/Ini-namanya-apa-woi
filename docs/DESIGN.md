# Desain Sistem & Panduan Anti-Slop (DESIGN.md)

**Platform:** belajar.in  
**Konsep Desain:** *"Bengkel Kode & Buku Teks Hidup"* (*Living Technical Textbook & Code Workshop*)  
**Status:** Disetujui — Fase 0  

---

## 1. Manifesto Anti-AI Slop (Daftar Larangan Mutlak)

Sebagian besar antarmuka modern yang dihasilkan alat bantu AI terjebak dalam perangkap homogenisasi visual yang membosankan (*AI Slop*). Desain belajar.in memiliki integritas estetika dan fungsional yang kuat. Siapa pun yang melihat platform ini harus merasakan kehadiran tangan manusia yang memikirkan detail ergonomi kognitif secara sengaja.

### 1.1 DAFTAR ELEMEN YANG DILARANG KERAS:
1. **Dilarang Warna Klise AI:** Gradasi ungu-ke-biru neon (*purple-blue cyberpunk gradient*), efek "aurora blob" mengambang tanpa tujuan, dan glow/box-shadow berlebihan di belakang tombol utama.
2. **Dilarang Glassmorphism Berlebihan:** Efek `backdrop-blur` dan kartu semi-transparan di mana-mana yang membuat teks sulit dibaca dan memperlambat rendering GPU pada smartphone murah.
3. **Dilarang Kartu Seragam 3 Kolom:** Pola generik berupa grid 3 kartu berikon Lucide/Emoji bulat dengan judul 1 baris dan deskripsi 2 baris yang tidak memiliki kedalaman hierarki.
4. **Dilarang Tipografi Tanpa Karakter:** Memakai font sistem standar (Inter/Roboto default) tanpa pertimbangan ritme vertikal, kontras gaya, dan kenyamanan membaca teks panjang.
5. **Dilarang Copywriting Korporat Kosong:** Kalimat bombastis tanpa makna seperti *"Revolusikan perjalanan belajarmu bersama platform coding AI tercanggih"*, testimonial fiktif *"Budi Santoso - Software Engineer"*, statistik fiktif *"99.8% Sukses Kerja"*, dan logo palsu *"Dipercaya oleh perusahaan terkemuka"*.
6. **Dilarang Ornamen Visual Palsu:** Ilustrasi 3D mengambang dari situs stok (karakter kartun tanah liat memegang laptop), ikon emoji raksasa sebagai pengganti visualisasi data teknis, dan jarak spasi yang monoton tanpa variasi ketegangan ritme.
7. **Dilarang Animasi Tanpa Fungsi Pedagogis:** Efek parallax scrolling yang memusingkan, efek *hover-scale* (`scale-105`) pada setiap elemen interaktif, dan animasi masuk (*stagger fade-in*) yang menunda pengguna membaca teks.
8. **Dilarang Placeholder Bodoh:** Tidak boleh ada teks "Lorem Ipsum", "Coming Soon" kosong, atau mock palsu yang berpura-pura menjadi fitur aktif.

---

## 2. Esensi Konsep: "Bengkel Kode & Buku Teks Hidup"

Desain belajar.in memadukan dua atmosfer yang saling melengkapi:
- **Ketelitian Buku Teks Editorial Klasik:** Ketenangan membaca buku cetak teknis berkualitas tinggi (seperti karya Edward Tufte, buku O'Reilly klasik, atau buku *Crafting Interpreters* oleh Bob Nystrom). Memberikan ruang bernapas bagi otak untuk berkonsentrasi, merenungi kode, dan memahami konsep mendalam tanpa distraksi visual.
- **Kenyamanan & Ketangguhan Bengkel Kerja (Atelier):** Begitu pengguna beralih ke editor, antarmuka berubah menjadi meja kerja seorang perajin (*craftsman*) yang presisi. Setiap tuas (tombol run, panel inspeksi memori, timeline eksekusi) berada tepat di jangkauan tangan dengan feedback taktil yang jelas dan responsif.

---

## 3. Analisis 8 Referensi Desain Berkualitas Tinggi

Kami mengekstraksi prinsip fundamental dari delapan produk dengan desain berkarakter kuat:

1. **Crafting Interpreters (Bob Nystrom):** Menggunakan tipografi editorial hangat, catatan samping (*marginalia*), ilustrasi diagram tangan yang menjelaskan pointer memori secara visual, dan pembagian bab yang terstruktur anggun.
2. **Stripe Documentation:** Standar emas dalam visualisasi dua kolom (penjelasan di kiri, kode interaktif di kanan). Hirarki navigasi yang tajam, kontras tinggi, dan tata letak tab bahasa yang bersih.
3. **Rust Book & mdBook:** Desain minim distraksi (*distraction-free technical typography*). Mengutamakan keterbacaan teks teknis panjang dan kenyamanan navigasi keyboard.
4. **Linear:** Ritme spasi mikro yang sangat disengaja (*spatial rhythm*), palet warna gelap yang tidak murni hitam (menggunakan slate tint), dan responsivitas shortcut keyboard tingkat dewa.
5. **Tailwind CSS Documentation:** Efisiensi pencarian cepat (Cmd+K), tata letak dokumen yang adaptif terhadap viewport, dan penataan blok kode yang elegan.
6. **GitHub Primer Design System:** Ketahanan sistem desain terhadap ribuan variasi data, rasio kontras warna yang teruji untuk aksesibilitas, dan token warna semantik yang kokoh.
7. **Basecamp / 37signals:** Komunikasi copywriting yang hangat, jujur, lugas, manusiawi, dan menolak kepalsuan bahasa pemasaran korporat.
8. **Apple Developer Documentation:** Ruang negatif yang elegan, penataan tahapan belajar interaktif (*step-by-step tutorials*), dan kesatuan visual antar platform.

---

## 4. Tipografi: Karakter, Legibilitas, & Skala

Sistem tipografi belajar.in dirancang khusus untuk membedakan antara instruksi editorial, penegasan konsep, dan ketelitian baris kode. Seluruh font berlisensi bebas komersial (SIL Open Font License) dan mendukung karakter Bahasa Indonesia secara sempurna.

| Peran | Nama Font | Alasan Pemilihan & Karakter | Lisensi |
|---|---|---|---|
| **Display / Heading** | **Plus Jakarta Sans** | Dibuat oleh type foundry Indonesia (Tokotype). Geometris modern namun memiliki sentuhan kemanusiaan (*humanist curves*), sangat tajam dan berwibawa pada judul dan hierarki level. | SIL OFL |
| **Body / Editorial** | **Source Serif 4** | Karya Adobe. Memberikan kenyamanan membaca luar biasa pada teks konseptual panjang. Mengurangi kelelahan mata (*eye strain*) dibandingkan font sans-serif monolitik saat membaca penjelasan teoritis. | SIL OFL |
| **Code / Monospace** | **JetBrains Mono** | Dirancang khusus untuk programmer. Memiliki tinggi x (*x-height*) yang lega, glif yang sangat mudah dibedakan antara angka `0` dan huruf `O`, `1`, `l`, dan `I`, serta rendering tajam di layar smartphone beresolusi rendah. | SIL OFL |

### Skala Tipografi Modular (Modular Scale 1.25 — Major Third):
- `text-xs`: 0.75rem (12px) — Metadata, label badge, timestamp, keyboard shortcut tags.
- `text-sm`: 0.875rem (14px) — Teks kode editor, catatan kaki, glosarium tooltip.
- `text-base`: 1.000rem (16px) — Teks bacaan utama pada mobile, instruksi latihan.
- `text-lg`: 1.125rem (18px) — Teks bacaan utama pada desktop (optimal reading width 65ch).
- `text-xl`: 1.250rem (20px) — Subjudul bab, heading level 4.
- `text-2xl`: 1.563rem (25px) — Judul sub-modul, heading level 3.
- `text-3xl`: 1.953rem (31px) — Judul modul pelajaran, heading level 2.
- `text-4xl`: 2.441rem (39px) — Judul utama lintasan kurikulum, hero heading.

---

## 5. Sistem Warna & Token Semantik (Warm Paper & Slate Ink)

Kami menolak penggunaan warna hitam pekat `#000000` dan abu-abu generik. Palet belajar.in terinspirasi dari **kertas perkamen hangat** untuk tema terang (*Warm Paper*) dan **tinta batu tulis pekat** untuk tema gelap (*Slate Ink*).

### 5.1 Token Semantik Tema Terang (Warm Paper Base)
- `--bg-canvas`: `#FBFBF9` (Dasar kertas hangat alami, non-glare, ramah retina).
- `--bg-surface`: `#FFFFFF` (Permukaan kartu elevasi 1, kontras lembut).
- `--bg-subtle`: `#F2F2EC` (Latar belakang blok kode inline, header tabel, panel samping).
- `--border-default`: `#E2E2D8` (Garis pemisah struktural yang tegas dan terkalibrasi).
- `--border-focused`: `#1C1D1F` (Fokus batas interaktif aktif).
- `--text-primary`: `#1A1C1E` (Tinta pekat berkontras tinggi, rasio kontras 14.8:1 terhadap canvas).
- `--text-secondary`: `#5A5D63` (Teks pendukung, rasio kontras 5.2:1, lolos WCAG AA).
- `--text-muted`: `#686C76` (Petunjuk non-kritis, rasio kontras 5.07:1 terhadap canvas, lolos WCAG 2.2 AA).
- `--accent-terracotta`: `#BA3C23` (Aksen utama: terakota tanah liat nusantara; tombol aksi & penegasan).
- `--accent-teal`: `#1B6B6D` (Aksen sekunder: nilam laut; status terverifikasi & konsep).
- `--state-success`: `#1E7E34` (Status tes lulus, kompilasi hijau).
- `--state-warning`: `#B45309` (Peringatan eksekusi & tips penting).
- `--state-danger`: `#B91C1C` (Pesan galat kompilasi & kegagalan assertion).

### 5.2 Token Semantik Tema Gelap (Slate Ink Base)
- `--bg-canvas`: `#111317` (Batu tulis gelap dengan saturasi biru sangat rendah, bukan hitam AMOLED mentah).
- `--bg-surface`: `#181B22` (Elevasi panel editor dan kartu).
- `--bg-subtle`: `#212631` (Latar belakang toolbar dan area pasif).
- `--border-default`: `#2B3240` (Pemisah panel editor).
- `--border-focused`: `#EFF1F5` (Fokus batas interaktif aktif mode malam).
- `--text-primary`: `#EFF1F5` (Teks putih lembut tanpa pendar silau, rasio kontras 13.5:1).
- `--text-secondary`: `#9BA3AF` (Teks penjelasan sekunder).
- `--text-muted`: `#949BA6` (Petunjuk non-kritis mode malam, rasio kontras 6.64:1 terhadap canvas, lolos WCAG 2.2 AA).
- `--accent-terracotta`: `#E05D43` (Terakota hangat mode malam).
- `--accent-teal`: `#34B3AD` (Teal lembut mode malam).
- `--state-success`: `#28A745` (Indikator hijau tes).
- `--state-warning`: `#F59E0B` (Indikator amber).
- `--state-danger`: `#EF4444` (Indikator merah error).

---

## 6. Desain untuk Dua Persona: Mode Santai vs Mode Cepat

Platform belajar.in tidak memaksa satu format seragam untuk semua orang. Pengguna dapat beralih mode kapan saja di toolbar atas:

### 6.1 Mode Santai (Dirancang untuk Guru, Mahasiswa Non-Teknik, Karier Baru)
- **Karakter Visual:** Lebar baris longgar (*line-height: 1.75*), margin vertikal lega antar-paragraf.
- **Glosarium Interaktif:** Setiap istilah teknis (seperti *variabel*, *loop*, *array*, *rekursi*) ditandai dengan garis bawah putus-putus lembut. Menyentuh istilah tersebut langsung memunculkan tooltip popover berupa analogi dunia nyata tanpa meninggalkan konteks bacaan.
- **Visualisasi Analogi:** Menyediakan diagram skematis berbasis analogi fisik (misal: variabel sebagai wadah bertoples label, antrean array sebagai loket tiket).
- **Penanganan Kesalahan:** Pesan error compiler diterjemahkan secara otomatis ke dalam bahasa manusia yang empatik dan menenangkan (*"Jangan khawatir! Komputer bingung karena kamu menulis `prnt` alih-alih `print` di baris 3"*).

### 6.2 Mode Cepat (Dirancang untuk Mahasiswa IT, Programmer Berpindah Bahasa)
- **Karakter Visual:** Densitas tinggi (*compact mode*, *line-height: 1.5*), layout dua kolom horizontal penuh (teks teknis di kiri, editor di kanan).
- **Shortcut & Efisiensi:** Dukungan penuh navigasi keyboard (Ctrl/Cmd+Enter untuk Run, Alt+N untuk Next Exercise, Cmd+K untuk Command Palette).
- **Rujukan Spesifikasi Langsung:** Tautan langsung ke bagian bab spesifikasi ECMAScript / Python PEP.
- **Terminal & Memory Inspector:** Panel inspeksi memori menampilkan representasi Call Stack dan Heap allocation secara nyata.

---

## 7. Tanda Tangan Visual (Visual Signatures) belajar.in

Dua elemen desain ikonik yang menjadi ciri khas orisinal belajar.in:

1. **The Step-by-Step Execution Trace Studio (Studio Jejak Eksekusi):**  
   Di bawah blok kode latihan terpandu, terdapat slider timeline interaktif. Ketika digeser, antarmuka menyorot baris kode yang sedang berjalan dan menampilkan animasi perpindahan nilai variabel di memori. Pengguna dapat "memutar mundur waktu" untuk memahami persis di mana logika kode mereka menyimpang.

   **Arsitektur Hibrida Trace Studio (Resolusi Konflik Instrumentasi):**
   - *Trace Pra-Build untuk Materi Kurikulum:* Untuk kode pelajaran bawaan (Living Code dan Faded Examples), seluruh snapshot eksekusi (state frame, variabel, baris aktif, pointer memori) di-generate pada saat proses compile/build (Astro build-time AST runner) dan disimpan sebagai artefak JSON statis teroptimasi. Klien hanya me-render frame JSON yang sudah terhitung sebelumnya sehingga interaksi timeline scrub mencapai 60 FPS tanpa overhead eksekusi di browser.
   - *Native `sys.settrace` untuk Kode Pengguna di Pyodide:* Untuk kode bebas yang diketikkan pembelajar pada latihan mandiri, platform menolak keras instrumentasi injeksi kode sumber (*code string mutation/rewriting*) yang rapuh dan mengubah nomor baris error. Sebagai gantinya, runner Python di Web Worker Pyodide menggunakan API pelacakan native CPython: `sys.settrace()`. Callback `sys.settrace` mengumpulkan frame eksekusi baris-per-baris, frame locals, globals, dan stack depth secara deterministik dan terisolasi tanpa merusak kode asli pengguna. Untuk JavaScript, runner worker menggunakan AST instrumentation berbasis Babel/Acorn sandboxed hooks murni pada level Web Worker.
2. **Visual Mastery Constellation (Konstelasi Penguasaan Konsep):**  
   Di halaman dasbor, kemajuan belajar tidak ditampilkan sebagai diagram lingkaran persentase generik yang membosankan, melainkan sebagai **peta graf konstelasi berjejaring interaktif (DAG)**. Setiap konsep (node) bersinar sesuai tingkat probabilitas penguasaan BKT. Jalur yang belum terbuka terhubung oleh garis putus-putus temaram, memberikan rasa petualangan intelektual yang nyata.

---

## 8. Prinsip Gerak & Animasi Fungsional

Animasi di belajar.in tunduk pada satu aturan mutlak: **Animasi hanya diizinkan jika ia membantu menjelaskan fenomena yang tidak terlihat.**
- **Boleh & Wajib:** 
  - Visualisasi perpindahan pointer array saat operasi `pop()` atau `push()`.
  - Alur perpindahan tugas dari Call Stack ke Web API lalu ke Microtask Queue pada modul Event Loop.
  - Transisi halus progress bar saat tes unit selesai dieksekusi (<200ms, ease-out).
- **Dilarang Keras:** 
  - Animasi melayang (*floating bounce*) pada kartu fitur.
  - Transisi halaman yang lambat dan memakan waktu tunggu pengguna.
- **Aksesibilitas Gerak:** Seluruh animasi wajib menghormati media query `@media (prefers-reduced-motion: reduce)`. Jika pengguna menyalakan opsi ini di sistem operasi, seluruh animasi diganti dengan perubahan status seketika (*instant state change*).

---

## 9. Nada Bicara (Tone of Voice) & Copywriting

Copywriting belajar.in menggunakan Bahasa Indonesia yang:
- **Jelas, Ringkas, dan Bersahabat:** Menggunakan kata-kata baku yang lazim digunakan di komunitas rekayasa perangkat lunak Indonesia tanpa terkesan kaku seperti terjemahan mesin buku manual.
- **Empatik & Anti-Merendahkan:** Tidak pernah berasumsi pembelajar "bodoh", dan tidak pernah menyepelekan konsep rumit dengan kata-kata kosong seperti *"Ini sangat gampang!"*.
- **Contoh Perbandingan Suara:**
  - *Buruk (AI Slop):* "Kuasai seni pemrograman mutakhir dan buka potensi tanpa batasmu bersama kurikulum berteknologi kecerdasan buatan terdepan!"
  - *Buruk (Kaku Mesin):* "Lakukan inisialisasi variabel dan eksekusi iterasi melalui koleksi array untuk mengembalikan nilai boolean."
  - *Baik (belajar.in):* "Mari kita mulai dari hal paling mendasar: bagaimana komputer mengingat data. Bayangkan variabel seperti memberi nama pada toples bumbu dapurmu."

---

## 10. Siklus Kritik Desain & Verifikasi Playwright (Design Review Loop)

Sebelum suatu halaman UI dianggap selesai pada fase berikutnya, halaman tersebut harus melewati siklus kritik desain mandiri:
1. **Automated Snapshot Playwright:** Skrip pengujian otomatis mengambil tangkapan layar penuh (*full-page screenshot*) di 3 breakpoint kunci:
   - **Mobile (Small):** Viewport `375 x 667 px` (Representasi smartphone entry/mid-level di Indonesia).
   - **Tablet:** Viewport `768 x 1024 px`.
   - **Desktop:** Viewport `1440 x 900 px`.
2. **Audit Kepatuhan Daftar Larangan (§1.1):** Evaluasi visual terhadap ada tidaknya gradasi neon, aurora blob, kartu seragam, atau teks placeholder.
3. **Audit Kontras Warna (Axe-Core):** Seluruh elemen antarmuka harus lulus audit otomatis rasio kontras WCAG 2.2 Level AA (minimal 4.5:1 untuk body text dan 3:1 untuk elemen interaktif).
4. **Dokumentasi Review:** Tangkapan layar sebelum dan sesudah kritik disimpan di direktori `docs/design-review/` beserta catatan penyempurnaan desain.
