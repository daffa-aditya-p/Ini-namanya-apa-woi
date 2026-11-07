import Dexie, { type Table } from 'dexie';
import type {
  ProgressService,
  LessonProgress,
  ConceptMasteryRecord,
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
  bktMastery!: Table<ConceptMasteryRecord, string>;

  constructor() {
    super('belajar_in_db');
    this.version(1).stores({
      progress: 'lessonId, completed, score, lastAttemptAt',
      metadata: 'key',
    });
    this.version(2).stores({
      progress: 'lessonId, completed, score, lastAttemptAt',
      metadata: 'key',
      bktMastery: 'conceptId, pL, isMastered, lastUpdated',
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
        const bktRecords = await this.db.bktMastery.toArray();
        for (const item of bktRecords) {
          map[item.conceptId] = item.pL;
        }
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
  mode: 'mock' | 'local' | 'remote' = 'mock';

  async generateSocraticHint(req: TutorRequest): Promise<TutorResponse> {
    const stage = req.hintStage || 1;
    const isPython = req.lessonId.toLowerCase().includes('p');
    const docRef = isPython
      ? 'Python 3.12 Documentation (docs.python.org)'
      : 'MDN Web Docs (developer.mozilla.org) & ECMA-262';

    if (req.errorMessage) {
      return {
        hint: `Perhatikan pesan kesalahan: "${req.errorMessage}". Coba telusuri variabel atau sintaks pada baris sebelum error terjadi. Apakah tipe datanya sudah sesuai yang diharapkan?`,
        citations: [req.lessonId, docRef],
        suggestedAction: 'Cek nama variabel dan tipe datanya.',
        hintStage: stage,
        stageTitle: 'Diagnostik Galat Runtime',
      };
    }

    switch (stage) {
      case 1:
        return {
          hint: `Tahap 1 (Orientasi Konsep): Perhatikan apa tujuan akhir dari latihan ini. Konsep dasar apa yang ingin dicapai (misalnya transformasi data, mutasi, atau agregasi nilai)?`,
          citations: [req.lessonId, docRef],
          suggestedAction: 'Identifikasi input yang masuk dan bentuk output yang diminta.',
          hintStage: 1,
          stageTitle: 'Tahap 1: Orientasi Konsep',
        };
      case 2:
        return {
          hint: `Tahap 2 (Identifikasi Komponen): Amati variabel atau parameter yang tersedia. Struktur data mana yang memegang nilai awal, dan method apa yang cocok untuk memprosesnya?`,
          citations: [req.lessonId, docRef],
          suggestedAction: 'Periksa variabel koleksi atau parameter fungsi.',
          hintStage: 2,
          stageTitle: 'Tahap 2: Komponen & Variabel Kunci',
        };
      case 3:
        return {
          hint: `Tahap 3 (Kerangka Logika): Susun langkahnya secara pseudocode: 1. Ambil data, 2. Filter atau transformasikan elemen satu per satu, 3. Kembalikan akumulasi hasil atau struktur baru.`,
          citations: [req.lessonId, docRef],
          suggestedAction: 'Tulis alur pemikiran dalam komentar sebelum menulis kode sesungguhnya.',
          hintStage: 3,
          stageTitle: 'Tahap 3: Kerangka Logika & Pseudocode',
        };
      case 4:
      default:
        return {
          hint: `Tahap 4 (Sintaks & Pola Solusi): Terapkan method bawaan yang sesuai (misal: \`.map()\` / \`.reduce()\` di JS atau list comprehension / \`with open()\` di Python). Pastikan ada klausa return untuk mengembalikan hasil.`,
          citations: [req.lessonId, docRef],
          suggestedAction: 'Lengkapi pemanggilan method dengan callback atau context manager yang tepat.',
          hintStage: 4,
          stageTitle: 'Tahap 4: Sintaks Spesifik & Pola Solusi',
        };
    }
  }

  async reviewCode(req: ReviewRequest): Promise<ReviewResponse> {
    const hasCode = req.code.trim().length > 0;
    const isPython = req.lessonId.toLowerCase().includes('p');
    const docRef = isPython ? 'PEP 8 & Python Data Model' : 'ECMAScript 2024 Specification';
    return {
      passed: hasCode,
      feedback: hasCode
        ? 'Kode berhasil ditulis dan siap dievaluasi pada runner terisolasi.'
        : 'Kode masih kosong. Tuliskan implementasi kodemu sebelum review.',
      citations: [req.lessonId, docRef],
    };
  }
}
