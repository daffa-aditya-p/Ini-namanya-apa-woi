# Kurikulum Terstruktur & Matriks Penguasaan (CURRICULUM.md)

**Platform:** belajar.in  
**Prinsip Desain:** Berjenjang, Penguasaan Berbasis Bukti (*Mastery Gates*), Pendekatan Ganda (*Dual-Track*).  
**Status:** Versi Tervalidasi Fase 0  

---

## 1. Filosofi & Prinsip Kurikulum

Kurikulum **belajar.in** dibangun atas tiga prinsip utama yang membedakannya secara radikal dari platform konvensional:

1. **Gerbang Penguasaan 4-Poin (4-Point Mastery Gates Standard):**  
   Pengguna tidak dapat "sekadar menonton" atau scroll cepat untuk membuka modul selanjutnya. Level baru hanya terbuka jika pelajar berhasil memenuhi 4 kriteria kelulusan baku:
   - **100% Test Pass:** Menyelesaikan seluruh latihan mandiri (*auto-graded unit tests* 100% lulus/hijau).
   - **BKT Mastery Threshold:** Estimasi probabilitas penguasaan Bayesian Knowledge Tracing $P(L) \ge 0.85$ untuk setiap simpul konsep modul.
   - **Mini-Quiz Score:** Nilai kuis mini $\ge 80\%$ (skor *retrieval practice* aktif).
   - **Capstone Level:** Menyelesaikan 1 proyek mini integrasi nyata (*capstone level*) yang menguji integrasi konsep.
   
   *Mekanisme Fast-Track Level Test-Out:* Bagi pembelajar berpengalaman, setiap level menyediakan opsi ujian komprehensif *Level Test-Out* (kuis acak $\ge 85\%$ dan 1 proyek mini capstone lulus 100%) untuk langsung membuka level berikutnya (*unlocked*) tanpa harus melewati setiap pelajaran secara linier.
2. **Dual-Track Presentation (Jalur Santai vs Jalur Cepat):**  
   Setiap modul materi memiliki dua opsi penyajian tanpa mengubah capaian kompetensi inti:
   - **Jalur Santai (Non-IT Friendly):** Disajikan dengan analogi kehidupan nyata (misal: antrean loket stasiun, resep masakan ibu, brankas hotel), pemecahan langkah mikro (*small incremental steps*), glosarium istilah instan, dan penjelasan visual interaktif.
   - **Jalur Cepat (Teknis / Fast-Track):** Disajikan dengan densitas tinggi, langsung ke inti arsitektur dan spesifikasi resmi (ECMA-262 / PEP), membandingkan trade-off performa, dan menyediakan shortcut keyboard instan.
3. **Anatomi 8-Bagian yang Baku:**  
   Setiap unit pelajaran di seluruh platform mengikuti struktur anatomi konsisten (lihat §4).

---

## 2. Matriks Cakupan Topik & Topik yang Sering Terlewat Platform Lain

Berdasarkan benchmark komparatif terhadap roadmap.sh, Dicoding, MDN, javascript.info, docs.python.org, dan CS50x, berikut adalah matriks topik yang sering **diabaikan atau disederhanakan secara keliru** oleh platform lain, dan bagaimana belajar.in menanganinya:

