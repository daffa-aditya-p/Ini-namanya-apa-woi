# Catatan Keputusan Arsitektur (DECISIONS.md)

**Platform:** belajar.in  
**Format:** Architecture Decision Record (ADR)  
**Status Dokumen:** Disetujui — Fase 0  

Dokumen ini mencatat seluruh keputusan arsitektur utama, alasan rasional pemilihan, dan alternatif yang dievaluasi serta ditolak. Dokumen ini menjadi rujukan mengikat bagi seluruh fase implementasi selanjutnya.

---

## ADR-001: Pemilihan Framework Frontend — Astro 5 + React Islands + TypeScript Strict

### Konteks & Kebutuhan
Platform belajar.in adalah platform berbasis konten masif (ratusan pelajaran, modul, dokumentasi sintaks, dan artikel referensi) yang juga membutuhkan interaktivitas tinggi di titik-titik tertentu (editor kode, panel Socratic AI, kuis interaktif, terminal virtual). Mayoritas pengguna di Indonesia mengakses internet melalui smartphone kelas menengah dengan jaringan seluler yang fluktuatif. Kecepatan muat halaman (*Largest Contentful Paint* / LCP) adalah syarat mutlak.

### Keputusan
Kami mengadopsi **Astro 5.x** dengan arsitektur **Islands of Interactivity**, komponen interaktif dibangun menggunakan **React 19**, dan seluruh kode ditulis dalam **TypeScript dengan `strict: true`**.

### Alternatif yang Ditolak & Alasannya
1. **Next.js (App Router / SSR):**
   - *Alasan Penolakan:* Next.js memaksakan runtime Node.js/Edge pada server atau menghasilkan bundel hidrasi JavaScript klien yang relatif besar untuk halaman konten statis. Membutuhkan infrastruktur hosting server dinamis yang tidak sejalan dengan fase frontend-only/edge-static saat ini.
2. **Single Page Application (SPA) Murni (Vite + React Router):**
   - *Alasan Penolakan:* SPA murni membebankan rendering seluruh halaman materi ke perangkat klien. Menghasilkan *blank screen* saat parsing bundle awal, SEO yang buruk untuk materi kurikulum, dan waktu LCP yang lambat di HP murah.

### Konsekuensi
- **Positif:** Default zero-JavaScript untuk halaman bacaan; LCP di bawah 1.2 detik di jaringan 4G; SEO otomatis sempurna; komponen React hanya dimuat (*hydrated*) saat terlihat di viewport (`client:visible`) atau dibutuhkan (`client:idle`).
- **Negatif:** Tim harus memahami pola pemisahan antara Astro components (statis) dan React islands (dinamis); state global antar-pulau harus dikelola secara hati-hati (misal via Nanostores atau Custom Event Bus).

---

## ADR-002: Format Konten Kurikulum — MDX Terstruktur dengan Validasi Skema Zod

### Konteks & Kebutuhan
Kurikulum harus dapat ditulis dengan cepat oleh pembuat materi teknis, mendukung komponen interaktif yang disematkan langsung di dalam teks (misal: `<LivingCode />`, `<PredictOutput />`, `<QuizBox />`), dan divalidasi keutuhannya pada saat *compile-time* agar tidak ada materi yang rusak lolos ke produksi.

### Keputusan
Seluruh materi kurikulum disimpan sebagai file **MDX** di direktori repositori lokal (`src/content/curriculum/`) dan divalidasi menggunakan **Astro Content Collections** dengan skema **Zod** yang ketat pada saat proses `astro build`.

### Skema Metadata (Frontmatter):
```ts
z.object({
  id: z.string(),
  track: z.enum(['javascript', 'python']),
  level: z.string(), // e.g., 'J1', 'P2'
  title: z.string(),
  slug: z.string(),
  estimatedMinutes: z.number().int().positive(),
  prerequisites: z.array(z.string()),
  learningObjectives: z.array(z.string()),
  relatedConcepts: z.array(z.string()),
  languageVersion: z.string(), // e.g., 'ES2024', 'Python 3.12'
  summary: z.string(),
})
```

### Alternatif yang Ditolak
1. **Headless CMS (Strapi / Sanity / Contentful):** Menambahkan ketergantungan jaringan eksternal, latensi query API, biaya operasional server, dan menyulitkan pengujian otomatis di lingkungan CI lokal.
2. **Plain Markdown (.md):** Tidak memungkinkan penyematan komponen UI interaktif yang kaya di tengah alur bacaan.

