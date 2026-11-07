import { describe, it, expect } from 'vitest';
import {
  updateBKTMastery,
  isConceptMastered,
  recordConceptObservation,
  getConceptMastery,
  applyTestOutMastery,
  arePrerequisitesMastered,
  DEFAULT_BKT_PARAMS,
  MASTERY_THRESHOLD,
  TEST_OUT_MASTERY,
} from '../src/lib/bkt';

describe('Bayesian Knowledge Tracing (BKT) Engine', () => {
  it('correctly calculates posterior probability on correct observation', () => {
    const prior = 0.10;
    const post = updateBKTMastery(prior, true);
    // Correct observation should significantly increase prior probability
    expect(post).toBeGreaterThan(prior);
    expect(post).toBeLessThan(1.0);
  });

  it('correctly calculates posterior probability on incorrect observation', () => {
    const prior = 0.50;
    const post = updateBKTMastery(prior, false);
    // Incorrect observation should decrease knowledge estimate before learning transition
    expect(post).toBeLessThan(prior);
    expect(post).toBeGreaterThan(0);
  });

  it('converges to mastery (>= 0.85) after consecutive correct observations', () => {
    let pL = DEFAULT_BKT_PARAMS.pL0;
    expect(isConceptMastered(pL)).toBe(false);

    // After 4-5 consecutive correct observations, pL reaches mastery
    for (let i = 0; i < 5; i++) {
      pL = updateBKTMastery(pL, true);
    }
    expect(pL).toBeGreaterThanOrEqual(MASTERY_THRESHOLD);
    expect(isConceptMastered(pL)).toBe(true);
  });

  it('records concept observation and updates records', () => {
    const concept = 'J2-FP-Array';
    const rec1 = recordConceptObservation(concept, true);
    expect(rec1.conceptId).toBe(concept);
    expect(rec1.attempts).toBe(1);
    expect(rec1.correctCount).toBe(1);

    const retrieved = getConceptMastery(concept);
    expect(retrieved.pL).toBe(rec1.pL);
  });

  it('supports fast-track test out setting P(L) = 0.90', () => {
    const concepts = ['J1-Variables', 'J1-ControlFlow'];
    applyTestOutMastery(concepts);

    for (const c of concepts) {
      const rec = getConceptMastery(c);
      expect(rec.pL).toBe(TEST_OUT_MASTERY);
      expect(rec.isMastered).toBe(true);
    }

    expect(arePrerequisitesMastered(concepts)).toBe(true);
  });

  it('validates prerequisite DAG dependencies', () => {
    const unmastered = ['Advanced-Metaprogramming-J5'];
    expect(arePrerequisitesMastered(unmastered)).toBe(false);
  });
});
