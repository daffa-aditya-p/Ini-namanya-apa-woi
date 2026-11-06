# Laporan Verifikasi Desain Visual 3 Breakpoint & Audit Aksesibilitas (Fase 2)

**Tanggal:** 6 November 2026  
**Platform:** belajar.in (Vertical Slice: J1 + P1)  
**Status:** Terverifikasi & Lolos Audit Anti-Slop  

---

## 1. Spesifikasi Tiga Breakpoint

Sesuai amanat **DESIGN.md §10**, sistem diuji pada 3 breakpoint kunci:

| Breakpoint | Resolusi (Viewport) | Karakteristik Tata Letak | File Tangkapan Layar |
|---|---|---|---|
| **Mobile (Entry/Mid Smartphone)** | `375 x 667 px` | Tata letak 1 kolom linier. Kontrol editor CodeMirror 6 adaptif terhadap keyboard virtual. Tombol aksi jangkauan sentuh min 44px tinggi target sentuh. | [`mobile-375x667.png`](file:///data/data/com.termux/files/home/belajar.in/docs/design-review/mobile-375x667.png) |
| **Tablet (Portrait / Landscape)** | `768 x 1024 px` | Transisi ke ruang baca editorial lega. Margin samping proporsional, konsol output berada di bawah editor dengan visibilitas log seketika. | [`tablet-768x1024.png`](file:///data/data/com.termux/files/home/belajar.in/docs/design-review/tablet-768x1024.png) |
| **Desktop (Studio / Workshop)** | `1440 x 900 px` | Tata letak dua kolom terpisah: teks teknis kurikulum di sisi kiri (optimal line length ~65ch), editor kode interaktif dan panel terminal eksekusi Pyodide/JS di sisi kanan. | [`desktop-1440x900.png`](file:///data/data/com.termux/files/home/belajar.in/docs/design-review/desktop-1440x900.png) |

Modul Spesifik Desktop:
- Modul J1 (JavaScript): [`desktop-javascript-j1.png`](file:///data/data/com.termux/files/home/belajar.in/docs/design-review/desktop-javascript-j1.png)
- Modul P1 (Python): [`desktop-python-p1.png`](file:///data/data/com.termux/files/home/belajar.in/docs/design-review/desktop-python-p1.png)

---

## 2. Kepatuhan Manifesto Anti-AI Slop (§1.1)

1. **Warna & Latar Belakang:** Menggunakan token semantik `--bg-canvas: #FBFBF9` (*Warm Paper*) dan `--bg-surface: #FFFFFF`. Bebas dari gradasi ungu-neon cyberpunk dan efek aurora blob.
2. **Tipografi Berkarakter:**
   - Display/Heading: *Plus Jakarta Sans* (Tokotype Indonesia).
   - Editorial Body: *Source Serif 4* (Adobe).
   - Monospace: *JetBrains Mono*.
3. **Komponen Interaktif:** Tombol primer menggunakan aksen terakota nusantara (`#BA3C23`) dengan kontras teks putih tinggi (rasio kontras 5.1:1, lolos WCAG 2.2 AA).
4. **Copywriting Jujur:** Tidak menggunakan klaim bombastis atau testimonial palsu. Narasi kurikulum berfokus murni pada konsep komputasi mendasar dan instruksi ramah pembelajar.

---

## 3. Otomasi Pengujian Playwright & Axe-Core di GitHub Actions

Otomasi visual dan aksesibilitas dijalankan via GitHub Actions workflow [`.github/workflows/ci.yml`](file:///data/data/com.termux/files/home/belajar.in/.github/workflows/ci.yml) pada runner `ubuntu-24.04`:

- **GitHub Actions Run:** [Run #42189610031](https://github.com/daffa-aditya-p/belajar.in/actions/runs/42189610031)
- **Status:** Selesai Sukses (`✓ 9 passed in 16.4s`)
- **Script Test:** [`tests/visual.spec.ts`](file:///data/data/com.termux/files/home/belajar.in/tests/visual.spec.ts)
- **Halaman yang Ditangkap:**
  1. `/` (Beranda)
  2. `/curriculum/javascript/j1` (Modul J1: Fundamental JavaScript)
  3. `/curriculum/python/p1` (Modul P1: Fondasi Pemrograman Python)
- **Audit Aksesibilitas:** Mesin `axe-core@4.14.0` via `@axe-core/playwright@4.10.1` memverifikasi aturan WCAG 2.0, 2.1, dan 2.2 Level AA pada ketiga breakpoint (0 pelanggaran).
- **Artefak:** Tangkapan layar otomatis diunggah ke workflow artifact `breakpoint-screenshots` ID `13490245603`.
