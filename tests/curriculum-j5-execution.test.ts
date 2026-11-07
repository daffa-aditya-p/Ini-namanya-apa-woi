import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JavaScriptRunner } from '../src/lib/runner/javascript';

describe('Curriculum J5: Real Code Execution Verification', () => {
  const runner = new JavaScriptRunner();
  const filePath = path.resolve(process.cwd(), 'src/content/curriculum/javascript-j5.mdx');
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

  it('contains at least 5 curriculum code snippets for J5', () => {
    expect(snippets.length).toBeGreaterThanOrEqual(5);
  });

  for (const snippet of snippets) {
    it(`executes J5 snippet #${snippet.index} successfully with matching output`, async () => {
      const result = await runner.run(snippet.code);
      if (!result.success) {
        console.error(`J5 Snippet #${snippet.index} failed:`, result.stderr, result.error);
      }
      expect(result.success).toBe(true);
      expect(result.stderr).toEqual([]);

      const actualOutput = result.stdout.join('\n').trim();
      const expectedOutput = snippet.expected.replace(/\\n/g, '\n').trim();
      expect(actualOutput).toBe(expectedOutput);
    });
  }
});
