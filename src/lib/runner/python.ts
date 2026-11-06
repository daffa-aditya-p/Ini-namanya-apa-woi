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

export class PythonRunner implements CodeRunner {
  language = 'python' as const;

  async run(code: string, timeoutMs: number = 5000): Promise<ExecutionResult> {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const startTime = performance.now();

    try {
      const pyodide = await getPyodideInstance();

      // Configure stdout and stderr handlers
      if (pyodide.setStdout) {
        pyodide.setStdout({
          batched: (msg: string) => {
            if (msg.trim().length > 0) stdout.push(msg);
          },
        });
      }

      if (pyodide.setStderr) {
        pyodide.setStderr({
          batched: (msg: string) => {
            if (msg.trim().length > 0) stderr.push(msg);
          },
        });
      }

      // Execute with timeout guard
      const runPromise = (async () => {
        // Redirect stdout/stderr via Python sys as double safety
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
__captured_out = __stdout_capture.getvalue()
__captured_err = __stderr_capture.getvalue()
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
          const lines = outStr.split('\n').filter((l: string) => l.length > 0);
          for (const l of lines) {
            if (!stdout.includes(l)) stdout.push(l);
          }
        }

        if (errStr) {
          const lines = errStr.split('\n').filter((l: string) => l.length > 0);
          for (const l of lines) {
            if (!stderr.includes(l)) stderr.push(l);
          }
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
  }
}
