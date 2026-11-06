import { describe, it, expect } from 'vitest';
import { calculateCheckIn, type UserProfile, LocalAuthManager } from '../src/lib/userStore';

describe('Daily Check-In & Streak Calculation Logic', () => {
  const baseUser: UserProfile = {
    id: 'test_usr',
    username: 'test_user',
    name: 'Test User',
    email: 'test@example.com',
    streak: 3,
    longestStreak: 5,
    lastActiveDate: '2026-11-05',
    lastCheckInDate: '2026-11-05',
    hoursSpent: 10,
    xp: 350,
    coins: 50,
    registeredEvents: [],
  };

  it('awards full streak coins when checking in consecutively (next day)', () => {
    const { updatedUser, result } = calculateCheckIn(baseUser, '2026-11-06');
    expect(result.success).toBe(true);
    expect(result.alreadyCheckedIn).toBe(false);
    expect(result.coinsEarned).toBe(25); // Full consecutive reward
    expect(updatedUser.streak).toBe(4); // 3 + 1
    expect(updatedUser.coins).toBe(75); // 50 + 25
    expect(updatedUser.lastCheckInDate).toBe('2026-11-06');
  });

  it('penalizes with reduced coins and resets streak if a day was skipped', () => {
    // Last check-in was 2026-11-03, checking in on 2026-11-06 (3 days diff)
    const userWithGap: UserProfile = {
      ...baseUser,
      lastCheckInDate: '2026-11-03',
      streak: 7,
    };

    const { updatedUser, result } = calculateCheckIn(userWithGap, '2026-11-06');
    expect(result.success).toBe(true);
    expect(result.coinsEarned).toBe(5); // Reduced reward per user requirement
    expect(updatedUser.streak).toBe(1); // Reset to 1
    expect(updatedUser.coins).toBe(55); // 50 + 5
    expect(result.message).toContain('melewatkan hari kemarin');
  });

  it('blocks duplicate check-in on the same day', () => {
    const userAlreadyCheckedIn: UserProfile = {
      ...baseUser,
      lastCheckInDate: '2026-11-06',
    };

    const { updatedUser, result } = calculateCheckIn(userAlreadyCheckedIn, '2026-11-06');
    expect(result.success).toBe(false);
    expect(result.alreadyCheckedIn).toBe(true);
    expect(result.coinsEarned).toBe(0);
    expect(updatedUser.coins).toBe(baseUser.coins);
    expect(updatedUser.streak).toBe(baseUser.streak);
  });

  it('handles first-time check-in when lastCheckInDate is undefined', () => {
    const newUser: UserProfile = {
      ...baseUser,
      lastCheckInDate: undefined,
      streak: 1,
      coins: 0,
    };

    const { updatedUser, result } = calculateCheckIn(newUser, '2026-11-06');
    expect(result.success).toBe(true);
    expect(result.coinsEarned).toBe(20);
    expect(updatedUser.streak).toBe(1);
    expect(updatedUser.coins).toBe(20);
  });
});

describe('LocalAuthManager Helper', () => {
  it('validates email format in forgotPassword', () => {
    const invalid = LocalAuthManager.forgotPassword('not-an-email');
    expect(invalid.success).toBe(false);

    const valid = LocalAuthManager.forgotPassword('user@example.com');
    expect(valid.success).toBe(true);
    expect(valid.message).toContain('user@example.com');
  });
});
