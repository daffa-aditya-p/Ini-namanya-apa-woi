import React, { useState } from 'react';
import { LocalAIGateway } from '../services/local';
import {
  TutorRequestSchema,
  TutorResponseSchema,
  ReviewRequestSchema,
  ReviewResponseSchema,
  type TutorResponse,
  type ReviewResponse,
} from '../services/types';
import { SparklesIcon, CheckIcon } from './Icons';

interface SocraticTutorPanelProps {
  lessonId: string;
  language: 'javascript' | 'python';
  defaultCodeSnippet?: string;
}

interface QAItem {
  question: string;
  errorMessage?: string;
  response: TutorResponse;
  timestamp: string;
}

export const SocraticTutorPanel: React.FC<SocraticTutorPanelProps> = ({
  lessonId,
  language,
  defaultCodeSnippet = '',
}) => {
  const [gateway] = useState(() => new LocalAIGateway());
  const [isOpen, setIsOpen] = useState(false);
  const [userCode, setUserCode] = useState(defaultCodeSnippet);
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  // Ladder Progression: exactly stages 1 through 4
  const [unlockedLadderStages, setUnlockedLadderStages] = useState<number>(0);
  const [ladderHints, setLadderHints] = useState<Record<number, TutorResponse>>({});

  // Separate Open-ended Q&A History
  const [qaHistory, setQaHistory] = useState<QAItem[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [reviewResult, setReviewResult] = useState<ReviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestNextHint = async () => {
    if (unlockedLadderStages >= 4) return;
    const nextStage = unlockedLadderStages + 1;
    setIsLoading(true);
    try {
      const req = TutorRequestSchema.parse({
        lessonId,
        userCode: userCode || defaultCodeSnippet,
        prompt: `Minta petunjuk bertingkat tahap ${nextStage}`,
        hintStage: nextStage,
      });

      const res = await gateway.generateSocraticHint(req);
      const validated = TutorResponseSchema.parse(res);

      setLadderHints((prev) => ({ ...prev, [nextStage]: validated }));
      setUnlockedLadderStages(nextStage);
    } catch (err) {
      console.error('Validation error on Socratic Tutor:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsLoading(true);
    try {
      const req = TutorRequestSchema.parse({
        lessonId,
        userCode: userCode || defaultCodeSnippet,
        prompt: customPrompt.trim(),
        hintStage: unlockedLadderStages > 0 ? unlockedLadderStages : 1,
        errorMessage: errorMessage.trim() || undefined,
      });

      const res = await gateway.generateSocraticHint(req);
      const validated = TutorResponseSchema.parse(res);

      setQaHistory((prev) => [
        ...prev,
        {
          question: customPrompt.trim(),
          errorMessage: errorMessage.trim() || undefined,
          response: validated,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setCustomPrompt('');
    } catch (err) {
      console.error('Validation error on Socratic Tutor Question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewCode = async () => {
    setIsLoading(true);
    try {
      const req = ReviewRequestSchema.parse({
        lessonId,
        code: userCode.trim() || defaultCodeSnippet.trim() || '// Kode latihan',
      });
      const res = await gateway.reviewCode(req);
      const validated = ReviewResponseSchema.parse(res);
      setReviewResult(validated);
    } catch (err) {
      console.error('Validation error on code review:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-[var(--accent-terracotta)]/15 text-[var(--accent-terracotta)] flex items-center justify-center">
            <SparklesIcon className="w-3.5 h-3.5" />
          </span>
          <span className="font-display text-sm font-bold text-[var(--text-primary)]">
            Socratic AI Tutor Panel
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[var(--accent-teal)]">
            Mode Transparan: {gateway.mode.toUpperCase()} (Bebas Halusinasi)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-2.5 py-1 text-xs font-mono rounded border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          {isOpen ? 'Sembunyikan Panel ▲' : 'Buka Panel Bantuan ▼'}
        </button>
      </div>

      {/* Expandable Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-5 animate-in fade-in duration-150">
          <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)] font-display block mb-1">
              Prinsip Bimbingan Socratic:
            </strong>
            Tutor AI tidak akan langsung memberikan jawaban jadi (*no spoonfeeding*), melainkan membimbingmu melalui tangga petunjuk logis (1-4) dan pertanyaan reflektif yang grounded pada silabus kurikulum resmi.
          </div>

          {/* User Code Inspector Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">
                Kode yang Dianalisis Tutor:
              </span>
              <button
                type="button"
                onClick={() => setShowCodeEditor(!showCodeEditor)}
                className="text-[11px] font-mono text-[var(--accent-teal)] hover:underline cursor-pointer"
              >
                {showCodeEditor ? 'Tutup Editor Kode ▲' : 'Sesuaikan / Paste Kodemu ▼'}
              </button>
            </div>
            {showCodeEditor && (
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                rows={4}
                placeholder="Paste kodemu di sini agar tutor dapat menganalisisnya secara kontekstual..."
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] outline-none focus:border-[var(--border-focused)]"
              />
            )}
          </div>

          {/* Hint Ladder (Tangga Petunjuk 1 -> 4) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Tangga Petunjuk 4-Tahap (Hint Ladder)
              </span>
              <span className="text-xs font-mono text-[var(--accent-terracotta)] font-semibold">
                {unlockedLadderStages === 0 ? '0 dari 4 Terbuka' : `Tahap ${unlockedLadderStages} dari 4 Terbuka`}
              </span>
            </div>

            {/* Ladder Visualizer */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((step) => {
                const isUnlocked = step <= unlockedLadderStages;
                return (
                  <div
                    key={step}
                    className={`p-2 rounded border text-center transition-all ${
                      isUnlocked
                        ? 'border-[var(--accent-terracotta)] bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] font-bold'
                        : 'border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-muted)] opacity-60'
                    }`}
                  >
                    <div className="text-[10px] font-mono">Tahap {step}</div>
                    <div className="text-[11px] font-medium hidden sm:block truncate">
                      {step === 1 && 'Konsep'}
                      {step === 2 && 'Komponen'}
                      {step === 3 && 'Logika'}
                      {step === 4 && 'Sintaks'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hint Ladder Display */}
            {unlockedLadderStages > 0 && (
              <div className="space-y-3 pt-2">
                {[1, 2, 3, 4]
                  .filter((step) => ladderHints[step] !== undefined)
                  .map((step) => {
                    const hintItem = ladderHints[step];
                    return (
                      <div
                        key={step}
                        className="p-3.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-xs sm:text-sm font-sans space-y-2 animate-in fade-in duration-150"
                      >
                        <div className="flex items-center justify-between text-xs font-mono text-[var(--accent-terracotta)] font-bold">
                          <span>{hintItem.stageTitle || `Petunjuk Tahap ${step}`}</span>
                          <span className="px-1.5 py-0.5 rounded bg-[var(--accent-terracotta)]/15 text-[var(--accent-terracotta)]">
                            Tahap {step}
                          </span>
                        </div>
                        <p className="text-[var(--text-primary)] leading-relaxed">{hintItem.hint}</p>
                        {hintItem.suggestedAction && (
                          <div className="text-xs font-mono text-[var(--accent-teal)]">
                            👉 Tindakan yang Disarankan: {hintItem.suggestedAction}
                          </div>
                        )}
                        {/* Citations */}
                        <div className="pt-2 border-t border-[var(--border-default)] text-[11px] font-mono text-[var(--text-muted)] flex flex-wrap items-center gap-1.5">
                          <span>Rujukan Resmi (Citations):</span>
                          {hintItem.citations.map((cite, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)]"
                            >
                              {cite}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Ladder Trigger Button */}
            <div className="flex flex-wrap items-center gap-2">
              {unlockedLadderStages < 4 ? (
                <button
                  type="button"
                  onClick={requestNextHint}
                  disabled={isLoading}
                  className="px-3.5 py-2 text-xs font-mono font-semibold rounded-lg bg-[var(--accent-terracotta)] text-white hover:opacity-90 active:scale-98 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Buka Petunjuk Tahap {unlockedLadderStages + 1}
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[var(--state-success)]/15 text-[var(--state-success)] border border-[var(--state-success)]/30 inline-flex items-center gap-1.5">
                  <CheckIcon className="w-3.5 h-3.5" />
                  Seluruh 4 Tahap Petunjuk Telah Terbuka
                </span>
              )}

              <button
                type="button"
                onClick={handleReviewCode}
                disabled={isLoading}
                className="px-3.5 py-2 text-xs font-mono rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-focused)] transition-colors cursor-pointer"
              >
                Minta Review Kode Singkat
              </button>
            </div>
          </div>

          {/* Review Result Display */}
          {reviewResult && (
            <div className="p-3.5 rounded-lg border border-[var(--state-success)]/30 bg-[var(--state-success)]/10 text-xs font-sans space-y-1.5 animate-in fade-in duration-150">
              <div className="font-bold font-mono text-[var(--state-success)] flex items-center gap-1.5">
                <span>✓ Hasil Review Tutor ({language.toUpperCase()})</span>
              </div>
              <p className="text-[var(--text-primary)] leading-relaxed">{reviewResult.feedback}</p>
              <div className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                <span>Sitasi:</span>
                {reviewResult.citations.join(' • ')}
              </div>
            </div>
          )}

          {/* Dedicated Q&A History Display */}
          {qaHistory.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[var(--border-default)]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                Riwayat Diskusi Reflektif ({qaHistory.length})
              </span>
              {qaHistory.map((qa, qIdx) => (
                <div
                  key={qIdx}
                  className="p-3.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-xs sm:text-sm font-sans space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--text-primary)]">Q: {qa.question}</span>
                    <span>{qa.timestamp}</span>
                  </div>
                  {qa.errorMessage && (
                    <div className="p-1.5 rounded bg-[var(--state-danger)]/10 border border-[var(--state-danger)]/20 font-mono text-[11px] text-[var(--state-danger)]">
                      Galat: {qa.errorMessage}
                    </div>
                  )}
                  <p className="text-[var(--text-primary)] leading-relaxed pl-2 border-l-2 border-[var(--accent-teal)]">
                    {qa.response.hint}
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-[var(--text-muted)]">
                    Sitasi Rujukan: {qa.response.citations.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Custom Question Form */}
          <form onSubmit={handleAskQuestion} className="space-y-2 pt-2 border-t border-[var(--border-default)]">
            <label
              htmlFor="socratic-prompt"
              className="text-xs font-mono font-bold text-[var(--text-secondary)] block"
            >
              Ajukan Pertanyaan Spesifik / Diagnosa Error:
            </label>
            <div className="flex gap-2">
              <input
                id="socratic-prompt"
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Misal: Kenapa reduce membutuhkan akumulator awal?"
                className="flex-1 px-3 py-2 text-xs font-sans rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] outline-none focus:border-[var(--border-focused)]"
              />
              <button
                type="submit"
                disabled={isLoading || !customPrompt.trim()}
                className="px-3.5 py-2 text-xs font-mono font-semibold rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shrink-0"
              >
                Tanya
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="Pesan galat runtime (opsional, misal: TypeError / Uncaught ...)"
                className="w-full px-2.5 py-1 text-[11px] font-mono rounded border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-muted)] outline-none focus:text-[var(--text-primary)]"
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