---

## ADR-003: In-Browser Code Editor — CodeMirror 6 (CM6)

### Konteks & Kebutuhan
Platform memerlukan editor kode yang responsif di browser desktop maupun layar sentuh smartphone, mendukung pewarnaan sintaks (*syntax highlighting*) JavaScript dan Python, auto-completion, line numbers, dan aksesibilitas screen-reader yang baik tanpa membebani performa perangkat.

### Keputusan
Menggunakan **CodeMirror 6** (`@codemirror/state`, `@codemirror/view`, `@codemirror/lang-javascript`, `@codemirror/lang-python`).

### Alternatif yang Ditolak & Alasannya
1. **Monaco Editor (VS Code Engine):**
   - *Alasan Penolakan:* Ukuran bundel Monaco melebihi 5 MB, konsumsi memori tinggi, dan penanganan keyboard virtual serta touch scrolling di perangkat mobile Android sering kali rusak atau tidak nyaman bagi pengguna.
2. **Ace Editor:**
   - *Alasan Penolakan:* Basis kode arsitektur lama berbasis DOM manipulasi langsung, pohon aksesibilitas tertinggal, dan sistem ekstensi tidak modular.

### Konsekuensi
- **Positif:** Bundel super ringan (~300 KB), performa 60 FPS pada smartphone kelas menengah, penanganan sentuhan dan keyboard Android yang sangat stabil, model state fungsional yang mudah diintegrasikan dengan React hooks.
- **Negatif:** Konfigurasi ekstensi membutuhkan kurva pembelajaran lebih tinggi dibanding Monaco.

---

## ADR-004: Engine Eksekusi JavaScript di Browser — Web Worker Terisolasi + Sandboxed Iframe

### Konteks & Kebutuhan
Pengguna menulis kode JavaScript yang berpotensi memiliki infinite loop (`while(true)`), memakan memori berlebih, atau berupaya mengakses data sensitif browser. Eksekusi kode harus aman, tidak membekukan UI thread, dan memberikan tangkapan log console yang akurat.

### Keputusan
Eksekusi logika JavaScript non-DOM dijalankan di dalam **Dedicated Web Worker** terisolasi. Untuk latihan yang melibatkan manipulasi DOM (Level J3), kode dijalankan di dalam **Iframe bersandbox** (`sandbox="allow-scripts"` tanpa `allow-same-origin`).

### Mekanisme Keamanan:
1. **Watchdog Timeout:** Worker dibatasi waktu eksekusi maksimal 3000 ms. Jika timeout terlampaui, worker dimatikan via `worker.terminate()` dan di-spawn ulang.
2. **Console Interception:** Override fungsi `console.log`, `console.info`, `console.error` di dalam worker untuk mem-forward pesan ber-tipe data ke thread utama.
3. **No Storage Access:** Worker tidak memiliki akses ke `document.cookie`, `localStorage`, atau `sessionStorage`.

### Alternatif yang Ditolak
1. **`eval()` atau `new Function()` di Main Thread:** Ditolak keras karena rentan membekukan seluruh browser pengguna saat terjadi perulangan tanpa henti dan dapat mengakses variabel global aplikasi.

---

## ADR-005: Engine Eksekusi Python di Browser — Pyodide v0.27.2 (WASM) di Web Worker

### Konteks & Kebutuhan
Menjalankan Python di sisi klien tanpa server backend untuk fase frontend-only. Harus mendukung modul standar Python 3.12, manipulasi struktur data, dan library dasar.

### Keputusan
Menggunakan **Pyodide v0.27.2** yang dikompilasi ke WebAssembly (WASM), dijalankan di dalam **Dedicated Web Worker**.

### Ketentuan Implementasi:
1. **Lazy Loading Total:** Aset Pyodide (.wasm, wheel) dilarang dimuat saat awal pembukaan aplikasi. Aset hanya diunduh saat tombol "Jalankan Python" pertama kali ditekan oleh pengguna.
2. **Infinite Loop Guard:** Interupsi loop menggunakan terminasi worker tangguh atau `setInterruptBuffer` jika `SharedArrayBuffer` aktif.
3. **Transparansi Kemampuan:** Modul yang membutuhkan kompilasi CUDA atau dependensi server backend diberi label eksplisit *"Memerlukan Server Backend"* dan disajikan sebagai kode statis/simulasi, bukan mock palsu.

