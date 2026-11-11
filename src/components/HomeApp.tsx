import React, { useState, useEffect } from 'react';
import {
  type UserProfile,
  getSavedSession,
  LocalAuthManager,
} from '../lib/userStore';
import { getRankInfo } from '../lib/ranks';
import { AuthModal, type AuthMode } from './AuthModal';
import { CodePlayground } from './CodePlayground';
import {
  ArrowRightIcon,
  FlameIcon,
  TrophyIcon,
  BookOpenIcon,
  CodeIcon,
  CheckCircleIcon,
  UserIcon,
} from './Icons';

type TrackFilter = 'all' | 'javascript' | 'python';

interface TrackCard {
  id: string;
  lang: 'javascript' | 'python';
  tag: string;
  runtime: string;
  title: string;
  description: string;
  href: string;
  linkText: string;
}

const TRACKS: TrackCard[] = [
  {
    id: 'j1',
    lang: 'javascript',
    tag: 'J1 • JavaScript',
    runtime: 'ES2024',
    title: 'Fondasi Komputasi & Nilai',
    description:
      'Console inspector, eksekusi kode pertama, mutabilitas let vs immutabilitas const, serta 7 tipe data primitif ECMAScript.',
    href: '/curriculum/javascript/j1',
    linkText: 'Buka Modul J1',
  },
  {
    id: 'p1',
    lang: 'python',
    tag: 'P1 • Python',
    runtime: 'Python 3.12 WASM',
    title: 'Dasar Pemrograman & Variabel',
    description:
      'Fungsi print, name binding variabel dinamis, operator aritmatika presisi, dan f-strings format PEP 498. Dilengkapi kuis evaluasi.',
    href: '/curriculum/python/p1',
    linkText: 'Buka Bab 1',
  },
  {
    id: 'j2',
    lang: 'javascript',
    tag: 'J2 • JavaScript',
    runtime: 'ES2024',
    title: 'Core JS & Struktur Data',
    description:
      'Array FP (map/filter/reduce), closure di heap memory, immutability structuredClone, dan OOP Class dengan error handling bertingkat.',
    href: '/curriculum/javascript/j2',
    linkText: 'Buka Modul J2',
  },
  {
    id: 'p2',
    lang: 'python',
    tag: 'P2 • Python',
    runtime: 'Python 3.12 Logika',
    title: 'Logika & Alur Kontrol',
    description:
      'Percabangan if-elif-else, perulangan for & range, perulangan while, dan kontrol break/continue. Dilengkapi kuis evaluasi.',
    href: '/curriculum/python/p2',
    linkText: 'Buka Bab 2',
  },
  {
    id: 'j3',
    lang: 'javascript',
    tag: 'J3 • JavaScript',
    runtime: 'ES2024 Event Loop',
    title: 'Asinkron, Web APIs & Event Loop',
    description:
      'Call Stack vs Web APIs, Microtask vs Macrotask, Promise combinators (allSettled), AbortController timeout, dan retry resilience.',
    href: '/curriculum/javascript/j3',
    linkText: 'Buka Modul J3',
  },
  {
    id: 'p3',
    lang: 'python',
    tag: 'P3 • Python',
    runtime: 'Python 3.12 Koleksi',
    title: 'Struktur Data Koleksi',
    description:
      'List & slicing [start:stop:step], Tuple immutability, Dictionary hash map O(1) merge (|), dan Set himpunan. Dilengkapi kuis evaluasi.',
    href: '/curriculum/python/p3',
    linkText: 'Buka Bab 3',
  },
  {
    id: 'j4',
    lang: 'javascript',
    tag: 'J4 • JavaScript',
    runtime: 'Vitest & Tooling',
    title: 'Modern Tooling & Mini Test Runner',
    description:
      'Test-Driven Development (TDD), assertion matchers toBe/toEqual/toThrow, mini Vitest runner, reactive store subscription, dan autocomplete engine.',
    href: '/curriculum/javascript/j4',
    linkText: 'Buka Modul J4',
  },
  {
    id: 'p4',
    lang: 'python',
    tag: 'P4 • Python',
    runtime: 'Python 3.12 Fungsi',
    title: 'Fungsi & Modularitas',
    description:
      'Definisi fungsi modular, parameter fleksibel *args & **kwargs, return tuple, LEGB scope, lambda, dan comprehensions.',
    href: '/curriculum/python/p4',
    linkText: 'Buka Bab 4',
  },
  {
    id: 'j5',
    lang: 'javascript',
    tag: 'J5 • JavaScript',
    runtime: 'Metaprogramming',
    title: 'Metaprogramming & Sistem Reaktivitas',
    description:
      'Proxy traps & Reflect, Generator function* paginasi, proteksi memori WeakMap bebas leak, Functional Pipe Currying, dan Reactive Signal Store.',
    href: '/curriculum/javascript/j5',
    linkText: 'Buka Modul J5',
  },
  {
    id: 'p5',
    lang: 'python',
    tag: 'P5 • Python',
    runtime: 'Python 3.12 OOP',
    title: 'Pemrograman Berorientasi Objek',
    description:
      'Class & Object, atribut instance & self, pewarisan super(), enkapsulasi @property & setter, dan magic dunder methods.',
    href: '/curriculum/python/p5',
    linkText: 'Buka Bab 5',
  },
];

