import React, { useState, useEffect } from 'react';
import {
  type UserProfile,
  getSavedSession,
  saveSession,
  LocalAuthManager,
} from '../lib/userStore';
import { Dashboard } from './Dashboard';
import { ArrowRightIcon, SparklesIcon } from './Icons';

export function DashboardApp() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const session = getSavedSession();
    setUser(session);

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

  const handleLogout = () => {
    LocalAuthManager.logout();
    setUser(null);
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
    saveSession(updated);
  };

  const handleDemoLogin = () => {
    const demo = LocalAuthManager.login('budi_koding', 'password123');
    setUser(demo);
  };

  // SSR / Loading skeleton
  if (!isClient) {
    return (
      <div className="py-16 text-center text-xs font-mono text-[var(--text-muted)]">
        Memuat meja kerja...
      </div>
    );
  }

  // Logged in: Render full Dashboard
  if (user) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
      />
    );
  }

  // Guest: Graceful prompt to login or redirect to /login
  return (
    <div className="max-w-xl mx-auto py-12 sm:py-16 px-4">
      <div className="p-8 sm:p-10 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-terracotta)]/15 text-[var(--accent-terracotta)] mx-auto flex items-center justify-center font-mono font-bold text-xl">
          b.i
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] mb-3">
            Akses Meja Kerja Pembelajar
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--text-primary)] tracking-tight">
            Meja Kerja Memerlukan Akun
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2 leading-relaxed max-w-md mx-auto">
            Halaman Dashboard menyimpan catatan progres modul, streak harian, rank gamifikasi, dan event aktifmu. Masuk ke akunmu atau daftar untuk membuka seluruh fitur.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="/login"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[var(--accent-terracotta)] text-white font-display font-medium text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-xs text-decoration-none"
          >
            <span>Masuk ke Akun</span>
            <ArrowRightIcon className="w-4 h-4" />
          </a>

          <a
            href="/register"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)] font-display font-medium text-sm hover:border-[var(--border-focused)] transition-all text-decoration-none text-center"
          >
            Daftar Akun Baru
          </a>
        </div>

        {/* Quick Demo Option */}
        <div className="pt-4 border-t border-[var(--border-default)]">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)] text-xs font-mono text-[var(--accent-teal)] hover:border-[var(--border-focused)] transition-colors cursor-pointer"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>⚡ Buka Instan via Akun Demo (Budi • Master 750 XP)</span>
          </button>
        </div>

        <div className="pt-2">
          <a
            href="/"
            className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-decoration-none"
          >
            ← Kembali ke Halaman Beranda
          </a>
        </div>
      </div>
    </div>
  );
}
