import React, { useState, useEffect, useId, useCallback, useRef } from 'react';
import {
  PYTHON_FINAL_EXAM,
  type BankQuestion,
  type LiveCodingChallenge,
} from '../lib/pythonQuizBank';
import {
  awardFinalExamCompletion,
  isExerciseCompleted,
  getSavedSession,
  type UserProfile,
} from '../lib/userStore';
import { useProctoring } from '../lib/useProctoring';
import { LiveCodingExercise } from './LiveCodingExercise';
import {
  TrophyIcon,
  CheckIcon,
  SparklesIcon,
  ClockIcon,
} from './Icons';

export interface FinalExamProps {
  durationMinutes?: number; // default 25 minutes
  passingScore?: number; // default 80%
}

// Fisher-Yates unbiased shuffle
function shuffleArray<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const FinalExam: React.FC<FinalExamProps> = ({
  durationMinutes = 25,
  passingScore = 80,
}) => {
  const compId = useId();
  const [hasStarted, setHasStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);
  const [mcqQuestions, setMcqQuestions] = useState<BankQuestion[]>([]);
  const [codingChallenges, setCodingChallenges] = useState<LiveCodingChallenge[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [verifiedCoding, setVerifiedCoding] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [awardFeedback, setAwardFeedback] = useState<string | null>(null);
  const [isGraduated, setIsGraduated] = useState(false);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [certCredentialId, setCertCredentialId] = useState<string>('');

  const timerRef = useRef<number | null>(null);

  // Anti-cheat proctoring
  const {
    tabSwitches,
    blurCount,
    fullscreenExits,
    copyAttempts,
    splitScreenDetected,
    isFullscreen,
    totalViolations,
    recentAlert,
    toggleFullscreen,
    handleCopyProtection,
    handleContextMenuProtection,
    resetProctoring,
    dismissAlert,
  } = useProctoring({
    enabled: true,
    quizActive: hasStarted && !submitted,
  });

  // Check initial graduation status
  useEffect(() => {
    const user = getSavedSession();
    setActiveUser(user);
    const graduated = isExerciseCompleted('cert_python_graduate');
    setIsGraduated(graduated);

    // Deterministic credential ID
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    setCertCredentialId(`BIN-PY-2026-${randomHex}`);

    const handleUserUpdate = () => {
      const u = getSavedSession();
      setActiveUser(u);
      setIsGraduated(isExerciseCompleted('cert_python_graduate'));
    };
    window.addEventListener('belajar:user-updated', handleUserUpdate);
    return () => {
      window.removeEventListener('belajar:user-updated', handleUserUpdate);
    };
  }, []);

  // Initialize randomized exam questions
  const initializeExam = useCallback(() => {
    const shuffledMCQ = shuffleArray(PYTHON_FINAL_EXAM.questions).map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
    const shuffledCoding = shuffleArray(PYTHON_FINAL_EXAM.codingChallenges);

    setMcqQuestions(shuffledMCQ);
    setCodingChallenges(shuffledCoding);
    setSelectedAnswers({});
    setVerifiedCoding({});
    setTimeRemaining(durationMinutes * 60);
    setSubmitted(false);
    resetProctoring();
  }, [durationMinutes, resetProctoring]);

  const handleStartExam = () => {
    initializeExam();
    setHasStarted(true);
    // Smooth scroll to top of exam
    if (typeof window !== 'undefined') {
      const el = document.getElementById('ujian-akhir-python');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleCodingVerification = useCallback((challengeId: string, passed: boolean) => {
    setVerifiedCoding((prev) => ({ ...prev, [challengeId]: passed }));
  }, []);

  // Evaluation & submission logic
  const evaluateAndSubmit = useCallback(() => {
    if (submitted) return;

    let correct = 0;
    const totalQuestions = mcqQuestions.length + codingChallenges.length;

    // Evaluate MCQs
    mcqQuestions.forEach((q, idx) => {
      const chosenOpt = selectedAnswers[idx];
      if (chosenOpt !== undefined && q.options[chosenOpt]?.isCorrect) {
        correct += 1;
      }
    });

    // Evaluate Coding challenges
    codingChallenges.forEach((c) => {
      if (verifiedCoding[c.id]) {
        correct += 1;
      }
    });

    const calculatedScore = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    setScore(calculatedScore);
    setCorrectCount(correct);
    setSubmitted(true);

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (calculatedScore >= passingScore) {
      const award = awardFinalExamCompletion('exam_python_final', 150, 50, 2);
      setAwardFeedback(award.message);
      setIsGraduated(true);
    }
  }, [codingChallenges, mcqQuestions, passingScore, selectedAnswers, submitted, verifiedCoding]);

  // Countdown timer
  useEffect(() => {
    if (!hasStarted || submitted) return;

    timerRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          evaluateAndSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [hasStarted, submitted, evaluateAndSubmit]);

  const handleRetryExam = () => {
    setHasStarted(false);
    setSubmitted(false);
    setScore(0);
    setCorrectCount(0);
    setAwardFeedback(null);
    handleStartExam();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalQuestions = mcqQuestions.length + codingChallenges.length;
  const isPassed = score >= passingScore;
  const timerRatio = timeRemaining / (durationMinutes * 60);
  const isUrgent = timeRemaining <= 300; // < 5 minutes

  // Pre-exam Launch Screen
  if (!hasStarted) {
    return (
      <div
        id="ujian-akhir-python"
        className="my-12 rounded-3xl border-2 border-[var(--border-focused)] bg-[var(--bg-surface)] overflow-hidden shadow-xl"
      >
        <div className="p-6 sm:p-10 bg-linear-to-br from-[#1c1917] via-[#292524] to-[#1c1917] text-white">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[var(--accent-terracotta)] text-white shadow-xs">
              🏆 Evaluasi Akhir Modul P1 - P5
            </span>
            {isGraduated && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckIcon className="w-4 h-4" /> Gelar Lulusan Python Terverifikasi
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white mb-3">
            Ujian Akhir Komprehensif Python (Final Exam)
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 font-serif leading-relaxed max-w-2xl mb-6">
            Ujian akhir resmi mencakup seluruh 5 Bab kurikulum Python (Dasar, Alur Kontrol, Koleksi Data, Fungsi Modular, & OOP). Dilengkapi sistem pengawasan anti-curang proctored dan batas waktu 25 menit.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono mb-8">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-neutral-200">
              <div className="text-[11px] text-neutral-400">Durasi Pengerjaan:</div>
              <div className="text-base sm:text-lg font-bold text-amber-400 mt-1 flex items-center gap-1">
                <ClockIcon className="w-4 h-4" /> 25 Menit
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-neutral-200">
              <div className="text-[11px] text-neutral-400">Komposisi Soal:</div>
              <div className="text-base sm:text-lg font-bold text-sky-400 mt-1">
                10 Q&A + 5 Coding
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-neutral-200">
              <div className="text-[11px] text-neutral-400">Standar Kelulusan:</div>
              <div className="text-base sm:text-lg font-bold text-emerald-400 mt-1">
                ≥ 80% (12/15)
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-neutral-200">
              <div className="text-[11px] text-neutral-400">Hadiah & Gelar:</div>
              <div className="text-base sm:text-lg font-bold text-purple-400 mt-1 flex items-center gap-1">
                <TrophyIcon className="w-4 h-4" /> +150 XP & Sertifikat
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 font-sans mb-8 leading-relaxed">
            <strong>🛡️ Peraturan Pengawasan Integritas (Anti-Cheat):</strong> Selama ujian berlangsung, teks soal dikunci dari penyalinan/pemotongan, dilarang beralih tab atau aplikasi, dan dilarang membagi layar multitasking. Setiap pelanggaran akan dicatat dalam lembar evaluasi akhir.
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleStartExam}
              className="px-8 py-3.5 rounded-xl text-sm font-mono font-bold bg-[var(--accent-terracotta)] text-white hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-lg flex items-center gap-2"
            >
              <SparklesIcon className="w-4 h-4" /> Mulai Ujian Akhir Komprehensif
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-4 py-3.5 rounded-xl text-xs font-mono font-medium border border-white/20 bg-white/5 hover:bg-white/10 text-neutral-200 transition-colors cursor-pointer"
            >
              {isFullscreen ? '⤓ Keluar Layar Penuh' : '⤢ Masuk Layar Penuh Sebelum Mulai'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active or Submitted Exam Screen
  return (
    <div
      id="ujian-akhir-python"
      onCopy={handleCopyProtection}
      onCut={handleCopyProtection}
      onContextMenu={handleContextMenuProtection}
      className="my-12 rounded-3xl border-2 border-[var(--border-focused)] bg-[var(--bg-surface)] overflow-hidden shadow-2xl relative select-none"
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {/* Proctoring Warning Toast */}
      {recentAlert && (
        <div className="sticky top-2 z-50 mx-4 my-2 p-3.5 rounded-xl bg-amber-500 text-slate-950 font-sans text-xs font-semibold shadow-xl border border-amber-600 flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>{recentAlert}</span>
          </div>
          <button
            type="button"
            onClick={dismissAlert}
            className="px-2 py-0.5 rounded bg-amber-600/50 hover:bg-amber-600 text-slate-950 text-[11px] font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Sticky Countdown Timer & Proctor Header */}
      <div className="sticky top-0 z-40 px-5 py-3.5 bg-[var(--bg-subtle)]/95 backdrop-blur-md border-b border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[var(--accent-terracotta)] animate-pulse"></span>
          <div>
            <h3 className="font-display font-bold text-sm sm:text-base text-[var(--text-primary)]">
              Ujian Akhir Python (Bab 1–5)
            </h3>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              15 Soal Terpadu (10 Q&A + 5 Live Coding)
            </span>
          </div>
        </div>

        {/* Live Timer & Violations Counter */}
        <div className="flex items-center gap-3">
          {!submitted && (
            <div
              className={`px-3 py-1.5 rounded-xl border font-mono text-sm font-bold flex items-center gap-2 ${
                isUrgent
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse'
                  : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)]'
              }`}
            >
              <ClockIcon className="w-4 h-4 text-amber-500" />
              <span>{formatTimer(timeRemaining)}</span>
            </div>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden sm:inline-flex px-2.5 py-1 text-xs font-mono rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {isFullscreen ? '⤓ Normal' : '⤢ Fullscreen'}
          </button>

          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${
              totalViolations > 0
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-default)]'
            }`}
          >
            Pelanggaran: {totalViolations}
          </span>
        </div>
      </div>

      {/* Visual Timer Progress Bar */}
      {!submitted && (
        <div className="w-full h-1 bg-[var(--border-default)]">
          <div
            className={`h-full transition-all duration-1000 ${
              isUrgent ? 'bg-rose-500' : 'bg-[var(--accent-terracotta)]'
            }`}
            style={{ width: `${Math.max(0, timerRatio * 100)}%` }}
          ></div>
        </div>
      )}

      {/* Exam Body */}
      <div className="p-5 sm:p-8 space-y-10">
        {/* Anti-cheat banner */}
        {!submitted && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-[var(--text-secondary)] space-y-1">
            <div className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
              <span>🛡️ Ujian Sedang Berlangsung:</span>
            </div>
            <p className="leading-relaxed">
              Waktu terus berjalan. Harap selesaikan 10 soal pilihan ganda dan 5 tantangan live coding di bawah ini. Jawaban akan otomatis terkirim saat waktu habis.
            </p>
            {splitScreenDetected && (
              <div className="p-2 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono text-[11px] font-bold">
                ⚠️ Peringatan: Layar terbelah / multitasking terdeteksi. Maksimalkan jendela browser!
              </div>
            )}
          </div>
        )}

        {/* SECTION 1: Multiple Choice Questions (10 Questions) */}
        <div className="space-y-6">
          <div className="pb-3 border-b border-[var(--border-default)] flex items-center justify-between">
            <h4 className="text-base font-bold font-display text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-terracotta)]"></span>
              Bagian 1: Soal Evaluasi Konseptual (10 Soal Pilihan Ganda)
            </h4>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {Object.keys(selectedAnswers).length} / {mcqQuestions.length} Terjawab
            </span>
          </div>

          <div className="space-y-6">
            {mcqQuestions.map((q, qIdx) => {
              const chosenOpt = selectedAnswers[qIdx];
              return (
                <div
                  key={`${compId}-exam-q-${q.id}-${qIdx}`}
                  className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-canvas)]/40 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      {qIdx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-[11px] font-mono text-[var(--accent-terracotta)] font-semibold mb-1">
                        Bab {q.subBab.split('.')[0]} • Sub-bab {q.subBab}
                      </div>
                      <div className="text-sm font-semibold text-[var(--text-primary)] font-display leading-snug">
                        {q.question}
                      </div>
                    </div>
                  </div>

                  {q.codeSnippet && (
                    <pre className="p-3 rounded-lg bg-[#18181b] text-[#f4f4f5] font-mono text-xs overflow-x-auto border border-[#27272a] leading-relaxed">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  )}

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = chosenOpt === optIdx;
                      let styleClass =
                        'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--border-focused)]';

                      if (submitted) {
                        if (opt.isCorrect) {
                          styleClass =
                            'border-[var(--state-success)] bg-[var(--state-success)]/10 text-[var(--state-success)] font-semibold';
                        } else if (isSelected && !opt.isCorrect) {
                          styleClass =
                            'border-[var(--state-danger)] bg-[var(--state-danger)]/10 text-[var(--state-danger)] font-medium';
                        } else {
                          styleClass =
                            'border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-muted)] opacity-60';
                        }
                      } else if (isSelected) {
                        styleClass =
                          'border-[var(--accent-terracotta)] bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] font-semibold ring-1 ring-[var(--accent-terracotta)]';
                      }

                      return (
                        <button
                          key={`${compId}-exam-opt-${optIdx}`}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleSelectAnswer(qIdx, optIdx)}
                          disabled={submitted}
                          className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer flex items-start gap-2.5 ${styleClass}`}
                        >
                          <span className="w-5 h-5 rounded-full border border-current font-mono flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <div className="flex-1 font-sans">
                            <div className="leading-snug">{opt.text}</div>
                            {submitted && (
                              <div className="mt-2 text-xs font-sans text-[var(--text-secondary)] font-normal leading-relaxed pt-1.5 border-t border-current/15">
                                {opt.isCorrect ? '✓ Penjelasan: ' : isSelected ? '✗ Keliru: ' : 'Ket: '}
                                {opt.explanation}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Live Coding Challenges (5 Challenges covering Bab 1-5) */}
        <div className="space-y-6 pt-6 border-t border-[var(--border-default)]">
          <div className="pb-3 border-b border-[var(--border-default)] flex items-center justify-between">
            <h4 className="text-base font-bold font-display text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-teal)]"></span>
              Bagian 2: Tantangan Live Coding Pyodide WASM (5 Tantangan)
            </h4>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {Object.values(verifiedCoding).filter(Boolean).length} / {codingChallenges.length} Terverifikasi
            </span>
          </div>

          <div className="space-y-6">
            {codingChallenges.map((challenge, cIdx) => {
              const isVerified = verifiedCoding[challenge.id] ?? false;
              return (
                <div key={`${compId}-exam-c-${challenge.id}-${cIdx}`} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--accent-teal)]">
                    <span className="w-6 h-6 rounded-lg bg-[var(--accent-teal)] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      {mcqQuestions.length + cIdx + 1}
                    </span>
                    <span>{challenge.title}</span>
                  </div>

                  <LiveCodingExercise
                    challenge={challenge}
                    onVerificationChange={handleCodingVerification}
                    isCompleted={isVerified}
                    disabled={submitted}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Submission / Results Footer */}
        <div className="pt-6 border-t border-[var(--border-default)]">
          {!submitted ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs font-mono text-[var(--text-secondary)] space-y-1">
                <div>
                  Pilihan Ganda: <strong>{Object.keys(selectedAnswers).length}</strong>/{mcqQuestions.length} • Coding: <strong>{Object.values(verifiedCoding).filter(Boolean).length}</strong>/{codingChallenges.length}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Pastikan seluruh kode telah diuji coba sebelum mengirim jawaban akhir.
                </div>
              </div>

              <button
                type="button"
                onClick={evaluateAndSubmit}
                className="px-8 py-3.5 rounded-xl text-sm font-mono font-bold bg-[var(--accent-terracotta)] text-white hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <SparklesIcon className="w-4 h-4" /> Kumpulkan Ujian Akhir Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Outcome Banner */}
              <div
                className={`p-6 sm:p-8 rounded-2xl border ${
                  isPassed
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-[var(--text-primary)]'
                    : 'border-rose-500/40 bg-rose-500/10 text-[var(--text-primary)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                          isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {isPassed ? '🎓 LULUS UJIAN AKHIR KOMPREHENSIF' : 'BELUM MEMENUHI KELULUSAN'}
                      </span>
                      <span className="text-base font-mono font-bold">
                        Skor Akhir: {score}% ({correctCount}/{totalQuestions} Soal Tuntas)
                      </span>
                    </div>

                    <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed max-w-xl">
                      {isPassed
                        ? `Selamat luar biasa! Kamu telah menuntaskan seluruh 5 Bab kurikulum Python belajar.in dengan gemilang (${correctCount} dari ${totalQuestions} soal berhasil dijawab dan diverifikasi). Sertifikat kelulusan resmimu telah diterbitkan!`
                        : `Kamu memperoleh skor ${score}%. Ambang batas kelulusan kurikulum adalah ≥${passingScore}%. Silakan pelajari kembali bab-bab yang masih kurang dipahami lalu coba ujian kembali.`}
                    </p>

                    {totalViolations > 0 && (
                      <div className="text-xs font-mono text-amber-700 dark:text-amber-400">
                        Catatan Pengawasan Integritas: Terdeteksi {totalViolations} pelanggaran integritas (pindah tab/fokus: {tabSwitches + blurCount}, fullscreen exit: {fullscreenExits}, copy attempt: {copyAttempts}).
                      </div>
                    )}
                  </div>

                  {awardFeedback && (
                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-emerald-500 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 shadow-md text-center">
                      <div>🏆 HADIAH KELULUSAN:</div>
                      <div className="text-sm mt-1">{awardFeedback}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Official Graduation Certificate (Rendered when Passed) */}
              {isPassed && (
                <div className="p-6 sm:p-10 rounded-3xl border-4 border-amber-600/40 bg-linear-to-b from-stone-900 via-neutral-900 to-stone-900 text-white shadow-2xl relative overflow-hidden">
                  {/* Watermark / Seal Background */}
                  <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none select-none text-9xl font-display font-black">
                    PYTHON
                  </div>

                  <div className="text-center space-y-4 max-w-xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-mono tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ★ SERTIFIKAT KELULUSAN RESMI • BELAJAR.IN ★
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-amber-200 tracking-tight">
                      Python Software Engineering Certification
                    </h3>

                    <p className="text-xs text-neutral-400 font-mono">
                      Dengan ini menyatakan bahwa:
                    </p>

                    <div className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-wide underline decoration-amber-500 decoration-2 underline-offset-8">
                      {activeUser?.name || activeUser?.username || 'Pembelajar Berdedikasi'}
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed pt-2">
                      Telah berhasil menyelesaikan seluruh silabus kurikulum <strong>Python 3.12 (Bab 1–5)</strong> dan dinyatakan lulus <strong>Ujian Akhir Komprehensif</strong> dengan nilai kelulusan <strong>{score}%</strong>.
                    </p>

                    {/* Certificate Meta Details */}
                    <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left border-t border-white/10 text-xs font-mono">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">ID KREDENSIAL:</span>
                        <span className="text-amber-400 font-bold">{certCredentialId}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">TANGGAL PENERBITAN:</span>
                        <span className="text-white font-medium">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-neutral-500 block text-[10px]">STATUS:</span>
                        <span className="text-emerald-400 font-bold">✓ VERIFIED MASTER</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleRetryExam}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-medium border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-focused)] transition-colors cursor-pointer"
                >
                  ↻ Coba Ulang Ujian (Kocok Ulang Soal & Timer)
                </button>

                <a
                  href="/dashboard"
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold bg-[var(--accent-terracotta)] text-white hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 shadow-xs text-decoration-none"
                >
                  <span>Kembali ke Meja Kerja Dashboard</span>
                  <TrophyIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
