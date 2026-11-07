import type { CodeRunner, ExecutionResult } from './types';

export class JavaScriptRunner implements CodeRunner {
  language = 'javascript' as const;

  async run(code: string, timeoutMs: number = 3000): Promise<ExecutionResult> {
    const startTime = performance.now();

    // Environment: Browser with Web Worker support
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined' && typeof Blob !== 'undefined') {
      return this.runInBrowserWorker(code, timeoutMs, startTime);
    }

    // Environment: Node.js (Vitest / CLI)
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      return this.runInNodeVM(code, timeoutMs, startTime);
    }

    // Fallback: Function-based isolated evaluation
    return this.runInFallback(code, timeoutMs, startTime);
  }

  private async runInNodeVM(code: string, timeoutMs: number, startTime: number): Promise<ExecutionResult> {
    const stdout: string[] = [];
    const stderr: string[] = [];

    const formatArg = (arg: unknown): string => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    };

    const customConsole = {
      log: (...args: unknown[]) => stdout.push(args.map(formatArg).join(' ')),
      info: (...args: unknown[]) => stdout.push(args.map(formatArg).join(' ')),
      warn: (...args: unknown[]) => stderr.push('[WARN] ' + args.map(formatArg).join(' ')),
      error: (...args: unknown[]) => stderr.push(args.map(formatArg).join(' ')),
    };

    try {
      const vm = await import(/* @vite-ignore */ 'node:vm');
      const sandbox = {
        console: customConsole,
        setTimeout,
        clearTimeout,
        Promise,
        JSON,
        Math,
        Date,
        Array,
        Object,
        String,
        Number,
        Boolean,
        RegExp,
        Map,
        Set,
        WeakMap,
        WeakSet,
        Symbol,
        BigInt,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        structuredClone: typeof structuredClone !== 'undefined' ? structuredClone : (v: unknown) => JSON.parse(JSON.stringify(v)),
        Error,
        TypeError,
        RangeError,
        SyntaxError,
        ReferenceError,
      };
      const context = vm.createContext(sandbox);

      // Wrap in an IIFE so returns are supported
      const wrapped = `"use strict";\n(() => {\n${code}\n})()`;
      const result = vm.runInContext(wrapped, context, { timeout: timeoutMs });

      if (result && typeof result.then === 'function') {
        const promiseResult = await Promise.race([
          result,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`TimeoutError: Eksekusi melebihi ${timeoutMs}ms`)), timeoutMs)
          ),
        ]);
        return {
          success: true,
          stdout,
          stderr,
          result: promiseResult,
          executionTimeMs: performance.now() - startTime,
        };
      }

      return {
        success: true,
        stdout,
        stderr,
        result,
        executionTimeMs: performance.now() - startTime,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      const isTimeout =
        (err as { code?: string })?.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' ||
        errorMsg.includes('TimeoutError');
      if (isTimeout) {
        stderr.push(`Error: Batas waktu eksekusi (${timeoutMs}ms) terlampaui.`);
        return {
          success: false,
          stdout,
          stderr,
          error: `TimeoutError: Eksekusi melebihi ${timeoutMs}ms`,
          executionTimeMs: performance.now() - startTime,
        };
      }
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

  private runInBrowserWorker(code: string, timeoutMs: number, startTime: number): Promise<ExecutionResult> {
    return new Promise<ExecutionResult>((resolve) => {
      const workerScript = `
self.onmessage = async (e) => {
  const { code } = e.data;
  const stdout = [];
  const stderr = [];
  const formatArg = (arg) => {
    if (typeof arg === 'object' && arg !== null) {
      try { return JSON.stringify(arg); } catch { return String(arg); }
    }
    return String(arg);
  };
  const customConsole = {
    log: (...args) => stdout.push(args.map(formatArg).join(' ')),
    info: (...args) => stdout.push(args.map(formatArg).join(' ')),
    warn: (...args) => stderr.push('[WARN] ' + args.map(formatArg).join(' ')),
    error: (...args) => stderr.push(args.map(formatArg).join(' ')),
  };
  try {
    const fn = new Function('console', '"use strict";\\n' + code);
    const res = fn(customConsole);
    if (res && typeof res.then === 'function') {
      const awaited = await res;
      self.postMessage({ success: true, stdout, stderr, result: awaited });
    } else {
      self.postMessage({ success: true, stdout, stderr, result: res });
    }
  } catch (err) {
    const msg = err instanceof Error ? (err.name + ': ' + err.message) : String(err);
    stderr.push(msg);
    self.postMessage({ success: false, stdout, stderr, error: msg });
  }
};
`;
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      let worker: Worker | null = null;
      let isDone = false;

      const cleanup = () => {
        if (!isDone) {
          isDone = true;
          if (worker) {
            worker.terminate();
            worker = null;
          }
          URL.revokeObjectURL(workerUrl);
        }
      };

      const timer = setTimeout(() => {
        if (!isDone) {
          cleanup();
          resolve({
            success: false,
            stdout: [],
            stderr: [`Error: Batas waktu eksekusi (${timeoutMs}ms) terlampaui.`],
            error: `TimeoutError: Eksekusi melebihi ${timeoutMs}ms`,
            executionTimeMs: performance.now() - startTime,
          });
        }
      }, timeoutMs);

      try {
        worker = new Worker(workerUrl);
        worker.onmessage = (e) => {
          if (!isDone) {
            clearTimeout(timer);
            const data = e.data;
            cleanup();
            resolve({
              ...data,
              executionTimeMs: performance.now() - startTime,
            });
          }
        };
        worker.onerror = (err) => {
          if (!isDone) {
            clearTimeout(timer);
            cleanup();
            resolve({
              success: false,
              stdout: [],
              stderr: [err.message],
              error: err.message,
              executionTimeMs: performance.now() - startTime,
            });
          }
        };
        worker.postMessage({ code });
      } catch {
        clearTimeout(timer);
        cleanup();
        resolve(this.runInFallback(code, timeoutMs, startTime));
      }
    });
  }

  private runInFallback(code: string, timeoutMs: number, startTime: number): Promise<ExecutionResult> {
    const stdout: string[] = [];
    const stderr: string[] = [];

    const formatArg = (arg: unknown): string => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    };

    const customConsole = {
      log: (...args: unknown[]) => stdout.push(args.map(formatArg).join(' ')),
      info: (...args: unknown[]) => stdout.push(args.map(formatArg).join(' ')),
      warn: (...args: unknown[]) => stderr.push('[WARN] ' + args.map(formatArg).join(' ')),
      error: (...args: unknown[]) => stderr.push(args.map(formatArg).join(' ')),
    };

    return new Promise<ExecutionResult>((resolve) => {
      let isDone = false;
      const timer = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          resolve({
            success: false,
            stdout,
            stderr: [...stderr, `Error: Batas waktu eksekusi (${timeoutMs}ms) terlampaui.`],
            error: `TimeoutError: Eksekusi melebihi ${timeoutMs}ms`,
            executionTimeMs: performance.now() - startTime,
          });
        }
      }, timeoutMs);

      try {
        const runnerFn = new Function('console', `"use strict";\n${code}`);
        const result = runnerFn(customConsole);

        if (result && typeof result.then === 'function') {
          result
            .then((res: unknown) => {
              if (!isDone) {
                isDone = true;
                clearTimeout(timer);
                resolve({
                  success: true,
                  stdout,
                  stderr,
                  result: res,
                  executionTimeMs: performance.now() - startTime,
                });
              }
            })
            .catch((err: unknown) => {
              if (!isDone) {
                isDone = true;
                clearTimeout(timer);
                const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
                stderr.push(msg);
                resolve({
                  success: false,
                  stdout,
                  stderr,
                  error: msg,
                  executionTimeMs: performance.now() - startTime,
                });
              }
            });
        } else {
          if (!isDone) {
            isDone = true;
            clearTimeout(timer);
            resolve({
              success: true,
              stdout,
              stderr,
              result,
              executionTimeMs: performance.now() - startTime,
            });
          }
        }
      } catch (err) {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          const errorMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
          stderr.push(errorMsg);
          resolve({
            success: false,
            stdout,
            stderr,
            error: errorMsg,
            executionTimeMs: performance.now() - startTime,
          });
        }
      }
    });
  }
}