| Topik Fundamental | Status di Platform Umum Lain | Penanganan Khusus di belajar.in | Modul Terkait |
|---|---|---|---|
| **Model Memori (Stack vs Heap & Nilai vs Referensi)** | Sering dianggap "terlalu rumit", hanya diajarkan sintaks `let a = b`. Mengakibatkan bug mutasi objek tak terduga. | Visualisasi pointer eksplisit di antarmuka; pembuktian mutasi objek vs re-assigning pointer referensi. | J1, J2, P2 |
| **Event Loop: Microtask vs Macrotask Queue** | Sering hanya diajarkan "Promise jalan belakangan", tanpa membedakan `process.nextTick`, `queueMicrotask`, `Promise.then`, dan `setTimeout`. | Visual simulator interaktif step-by-step yang memperlihatkan eksekusi Call Stack, Microtask Queue, dan Macrotask Queue. | J3, J5 |
| **Floating Point IEEE-754 (`0.1 + 0.2 !== 0.3`)** | Hanya dijadikan lelucon internet tanpa menjelaskan representasi biner pecahan basis 2 di tingkat mesin. | Bedah representasi bit IEEE-754 mantissa dan eksponen; strategi penanganan via `Number.EPSILON` dan integer scaling. | J1, P1 |
| **Unicode, ASCII, UTF-8, & String Grapheme Clusters** | Dianggap sepele, sehingga pemula bingung saat `'👍'.length === 2` atau handling karakter non-Latin di Indonesia (aksara daerah). | Pelajaran khusus tentang Code Points, Surrogate Pairs, UTF-8 encoding, dan `Intl.Segmenter`. | J2, P2 |
| **Error Handling Asinkron & Boundary** | Sebagian besar platform hanya mengajarkan `try/catch` sinkron. Pemula bingung saat `try/catch` tidak menangkap error di callback `setTimeout`. | Bedah unhandled rejections, boundary error asinkron, `Promise.allSettled`, dan error monitoring pattern. | J3, P4 |
| **Pesan Galat & Metodologi Debugging Sistematis** | Pemula sering panik melihat baris merah stack trace dan langsung mencari jawaban di Google/AI tanpa membaca. | Modul Level 0 khusus bedah anatomi stack trace, cara melacak file & baris error, dan teknik isolasi masalah. | Level 0 |

---

## 3. Struktur Kurikulum Berjenjang

### 3.1 Level 0 — Prelude untuk Non-IT (Opsional, Dapat Di-skip via Placement Test)
- **Tujuan Pembelajaran:** Menghilangkan rasa takut terhadap komputer, membangun intuisi berpikir komputasional, dan memahami ekosistem web tanpa jargon yang mengintimidasi.
- **Estimasi:** 6–8 jam belajar.
- **Cakupan Modul:**
  1. *L0.1 Berpikir Komputasional* `[Browser]`: Logika urutan instruksi (*sequence*), percabangan keputusan (*branching*), dan perulangan (*looping*) menggunakan analogi resep membuat nasi goreng dan tata tertib antrean bank.
  2. *L0.2 Pseudocode & Logika Alur* `[Browser]`: Menulis langkah logika terstruktur sebelum menyentuh sintaks kode formal.
  3. *L0.3 Bagaimana Web Bekerja Sebenarnya* `[Baca-Saja]`: Peran browser (klien), internet/kabel fiber optic, server, dan analogi restoran (Browser = Pembeli, URL = Buku Menu, Server = Dapur, HTTP = Pelayan).
  4. *L0.4 Menjinakkan Lingkungan Kerja* `[Browser]`: Anatomi browser DevTools (Elements & Console), teks editor, dan terminal interaktif ramah pemula.
  5. *L0.5 Jangan Panik Saat Error* `[Browser]`: Membaca pesan error seperti dokter membaca hasil rontgen: menemukan jenis error, file penyebab, dan baris spesifik.
  6. *L0.6 Seni Mencari Jawaban & Etika Bertanya* `[Baca-Saja]`: Cara membaca dokumentasi resmi, teknik merumuskan pertanyaan teknis dengan *Minimal Reproducible Example* (MRE).
- **Proyek Akhir Level 0:** `[Browser]` *Flowchart & Pseudocode Simulator* untuk sistem kasir warung makan sederhana.

---

### 3.2 Jalur JAVASCRIPT (Nol → Expert)

#### Level J1: Fundamental JavaScript
- **Tujuan:** Menguasai fondasi sintaks modern, tipe data primitif, kontrol alur, dan fungsi modular.
- **Estimasi:** 15 jam belajar.
- **Cakupan Topik & Modul:**
  - J1.1 Runtime JS: Sejarah V8, browser vs Node.js vs Bun `[Baca-Saja]`
  - J1.2 Sintaks modern: `let` dan `const` (pembedahan mengapa `var` dan hoisting berbahaya) `[Browser]`
  - J1.3 Tipe data primitif (string, number, boolean, null, undefined, bigint, symbol) `[Browser]`
  - J1.4 Type coercion: implisit vs eksplisit, kejanggalan `==` vs keharusan `===` `[Browser]`
  - J1.5 Operator logika, perbandingan, ternary, nullish coalescing `??`, optional chaining `?.` `[Browser]`
  - J1.6 Percabangan (`if/else`, `switch/case`) dan perulangan (`for`, `while`, `for...of`) `[Browser]`
  - J1.7 Fungsi: function declaration, function expression, arrow functions, default parameters, rest parameters `[Browser]`
  - J1.8 Scope: Global, Function, Block scope, dan Lexical scope dasar `[Browser]`
  - J1.9 Debugging praktis menggunakan `console.log`, `console.table`, `console.time` `[Browser]`
