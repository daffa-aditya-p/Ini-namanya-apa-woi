import { describe, it, expect, beforeEach } from 'vitest';
import {
  PYTHON_CHAPTERS,
  isPythonChapterUnlocked,
  getPreviousPythonChapter,
} from '../src/lib/pythonQuizBank';
import {
  awardChapterQuizCompletion,
  isExerciseCompleted,
  LocalAuthManager,
  getSavedSession,
} from '../src/lib/userStore';
import {
  applyTestOutMastery,
  getConceptMastery,
  resetInMemoryMasteryForTesting,
} from '../src/lib/bkt';

describe('Python Chapter Structure & Syllabus Hierarchy', () => {
  beforeEach(() => {
    LocalAuthManager.logout();
    resetInMemoryMasteryForTesting();
  });

  it('defines all 5 sequential Bab with required Sub-babs and slugs', () => {
    expect(PYTHON_CHAPTERS.length).toBe(5);

    const expectedChapters = [
      {
        id: 'python-bab1',
        num: 1,
        level: 'P1',
        title: 'Dasar Pemrograman & Variabel',
        subBabCount: 4,
      },
      {
        id: 'python-bab2',
        num: 2,
        level: 'P2',
        title: 'Logika & Alur Kontrol',
        subBabCount: 3,
      },
      {
        id: 'python-bab3',
        num: 3,
        level: 'P3',
        title: 'Struktur Data Koleksi',
        subBabCount: 4,
      },
      {
        id: 'python-bab4',
        num: 4,
        level: 'P4',
        title: 'Fungsi & Modularitas',
        subBabCount: 3,
      },
      {
        id: 'python-bab5',
        num: 5,
        level: 'P5',
        title: 'Pemrograman Berorientasi Objek',
        subBabCount: 4,
      },
    ];

    expectedChapters.forEach((expected, idx) => {
      const chapter = PYTHON_CHAPTERS[idx];
      expect(chapter.chapterId).toBe(expected.id);
      expect(chapter.chapterNumber).toBe(expected.num);
      expect(chapter.level).toBe(expected.level);
      expect(chapter.title).toBe(expected.title);
      expect(chapter.subBabs.length).toBe(expected.subBabCount);
      expect(chapter.questions.length).toBeGreaterThanOrEqual(8);
    });
  });

  it('verifies every sub-bab has an anchor hash and valid title', () => {
    PYTHON_CHAPTERS.forEach((chapter) => {
      chapter.subBabs.forEach((sub) => {
        expect(sub.hash).toMatch(/^#subbab-\d+-\d+$/);
        expect(sub.number).toBeDefined();
        expect(sub.title.length).toBeGreaterThan(3);
      });
    });
  });

  it('provides correct previous chapter relationships and sequential unlock state', () => {
    // Bab 1 has no previous chapter and is unlocked by default
    expect(getPreviousPythonChapter('python-bab1')).toBeNull();
    expect(isPythonChapterUnlocked('python-bab1')).toBe(true);

    // Bab 2 through Bab 5 have previous chapters
    const prev2 = getPreviousPythonChapter('python-bab2');
    expect(prev2?.chapterId).toBe('python-bab1');

    const prev3 = getPreviousPythonChapter('python-bab3');
    expect(prev3?.chapterId).toBe('python-bab2');

    // Without passing Bab 1 quiz, Bab 2 is locked
    expect(isPythonChapterUnlocked('python-bab2')).toBe(false);

    // With Bab 1 passed in completedMap override
    expect(isPythonChapterUnlocked('python-bab2', { 'python-bab1': true })).toBe(true);
    expect(isPythonChapterUnlocked('python-bab3', { 'python-bab1': true, 'python-bab2': false })).toBe(false);
  });
});

describe('Dynamic Randomization & Question Bank Verification', () => {
  it('ensures each question in every Bab question bank has exactly 1 correct option and thorough explanations', () => {
    PYTHON_CHAPTERS.forEach((chapter) => {
      chapter.questions.forEach((q) => {
        expect(q.id).toBeDefined();
        expect(q.conceptId).toBeDefined();
        expect(q.question.length).toBeGreaterThan(10);
        expect(q.options.length).toBe(4);

        const correctOptions = q.options.filter((opt) => opt.isCorrect);
        expect(correctOptions.length).toBe(1);

        q.options.forEach((opt) => {
          expect(opt.text.length).toBeGreaterThan(0);
          expect(opt.explanation.length).toBeGreaterThan(10);
        });
      });
    });
  });

  it('verifies question bank hygiene (no author draft markers or placeholder debug notes)', () => {
    const forbiddenPatterns = [/salah,\s*yang benar/i, /TODO/i, /FIXME/i, /DRAFT NOTE/i];

    PYTHON_CHAPTERS.forEach((chap) => {
      chap.questions.forEach((q) => {
        forbiddenPatterns.forEach((pattern) => {
          expect(q.question).not.toMatch(pattern);
          q.options.forEach((opt) => {
            expect(opt.text).not.toMatch(pattern);
            expect(opt.explanation).not.toMatch(pattern);
          });
        });
      });
    });
  });

  it('randomizes question subsets without losing question integrity', () => {
    const bab1 = PYTHON_CHAPTERS[0];
    const pool = bab1.questions;

    // Simulate sampling 5 questions
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
    expect(shuffled.length).toBe(5);

    const ids = new Set(shuffled.map((q) => q.id));
    expect(ids.size).toBe(5); // all sampled questions must be unique
  });
});

describe('Strict Passing Standard & Reward Execution', () => {
  beforeEach(() => {
    LocalAuthManager.logout();
    resetInMemoryMasteryForTesting();
  });

  it('enforces >= 80% passing standard (max 1 mistake out of 5)', () => {
    const totalQuestions = 5;
    const passingScore = 80;

    const calcScore = (correct: number) => Math.round((correct / totalQuestions) * 100);

    // 5 of 5 correct (100%) -> PASS
    expect(calcScore(5)).toBe(100);
    expect(calcScore(5) >= passingScore).toBe(true);

    // 4 of 5 correct (80%) -> PASS (1 mistake tolerated)
    expect(calcScore(4)).toBe(80);
    expect(calcScore(4) >= passingScore).toBe(true);

    // 3 of 5 correct (60%) -> FAIL (2 mistakes exceeds limit)
    expect(calcScore(3)).toBe(60);
    expect(calcScore(3) >= passingScore).toBe(false);

    // 2 of 5 correct (40%) -> FAIL
    expect(calcScore(2)).toBe(40);
    expect(calcScore(2) >= passingScore).toBe(false);
  });

  it('awards +50 XP, +20 coins, and +1 study hour upon Chapter Quiz completion', () => {
    // Register clean user
    const user = LocalAuthManager.register('satria_python', 'satria@python.in', 'pass123');
    expect(user.xp).toBe(25);
    expect(user.coins).toBe(20);
    expect(user.hoursSpent).toBe(1);

    // Pass Bab 1 Quiz
    const res = awardChapterQuizCompletion('quiz_python-bab1', 50, 20, 1);
    expect(res.awarded).toBe(true);
    expect(res.xpEarned).toBe(50);
    expect(res.coinsEarned).toBe(20);
    expect(res.user?.xp).toBe(75);
    expect(res.user?.coins).toBe(40);
    expect(res.user?.hoursSpent).toBe(2);
    expect(isExerciseCompleted('quiz_python-bab1')).toBe(true);

    // Now Bab 2 is unlocked
    expect(isPythonChapterUnlocked('python-bab2')).toBe(true);

    // Retrying quiz (practice) must NOT award duplicate XP or coins
    const duplicate = awardChapterQuizCompletion('quiz_python-bab1', 50, 20, 1);
    expect(duplicate.awarded).toBe(false);
    expect(duplicate.alreadyCompleted).toBe(true);
    expect(duplicate.xpEarned).toBe(0);
    expect(duplicate.coinsEarned).toBe(0);
    expect(duplicate.user?.xp).toBe(75);
    expect(duplicate.user?.coins).toBe(40);

    // Clean up
    LocalAuthManager.logout();
  });

  it('allows guest users to complete chapter quiz, unlocks next chapter, and migrates upon registration', () => {
    LocalAuthManager.logout();
    expect(getSavedSession()).toBeNull();

    // Guest completes Bab 1 quiz
    const guestAward = awardChapterQuizCompletion('quiz_python-bab1', 50, 20, 1);
    expect(guestAward.awarded).toBe(false);
    expect(guestAward.user).toBeNull();
    expect(guestAward.message).toContain('Masuk atau daftar');

    // Guest completion should still be recorded so progression isn't blocked
    expect(isExerciseCompleted('quiz_python-bab1')).toBe(true);
    expect(isPythonChapterUnlocked('python-bab2')).toBe(true);

    // Later guest decides to register
    const newUser = LocalAuthManager.register('belajar_guest_migrated', 'migrated@belajar.in');
    expect(newUser.completedExercises).toContain('quiz_python-bab1');
    expect(isExerciseCompleted('quiz_python-bab1')).toBe(true);

    LocalAuthManager.logout();
  });

  it('updates Bayesian Knowledge Tracing (BKT) concept mastery when chapter testout applies', () => {
    const bab1Concepts = [
      'python.basics.print',
      'python.basics.variables',
      'python.basics.operators',
      'python.basics.input',
    ];

    bab1Concepts.forEach((cid) => {
      expect(getConceptMastery(cid).isMastered).toBe(false);
    });

    // Simulate quiz pass triggering BKT mastery
    applyTestOutMastery(bab1Concepts);

    bab1Concepts.forEach((cid) => {
      const mastery = getConceptMastery(cid);
      expect(mastery.isMastered).toBe(true);
      expect(mastery.pL).toBeGreaterThanOrEqual(0.90);
    });
  });
});