export function HomeApp() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [previewTab, setPreviewTab] = useState<'javascript' | 'python'>('javascript');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('all');

  useEffect(() => {
    const existing = getSavedSession();
    if (existing) {
      setUser(existing);
    }

    const handleUserUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<UserProfile | null>;
      if (customEvt.detail !== undefined) {
        setUser(customEvt.detail);
      } else {
        setUser(getSavedSession());
      }
    };

    window.addEventListener('belajar:user-updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);

    return () => {
      window.removeEventListener('belajar:user-updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);

  const handleOpenAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (_authenticatedUser: UserProfile) => {
    setIsAuthOpen(false);
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  const handleQuickDemo = () => {
    LocalAuthManager.login('budi_koding', 'password123');
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  const filteredTracks =
    trackFilter === 'all'
      ? TRACKS
      : TRACKS.filter((t) => t.lang === trackFilter);

  return (
    <div className="space-y-14 py-4">
      {/* Hero Section */}
      <section className="max-w-3xl mx-auto text-center sm:text-left pt-2 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--state-success)]"></span>
          <span>Laboratorium Komputasi WebAssembly & JavaScript ES2024</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5 text-[var(--text-primary)] font-display leading-[1.15]">
          Bengkel Rekayasa Kode & Buku Teks Hidup
        </h1>

        <p className="text-base sm:text-lg leading-relaxed text-[var(--text-secondary)] mb-8 font-serif">
          Eksplorasi konsep fundamental komputasi: representasi memori, tipe data primitif, alur kontrol, dan eksekusi instruksi. Setiap baris contoh kode dapat kamu jalankan dan telusuri secara nyata langsung di browsermu tanpa instalasi rumit.
        </p>

        {/* Action Buttons */}
        {user ? (
          <div className="space-y-4">
            <div className="inline-flex flex-wrap items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs font-mono">
              <span className="text-[var(--text-muted)]">Sesi:</span>
              <strong className="text-[var(--text-primary)]">@{user.username}</strong>
              <span className="text-[var(--text-muted)]">•</span>
              <span className="inline-flex items-center gap-1 text-[var(--text-secondary)] font-medium">
                <FlameIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                {user.streak} hari
              </span>
              <span className="text-[var(--text-muted)]">•</span>
              <span className="inline-flex items-center gap-1 text-[var(--text-secondary)] font-medium">
                <TrophyIcon className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                {getRankInfo(user.xp).tier} ({user.xp} XP)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              <a
                href="/dashboard"
                className="px-5 py-2.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] font-display font-medium text-sm hover:opacity-90 active:scale-98 transition-all flex items-center gap-2 text-decoration-none shadow-xs"
              >
                <span>Buka Meja Kerja (Dashboard)</span>
                <ArrowRightIcon className="w-4 h-4" />
              </a>

              <a
                href="/curriculum/javascript/j1"
                className="px-4 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-display font-medium text-sm hover:border-[var(--border-focused)] transition-all text-decoration-none"
              >
                Modul JS (J1)
              </a>

              <a
                href="/curriculum/python/p1"
                className="px-4 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-display font-medium text-sm hover:border-[var(--border-focused)] transition-all text-decoration-none"
              >
                Modul Python (P1)
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
            <button
              type="button"
              onClick={() => handleOpenAuth('login')}
              className="px-5 py-2.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] font-display font-medium text-sm hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-xs"
            >
              Masuk ke Meja Kerja
            </button>

            <button
              type="button"
              onClick={() => handleOpenAuth('register')}
              className="px-5 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-display font-medium text-sm hover:border-[var(--border-focused)] active:scale-98 transition-all cursor-pointer shadow-xs"
            >
              Daftar Akun Baru
            </button>

            <button
              type="button"
              onClick={handleQuickDemo}
              className="px-4 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-mono text-xs hover:border-[var(--border-focused)] hover:text-[var(--text-primary)] transition-all cursor-pointer flex items-center gap-1.5"
              title="Masuk seketika sebagai pengguna demo untuk mencoba fitur platform"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Akun Demo (Budi • Master)</span>
            </button>
          </div>
        )}
      </section>

      {/* Interactive Code Preview Section */}
      <section
        aria-labelledby="preview-heading"
        className="p-5 sm:p-7 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-default)] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] mb-1.5">
              <CodeIcon className="w-3.5 h-3.5" />
              <span>Interactive Preview</span>
            </div>
            <h2 id="preview-heading" className="text-lg sm:text-xl font-bold font-display text-[var(--text-primary)]">
              Eksekusi Langsung di Browser
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Jalankan kode di JavaScript worker sandbox atau runtime CPython WebAssembly secara aman.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-lg border border-[var(--border-default)] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setPreviewTab('javascript')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
                previewTab === 'javascript'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              JavaScript (ES2024)
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('python')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
                previewTab === 'python'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Python 3.12 (Pyodide)
            </button>
          </div>
        </div>

        {previewTab === 'javascript' ? (
          <CodePlayground
            key="preview-js"
            language="javascript"
            title="Preview Eksekusi: JavaScript Modern"
            awardXp={false}
            initialCode={`// Sambutan di bengkel kerja belajar.in
const salam = "Halo dari JavaScript ES2024!";
const nilaiPrimitif = 42;
const daftarFitur = ["Worker Sandbox", "Zero Slop", "Eksekusi Nyata"];

console.log(salam);
console.log("Nilai:", nilaiPrimitif);
console.log("Fitur utama:", daftarFitur.join(" • "));`}
            expectedOutput={`Halo dari JavaScript ES2024!\nNilai: 42\nFitur utama: Worker Sandbox • Zero Slop • Eksekusi Nyata`}
          />
        ) : (
          <CodePlayground
            key="preview-py"
            language="python"
            title="Preview Eksekusi: Pyodide WASM"
            awardXp={false}
            initialCode={`# Eksekusi riil CPython 3.12 di WebAssembly
pesan = "Halo dari Python 3.12 WebAssembly!"
pangkat = [2 ** i for i in range(1, 5)]

print(pesan)
print("Deret pangkat dua:", pangkat)
print(f"Total elemen: {len(pangkat)}")`}
            expectedOutput={`Halo dari Python 3.12 WebAssembly!\nDeret pangkat dua: [2, 4, 8, 16]\nTotal elemen: 4`}
          />
        )}
      </section>

      {/* Curriculum Tracks Section with Clean Tab Filters */}
      <section aria-labelledby="tracks-preview-heading" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-default)] pb-4">
          <div>
            <h2 id="tracks-preview-heading" className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-display">
              Kurikulum Pemrograman
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Pilih alur pembelajaran berjenjang dengan evaluasi penguasaan konsep terstruktur.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="inline-flex rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] p-0.5">
              <button
                type="button"
                onClick={() => setTrackFilter('all')}
                className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                  trackFilter === 'all'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Semua ({TRACKS.length})
              </button>
              <button
                type="button"
                onClick={() => setTrackFilter('javascript')}
                className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                  trackFilter === 'javascript'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                JavaScript (5)
              </button>
              <button
                type="button"
                onClick={() => setTrackFilter('python')}
                className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                  trackFilter === 'python'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Python (5)
              </button>
            </div>

            <a
              href="/placement"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--border-focused)] transition-colors text-decoration-none"
            >
              <span>Placement Test</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Track Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredTracks.map((track) => (
            <a
              key={track.id}
              href={track.href}
              className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] transition-all group shadow-2xs text-decoration-none flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
                    {track.tag}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    {track.runtime}
                  </span>
                </div>

                <h3 className="text-base font-bold mb-1.5 text-[var(--text-primary)] group-hover:text-[var(--accent-terracotta)] transition-colors font-display">
                  {track.title}
                </h3>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                  {track.description}
                </p>
              </div>

              <div className="text-xs font-mono font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-terracotta)] flex items-center gap-1 pt-3 border-t border-[var(--border-default)]">
                <span>{track.linkText}</span>
                <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Leaderboard Teaser */}
      <section className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-[var(--text-muted)] font-semibold uppercase tracking-wider block mb-1">
            Peringkat & Pencapaian
          </span>
          <h2 className="text-lg font-bold text-[var(--text-primary)] font-display">
            Sistem Peringkat Kompetitif
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Mulai dari Bronze I (0–50 XP) hingga Immortal (2001+ XP). Pantau kemajuanmu di antara para pembelajar.
          </p>
        </div>
        <a
          href="/leaderboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-medium rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] hover:border-[var(--border-focused)] hover:text-[var(--text-primary)] transition-colors text-[var(--text-secondary)] shrink-0 text-decoration-none"
        >
          <span>Buka Leaderboard</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </a>
      </section>

      {/* Engineering Principles */}
      <section className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] space-y-3">
        <h3 className="font-bold text-[var(--text-primary)] font-display text-sm tracking-tight flex items-center gap-2">
          <BookOpenIcon className="w-4 h-4 text-[var(--text-muted)]" />
          <span>Prinsip Perancangan Platform</span>
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1">
            <div className="text-xs font-semibold font-display text-[var(--text-primary)] flex items-center gap-1.5">
              <CheckCircleIcon className="w-3.5 h-3.5 text-[var(--state-success)]" />
              <span>Eksekusi Nyata</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Semua kode dieksekusi di runner JavaScript worker dan WebAssembly CPython tanpa simulasi tiruan.
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold font-display text-[var(--text-primary)] flex items-center gap-1.5">
              <CheckCircleIcon className="w-3.5 h-3.5 text-[var(--state-success)]" />
              <span>Bebas AI Slop</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Materi disusun sistematis dengan penjelasan mendalam, contoh kontekstual, dan latihan nyata.
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold font-display text-[var(--text-primary)] flex items-center gap-1.5">
              <CheckCircleIcon className="w-3.5 h-3.5 text-[var(--state-success)]" />
              <span>Aksesibilitas Teruji</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Desain kontras tinggi memenuhi standar WCAG 2.2 AA pada mode terang dan gelap.
            </p>
          </div>
        </div>
      </section>

      {/* Auth Modal Container */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