---

## ADR-006: Persistensi Progres Lokal & Arsitektur Backend-Ready

### Konteks & Kebutuhan
Fase 1-3 berfokus pada Frontend-Only. Namun, seluruh progres belajar pengguna (streak, status mastery, jawaban kuis, riwayat latihan) harus tetap tersimpan aman di perangkat pembelajar dan siap dimigrasikan ke backend database (PostgreSQL/Supabase/REST) nanti tanpa penulisan ulang UI.

### Keputusan
Seluruh interaksi data dilakukan melalui antarmuka layanan (**Service Interfaces**) TypeScript. Pada fase ini, implementasi menggunakan **Local Adapter** berbasis **IndexedDB** (dibungkus library **Dexie.js**):

```ts
export interface ProgressService {
  getProgress(lessonId: string): Promise<LessonProgress | null>;
  saveProgress(progress: LessonProgress): Promise<void>;
  getMasteryMap(): Promise<Record<string, number>>;
  updateStreak(): Promise<StreakInfo>;
}

export interface AuthService {
  getCurrentUser(): Promise<User | null>; // Return GuestUser saat lokal
  login(provider: string): Promise<void>;
  logout(): Promise<void>;
}

export interface AIGateway {
  mode: 'mock' | 'local' | 'remote';
  generateSocraticHint(req: TutorRequest): Promise<TutorResponse>;
  reviewCode(req: ReviewRequest): Promise<ReviewResponse>;
}
```

### Konsekuensi
Frontend sama sekali tidak mengetahui apakah data disimpan di IndexedDB lokal atau server remote. Ketika backend siap di masa depan, kita hanya perlu menukar `LocalProgressAdapter` dengan `HttpProgressAdapter` tanpa mengubah satu baris pun kode komponen UI.

---

## ADR-007: Arsitektur Multi-Agent AI & Anti-Halusinasi Berlapis

### Konteks & Kebutuhan
AI dalam platform belajar coding tidak boleh bertindak sebagai chatbot generik yang langsung memberikan jawaban atau memuntahkan fakta teknis keliru (halusinasi). AI harus mendidik dengan metode Socratic dan menjamin kebenaran kode yang disajikan.

### Keputusan
Sistem AI mengadopsi arsitektur **Multi-Agent Orchestrator** yang divalidasi oleh **Grounding Verifier**:
1. **Grounded RAG (Retrieval-Augmented Generation):** AI hanya merespons berdasarkan kutipan materi kurikulum resmi belajar.in atau spesifikasi MDN/ECMAScript/Python.
2. **Kewajiban Sitasi:** Setiap respons wajib menyertakan array `citations[]` yang memuat ID pelajaran atau tautan dokumentasi rujukan.
3. **Sandbox Execution Verification:** Setiap contoh kode atau perbaikan yang diajukan AI wajib dieksekusi di background worker (JS/Pyodide). Jika kode menghasilkan error, respons ditolak dan di-generate ulang.
4. **Gerbang Abstention:** Jika pertanyaan berada di luar kurikulum pemrograman atau bukti RAG tidak mencukupi, agen wajib menjawab: *"Saya belum memiliki dasar kurikulum yang cukup untuk pertanyaan ini, silakan rujuk modul [ID]..."*.
5. **Skema Terstruktur Zod:** Seluruh keluaran agen adalah JSON tervalidasi skema Zod, bukan teks bebas yang tidak terduga.

---

## ADR-008: Pemodelan Pengetahuan Pelajar — Bayesian Knowledge Tracing (BKT) & FSRS-4.5

### Konteks & Kebutuhan
Platform perlu mengetahui secara objektif apakah seorang pembelajar telah benar-benar memahami suatu konsep sebelum mengizinkannya membuka level berikutnya, serta kapan konsep tersebut harus diulas kembali.

