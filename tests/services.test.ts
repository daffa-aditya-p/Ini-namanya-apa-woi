import { describe, it, expect, beforeEach } from 'vitest';
import { LocalProgressService, LocalAuthService, LocalAIGateway } from '../src/services/local';

describe('Local Service Interfaces', () => {
  let progressService: LocalProgressService;
  let authService: LocalAuthService;
  let aiGateway: LocalAIGateway;

  beforeEach(() => {
    progressService = new LocalProgressService();
    authService = new LocalAuthService();
    aiGateway = new LocalAIGateway();
  });

  it('saves and retrieves lesson progress', async () => {
    const progress = {
      lessonId: 'J1.1',
      completed: true,
      score: 95,
      lastAttemptAt: new Date().toISOString(),
      masteryLevel: 0.9,
      attemptsCount: 1,
    };

    await progressService.saveProgress(progress);
    const retrieved = await progressService.getProgress('J1.1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.lessonId).toBe('J1.1');
    expect(retrieved?.completed).toBe(true);

    const map = await progressService.getMasteryMap();
    expect(map['J1.1']).toBe(0.9);
  });

  it('updates streak correctly', async () => {
    const streak = await progressService.updateStreak();
    expect(streak.currentStreak).toBeGreaterThanOrEqual(1);
    expect(streak.longestStreak).toBeGreaterThanOrEqual(1);
    expect(streak.lastActiveDate).toBe(new Date().toISOString().split('T')[0]);
  });

  it('handles guest authentication and login/logout', async () => {
    const guest = await authService.getCurrentUser();
    expect(guest?.isGuest).toBe(true);

    await authService.login('github');
    const logged = await authService.getCurrentUser();
    expect(logged?.isGuest).toBe(false);

    await authService.logout();
    const afterLogout = await authService.getCurrentUser();
    expect(afterLogout?.isGuest).toBe(true);
  });

  it('generates grounded Socratic hints and reviews', async () => {
    const hint = await aiGateway.generateSocraticHint({
      lessonId: 'J1.1',
      userCode: 'conosle.log("test")',
      errorMessage: 'ReferenceError: conosle is not defined',
      prompt: 'Kenapa error?',
    });

    expect(hint.hint).toContain('Perhatikan pesan kesalahan');
    expect(hint.citations).toContain('J1.1');

    const review = await aiGateway.reviewCode({
      lessonId: 'J1.1',
      code: 'console.log("Mantap");',
    });
    expect(review.passed).toBe(true);
    expect(review.citations).toContain('J1.1');
  });
});
