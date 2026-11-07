import React, { useState, useEffect, useId, useCallback } from 'react';
import { recordConceptObservation, applyTestOutMastery } from '../lib/bkt';
import {
  awardChapterQuizCompletion,
  isExerciseCompleted,
} from '../lib/userStore';
import {
  PYTHON_CHAPTERS,
  type BankQuestion,
  type LiveCodingChallenge,
} from '../lib/pythonQuizBank';
import { useProctoring } from '../lib/useProctoring';
import { LiveCodingExercise } from './LiveCodingExercise';
import { SparklesIcon, CheckIcon, ArrowRightIcon } from './Icons';

export interface ChapterQuizProps {
  chapterId: string;
  title?: string;
  passingScore?: number; // default 80%
  questionsPerAttempt?: number; // default 5
  nextChapterUrl?: string;
  nextChapterTitle?: string;
}

export type QuizItemType =
  | {
      type: 'multiple-choice';
      id: string;
      conceptId: string;
      subBab: string;
      question: string;
      codeSnippet?: string;
      options: {
        originalIndex: number;
        text: string;
        isCorrect: boolean;
        explanation: string;
      }[];
    }
  | {
      type: 'live-coding';
      id: string;
      conceptId: string;
      subBab: string;
      data: LiveCodingChallenge;
    };

// Fisher-Yates unbiased shuffle
function shuffleArray<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

type MixRatioMode = 'mostly-choice' | 'balanced' | 'mostly-coding' | 'full-coding';

function sampleMixedQuestions(
  mcqPool: BankQuestion[],
  codingPool: LiveCodingChallenge[],
  targetCount: number = 5
): { items: QuizItemType[]; mode: MixRatioMode } {
  // If no coding questions available, fallback to pure MCQ
  if (!codingPool || codingPool.length === 0) {
    const shuffledMCQ = shuffleArray(mcqPool).slice(0, targetCount);
    const mcqItems: QuizItemType[] = shuffledMCQ.map((q) => ({
      type: 'multiple-choice',
      id: q.id,
      conceptId: q.conceptId,
      subBab: q.subBab,
      question: q.question,
      codeSnippet: q.codeSnippet,
      options: shuffleArray(
        q.options.map((opt, idx) => ({ ...opt, originalIndex: idx }))
      ),
    }));
    return { items: mcqItems, mode: 'mostly-choice' };
  }

  // Randomly select mixing ratio mode:
  // - mostly-choice: ~80% MCQ, ~20% coding
  // - balanced: ~50% MCQ, ~50% coding
  // - mostly-coding: ~25% MCQ, ~75% coding
  // - full-coding: 100% coding
  const modes: MixRatioMode[] = ['mostly-choice', 'balanced', 'mostly-coding', 'full-coding'];
  const chosenMode = modes[Math.floor(Math.random() * modes.length)];

  let codingTarget = 1;
  let mcqTarget = 4;

  if (chosenMode === 'mostly-choice') {
    codingTarget = 1;
    mcqTarget = Math.max(1, targetCount - codingTarget);
  } else if (chosenMode === 'balanced') {
    codingTarget = Math.min(codingPool.length, 2);
    mcqTarget = Math.max(1, targetCount - codingTarget);
  } else if (chosenMode === 'mostly-coding') {
    codingTarget = Math.min(codingPool.length, Math.max(2, targetCount - 2));
    mcqTarget = Math.max(1, targetCount - codingTarget);
  } else if (chosenMode === 'full-coding') {
    codingTarget = Math.min(codingPool.length, targetCount);
    mcqTarget = 0;
  }

  const selectedCoding = shuffleArray(codingPool).slice(0, codingTarget);
  const selectedMCQ = shuffleArray(mcqPool).slice(0, mcqTarget);

  const mixed: QuizItemType[] = [];

  selectedMCQ.forEach((q) => {
    mixed.push({
      type: 'multiple-choice',
      id: q.id,
      conceptId: q.conceptId,
      subBab: q.subBab,
      question: q.question,
      codeSnippet: q.codeSnippet,
      options: shuffleArray(
        q.options.map((opt, idx) => ({ ...opt, originalIndex: idx }))
      ),
    });
  });

  selectedCoding.forEach((c) => {
    mixed.push({
      type: 'live-coding',
      id: c.id,
      conceptId: c.conceptId,
      subBab: c.subBab,
      data: c,
    });
  });

  return {
    items: shuffleArray(mixed),
    mode: chosenMode,
  };
}

