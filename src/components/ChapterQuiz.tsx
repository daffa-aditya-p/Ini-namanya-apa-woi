import React, { useState, useEffect, useId } from 'react';
import { recordConceptObservation, applyTestOutMastery } from '../lib/bkt';
import {
  awardChapterQuizCompletion,
  isExerciseCompleted,
} from '../lib/userStore';
import { PYTHON_CHAPTERS, type BankQuestion } from '../lib/pythonQuizBank';
import { SparklesIcon, CheckIcon, ArrowRightIcon } from './Icons';

export interface ChapterQuizProps {
  chapterId: string;
  title?: string;
  passingScore?: number; // default 80%
  questionsPerAttempt?: number; // default 5
  nextChapterUrl?: string;
  nextChapterTitle?: string;
}

interface ActiveQuestion {
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

// Fisher-Yates unbiased shuffle
function shuffleArray<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function sampleAndShuffleQuestions(
  pool: BankQuestion[],
  count: number
): ActiveQuestion[] {
  const shuffledPool = shuffleArray(pool);
  const selected = shuffledPool.slice(0, Math.min(count, pool.length));

  return selected.map((q) => {
    const optionsWithMeta = q.options.map((opt, idx) => ({
      ...opt,
      originalIndex: idx,
    }));
    return {
      ...q,
      options: shuffleArray(optionsWithMeta),
    };
  });
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
  const [activeQuestions, setActiveQuestions] = useState<ActiveQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(1);
  const [awardFeedback, setAwardFeedback] = useState<string | null>(null);
  const [isPreviouslyMastered, setIsPreviouslyMastered] = useState(false);

  // Find bank questions for this chapter
  const chapterData = PYTHON_CHAPTERS.find((c) => c.chapterId === chapterId);
  const rawPool = chapterData ? chapterData.questions : [];

  // Determine if already completed
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

  // Initial random question selection
  useEffect(() => {
    if (rawPool.length > 0) {
      setActiveQuestions(sampleAndShuffleQuestions(rawPool, questionsPerAttempt));
    }
  }, [chapterId]);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length < activeQuestions.length) return;

    let correct = 0;
    activeQuestions.forEach((q, qIdx) => {
      const chosenOptIdx = selectedAnswers[qIdx];
      const isCorrect = q.options[chosenOptIdx]?.isCorrect ?? false;
      if (isCorrect) {
        correct += 1;
      }
      // Record BKT cognitive mastery observation
      recordConceptObservation(q.conceptId, isCorrect);
    });

    const calculatedScore = Math.round((correct / activeQuestions.length) * 100);
    setScore(calculatedScore);
    setCorrectCount(correct);
    setSubmitted(true);

