import type { CodeRunner, ExecutionResult } from './types';

interface PyodideInterface {
  runPythonAsync(code: string): Promise<unknown>;
  setStdout?(options: { batched: (msg: string) => void }): void;
  setStderr?(options: { batched: (msg: string) => void }): void;
}

interface PyodideWindow {
  loadPyodide?: (config?: { indexURL?: string }) => Promise<PyodideInterface>;
}

interface CapturedTuple {
  get(index: number): string;
}

// Singleton instance to prevent reloading WASM on each execution
let pyodideInstance: PyodideInterface | null = null;
let pyodideLoadingPromise: Promise<PyodideInterface> | null = null;

export async function getPyodideInstance(): Promise<PyodideInterface> {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoadingPromise) return pyodideLoadingPromise;

  pyodideLoadingPromise = (async () => {
    // Check if in Node or browser
    if (typeof window === 'undefined') {
      const { loadPyodide } = await import('pyodide');
      const path = await import(/* @vite-ignore */ 'path');
      const pyodideDir = path.resolve(process.cwd(), 'node_modules/pyodide');
      pyodideInstance = (await loadPyodide({
        indexURL: pyodideDir + '/',
      })) as unknown as PyodideInterface;
    } else {
      const win = window as unknown as PyodideWindow;
      // In browser: load from window.loadPyodide or CDN/worker
      if (win.loadPyodide) {
        pyodideInstance = await win.loadPyodide();
      } else {
        const { loadPyodide } = await import('pyodide');
        pyodideInstance = (await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.8/full/',
        })) as unknown as PyodideInterface;
      }
    }
    return pyodideInstance;
  })();

  return pyodideLoadingPromise;
}

let executionMutex: Promise<unknown> = Promise.resolve();

export class PythonRunner implements CodeRunner {
  language = 'python' as const;

  async run(code: string, timeoutMs: number = 5000): Promise<ExecutionResult> {
    const execute = async (): Promise<ExecutionResult> => {
      const stdout: string[] = [];
      const stderr: string[] = [];
      const fallbackStdout: string[] = [];
      const fallbackStderr: string[] = [];
      const startTime = performance.now();

      try {
        const pyodide = await getPyodideInstance();

        // Configure fallback stdout and stderr handlers for WASM-level output
        if (pyodide.setStdout) {
          pyodide.setStdout({
            batched: (msg: string) => {
              if (msg.trim().length > 0) fallbackStdout.push(msg);
            },
          });
        }

        if (pyodide.setStderr) {
          pyodide.setStderr({
            batched: (msg: string) => {
              if (msg.trim().length > 0) fallbackStderr.push(msg);
            },
          });
        }

        // Execute with timeout guard
        const runPromise = (async () => {
          // Redirect stdout/stderr via Python sys
          const setupScript = `
import sys, io
__stdout_capture = io.StringIO()
__stderr_capture = io.StringIO()
sys.stdout = __stdout_capture
sys.stderr = __stderr_capture
`;
          await pyodide.runPythonAsync(setupScript);

          let pyResult: unknown = undefined;
          let caughtError: unknown = null;
          try {
            pyResult = await pyodide.runPythonAsync(code);
          } catch (err) {
            caughtError = err;
          }

          const teardownScript = `
try:
    __captured_out = __stdout_capture.getvalue()
    __captured_err = __stderr_capture.getvalue()
except NameError:
    __captured_out = ""
    __captured_err = ""
finally:
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__
(__captured_out, __captured_err)
`;
          const captured = (await pyodide.runPythonAsync(teardownScript)) as unknown as CapturedTuple;
          const outStr = captured.get(0);
          const errStr = captured.get(1);

          if (typeof (captured as { destroy?: () => void }).destroy === 'function') {
            (captured as { destroy: () => void }).destroy();
          }
          if (pyResult && typeof (pyResult as { destroy?: () => void }).destroy === 'function') {
            (pyResult as { destroy: () => void }).destroy();
          }

          if (outStr) {
            const lines = outStr.split('\n');
            if (lines.length > 0 && lines[lines.length - 1] === '') {
              lines.pop();
            }
            stdout.push(...lines);
          } else if (fallbackStdout.length > 0) {
            stdout.push(...fallbackStdout);
          }

          if (errStr) {
            const lines = errStr.split('\n');
            if (lines.length > 0 && lines[lines.length - 1] === '') {
              lines.pop();
            }
            stderr.push(...lines);
          } else if (fallbackStderr.length > 0) {
            stderr.push(...fallbackStderr);
          }

          if (caughtError) {
            const errObj = caughtError as { message?: string; type?: string };
            const errType = errObj?.type ? `${errObj.type}: ` : '';
            const detailedMsg = errObj?.message || String(caughtError);
            const fullTraceback = stderr.length > 0 ? stderr.join('\n') : `${errType}${detailedMsg}`;
            if (!stderr.includes(fullTraceback)) {
              stderr.push(fullTraceback);
            }
            return {
              success: false,
              stdout,
              stderr,
              error: fullTraceback,
              executionTimeMs: performance.now() - startTime,
            };
          }

          return {
            success: true,
            stdout,
            stderr,
            result: pyResult,
            executionTimeMs: performance.now() - startTime,
          };
        })();

        const timeoutPromise = new Promise<ExecutionResult>((resolve) => {
          setTimeout(() => {
            resolve({
              success: false,
              stdout,
              stderr: [...stderr, `Error: Batas waktu eksekusi (${timeoutMs}ms) terlampaui.`],
              error: `TimeoutError: Eksekusi Python melebihi ${timeoutMs}ms`,
              executionTimeMs: performance.now() - startTime,
            });
          }, timeoutMs);
        });

        return await Promise.race([runPromise, timeoutPromise]);
      } catch (err) {
        const errorMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
        stderr.push(errorMsg);
        return {
          success: false,
          stdout,
          stderr,
          error: errorMsg,
          executionTimeMs: performance.now() - startTime,
        };
      }
    };

    const nextRun = executionMutex.then(execute, execute);
    executionMutex = nextRun.catch(() => {});
    return await nextRun;
  }
}
