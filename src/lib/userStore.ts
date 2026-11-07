export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  streak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  lastCheckInDate?: string; // YYYY-MM-DD
  hoursSpent: number; // formatted as jam (e.g. 5, 372)
  xp: number;
  coins: number;
  registeredEvents: string[];
  completedExercises?: string[];
}

export interface CheckInResult {
  success: boolean;
  coinsEarned: number;
  message: string;
  newStreak: number;
  newCoins: number;
  alreadyCheckedIn: boolean;
}

export interface AwardResult {
  awarded: boolean;
  xpEarned: number;
  user: UserProfile;
  alreadyCompleted: boolean;
  message: string;
}

export const DEFAULT_USER: UserProfile = {
  id: 'usr_default',
  username: 'ahmad_dev',
  name: 'Ahmad Rafli',
  email: 'ahmad@belajar.in',
  streak: 4,
  longestStreak: 12,
  lastActiveDate: new Date().toISOString().split('T')[0],
  hoursSpent: 14,
  xp: 750, // Master rank
  coins: 135,
  registeredEvents: ['event-sieve'],
  completedExercises: [],
};

/**
 * Pure calculation of check-in outcome given current state and target date.
 */
export function calculateCheckIn(
  user: UserProfile,
  targetDateStr: string = new Date().toISOString().split('T')[0]
): { updatedUser: UserProfile; result: CheckInResult } {
  const lastCheckIn = user.lastCheckInDate;

  // Already checked in on target date
  if (lastCheckIn === targetDateStr) {
    return {
      updatedUser: { ...user },
      result: {
        success: false,
        coinsEarned: 0,
        message: 'Kamu sudah melakukan check-in hari ini. Datang lagi besok untuk bonus berikutnya!',
        newStreak: user.streak,
        newCoins: user.coins,
        alreadyCheckedIn: true,
      },
    };
  }

  let newStreak = 1;
  let coinsAwarded = 25; // Standard daily bonus
  let message = '';

  if (!lastCheckIn) {
    // First time check-in
    newStreak = Math.max(1, user.streak || 1);
    coinsAwarded = 20;
    message = 'Check-in harian pertama berhasil! +20 Koin ditambahkan ke kantongmu.';
  } else {
    const lastDate = new Date(lastCheckIn);
    const currDate = new Date(targetDateStr);
    const diffTime = currDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day! Streak increases
      newStreak = user.streak + 1;
      coinsAwarded = 25; // Full streak reward
      message = `Luar biasa! Streak bertambah menjadi ${newStreak} hari beruntun! Kamu mendapatkan +${coinsAwarded} Koin.`;
    } else if (diffDays > 1) {
      // Missed at least one day
      newStreak = 1;
      coinsAwarded = 5; // Reduced coins penalty
      message = `Kamu melewatkan hari kemarin. Streak direset ke 1 dan perolehan koin berkurang (+${coinsAwarded} Koin). Jangan patah semangat!`;
    } else {
      // Negative or same-day edge case
      newStreak = user.streak;
      coinsAwarded = 0;
      message = 'Tanggal check-in tidak valid.';
    }
  }

  const updatedUser: UserProfile = {
    ...user,
    streak: newStreak,
    longestStreak: Math.max(newStreak, user.longestStreak),
    coins: user.coins + coinsAwarded,
    lastCheckInDate: targetDateStr,
    lastActiveDate: targetDateStr,
  };

  return {
    updatedUser,
    result: {
      success: true,
      coinsEarned: coinsAwarded,
      message,
      newStreak,
      newCoins: updatedUser.coins,
      alreadyCheckedIn: false,
    },
  };
}

const STORAGE_KEY = 'belajar_user_session';
let inMemorySession: UserProfile | null = null;

/**
 * Loads the active user from localStorage (or in-memory fallback in tests/SSR).
 */
export function getSavedSession(): UserProfile | null {
  if (typeof window === 'undefined') {
    return inMemorySession;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return inMemorySession;
    return JSON.parse(raw);
  } catch {
    return inMemorySession;
  }
}

/**
 * Saves active user session to localStorage and dispatches change notification.
 */
