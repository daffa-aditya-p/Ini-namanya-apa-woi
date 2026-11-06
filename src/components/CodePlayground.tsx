import React, { useState, useCallback } from 'react';
import { JavaScriptRunner } from '../lib/runner/javascript';
import { PythonRunner } from '../lib/runner/python';
import type { ExecutionResult } from '../lib/runner/types';

interface CodePlaygroundProps {
  initialCode: string;
  language: 'javascript' | 'python';
  title?: string;
  expectedOutput?: string;
}

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialCode,
  language,
  title,
  expectedOutput,
}) => {
  const [code, setCode] = useState(initialCode.trim());
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<ExecutionResult | null>(null);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    try {
      if (language === 'javascript') {
        const runner = new JavaScriptRunner();
        const res = await runner.run(code);
        setOutput(res);
      } else {
        const runner = new PythonRunner();
        const res = await runner.run(code);
        setOutput(res);
      }
    } catch (err) {
      setOutput({
        success: false,
        stdout: [],
        stderr: [String(err)],
        error: String(err),
        executionTimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  }, [code, language]);

  const handleReset = useCallback(() => {
    setCode(initialCode.trim());
    setOutput(null);
  }, [initialCode]);

  return (
    <div className="my-6 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-subtle)] border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-terracotta)]"></span>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {title || `Editor ${language === 'javascript' ? 'JavaScript (ES2024)' : 'Python 3.12 (Pyodide)'}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1 text-xs font-mono rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-focused)] transition-colors cursor-pointer"
            aria-label="Kembalikan kode ke awal"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="px-3 py-1 text-xs font-mono font-semibold rounded bg-[var(--accent-terracotta)] text-white hover:opacity-90 active:scale-98 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-2xs"
            aria-label="Jalankan kode"
          >
            {isRunning ? (
              <>
                <span className="w-2 h-2 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>Mengeksekusi...</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Jalankan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Textarea */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full font-mono text-sm p-4 bg-[var(--bg-canvas)] text-[var(--text-primary)] border-none outline-none resize-y min-h-[120px] leading-relaxed focus:ring-1 focus:ring-[var(--border-focused)]"
          aria-label="Editor Kode"
        />
      </div>

      {/* Output Console / Terminal */}
      {output && (
        <div className="border-t border-[var(--border-default)] bg-[var(--bg-canvas)] p-4 text-xs font-mono">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-[var(--border-default)] text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5 font-semibold">
              <span
                className={`w-2 h-2 rounded-full ${output.success ? 'bg-[var(--state-success)]' : 'bg-[var(--state-danger)]'}`}
              ></span>
              {output.success ? 'Eksekusi Berhasil' : 'Galat (Error)'}
            </span>
            <span>{Math.round(output.executionTimeMs)} ms</span>
          </div>

          {output.stdout.length > 0 && (
            <div className="space-y-1 mb-2">
              {output.stdout.map((line, idx) => (
                <div key={idx} className="text-[var(--text-primary)] whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>
          )}

          {output.stderr.length > 0 && (
            <div className="space-y-1 text-[var(--state-danger)] whitespace-pre-wrap">
              {output.stderr.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          )}

          {expectedOutput && output.stdout.join('\n').trim() === expectedOutput.trim() && (
            <div className="mt-2 pt-2 border-t border-[var(--border-default)] text-[var(--state-success)] font-semibold flex items-center gap-1.5">
              <span>✓</span>
              <span>Output cocok dengan ekspektasi modul latihan!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
