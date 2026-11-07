import React, { useState } from 'react';
import { CodePlayground } from './CodePlayground';

interface FadedExampleProps {
  title: string;
  language: 'javascript' | 'python';
  initialCode?: string; // Full reference solution
  solutionCode?: string; // Alternative naming
  starterCode?: string; // 80% Scaffolded starter code
  scaffoldCode?: string; // Alternative naming
  expectedOutput?: string;
  missingTaskDescription?: string;
  description?: string;
  fadedHint?: string;
  tips?: string[];
}

export const FadedExample: React.FC<FadedExampleProps> = ({
  title,
  language,
  initialCode,
  solutionCode,
  starterCode,
  scaffoldCode,
  expectedOutput,
  missingTaskDescription,
  description,
  fadedHint,
  tips,
}) => {
  const effectiveSolution = solutionCode || initialCode || '';
  const effectiveStarter = starterCode || scaffoldCode || '';
  const effectiveTask = missingTaskDescription || description || 'Lengkapi bagian kode di bawah ini:';
  const effectiveHint = fadedHint || (tips && tips.length > 0 ? tips[0] : 'Perhatikan instruksi logika di atas.');

  const [activeCodeMode, setActiveCodeMode] = useState<'starter' | 'solution'>(
    effectiveStarter ? 'starter' : 'solution'
  );
  const [versionKey, setVersionKey] = useState(0);

  const handleShowSolution = () => {
    setActiveCodeMode('solution');
    setVersionKey((prev) => prev + 1);
  };

  const handleResetToStarter = () => {
    setActiveCodeMode('starter');
    setVersionKey((prev) => prev + 1);
  };

  const codeToDisplay = activeCodeMode === 'starter' && effectiveStarter ? effectiveStarter : effectiveSolution;

  return (
    <div className="my-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
      <div className="px-4 py-3 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-[var(--text-secondary)]">
            Latihan Terpandu (Faded Example): {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-amber-700 dark:text-amber-300 font-semibold">
            {activeCodeMode === 'starter' ? '80% Kode Siap • Lengkapi Bagian Kosong' : '✓ Solusi Terbuka'}
          </span>
          {starterCode && (
            activeCodeMode === 'starter' ? (
              <button
                type="button"
                onClick={handleShowSolution}
                className="px-2 py-0.5 text-[11px] font-mono rounded border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--accent-teal)] hover:border-[var(--border-focused)] cursor-pointer"
              >
                Lihat Solusi
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetToStarter}
                className="px-2 py-0.5 text-[11px] font-mono rounded border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                ↺ Reset ke Latihan (80%)
              </button>
            )
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-4 p-3 rounded-lg bg-[var(--bg-canvas)] border border-dashed border-amber-500/30 text-xs sm:text-sm">
          <div className="font-bold font-sans text-[var(--text-primary)] mb-1">Tugasmu:</div>
          <p className="text-[var(--text-secondary)] mb-2">{effectiveTask}</p>
          <div className="text-[11px] font-mono text-[var(--accent-teal)]">
            💡 Petunjuk Kunci: {effectiveHint}
          </div>
        </div>

        <CodePlayground
          key={`${title}_${activeCodeMode}_${versionKey}`}
          language={language}
          title={title}
          initialCode={codeToDisplay}
          expectedOutput={expectedOutput}
          awardXp={true}
        />
      </div>
    </div>
  );
};