### Keputusan
1. **Mastery Estimation:** Menggunakan model **Bayesian Knowledge Tracing (BKT)** untuk menghitung probabilitas laten $P(L_t)$ bahwa pelajar menguasai konsep $k$ setelah interaksi ke-$t$:
   $$P(L_t) = P(L_{t-1} \mid \text{Obs}) + (1 - P(L_{t-1} \mid \text{Obs})) \cdot P(T)$$
   - **Status Prior Awal:** Parameter $P(L_0) = 0.1$, probabilitas transisi $P(T) = 0.15$, probabilitas tebakan benar $P(G) = 0.20$, dan probabilitas slip $P(S) = 0.05$ ditetapkan sebagai **prior heuristik belum terkalibrasi** (*uncalibrated heuristic prior*) yang diadaptasi dari literatur Intelligent Tutoring Systems (Corbett & Anderson, 1994).
   - **Protokol Kalibrasi Empiris:** Ketika data riil interaksi mencapai ambang batas $N \ge 100$ pembelajar per konsep, sistem menerapkan kalibrasi berbasis algoritma **Expectation-Maximization (EM)** / Baum-Welch untuk mengoptimalkan parameter spesifik tiap konsep, mencegah distorsi estimasi penguasaan.
2. **Spaced Repetition Scheduler:** Menggunakan **FSRS-4.5** (Free Spaced Repetition Scheduler) yang menghitung interval review konsep berdasarkan Difficulty ($D$), Stability ($S$), dan Retrievability ($R$).

---

## ADR-009: Alur Pelatihan Remote via Google Colab CLI

### Konteks & Kebutuhan
Perangkat lokal pengguna (khususnya laptop spek standar atau smartphone Termux) tidak memiliki GPU diskrit berkekuatan komputasi tinggi untuk melatih model bahasa. Seluruh beban komputasi QLoRA harus dialihkan ke Google Colab remote tanpa membebani perangkat lokal.

### Keputusan
Menggunakan **Google Colab CLI resmi (`googlecolab/google-colab-cli` v0.7.5)** dengan siklus kerja terstruktur tanpa dependensi `drivemount`:
1. Penyiapan dataset terstruktur dan skrip eksekusi lokal di direktori `scripts/`.
2. Provisioning VM GPU remote: `colab new -s trainer --gpu T4`.
3. Verifikasi lingkungan: `colab exec -s trainer -f scripts/00_env_check.py`.
4. Eksekusi training: `colab exec -s trainer -f scripts/20_train_lora.py`.
5. Checkpoint otomatis disimpan ke direktori lokal VM Colab (`/content/checkpoints/`) dan disinkronkan ke Hugging Face Hub (private repository) menggunakan `huggingface_hub` API token.
6. Download artefak evaluasi terbaik dan adapter via `colab download -s trainer -r /content/checkpoints/best/ -d ./adapters/`.
7. Terminasi runtime segera: `colab stop trainer`.

### Alasan Penghapusan `drivemount`:
Perintah `colab drivemount` memerlukan autentikasi login browser interaktif Google Drive yang tidak kompatibel dengan workflow otomatis tanpa kepala (headless/CI) dan menimbulkan fragmentasi I/O FUSE. Pendekatan lokal VM + sinkronisasi Hugging Face Hub + `colab download` terbukti stabil, headless-ready, dan sepenuhnya deterministik.

---

## ADR-010: Mesin Pencarian Teks Lengkap Klien — MiniSearch

### Konteks & Kebutuhan
Pengguna membutuhkan pencarian instan (Cmd/Ctrl + K) untuk mencari sintaks, kata kunci kurikulum, dan istilah glosarium secara kilat (<50ms) bahkan saat mode offline.

### Keputusan
Menggunakan **MiniSearch** yang di-bundle di browser:
- Indeks pencarian di-generate secara deterministik pada saat `astro build` ke dalam file JSON ringkas (`search-index.json`).
- MiniSearch memuat indeks secara asinkron di browser dan melakukan pencarian fuzzy, prefix search, dan TF-IDF scoring dengan latensi di bawah 15ms tanpa server eksternal.

---

## ADR-011: Strategi Pengujian E2E & Visual Regression Testing via GitHub Actions & Colab Remote

### Konteks & Kebutuhan
Platform belajar.in mewajibkan pengujian end-to-end (E2E), visual regression testing pada 3 breakpoint layar (Mobile: 375px, Tablet: 768px, Desktop: 1440px), serta audit aksesibilitas otomatis standar WCAG 2.2 AA (`axe-core`). Namun, lingkungan pengembangan lokal di Termux berjalan di atas kernel Android dengan runtime **Bionic libc** (bukan glibc/musl) dan arsitektur aarch64.