- **Mini Proyek J1:** `[Browser]` Kalkulator Konversi Keuangan Sederhana dengan validasi input interaktif.

#### Level J2: Core JavaScript & Struktur Data
- **Tujuan:** Memahami paradigma manipulasi data in-memory, closure, prototipe, dan pemrograman berorientasi objek modern.
- **Estimasi:** 20 jam belajar.
- **Cakupan Topik & Modul:**
  - J2.1 Array modern methods: `map`, `filter`, `reduce`, `find`, `some`, `every`, `flat`, `flatMap`, `toSorted`, `toReversed` `[Browser]`
  - J2.2 Object manipulation: Destructuring, spread operator, `Object.entries`, `Object.fromEntries`, `Object.groupBy` (ES2024) `[Browser]`
  - J2.3 Mutability vs Immutability: Deep clone vs shallow copy (`structuredClone` vs spread) `[Browser]`
  - J2.4 Closures mendalam: Bagaimana variabel leksikal tetap hidup di heap memory `[Browser]`
  - J2.5 Kata kunci `this` dan eksekusi konteks (`bind`, `call`, `apply`) `[Browser]`
  - J2.6 Prototype chain, Prototypes inheritance vs Class syntax modern (`#privateField`, static methods, getters/setters) `[Browser]`
  - J2.7 Error Handling tangguh: `try/catch/finally`, custom Error classes bertingkat `[Browser]`
  - J2.8 Modul ES: `import` / `export` (named & default) `[Browser]`
  - J2.9 JSON serialization & manipulasi tanggal via `Date` dan `Intl.DateTimeFormat` `[Browser]`
- **Mini Proyek J2:** `[Browser]` Engine Manajemen Tugas & Filter Data Siswa (*In-Memory Store*) dengan relasi data dan custom error.

#### Level J3: JavaScript di Browser & Pemrograman Asinkron
- **Tujuan:** Berinteraksi penuh dengan antarmuka web, manipulasi DOM performan, penanganan jaringan, dan asinkronitas modern.
- **Estimasi:** 25 jam belajar.
- **Cakupan Topik & Modul:**
  - J3.1 Anatomi DOM & CSSOM, pemilihan elemen efisien (`querySelector`), manipulasi atribut & class `[Browser]`
  - J3.2 Event model: Bubbling, Capturing, Event Delegation, `event.preventDefault()`, `event.stopPropagation()` `[Browser]`
  - J3.3 Form validation: Constraint Validation API, validasi custom realtime `[Browser]`
  - J3.4 Web Storage: `localStorage`, `sessionStorage`, `IndexedDB` pengantar `[Browser]`
  - J3.5 Revolusi Asinkron: Callback Hell -> Promises (`then/catch/finally`) -> `async/await` `[Browser]`
  - J3.6 Promise Combinators: `Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any`, `Promise.withResolvers` (ES2024) `[Browser]`
  - J3.7 Network Request: `fetch` API, HTTP headers, penanganan error jaringan vs HTTP status code `[Browser]`
  - J3.8 Pembatalan request via `AbortController` dan timeout penanganan jaringan lambat `[Browser]`
  - J3.9 Visualisasi Event Loop: Call stack, Web APIs, Microtask Queue vs Macrotask Queue `[Browser]`
- **Mini Proyek J3:** `[Browser]` Aplikasi Pencarian Cuaca & Gempa Realtime Indonesia (BMKG API) dengan debouncing, pembatalan request `AbortController`, dan caching offline di `localStorage`.

