import React, { useState } from 'react';
import { getRankInfo } from '../lib/ranks';
import {
  type UserProfile,
  calculateCheckIn,
  saveSession,
  isExerciseCompleted,
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
  LockIcon,
  BookOpenIcon,
  LayersIcon,
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

type DashboardTab = 'courses' | 'checkin' | 'events';
type CourseFilter = 'all' | 'python' | 'javascript';

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
  const [activeTab, setActiveTab] = useState<DashboardTab>('courses');
  const [courseFilter, setCourseFilter] = useState<CourseFilter>('all');

  const rankInfo = getRankInfo(user.xp);
  const today = new Date().toISOString().split('T')[0];
  const isAlreadyCheckedIn = user.lastCheckInDate === today;

  const isP1Done = isExerciseCompleted('quiz_python-bab1');
  const isP2Done = isExerciseCompleted('quiz_python-bab2');
  const isP3Done = isExerciseCompleted('quiz_python-bab3');
  const isP4Done = isExerciseCompleted('quiz_python-bab4');
  const isP5Done = isExerciseCompleted('quiz_python-bab5');

  const isP2Unlocked = isP1Done;
  const isP3Unlocked = isP2Done;
  const isP4Unlocked = isP3Done;
  const isP5Unlocked = isP4Done;

  const pythonCompletedBabs = [isP1Done, isP2Done, isP3Done, isP4Done, isP5Done].filter(Boolean).length;

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
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl border border-[var(--border-focused)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-lg flex items-start gap-3 transition-all"
        >
          <div className="w-5 h-5 rounded-full bg-[var(--accent-teal)]/15 text-[var(--accent-teal)] flex items-center justify-center shrink-0 mt-0.5">
            <SparklesIcon className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs sm:text-sm font-sans leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* Header Perkenalan */}
      <section className="p-6 sm:p-7 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--state-success)]"></span>
              <span>Meja Kerja Aktif</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-display">
              Halo, {user.username},
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
              Selamat datang kembali di meja kerja pemrogramanmu. Lanjutkan modul belajarmu, periksa streak harian, atau ikuti tantangan algoritma.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono font-medium text-[var(--text-primary)]">{user.name}</div>
              <div className="text-[11px] font-mono text-[var(--text-muted)]">{user.email}</div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--state-danger)] hover:border-[var(--state-danger)]/40 transition-colors cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </div>
      </section>

      {/* 4 Status Cards: Streak, Waktu, XP/Rank, Check-In/Koin */}
      <section aria-label="Status Progres Pembelajar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Streak */}
          <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-2">
                <span className="uppercase tracking-wider">Streak Belajar</span>
                <span className="w-7 h-7 rounded-md bg-[var(--bg-subtle)] text-amber-600 dark:text-amber-400 flex items-center justify-center border border-[var(--border-default)]">
                  <FlameIcon className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
                  {user.streak}
                </span>
                <span className="text-xs font-mono text-[var(--text-secondary)]">hari beruntun</span>
              </div>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-3 pt-2.5 border-t border-[var(--border-default)]">
              Konsistensi harian menambah streak & melipatgandakan koin.
            </p>
          </div>

          {/* 2. Lama User di Modul */}
          <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-2">
                <span className="uppercase tracking-wider">Waktu di Modul</span>
                <span className="w-7 h-7 rounded-md bg-[var(--bg-subtle)] text-[var(--accent-teal)] flex items-center justify-center border border-[var(--border-default)]">
                  <ClockIcon className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
                  {user.hoursSpent}
                </span>
                <span className="text-xs font-mono text-[var(--text-secondary)]">jam</span>
              </div>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-3 pt-2.5 border-t border-[var(--border-default)]">
              Total durasi investigasi kode dan latihan mandiri.
            </p>
          </div>

          {/* 3. XP & Rank */}
          <a
            href="/leaderboard"
            className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] shadow-2xs flex flex-col justify-between transition-all group text-decoration-none"
            title="Klik untuk membuka Papan Peringkat (Leaderboard)"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-2">
                <span className="uppercase tracking-wider">Rank & XP</span>
                <span className="w-7 h-7 rounded-md bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-center border border-[var(--border-default)]">
                  <TrophyIcon className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
                  {rankInfo.tier}
                </span>
                <span className="text-xs font-mono text-[var(--text-secondary)]">({user.xp} XP)</span>
              </div>

              {rankInfo.nextRank && (
                <div className="mt-2.5">
                  <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] mb-1">
                    <span>Menuju {rankInfo.nextRank.tier}</span>
                    <span>{rankInfo.xpNeededForNext} XP lagi</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--text-primary)] transition-all duration-300"
                      style={{ width: `${rankInfo.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] font-mono font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] flex items-center gap-1 mt-3 pt-2.5 border-t border-[var(--border-default)]">
              <span>Buka Leaderboard</span>
              <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

          {/* 4. Daily Check-In & Koin */}
          <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-2">
                <span className="uppercase tracking-wider">Koin & Hadiah</span>
                <span className="w-7 h-7 rounded-md bg-[var(--bg-subtle)] text-amber-600 dark:text-amber-400 flex items-center justify-center border border-[var(--border-default)]">
                  <CoinIcon className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2.5">
                <span className="text-2xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
                  {user.coins}
                </span>
                <span className="text-xs font-mono text-[var(--text-secondary)]">koin</span>
              </div>

              <button
                type="button"
                onClick={handleDailyCheckIn}
                disabled={isAlreadyCheckedIn}
                className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isAlreadyCheckedIn
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-default)] cursor-not-allowed opacity-80'
                    : 'bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 active:scale-98'
                }`}
              >
                {isAlreadyCheckedIn ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5 text-[var(--state-success)]" />
                    <span>Sudah Check-In</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>Check-In (+25 Koin)</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-2.5 pt-2 border-t border-[var(--border-default)]">
              {isAlreadyCheckedIn ? 'Kembali besok untuk reward beruntun.' : 'Ambil bonus harian untuk mempertahankan streak.'}
            </p>
          </div>
        </div>
      </section>

      {/* Structured Dashboard Tabs Navigation */}
      <div className="border-b border-[var(--border-default)] flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-display font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'courses'
              ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-bold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <BookOpenIcon className="w-4 h-4" />
          <span>Modul Kurikulum</span>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
            10
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('checkin')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-display font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'checkin'
              ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-bold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FlameIcon className="w-4 h-4" />
          <span>Harian & Konsistensi</span>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
            {user.streak}h
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-display font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'events'
              ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-bold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Event & Tantangan</span>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
            {EVENTS.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Modul Kurikulum */}
      {activeTab === 'courses' && (
        <section aria-labelledby="section-kelas-heading" className="space-y-6">
          {/* Fast-Track Placement Test Banner */}
          <div className="p-4 sm:p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] mb-1.5">
                <SparklesIcon className="w-3 h-3 text-[var(--accent-teal)]" />
                <span>Fast-Track Level Test-Out</span>
              </div>
              <h3 className="text-base font-bold font-display text-[var(--text-primary)]">
                Sudah Menguasai Konsep Dasar Pemrograman?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 max-w-xl leading-relaxed">
                Uji kemampuanmu lewat Placement Test adaptif untuk langsung membuka level lanjutan tanpa harus mengulang bab dasar.
              </p>
            </div>
            <a
              href="/placement"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-semibold rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity shrink-0 text-decoration-none shadow-2xs"
            >
              <span>Mulai Placement Test</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Sub-filter Controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] p-0.5">
              <button
                type="button"
                onClick={() => setCourseFilter('all')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                  courseFilter === 'all'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Semua (10)
              </button>
              <button
                type="button"
                onClick={() => setCourseFilter('python')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                  courseFilter === 'python'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Python ({pythonCompletedBabs}/5 Lulus)
              </button>
              <button
                type="button"
                onClick={() => setCourseFilter('javascript')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                  courseFilter === 'javascript'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                JavaScript (5)
              </button>
            </div>

            <span className="text-xs font-mono text-[var(--text-muted)] hidden sm:inline">
              Progress: {pythonCompletedBabs} Bab Python Selesai
            </span>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kelas Python P1 */}
            {(courseFilter === 'all' || courseFilter === 'python') && (
              <div className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
                      Python • Bab 1 (P1)
                    </span>
                    {isP1Done ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--state-success)]/10 text-[var(--state-success)] border border-[var(--state-success)]/20">
                        ✓ Lulus Evaluasi
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">Python 3.12 WASM</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 font-display">
                    Bab 1: Dasar Pemrograman & Variabel
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Fungsi print, name binding variabel dinamis di CPython, operator aritmatika, dan input pengguna.
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">4 Sub-bab + Kuis</span>
                  <a
                    href="/curriculum/python/p1"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity text-decoration-none"
                  >
                    <span>{isP1Done ? 'Buka Bab 1' : 'Mulai Bab 1'}</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Kelas Python P2 */}
            {(courseFilter === 'all' || courseFilter === 'python') && (
              <div className={`p-5 rounded-xl border transition-all shadow-2xs flex flex-col justify-between ${
                !isP2Unlocked
                  ? 'border-[var(--border-default)] bg-[var(--bg-subtle)]/50 opacity-75'
                  : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)]'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
                      Python • Bab 2 (P2)
                    </span>
                    {isP2Done ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--state-success)]/10 text-[var(--state-success)] border border-[var(--state-success)]/20">
                        ✓ Lulus Evaluasi
                      </span>
                    ) : !isP2Unlocked ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-default)] flex items-center gap-1">
                        <LockIcon className="w-3 h-3" />
                        <span>Terkunci</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">Control Flow</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 font-display">
                    Bab 2: Logika & Alur Kontrol
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Percabangan if-elif-else, perulangan for & range, perulangan while, dan kontrol alur break/continue.
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">3 Sub-bab + Kuis</span>
                  {isP2Unlocked ? (
                    <a
                      href="/curriculum/python/p2"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity text-decoration-none"
                    >
                      <span>Buka Bab 2</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <a
                      href="/curriculum/python/p1#kuis-python-bab1"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-decoration-none"
                    >
                      <LockIcon className="w-3 h-3" />
                      <span>Selesaikan Bab 1</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Kelas JavaScript J1 */}
            {(courseFilter === 'all' || courseFilter === 'javascript') && (
              <div className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
                      JavaScript • Level J1
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">ECMAScript 2024</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 font-display">
                    Fondasi Komputasi & Nilai
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Console inspector terisolasi, mutabilitas let vs immutabilitas const, dan 7 tipe data primitif di Web Worker.
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">7 Latihan Riil</span>
                  <a
                    href="/curriculum/javascript/j1"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity text-decoration-none"
                  >
                    <span>Buka Level J1</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Kelas JavaScript J2 */}
            {(courseFilter === 'all' || courseFilter === 'javascript') && (
              <div className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
                      JavaScript • Level J2
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">ECMAScript 2024</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 font-display">
                    Core JS: Struktur Data & Closure
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Array FP map/filter/reduce, destructuring, alokasi heap memori closure, dan ES Class private fields.
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">5 Latihan + Mini Proyek</span>
                  <a
                    href="/curriculum/javascript/j2"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity text-decoration-none"
                  >
                    <span>Buka Level J2</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Kelas Python P3 */}
            {(courseFilter === 'all' || courseFilter === 'python') && (
              <div className={`p-5 rounded-xl border transition-all shadow-2xs flex flex-col justify-between ${
                !isP3Unlocked
                  ? 'border-[var(--border-default)] bg-[var(--bg-subtle)]/50 opacity-75'
                  : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)]'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
                      Python • Bab 3 (P3)
                    </span>
                    {isP3Done ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--state-success)]/10 text-[var(--state-success)] border border-[var(--state-success)]/20">
                        ✓ Lulus Evaluasi
                      </span>
                    ) : !isP3Unlocked ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-default)] flex items-center gap-1">
                        <LockIcon className="w-3 h-3" />
                        <span>Terkunci</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">Koleksi Data</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 font-display">
                    Bab 3: Struktur Data Koleksi
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    List & slicing, Tuple immutability, Dictionary hash map O(1) merge, dan operasi himpunan Set.
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">4 Sub-bab + Kuis</span>
                  {isP3Unlocked ? (
                    <a
                      href="/curriculum/python/p3"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity text-decoration-none"
                    >
                      <span>Buka Bab 3</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <a
                      href="/curriculum/python/p2#kuis-python-bab2"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-decoration-none"
                    >
                      <LockIcon className="w-3 h-3" />
                      <span>Selesaikan Bab 2</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Kelas JavaScript J3 */}
            {(courseFilter === 'all' || courseFilter === 'javascript') && (
              <div className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
                      JavaScript • Level J3
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">Event Loop</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 font-display">
                    Asinkron, Web APIs & Event Loop
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Call Stack vs Web APIs, Microtask vs Macrotask, Promise combinators, dan AbortController.
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">6 Latihan + Mini Proyek</span>
                  <a
                    href="/curriculum/javascript/j3"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity text-decoration-none"
                  >
                    <span>Buka Level J3</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Kelas Python P4 */}
            {(courseFilter === 'all' || courseFilter === 'python') && (
              <div className={`p-5 rounded-xl border transition-all shadow-2xs flex flex-col justify-between ${
                !isP4Unlocked
                  ? 'border-[var(--border-default)] bg-[var(--bg-subtle)]/50 opacity-75'
                  : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)]'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
                      Python • Bab 4 (P4)
                    </span>
                    {isP4Done ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--state-success)]/10 text-[var(--state-success)] border border-[var(--state-success)]/20">
                        ✓ Lulus Evaluasi
                      </span>
                    ) : !isP4Unlocked ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-default)] flex items-center gap-1">
                        <LockIcon className="w-3 h-3" />
                        <span>Terkunci</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">Fungsi</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 font-display">
                    Bab 4: Fungsi & Modularitas
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Parameter *args & **kwargs, return tuple, LEGB scope, lambda, dan comprehension.
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">3 Sub-bab + Kuis</span>
                  {isP4Unlocked ? (
                    <a
                      href="/curriculum/python/p4"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity text-decoration-none"
                    >
                      <span>Buka Bab 4</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <a
                      href="/curriculum/python/p3#kuis-python-bab3"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-decoration-none"
                    >
                      <LockIcon className="w-3 h-3" />
                      <span>Selesaikan Bab 3</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Kelas JavaScript J4 */}
            {(courseFilter === 'all' || courseFilter === 'javascript') && (
              <div className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
                      JavaScript • Level J4
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">Vitest & Tooling</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 font-display">
                    Modern Tooling & Mini Test Runner
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Test-Driven Development (TDD), assertion matchers, in-browser mini Vitest runner, dan store subscription.
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">6 Latihan + Mini Proyek</span>
                  <a
                    href="/curriculum/javascript/j4"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity text-decoration-none"
                  >
                    <span>Buka Level J4</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Kelas Python P5 */}
            {(courseFilter === 'all' || courseFilter === 'python') && (
              <div className={`p-5 rounded-xl border transition-all shadow-2xs flex flex-col justify-between ${
                !isP5Unlocked
                  ? 'border-[var(--border-default)] bg-[var(--bg-subtle)]/50 opacity-75'
                  : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)]'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
                      Python • Bab 5 (P5)
                    </span>
                    {isP5Done ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--state-success)]/10 text-[var(--state-success)] border border-[var(--state-success)]/20">
                        ✓ Lulus Evaluasi
                      </span>
                    ) : !isP5Unlocked ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-default)] flex items-center gap-1">
                        <LockIcon className="w-3 h-3" />
                        <span>Terkunci</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">OOP</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 font-display">
                    Bab 5: Pemrograman Berorientasi Objek
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Class & Object, atribut self, pewarisan super(), enkapsulasi property setter, dan dunder methods.
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">4 Sub-bab + Kuis</span>
                  {isP5Unlocked ? (
                    <a
                      href="/curriculum/python/p5"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity text-decoration-none"
                    >
                      <span>Buka Bab 5</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <a
                      href="/curriculum/python/p4#kuis-python-bab4"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-decoration-none"
                    >
                      <LockIcon className="w-3 h-3" />
                      <span>Selesaikan Bab 4</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Kelas JavaScript J5 */}
            {(courseFilter === 'all' || courseFilter === 'javascript') && (
              <div className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
                      JavaScript • Level J5
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">Signals & Proxy</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 font-display">
                    Metaprogramming & Sistem Reaktivitas
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Proxy traps & Reflect, Generator function* paginasi, WeakMap, Pipe Currying, dan Reactive Signal Store.
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">6 Latihan + Mini Proyek</span>
                  <a
                    href="/curriculum/javascript/j5"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity text-decoration-none"
                  >
                    <span>Buka Level J5</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab 2: Harian & Check-In */}
      {activeTab === 'checkin' && (
        <section aria-labelledby="section-checkin-heading" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Check-In Action Card */}
            <div className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-[var(--text-muted)] font-semibold uppercase tracking-wider block mb-1">
                    Check-In Harian
                  </span>
                  <h3 id="section-checkin-heading" className="text-xl font-bold font-display text-[var(--text-primary)]">
                    Pertahankan Streak Belajarmu
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] text-amber-600 dark:text-amber-400 flex items-center justify-center border border-[var(--border-default)]">
                  <FlameIcon className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-[var(--text-muted)]">Streak Saat Ini</div>
                  <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-0.5">
                    {user.streak} Hari
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-[var(--text-muted)]">Saldo Koin</div>
                  <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-0.5">
                    {user.coins} Koin
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDailyCheckIn}
                disabled={isAlreadyCheckedIn}
                className={`w-full py-3 px-4 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isAlreadyCheckedIn
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-default)] cursor-not-allowed opacity-80'
                    : 'bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 active:scale-98 shadow-xs'
                }`}
              >
                {isAlreadyCheckedIn ? (
                  <>
                    <CheckIcon className="w-4 h-4 text-[var(--state-success)]" />
                    <span>Sudah Melakukan Check-In Hari Ini</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 text-amber-500" />
                    <span>Klaim Check-In Harian (+25 Koin)</span>
                  </>
                )}
              </button>
            </div>

            {/* Streak Rules Explanation */}
            <div className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-2xs space-y-4">
              <h3 className="text-base font-bold font-display text-[var(--text-primary)] flex items-center gap-2">
                <LayersIcon className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Aturan Gamifikasi & Konsistensi</span>
              </h3>

              <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] space-y-1">
                  <strong className="text-[var(--text-primary)] block">Check-In Beruntun (+25 Koin)</strong>
                  <p>Lakukan check-in setiap hari berturut-turut untuk menambah streak dan mendapatkan 25 koin penuh.</p>
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] space-y-1">
                  <strong className="text-[var(--text-primary)] block">Penalti Terlewat (+5 Koin & Reset)</strong>
                  <p>Jika kamu melewatkan satu hari tanpa belajar atau check-in, streak akan direset kembali ke 1 hari dan reward berkurang menjadi 5 koin.</p>
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] space-y-1">
                  <strong className="text-[var(--text-primary)] block">Kuis & Tantangan (+25 hingga +150 XP)</strong>
                  <p>Selesaikan latihan mandiri dan kuis akhir bab untuk mengumpulkan XP dan menaikkan tingkat rank akunmu.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Event & Tantangan */}
      {activeTab === 'events' && (
        <section aria-labelledby="section-event-heading" className="space-y-5">
          <div className="flex items-baseline justify-between border-b border-[var(--border-default)] pb-3">
            <div>
              <h2 id="section-event-heading" className="text-xl font-bold font-display text-[var(--text-primary)]">
                Event & Agenda Komunitas
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Tantangan algoritma berkala, sesi laboratorium interaktif, dan warta rilis materi.
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {user.registeredEvents.length} Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EVENTS.map((event) => {
              const isJoined = user.registeredEvents.includes(event.id);
              return (
                <div
                  key={event.id}
                  className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded border border-[var(--border-default)]">
                        {event.category}
                      </span>
                      {event.rewardXp > 0 && (
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-primary)] font-medium">
                          +{event.rewardXp} XP
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold font-display text-[var(--text-primary)] mb-2 leading-snug">
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
                            : 'bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90'
                        }`}
                      >
                        {isJoined ? (
                          <>
                            <CheckIcon className="w-3.5 h-3.5" />
                            <span>Terdaftar (Batalkan)</span>
                          </>
                        ) : (
                          <span>Ikuti Event Ini</span>
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
      )}
    </div>
  );
}