Berdasarkan pengujian empiris langsung pada host Termux:
1. **Playwright & Chromium:** Binari resmi Playwright dikompilasi untuk GNU/Linux standar (`glibc`), memerlukan dependensi pustaka desktop (GTK3, NSS, ALSA, X11/Wayland), dan memanggil dynamic linker `/lib/ld-linux-aarch64.so.1` yang tidak ada di Android Bionic libc. Eksekusi `npx playwright test` di Termux gagal secara fatal (`browserType.launch: Host system is missing dependencies to run browsers`).
2. **Sharp (Image Processing):** Binari native C++ `sharp` (libvips) tidak menyediakan prebuilt binary untuk Android Bionic. Instalasi modul sharp native memicu kegagalan kompilasi node-gyp pada lingkungan tanpa desktop toolchain lengkap.
3. **Tailwind CSS v4 & esbuild:** Tailwind CSS v4 `@tailwindcss/vite` dan engine `esbuild` dapat berjalan di Termux melalui paket native Termux (`pkg install esbuild`) atau fallback pure JavaScript / WebAssembly (`esbuild-wasm`, `@img/sharp-wasm32`), namun eksekusi browser headless lokal tetap mustahil tanpa PRoot Linux glibc yang sangat lambat dan membebani RAM ponsel.

### Keputusan
Kami memutuskan memisahkan batas tanggung jawab eksekusi pengujian (*separation of testing environments*) secara tegas:

1. **Host Lokal (Termux Android):**
   - Dibatasi hanya untuk siklus pengembangan cepat (*fast inner-loop*): penulisan materi MDX, komponen React/Astro, pengujian unit & integrasi menggunakan **Vitest** (dengan mocking DOM / browser environment), validasi skema runtime **Zod**, dan kompilasi statis `astro build`.
   - Asset bundling menggunakan plugin Vite dengan fallback `@img/sharp-wasm32` (WebAssembly build) atau pass-through image service Astro (`image: { service: { entry: 'astro/assets/services/noop' } }`) untuk memotong dependensi libvips native.
   - Tailwind CSS v4 diintegrasikan via `@tailwindcss/vite` memanfaatkan wrapper esbuild API Node.js yang kompatibel.

2. **Pipeline CI Primer — GitHub Actions (`ubuntu-latest`):**
   - Menjadi gerbang penjamin kualitas resmi (*mandatory gate*) sebelum setiap penggabungan kode (*merge*) ke branch utama.
   - Menjalankan pipeline lengkap berbasis GNU/Linux x86_64:
     - `pnpm exec playwright install --with-deps chromium`
     - Eksekusi Visual Regression Test Playwright pada 3 viewport breakpoints:
       - **Mobile Viewport:** `375 x 667` (rasio ponsel umum di Indonesia)
       - **Tablet Viewport:** `768 x 1024`
       - **Desktop Viewport:** `1440 x 900`
     - Evaluasi deviasi visual pixel screenshot dengan threshold maksimal `diffRatio <= 0.001` (0.1%).
     - Audit aksesibilitas otomatis `@axe-core/playwright` dengan toleransi 0 violation untuk aturan WCAG 2.2 Level AA.

3. **Runner Ad-hoc Alternatif — Google Colab CPU Remote:**
   - Menyediakan lingkungan eksekusi pengujian visual mandiri bagi pengembang Termux yang ingin memverifikasi screenshot sebelum melakukan `git push` ke GitHub.
   - Memanfaatkan Google Colab CLI resmi:
     ```bash
     colab new -s test-runner
     colab exec -s test-runner -f scripts/run_e2e_colab.sh
     colab download -s test-runner -r /content/playwright-report/ -d ./test-artifacts/
     colab stop test-runner
     ```
   - Lingkungan Ubuntu 22.04 LTS pada VM Colab CPU tier gratis menyediakan glibc penuh dan dependensi Chromium lengkap tanpa biaya komputasi tambahan.

### Konsekuensi
- **Positif:** Siklus pengembangan lokal di Termux tetap sangat cepat, hemat baterai, dan bebas dari isu kompilasi C++/glibc; keandalan pengujian visual dan aksesibilitas 100% terjamin di lingkungan desktop Linux standar melalui GitHub Actions CI.
- **Negatif:** Developer tidak dapat melihat preview interaktif browser Chromium secara langsung di terminal Termux lokal (harus membuka preview web via browser peramban Android lokal `http://localhost:4321` atau mengunduh laporan screenshot dari CI/Colab).

