import React, { useState } from 'react';
import { getRankInfo } from '../lib/ranks';
import {
  type UserProfile,
  calculateCheckIn,
  saveSession,
} from '../lib/userStore';
import {
  FlameIcon,
  ClockIcon,
  TrophyIcon,
  CoinIcon,
  CheckIcon,
  ArrowRightIcon,
  CalendarIcon,
  SparklesIcon,
} from './Icons';

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (updated: UserProfile) => void;
}

interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  rewardXp: number;
  rewardCoins: number;
  description: string;
  isJoinable: boolean;
}

const EVENTS: EventItem[] = [
  {
    id: 'event-sieve',
    title: 'Tantangan Algoritma: Sieve of Eratosthenes & Penapisan Bilangan Prima',
    category: 'Tantangan Komputasi',
    date: '8 - 9 November 2026',
    rewardXp: 150,
    rewardCoins: 50,
    description:
      'Tulis algoritma penapisan prima berkecepatan tinggi dengan alokasi array boolean deterministik dan batasan memori WebAssembly.',
    isJoinable: true,
  },
  {
    id: 'event-eventloop',
    title: 'Studio Jejak Eksekusi: Menelusuri Call Stack, Web API & Microtask Queue',
    category: 'Webinar Laboratorium',
    date: '12 November 2026 • 19:30 WIB',
    rewardXp: 50,
    rewardCoins: 25,
    description:
      'Sesi interaktif membedah visualisasi alur perpindahan execution context JavaScript langsung bersama perancang kurikulum.',
    isJoinable: true,
  },
  {
    id: 'announcement-p2',
    title: 'Warta Bengkel: Kurikulum Modul P2 (Python OOP) & J2 Segera Dibuka',
    category: 'Pengumuman Kurikulum',
    date: 'Rilis 15 November 2026',
    rewardXp: 0,
    rewardCoins: 0,
    description:
      'Modul P2 akan membongkar arsitektur object model Python, dunder methods, dan visualisasi diagram pointer memori interaktif.',
    isJoinable: false,
  },
];

