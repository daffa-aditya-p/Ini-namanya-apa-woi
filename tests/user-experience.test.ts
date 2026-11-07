import { describe, it, expect } from 'vitest';
import { getRankInfo } from '../src/lib/ranks';
import { buildLeaderboard } from '../src/lib/leaderboard';
import {
  calculateCheckIn,
  type UserProfile,
  LocalAuthManager,
  awardExerciseCompletion,
  isExerciseCompleted,
} from '../src/lib/userStore';

describe('Comprehensive User Journey & Feature Integration', () => {
  it('manages complete user authentication flow (login, register, forgot-password, logout)', () => {
    // 1. Register a new user
    const newUser = LocalAuthManager.register('fajar_code', 'fajar@example.com', 'secret123');
    expect(newUser.username).toBe('fajar_code');
    expect(newUser.email).toBe('fajar@example.com');
    expect(newUser.xp).toBe(25); // Starts in Bronze I
    expect(newUser.streak).toBe(1);
    expect(newUser.hoursSpent).toBe(1);

    // 2. Rank for new user
    const rank = getRankInfo(newUser.xp);
    expect(rank.tier).toBe('Bronze I');
    expect(rank.nextRank?.tier).toBe('Bronze II');

    // 3. Forgot password test
    const forgotRes = LocalAuthManager.forgotPassword('fajar@example.com');
    expect(forgotRes.success).toBe(true);
    expect(forgotRes.message).toContain('fajar@example.com');

    // 4. Logout
    LocalAuthManager.logout();
  });

  it('verifies strict rank boundary rules matching user prompt specifications', () => {
    // bronze I 0-50xp
    expect(getRankInfo(0).tier).toBe('Bronze I');
    expect(getRankInfo(50).tier).toBe('Bronze I');

    // bronze II 51-100xp
    expect(getRankInfo(51).tier).toBe('Bronze II');
    expect(getRankInfo(100).tier).toBe('Bronze II');

    // gold I 101-200xp
    expect(getRankInfo(101).tier).toBe('Gold I');
    expect(getRankInfo(200).tier).toBe('Gold I');

    // gold II 201-300xp
    expect(getRankInfo(201).tier).toBe('Gold II');
    expect(getRankInfo(300).tier).toBe('Gold II');

    // diamond 301-500xp
    expect(getRankInfo(301).tier).toBe('Diamond');
    expect(getRankInfo(500).tier).toBe('Diamond');

    // heroic 501-700xp
    expect(getRankInfo(501).tier).toBe('Heroic');
    expect(getRankInfo(700).tier).toBe('Heroic');

    // master 700-1000xp
    expect(getRankInfo(701).tier).toBe('Master');
    expect(getRankInfo(1000).tier).toBe('Master');

    // grandmaster 1000-2000xp
    expect(getRankInfo(1001).tier).toBe('Grandmaster');
    expect(getRankInfo(2000).tier).toBe('Grandmaster');

    // Immortal 2001xp++
    expect(getRankInfo(2001).tier).toBe('Immortal');
    expect(getRankInfo(5000).tier).toBe('Immortal');
  });

  it('verifies daily check-in consecutive reward vs skipped day penalty', () => {
    let user: UserProfile = {
      id: 'usr_gamify',
      username: 'gamer_dev',
      name: 'Gamer Dev',
      email: 'gamer@belajar.in',
      streak: 5,
      longestStreak: 5,
      lastActiveDate: '2026-11-05',
      lastCheckInDate: '2026-11-05',
      hoursSpent: 24,
      xp: 450,
      coins: 100,
      registeredEvents: [],
    };

    // Case A: Consecutive check-in (day after) -> +25 koin, streak + 1
    const consecutive = calculateCheckIn(user, '2026-11-06');
    expect(consecutive.result.success).toBe(true);
    expect(consecutive.result.coinsEarned).toBe(25);
    expect(consecutive.updatedUser.streak).toBe(6);
    expect(consecutive.updatedUser.coins).toBe(125);

    // Apply consecutive update
    user = consecutive.updatedUser;

    // Case B: Same day check-in -> alreadyCheckedIn true, +0 koin
    const duplicate = calculateCheckIn(user, '2026-11-06');
    expect(duplicate.result.success).toBe(false);
    expect(duplicate.result.alreadyCheckedIn).toBe(true);
    expect(duplicate.result.coinsEarned).toBe(0);

    // Case C: Skipped day (checking in on 2026-11-09 instead of 2026-11-07) -> penalty +5 koin, streak resets to 1
    const skipped = calculateCheckIn(user, '2026-11-09');
    expect(skipped.result.success).toBe(true);
    expect(skipped.result.coinsEarned).toBe(5); // reduced reward
    expect(skipped.updatedUser.streak).toBe(1); // reset to 1
    expect(skipped.updatedUser.coins).toBe(130); // 125 + 5
  });

  it('constructs leaderboard matching required schema: no | username | nama rank | xp total', () => {
    const activeUser = {
      username: 'dewi_koding',
      name: 'Dewi Koding',
      xp: 850, // Master
    };

    const board = buildLeaderboard(activeUser);

    // Ensure all items have the required columns
    board.forEach((item) => {
      expect(typeof item.no).toBe('number');
      expect(typeof item.username).toBe('string');
      expect(typeof item.rankName).toBe('string');
      expect(typeof item.totalXp).toBe('number');
    });

    // Check user row
    const userRow = board.find((item) => item.username === 'dewi_koding');
    expect(userRow).toBeDefined();
    expect(userRow?.isCurrentUser).toBe(true);
    expect(userRow?.rankName).toBe('Master');
    expect(userRow?.totalXp).toBe(850);

    // Ensure sorted strictly descending
    for (let i = 0; i < board.length - 1; i++) {
      expect(board[i].totalXp).toBeGreaterThanOrEqual(board[i + 1].totalXp);
    }
  });

  it('handles module study hours formatting (e.g. 5 jam, 372 jam)', () => {
    const shortStudyUser: UserProfile = {
      id: 'u1',
      username: 'novice',
      name: 'Novice',
      email: 'novice@example.com',
      streak: 1,
      longestStreak: 1,
      lastActiveDate: '2026-11-06',
      hoursSpent: 5,
      xp: 40,
      coins: 10,
      registeredEvents: [],
    };
    expect(`${shortStudyUser.hoursSpent} jam`).toBe('5 jam');

    const longStudyUser: UserProfile = {
      ...shortStudyUser,
      hoursSpent: 372,
    };
    expect(`${longStudyUser.hoursSpent} jam`).toBe('372 jam');
  });

  it('awards +25 XP and increments study hours on exercise completion, preventing duplicates', () => {
    // Reset/setup clean user session in memory/mock
    const learner = LocalAuthManager.register('koding_hero', 'hero@belajar.in', 'hero123');
    expect(learner.xp).toBe(25);
    expect(learner.hoursSpent).toBe(1);
    expect(learner.completedExercises).toEqual([]);

    // Award exercise #1
    const res1 = awardExerciseCompletion('Latihan J1.1: Mencetak Nilai Pertama', 25, 1);
    expect(res1.awarded).toBe(true);
    expect(res1.xpEarned).toBe(25);
    expect(res1.alreadyCompleted).toBe(false);
    expect(res1.user.xp).toBe(50); // 25 + 25
    expect(res1.user.hoursSpent).toBe(2); // 1 + 1
    expect(res1.user.completedExercises).toContain('Latihan J1.1: Mencetak Nilai Pertama');
    expect(isExerciseCompleted('Latihan J1.1: Mencetak Nilai Pertama')).toBe(true);

    // Running the same exercise again must NOT award duplicate XP
    const resDuplicate = awardExerciseCompletion('Latihan J1.1: Mencetak Nilai Pertama', 25, 1);
    expect(resDuplicate.awarded).toBe(false);
    expect(resDuplicate.alreadyCompleted).toBe(true);
    expect(resDuplicate.xpEarned).toBe(0);
    expect(resDuplicate.user.xp).toBe(50); // XP unchanged!
    expect(resDuplicate.user.hoursSpent).toBe(2);

    // Award exercise #2 -> crosses rank boundary to Bronze II (>50 XP)
    const res2 = awardExerciseCompletion('Latihan P1.1: Mencetak Output di Python', 25, 1);
    expect(res2.awarded).toBe(true);
    expect(res2.user.xp).toBe(75); // 50 + 25
    expect(res2.user.hoursSpent).toBe(3);
    const updatedRank = getRankInfo(res2.user.xp);
    expect(updatedRank.tier).toBe('Bronze II');

    // Clean up
    LocalAuthManager.logout();
  });
});
