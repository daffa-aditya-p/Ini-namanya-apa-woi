import { defineCollection } from 'astro:content';
import { LessonFrontmatterSchema } from '../schemas/curriculum';

const curriculumCollection = defineCollection({
  type: 'content',
  schema: LessonFrontmatterSchema,
});

export const collections = {
  curriculum: curriculumCollection,
};