#### Level J4: Modern Engineering & Tooling
- **Tujuan:** Beralih dari programmer sintaks menjadi rekayasawan perangkat lunak yang menguasai toolchain industri.
- **Estimasi:** 25 jam belajar.
- **Cakupan Topik & Modul:**
  - J4.1 Package Manager: `npm`, `pnpm`, pemahaman `package.json`, semantic versioning exact `[Baca-Saja]`
  - J4.2 Bundler modern: Arsitektur Vite (ESM dev server vs Rollup production build) `[Baca-Saja]`
  - J4.3 Version Control: Git dasar hingga kolaborasi branching, merge conflict, GitHub Pull Request workflow `[Baca-Saja]`
  - J4.4 Code Quality: ESLint v9 flat config, Prettier formatting `[Baca-Saja]`
  - J4.5 Unit Testing: Vitest (test suites, matchers, mocking network requests, test coverage) `[Browser]` *(Di sisi browser siswa dieksekusi via mini runner bergaya Vitest dengan API kompatibel `describe/it/expect`; ekosistem tooling CLI Vitest lengkap & coverage dipelajari di `[Baca-Saja]` / CI / Colab)*
  - J4.6 TypeScript Pengantar: Primitive types, Interfaces, Type Aliases, Generics dasar, konfigurasi `tsconfig.json` `[Browser]`
  - J4.7 Fondasi Backend Node.js: Event loop di Node, modul `fs/promises`, `http`, environment variables (`process.env`) `[Backend]`
  - J4.8 Dasar Keamanan Web: Cross-Site Scripting (XSS), CSRF, Content Security Policy (CSP), CORS headers (analisis mengapa endpoint publik seperti BMKG JSON `autogempa.json` menyajikan `Access-Control-Allow-Origin: *` sehingga ramah browser, sedangkan endpoint umum memblokir request browser) `[Baca-Saja]`
- **Mini Proyek J4:** `[Browser]` Komponen UI Autocomplete Tipe TypeScript penuh yang diuji dengan mini runner bergaya Vitest (100% test coverage) dan di-bundle via Vite.

#### Level J5: Advanced JavaScript & Architecture
- **Tujuan:** Menembus batas internal JavaScript, optimasi memori, konkurensi di browser, dan metaprogramming.
- **Estimasi:** 30 jam belajar.
- **Cakupan Topik & Modul:**
  - J5.1 Metaprogramming: `Proxy` dan `Reflect` (membangun sistem reaktivitas state) `[Browser]`
  - J5.2 Advanced Iteration: Symbols, Symbol.iterator, Generators (`function*`), Async Generators `[Browser]`
  - J5.3 Manajemen Memori Lanjut: V8 Garbage Collector (Generational GC, Scavenge, Mark-Sweep), Memory Leaks, `WeakMap`, `WeakSet`, `WeakRef`, `FinalizationRegistry` `[Browser]`
  - J5.4 Web Workers & Multithreading: Dedicated Workers, transferable objects (`ArrayBuffer`), pembagian komputasi berat `[Browser]`
  - J5.5 Streams API: `ReadableStream`, `WritableStream`, `TransformStream` untuk pengolahan data raksasa chunk-by-chunk `[Browser]`
  - J5.6 Functional Programming: Pure functions, Currying, Higher-Order Functions, Function Composition `[Browser]`
  - J5.7 Design Patterns di JavaScript: Observer, Factory, Singleton, Strategy, Module Pattern `[Browser]`
  - J5.8 Web Performance & Profiling: Chrome DevTools Performance panel, Long Tasks, Core Web Vitals (LCP, INP, CLS) `[Baca-Saja]`
- **Mini Proyek J5:** `[Browser]` Mini Reactive State Management Library (seperti sinyal Preact / mini MobX) yang dibangun dari nol menggunakan `Proxy`, dilengkapi deteksi dependency otomatis dan test suite benchmarking.

#### Level J6: Expert JavaScript & Engine Internals
- **Tujuan:** Penguasaan tingkat arsitek sistem, pembacaan spesifikasi resmi TC39, dan pembuatan infrastruktur mandiri.
- **Estimasi:** 35 jam belajar.
- **Cakupan Topik & Modul:**
  - J6.1 Engine Pipeline: Lexical Analysis -> AST (Abstract Syntax Tree) parsing -> Bytecode compilation (Ignition) -> JIT Optimization (TurboFan), Deoptimization traps (hidden classes, inline caches) `[Baca-Saja]`
  - J6.2 Bedah Spesifikasi ECMAScript: Cara membaca dokumen formal TC39, mengurai notasi abstrak (*Abstract Operations*, misal `ToPrimitive`, `OrdinaryGetOwnProperty`) `[Baca-Saja]`
  - J6.3 Roll Your Own: Implementasi `Promise` A+ compliant dari nol `[Browser]`
  - J6.4 Roll Your Own: Implementasi `EventEmitter` berperforma tinggi dengan memory-leak warning `[Browser]`
  - J6.5 Roll Your Own: Mini Reactive UI Renderer (mini Virtual DOM / Template Engine) `[Browser]`
  - J6.6 Concurrency Control: Async queue with concurrency limits, retry with exponential backoff, rate limiters di browser `[Browser]`
  - J6.7 Web Observability: Custom performance markers, User Timing API, structured client-side telemetry `[Browser]`
  - J6.8 Audit Keamanan & Hardening: Prototype pollution defense (`Object.freeze`, `Map` aman), sandboxing teknik `[Browser]`
