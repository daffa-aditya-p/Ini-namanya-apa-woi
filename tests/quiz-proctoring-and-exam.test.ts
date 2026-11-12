import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import {
  PYTHON_CHAPTERS,
  PYTHON_FINAL_EXAM,
} from '../src/lib/pythonQuizBank';
import {
  PYTHON_SUGGESTIONS,
  JAVASCRIPT_SUGGESTIONS,
} from '../src/components/QuickCodeSuggestions';
import {
  awardFinalExamCompletion,
  isExerciseCompleted,
  LocalAuthManager,
  getSavedSession,
} from '../src/lib/userStore';
import { PythonRunner, getPyodideInstance } from '../src/lib/runner/python';
import { isSplitScreenDetected } from '../src/lib/useProctoring';

describe('Python Chapter Live Coding Challenges & Syllabus Integrity', () => {
  it('defines live coding challenges for every sequential Bab (Bab 1 to 5)', () => {
    expect(PYTHON_CHAPTERS.length).toBe(5);

    PYTHON_CHAPTERS.forEach((chap) => {
      expect(chap.codingChallenges).toBeDefined();
      expect(chap.codingChallenges!.length).toBeGreaterThanOrEqual(3);

      chap.codingChallenges!.forEach((challenge) => {
        expect(challenge.id).toMatch(/^p\d-c\d$/);
        expect(challenge.conceptId).toBeDefined();
        expect(challenge.subBab).toBeDefined();
        expect(challenge.title.length).toBeGreaterThan(5);
        expect(challenge.question.length).toBeGreaterThan(15);
        expect(challenge.starterCode.length).toBeGreaterThan(5);
        expect(challenge.expectedOutput.length).toBeGreaterThan(0);
        expect(challenge.testCases?.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  it('defines comprehensive Final Exam with mixed Q&A and Live Coding spanning Bab 1 to 5', () => {
    expect(PYTHON_FINAL_EXAM.examId).toBe('exam_python_final');
    expect(PYTHON_FINAL_EXAM.durationMinutes).toBe(25);
    expect(PYTHON_FINAL_EXAM.passingScore).toBe(80);
    expect(PYTHON_FINAL_EXAM.xpReward).toBe(150);
    expect(PYTHON_FINAL_EXAM.coinsReward).toBe(50);

    // 10 MCQs
    expect(PYTHON_FINAL_EXAM.questions.length).toBe(10);
    PYTHON_FINAL_EXAM.questions.forEach((q) => {
      expect(q.id).toMatch(/^fe-q\d+$/);
      expect(q.options.length).toBe(4);
      const correctOpts = q.options.filter((o) => o.isCorrect);
      expect(correctOpts.length).toBe(1);
      q.options.forEach((opt) => {
        expect(opt.text.length).toBeGreaterThan(0);
        expect(opt.explanation.length).toBeGreaterThan(10);
      });
    });

    // 5 Live Coding Challenges (covering Bab 1-5)
    expect(PYTHON_FINAL_EXAM.codingChallenges.length).toBe(5);
    PYTHON_FINAL_EXAM.codingChallenges.forEach((c) => {
      expect(c.id).toMatch(/^fe-c\d+$/);
      expect(c.starterCode.length).toBeGreaterThan(5);
      expect(c.expectedOutput.length).toBeGreaterThan(0);
      expect(c.testCases?.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('Mobile-Friendly Quick Code Suggestions (Virtual Helper Bar)', () => {
  it('contains essential Python one-tap insertion chips for mobile keyboards', () => {
    const labels = PYTHON_SUGGESTIONS.map((s) => s.label);

    const requiredChips = [
      'def',
      'return',
      'print()',
      'for',
      'in',
      'range()',
      'if',
      'else:',
      'self',
      ':',
      '()',
      '[]',
      '{}',
      '""',
      'Tab ⇥',
    ];

    requiredChips.forEach((chip) => {
      expect(labels).toContain(chip);
    });

    // Each suggestion has a valid insertion code and cursor offset
    PYTHON_SUGGESTIONS.forEach((s) => {
      expect(s.code.length).toBeGreaterThan(0);
      expect(s.cursorOffset).toBeGreaterThan(0);
      expect(s.cursorOffset).toBeLessThanOrEqual(s.code.length);
    });
  });

  it('contains essential JavaScript quick chips', () => {
    const labels = JAVASCRIPT_SUGGESTIONS.map((s) => s.label);
    expect(labels).toContain('const');
    expect(labels).toContain('let');
    expect(labels).toContain('console.log()');
    expect(labels).toContain('() =>');
    expect(labels).toContain(';');
  });
});

describe('Comprehensive Final Exam Scoring & Official Certification Award', () => {
  beforeEach(() => {
    LocalAuthManager.logout();
  });

  it('evaluates passing score (>= 80%) across mixed 15 exam questions', () => {
    const totalExamQuestions = 15;
    const passingScore = 80;

    const calc = (correct: number) => Math.round((correct / totalExamQuestions) * 100);

    // 15/15 (100%) -> Pass
    expect(calc(15)).toBe(100);
    expect(calc(15) >= passingScore).toBe(true);

    // 12/15 (80%) -> Pass (limit)
    expect(calc(12)).toBe(80);
    expect(calc(12) >= passingScore).toBe(true);

    // 11/15 (73%) -> Fail
    expect(calc(11)).toBe(73);
    expect(calc(11) >= passingScore).toBe(false);

    // 10/15 (67%) -> Fail
    expect(calc(10)).toBe(67);
    expect(calc(10) >= passingScore).toBe(false);
  });

  it('awards +150 XP, +50 Coins, +2 Study Hours and official graduate certificate upon completion', () => {
    const user = LocalAuthManager.register('alisa_engineer', 'alisa@belajar.in', 'securepass');
    expect(user.xp).toBe(25);
    expect(user.coins).toBe(20);
    expect(user.hoursSpent).toBe(1);

    const award = awardFinalExamCompletion('exam_python_final', 150, 50, 2);
    expect(award.awarded).toBe(true);
    expect(award.xpEarned).toBe(150);
    expect(award.coinsEarned).toBe(50);
    expect(award.user?.xp).toBe(175);
    expect(award.user?.coins).toBe(70);
    expect(award.user?.hoursSpent).toBe(3);

    // Both exam and official certification badge recorded
    expect(isExerciseCompleted('exam_python_final')).toBe(true);
    expect(isExerciseCompleted('cert_python_graduate')).toBe(true);
    expect(award.user?.completedExercises).toContain('cert_python_graduate');

    // Duplicate attempt does not re-award XP
    const duplicate = awardFinalExamCompletion('exam_python_final', 150, 50, 2);
    expect(duplicate.awarded).toBe(false);
    expect(duplicate.alreadyCompleted).toBe(true);
    expect(duplicate.xpEarned).toBe(0);

    LocalAuthManager.logout();
  });

  it('allows guest to complete Final Exam and retains certification badge upon subsequent registration', () => {
    LocalAuthManager.logout();
    expect(getSavedSession()).toBeNull();

    const guestAward = awardFinalExamCompletion('exam_python_final', 150, 50, 2);
    expect(guestAward.awarded).toBe(false);
    expect(guestAward.user).toBeNull();

    expect(isExerciseCompleted('exam_python_final')).toBe(true);
    expect(isExerciseCompleted('cert_python_graduate')).toBe(true);

    // Guest signs up
    const newUser = LocalAuthManager.register('guest_graduated', 'graduated@belajar.in');
    expect(newUser.completedExercises).toContain('exam_python_final');
    expect(newUser.completedExercises).toContain('cert_python_graduate');

    LocalAuthManager.logout();
  });

  it('allows guest to complete Final Exam and retains certification badge upon subsequent login', () => {
    LocalAuthManager.logout();
    expect(getSavedSession()).toBeNull();

    const guestAward = awardFinalExamCompletion('exam_python_final', 150, 50, 2);
    expect(guestAward.awarded).toBe(false);

    // Guest logs in (instead of registering)
    const loggedInUser = LocalAuthManager.login('returning_guest');
    expect(loggedInUser.completedExercises).toContain('exam_python_final');
    expect(loggedInUser.completedExercises).toContain('cert_python_graduate');

    LocalAuthManager.logout();
  });
});

describe('Live Coding Scaffolding & Pyodide Execution Verification', () => {
  beforeAll(async () => {
    await getPyodideInstance();
  }, 60000);

  it('provides authentic scaffolding (TODOs) in starterCode for learners to write code', () => {
    PYTHON_CHAPTERS.forEach((chap) => {
      chap.codingChallenges?.forEach((challenge) => {
        expect(challenge.starterCode).toMatch(/TODO/i);
        expect(challenge.solutionCode).toBeDefined();
        expect(challenge.solutionCode!.length).toBeGreaterThan(10);
      });
    });

    PYTHON_FINAL_EXAM.codingChallenges.forEach((challenge) => {
      expect(challenge.starterCode).toMatch(/TODO/i);
      expect(challenge.solutionCode).toBeDefined();
      expect(challenge.solutionCode!.length).toBeGreaterThan(10);
    });
  });

  it('executes Bab 1 challenge reference solution and produces expected output', async () => {
    const runner = new PythonRunner();
    const challenge1 = PYTHON_CHAPTERS[0].codingChallenges![0];

    const res = await runner.run(challenge1.solutionCode!);
    expect(res.success).toBe(true);
    expect(res.stdout.join('\n').trim()).toBe(challenge1.expectedOutput.trim());
  }, 25000);

  it('executes Bab 5 challenge reference solution and verifies OOP class method output', async () => {
    const runner = new PythonRunner();
    const challenge5 = PYTHON_CHAPTERS[4].codingChallenges![0];

    const res = await runner.run(challenge5.solutionCode!);
    expect(res.success).toBe(true);
    expect(res.stdout.join('\n').trim()).toBe(challenge5.expectedOutput.trim());
  }, 25000);

  it('executes Final Exam coding challenge reference solution and verifies output', async () => {
    const runner = new PythonRunner();
    const finalCoding1 = PYTHON_FINAL_EXAM.codingChallenges[0];

    const res = await runner.run(finalCoding1.solutionCode!);
    expect(res.success).toBe(true);
    expect(res.stdout.join('\n').trim()).toBe(finalCoding1.expectedOutput.trim());
  }, 25000);
});

describe('Anti-Cheat & Split-Screen Proctoring Verification', () => {
  it('detects desktop window resizing / side-by-side tiling multitasking', () => {
    // Normal desktop window (1200x800)
    expect(isSplitScreenDetected(1200, 800, 1200, 800, 1440, 900)).toBe(false);

    // Desktop split horizontally (tiled to left half, width drops from 1200 to 500)
    expect(isSplitScreenDetected(500, 800, 1200, 800, 1440, 900)).toBe(true);

    // Desktop narrow screen ratio (< 60% of available screen on >= 800px monitor)
    expect(isSplitScreenDetected(700, 900, 1200, 900, 1440, 900)).toBe(true);
  });

  it('detects mobile portrait vertical split-screen multitasking', () => {
    // Standard phone in portrait (e.g. 390x844)
    expect(isSplitScreenDetected(390, 750, 390, 750, 390, 844)).toBe(false);

    // Mobile split screen (Android / iOS multitasking: browser runs in top half, height shrinks to 320px)
    expect(isSplitScreenDetected(390, 320, 390, 750, 390, 844)).toBe(true);

    // Mobile screen height ratio < 62% in portrait
    expect(isSplitScreenDetected(390, 380, 390, 750, 390, 844)).toBe(true);
  });
});
