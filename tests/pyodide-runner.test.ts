import { describe, it, expect } from 'vitest';
import { PythonRunner } from '../src/lib/runner/python';

describe('Pyodide Python Runner', () => {
  const runner = new PythonRunner();

  it('executes basic print statements in Pyodide', async () => {
    const code = 'print("Halo dari Pyodide Python 3.12!")';
    const result = await runner.run(code);
    expect(result.success).toBe(true);
    expect(result.stdout).toContain('Halo dari Pyodide Python 3.12!');
    expect(result.stderr).toEqual([]);
  }, 30000);

  it('evaluates calculations and data structures', async () => {
    const code = `
nilai = [10, 20, 30]
total = sum(nilai)
print(f"Total: {total}")
`;
    const result = await runner.run(code);
    expect(result.success).toBe(true);
    expect(result.stdout).toContain('Total: 60');
  });

  it('captures Python exceptions gracefully', async () => {
    const code = '10 / 0';
    const result = await runner.run(code);
    expect(result.success).toBe(false);
    expect(result.error).toContain('ZeroDivisionError');
  });

  it('captures Python NameError gracefully', async () => {
    const code = 'print(variabel_tidak_ada)';
    const result = await runner.run(code);
    expect(result.success).toBe(false);
    expect(result.error).toContain('NameError');
  });
});
