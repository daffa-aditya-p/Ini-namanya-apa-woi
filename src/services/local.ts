import Dexie, { type Table } from 'dexie';
import type {
  ProgressService,
  LessonProgress,
  StreakInfo,
  AuthService,
  User,
  AIGateway,
  TutorRequest,
  TutorResponse,
  ReviewRequest,
  ReviewResponse,
} from './types';

// IndexedDB database definition via Dexie
export class BelajarDatabase extends Dexie {
  progress!: Table<LessonProgress, string>;
  metadata!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super('belajar_in_db');
    this.version(1).stores({
      progress: 'lessonId, completed, score, lastAttemptAt',
      metadata: 'key',
    });
  }
}

export class LocalProgressService implements ProgressService {
  private db: BelajarDatabase | null = null;
  private memoryFallback = new Map<string, LessonProgress>();
  private metadataFallback = new Map<string, unknown>();

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      try {
        this.db = new BelajarDatabase();
      } catch {
        this.db = null;
      }
    }
  }

  async getProgress(lessonId: string): Promise<LessonProgress | null> {
    if (this.db) {
      try {
        const item = await this.db.progress.get(lessonId);
        return item ?? null;
      } catch {
        // Fallback to memory
      }
    }
    return this.memoryFallback.get(lessonId) ?? null;
  }

  async saveProgress(progress: LessonProgress): Promise<void> {
    if (this.db) {
      try {
        await this.db.progress.put(progress);
        return;
      } catch {
        // Fallback to memory
      }
    }
    this.memoryFallback.set(progress.lessonId, progress);
  }

  async getMasteryMap(): Promise<Record<string, number>> {
    const map: Record<string, number> = {};
    if (this.db) {
      try {
        const all = await this.db.progress.toArray();
        for (const item of all) {
          map[item.lessonId] = item.masteryLevel;
        }
        return map;
      } catch {
        // Fallback
      }
    }
    for (const [id, item] of this.memoryFallback.entries()) {
      map[id] = item.masteryLevel;
    }
    return map;
  }

  async updateStreak(): Promise<StreakInfo> {
    const today = new Date().toISOString().split('T')[0];
    let streak: StreakInfo = {
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
    };

    if (this.db) {
      try {
        const stored = await this.db.metadata.get('streak');
        if (stored && typeof stored.value === 'object' && stored.value !== null) {
          const prev = stored.value as StreakInfo;
          if (prev.lastActiveDate === today) {
            return prev;
          }
          const prevDate = new Date(prev.lastActiveDate);
          const currDate = new Date(today);
          const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
          const currentStreak = diffDays === 1 ? prev.currentStreak + 1 : 1;
          const longestStreak = Math.max(currentStreak, prev.longestStreak);
          streak = { currentStreak, longestStreak, lastActiveDate: today };
        }
        await this.db.metadata.put({ key: 'streak', value: streak });
        return streak;
      } catch {
        // Fallback to memory
      }
    }

    const prev = this.metadataFallback.get('streak') as StreakInfo | undefined;
    if (prev) {
      if (prev.lastActiveDate === today) return prev;
      const prevDate = new Date(prev.lastActiveDate);
      const currDate = new Date(today);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
      const currentStreak = diffDays === 1 ? prev.currentStreak + 1 : 1;
      const longestStreak = Math.max(currentStreak, prev.longestStreak);
      streak = { currentStreak, longestStreak, lastActiveDate: today };
    }
    this.metadataFallback.set('streak', streak);
    return streak;
  }
}

export class LocalAuthService implements AuthService {
  private currentUser: User = {
    id: 'guest_user',
    name: 'Pembelajar Tamu',
    isGuest: true,
  };

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async login(_provider: string): Promise<void> {
    this.currentUser = {
      id: 'local_user',
      name: 'Pembelajar Lokal',
      isGuest: false,
    };
  }

  async logout(): Promise<void> {
    this.currentUser = {
      id: 'guest_user',
      name: 'Pembelajar Tamu',
      isGuest: true,
    };
  }
}

export class LocalAIGateway implements AIGateway {
  mode: 'mock' | 'local' | 'remote' = 'local';

  async generateSocraticHint(req: TutorRequest): Promise<TutorResponse> {
    if (req.errorMessage) {
      return {
        hint: `Perhatikan pesan kesalahan: "${req.errorMessage}". Coba telusuri variabel atau sintaks pada baris sebelum error terjadi. Apakah tipe datanya sudah sesuai yang diharapkan?`,
        citations: [req.lessonId],
        suggestedAction: 'Cek nama variabel dan tipe datanya.',
      };
    }
    return {
      hint: `Mari kita telaah langkah demi langkah. Apa yang kamu harapkan dicetak oleh baris terakhir kodemu, dan apa yang sebenarnya dihasilkan?`,
      citations: [req.lessonId],
      suggestedAction: 'Jalankan kode dan amati output console.',
    };
  }

  async reviewCode(req: ReviewRequest): Promise<ReviewResponse> {
    const hasCode = req.code.trim().length > 0;
    return {
      passed: hasCode,
      feedback: hasCode
        ? 'Kode berhasil ditulis dan siap dievaluasi pada runner.'
        : 'Kode masih kosong. Tuliskan implementasi kodemu sebelum review.',
      citations: [req.lessonId],
    };
  }
}