export function Dashboard({ user, onLogout, onUpdateUser }: DashboardProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const rankInfo = getRankInfo(user.xp);
  const today = new Date().toISOString().split('T')[0];
  const isAlreadyCheckedIn = user.lastCheckInDate === today;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleDailyCheckIn = () => {
    const { updatedUser, result } = calculateCheckIn(user);
    if (result.success) {
      onUpdateUser(updatedUser);
      saveSession(updatedUser);
      showToast(result.message);
    } else {
      showToast(result.message);
    }
  };

  const handleToggleEvent = (event: EventItem) => {
    const isJoined = user.registeredEvents.includes(event.id);
    let updatedEvents: string[];
    let newXp = user.xp;
    let newCoins = user.coins;

    if (isJoined) {
      updatedEvents = user.registeredEvents.filter((id) => id !== event.id);
      showToast(`Pendaftaran event "${event.title}" telah dibatalkan.`);
    } else {
      updatedEvents = [...user.registeredEvents, event.id];
      newXp += event.rewardXp;
      newCoins += event.rewardCoins;
      showToast(
        `Berhasil mendaftar ke "${event.title}"! (+${event.rewardXp} XP & +${event.rewardCoins} Koin ditambahkan)`
      );
    }

    const updatedUser: UserProfile = {
      ...user,
      registeredEvents: updatedEvents,
      xp: newXp,
      coins: newCoins,
    };

    onUpdateUser(updatedUser);
    saveSession(updatedUser);
  };

  return (
    <div className="space-y-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl border border-[var(--border-focused)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xl flex items-start gap-3 transition-all"
        >
          <div className="w-5 h-5 rounded-full bg-[var(--accent-terracotta)]/15 text-[var(--accent-terracotta)] flex items-center justify-center shrink-0 mt-0.5">
            <SparklesIcon className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs sm:text-sm font-sans leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* Header Perkenalan */}
      <section className="p-6 sm:p-8 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[var(--bg-subtle)] text-[var(--accent-teal)] border border-[var(--border-default)] mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--state-success)] animate-pulse"></span>
              Meja Kerja Aktif
            </div>
            {/* Header Text requirement: "Halo, ${username}," */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] font-display">
              Halo, {user.username},
            </h1>
            <p className="text-base text-[var(--text-secondary)] mt-2 max-w-2xl leading-relaxed">
              Selamat datang kembali di meja kerja pemrogramanmu. Lanjutkan penyelidikan kode hari ini atau ikuti tantangan algoritma untuk menaikkan peringkatmu.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono font-medium text-[var(--text-secondary)]">{user.name}</div>
              <div className="text-[11px] font-mono text-[var(--text-muted)]">{user.email}</div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 text-xs font-mono rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--state-danger)] hover:border-[var(--state-danger)]/50 transition-colors cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </div>
      </section>

      {/* Status Progres Bar: Streak, Waktu di Modul, XP/Rank, Check-In/Koin */}
      <section aria-label="Status Progres Pembelajar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* 1. Streak / Api */}
          <div className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-3">
                <span className="uppercase tracking-wider">Streak Belajar</span>
                <span className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <FlameIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-[var(--text-primary)] tracking-tight">
                  {user.streak}
                </span>
                <span className="text-xs font-mono text-[var(--text-secondary)]">hari beruntun</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-4 leading-relaxed pt-3 border-t border-[var(--border-default)]">
              Belajar setiap hari berturut-turut untuk menambah streak dan melipatgandakan koin.
            </p>
          </div>

          {/* 2. Lama User di Modul (format jam, e.g. 5 jam, 372 jam) */}
          <div className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-3">
                <span className="uppercase tracking-wider">Waktu di Modul</span>
                <span className="w-8 h-8 rounded-lg bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] flex items-center justify-center">
                  <ClockIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-[var(--text-primary)] tracking-tight">
                  {user.hoursSpent}
                </span>
                <span className="text-xs font-mono text-[var(--text-secondary)]">jam</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-4 leading-relaxed pt-3 border-t border-[var(--border-default)]">
              Total waktu investigasi kode dan latihan interaktif di kurikulum belajar.in.
            </p>
          </div>

          {/* 3. XP & Rank (Clickable to Leaderboard!) */}
          <a
            href="/leaderboard"
            className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] shadow-xs flex flex-col justify-between transition-all group text-decoration-none"
            title="Klik untuk membuka Papan Peringkat (Leaderboard)"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-3">
                <span className="uppercase tracking-wider">Rank & XP</span>
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrophyIcon className="w-4 h-4" />
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${rankInfo.definition.badgeClass}`}>
                  {rankInfo.tier}
                </span>
                <span className="text-xs font-mono text-[var(--text-secondary)]">({user.xp} XP)</span>
              </div>

              {/* Progress bar towards next tier */}
              {rankInfo.nextRank && (
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)] mb-1">
                    <span>Menuju {rankInfo.nextRank.tier}</span>
                    <span>{rankInfo.xpNeededForNext} XP lagi</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent-terracotta)] transition-all duration-300"
                      style={{ width: `${rankInfo.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs font-mono font-medium text-[var(--accent-terracotta)] flex items-center gap-1 mt-4 pt-3 border-t border-[var(--border-default)] group-hover:underline">
              Buka Leaderboard <ArrowRightIcon className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* 4. Daily Check-In & Koin */}
          <div className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-3">
                <span className="uppercase tracking-wider">Koin & Check-In</span>
                <span className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <CoinIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-extrabold font-mono text-[var(--text-primary)] tracking-tight">
                  {user.coins}
                </span>
                <span className="text-xs font-mono text-[var(--text-secondary)]">koin</span>
              </div>

              <button
                type="button"
                onClick={handleDailyCheckIn}
                disabled={isAlreadyCheckedIn}
                className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                  isAlreadyCheckedIn
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-default)] cursor-not-allowed opacity-80'
                    : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-98'
                }`}
              >
                {isAlreadyCheckedIn ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5 text-[var(--state-success)]" />
                    Sudah Check-In Hari Ini
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Check-In Harian (+25 Koin)
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-3 leading-relaxed pt-2 border-t border-[var(--border-default)]">
              Jika tidak check-in sehari, streak akan direset dan koin yang didapat berkurang.
            </p>
          </div>
        </div>
      </section>

      {/* Komponen: KELAS (Python & JavaScript) */}
      <section aria-labelledby="section-kelas-heading" className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-[var(--border-default)] pb-3">
          <div>
            <h2 id="section-kelas-heading" className="text-2xl font-bold font-display text-[var(--text-primary)]">
              Kelas
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Jalur kurikulum berjenjang dengan eksekusi WebAssembly & runtime sandboxed nyata.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)]">4 Modul Aktif • J1, J2, P1, P2</span>
        </div>

        {/* Fast-Track Placement Test Banner */}
        <div className="p-5 rounded-xl border border-[var(--border-focused)] bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[var(--accent-terracotta)]/15 text-[var(--accent-terracotta)] mb-1.5">
              <SparklesIcon className="w-3 h-3" />
              Fast-Track Level Test-Out
            </div>
            <h3 className="text-base font-bold font-display text-[var(--text-primary)]">
              Sudah Memiliki Pengalaman Pemrograman?
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 max-w-xl leading-relaxed">
              Ikuti Uji Penempatan Adaptif (Placement Test) untuk membuktikan penguasaan konsep dasar dan langsung membuka Level J2 atau P2.
            </p>
          </div>
          <a
            href="/placement"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-semibold rounded-lg bg-[var(--accent-terracotta)] text-white hover:opacity-95 transition-opacity shrink-0 text-decoration-none shadow-2xs"
          >
            Mulai Placement Test <ArrowRightIcon className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kelas Python P1 */}
          <div className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] transition-all shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#3776AB]/15 text-[#20527B] dark:text-[#68B0EB] border border-[#3776AB]/20">
                  Python • Level P1
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">Python 3.12 WASM</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display">
                Fondasi Pemrograman Python
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                Fungsi `print()`, operator aritmatika, name binding variabel dinamis di CPython, dan penelusuran kontrol alur berbasis indentasi.
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)]">7 Latihan Riil</span>
              <a
                href="/curriculum/python/p1"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-medium rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity"
              >
                Buka Level P1 <ArrowRightIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Kelas Python P2 (New!) */}
          <div className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] transition-all shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#3776AB]/15 text-[#20527B] dark:text-[#68B0EB] border border-[#3776AB]/20">
                  Python • Level P2 (Baru)
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">Python 3.12 MEMFS</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display">
                Struktur Data & Manipulasi File
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                List, Tuple, Dict, Set, Slicing [start:stop:step], Comprehensions, virtual file I/O CSV & JSON di MEMFS Pyodide, dan Exception Handling.
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)]">5 Latihan + Mini Proyek</span>
              <a
                href="/curriculum/python/p2"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-medium rounded-lg bg-[#3776AB] text-white hover:opacity-90 transition-opacity"
              >
                Buka Level P2 <ArrowRightIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Kelas JavaScript J1 */}
          <div className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] transition-all shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#F7DF1E]/20 text-[#857000] dark:text-[#F7DF1E] border border-[#F7DF1E]/30">
                  JavaScript • Level J1
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">ECMAScript 2024</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display">
                Fondasi Komputasi & Nilai
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                Console inspector terisolasi, mutabilitas `let` vs immutabilitas `const`, 7 tipe data primitif, dan fungsi modular di Web Worker sandbox.
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)]">7 Latihan Riil</span>
              <a
                href="/curriculum/javascript/j1"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-medium rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity"
              >
                Buka Level J1 <ArrowRightIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Kelas JavaScript J2 (New!) */}
          <div className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] transition-all shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#F7DF1E]/20 text-[#857000] dark:text-[#F7DF1E] border border-[#F7DF1E]/30">
                  JavaScript • Level J2 (Baru)
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">ECMAScript 2024</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display">
                Core JavaScript: Struktur Data & Closure
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                Array FP map/filter/reduce, destructuring, alokasi heap memori closure, immutability structuredClone, ES Class (#privateField), dan custom errors.
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)]">5 Latihan + Mini Proyek</span>
              <a
                href="/curriculum/javascript/j2"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-medium rounded-lg bg-[var(--accent-terracotta)] text-white hover:opacity-95 transition-opacity"
              >
                Buka Level J2 <ArrowRightIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Komponen: EVENT & PENGUMUMAN */}
      <section aria-labelledby="section-event-heading" className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-[var(--border-default)] pb-3">
          <div>
            <h2 id="section-event-heading" className="text-2xl font-bold font-display text-[var(--text-primary)]">
              Event & Pengumuman
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Tantangan komputasi berkala, sesi laboratorium interaktif, dan warta rilis materi.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)]">Kegiatan Komunitas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EVENTS.map((event) => {
            const isJoined = user.registeredEvents.includes(event.id);
            return (
              <div
                key={event.id}
                className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono text-[var(--accent-teal)] font-medium">
                      {event.category}
                    </span>
                    {event.rewardXp > 0 && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                        +{event.rewardXp} XP
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold font-display text-[var(--text-primary)] mb-2 leading-snug">
                    {event.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] mb-3">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{event.date}</span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    {event.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-default)]">
                  {event.isJoinable ? (
                    <button
                      type="button"
                      onClick={() => handleToggleEvent(event)}
                      className={`w-full py-2 px-3 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isJoined
                          ? 'border border-[var(--state-success)] text-[var(--state-success)] bg-[var(--state-success)]/10 hover:bg-[var(--state-danger)]/10 hover:text-[var(--state-danger)] hover:border-[var(--state-danger)]'
                          : 'bg-[var(--accent-terracotta)] text-white hover:opacity-95'
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <CheckIcon className="w-3.5 h-3.5" />
                          Terdaftar (Batalkan)
                        </>
                      ) : (
                        <>Ikuti Event Ini</>
                      )}
                    </button>
                  ) : (
                    <span className="block text-center text-xs font-mono text-[var(--text-muted)] py-1.5 bg-[var(--bg-subtle)] rounded-lg">
                      Segera Diumumkan
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
