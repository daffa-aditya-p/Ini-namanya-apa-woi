import { z } from 'zod';

export const LessonFrontmatterSchema = z.object({
  id: z.string(),
  track: z.enum(['javascript', 'python']),
  level: z.string(), // e.g. 'J1', 'P1'
  title: z.string(),
  slug: z.string().optional(),
  estimatedMinutes: z.number().int().positive(),
  prerequisites: z.array(z.string()),
  learningObjectives: z.array(z.string()),
  relatedConcepts: z.array(z.string()),
  languageVersion: z.string(), // e.g. 'ES2024', 'Python 3.12'
  summary: z.string(),
});

export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>;

export const CodeSnippetSchema = z.object({
  code: z.string(),
  language: z.enum(['javascript', 'python']),
  expectedOutput: z.string().optional(),
  description: z.string().optional(),
});

export type CodeSnippet = z.infer<typeof CodeSnippetSchema>;