- **Capstone Proyek J6:** `[Browser]` Browser-based Database Engine in-memory dengan indexing B-Tree, transaksi ACID sederhana, query parser string, dan penyimpanan terenkripsi di IndexedDB.

---

### 3.3 Jalur PYTHON (Nol → Expert)

#### Level P1: Fondasi Pemrograman Python
- **Tujuan:** Menulis kode Python idiomatik yang bersih, memahami sintaks berbasis indentasi, dan kontrol alur dasar.
- **Estimasi:** 15 jam belajar.
- **Cakupan Topik & Modul:**
  - P1.1 Filosofi Python: *The Zen of Python* (`import this`), REPL interaktif, menjalankan script via terminal `[Browser]`
  - P1.2 Indentasi dan struktur blok kode (menghapus kebiasaan kurung kurawal) `[Browser]`
  - P1.3 Variabel sebagai *name binding* (bukan kotak statis), tipe data dinamis `[Browser]`
  - P1.4 Tipe numerik: `int`, `float`, aritmetika pembagian bulat `//`, modulus `%`, eksponen `**` `[Browser]`
  - P1.5 Manipulasi String: Single/Double/Triple quotes, f-strings modern, escape sequences, string methods `[Browser]`
  - P1.6 Input/Output interaktif: fungsi `print()` dengan separator/end, `input()` dengan casting tipe data eksplisit `[Browser]`
  - P1.7 Percabangan: `if`, `elif`, `else`, operator logika `and`, `or`, `not` `[Browser]`
  - P1.8 Perulangan: `for ... in range()`, `while`, kata kunci `break`, `continue`, klausa unik `else` pada loop `[Browser]`
  - P1.9 Fungsi: Definisi `def`, argumen posisional, keyword arguments, return values ganda (tuples) `[Browser]`
- **Mini Proyek P1:** `[Browser]` Game Tebak Angka Interaktif Berbasis Terminal dengan log percobaan, hint adaptif, dan validasi input.

#### Level P2: Struktur Data & Manipulasi File
- **Tujuan:** Menguasai koleksi data bawaan Python, manipulasi string mutakhir, dan persistensi file.
- **Estimasi:** 20 jam belajar.
- **Cakupan Topik & Modul:**
  - P2.1 Lists: Indexing, slicing `[start:stop:step]`, mutasi, methods (`append`, `extend`, `pop`, `sort`) `[Browser]`
  - P2.2 Tuples: Immutability, tuple packing/unpacking, efisiensi memori vs list `[Browser]`
  - P2.3 Dictionaries: Hash maps, key-value pairs, `get()`, iterating items, dictionary merge `|` (Python 3.9+) `[Browser]`
  - P2.4 Sets: Operasi himpunan matematika (union, intersection, difference, symmetric difference) `[Browser]`
  - P2.5 Comprehensions: List comprehensions, Dict comprehensions, Set comprehensions, nested comprehensions terukur `[Browser]`
  - P2.6 File I/O Modern: Context manager `with open()`, mode pembacaan/penulisan (`r`, `w`, `a`), `pathlib.Path` (virtual in-memory filesystem Pyodide) `[Browser]`
  - P2.7 Format Pertukaran Data: Modul `csv` (reader/writer/DictReader) dan modul `json` (dumps, loads, validasi) `[Browser]`
  - P2.8 Exception Handling terstruktur: `try`, `except Exception as e`, `else`, `finally`, raise custom exceptions `[Browser]`
- **Mini Proyek P2:** `[Browser]` Sistem Analisis Transaksi Keuangan CSV Warung UMKM dengan kalkulasi ringkasan laba rugi otomatis dan ekspor JSON.

