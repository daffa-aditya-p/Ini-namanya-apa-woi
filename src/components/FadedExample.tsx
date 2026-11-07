import React from 'react';
import { CodePlayground } from './CodePlayground';

interface FadedExampleProps {
  title: string;
  language: 'javascript' | 'python';
  initialCode: string;
  expectedOutput: string;
  missingTaskDescription: string;
  fadedHint: string;
}

export const FadedExample: React.FC<FadedExampleProps> = ({
  title,
  language,
  initialCode,
  expectedOutput,
  missingTaskDescription,
  fadedHint,
}) => {
  return (
    <div className="my-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
      <div className="px-4 py-3 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-[var(--text-secondary)]">
            Latihan Terpandu (Faded Example): {title}
          </span>
        </div>
        <span className="text-xs font-mono text-amber-700 dark:text-amber-300 font-semibold">
          80% Kode Siap • Lengkapi Bagian Kosong
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-4 p-3 rounded-lg bg-[var(--bg-canvas)] border border-dashed border-amber-500/30 text-xs sm:text-sm">
          <div className="font-bold font-sans text-[var(--text-primary)] mb-1">Tugasmu:</div>
          <p className="text-[var(--text-secondary)] mb-2">{missingTaskDescription}</p>
          <div className="text-[11px] font-mono text-[var(--accent-teal)]">
            💡 Petunjuk Kunci: {fadedHint}
          </div>
        </div>

        <CodePlayground
          language={language}
          title={title}
          initialCode={initialCode}
          expectedOutput={expectedOutput}
          awardXp={true}
        />
      </div>
    </div>
  );
};
