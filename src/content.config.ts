import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const quizQuestion = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  answerIndex: z.number().int().min(0),
  explanation: z.string(),
});

const fillBlankExercise = z.object({
  type: z.literal('fill-blank'),
  sentence: z.string(),
  answer: z.string(),
  accepted: z.array(z.string()).optional(),
  hint: z.string().optional(),
  translation: z.string().optional(),
});

const matchExercise = z.object({
  type: z.literal('match'),
  instructions: z.string().optional(),
  pairs: z
    .array(z.object({ left: z.string(), right: z.string() }))
    .min(3),
});

const writeExercise = z.object({
  type: z.literal('write'),
  prompt: z.string(),
  answer: z.string(),
  accepted: z.array(z.string()).optional(),
  hint: z.string().optional(),
  spokenOnly: z.boolean().optional(),
});

const orderExercise = z.object({
  type: z.literal('order'),
  sentence: z.string(),
  translation: z.string().optional(),
});

const exercise = z.discriminatedUnion('type', [
  fillBlankExercise,
  matchExercise,
  writeExercise,
  orderExercise,
]);

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lessons' }),
  schema: z.object({
    language: z.enum(['de', 'en', 'fr', 'it', 'pt']),
    level: z.enum(['a1', 'a2', 'b1', 'b2', 'c1', 'c2']),
    title: z.string(),
    description: z.string(),
    order: z.number(),
    grammarTopic: z.string(),
    funFact: z.string(),
    minutes: z.number().default(8),
    quiz: z.array(quizQuestion).default([]),
    exercises: z.array(exercise).default([]),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    updatedDate: z.date().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { lessons, blog };