export const ChapterQuiz: React.FC<ChapterQuizProps> = ({
  chapterId,
  title = 'Kuis Evaluasi Bab',
  passingScore = 80,
  questionsPerAttempt = 5,
  nextChapterUrl,
  nextChapterTitle,
}) => {
  const compId = useId();
  const [activeItems, setActiveItems] = useState<QuizItemType[]>([]);
  const [mixMode, setMixMode] = useState<MixRatioMode>('balanced');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [verifiedCoding, setVerifiedCoding] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(1);
  const [awardFeedback, setAwardFeedback] = useState<string | null>(null);
  const [isPreviouslyMastered, setIsPreviouslyMastered] = useState(false);

  // Anti-cheat proctoring hook
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
    quizActive: !submitted && activeItems.length > 0,
  });

  // Find chapter data
  const chapterData = PYTHON_CHAPTERS.find((c) => c.chapterId === chapterId);
  const rawPool = chapterData ? chapterData.questions : [];
  const codingPool = chapterData?.codingChallenges || [];

  // Determine if already mastered
  useEffect(() => {
    const mastered = isExerciseCompleted(`quiz_${chapterId}`);
    setIsPreviouslyMastered(mastered);

    const handleUserUpdate = () => {
      setIsPreviouslyMastered(isExerciseCompleted(`quiz_${chapterId}`));
    };
    window.addEventListener('belajar:user-updated', handleUserUpdate);
    return () => {
      window.removeEventListener('belajar:user-updated', handleUserUpdate);
    };
  }, [chapterId]);

  // Initial random question selection with dynamic mixed ratio
  useEffect(() => {
    if (rawPool.length > 0) {
      const { items, mode } = sampleMixedQuestions(
        rawPool,
        codingPool,
        questionsPerAttempt
      );
      setActiveItems(items);
      setMixMode(mode);
    }
  }, [chapterId, questionsPerAttempt]);

  const handleSelect = (itemIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [itemIdx]: optIdx }));
  };

  const handleCodingVerification = useCallback((challengeId: string, passed: boolean) => {
    setVerifiedCoding((prev) => ({ ...prev, [challengeId]: passed }));
  }, []);

  const handleSubmit = () => {
    // Check multiple-choice completion
    const mcqIndices = activeItems
      .map((item, idx) => (item.type === 'multiple-choice' ? idx : null))
      .filter((idx): idx is number => idx !== null);

    const allMcqAnswered = mcqIndices.every((idx) => selectedAnswers[idx] !== undefined);
    if (!allMcqAnswered) return;

    let correct = 0;

    activeItems.forEach((item, itemIdx) => {
      if (item.type === 'multiple-choice') {
        const chosenOptIdx = selectedAnswers[itemIdx];
        const isCorrect = item.options[chosenOptIdx]?.isCorrect ?? false;
        if (isCorrect) correct += 1;
        recordConceptObservation(item.conceptId, isCorrect);
      } else {
        const isPassed = verifiedCoding[item.id] ?? false;
        if (isPassed) correct += 1;
        recordConceptObservation(item.conceptId, isPassed);
      }
    });

    const calculatedScore = Math.round((correct / activeItems.length) * 100);
    setScore(calculatedScore);
    setCorrectCount(correct);
    setSubmitted(true);

    if (calculatedScore >= passingScore) {
      const result = awardChapterQuizCompletion(`quiz_${chapterId}`, 50, 20, 1);
      setAwardFeedback(result.message);
      setIsPreviouslyMastered(true);

      // Cognitive BKT test-out application
      if (chapterData && chapterData.questions.length > 0) {
        const uniqueConcepts = Array.from(
          new Set([
            ...chapterData.questions.map((q) => q.conceptId),
            ...(chapterData.codingChallenges || []).map((c) => c.conceptId),
          ])
        );
        applyTestOutMastery(uniqueConcepts);
      }
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setVerifiedCoding({});
    setSubmitted(false);
    setScore(0);
    setCorrectCount(0);
    setAwardFeedback(null);
    setAttemptCount((prev) => prev + 1);
    resetProctoring();

    // Reroll fresh questions & dynamically pick a new mix ratio!
    if (rawPool.length > 0) {
      const { items, mode } = sampleMixedQuestions(
        rawPool,
        codingPool,
        questionsPerAttempt
      );
      setActiveItems(items);
      setMixMode(mode);
    }

    if (typeof window !== 'undefined') {
      const quizElement = document.getElementById(`kuis-${chapterId}`);
      if (quizElement) {
        quizElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const mcqItems = activeItems.filter((i) => i.type === 'multiple-choice');
  const codingItems = activeItems.filter((i) => i.type === 'live-coding');
  const allMcqAnswered = mcqItems.every((_, idx) => {
    // Find the original item index in activeItems
    const originalIdx = activeItems.findIndex(
      (item) => item.type === 'multiple-choice' && item.id === mcqItems[idx].id
    );
    return selectedAnswers[originalIdx] !== undefined;
  });

  const isPassed = score >= passingScore;
  const incorrectCount = activeItems.length - correctCount;

  const modeBadgeLabel = {
    'mostly-choice': 'Dominan Tanya-Jawab (Pilihan Ganda)',
    balanced: 'Kombinasi Seimbang (Tanya-Jawab + Live Coding)',
    'mostly-coding': 'Dominan Live Coding',
    'full-coding': 'Tantangan Full Live Coding ⚡',
  }[mixMode];

  if (activeItems.length === 0) {
    return (
      <div
        id={`kuis-${chapterId}`}
        className="my-10 p-8 rounded-2xl border-2 border-[var(--border-default)] bg-[var(--bg-surface)] text-center space-y-3 shadow-xs"
      >
        <div className="w-8 h-8 mx-auto rounded-full bg-[var(--accent-terracotta)]/20 text-[var(--accent-terracotta)] flex items-center justify-center animate-pulse">
          <SparklesIcon className="w-4 h-4" />
        </div>
        <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
          {title}
        </h3>
        <p className="text-xs font-mono text-[var(--text-muted)]">
          Menyiapkan kuis campuran (Tanya-Jawab & Live Coding Pyodide)...
        </p>
      </div>
    );
  }

  return (
    <div
      id={`kuis-${chapterId}`}
      onCopy={handleCopyProtection}
      onCut={handleCopyProtection}
      onContextMenu={handleContextMenuProtection}
      className="my-10 rounded-2xl border-2 border-[var(--border-focused)] bg-[var(--bg-surface)] overflow-hidden shadow-lg select-none relative"
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {/* Proctoring Warning Toast / Alert */}
      {recentAlert && (
        <div className="sticky top-2 z-50 mx-4 my-2 p-3.5 rounded-xl bg-amber-500/95 text-slate-950 font-sans text-xs font-semibold shadow-xl border border-amber-600 flex items-center justify-between gap-3 animate-bounce">
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

      {/* Top Banner & Anti-Cheat Controls */}
      <div className="px-5 py-4 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[var(--accent-terracotta)] animate-pulse"></span>
          <div>
            <h3 className="font-display font-bold text-sm sm:text-base text-[var(--text-primary)]">
              {title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs font-mono text-[var(--text-secondary)]">
              <span>Percobaan #{attemptCount}</span>
              <span>•</span>
              <span className="text-[var(--accent-teal)] font-medium">
                {modeBadgeLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Proctoring status pills & Fullscreen Toggle */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {isPreviouslyMastered && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <CheckIcon className="w-3.5 h-3.5" /> Bab Terverifikasi Lulus
            </span>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`px-2.5 py-1 rounded-lg border font-mono text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              isFullscreen
                ? 'bg-[var(--accent-teal)] text-white border-[var(--accent-teal)]'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-focused)] hover:text-[var(--text-primary)]'
            }`}
            title="Aktifkan mode layar penuh untuk kenyamanan fokus & integritas evaluasi"
          >
            <span>{isFullscreen ? '⤓ Keluar Layar Penuh' : '⤢ Mode Layar Penuh'}</span>
          </button>

          {/* Violations Counter */}
          <span
            className={`px-2.5 py-1 rounded-lg border font-mono text-xs ${
              totalViolations > 0
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold'
                : 'bg-[var(--bg-canvas)] text-[var(--text-muted)] border-[var(--border-default)]'
            }`}
            title="Pelanggaran perpindahan tab, kehilangan fokus, atau usaha copy"
          >
            {totalViolations > 0 ? `⚠️ Peringatan: ${totalViolations}` : 'Integritas: Terjaga'}
          </span>

          <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] text-[var(--text-secondary)] border border-[var(--border-default)]">
            Standar: ≥{passingScore}%
          </span>
        </div>
      </div>

      {/* Quiz Body */}
      <div className="p-5 sm:p-7 space-y-8">
        {/* Anti-Cheat & Mixed Notice */}
        {!submitted && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-[var(--text-secondary)] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-400">
              <span>🛡️ Aturan Pengawasan & Mode Acak:</span>
            </div>
            <p className="leading-relaxed font-sans">
              Soal diacak dinamis antara <strong>Tanya-Jawab Konseptual</strong> dan <strong>Live Coding Langsung (Pyodide WASM)</strong>. Teks soal diproteksi dari penyalinan. Dilarang berpindah tab atau membagi layar multitasking selama kuis berlangsung.
            </p>
            {splitScreenDetected && (
              <div className="p-2 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono text-[11px] font-bold">
                ⚠️ PERINGATAN: Layar terdeteksi sempit atau terbelah (Split-Screen / Multitasking). Maksimalkan jendela browser!
              </div>
            )}
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-8">
          {activeItems.map((item, qIdx) => {
            if (item.type === 'live-coding') {
              const isVerified = verifiedCoding[item.id] ?? false;
              return (
                <div
                  key={`${compId}-coding-${item.id}-${qIdx}`}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-[var(--accent-terracotta)]">
                    <span className="w-6 h-6 rounded-lg bg-[var(--accent-terracotta)] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      {qIdx + 1}
                    </span>
                    <span>Tantangan Live Coding (#{qIdx + 1})</span>
                  </div>

                  <LiveCodingExercise
                    challenge={item.data}
                    onVerificationChange={handleCodingVerification}
                    isCompleted={isVerified}
                    disabled={submitted}
                  />
                </div>
              );
            }

            // Multiple Choice Question
            const chosenOpt = selectedAnswers[qIdx];
            return (
              <div
                key={`${compId}-mcq-${item.id}-${qIdx}`}
                className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-canvas)]/50 space-y-4"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[var(--accent-terracotta)] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      {qIdx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-mono text-[var(--accent-terracotta)] font-semibold mb-1">
                        Sub-bab {item.subBab} • Tanya-Jawab Konseptual
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-[var(--text-primary)] font-display leading-snug">
                        {item.question}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Code Snippet */}
                {item.codeSnippet && (
                  <pre className="p-3.5 rounded-lg bg-[#18181b] text-[#f4f4f5] font-mono text-xs overflow-x-auto border border-[#27272a] leading-relaxed">
                    <code>{item.codeSnippet}</code>
                  </pre>
                )}

                {/* Options */}
                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {item.options.map((opt, optIdx) => {
                    const isSelected = chosenOpt === optIdx;
                    let styleClass =
                      'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--border-focused)] hover:bg-[var(--bg-subtle)]';

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
                        key={`${compId}-opt-${optIdx}`}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelect(qIdx, optIdx)}
                        disabled={submitted}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer flex items-start gap-3 ${styleClass}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-current font-mono flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <div className="flex-1 font-sans">
                          <div className="leading-snug font-medium text-current">{opt.text}</div>
                          {submitted && (
                            <div className="mt-2 text-xs font-sans text-[var(--text-secondary)] font-normal leading-relaxed pt-2 border-t border-current/15">
                              {opt.isCorrect ? (
                                <span className="font-semibold text-[var(--state-success)]">
                                  ✓ Penjelasan Tepat:
                                </span>
                              ) : isSelected ? (
                                <span className="font-semibold text-[var(--state-danger)]">
                                  ✗ Mengapa ini keliru:
                                </span>
                              ) : (
                                <span className="text-[var(--text-muted)]">Keterangan:</span>
                              )}{' '}
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

        {/* Footer Evaluation & Submission */}
        <div className="pt-6 border-t border-[var(--border-default)] space-y-4">
          {!submitted ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-xs font-mono text-[var(--text-secondary)]">
                <div>
                  Soal Pilihan Ganda Terjawab:{' '}
                  <strong className="text-[var(--text-primary)]">
                    {Object.keys(selectedAnswers).length}
                  </strong>{' '}
                  / {mcqItems.length}
                </div>
                {codingItems.length > 0 && (
                  <div>
                    Tantangan Coding Terverifikasi:{' '}
                    <strong className="text-[var(--text-primary)]">
                      {Object.values(verifiedCoding).filter(Boolean).length}
                    </strong>{' '}
                    / {codingItems.length}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allMcqAnswered}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-mono font-bold bg-[var(--accent-terracotta)] text-white hover:opacity-95 active:scale-98 disabled:opacity-40 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <SparklesIcon className="w-4 h-4" /> Kirim Jawaban & Evaluasi Bab
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Outcome Banner */}
              <div
                className={`p-5 rounded-2xl border ${
                  isPassed
                    ? 'border-[var(--state-success)]/40 bg-[var(--state-success)]/10 text-[var(--text-primary)]'
                    : 'border-[var(--state-danger)]/40 bg-[var(--state-danger)]/10 text-[var(--text-primary)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                          isPassed
                            ? 'bg-[var(--state-success)] text-white'
                            : 'bg-[var(--state-danger)] text-white'
                        }`}
                      >
                        {isPassed ? '★ LULUS EVALUASI BAB' : 'BELUM MEMENUHI SYARAT KELULUSAN'}
                      </span>
                      <span className="text-sm font-mono font-bold">
                        Skor: {score}% ({correctCount}/{activeItems.length} Benar)
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed pt-1 font-sans">
                      {isPassed
                        ? `Luar biasa! Kamu berhasil menuntaskan evaluasi dengan ${correctCount} soal/tantangan tepat dari ${activeItems.length} total soal. Konsep di Bab ini telah dikuasai!`
                        : `Kamu belum memenuhi ambang batas kelulusan (salah ${incorrectCount} soal dari ${activeItems.length} soal, standar ≥${passingScore}%). Silakan kocok ulang dan ulangi kuis untuk memantapkan pemahaman.`}
                    </p>

                    {totalViolations > 0 && (
                      <div className="mt-2 text-xs font-mono text-amber-700 dark:text-amber-400">
                        Catatan Pengawasan: Terdeteksi {totalViolations} pelanggaran integritas (pindah tab/fokus: {tabSwitches + blurCount}, fullscreen exit: {fullscreenExits}, copy attempt: {copyAttempts}).
                      </div>
                    )}
                  </div>

                  {awardFeedback && (
                    <div className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--state-success)] text-xs font-mono font-semibold text-[var(--state-success)] shrink-0 shadow-xs">
                      {awardFeedback}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-medium border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-focused)] transition-colors cursor-pointer flex items-center gap-2"
                >
                  ↻ Ulangi Kuis (Kocok Ulang Soal & Tipe Acak)
                </button>

                {isPassed && nextChapterUrl && (
                  <a
                    href={nextChapterUrl}
                    className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold bg-[var(--accent-terracotta)] text-white hover:opacity-95 active:scale-98 transition-all flex items-center gap-2 shadow-xs text-decoration-none"
                  >
                    <span>Lanjut ke {nextChapterTitle || 'Bab Berikutnya'}</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