#### Level P3: Pemrograman Berorientasi Objek & Ekosistem Modul
- **Tujuan:** Membangun aplikasi modular menggunakan paradigma OOP modern dan standar pustaka Python.
- **Estimasi:** 25 jam belajar.
- **Cakupan Topik & Modul:**
  - P3.1 OOP Fundamental: Class, instance, atribut class vs instance, method `__init__`, parameter `self` `[Browser]`
  - P3.2 Enkapsulasi: Konvensi private `_protected`, name mangling `__private`, dekorator `@property` `[Browser]`
  - P3.3 Pewarisan (Inheritance): Single inheritance, multiple inheritance, Method Resolution Order (MRO) via `super()` `[Browser]`
  - P3.4 Dunder (Magic) Methods: Representasi objek (`__str__`, `__repr__`), perbandingan (`__eq__`, `__lt__`), operasi aritmetika (`__add__`) `[Browser]`
  - P3.5 Dataclasses: Dekorator `@dataclass` modern (Python 3.7+), `frozen=True`, default factories `[Browser]`
  - P3.6 Modul & Paket: Struktur direktori `__init__.py`, modul importing, `sys.path` `[Browser]`
  - P3.7 Environment & Tooling Modern: Isolasi virtual environment menggunakan `uv venv` dan `pip` `[Baca-Saja]`
  - P3.8 Standard Library Penting: `pathlib`, `datetime`, `collections` (`namedtuple`, `defaultdict`, `Counter`), `itertools` `[Browser]`
  - P3.9 Type Hints Fundamental: Anotasi tipe (PEP 484), modul `typing` (`Optional`, `Union`, `Literal`), static checking via `mypy` `[Browser]`
- **Mini Proyek P3:** `[Browser]` Sistem Manajemen Inventaris Gudang Terstruktur menggunakan Dataclasses, Type Hints ketat, validasi serialisasi file, dan custom Dunder comparison.

#### Level P4: Python Tingkat Menengah & Pemrograman Asinkron
- **Tujuan:** Menulis kode Python tingkat produksi yang teruji secara otomatis, modular, dan efisien.
- **Estimasi:** 25 jam belajar.
- **Cakupan Topik & Modul:**
  - P4.1 Testing Profesional: `pytest` (fixtures, parametrize, test assertions, mock objects) `[Browser]` *(Terverifikasi 100% berjalan langsung di Pyodide WASM CPython 3.12.7 via `pytest.main()`)*
  - P4.2 Dekorator Lanjut: Higher-order functions, function decorators dengan argumen, dekorator kelas, `functools.wraps` `[Browser]`
  - P4.3 Iterators & Generators: Protokol iterator (`__iter__`, `__next__`), kata kunci `yield`, generator expressions, efisiensi konsumsi RAM `[Browser]`
  - P4.4 Context Managers Tingkat Lanjut: Modul `contextlib` (`@contextmanager`), implementasi class berbasis `__enter__` dan `__exit__` `[Browser]`
  - P4.5 Regular Expressions: Modul `re` (pola match, search, findall, sub, regex groups, flag) `[Browser]`
  - P4.6 Logging Terstruktur: Modul `logging` (handlers, formatters, level INFO/WARNING/ERROR), menghindari pemakaian `print` untuk debugging produksi `[Browser]`
  - P4.7 Jaringan & HTTP: Menggunakan library `httpx` / `urllib.request`, penanganan status code, timeout, retry strategy `[Browser / Backend]` *(Browser mode: menggunakan `pyodide-http` yang mem-patch `httpx` ke `fetch()` peramban untuk endpoint publik ramah CORS seperti BMKG `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json`; Backend mode: untuk endpoint tanpa CORS)*
  - P4.8 Konkurensi Asinkron Modern: Pengantar `asyncio`, kata kunci `async` dan `await`, event loop di Python, `asyncio.gather()`, task cancellation `[Browser]` *(Di Pyodide dieksekusi via `await pyodide.runPythonAsync(...)`)*
- **Mini Proyek P4:** `[Browser / Backend]` Async Web Health Checker CLI yang memonitor URL secara simultan via `asyncio` dan `httpx`, mencatat log rotasi terstruktur, dan diuji dengan `pytest`. *(Di browser terbatas pada target URL ramah CORS / Service Worker mock interceptor; mode monitoring 20 website publik riil bebas batasan CORS dijalankan di lingkungan `[Backend]` / Colab)*.

