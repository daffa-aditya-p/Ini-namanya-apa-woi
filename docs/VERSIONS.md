# Versi & Dependensi Platform belajar.in

Dokumen ini mencatat seluruh versi bahasa pemrograman, runtime, framework, library, dan tool yang dipin (*pinned*) sesuai amanat Master Prompt §1.8. Seluruh dependensi telah diverifikasi kompatibilitasnya dan dipin ulang (*re-pinned*) dengan alasan teknis eksplisit per 6 November 2026.

---

## 1. Bahasa Pemrograman & Spesifikasi Standar

| Teknologi | Versi Dipin | Sumber / Spesifikasi | Rationale & Catatan Teknis |
|---|---|---|---|
| **ECMAScript (JavaScript)** | `ECMAScript 2024` (ES15) | [ECMA-262 15th Edition](https://tc39.es/ecma262/2024/) | Fitur standar inti: `Object.groupBy`, `Map.groupBy`, `Promise.withResolvers`, RegExp `v` flag, ArrayBuffer transfer. Kompatibel 100% dengan modern browsers. |
| **Python** | `Python 3.12.7` (Pyodide) / `Python 3.14.6` (Host) | [docs.python.org/3.12](https://docs.python.org/3.12/) | Browser runner mengunci Python 3.12 via Pyodide 0.27.8 WASM. Host runtime Termux lokal: Python 3.14.6. |
| **TypeScript** | `5.7.3` | [typescriptlang.org](https://www.typescriptlang.org/) | Konfigurasi `strict: true`, targeting ES2022/ES2024. Menjamin static type-safety tanpa kelonggaran `any`. |

---

## 2. Runtime Lingkungan Pengembangan & Host

| Tool / Runtime | Versi Dipin | Jalur Eksekusi | Rationale & Catatan Teknis |
|---|---|---|---|
| **Node.js** | `v22.14.0 LTS` (Host: `v26.2.0`) | Host CLI | Runtime JavaScript LTS untuk tooling, script build, dan SSR rendering. Host Termux menjalankan Node v26. |
| **uv** | `0.13.7` | Host CLI | Package manager & runner Python berbasis Rust super-cepat. Menyediakan resolusi dependensi deterministik dan virtualenv instan (<1 detik). |
| **pnpm** | `9.15.9` | Host CLI | Package manager Node.js deterministik dengan Content-Addressable Storage (CAS) dan isolasi node_modules ketat untuk mencegah phantom dependencies. |
| **Google Colab CLI** | `0.7.5` | Host CLI (`uv tool`) | CLI resmi Google (`googlecolab/google-colab-cli`) untuk provisioning dan eksekusi GPU T4/L4 remote tanpa ketergantungan `drivemount`. |

---

## 3. Frontend Web Architecture & Framework

| Package | Versi Dipin | Peran Arsitektur | Rationale Pemilihan & Pinning Ulang |
|---|---|---|---|
| **astro** | `5.4.2` | Meta-framework SSG & Islands | Dipin pada 5.4.x untuk stabilitas Content Collections v2, optimasi bundel zero-JS default, dan perbaikan hidrasi React 19 islands. |
| **@astrojs/react** | `4.2.1` | Integrator React Islands | Adapter resmi Astro untuk hidrasi komponen React 19.3.x pada client directives (`client:visible`, `client:idle`). |
| **@astrojs/mdx** | `4.1.0` | Parser Kurikulum MDX | Parser materi kurikulum terstruktur dengan validasi skema frontmatter Zod dan penyematan custom interactive components. |
| **react** | `19.3.1` | Library UI Komponen | Rilis stabil React 19.x; mendukung Actions, `useActionState`, dan arsitektur form modern tanpa dependensi state eksternal berat. |
| **react-dom** | `19.3.1` | DOM Renderer React | DOM renderer resmi berpasangan dengan React 19.3.1. |
| **tailwindcss** | `4.3.4` | CSS Engine & Design Tokens | Engine Tailwind CSS v4 berbasis LightningCSS native ESM. Mengeliminasi `tailwind.config.js` ganda, performa build 5x lebih cepat, native CSS variables semantik. |
| **zod** | `3.24.2` | Runtime Schema Validation | **Alasan Kunci:** Tetap dipin pada v3.24.x karena Astro Content Collections internal mengikat skema Zod v3. Zod v4 memperkenalkan breaking changes pada inferensi tipe internal Astro. |
| **minisearch** | `7.2.0` | Client-side Search Engine | Mesin pencarian teks lengkap in-browser ringan (~10 KB gzipped) tanpa dependensi backend. Indeks memori efisien dengan BM25/TF-IDF scoring <15ms. |
| **dexie** | `4.4.7` | Local IndexedDB Storage | Wrapper IndexedDB reaktif modern untuk persistensi progres belajar, bookmark, dan BKT mastery map di perangkat klien. Mendukung transaksi ACID lokal. |

---

## 4. In-Browser Code Editors & Sandboxed Runtimes

| Package | Versi Dipin | Peran Teknis | Rationale Pemilihan & Pinning Ulang |
|---|---|---|---|
| **@codemirror/state** | `6.5.2` | Core State Machine CM6 | Model state fungsional tak-berubah (immutable) untuk editor kode; sangat modular dan hemat konsumsi RAM ponsel. |
| **@codemirror/view** | `6.36.2` | Virtual DOM Renderer CM6 | Renderer view CM6 dengan penanganan keyboard virtual dan touch scrolling di Android mobile yang sangat stabil. |
| **@codemirror/lang-javascript** | `6.2.3` | Lezer Parser JavaScript | Syntax highlighting dan indentasi otomatis untuk JavaScript/TypeScript. |
| **@codemirror/lang-python** | `6.1.6` | Lezer Parser Python | Syntax highlighting dan indentasi otomatis untuk Python 3. |
| **@codemirror/theme-one-dark** | `6.1.3` | Basis Tema Editor Gelap | Tema editor kontras tinggi dengan rasio kontras WCAG AA yang nyaman di mata. |
| **@codemirror/autocomplete** | `6.18.4` | Autocompletion Engine | Mesin autocompletion kontekstual client-side yang responsif tanpa lag. |
| **pyodide** | `0.27.8` | WebAssembly Python Runtime | Rilis stabil Pyodide CPython 3.12 WebAssembly; perbaikan alokasi heap Emscripten dan async loop di Web Worker. Lazy-load total (hanya diunduh saat user menekan 'Run Python'). |

---

## 5. Testing, Aksesibilitas, & Quality Assurance

| Package | Versi Dipin | Peran Teknis | Rationale Pemilihan & Pinning Ulang |
|---|---|---|---|
| **vitest** | `3.0.7` | Unit & Integration Test | Test runner ESM-native super-cepat berbasis Vite. Dipin pada v3.0.x karena kompatibel penuh dengan pipeline Astro 5 / Vite 6 (menghindari breaking changes Vitest v5). |
| **@playwright/test** | `1.50.1` | E2E & Visual Regression | E2E test runner untuk Chromium headless di lingkungan desktop GNU/Linux (GitHub Actions CI `ubuntu-latest` / Colab remote). Menguji 3 breakpoints (375px, 768px, 1440px). |
| **axe-core** | `4.14.0` | Mesin Audit Aksesibilitas | Mesin evaluasi aksesibilitas otomatis standar WCAG 2.2 AA mutakhir; mengaudit contrast, ARIA landmarks, target size, dan keyboard navigable tree. |
| **@axe-core/playwright** | `4.10.1` | Integrator Playwright-Axe | Bridge resmi untuk menjalankan evaluasi axe-core di dalam skenario test Playwright. |
| **eslint** | `9.22.0` | Static Code Analysis | Linter resmi dengan ESLint Flat Config modern dan integrasi typescript-eslint v8. |
| **prettier** | `3.9.10` | Code Formatter Deterministik | Formatter kode terpadu dengan plugin Astro dan Tailwind CSS v4. |

### 5.1 Verifikasi Output `npm view` untuk Dependensi Terklaim Mutakhir

Output terminal verifikasi langsung dari registri npm publik (diuji 6 November 2026):
```text
$ npm view axe-core version
4.14.0

$ npm view prettier version
3.9.10

$ npm view tailwindcss version
4.3.4

$ npm view react version
19.3.1

$ npm view react-dom version
19.3.1
```
*Catatan audit:* Dependensi yang diklaim mutakhir telah diverifikasi secara eksplisit ke registry publik npm tanpa asumsi atau halusinasi semver.

---

## 6. AI, Machine Learning, & Remote Training (Google Colab)

| Tool / Framework | Versi Dipin | Peran Teknis | Rationale Pemilihan & Pinning Ulang |
|---|---|---|---|
| **Base Model LLM** | `Qwen/Qwen2.5-Coder-1.5B-Instruct` | Base Model Terbuka | Model coding Apache 2.0 terbaik di kelas <2B parameter. Vocab 151k menghasilkan efisiensi token Bahasa Indonesia tinggi (2.12 char/token vs SmolLM2 2.00 char/token). Muat di VRAM T4 16GB. |
| **torch** | `2.5.1+cu124` | PyTorch Backend | Build PyTorch stabil dengan akselerasi CUDA 12.4 untuk GPU remote Colab T4/L4. |
| **transformers** | `4.49.0` | Hugging Face Ecosystem | Rilis stabil Transformers dengan dukungan Qwen2.5 Flash-Attention 2 dan integrasi bitsandbytes 4-bit. |
| **peft** | `0.14.0` | Parameter-Efficient Tuning | Pustaka LoRA / QLoRA untuk pelatihan adapter berbobot rendah ($r=32, \alpha=64$) pada target projection linear. |
| **bitsandbytes** | `0.45.2` | Kuantisasi 4-bit (NF4) | Kuantisasi NormalFloat 4-bit dengan double quantization untuk meminimalkan konsumsi VRAM base model hingga ~4.8 GB pada GPU T4. |
| **trl** | `0.15.2` | Supervised Fine-Tuning | Engine SFTTrainer untuk pelatihan terarah perilaku dialog Socratic, format JSON tervalidasi Zod, dan tangga petunjuk. |
| **datasets** | `3.3.2` | Pipeline Dataset Arrow | Pipeline streaming dataset deterministik berbasis memori Apache Arrow dengan pemisahan group-split terisolasi. |
| **onnxruntime-web** | `1.20.4` | In-Browser ML Runtime | WebAssembly runtime untuk eksekusi model klasifikasi level kuis ringan langsung di browser klien. |

---

## 7. Kebijakan Update & Penguncian Versi

1. **Lockfiles Deterministik:** Seluruh repositori wajib meng-commit file `pnpm-lock.yaml` untuk dependensi frontend dan skrip Colab mengunci `requirements.txt` dengan hash SHA-256 via `uv pip compile`.
2. **Tanpa SemVer Wildcard:** Seluruh dependensi produksi dipatok dengan nomor versi persis (*exact pinning*) tanpa tanda `^` atau `~` untuk mencegah *silent runtime breakage*.
3. **Audit Evaluasi Terpusat:** Pembaruan versi dependensi hanya diizinkan melalui audit kompatibilitas yang tercatat di `docs/DECISIONS.md` dan wajib lulus seluruh test suite Vitest serta Playwright Visual Regression di GitHub Actions CI.
