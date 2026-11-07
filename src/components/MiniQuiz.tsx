import React, { useState } from 'react';
import { recordConceptObservation } from '../lib/bkt';
import { awardExerciseCompletion } from '../lib/userStore';

export interface QuizQuestion {
  question: string;
  conceptId: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

interface MiniQuizProps {
  lessonId: string;
  title?: string;
  questions: QuizQuestion[];
}

export const MiniQuiz: React.FC<MiniQuizProps> = ({
  lessonId,
  title = 'Kuis Mini: Retrieval Practice Penguasaan Konsep',
  questions,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length < questions.length) return;

    let correctCount = 0;
    questions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      const isCorrect = q.options[chosen]?.isCorrect ?? false;
      if (isCorrect) {
        correctCount += 1;
      }
      // Record BKT observation for this concept
      recordConceptObservation(q.conceptId, isCorrect);
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);
    setSubmitted(true);

    // If score >= 80% passing standard, award XP
    if (calculatedScore >= 80) {
      awardExerciseCompletion(`quiz_${lessonId}`, 30, 1);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const allAnswered = questions.every((_, idx) => selectedAnswers[idx] !== undefined);
  const isPassed = score >= 80;

  return (
    <div className="my-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-4 py-3 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-terracotta)]"></span>
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-[var(--text-secondary)]">
            {title}
          </span>
        </div>
        <span className="text-xs font-mono text-[var(--text-muted)]">
          Standar Lulus: ≥80% • BKT Mastery Traced
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {questions.map((q, qIdx) => {
          const chosenOpt = selectedAnswers[qIdx];
          return (
            <div key={qIdx} className="space-y-3">
              <div className="text-sm font-semibold text-[var(--text-primary)] font-display flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs font-mono flex items-center justify-center shrink-0">
                  {qIdx + 1}
                </span>
                <span>{q.question}</span>
              </div>

              <div className="space-y-2 pl-7">
                {q.options.map((opt, optIdx) => {
                  const isSelected = chosenOpt === optIdx;
                  let styleClass = 'border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:border-[var(--border-focused)]';

                  if (submitted) {
                    if (opt.isCorrect) {
                      styleClass = 'border-[var(--state-success)] bg-[var(--state-success)]/10 text-[var(--state-success)] font-semibold';
                    } else if (isSelected && !opt.isCorrect) {
                      styleClass = 'border-[var(--state-danger)] bg-[var(--state-danger)]/10 text-[var(--state-danger)]';
                    } else {
                      styleClass = 'border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-muted)] opacity-60';
                    }
                  } else if (isSelected) {
                    styleClass = 'border-[var(--accent-terracotta)] bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] font-semibold';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelect(qIdx, optIdx)}
                      disabled={submitted}
                      className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm font-mono transition-all cursor-pointer flex items-start gap-2.5 ${styleClass}`}
                    >
                      <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <div className="flex-1">
                        <div>{opt.text}</div>
                        {submitted && (
                          <p className="mt-1.5 text-xs font-sans text-[var(--text-secondary)] font-normal leading-relaxed">
                            {opt.explanation}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Footer & Submission Status */}
        <div className="pt-4 border-t border-[var(--border-default)] flex flex-wrap items-center justify-between gap-4">
          {!submitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-[var(--accent-terracotta)] text-white hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
            >
              Kirim Jawaban & Evaluasi Mastery
            </button>
          ) : (
            <div className="flex flex-wrap items-center justify-between w-full gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold border ${
                    isPassed
                      ? 'bg-[var(--state-success)]/15 text-[var(--state-success)] border-[var(--state-success)]/30'
                      : 'bg-[var(--state-danger)]/15 text-[var(--state-danger)] border-[var(--state-danger)]/30'
                  }`}
                >
                  Skor: {score}% ({isPassed ? 'LULUS GERBANG MASTERY' : 'BELUM MEMENUHI STANDAR 80%'})
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  Probabilitas BKT Konsep Diperbarui
                </span>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 text-xs font-mono rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Coba Ulang Kuis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
