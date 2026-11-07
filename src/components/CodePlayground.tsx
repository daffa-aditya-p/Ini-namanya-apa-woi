import React, { useState, useCallback, useEffect, useRef } from 'react';
import { JavaScriptRunner } from '../lib/runner/javascript';
import { PythonRunner } from '../lib/runner/python';
import type { ExecutionResult } from '../lib/runner/types';
import {
  awardExerciseCompletion,
  isExerciseCompleted,
  type AwardResult,
} from '../lib/userStore';

interface CodePlaygroundProps {
  initialCode: string;
  language: 'javascript' | 'python';
  title?: string;
  expectedOutput?: string;
  awardXp?: boolean;
}

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialCode = '',
  language,
  title,
  expectedOutput,
  awardXp = true,
}) => {
  const safeInitialCode = initialCode || '';
  const [code, setCode] = useState(safeInitialCode.trim());
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [awardResult, setAwardResult] = useState<AwardResult | null>(null);
  const [isCompletedInitially, setIsCompletedInitially] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<unknown>(null);
  const [cmReady, setCmReady] = useState(false);

  const exerciseKey = title || `exercise_${language}_${safeInitialCode.slice(0, 30)}`;

  useEffect(() => {
    const updateCompletionStatus = () => {
      setIsCompletedInitially(isExerciseCompleted(exerciseKey));
    };
    updateCompletionStatus();

    window.addEventListener('belajar:user-updated', updateCompletionStatus);
    window.addEventListener('storage', updateCompletionStatus);

    return () => {
      window.removeEventListener('belajar:user-updated', updateCompletionStatus);
      window.removeEventListener('storage', updateCompletionStatus);
    };
  }, [exerciseKey]);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    try {
      let res: ExecutionResult;
      if (language === 'javascript') {
        const runner = new JavaScriptRunner();
        res = await runner.run(code);
      } else {
        const runner = new PythonRunner();
        res = await runner.run(code);
      }
      setOutput(res);

      if (res.success && expectedOutput) {
        const normalize = (str: string) =>
          str
            .replace(/\\n/g, '\n')
            .replace(/\r\n/g, '\n')
            .split('\n')
            .map((line) => line.trimEnd())
            .join('\n')
            .trim();

        const normActual = normalize(res.stdout.join('\n'));
        const normExpected = normalize(expectedOutput);

        if (normActual === normExpected) {
          if (awardXp) {
            const award = awardExerciseCompletion(exerciseKey, 25, 1);
            setAwardResult(award);
            if (award.awarded) {
              setIsCompletedInitially(true);
            }
          } else {
            setAwardResult(null);
          }
        } else {
          setAwardResult(null);
        }
      } else {
        setAwardResult(null);
      }
    } catch (err) {
      setOutput({
        success: false,
        stdout: [],
        stderr: [String(err)],
        error: String(err),
        executionTimeMs: 0,
      });
      setAwardResult(null);
    } finally {
      setIsRunning(false);
    }
  }, [code, language, expectedOutput, exerciseKey, awardXp]);

  // Keyboard shortcut Ctrl/Cmd + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun]);

  // Mount CodeMirror 6 in browser
  useEffect(() => {
    let isMounted = true;
    async function setupEditor() {
      if (!editorContainerRef.current) return;
      try {
        const { EditorView, lineNumbers } = await import('@codemirror/view');
        const { EditorState } = await import('@codemirror/state');
        const langExtension =
          language === 'javascript'
            ? (await import('@codemirror/lang-javascript')).javascript()
            : (await import('@codemirror/lang-python')).python();

        if (!isMounted || !editorContainerRef.current) return;

        // Custom Warm Paper theme
        const theme = EditorView.theme({
          '&': {
            fontSize: '14px',
            fontFamily: 'var(--font-mono, monospace)',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
          },
          '.cm-content': {
            padding: '12px 14px',
            caretColor: 'var(--accent-terracotta)',
          },
          '.cm-line': {
            lineHeight: '1.6',
          },
          '.cm-gutters': {
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-muted)',
            borderRight: '1px solid var(--border-default)',
            paddingRight: '6px',
          },
          '&.cm-focused': {
            outline: 'none',
          },
        });

        const state = EditorState.create({
          doc: safeInitialCode.trim(),
          extensions: [
            lineNumbers(),
            langExtension,
            theme,
            EditorView.contentAttributes.of({
              'aria-label': title || `Editor ${language === 'javascript' ? 'JavaScript' : 'Python'}`,
            }),
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                setCode(update.state.doc.toString());
              }
            }),
          ],
        });

        const view = new EditorView({
          state,
          parent: editorContainerRef.current,
        });

        editorViewRef.current = view;
        setCmReady(true);
      } catch {
        setCmReady(false);
      }
    }

    setupEditor();

    return () => {
      isMounted = false;
      if (editorViewRef.current) {
        (editorViewRef.current as { destroy: () => void }).destroy();
        editorViewRef.current = null;
      }
    };
  }, [initialCode, language]);

  const handleReset = useCallback(() => {
    setCode(safeInitialCode.trim());
    setOutput(null);
    if (editorViewRef.current) {
      const view = editorViewRef.current as {
        dispatch: (tr: { changes: { from: number; to: number; insert: string } }) => void;
        state: { doc: { length: number } };
      };
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: safeInitialCode.trim() },
      });
    }
  }, [safeInitialCode]);

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
          {isCompletedInitially && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--state-success)]/15 text-[var(--state-success)] border border-[var(--state-success)]/30">
              ✓ Latihan Selesai
            </span>
          )}
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

      {/* Code Editor: CodeMirror 6 with Textarea SSR/Fallback */}
      <div className="relative bg-[var(--bg-canvas)] min-h-[120px]">
        <div
          ref={editorContainerRef}
          className={cmReady ? 'block' : 'hidden'}
          aria-label="Editor CodeMirror 6"
        />
        {!cmReady && (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full font-mono text-sm p-4 bg-[var(--bg-canvas)] text-[var(--text-primary)] border-none outline-none resize-y min-h-[120px] leading-relaxed focus:ring-1 focus:ring-[var(--border-focused)]"
            aria-label="Editor Kode"
          />
        )}
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

          {/* Gamification & assertion feedback */}
          {expectedOutput && awardResult && (
            <div className="mt-3 p-3 rounded-lg border border-[var(--state-success)]/40 bg-[var(--state-success)]/10 text-xs">
              <div className="flex items-center gap-2 font-bold text-[var(--state-success)] font-mono">
                <span>✓ Output Valid & Sesuai Ekspektasi!</span>
                {awardResult.awarded && (
                  <span className="px-2 py-0.5 rounded-full bg-[var(--state-success)] text-white text-[10px] font-bold">
                    +{awardResult.xpEarned} XP
                  </span>
                )}
              </div>
              <p className="text-[var(--text-secondary)] mt-1 font-sans">
                {awardResult.message}{' '}
                {awardResult.awarded && awardResult.user && (
                  <>
                    Total XP: <strong className="font-mono text-[var(--text-primary)]">{awardResult.user.xp} XP</strong> • Waktu Belajar: <strong className="font-mono text-[var(--text-primary)]">{awardResult.user.hoursSpent} jam</strong>
                  </>
                )}
                {!awardResult.awarded && !awardResult.alreadyCompleted && (
                  <span className="block mt-1 font-mono text-[11px]">
                    <a href="/login" className="font-semibold text-[var(--accent-terracotta)] hover:underline">
                      Masuk
                    </a>{' '}
                    atau{' '}
                    <a href="/register" className="font-semibold text-[var(--accent-terracotta)] hover:underline">
                      Daftar Akun
                    </a>{' '}
                    untuk menyimpan progres dan mengklaim XP.
                  </span>
                )}
              </p>
            </div>
          )}

          {expectedOutput && !awardResult && output.success && (
            <div className="mt-2 pt-2 border-t border-[var(--border-default)] text-[var(--text-muted)] text-[11px] font-mono">
              Output belum sesuai dengan target ekspektasi latihan. Silakan tinjau kembali instruksi.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