#### Level P5: Spesialisasi (Jalur Terarah)
- **Tujuan:** Menerapkan keterampilan inti Python pada domain terapan nyata.
- **Estimasi:** 30 jam belajar per jalur.
- **Cakupan Topik & Modul:**
  - P5.1 Jalur Data Science (NumPy & Pandas): Manipulasi tabel DataFrame, agregasi data, pembersihan data missing `[Browser]`
  - P5.2 Jalur Web API (FastAPI): Konsep RESTful, skema validasi Pydantic, route handler in-memory `[Browser]`; deployment server produksi sesungguhnya `[Backend]`
  - P5.3 Jalur Otomasi & Scraping Etis: Parsing HTML DOM via `BeautifulSoup` `[Browser]`; automasi browser headless (Playwright/Selenium) skala industri `[Backend]`
  - P5.4 Jalur Pengantar Machine Learning: Algoritma dasar (Linear Regression, k-NN) dari nol atau via Scikit-Learn `[Browser]`; pelatihan model deep learning GPU remote `[Backend]`
- **Mini Proyek P5 (Data Track):** `[Browser]` Dashboard Analisis Data Tren Pekerjaan Teknologi Indonesia menggunakan Pandas dan visualisasi grafik browser.

#### Level P6: Expert Python & Sistem Internal
- **Tujuan:** Penguasaan mendalam atas CPython internals, model konkurensi tingkat lanjut, dan arsitektur skala besar.
- **Estimasi:** 35 jam belajar.
- **Cakupan Topik & Modul:**
  - P6.1 The Python Data Model: Custom sequence, mapping, callable objects, `__new__` vs `__init__` `[Browser]`
  - P6.2 Metaprogramming & Descriptors: Protokol descriptor (`__get__`, `__set__`, `__delete__`), metaclasses (`type` inheritance), `__init_subclass__` `[Browser]`
  - P6.3 CPython Internals & Konkurensi: Arsitektur CPython, Global Interpreter Lock (GIL), perbandingan Threading vs Multiprocessing vs Asyncio `[Baca-Saja]`
  - P6.4 Free-threaded Python (PEP 703 di Python 3.13+) `[Baca-Saja]`: Arsitektur penghapusan GIL, dampak thread-safety CPython
  - P6.5 Manajemen Memori CPython: Reference counting, Cyclic Garbage Collector (generasi 0, 1, 2), memory profiling via `tracemalloc` `[Browser]`
  - P6.6 Advanced Typing (Modern Type System): TypeVars, ParamSpec, Protocols (Structural Subtyping / Duck Typing via PEP 544), Type narrowing via TypeGuard `[Browser]`
  - P6.7 Packaging & Standard Distribusi: Standar `pyproject.toml` (PEP 621), build backends (`hatchling`, `flit`), penerbitan paket ke PyPI / TestPyPI `[Baca-Saja]`
- **Capstone Proyek P6:** `[Browser]` Membangun Mini ASGI Web Framework dari nol yang mengimplementasikan spesifikasi ASGI 3.0, dependency injection container, routing trie, dan middleware pipeline.

---

## 4. Anatomi Baku Satu Pelajaran (The 8-Part Lesson Anatomy)

Setiap halaman pelajaran di belajar.in wajib memiliki 8 elemen terstruktur secara konsisten tanpa terkecuali:

