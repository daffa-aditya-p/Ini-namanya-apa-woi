import { describe, it, expect } from 'vitest';
import { LessonFrontmatterSchema, CodeSnippetSchema } from '../src/schemas/curriculum';
import {
  LessonProgressSchema,
  StreakInfoSchema,
  UserSchema,
  TutorRequestSchema,
  TutorResponseSchema,
} from '../src/services/types';

describe('Zod Curriculum Schemas', () => {
  it('validates a valid lesson frontmatter', () => {
    const validLesson = {
      id: 'J1.1',
      track: 'javascript',
      level: 'J1',
      title: 'Console & Nilai Pertama',
      slug: 'javascript/j1-console',
      estimatedMinutes: 20,
      prerequisites: [],
      learningObjectives: ['Memahami console.log', 'Mengeksekusi kode pertama'],
      relatedConcepts: ['stdout', 'repl'],
      languageVersion: 'ES2024',
      summary: 'Langkah pertama menulis JavaScript modern dengan console.log.',
    };

    const parsed = LessonFrontmatterSchema.safeParse(validLesson);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid track or negative minutes', () => {
    const invalidLesson = {
      id: 'J1.1',
      track: 'ruby', // invalid
      level: 'J1',
      title: 'Invalid',
      slug: 'invalid',
      estimatedMinutes: -10, // invalid
      prerequisites: [],
      learningObjectives: [],
      relatedConcepts: [],
      languageVersion: 'ES2024',
      summary: 'summary',
    };

    const parsed = LessonFrontmatterSchema.safeParse(invalidLesson);
    expect(parsed.success).toBe(false);
  });

  it('validates code snippet schema', () => {
    const snippet = {
      code: 'console.log("Halo dunia!");',
      language: 'javascript',
      expectedOutput: 'Halo dunia!',
    };

    const parsed = CodeSnippetSchema.safeParse(snippet);
    expect(parsed.success).toBe(true);
  });
});

describe('Zod Service Schemas', () => {
  it('validates lesson progress schema', () => {
    const progress = {
      lessonId: 'J1.1',
      completed: true,
      score: 100,
      lastAttemptAt: new Date().toISOString(),
      masteryLevel: 0.85,
      attemptsCount: 2,
    };

    const parsed = LessonProgressSchema.safeParse(progress);
    expect(parsed.success).toBe(true);
  });

  it('validates streak and user schemas', () => {
    const streak = {
      currentStreak: 5,
      longestStreak: 12,
      lastActiveDate: '2026-11-06',
    };
    expect(StreakInfoSchema.safeParse(streak).success).toBe(true);

    const user = {
      id: 'usr_1',
      name: 'Budi Pembelajar',
      email: 'budi@example.com',
      isGuest: false,
    };
    expect(UserSchema.safeParse(user).success).toBe(true);
  });

  it('validates tutor request & response schemas', () => {
    const req = {
      lessonId: 'P1.1',
      userCode: 'print("Halo")',
      prompt: 'Mengapa baris ini berhasil?',
    };
    expect(TutorRequestSchema.safeParse(req).success).toBe(true);

    const res = {
      hint: 'Perhatikan fungsi print() yang dipanggil.',
      citations: ['P1.1'],
      suggestedAction: 'Coba ubah string di dalamnya.',
    };
    expect(TutorResponseSchema.safeParse(res).success).toBe(true);
  });
});
