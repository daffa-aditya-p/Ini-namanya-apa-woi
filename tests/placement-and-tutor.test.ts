import { describe, it, expect } from 'vitest';
import { LocalAIGateway } from '../src/services/local';
import {
  TutorRequestSchema,
  TutorResponseSchema,
  ReviewRequestSchema,
  ReviewResponseSchema,
} from '../src/services/types';
import { applyTestOutMastery, getConceptMastery, MASTERY_THRESHOLD } from '../src/lib/bkt';

describe('Socratic AI Tutor & Hint Ladder', () => {
  const gateway = new LocalAIGateway();

  it('generates 4-stage sequential Socratic hints validated by Zod', async () => {
    for (let stage = 1; stage <= 4; stage++) {
      const rawReq = {
        lessonId: 'J2',
        userCode: 'const arr = [1, 2, 3];',
        prompt: `Bantu saya di tahap ${stage}`,
        hintStage: stage,
      };

      const parsedReq = TutorRequestSchema.parse(rawReq);
      const res = await gateway.generateSocraticHint(parsedReq);
      const parsedRes = TutorResponseSchema.parse(res);

      expect(parsedRes.hintStage).toBe(stage);
      expect(parsedRes.stageTitle).toBeDefined();
      expect(parsedRes.hint.length).toBeGreaterThan(15);
      expect(parsedRes.citations.length).toBeGreaterThan(0);
      expect(parsedRes.citations).toContain('J2');
    }
  });

  it('provides grounded error diagnosis when runtime error message is passed', async () => {
    const rawReq = {
      lessonId: 'P2',
      userCode: 'd = {}\nprint(d["nonexistent"])',
      errorMessage: 'KeyError: nonexistent',
      prompt: 'Kenapa KeyError?',
    };

    const parsedReq = TutorRequestSchema.parse(rawReq);
    const res = await gateway.generateSocraticHint(parsedReq);
    const parsedRes = TutorResponseSchema.parse(res);

    expect(parsedRes.hint).toContain('KeyError: nonexistent');
    expect(parsedRes.stageTitle).toBe('Diagnostik Galat Runtime');
    expect(parsedRes.citations).toContain('P2');
  });

  it('performs code review validated by Zod ReviewResponseSchema', async () => {
    const rawReq = {
      lessonId: 'J2',
      code: 'const double = (arr) => arr.map(x => x * 2);',
    };

    const parsedReq = ReviewRequestSchema.parse(rawReq);
    const res = await gateway.reviewCode(parsedReq);
    const parsedRes = ReviewResponseSchema.parse(res);

    expect(parsedRes.passed).toBe(true);
    expect(parsedRes.feedback).toBeDefined();
    expect(parsedRes.citations.length).toBeGreaterThan(0);
  });

  it('enforces Hint Ladder stage cap at 4', async () => {
    // Testing beyond stage 4 clamped at 4
    const req = TutorRequestSchema.parse({
      lessonId: 'J2',
      userCode: 'const x = 10;',
      prompt: 'Tahap 4',
      hintStage: 4,
    });
    const res = await gateway.generateSocraticHint(req);
    expect(res.hintStage).toBe(4);
    expect(res.stageTitle).toContain('Tahap 4');
  });
});

describe('Adaptive Placement Test Integration', () => {
  it('applies test-out mastery to unlock subsequent level prerequisites', () => {
    const testOutNodes = ['J1-Variables-Types', 'J1-Control-Flow', 'J1-Functions'];
    applyTestOutMastery(testOutNodes);

    for (const node of testOutNodes) {
      const record = getConceptMastery(node);
      expect(record.pL).toBeGreaterThanOrEqual(MASTERY_THRESHOLD);
      expect(record.isMastered).toBe(true);
    }
  });

  it('verifies BelajarDatabase contains bktMastery store', async () => {
    const { BelajarDatabase } = await import('../src/services/local');
    const db = new BelajarDatabase();
    expect(db.tables.some((t) => t.name === 'bktMastery')).toBe(true);
    expect(db.tables.some((t) => t.name === 'progress')).toBe(true);
    expect(db.tables.some((t) => t.name === 'metadata')).toBe(true);
  });
});