```
+-----------------------------------------------------------------------------+
| 1. HOOK: Masalah Nyata / Analogi Keseharian                                  |
|    - Jalur Santai: Analogi non-teknis (misal: "Resep Memasak & Variabel")    |
|    - Jalur Cepat: Masalah performa / spesifikasi teknis ringkas              |
+-----------------------------------------------------------------------------+
| 2. KONSEP INTI                                                              |
|    - Penjelasan padat, diagram mental model, tanpa dinding teks bertele-tele |
+-----------------------------------------------------------------------------+
| 3. CONTOH HIDUP (LIVING CODE) + PREDIKSI OUTPUT                              |
|    - [Tebak Output Dahulu] -> [Run Code] -> Bandingkan model mental          |
+-----------------------------------------------------------------------------+
| 4. LATIHAN TERPANDU (FADED EXAMPLE)                                         |
|    - 80% kode sudah tersedia; lengkapi 1-2 baris kunci logika                |
+-----------------------------------------------------------------------------+
| 5. LATIHAN MANDIRI (AUTO-GRADED EXERCISE)                                   |
|    - Layar editor penuh; test suite otomatis dijalankan di Web Worker        |
|    - Dilengkapi Tangga Petunjuk 4-Tahap (Hint 1 -> Hint 4)                   |
+-----------------------------------------------------------------------------+
| 6. KESALAHAN UMUM (COMMON MISCONCEPTIONS)                                    |
|    - Pembedahan bug nyata yang sering ditemui pemula di topik ini            |
+-----------------------------------------------------------------------------+
| 7. RANGKUMAN & KUIS MINI (RETRIEVAL PRACTICE)                               |
|    - 3-5 pertanyaan aktif; setiap opsi salah dijelaskan alasannya            |
+-----------------------------------------------------------------------------+
| 8. SELAMI LEBIH DALAM (DIVE DEEPER - OPSIONAL)                              |
|    - Rujukan spesifikasi ECMAScript / PEP resmi & implementasi internal engine|
+-----------------------------------------------------------------------------+
```

---

## 5. Graf Prasyarat Konsep (Prerequisite DAG) & Gerbang Mastery

Setiap unit pelajaran memiliki atribut `prerequisites: string[]` yang membentuk Directed Acyclic Graph (DAG). Sistem adaptif (Bayesian Knowledge Tracing) memetakan penguasaan konsep pelajar. Jika seorang pembelajar gagal pada latihan tingkat lanjut (misal: `J2-Closure`), engine diagnostik menelusuri graf ke simpul induk (`J1-Scope`) untuk memberikan ulasan yang ditargetkan sebelum membiarkan pelajar frustrasi.

```
                  [Level 0: Berpikir Komputasional & DevTools]
                                       |
                 +---------------------+---------------------+
                 |                                           |
                 v                                           v
      [J1: Fundamental JS]                        [P1: Dasar Python]
                 |                                           |
                 v                                           v
      [J2: Core JS & Data]                        [P2: Struktur Data Python]
                 |                                           |
                 v                                           v
      [J3: JS di Browser & Async]                 [P3: OOP & Modul Python]
                 |                                           |
                 v                                           v
      [J4: Engineering & Tooling]                 [P4: Menengah & Testing]
                 |                                           |
                 v                                           v
      [J5: Advanced & Metaprogramming]            [P5: Spesialisasi Domain]
                 |                                           |
                 v                                           v
      [J6: Expert & Engine Internals]             [P6: Expert & CPython Data Model]
```

### Aturan Mastery Gate & Mekanisme Test-Out:
1. **Standar Gerbang 4-Poin (4-Point Standard):** Pembelajar baru dapat membuka Level $N$ jika seluruh modul pada Level $N-1$ telah memenuhi 4 gerbang mutlak:
   - **100% Test Pass:** 100% tes unit latihan mandiri berstatus lulus (*green assertion*).
   - **BKT Mastery Threshold:** Estimasi probabilitas penguasaan laten Bayesian Knowledge Tracing $P(L) \ge 0.85$ untuk setiap simpul konsep modul.
   - **Mini-Quiz Score:** Rata-rata nilai kuis mini $\ge 80\%$ (skor *retrieval practice* aktif).
   - **Capstone Level:** Proyek mini integrasi level terselesaikan dan lolos seluruh test assertions.
2. **Mekanisme Fast-Track Level Test-Out:** Selain Adaptive Placement Test di awal, pembelajar dapat mengambil tantangan "Level Test-Out" kapan saja untuk membuktikan kompetensi suatu level secara komprehensif tanpa harus menyelesaikan seluruh modul secara berurutan. Ujian Test-Out mencakup 1 set kuis komprehensif acak (skor $\ge 85\%$) dan 1 proyek mini capstone level dengan unit test 100% lulus. Jika berhasil, seluruh simpul konsep level tersebut ditandai dengan $P(L) = 0.90$ dan level berikutnya langsung terbuka (*unlocked*).
3. **Adaptive Placement Test:** Pembelajar yang telah memiliki latar belakang teknis dapat mengambil *Adaptive Placement Test* di awal untuk langsung melompat ke Level J2, J4, P2, atau P4 secara objektif.
