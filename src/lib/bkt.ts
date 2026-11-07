import { BelajarDatabase } from '../services/local';
import type { ConceptMasteryRecord } from '../services/types';

export { type ConceptMasteryRecord };

export interface BKTParameters {
  pL0: number; // Initial knowledge prior (default 0.10)
  pT: number;  // Transition probability (default 0.15)
  pG: number;  // Guess probability (default 0.20)
  pS: number;  // Slip probability (default 0.05)
}

export const DEFAULT_BKT_PARAMS: BKTParameters = {
  pL0: 0.10,
  pT: 0.15,
  pG: 0.20,
  pS: 0.05,
};

export const MASTERY_THRESHOLD = 0.85;
export const TEST_OUT_MASTERY = 0.90;

/**
 * Calculates updated Bayesian Knowledge Tracing (BKT) probability after an observation.
 * @param currentPL Current prior probability P(L_t) (between 0 and 1)
 * @param correct Whether the student answered correctly (true) or incorrectly (false)
 * @param params BKT parameters (pL0, pT, pG, pS)
 * @returns Updated posterior probability P(L_{t+1})
 */
export function updateBKTMastery(
  currentPL: number,
  correct: boolean,
  params: BKTParameters = DEFAULT_BKT_PARAMS
): number {
  const initialPrior = Number.isFinite(currentPL) ? currentPL : params.pL0;
  // Clamp input prior to safe numerical range
  const pL = Math.min(Math.max(initialPrior, 0.001), 0.999);
  const pT = Math.min(Math.max(params.pT, 0.001), 0.999);
  const pG = Math.min(Math.max(params.pG, 0.001), 0.999);
  const pS = Math.min(Math.max(params.pS, 0.001), 0.999);

  let pLGivenObs: number;
  if (correct) {
    const numerator = pL * (1 - pS);
    const denominator = numerator + (1 - pL) * pG;
    pLGivenObs = denominator > 0 ? numerator / denominator : pL;
  } else {
    const numerator = pL * pS;
    const denominator = numerator + (1 - pL) * (1 - pG);
    pLGivenObs = denominator > 0 ? numerator / denominator : pL;
  }

  // Learning transition step
  const pLNext = pLGivenObs + (1 - pLGivenObs) * pT;

  // Round to 4 decimal places for clean storage
  return Math.min(Math.max(Math.round(pLNext * 10000) / 10000, 0.001), 0.999);
}

/**
 * Evaluates whether a probability reaches the 85% mastery threshold.
 */
export function isConceptMastered(pL: number): boolean {
  return pL >= MASTERY_THRESHOLD;
}

const BKT_STORAGE_KEY = 'belajar_bkt_mastery';

let inMemoryMastery: Record<string, ConceptMasteryRecord> = {};

function getDexieDatabase(): BelajarDatabase | null {
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    try {
      return new BelajarDatabase();
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Retrieves mastery records from localStorage or in-memory fallback synchronously.
 */
export function getAllMasteryRecords(): Record<string, ConceptMasteryRecord> {
  if (typeof window === 'undefined') {
    return { ...inMemoryMastery };
  }
  try {
    const raw = localStorage.getItem(BKT_STORAGE_KEY);
    if (!raw) return { ...inMemoryMastery };
    return JSON.parse(raw);
  } catch {
    return { ...inMemoryMastery };
  }
}

/**
 * Asynchronously loads mastery records from Dexie IndexedDB into memory and localStorage.
 */
export async function loadBKTMasteryFromIndexedDB(): Promise<Record<string, ConceptMasteryRecord>> {
  const db = getDexieDatabase();
  if (!db) return getAllMasteryRecords();

  try {
    const list = await db.bktMastery.toArray();
    if (list.length > 0) {
      const records = getAllMasteryRecords();
      for (const item of list) {
        records[item.conceptId] = item;
      }
      inMemoryMastery = records;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(BKT_STORAGE_KEY, JSON.stringify(records));
        } catch {
          // ignore
        }
      }
      return records;
    }
  } catch {
    // Fallback
  }
  return getAllMasteryRecords();
}

/**
 * Retrieves mastery record for a specific concept.
 */
export function getConceptMastery(conceptId: string): ConceptMasteryRecord {
  const records = getAllMasteryRecords();
  if (records[conceptId]) {
    return records[conceptId];
  }
  return {
    conceptId,
    pL: DEFAULT_BKT_PARAMS.pL0,
    attempts: 0,
    correctCount: 0,
    isMastered: false,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Records an observation (quiz, test, or exercise) and updates BKT state in Dexie/localStorage.
 */
export function recordConceptObservation(
  conceptId: string,
  correct: boolean,
  params: BKTParameters = DEFAULT_BKT_PARAMS
): ConceptMasteryRecord {
  const current = getConceptMastery(conceptId);
  const newPL = updateBKTMastery(current.pL, correct, params);
  const updated: ConceptMasteryRecord = {
    conceptId,
    pL: newPL,
    attempts: current.attempts + 1,
    correctCount: current.correctCount + (correct ? 1 : 0),
    isMastered: isConceptMastered(newPL),
    lastUpdated: new Date().toISOString(),
  };

  saveConceptMastery(updated);
  return updated;
}

/**
 * Applies fast-track test out to a list of concepts, setting mastery to 0.90 in Dexie/localStorage.
 */
export function applyTestOutMastery(conceptIds: string[]): Record<string, ConceptMasteryRecord> {
  const records = getAllMasteryRecords();
  const now = new Date().toISOString();

  for (const id of conceptIds) {
    records[id] = {
      conceptId: id,
      pL: TEST_OUT_MASTERY,
      attempts: (records[id]?.attempts || 0) + 1,
      correctCount: (records[id]?.correctCount || 0) + 1,
      isMastered: true,
      lastUpdated: now,
    };
  }

  saveAllMasteryRecords(records);
  return records;
}

/**
 * Checks if all prerequisites for a level or lesson are met.
 */
export function arePrerequisitesMastered(prerequisiteConceptIds: string[]): boolean {
  if (!prerequisiteConceptIds || prerequisiteConceptIds.length === 0) {
    return true;
  }
  const records = getAllMasteryRecords();
  return prerequisiteConceptIds.every((id) => {
    const record = records[id];
    return record ? record.pL >= MASTERY_THRESHOLD : false;
  });
}

function saveConceptMastery(record: ConceptMasteryRecord): void {
  const records = getAllMasteryRecords();
  records[record.conceptId] = record;
  saveAllMasteryRecords(records);

  const db = getDexieDatabase();
  if (db) {
    db.bktMastery.put(record).catch(() => {});
  }
}

function saveAllMasteryRecords(records: Record<string, ConceptMasteryRecord>): void {
  inMemoryMastery = records;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(BKT_STORAGE_KEY, JSON.stringify(records));
      window.dispatchEvent(new CustomEvent('belajar:bkt-updated', { detail: records }));
    } catch {
      // storage unavailable
    }
  }

  const db = getDexieDatabase();
  if (db) {
    db.bktMastery.bulkPut(Object.values(records)).catch(() => {});
  }
}

/**
 * Helper to reset in-memory state during tests
 */
export function resetInMemoryMasteryForTesting(): void {
  inMemoryMastery = {};
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(BKT_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
