import React, { useState, useCallback, useEffect, useRef } from 'react';
import { JavaScriptRunner } from '../lib/runner/javascript';
import { PythonRunner } from '../lib/runner/python';
import type { ExecutionResult } from '../lib/runner/types';
import {
  awardExerciseCompletion,
  isExerciseCompleted,
  type AwardResult,
} from '../lib/userStore';
import { QuickCodeSuggestions } from './QuickCodeSuggestions';

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

  // Mount CodeMirror 6 in browser with vibrant oneDark syntax highlighting
  useEffect(() => {
    let isMounted = true;
    async function setupEditor() {
      if (!editorContainerRef.current) return;
      try {
        const { EditorView, lineNumbers } = await import('@codemirror/view');
        const { EditorState } = await import('@codemirror/state');
        const { oneDark } = await import('@codemirror/theme-one-dark');
        const langExtension =
          language === 'javascript'
            ? (await import('@codemirror/lang-javascript')).javascript()
            : (await import('@codemirror/lang-python')).python();

        if (!isMounted || !editorContainerRef.current) return;

        // Vibrant sandbox theme with sleek Slate / Obsidian aesthetics
        const customTheme = EditorView.theme({
          '&': {
            fontSize: '13.5px',
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            backgroundColor: '#18181b',
            color: '#e4e4e7',
          },
          '.cm-content': {
            padding: '14px 16px',
            caretColor: '#f43f5e',
          },
          '.cm-line': {
            lineHeight: '1.65',
          },
          '.cm-gutters': {
            backgroundColor: '#131316',
            color: '#71717a',
            borderRight: '1px solid #27272a',
            paddingRight: '8px',
          },
          '.cm-activeLine': {
            backgroundColor: '#27272a40',
          },
          '.cm-activeLineGutter': {
            backgroundColor: '#27272a60',
            color: '#f4f4f5',
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
            oneDark,
            customTheme,
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
  }, [initialCode, language, safeInitialCode, title]);

  const handleInsertSnippet = useCallback((snippet: string, cursorOffset?: number) => {
    if (editorViewRef.current) {
      const view = editorViewRef.current as {
        state: { selection: { main: { from: number; to: number } } };
        dispatch: (tr: {
          changes: { from: number; to: number; insert: string };
          selection?: { anchor: number };
        }) => void;
        focus: () => void;
      };
      const { from, to } = view.state.selection.main;
      const targetAnchor = from + (cursorOffset !== undefined ? cursorOffset : snippet.length);
      view.dispatch({
        changes: { from, to, insert: snippet },
        selection: { anchor: targetAnchor },
      });
      view.focus();
    } else {
      setCode((prev) => prev + snippet);
    }
  }, []);

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
    <div className="my-6 rounded-2xl border-2 border-[#27272a] bg-[#18181b] overflow-hidden shadow-lg transition-all">
      {/* Sleek IDE Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#121215] border-b border-[#27272a] gap-2">
        <div className="flex items-center gap-3">
          {/* macOS window control dots */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-[#ef4444] opacity-80 hover:opacity-100 transition-opacity"></span>
            <span className="w-3 h-3 rounded-full bg-[#f59e0b] opacity-80 hover:opacity-100 transition-opacity"></span>
            <span className="w-3 h-3 rounded-full bg-[#10b981] opacity-80 hover:opacity-100 transition-opacity"></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-terracotta)]"></span>
            <span className="font-mono text-xs font-semibold tracking-wider text-[#d4d4d8]">
              {title || `Sandbox ${language === 'javascript' ? 'JavaScript (ES2024)' : 'Python 3.12 (Pyodide WASM)'}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCompletedInitially && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
              ✓ Latihan Selesai
            </span>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1 text-xs font-mono rounded-lg border border-[#3f3f46] bg-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#52525b] transition-colors cursor-pointer"
            aria-label="Kembalikan kode ke awal"
            title="Reset kode awal"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="px-3.5 py-1 text-xs font-mono font-bold rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-2xs"
            aria-label="Jalankan kode"
            title="Jalankan kode (Ctrl + Enter)"
          >
            {isRunning ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
                <span>Mengeksekusi...</span>
              </>
            ) : (
              <>
                <span>Jalankan</span>
                <span className="hidden sm:inline text-[10px] opacity-75">(Ctrl+⏎)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Code Suggestions Virtual Toolbar (Mobile & Desktop helper) */}
      <QuickCodeSuggestions language={language} onInsert={handleInsertSnippet} />

      {/* Code Editor: CodeMirror 6 with vibrant oneDark & Textarea Fallback */}
      <div className="relative bg-[#18181b] min-h-[140px]">
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
            className="w-full font-mono text-sm p-4 bg-[#18181b] text-[#f4f4f5] border-none outline-none resize-y min-h-[140px] leading-relaxed focus:ring-1 focus:ring-zinc-700"
            aria-label="Editor Kode"
          />
        )}
      </div>

      {/* Output Console / Terminal */}
      {output && (
        <div className="border-t border-[#27272a] bg-[#0f0f12] p-4 text-xs font-mono">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#27272a] text-[#a1a1aa]">
            <span className="flex items-center gap-2 font-semibold">
              <span
                className={`w-2 h-2 rounded-full ${output.success ? 'bg-emerald-400' : 'bg-rose-500'}`}
              ></span>
              <span className={output.success ? 'text-emerald-400' : 'text-rose-400'}>
                {output.success ? 'Eksekusi Berhasil' : 'Galat (Runtime Error)'}
              </span>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#1c1c22] border border-[#2d2d38] text-[11px] text-[#a1a1aa]">
              {Math.round(output.executionTimeMs)} ms
            </span>
          </div>

          {output.stdout.length > 0 && (
            <div className="space-y-1 mb-2">
              {output.stdout.map((line, idx) => (
                <div key={idx} className="text-[#f4f4f5] whitespace-pre-wrap leading-relaxed">
                  {line}
                </div>
              ))}
            </div>
          )}

          {output.stderr.length > 0 && (
            <div className="space-y-1 text-rose-400 whitespace-pre-wrap leading-relaxed">
              {output.stderr.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          )}

          {/* Gamification & assertion feedback */}
          {expectedOutput && awardResult && (
            <div className="mt-3 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-400 font-mono">
                <span>✓ Output Valid & Sesuai Ekspektasi!</span>
                {awardResult.awarded && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                    +{awardResult.xpEarned} XP
                  </span>
                )}
              </div>
              <p className="text-[#d4d4d8] mt-1.5 font-sans leading-relaxed">
                {awardResult.message}{' '}
                {awardResult.awarded && awardResult.user && (
                  <>
                    Total XP: <strong className="font-mono text-white">{awardResult.user.xp} XP</strong> • Waktu Belajar: <strong className="font-mono text-white">{awardResult.user.hoursSpent} jam</strong>
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
            <div className="mt-2 pt-2 border-t border-[#27272a] text-amber-400/90 text-[11px] font-mono flex items-center gap-1.5">
              <span>Output belum sesuai dengan target ekspektasi latihan. Silakan tinjau kembali instruksi.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
