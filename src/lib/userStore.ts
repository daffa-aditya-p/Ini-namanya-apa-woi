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
  user: UserProfile | null;
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
const USERS_REGISTRY_KEY = 'belajar_users_registry';

let inMemorySession: UserProfile | null = null;
let inMemoryUsersRegistry: Record<string, UserProfile> = {};

function getUsersRegistry(): Record<string, UserProfile> {
  if (typeof window === 'undefined') {
    return inMemoryUsersRegistry;
  }
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    if (!raw) return inMemoryUsersRegistry;
    return JSON.parse(raw);
  } catch {
    return inMemoryUsersRegistry;
  }
}

function saveUserToRegistry(user: UserProfile): void {
  const registry = getUsersRegistry();
  const lowerUser = user.username.toLowerCase();
  const lowerEmail = user.email.toLowerCase();
  registry[lowerUser] = { ...user };
  registry[lowerEmail] = { ...user };
  inMemoryUsersRegistry = registry;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registry));
    } catch {
      // ignore local storage error
    }
  }
}

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
  if (user) {
    saveUserToRegistry(user);
  }
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
 * If user is a guest (not logged in), returns awarded: false without creating a session.
 */
export function awardExerciseCompletion(
  exerciseId: string,
  xpAmount: number = 25,
  hoursAmount: number = 1
): AwardResult {
  const user = getSavedSession();
  if (!user) {
    return {
      awarded: false,
      xpEarned: 0,
      user: null,
      alreadyCompleted: false,
      message: 'Masuk atau daftar untuk menyimpan progres belajarmu dan mengklaim +25 XP!',
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

export interface ChapterAwardResult {
  awarded: boolean;
  xpEarned: number;
  coinsEarned: number;
  user: UserProfile | null;
  alreadyCompleted: boolean;
  message: string;
}

/**
 * Awards XP and coins upon passing a Chapter Quiz with mastery standard (>=80%).
 * Prevents double-awarding for repeated practice.
 */
export function awardChapterQuizCompletion(
  chapterQuizId: string,
  xpAmount: number = 50,
  coinsAmount: number = 20,
  hoursAmount: number = 1
): ChapterAwardResult {
  const user = getSavedSession();
  if (!user) {
    return {
      awarded: false,
      xpEarned: 0,
      coinsEarned: 0,
      user: null,
      alreadyCompleted: false,
      message: 'Masuk atau daftar untuk menyimpan kelulusan Bab dan mengklaim reward!',
    };
  }

  const completed = user.completedExercises || [];
  if (completed.includes(chapterQuizId)) {
    return {
      awarded: false,
      xpEarned: 0,
      coinsEarned: 0,
      user,
      alreadyCompleted: true,
      message: 'Evaluasi Bab ini sudah diselesaikan sebelumnya. Reward kelulusan telah diklaim.',
    };
  }

  const updatedUser: UserProfile = {
    ...user,
    xp: user.xp + xpAmount,
    coins: (user.coins || 0) + coinsAmount,
    hoursSpent: (user.hoursSpent || 0) + hoursAmount,
    lastActiveDate: new Date().toISOString().split('T')[0],
    completedExercises: [...completed, chapterQuizId],
  };

  saveSession(updatedUser);

  return {
    awarded: true,
    xpEarned: xpAmount,
    coinsEarned: coinsAmount,
    user: updatedUser,
    alreadyCompleted: false,
    message: `Selamat! Kamu lulus Kuis Evaluasi Bab! Mendapatkan +${xpAmount} XP, +${coinsAmount} Koin, dan +${hoursAmount} jam belajar!`,
  };
}

/**
 * Client-side mock registration and login service with registry persistence.
 */
export const LocalAuthManager = {
  login(usernameOrEmail: string, _password?: string): UserProfile {
    const cleanHandle = usernameOrEmail.trim().replace(/^@/, '');
    const cleanUsername = cleanHandle.split('@')[0] || 'pembelajar';
    const lowerKey = cleanUsername.toLowerCase();
    const lowerEmail = cleanHandle.toLowerCase();

    // Check active session first
    const existing = getSavedSession();
    if (
      existing &&
      (existing.username.toLowerCase() === lowerKey ||
        existing.email.toLowerCase() === lowerEmail)
    ) {
      if (!existing.completedExercises) {
        existing.completedExercises = [];
      }
      saveSession(existing);
      return existing;
    }

    // Check registered users registry
    const registry = getUsersRegistry();
    const storedUser = registry[lowerKey] || registry[lowerEmail];
    if (storedUser) {
      if (!storedUser.completedExercises) {
        storedUser.completedExercises = [];
      }
      saveSession(storedUser);
      return storedUser;
    }

    // Special Demo Account: Budi (Master rank • 750 XP)
    if (lowerKey === 'budi_koding' || lowerKey === 'budi') {
      const demoProfile: UserProfile = {
        id: 'usr_budi_demo',
        username: 'budi_koding',
        name: 'Budi Prakoso',
        email: 'budi@belajar.in',
        streak: 5,
        longestStreak: 14,
        lastActiveDate: new Date().toISOString().split('T')[0],
        hoursSpent: 18,
        xp: 750, // Master rank (501 - 1000 XP)
        coins: 140,
        registeredEvents: ['event-sieve'],
        completedExercises: ['Latihan J1.1: Mencetak Nilai Pertama', 'Latihan P1.1: Mencetak Output di Python'],
      };
      saveSession(demoProfile);
      return demoProfile;
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
