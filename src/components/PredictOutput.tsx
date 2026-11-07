import React, { useState } from 'react';
import { JavaScriptRunner } from '../lib/runner/javascript';
import { PythonRunner } from '../lib/runner/python';

interface PredictOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

interface PredictOutputProps {
  title?: string;
  language: 'javascript' | 'python';
  code: string;
  options: PredictOption[];
}

export const PredictOutput: React.FC<PredictOutputProps> = ({
  title = 'Tebak Output Dahulu (Mental Model Test)',
  language,
  code,
  options,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [actualStdout, setActualStdout] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelectedIdx(idx);
  };

  const handleVerifyGuess = () => {
    if (selectedIdx === null) return;
    setRevealed(true);
  };

  const handleReset = () => {
    setSelectedIdx(null);
    setRevealed(false);
    setActualStdout(null);
  };

  const handleRunLivingCode = async () => {
    setIsRunning(true);
    try {
      let res;
      if (language === 'javascript') {
        const runner = new JavaScriptRunner();
        res = await runner.run(code);
      } else {
        const runner = new PythonRunner();
        res = await runner.run(code);
      }
      if (res.stdout.length > 0) {
        setActualStdout(res.stdout.join('\n'));
      } else if (res.stderr.length > 0) {
        setActualStdout(res.stderr.join('\n'));
      } else if (res.error) {
        setActualStdout(`Error: ${res.error}`);
      } else {
        setActualStdout('(Eksekusi selesai tanpa keluaran stdout)');
      }
    } catch (err) {
      setActualStdout(`Error: ${String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="my-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
      <div className="px-4 py-3 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-teal)]"></span>
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-[var(--text-secondary)]">
            {title}
          </span>
        </div>
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {language === 'javascript' ? 'JavaScript ES2024' : 'Python 3.12 Pyodide'}
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Code display */}
        <div className="rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] p-3.5 font-mono text-xs sm:text-sm overflow-x-auto">
          <pre className="text-[var(--text-primary)] leading-relaxed whitespace-pre">{code.trim()}</pre>
        </div>

        {/* Prediction Question */}
        <div>
          <div className="text-xs font-mono font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
            Apa yang akan dicetak oleh kode di atas?
          </div>
          <div className="space-y-2">
            {options.map((opt, idx) => {
              const isSelected = selectedIdx === idx;
              let btnClass = 'border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:border-[var(--border-focused)]';

              if (revealed) {
                if (opt.isCorrect) {
                  btnClass = 'border-[var(--state-success)] bg-[var(--state-success)]/10 text-[var(--state-success)] font-semibold';
                } else if (isSelected && !opt.isCorrect) {
                  btnClass = 'border-[var(--state-danger)] bg-[var(--state-danger)]/10 text-[var(--state-danger)]';
                } else {
                  btnClass = 'border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-muted)] opacity-60';
                }
              } else if (isSelected) {
                btnClass = 'border-[var(--accent-terracotta)] bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] font-semibold';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  disabled={revealed}
                  className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm font-mono transition-all cursor-pointer flex items-start gap-2.5 ${btnClass}`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-xs">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex-1">
                    <span className="whitespace-pre-wrap">{opt.text}</span>
                    {revealed && (
                      <p className="mt-1 text-xs font-sans text-[var(--text-secondary)]">
                        {opt.explanation}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-default)]">
          {!revealed ? (
            <button
              type="button"
              onClick={handleVerifyGuess}
              disabled={selectedIdx === null}
              className="px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-[var(--accent-terracotta)] text-white hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer"
            >
              Kunci & Periksa Tebakan
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRunLivingCode}
                disabled={isRunning}
                className="px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-[var(--accent-teal)] text-white hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isRunning ? 'Mengeksekusi...' : '▶ Jalankan Kode Sesungguhnya di Runner'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-lg text-xs font-mono border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                ↺ Uji Ulang
              </button>
            </>
          )}

          {actualStdout !== null && (
            <div className="w-full mt-3 p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] font-mono text-xs">
              <span className="text-[var(--text-muted)] font-semibold block mb-1">Keluaran Runner (Stdout):</span>
              <pre className="text-[var(--text-primary)] whitespace-pre-wrap">{actualStdout}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
