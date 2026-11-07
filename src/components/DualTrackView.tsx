import React, { useState, useEffect } from 'react';

interface DualTrackViewProps {
  santaiTitle?: string;
  santaiParagraphs?: string[];
  santaiContent?: React.ReactNode;
  cepatTitle?: string;
  cepatParagraphs?: string[];
  cepatContent?: React.ReactNode;
}

const STORAGE_KEY = 'belajar_dual_track_mode';

export const DualTrackView: React.FC<DualTrackViewProps> = ({
  santaiTitle = 'Jalur Santai (Analogi & Langkah Mikro)',
  santaiParagraphs,
  santaiContent,
  cepatTitle = 'Jalur Cepat (Arsitektur & Spesifikasi)',
  cepatParagraphs,
  cepatContent,
}) => {
  const [mode, setMode] = useState<'santai' | 'cepat'>('santai');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'cepat' || saved === 'santai') {
        setMode(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectMode = (newMode: 'santai' | 'cepat') => {
    setMode(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // ignore
    }
  };

  return (
    <div className="my-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
      {/* Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[var(--bg-subtle)] border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Pendekatan Materi (Dual-Track):
          </span>
        </div>
        <div className="inline-flex p-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)]">
          <button
            type="button"
            onClick={() => handleSelectMode('santai')}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
              mode === 'santai'
                ? 'bg-[var(--accent-terracotta)] text-white shadow-2xs font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            🍃 {santaiTitle}
          </button>
          <button
            type="button"
            onClick={() => handleSelectMode('cepat')}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
              mode === 'cepat'
                ? 'bg-[var(--accent-teal)] text-white shadow-2xs font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            ⚡ {cepatTitle}
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 sm:p-6 text-sm sm:text-base leading-relaxed text-[var(--text-primary)]">
        {mode === 'santai' ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              Jalur Santai: Ramah Non-IT & Visual Mental Model
            </div>
            {santaiParagraphs &&
              santaiParagraphs.map((p, idx) => (
                <p key={idx} className="leading-relaxed">
                  {p}
                </p>
              ))}
            {santaiContent}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/20">
              Jalur Cepat: High-Density & ECMA/PEP Specification
            </div>
            {cepatParagraphs &&
              cepatParagraphs.map((p, idx) => (
                <p key={idx} className="leading-relaxed">
                  {p}
                </p>
              ))}
            {cepatContent}
          </div>
        )}
      </div>
    </div>
  );
};