export function saveSession(user: UserProfile | null): void {
  inMemorySession = user ? { ...user } : null;
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent('belajar:user-updated', { detail: user }));
    window.dispatchEvent(new Event('storage'));
  } catch {
    // ignore local storage error
  }
}

/**
 * Checks whether an exercise has already been completed by the current session.
 */
export function isExerciseCompleted(exerciseId: string): boolean {
  const user = getSavedSession();
  if (!user || !user.completedExercises) return false;
  return user.completedExercises.includes(exerciseId);
}

/**
 * Awards XP and updates study hours in userStore when assertions pass.
 * Prevents double-awarding XP for the same exercise.
 */
export function awardExerciseCompletion(
  exerciseId: string,
  xpAmount: number = 25,
  hoursAmount: number = 1
): AwardResult {
  let user = getSavedSession();
  if (!user) {
    // If guest learner, initialize a guest profile so progress is preserved
    user = {
      id: `usr_guest_${Date.now()}`,
      username: 'pembelajar',
      name: 'Pembelajar',
      email: 'pembelajar@belajar.in',
      streak: 1,
      longestStreak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      hoursSpent: 0,
      xp: 0,
      coins: 0,
      registeredEvents: [],
      completedExercises: [],
    };
  }

  const completed = user.completedExercises || [];
  if (completed.includes(exerciseId)) {
    return {
      awarded: false,
      xpEarned: 0,
      user,
      alreadyCompleted: true,
      message: 'Latihan ini sudah diselesaikan sebelumnya. XP telah diklaim.',
    };
  }

  const updatedUser: UserProfile = {
    ...user,
    xp: user.xp + xpAmount,
    hoursSpent: (user.hoursSpent || 0) + hoursAmount,
    lastActiveDate: new Date().toISOString().split('T')[0],
    completedExercises: [...completed, exerciseId],
  };

  saveSession(updatedUser);

  return {
    awarded: true,
    xpEarned: xpAmount,
    user: updatedUser,
    alreadyCompleted: false,
    message: `Luar biasa! +${xpAmount} XP berhasil didapatkan dan waktu belajarmu bertambah (+${hoursAmount} jam)!`,
  };
}

/**
 * Simple client-side mock registration and login service.
 */
export const LocalAuthManager = {
  login(usernameOrEmail: string, _password?: string): UserProfile {
    const cleanHandle = usernameOrEmail.trim().replace(/^@/, '');
    const cleanUsername = cleanHandle.split('@')[0] || 'pembelajar';

    // Check if user already exists in local list
    const existing = getSavedSession();
    if (
      existing &&
      (existing.username.toLowerCase() === cleanUsername.toLowerCase() ||
        existing.email.toLowerCase() === cleanHandle.toLowerCase())
    ) {
      if (!existing.completedExercises) {
        existing.completedExercises = [];
      }
      saveSession(existing);
      return existing;
    }

    // Default or newly constructed profile
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
      email: cleanHandle.includes('@') ? cleanHandle : `${cleanUsername}@belajar.in`,
      streak: 3,
      longestStreak: 7,
      lastActiveDate: new Date().toISOString().split('T')[0],
      hoursSpent: 8,
      xp: 245, // Gold II rank default
      coins: 80,
      registeredEvents: [],
      completedExercises: [],
    };

    saveSession(profile);
    return profile;
  },

  register(username: string, email: string, _password?: string): UserProfile {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || 'pengguna';
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
      email: email.trim() || `${cleanUsername}@belajar.in`,
      streak: 1,
      longestStreak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      hoursSpent: 1,
      xp: 25, // Bronze I
      coins: 20,
      registeredEvents: [],
      completedExercises: [],
    };

    saveSession(profile);
    return profile;
  },

  forgotPassword(email: string): { success: boolean; message: string } {
    if (!email || !email.includes('@')) {
      return {
        success: false,
        message: 'Format alamat email tidak valid.',
      };
    }
    return {
      success: true,
      message: `Tautan pemulihan kata sandi telah dikirim ke ${email}. Silakan periksa kotak masukmu.`,
    };
  },

  logout(): void {
    saveSession(null);
  },
};