    // Strict passing rule: must be >= passingScore
    if (calculatedScore >= passingScore) {
      const result = awardChapterQuizCompletion(`quiz_${chapterId}`, 50, 20, 1);
      setAwardFeedback(result.message);
      setIsPreviouslyMastered(true);

      // Cognitive BKT: Mark all concepts of this Bab as mastered (P(L) >= 0.90)
      if (chapterData && chapterData.questions.length > 0) {
        const uniqueConcepts = Array.from(new Set(chapterData.questions.map((q) => q.conceptId)));
        applyTestOutMastery(uniqueConcepts);
      }
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setCorrectCount(0);
    setAwardFeedback(null);
    setAttemptCount((prev) => prev + 1);
    // Shuffle a FRESH new subset of questions & scramble option order
    if (rawPool.length > 0) {
      setActiveQuestions(sampleAndShuffleQuestions(rawPool, questionsPerAttempt));
    }
    // Smooth scroll back to top of quiz
    if (typeof window !== 'undefined') {
      const quizElement = document.getElementById(`kuis-${chapterId}`);
      if (quizElement) {
        quizElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const allAnswered =
    activeQuestions.length > 0 &&
    activeQuestions.every((_, idx) => selectedAnswers[idx] !== undefined);
  const isPassed = score >= passingScore;
  const incorrectCount = activeQuestions.length - correctCount;

  if (activeQuestions.length === 0) {
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
          Menyiapkan bank soal evaluasi bab & pengacakan acak dinamis...
        </p>
      </div>
    );
  }

  return (
    <div
      id={`kuis-${chapterId}`}
      className="my-10 rounded-2xl border-2 border-[var(--border-focused)] bg-[var(--bg-surface)] overflow-hidden shadow-md"
    >
      {/* Top Banner */}
      <div className="px-5 py-4 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[var(--accent-terracotta)] animate-pulse"></span>
          <div>
            <h3 className="font-display font-bold text-sm sm:text-base text-[var(--text-primary)]">
              {title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-mono">
              Evaluasi Mandiri Bab • Soal Diacak Dinamis • Percobaan #{attemptCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPreviouslyMastered && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[var(--state-success)]/15 text-[var(--state-success)] border border-[var(--state-success)]/30">
              <CheckIcon className="w-3.5 h-3.5" /> Bab Terverifikasi Lulus
            </span>
          )}
          <span className="px-2.5 py-1 rounded text-xs font-mono bg-[var(--bg-canvas)] text-[var(--text-secondary)] border border-[var(--border-default)]">
            Standar Lulus: ≥{passingScore}% (Maksimal 1 Salah)
          </span>
        </div>
      </div>

      {/* Quiz Body */}
      <div className="p-5 sm:p-7 space-y-8">
        {/* Instruction Note */}
        {!submitted && (
          <div className="p-3.5 rounded-xl bg-[var(--accent-terracotta)]/10 border border-[var(--accent-terracotta)]/25 text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
            <span className="text-base leading-none">⚠️</span>
            <p className="leading-relaxed">
              <strong>Aturan Evaluasi Ketat:</strong> Soal di bawah dipilih secara acak dari seluruh materi Sub-bab yang telah kamu pelajari di Bab ini. Kamu tidak boleh banyak salah (maksimal 1 kesalahan). Jika tidak memenuhi ambang {passingScore}%, kamu wajib mengulang dengan kumpulan soal baru yang diacak kembali.
            </p>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-8">
          {activeQuestions.map((q, qIdx) => {
            const chosenOpt = selectedAnswers[qIdx];
            return (
              <div
                key={`${compId}-q-${q.id}-${qIdx}`}
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
                        Sub-bab {q.subBab}
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-[var(--text-primary)] font-display leading-snug">
                        {q.question}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Code Snippet */}
                {q.codeSnippet && (
                  <pre className="p-3.5 rounded-lg bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs overflow-x-auto border border-neutral-700 leading-relaxed">
                    <code>{q.codeSnippet}</code>
                  </pre>
                )}

                {/* Options */}
                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {q.options.map((opt, optIdx) => {
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

        {/* Footer Evaluation & Results */}
        <div className="pt-6 border-t border-[var(--border-default)] space-y-4">
          {!submitted ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                Terjawab:{' '}
                <strong className="text-[var(--text-primary)]">
                  {Object.keys(selectedAnswers).length}
                </strong>{' '}
                dari {activeQuestions.length} soal
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allAnswered}
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
                        Skor: {score}% ({correctCount}/{activeQuestions.length} Benar)
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed pt-1 font-sans">
                      {isPassed
                        ? `Luar biasa! Kamu berhasil menaklukkan kuis evaluasi dengan ${correctCount} jawaban benar dari ${activeQuestions.length} soal. Konsep di Bab ini telah dikuasai!`
                        : `Kamu menjawab salah ${incorrectCount} soal dari ${activeQuestions.length} soal. Batas toleransi kesalahan adalah maksimal 1 salah (≥${passingScore}%). Kamu wajib mengulang kuis untuk memantapkan konsep.`}
                    </p>
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
                  ↻ Ulangi Kuis (Kocok Ulang Soal Acak)
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
