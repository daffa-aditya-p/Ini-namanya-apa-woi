import type { CodeRunner, ExecutionResult } from './types';

export class JavaScriptRunner implements CodeRunner {
  language = 'javascript' as const;

  async run(code: string, timeoutMs: number = 3000): Promise<ExecutionResult> {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const startTime = performance.now();

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
        // Build mock console
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
          log: (...args: unknown[]) => {
            stdout.push(args.map(formatArg).join(' '));
          },
          info: (...args: unknown[]) => {
            stdout.push(args.map(formatArg).join(' '));
          },
          warn: (...args: unknown[]) => {
            stderr.push('[WARN] ' + args.map(formatArg).join(' '));
          },
          error: (...args: unknown[]) => {
            stderr.push(args.map(formatArg).join(' '));
          },
        };

        // Create isolated evaluation function
        // Note: For full client-side production, this runs in a Dedicated Web Worker (ADR-004)
        const runnerFn = new Function('console', `"use strict";\n${code}`);
        const result = runnerFn(customConsole);

        if (result instanceof Promise) {
          result
            .then((res) => {
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
            .catch((err) => {
              if (!isDone) {
                isDone = true;
                clearTimeout(timer);
                stderr.push(String(err));
                resolve({
                  success: false,
                  stdout,
                  stderr,
                  error: String(err),
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
