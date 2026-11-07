import { z } from 'zod';

export const LessonProgressSchema = z.object({
  lessonId: z.string(),
  completed: z.boolean(),
  score: z.number().min(0).max(100),
  lastAttemptAt: z.string(),
  masteryLevel: z.number().min(0).max(1),
  attemptsCount: z.number().int().nonnegative(),
});

export type LessonProgress = z.infer<typeof LessonProgressSchema>;

export const StreakInfoSchema = z.object({
  currentStreak: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
  lastActiveDate: z.string(),
});

export type StreakInfo = z.infer<typeof StreakInfoSchema>;

export interface ProgressService {
  getProgress(lessonId: string): Promise<LessonProgress | null>;
  saveProgress(progress: LessonProgress): Promise<void>;
  getMasteryMap(): Promise<Record<string, number>>;
  updateStreak(): Promise<StreakInfo>;
}

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  isGuest: z.boolean(),
});

export type User = z.infer<typeof UserSchema>;

export interface AuthService {
  getCurrentUser(): Promise<User | null>;
  login(provider: string): Promise<void>;
  logout(): Promise<void>;
}

export const TutorRequestSchema = z.object({
  lessonId: z.string(),
  userCode: z.string(),
  errorMessage: z.string().optional(),
  prompt: z.string(),
  hintStage: z.number().min(1).max(4).optional(),
});

export type TutorRequest = z.infer<typeof TutorRequestSchema>;

export const TutorResponseSchema = z.object({
  hint: z.string(),
  citations: z.array(z.string()),
  suggestedAction: z.string().optional(),
  hintStage: z.number().min(1).max(4).optional(),
  stageTitle: z.string().optional(),
});

export type TutorResponse = z.infer<typeof TutorResponseSchema>;

export const ReviewRequestSchema = z.object({
  lessonId: z.string(),
  code: z.string(),
});

export type ReviewRequest = z.infer<typeof ReviewRequestSchema>;

export const ReviewResponseSchema = z.object({
  passed: z.boolean(),
  feedback: z.string(),
  citations: z.array(z.string()),
});

export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;

export interface AIGateway {
  mode: 'mock' | 'local' | 'remote';
  generateSocraticHint(req: TutorRequest): Promise<TutorResponse>;
  reviewCode(req: ReviewRequest): Promise<ReviewResponse>;
}
