import React, { useState } from 'react';
import { LocalAuthManager, type UserProfile } from '../lib/userStore';

export type AuthMode = 'login' | 'register' | 'forgot';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export function AuthModal({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessNotice(null);
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError('Masukkan username atau alamat email kamu.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const user = LocalAuthManager.login(username, password);
        setIsSubmitting(false);
        onSuccess(user);
        onClose();
      } catch (err: unknown) {
        setIsSubmitting(false);
        setError(err instanceof Error ? err.message : 'Gagal memproses login.');
      }
    }, 150);
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
    setTimeout(() => {
      try {
        const user = LocalAuthManager.register(cleanUsername, email, password);
        setIsSubmitting(false);
        onSuccess(user);
        onClose();
      } catch (err: unknown) {
        setIsSubmitting(false);
        setError(err instanceof Error ? err.message : 'Gagal mendaftarkan akun.');
      }
    }, 150);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !email.includes('@')) {
      setError('Masukkan alamat email yang valid untuk menerima tautan pemulihan.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = LocalAuthManager.forgotPassword(email);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessNotice(res.message);
      } else {
        setError(res.message);
      }
    }, 200);
  };

  const handleQuickDemo = () => {
    const demo = LocalAuthManager.login('budi_koding', 'password123');
    onSuccess(demo);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div
        className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-2xl p-6 sm:p-8 relative transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          aria-label="Tutup dialog autentikasi"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] mb-2">
            Autentikasi Pembelajar
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-bold font-display text-[var(--text-primary)]">
            {mode === 'login' && 'Masuk ke Meja Kerja'}
            {mode === 'register' && 'Buka Akun Pembelajar'}
            {mode === 'forgot' && 'Pemulihan Kata Sandi'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {mode === 'login' && 'Lanjutkan progres modul, streak harian, dan pencapaian XP-mu.'}
            {mode === 'register' && 'Mulai perjalanan mendalami komputasi riil tanpa instalasi lokal.'}
            {mode === 'forgot' && 'Ketikkan email terdaftar untuk menerima petunjuk reset password.'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-[var(--state-danger)]/30 bg-[var(--state-danger)]/10 text-sm text-[var(--state-danger)]">
            {error}
          </div>
        )}

        {successNotice && (
          <div className="mb-4 p-3 rounded-lg border border-[var(--state-success)]/30 bg-[var(--state-success)]/10 text-sm text-[var(--state-success)]">
            {successNotice}
          </div>
        )}

        {/* Mode: Login */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-username" className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1">
                Username atau Email
              </label>
              <input
                id="login-username"
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
                <label htmlFor="login-password" className="text-xs font-mono font-medium text-[var(--text-secondary)]">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('forgot')}
                  className="text-xs text-[var(--accent-terracotta)] hover:underline cursor-pointer"
                >
                  Lupa password?
                </button>
              </div>
              <input
                id="login-password"
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
              className="w-full py-2.5 px-4 rounded-lg bg-[var(--accent-terracotta)] text-white font-display font-medium text-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Memverifikasi...' : 'Masuk Sekarang'}
            </button>

            {/* Quick Demo Option */}
            <div className="pt-2 border-t border-[var(--border-default)]">
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-2 px-3 rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-focused)] transition-colors cursor-pointer text-center"
              >
                ⚡ Coba Akun Demo Cepat (Budi • Master 750 XP)
              </button>
            </div>

            <div className="text-center text-xs text-[var(--text-secondary)] pt-2">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('register')}
                className="text-[var(--accent-terracotta)] font-semibold hover:underline cursor-pointer"
              >
                Daftar sekarang
              </button>
            </div>
          </form>
        )}

        {/* Mode: Register */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-username" className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1">
                Username Baru
              </label>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="misal: refactor_naufal"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-terracotta)] transition-colors font-mono"
              />
              <span className="text-[11px] text-[var(--text-muted)] mt-1 block">Hanya huruf kecil, angka, dan underscore.</span>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1">
                Alamat Email
              </label>
              <input
                id="reg-email"
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
                <label htmlFor="reg-password" className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1">
                  Kata Sandi
                </label>
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-terracotta)] transition-colors font-mono"
                />
              </div>
              <div>
                <label htmlFor="reg-confirm" className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1">
                  Ulangi Sandi
                </label>
                <input
                  id="reg-confirm"
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
              className="w-full py-2.5 px-4 rounded-lg bg-[var(--accent-terracotta)] text-white font-display font-medium text-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Membuat Akun...' : 'Buat Akun & Mulai Belajar'}
            </button>

            <div className="text-center text-xs text-[var(--text-secondary)] pt-2">
              Sudah memiliki akun?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="text-[var(--accent-terracotta)] font-semibold hover:underline cursor-pointer"
              >
                Masuk di sini
              </button>
            </div>
          </form>
        )}

        {/* Mode: Forgot Password */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1">
                Alamat Email Terdaftar
              </label>
              <input
                id="forgot-email"
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
              className="w-full py-2.5 px-4 rounded-lg bg-[var(--accent-terracotta)] text-white font-display font-medium text-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Tautan Reset Sandi'}
            </button>

            <div className="text-center text-xs text-[var(--text-secondary)] pt-2">
              Ingat kata sandi?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="text-[var(--accent-terracotta)] font-semibold hover:underline cursor-pointer"
              >
                Kembali ke Masuk
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
