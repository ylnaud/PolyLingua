import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { AUTHOR } from './data/author';

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

const vocabularyItem = z.object({
  term: z.string(),
  translation: z.string(),
});

// Frase completa lista para usar, no una palabra suelta — es la unidad del
// modo "situaciones" (aprender por frases y contextos reales en vez de por
// reglas aisladas). Ver src/components/PhraseBank.astro.
const situationPhrase = z.object({
  // `text` es la frase/palabra en el idioma que se está aprendiendo (alemán,
  // inglés, etc.) y `es` su traducción al español, que es siempre el idioma
  // de la interfaz.
  text: z.string(),
  es: z.string(),
  // Cómo suena: aproximación a la española + AFI. Es el dato principal en las
  // lecciones de pronunciación, así que tiene campo propio en vez de ir
  // escondido en `note`, que se renderiza chico y gris.
  say: z.string().optional(),
  note: z.string().optional(),
});

const dialogueLine = z.object({
  speaker: z.string(),
  text: z.string(),
  es: z.string(),
});

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lessons' }),
  schema: z.object({
    language: z.enum(['de', 'en', 'es', 'fr', 'it', 'pt']),
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
    vocabulary: z.array(vocabularyItem).default([]),
    // Ambos opcionales: marcan una lección como parte del modo "situaciones"
    // (contenido 80/20 organizado por contexto real, no por tema gramatical).
    // Al ser opcionales, las lecciones existentes siguen validando sin cambios.
    situation: z.string().optional(),
    phrases: z.array(situationPhrase).default([]),
    // Habilidades del motor adaptativo que enseña esta lección (ver
    // src/data/skills.ts). La relación es N:N a propósito: una lección puede
    // enseñar varias y una habilidad aparece en varias lecciones, que es lo
    // que permite que fallar el orden de palabras en la lección de saludos
    // cuente para lo mismo que fallarlo en la de la hora.
    //
    // Opcional: sin esto, las 478 lecciones que ya existen dejarían de
    // validar de golpe. Una lección sin `skills` simplemente no alimenta al
    // motor todavía.
    skills: z.array(z.string()).default([]),
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
    // Con `default`, no `optional`: un post sin firma no debe existir. Hoy los
    // escribe una sola persona, así que el valor por defecto es el correcto en
    // todos; el campo está para poder firmar distinto sin tocar el layout si
    // algún día escribe alguien más. El nombre sale de src/data/author.ts, que
    // es la misma fuente que usan /acerca y el JSON-LD.
    author: z.string().default(AUTHOR.name),
  }),
});

const dialogos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/dialogos' }),
  schema: z.object({
    language: z.enum(['de', 'en', 'fr', 'it', 'pt']),
    level: z.enum(['a1', 'a2', 'b1', 'b2', 'c1', 'c2']),
    title: z.string(),
    description: z.string(),
    order: z.number(),
    situation: z.string(),
    dialogue: z.array(dialogueLine).min(2).max(6),
    anatomy: z.array(z.string()).min(1).max(3),
    vocabulary: z.array(vocabularyItem).default([]),
    minutes: z.number().default(5),
  }),
});

export const collections = { lessons, blog, dialogos };
