import type { Skill } from '../lib/engine/types';

/**
 * Catálogo de habilidades del motor adaptativo.
 *
 * Una habilidad es algo concreto y comprobable —"poner el verbo en segunda
 * posición", "elegir der/die/das"— y es INDEPENDIENTE de las lecciones: una
 * lección puede enseñar varias y una habilidad puede aparecer en varias
 * lecciones. Esa relación N:N es lo que permite que fallar el orden de
 * palabras en la lección de saludos cuente para lo mismo que fallarlo en la de
 * la hora.
 *
 * Los ids llevan el idioma meta delante (`de.a1.verb.sein`): el repo enseña
 * cinco idiomas desde español, y sin ese prefijo el `a1.verb.sein` alemán y su
 * equivalente inglés compartirían espacio de nombres en el mismo localStorage.
 *
 * Esta primera tanda cubre A1 de alemán, que es el curso con más contenido
 * (29 lecciones, 707 ítems de práctica). El esquema ya sirve para el resto:
 * agregar A2 o francés es agregar entradas acá, sin tocar el motor.
 *
 * `difficulty` (1-5) es la dificultad intrínseca del tema, no la del alumno:
 * el motor ajusta la suya aparte, en `difficulty.ts`.
 */
export const SKILLS: Skill[] = [
  // ── Pronunciación (unidad 1) ────────────────────────────────────────────
  {
    id: 'de.a1.pron.umlaute',
    lang: 'de',
    level: 'a1',
    category: 'pronunciation',
    name: 'Los Umlaute (ä, ö, ü)',
    prerequisites: [],
    difficulty: 2,
  },
  {
    id: 'de.a1.pron.diptongos',
    lang: 'de',
    level: 'a1',
    category: 'pronunciation',
    name: 'Diptongos (ei, ie, eu, au)',
    prerequisites: [],
    difficulty: 2,
  },
  {
    id: 'de.a1.pron.consonantes',
    lang: 'de',
    level: 'a1',
    category: 'pronunciation',
    name: 'sch, ch, ck, st, sp',
    prerequisites: [],
    difficulty: 3,
  },

  // ── Primeras frases (unidad 1) ──────────────────────────────────────────
  {
    id: 'de.a1.introduction.name',
    lang: 'de',
    level: 'a1',
    category: 'vocabulary',
    name: 'Decir cómo te llamás',
    prerequisites: [],
    difficulty: 1,
  },
  {
    id: 'de.a1.introduction.origin',
    lang: 'de',
    level: 'a1',
    category: 'vocabulary',
    name: 'Decir de dónde sos',
    prerequisites: ['de.a1.introduction.name'],
    difficulty: 1,
  },
  {
    id: 'de.a1.question.words',
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: 'Palabras interrogativas (W-Fragen)',
    prerequisites: ['de.a1.introduction.name'],
    difficulty: 2,
  },

  // ── Bases gramaticales (unidad 2) ───────────────────────────────────────
  {
    id: 'de.a1.article.der-die-das',
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: 'Artículos der / die / das',
    prerequisites: [],
    difficulty: 3,
  },
  {
    id: 'de.a1.verb.present-regular',
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: 'Presente de verbos regulares',
    prerequisites: [],
    difficulty: 2,
  },
  {
    id: 'de.a1.verb.present-irregular',
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: 'Verbos con cambio de vocal',
    prerequisites: ['de.a1.verb.present-regular'],
    difficulty: 4,
  },
  {
    id: 'de.a1.vocabulary.numbers',
    lang: 'de',
    level: 'a1',
    category: 'vocabulary',
    name: 'Números (0-100)',
    prerequisites: [],
    difficulty: 1,
  },
  {
    id: 'de.a1.vocabulary.time',
    lang: 'de',
    level: 'a1',
    category: 'vocabulary',
    name: 'Decir la hora',
    prerequisites: ['de.a1.vocabulary.numbers'],
    difficulty: 3,
  },

  // ── Orden de palabras: el tema estrella del documento ───────────────────
  {
    id: 'de.a1.wordorder.basic',
    lang: 'de',
    level: 'a1',
    category: 'word_order',
    name: 'El verbo en segunda posición',
    prerequisites: ['de.a1.verb.present-regular'],
    difficulty: 3,
  },
  {
    id: 'de.a1.wordorder.time-verb-subject',
    lang: 'de',
    level: 'a1',
    category: 'word_order',
    name: 'Empezar por el tiempo (Heute trinke ich…)',
    prerequisites: ['de.a1.wordorder.basic'],
    difficulty: 4,
  },
  {
    id: 'de.a1.wordorder.questions',
    lang: 'de',
    level: 'a1',
    category: 'word_order',
    name: 'Orden en las preguntas',
    prerequisites: ['de.a1.wordorder.basic', 'de.a1.question.words'],
    difficulty: 3,
  },

  // ── Mi mundo (unidad 3) ─────────────────────────────────────────────────
  {
    id: 'de.a1.verb.sein',
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: 'El verbo sein',
    prerequisites: [],
    difficulty: 2,
  },
  {
    id: 'de.a1.verb.haben',
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: 'El verbo haben',
    prerequisites: [],
    difficulty: 2,
  },
  {
    id: 'de.a1.pronoun.personal',
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: 'Pronombres personales',
    prerequisites: [],
    difficulty: 2,
  },
  {
    id: 'de.a1.negation.nicht-kein',
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: 'Negar con nicht y kein',
    prerequisites: ['de.a1.article.der-die-das'],
    difficulty: 4,
  },
  {
    id: 'de.a1.noun.plural',
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: 'Formar el plural',
    prerequisites: ['de.a1.article.der-die-das'],
    difficulty: 4,
  },
  {
    id: 'de.a1.verb.imperative',
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: 'El imperativo',
    prerequisites: ['de.a1.verb.present-regular'],
    difficulty: 3,
  },
  {
    id: 'de.a1.vocabulary.family',
    lang: 'de',
    level: 'a1',
    category: 'vocabulary',
    name: 'La familia',
    prerequisites: [],
    difficulty: 1,
  },
  {
    id: 'de.a1.vocabulary.food',
    lang: 'de',
    level: 'a1',
    category: 'vocabulary',
    name: 'Comida y bebida',
    prerequisites: [],
    difficulty: 1,
  },

  // ── Día a día (unidad 4) ────────────────────────────────────────────────
  {
    id: 'de.a1.vocabulary.home',
    lang: 'de',
    level: 'a1',
    category: 'vocabulary',
    name: 'La casa',
    prerequisites: [],
    difficulty: 1,
  },
  {
    id: 'de.a1.vocabulary.work',
    lang: 'de',
    level: 'a1',
    category: 'vocabulary',
    name: 'Trabajo y profesiones',
    prerequisites: [],
    difficulty: 2,
  },
  {
    id: 'de.a1.vocabulary.shopping',
    lang: 'de',
    level: 'a1',
    category: 'vocabulary',
    name: 'Compras',
    prerequisites: ['de.a1.vocabulary.numbers'],
    difficulty: 2,
  },
  {
    id: 'de.a1.writing.about-me',
    lang: 'de',
    level: 'a1',
    category: 'writing',
    name: 'Escribir sobre vos',
    prerequisites: ['de.a1.verb.sein', 'de.a1.verb.haben'],
    difficulty: 3,
  },

  // ── Fuera de casa (unidad 5) ────────────────────────────────────────────
  {
    id: 'de.a1.vocabulary.restaurant',
    lang: 'de',
    level: 'a1',
    category: 'vocabulary',
    name: 'En el restaurante',
    prerequisites: ['de.a1.vocabulary.food'],
    difficulty: 2,
  },
  {
    id: 'de.a1.vocabulary.transport',
    lang: 'de',
    level: 'a1',
    category: 'vocabulary',
    name: 'Transporte y orientación',
    prerequisites: [],
    difficulty: 2,
  },
  {
    id: 'de.a1.vocabulary.freetime',
    lang: 'de',
    level: 'a1',
    category: 'vocabulary',
    name: 'Gustos y tiempo libre',
    prerequisites: [],
    difficulty: 2,
  },
  {
    id: 'de.a1.vocabulary.animals',
    lang: 'de',
    level: 'a1',
    category: 'vocabulary',
    name: 'Animales',
    prerequisites: [],
    difficulty: 1,
  },

  // ── Preposiciones (unidad 6) ────────────────────────────────────────────
  {
    id: 'de.a1.preposition.place-time',
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: 'Preposiciones de lugar y tiempo',
    prerequisites: ['de.a1.article.der-die-das'],
    difficulty: 4,
  },
];

export const SKILL_MAP: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

export function skillsFor(lang: string, level?: string): Skill[] {
  return SKILLS.filter((s) => s.lang === lang && (!level || s.level === level));
}
