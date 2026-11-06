export interface ExecutionResult {
  success: boolean;
  stdout: string[];
  stderr: string[];
  result?: unknown;
  executionTimeMs: number;
  error?: string;
}

export interface CodeRunner {
  language: 'javascript' | 'python';
  run(code: string, timeoutMs?: number): Promise<ExecutionResult>;
}
