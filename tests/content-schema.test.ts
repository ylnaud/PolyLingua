import { describe, it, expect } from 'vitest';
import { z } from 'zod';

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
  placeholder: z.string().optional(),
});

const matchExercise = z.object({
  type: z.literal('match'),
  instructions: z.string().optional(),
  pairs: z.array(z.object({ left: z.string(), right: z.string() })).min(3),
});

const writeExercise = z.object({
  type: z.literal('write'),
  prompt: z.string(),
  answer: z.string(),
  accepted: z.array(z.string()).optional(),
  hint: z.string().optional(),
  spokenOnly: z.boolean().optional(),
  placeholder: z.string().optional(),
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

const lessonSchema = z.object({
  language: z.enum(['de', 'en', 'fr', 'it', 'pt']),
  level: z.enum(['a1', 'a2', 'b1', 'b2', 'c1', 'c2']),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  grammarTopic: z.string(),
  funFact: z.string(),
  minutes: z.number().default(8),
  unit: z.number().int().min(1).optional(),
  quiz: z.array(quizQuestion).default([]),
  exercises: z.array(exercise).default([]),
});

const validLesson = {
  language: 'de',
  level: 'a1',
  title: 'Test Lesson',
  description: 'A test lesson for validation',
  order: 1,
  grammarTopic: 'Test grammar',
  funFact: 'Fun fact here',
  minutes: 7,
  quiz: [
    {
      question: 'What is 1+1?',
      options: ['1', '2', '3'],
      answerIndex: 1,
      explanation: 'Basic math',
    },
  ],
  exercises: [
    {
      type: 'fill-blank' as const,
      sentence: 'Ich ___ ein Buch.',
      answer: 'lese',
    },
    {
      type: 'match' as const,
      pairs: [
        { left: 'Hund', right: 'perro' },
        { left: 'Katze', right: 'gato' },
        { left: 'Vogel', right: 'pájaro' },
      ],
    },
    {
      type: 'order' as const,
      sentence: 'Ich lese ein Buch',
    },
    {
      type: 'write' as const,
      prompt: 'Translate: the dog',
      answer: 'der Hund',
    },
  ],
};

describe('lesson schema', () => {
  it('accepts valid frontmatter', () => {
    const result = lessonSchema.safeParse(validLesson);
    expect(result.success).toBe(true);
  });

  it('applies default for minutes when omitted', () => {
    const { minutes: _, ...withoutMinutes } = validLesson;
    const result = lessonSchema.parse(withoutMinutes);
    expect(result.minutes).toBe(8);
  });

  it('applies default empty arrays when quiz/exercises omitted', () => {
    const { quiz: _q, exercises: _e, ...minimal } = validLesson;
    const result = lessonSchema.parse(minimal);
    expect(result.quiz).toEqual([]);
    expect(result.exercises).toEqual([]);
  });

  it('rejects missing language', () => {
    const { language: _, ...noLang } = validLesson;
    expect(lessonSchema.safeParse(noLang).success).toBe(false);
  });

  it('rejects invalid level', () => {
    expect(lessonSchema.safeParse({ ...validLesson, level: 'z9' }).success).toBe(false);
  });

  it('rejects invalid language', () => {
    expect(lessonSchema.safeParse({ ...validLesson, language: 'xx' }).success).toBe(false);
  });

  it('rejects negative answerIndex in quiz', () => {
    const bad = {
      ...validLesson,
      quiz: [{ ...validLesson.quiz[0], answerIndex: -1 }],
    };
    expect(lessonSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects quiz with fewer than 2 options', () => {
    const bad = {
      ...validLesson,
      quiz: [{ ...validLesson.quiz[0], options: ['only one'] }],
    };
    expect(lessonSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects match exercise with fewer than 3 pairs', () => {
    const bad = {
      ...validLesson,
      exercises: [
        {
          type: 'match' as const,
          pairs: [
            { left: 'a', right: 'b' },
            { left: 'c', right: 'd' },
          ],
        },
      ],
    };
    expect(lessonSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects fill-blank exercise without sentence', () => {
    const bad = {
      ...validLesson,
      exercises: [{ type: 'fill-blank' as const, answer: 'lese' }],
    };
    expect(lessonSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects write exercise without prompt', () => {
    const bad = {
      ...validLesson,
      exercises: [{ type: 'write' as const, answer: 'der Hund' }],
    };
    expect(lessonSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects unknown exercise type', () => {
    const bad = {
      ...validLesson,
      exercises: [{ type: 'unknown', data: 'test' }],
    };
    expect(lessonSchema.safeParse(bad).success).toBe(false);
  });
});
