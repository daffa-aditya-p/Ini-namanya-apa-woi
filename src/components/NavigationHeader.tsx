import React, { useState, useEffect } from 'react';
import {
  type UserProfile,
  getSavedSession,
  LocalAuthManager,
} from '../lib/userStore';
import { getRankInfo } from '../lib/ranks';

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
      <div className="flex items-center gap-3">
        <a
          href="/login"
          className="text-xs font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Masuk
        </a>
        <a
          href="/register"
          className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-[var(--accent-terracotta)] text-white hover:opacity-95 transition-opacity"
        >
          Daftar
        </a>
      </div>
    );
  }

  // When Logged In: Username, rank badge, streak 🔥, link to "Dashboard", and logout
  if (user) {
    const rank = getRankInfo(user.xp);

    return (
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak 🔥 */}
        <span
          className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
          title={`Streak harian: ${user.streak} hari`}
        >
          <span>🔥</span>
          <span>{user.streak}</span>
        </span>

        {/* Rank Badge */}
        <a
          href="/leaderboard"
          className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-transform hover:scale-105 ${rank.definition.badgeClass}`}
          title={`Peringkat: ${rank.tier} (${user.xp} XP). Klik untuk melihat Leaderboard.`}
        >
          {rank.tier}
        </a>

        {/* Username */}
        <span
          className="text-xs font-mono text-[var(--text-secondary)] hidden sm:inline truncate max-w-[120px]"
          title={`Masuk sebagai @${user.username}`}
        >
          @{user.username}
        </span>

        {/* Link to Dashboard */}
        <a
          href="/dashboard"
          className="px-2.5 py-1 rounded text-xs font-mono font-medium border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:border-[var(--border-focused)] hover:text-[var(--accent-terracotta)] transition-all"
        >
          Dashboard
        </a>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs font-mono px-2 py-1 rounded text-[var(--text-muted)] hover:text-[var(--state-danger)] hover:bg-[var(--state-danger)]/10 transition-colors cursor-pointer"
          title="Keluar dari sesi saat ini"
        >
          Keluar
        </button>
      </div>
    );
  }

  // When Logged Out: "Masuk" and "Daftar"
  return (
    <div className="flex items-center gap-3">
      <a
        href="/login"
        className="text-xs font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        Masuk
      </a>
      <a
        href="/register"
        className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-[var(--accent-terracotta)] text-white hover:opacity-95 transition-opacity"
      >
        Daftar
      </a>
    </div>
  );
}
