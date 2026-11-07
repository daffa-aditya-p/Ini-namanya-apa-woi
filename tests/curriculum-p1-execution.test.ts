import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PythonRunner, getPyodideInstance } from '../src/lib/runner/python';

describe('Curriculum P1: Real Pyodide WASM Execution Verification', () => {
  beforeAll(async () => {
    await getPyodideInstance();
  }, 60000);

  const runner = new PythonRunner();
  const filePath = path.resolve(process.cwd(), 'src/content/curriculum/python-p1.mdx');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract initialCode and expectedOutput pairs from the MDX file
  const regex = /initialCode=\{`([\s\S]*?)`\}\s*expectedOutput=\{`([\s\S]*?)`\}/g;
  const snippets: { code: string; expected: string; index: number }[] = [];
  let match;
  let count = 1;
  while ((match = regex.exec(content)) !== null) {
    snippets.push({
      code: match[1],
      expected: match[2],
      index: count++,
    });
  }

  it('contains at least 5 curriculum code snippets', () => {
    expect(snippets.length).toBeGreaterThanOrEqual(5);
  });

  for (const snippet of snippets) {
    it(
      `executes P1 snippet #${snippet.index} in Pyodide with matching output`,
      async () => {
        const result = await runner.run(snippet.code);
        expect(result.success).toBe(true);
        expect(result.stderr).toEqual([]);

        const actualOutput = result.stdout.join('\n').trim();
        const expectedOutput = snippet.expected.replace(/\\n/g, '\n').trim();
        expect(actualOutput).toBe(expectedOutput);
      },
      30000
    );
  }
});
