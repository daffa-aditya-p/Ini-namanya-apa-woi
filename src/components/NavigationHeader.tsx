import React, { useState, useEffect } from 'react';
import {
  type UserProfile,
  getSavedSession,
  LocalAuthManager,
} from '../lib/userStore';
import { getRankInfo } from '../lib/ranks';

import { FlameIcon } from './Icons';

export function NavigationHeader() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const existing = getSavedSession();
    setUser(existing);

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
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
      window.location.href = '/login';
    }
  };

  // SSR fallback / loading state
  if (!isClient) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href="/login"
          className="text-xs font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-2.5 py-1.5"
        >
          Masuk
        </a>
        <a
          href="/register"
          className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity"
        >
          Daftar
        </a>
      </div>
    );
  }

  // When Logged In: Username, rank badge, streak, link to "Dashboard", and logout
  if (user) {
    const rank = getRankInfo(user.xp);

    return (
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Streak Indicator */}
        <span
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2 py-1 rounded-md bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]"
          title={`Streak harian: ${user.streak} hari berturut-turut`}
        >
          <FlameIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{user.streak}h</span>
        </span>

        {/* Rank Badge */}
        <a
          href="/leaderboard"
          className="px-2 py-1 rounded-md text-[11px] font-mono font-semibold border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-focused)] transition-colors"
          title={`Peringkat: ${rank.tier} (${user.xp} XP)`}
        >
          {rank.tier}
        </a>

        {/* Username */}
        <span
          className="text-xs font-mono text-[var(--text-secondary)] hidden sm:inline truncate max-w-[110px]"
          title={`Masuk sebagai @${user.username}`}
        >
          @{user.username}
        </span>

        {/* Link to Dashboard */}
        <a
          href="/dashboard"
          className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity shadow-2xs"
        >
          Dashboard
        </a>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs font-mono px-2 py-1 rounded-md text-[var(--text-muted)] hover:text-[var(--state-danger)] hover:bg-[var(--state-danger)]/10 transition-colors cursor-pointer"
          title="Keluar dari sesi saat ini"
          aria-label="Keluar dari akun"
        >
          Keluar
        </button>
      </div>
    );
  }

  // When Logged Out: "Masuk" and "Daftar"
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <a
        href="/login"
        className="text-xs font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-2.5 py-1.5"
      >
        Masuk
      </a>
      <a
        href="/register"
        className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity"
      >
        Daftar
      </a>
    </div>
  );
}
