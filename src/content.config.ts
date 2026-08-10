import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const quizQuestion = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  answerIndex: z.number().int().min(0),
  explanation: z.string(),
});

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lessons' }),
  schema: z.object({
    level: z.enum(['a1', 'a2', 'b1', 'b2', 'c1', 'c2']),
    title: z.string(),
    description: z.string(),
    order: z.number(),
    grammarTopic: z.string(),
    funFact: z.string(),
    minutes: z.number().default(8),
    quiz: z.array(quizQuestion).default([]),
  }),
});

export const collections = { lessons };
