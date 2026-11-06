import React, { useState, useEffect } from 'react';
import {
  type UserProfile,
  getSavedSession,
  saveSession,
  LocalAuthManager,
} from '../lib/userStore';
import { Dashboard } from './Dashboard';
import { AuthModal, type AuthMode } from './AuthModal';
import { ArrowRightIcon, SparklesIcon } from './Icons';

export function HomeApp() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  useEffect(() => {
    const existing = getSavedSession();
    if (existing) {
      setUser(existing);
    }
  }, []);

  const handleOpenAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    saveSession(authenticatedUser);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    LocalAuthManager.logout();
    setUser(null);
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
  };

  const handleQuickDemo = () => {
    const demo = LocalAuthManager.login('budi_koding', 'password123');
    handleAuthSuccess(demo);
  };

  // If user is logged in, show Dashboard directly
  if (user) {
    return (
      <div>
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
        />
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  // Guest / Visitor Landing Page
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="max-w-3xl mx-auto text-center sm:text-left pt-2 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[var(--bg-subtle)] text-[var(--accent-teal)] border border-[var(--border-default)] mb-6">
          <span className="w-2 h-2 rounded-full bg-[var(--state-success)] animate-pulse"></span>
          Fase 1-2 • Vertical Slice J1 + P1 Aktif & Bebas AI Slop
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-[var(--text-primary)] font-display leading-[1.12]">
          Bengkel Kode & Buku Teks Hidup
        </h1>

        <p className="text-lg sm:text-xl leading-relaxed text-[var(--text-secondary)] mb-8 font-serif">
          Mari kita mulai dari hal paling mendasar: bagaimana komputer mengingat data dan mengeksekusi instruksi. Setiap contoh kode di halaman ini dapat kamu jalankan dan telusuri secara nyata langsung di browsermu tanpa instalasi rumit.
        </p>

        {/* Auth CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
          <button
            type="button"
            onClick={() => handleOpenAuth('login')}
            className="px-5 py-2.5 rounded-lg bg-[var(--accent-terracotta)] text-white font-display font-medium text-sm hover:opacity-95 active:scale-98 transition-all cursor-pointer shadow-xs"
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
            className="px-4 py-2.5 rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--accent-teal)] font-mono text-xs hover:border-[var(--border-focused)] transition-all cursor-pointer flex items-center gap-1.5"
            title="Masuk seketika sebagai pengguna demo untuk mencoba dashboard"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            Coba Demo Cepat (Budi • Master)
          </button>
        </div>
      </section>

      {/* Curriculum Tracks Preview */}
      <section aria-labelledby="tracks-preview-heading">
        <h2 id="tracks-preview-heading" className="sr-only">
          Pilihan Modul Kurikulum
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 my-6">
          {/* Track JavaScript J1 */}
          <a
            href="/curriculum/javascript/j1"
            className="block p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] transition-all group shadow-xs text-decoration-none"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#F7DF1E]/20 text-[#857000] dark:text-[#F7DF1E]">
                J1 • JavaScript
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">ES2024</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)] group-hover:text-[var(--accent-terracotta)] transition-colors font-display">
              Fondasi Komputasi & Nilai
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              Console inspector, eksekusi kode pertama, mutabilitas let vs immutabilitas const, serta 7 tipe data primitif ECMAScript.
            </p>
            <div className="text-xs font-mono font-medium text-[var(--accent-terracotta)] flex items-center gap-1">
              Buka Modul J1 <ArrowRightIcon className="w-3 h-3" />
            </div>
          </a>

          {/* Track Python P1 */}
          <a
            href="/curriculum/python/p1"
            className="block p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] transition-all group shadow-xs text-decoration-none"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#3776AB]/20 text-[#20527B] dark:text-[#68B0EB]">
                P1 • Python
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">Python 3.12 WASM</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)] group-hover:text-[var(--accent-terracotta)] transition-colors font-display">
              Struktur Pertama & Bahasa Alami
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              Fungsi print, operator aritmatika, variabel sebagai name binding dinamis, dan eksekusi instan di WebAssembly Pyodide.
            </p>
            <div className="text-xs font-mono font-medium text-[var(--accent-terracotta)] flex items-center gap-1">
              Buka Modul P1 <ArrowRightIcon className="w-3 h-3" />
            </div>
          </a>
        </div>
      </section>

      {/* Leaderboard Teaser */}
      <section className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-[var(--accent-teal)] font-semibold uppercase tracking-wider block mb-1">
            Kompetisi Sehat
          </span>
          <h2 className="text-lg font-bold text-[var(--text-primary)] font-display">
            Papan Peringkat & Rank Sistem
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Mulai dari Bronze I (0-50 XP) hingga Immortal (2001+ XP). Cek posisimu di antara para pembelajar.
          </p>
        </div>
        <a
          href="/leaderboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-medium rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] hover:border-[var(--border-focused)] transition-colors text-[var(--text-primary)] shrink-0 text-decoration-none"
        >
          Lihat Leaderboard <ArrowRightIcon className="w-3.5 h-3.5" />
        </a>
      </section>

      {/* Engineering Manifesto Callout */}
      <section className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] text-sm leading-relaxed text-[var(--text-secondary)]">
        <h3 className="font-bold text-[var(--text-primary)] mb-2 font-display text-base">
          Prinsip Bengkel & Integritas Rekayasa:
        </h3>
        <ul className="space-y-1.5 list-disc list-inside">
          <li>
            <strong>Eksekusi Riil:</strong> Seluruh kode materi dieksekusi di runner JavaScript worker dan Pyodide WebAssembly nyata tanpa simulasi palsu.
          </li>
          <li>
            <strong>Zero JS Default:</strong> Konten disajikan cepat dan terstruktur, hanya memuat runtime interaktif saat kamu berinteraksi dengan editor.
          </li>
          <li>
            <strong>Aksesibilitas Teruji:</strong> Dirancang dengan standar kontras warna WCAG 2.2 AA pada palet Warm Paper & Slate Ink.
          </li>
        </ul>
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
