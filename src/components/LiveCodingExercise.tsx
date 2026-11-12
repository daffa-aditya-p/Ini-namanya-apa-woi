import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PythonRunner } from '../lib/runner/python';
import type { ExecutionResult } from '../lib/runner/types';
import type { LiveCodingChallenge } from '../lib/pythonQuizBank';
import { QuickCodeSuggestions } from './QuickCodeSuggestions';
import { CheckIcon, SparklesIcon } from './Icons';

interface LiveCodingExerciseProps {
  challenge: LiveCodingChallenge;
  onVerificationChange: (challengeId: string, isPassed: boolean) => void;
  isCompleted?: boolean;
  disabled?: boolean;
}

export const LiveCodingExercise: React.FC<LiveCodingExerciseProps> = ({
  challenge,
  onVerificationChange,
  isCompleted = false,
  disabled = false,
}) => {
  const [code, setCode] = useState(challenge.starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [hasPassed, setHasPassed] = useState(isCompleted);
  const [showHint, setShowHint] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<unknown>(null);
  const [cmReady, setCmReady] = useState(false);

  // Normalize string for stdout comparison
  const normalizeOutput = (str: string) =>
    str
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .trim();

  // CodeMirror initialization with oneDark vibrant theme
  useEffect(() => {
    let isMounted = true;
    async function setupEditor() {
      if (!editorContainerRef.current) return;
      try {
        const { EditorView, lineNumbers } = await import('@codemirror/view');
        const { EditorState } = await import('@codemirror/state');
        const { oneDark } = await import('@codemirror/theme-one-dark');
        const { python } = await import('@codemirror/lang-python');

        if (!isMounted || !editorContainerRef.current) return;

        const customTheme = EditorView.theme({
          '&': {
            fontSize: '13px',
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            backgroundColor: '#18181b',
            color: '#e4e4e7',
          },
          '.cm-content': {
            padding: '12px 14px',
            caretColor: '#f43f5e',
          },
          '.cm-line': {
            lineHeight: '1.6',
          },
          '.cm-gutters': {
            backgroundColor: '#131316',
            color: '#71717a',
            borderRight: '1px solid #27272a',
            paddingRight: '6px',
          },
          '.cm-activeLine': {
            backgroundColor: '#27272a40',
          },
          '&.cm-focused': {
            outline: 'none',
          },
        });

        const state = EditorState.create({
          doc: challenge.starterCode,
          extensions: [
            lineNumbers(),
            python(),
            oneDark,
            customTheme,
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
  }, [challenge.starterCode]);

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

  const handleRunAndVerify = useCallback(async () => {
    if (disabled) return;
    setIsRunning(true);
    try {
      const runner = new PythonRunner();
      const res = await runner.run(code);
      setOutput(res);

      if (res.success) {
        const actualOutput = normalizeOutput(res.stdout.join('\n'));
        const expected = normalizeOutput(challenge.expectedOutput);

        const passed = actualOutput === expected;
        setHasPassed(passed);
        onVerificationChange(challenge.id, passed);
      } else {
        setHasPassed(false);
        onVerificationChange(challenge.id, false);
      }
    } catch (err) {
      setOutput({
        success: false,
        stdout: [],
        stderr: [String(err)],
        error: String(err),
        executionTimeMs: 0,
      });
      setHasPassed(false);
      onVerificationChange(challenge.id, false);
    } finally {
      setIsRunning(false);
    }
  }, [code, challenge, disabled, onVerificationChange]);

  const handleResetCode = useCallback(() => {
    setCode(challenge.starterCode);
    setOutput(null);
    setHasPassed(false);
    onVerificationChange(challenge.id, false);
    if (editorViewRef.current) {
      const view = editorViewRef.current as {
        dispatch: (tr: { changes: { from: number; to: number; insert: string } }) => void;
        state: { doc: { length: number } };
      };
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: challenge.starterCode },
      });
    }
  }, [challenge, onVerificationChange]);

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-canvas)] overflow-hidden shadow-xs">
      {/* Challenge Header & Problem Statement (Protected against copy/paste) */}
      <div className="p-4 sm:p-5 border-b border-[var(--border-default)] bg-[var(--bg-surface)] select-none">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)] uppercase">
              Live Coding Pyodide
            </span>
            <span className="text-xs font-mono font-medium text-[var(--text-secondary)]">
              Sub-bab {challenge.subBab}
            </span>
          </div>

          <div>
            {hasPassed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--state-success)]/15 text-[var(--state-success)] border border-[var(--state-success)]/30">
                <CheckIcon className="w-3.5 h-3.5" /> Terverifikasi
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-subtle)] border border-[var(--border-default)]">
                Belum Terverifikasi
              </span>
            )}
          </div>
        </div>

        <h4 className="text-sm sm:text-base font-bold font-display text-[var(--text-primary)] mb-1">
          {challenge.title}
        </h4>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans select-none">
          {challenge.question}
        </p>

        {/* Expected Output Target Box */}
        <div className="mt-3 p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Target Output:</span>
            <code className="px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold border border-[var(--border-default)]">
              {challenge.expectedOutput}
            </code>
          </div>
          {challenge.hint && (
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline cursor-pointer"
            >
              {showHint ? 'Tutup Petunjuk' : 'Petunjuk'}
            </button>
          )}
        </div>

        {showHint && challenge.hint && (
          <div className="mt-2 p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs text-[var(--text-secondary)] font-sans">
            <strong>Petunjuk:</strong> {challenge.hint}
          </div>
        )}
      </div>

      {/* Quick Mobile Snippets Helper Bar */}
      <QuickCodeSuggestions language="python" onInsert={handleInsertSnippet} />

      {/* Embedded CodeMirror Editor */}
      <div className="relative bg-[#18181b] min-h-[130px]">
        <div
          ref={editorContainerRef}
          className={cmReady ? 'block' : 'hidden'}
          aria-label="Editor Live Coding"
        />
        {!cmReady && (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={disabled}
            spellCheck={false}
            className="w-full font-mono text-xs p-3.5 bg-[#18181b] text-[#f4f4f5] border-none outline-none resize-y min-h-[130px] leading-relaxed"
          />
        )}
      </div>

      {/* Editor Controls & Execution Button */}
      <div className="px-4 py-2.5 bg-[#121215] border-t border-[#27272a] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <button
          type="button"
          onClick={handleResetCode}
          disabled={disabled || isRunning}
          className="px-2.5 py-1 rounded border border-[#3f3f46] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
        >
          Reset Kode
        </button>

        <button
          type="button"
          onClick={handleRunAndVerify}
          disabled={disabled || isRunning}
          className={`px-4 py-1.5 rounded-lg font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
            hasPassed
              ? 'bg-emerald-600 hover:bg-emerald-500'
              : 'bg-[var(--accent-terracotta)] hover:opacity-90 active:scale-95'
          } disabled:opacity-50`}
        >
          {isRunning ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              <span>Memverifikasi di Pyodide...</span>
            </>
          ) : hasPassed ? (
            <>
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Terverifikasi (Jalankan Ulang)</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Jalankan & Verifikasi Output</span>
            </>
          )}
        </button>
      </div>

      {/* Execution Terminal / Results */}
      {output && (
        <div className="border-t border-[#27272a] bg-[#0c0c0e] p-3 text-xs font-mono">
          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-[#27272a] text-[#a1a1aa]">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  hasPassed ? 'bg-emerald-400' : 'bg-rose-500'
                }`}
              ></span>
              <span className={hasPassed ? 'text-emerald-400 font-medium' : 'text-rose-400'}>
                {hasPassed ? 'Berhasil: Output Valid' : 'Output Belum Sesuai Target'}
              </span>
            </span>
            <span className="text-[11px] text-[#71717a]">
              {Math.round(output.executionTimeMs)} ms
            </span>
          </div>

          {output.stdout.length > 0 && (
            <div className="text-[#f4f4f5] space-y-0.5 leading-relaxed">
              <div className="text-[11px] text-[#71717a]">Hasil Cetakan:</div>
              {output.stdout.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          )}

          {output.stderr.length > 0 && (
            <div className="text-rose-400 space-y-0.5 mt-1 leading-relaxed">
              <div className="text-[11px] text-rose-300">Pesan Galat (Error):</div>
              {output.stderr.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
