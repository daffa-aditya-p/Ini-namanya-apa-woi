import React, { useState, useEffect } from 'react';
import {
  type UserProfile,
  getSavedSession,
  LocalAuthManager,
} from '../lib/userStore';
import { SparklesIcon, ArrowRightIcon } from './Icons';

export type AuthFormMode = 'login' | 'register' | 'forgot';

interface AuthFormCardProps {
  initialMode: AuthFormMode;
}

export function AuthFormCard({ initialMode }: AuthFormCardProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isClient, setIsClient] = useState(false);
  const mode = initialMode;

  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Statuses
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentUser(getSavedSession());

    const handleUserUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<UserProfile | null>;
      if (customEvt.detail !== undefined) {
        setCurrentUser(customEvt.detail);
      } else {
        setCurrentUser(getSavedSession());
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
    setCurrentUser(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError('Masukkan username atau alamat email kamu.');
      return;
    }

    setIsSubmitting(true);
    try {
      LocalAuthManager.login(username, password);
      setIsSubmitting(false);
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Gagal memproses login.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Username minimal 3 karakter (hanya huruf kecil, angka, dan underscore).');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Alamat email tidak valid.');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    try {
      LocalAuthManager.register(cleanUsername, email, password);
      setIsSubmitting(false);
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Gagal mendaftarkan akun.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !email.includes('@')) {
      setError('Masukkan alamat email yang valid untuk menerima tautan pemulihan.');
      return;
    }

    setIsSubmitting(true);
    const res = LocalAuthManager.forgotPassword(email);
    setIsSubmitting(false);
    if (res.success) {
      setSuccessNotice(res.message);
    } else {
      setError(res.message);
    }
  };

  const handleQuickDemo = () => {
    LocalAuthManager.login('budi_koding', 'password123');
    window.location.href = '/dashboard';
  };

  // If already logged in, show user info and quick jump to dashboard
  if (isClient && currentUser) {
    return (
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg text-center space-y-6">
        <div className="w-12 h-12 rounded-full bg-[var(--accent-terracotta)]/15 text-[var(--accent-terracotta)] mx-auto flex items-center justify-center font-bold text-lg font-mono">
          ✓
        </div>
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[var(--state-success)]/15 text-[var(--state-success)] mb-2">
            Sesi Sedang Aktif
          </span>
          <h2 className="text-2xl font-bold font-display text-[var(--text-primary)]">
            Halo, @{currentUser.username}!
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Kamu sudah masuk ke meja kerja. Klik tombol di bawah untuk langsung menuju Dashboard.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="/dashboard"
            className="w-full py-3 px-4 rounded-lg bg-[var(--accent-terracotta)] text-white font-display font-medium text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-xs text-decoration-none"
          >
            <span>Buka Dashboard Sekarang</span>
            <ArrowRightIcon className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--state-danger)] hover:border-[var(--state-danger)]/50 transition-colors cursor-pointer"
          >
            Keluar dari Akun Ini
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg transition-all">
      {/* Brand & Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] mb-2">
          Autentikasi Pembelajar
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[var(--text-primary)]">
          {mode === 'login' && 'Masuk ke Meja Kerja'}
          {mode === 'register' && 'Buka Akun Pembelajar'}
          {mode === 'forgot' && 'Pemulihan Kata Sandi'}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
          {mode === 'login' &&
            'Lanjutkan progres materi, streak harian, dan kumpulkan XP komputasi riil.'}
          {mode === 'register' &&
            'Daftar akun gratis untuk menyimpan riwayat kode dan naik peringkat di leaderboard.'}
          {mode === 'forgot' &&
            'Ketikkan email terdaftar untuk menerima petunjuk reset password.'}
        </p>
      </div>

      {/* Error and Success Banners */}
      {error && (
        <div className="mb-4 p-3 rounded-lg border border-[var(--state-danger)]/30 bg-[var(--state-danger)]/10 text-sm text-[var(--state-danger)] font-sans">
          {error}
        </div>
      )}

      {successNotice && (
        <div className="mb-4 p-3 rounded-lg border border-[var(--state-success)]/30 bg-[var(--state-success)]/10 text-sm text-[var(--state-success)] font-sans">
          {successNotice}
        </div>
      )}

      {/* Login Form */}
      {mode === 'login' && (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="page-login-username"
              className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1"
            >
              Username atau Email
            </label>
            <input
              id="page-login-username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="misal: ahmad_dev"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-terracotta)] transition-colors font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="page-login-password"
                className="text-xs font-mono font-medium text-[var(--text-secondary)]"
              >
                Kata Sandi
              </label>
              <a
                href="/forgot-password"
                className="text-xs text-[var(--accent-terracotta)] hover:underline cursor-pointer"
              >
                Lupa password?
              </a>
            </div>
            <input
              id="page-login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-terracotta)] transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-lg bg-[var(--accent-terracotta)] text-white font-display font-medium text-sm hover:opacity-95 active:scale-98 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Memverifikasi...' : 'Masuk Sekarang'}
          </button>

          {/* Quick Demo */}
          <div className="pt-2 border-t border-[var(--border-default)]">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)] text-xs font-mono text-[var(--accent-teal)] hover:border-[var(--border-focused)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              ⚡ Coba Demo Cepat (Budi • Master 750 XP)
            </button>
          </div>

          <div className="text-center text-xs text-[var(--text-secondary)] pt-2">
            Belum punya akun?{' '}
            <a
              href="/register"
              className="text-[var(--accent-terracotta)] font-semibold hover:underline cursor-pointer"
            >
              Daftar akun baru
            </a>
          </div>
        </form>
      )}

      {/* Register Form */}
      {mode === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="page-reg-username"
              className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1"
            >
              Username Baru
            </label>
            <input
              id="page-reg-username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="misal: ahmad_dev"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-terracotta)] transition-colors font-mono"
            />
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block font-mono">
              Hanya huruf kecil, angka, dan underscore.
            </span>
          </div>

          <div>
            <label
              htmlFor="page-reg-email"
              className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1"
            >
              Alamat Email
            </label>
            <input
              id="page-reg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@domain.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-terracotta)] transition-colors font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="page-reg-password"
                className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1"
              >
                Kata Sandi
              </label>
              <input
                id="page-reg-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-terracotta)] transition-colors font-mono"
              />
            </div>
            <div>
              <label
                htmlFor="page-reg-confirm"
                className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1"
              >
                Ulangi Sandi
              </label>
              <input
                id="page-reg-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-terracotta)] transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-lg bg-[var(--accent-terracotta)] text-white font-display font-medium text-sm hover:opacity-95 active:scale-98 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Mendaftarkan Akun...' : 'Buat Akun & Mulai Belajar'}
          </button>

          <div className="text-center text-xs text-[var(--text-secondary)] pt-2">
            Sudah memiliki akun?{' '}
            <a
              href="/login"
              className="text-[var(--accent-terracotta)] font-semibold hover:underline cursor-pointer"
            >
              Masuk di sini
            </a>
          </div>
        </form>
      )}

      {/* Forgot Password Form */}
      {mode === 'forgot' && (
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="page-forgot-email"
              className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1"
            >
              Alamat Email Terdaftar
            </label>
            <input
              id="page-forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@domain.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-terracotta)] transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-lg bg-[var(--accent-terracotta)] text-white font-display font-medium text-sm hover:opacity-95 active:scale-98 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Tautan Reset Sandi'}
          </button>

          <div className="text-center text-xs text-[var(--text-secondary)] pt-2">
            Ingat kata sandi?{' '}
            <a
              href="/login"
              className="text-[var(--accent-terracotta)] font-semibold hover:underline cursor-pointer"
            >
              Kembali ke Masuk
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
