import { describe, it, expect } from 'vitest';
import { JavaScriptRunner } from '../src/lib/runner/javascript';

describe('JavaScript Runner', () => {
  const runner = new JavaScriptRunner();

  it('executes simple console.log statements', async () => {
    const result = await runner.run('console.log("Halo", "belajar.in!");');
    expect(result.success).toBe(true);
    expect(result.stdout).toEqual(['Halo belajar.in!']);
    expect(result.stderr).toEqual([]);
  });

  it('captures multiple outputs and types', async () => {
    const code = `
      console.log(42);
      console.log([1, 2, 3]);
      console.log({ nama: "Antigravity", aktif: true });
    `;
    const result = await runner.run(code);
    expect(result.success).toBe(true);
    expect(result.stdout).toHaveLength(3);
    expect(result.stdout[0]).toBe('42');
    expect(result.stdout[1]).toBe('[1,2,3]');
    expect(result.stdout[2]).toBe('{"nama":"Antigravity","aktif":true}');
  });

  it('captures runtime errors gracefully', async () => {
    const result = await runner.run('const a = 10; a.toUpperCase();');
    expect(result.success).toBe(false);
    expect(result.error).toContain('TypeError');
    expect(result.stderr.length).toBeGreaterThan(0);
  });

  it('handles syntax errors gracefully', async () => {
    const result = await runner.run('const let var = ;');
    expect(result.success).toBe(false);
    expect(result.error).toContain('SyntaxError');
  });

  it('handles async promises', async () => {
    const code = `
      return new Promise((resolve) => {
        console.log("Mulai...");
        resolve("Selesai");
      });
    `;
    const result = await runner.run(code);
    expect(result.success).toBe(true);
    expect(result.stdout).toContain('Mulai...');
    expect(result.result).toBe('Selesai');
  });

  it('enforces execution timeout guard', async () => {
    const code = `
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    `;
    const result = await runner.run(code, 200); // 200ms timeout
    expect(result.success).toBe(false);
    expect(result.error).toContain('TimeoutError');
  });
});
