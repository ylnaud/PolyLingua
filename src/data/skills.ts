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
 * Cubre A1 y A2 de alemán, que es el curso con más contenido. El esquema ya
 * sirve para el resto: agregar B1 o francés es agregar entradas acá, sin tocar
 * el motor ni las páginas — `/practicar` se genera sola para cualquier curso
 * que tenga habilidades definidas.
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
  // Un género por habilidad, además de la general de arriba. Es lo que hace
  // que fallar el femenino traiga más femenino y no una mezcla de los tres:
  // con una sola habilidad "artículos", el refuerzo no puede apuntar.
  {
    id: 'de.a1.article.der',
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: 'Artículo der (masculino)',
    prerequisites: ['de.a1.article.der-die-das'],
    difficulty: 3,
  },
  {
    id: 'de.a1.article.die',
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: 'Artículo die (femenino)',
    prerequisites: ['de.a1.article.der-die-das'],
    difficulty: 3,
  },
  {
    id: 'de.a1.article.das',
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: 'Artículo das (neutro)',
    prerequisites: ['de.a1.article.der-die-das'],
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

  // ══ A2 ═══════════════════════════════════════════════════════════════════
  //
  // Los prerrequisitos apuntan a A1 a propósito: `/practicar` es del CURSO, no
  // del nivel, así que A1 y A2 comparten rotación. Sin ellos, el scheduler le
  // propondría el Dativ a alguien que todavía no tiene los artículos.

  // ── Tiempos y modales (unidad 1) ────────────────────────────────────────
  {
    id: 'de.a2.verb.perfekt',
    lang: 'de',
    level: 'a2',
    category: 'grammar',
    name: 'Perfekt: elegir haben o sein',
    prerequisites: ['de.a1.verb.haben', 'de.a1.verb.sein'],
    difficulty: 4,
  },
  {
    // Separada de la anterior porque son dos fallos distintos: equivocarse de
    // auxiliar no es lo mismo que formar mal el participio, y se practican con
    // ejercicios distintos.
    id: 'de.a2.verb.participle',
    lang: 'de',
    level: 'a2',
    category: 'grammar',
    name: 'Formar el participio (ge-…-t / ge-…-en)',
    prerequisites: ['de.a1.verb.present-regular'],
    difficulty: 4,
  },
  {
    id: 'de.a2.verb.modal',
    lang: 'de',
    level: 'a2',
    category: 'grammar',
    name: 'Verbos modales (können, müssen, wollen…)',
    prerequisites: ['de.a1.verb.present-irregular'],
    difficulty: 3,
  },
  {
    id: 'de.a2.wordorder.verb-final',
    lang: 'de',
    level: 'a2',
    category: 'word_order',
    name: 'El segundo verbo, al final de la frase',
    prerequisites: ['de.a1.wordorder.basic'],
    difficulty: 4,
  },
  {
    id: 'de.a2.verb.separable',
    lang: 'de',
    level: 'a2',
    category: 'grammar',
    name: 'Verbos separables (trennbare Verben)',
    prerequisites: ['de.a1.verb.present-regular'],
    difficulty: 4,
  },
  {
    id: 'de.a2.adjective.comparative',
    lang: 'de',
    level: 'a2',
    category: 'grammar',
    name: 'Comparativo y superlativo',
    prerequisites: [],
    difficulty: 3,
  },

  // ── Los casos (unidad 2) ────────────────────────────────────────────────
  {
    id: 'de.a2.case.akkusativ',
    lang: 'de',
    level: 'a2',
    category: 'grammar',
    name: 'Akkusativ: el objeto directo',
    prerequisites: ['de.a1.article.der-die-das'],
    difficulty: 4,
  },
  {
    id: 'de.a2.case.dativ',
    lang: 'de',
    level: 'a2',
    category: 'grammar',
    name: 'Dativ: a quién le llega la acción',
    prerequisites: ['de.a2.case.akkusativ'],
    difficulty: 5,
  },
  {
    id: 'de.a2.preposition.fixed',
    lang: 'de',
    level: 'a2',
    category: 'grammar',
    name: 'Preposiciones fijas de Akkusativ y Dativ',
    prerequisites: ['de.a2.case.akkusativ'],
    difficulty: 4,
  },
  {
    id: 'de.a2.preposition.wechsel',
    lang: 'de',
    level: 'a2',
    category: 'grammar',
    name: 'Wechselpräpositionen: movimiento o posición',
    prerequisites: ['de.a2.case.dativ'],
    difficulty: 5,
  },
  {
    id: 'de.a2.verb.reflexive',
    lang: 'de',
    level: 'a2',
    category: 'grammar',
    name: 'Verbos reflexivos (sich + verbo)',
    prerequisites: ['de.a1.pronoun.personal'],
    difficulty: 3,
  },
  {
    id: 'de.a2.vocabulary.freetime',
    lang: 'de',
    level: 'a2',
    category: 'vocabulary',
    name: 'Tiempo libre y hobbies',
    prerequisites: [],
    difficulty: 1,
  },

  // ── Pronombres y tiempo (unidad 3) ──────────────────────────────────────
  {
    id: 'de.a2.pronoun.akkusativ',
    lang: 'de',
    level: 'a2',
    category: 'grammar',
    name: 'Pronombres en Akkusativ (mich, dich, ihn…)',
    prerequisites: ['de.a1.pronoun.personal', 'de.a2.case.akkusativ'],
    difficulty: 3,
  },
  {
    id: 'de.a2.pronoun.possessive',
    lang: 'de',
    level: 'a2',
    category: 'grammar',
    name: 'Posesivos (mein, dein, sein…)',
    prerequisites: ['de.a1.article.der-die-das'],
    difficulty: 4,
  },
  {
    id: 'de.a2.time.past-future',
    lang: 'de',
    level: 'a2',
    category: 'grammar',
    name: 'Hablar del pasado y del futuro',
    prerequisites: ['de.a2.verb.perfekt'],
    difficulty: 3,
  },

  // ── Situaciones cotidianas (unidad 4) ───────────────────────────────────
  {
    id: 'de.a2.vocabulary.phone',
    lang: 'de',
    level: 'a2',
    category: 'vocabulary',
    name: 'Hablar por teléfono',
    prerequisites: [],
    difficulty: 2,
  },
  {
    id: 'de.a2.vocabulary.health',
    lang: 'de',
    level: 'a2',
    category: 'vocabulary',
    name: 'Salud y médico',
    prerequisites: [],
    difficulty: 2,
  },
  {
    id: 'de.a2.vocabulary.money',
    lang: 'de',
    level: 'a2',
    category: 'vocabulary',
    name: 'Dinero y pagos',
    prerequisites: [],
    difficulty: 2,
  },
  {
    id: 'de.a2.vocabulary.problems',
    lang: 'de',
    level: 'a2',
    category: 'vocabulary',
    name: 'Problemas cotidianos',
    prerequisites: [],
    difficulty: 2,
  },
  {
    id: 'de.a2.vocabulary.plans',
    lang: 'de',
    level: 'a2',
    category: 'vocabulary',
    name: 'Hacer planes: invitar, aceptar, cancelar',
    prerequisites: [],
    difficulty: 2,
  },

  // ══ B1 ═══════════════════════════════════════════════════════════════════

  // ── Subordinadas y pasado narrativo (unidad 1) ──────────────────────────
  {
    // La habilidad transversal del nivel: casi todo B1 pasa por mandar el
    // verbo al final. Por eso la comparten cuatro lecciones — es exactamente
    // el caso que justifica que la relación lección↔habilidad sea N:N.
    id: 'de.b1.wordorder.subordinate',
    lang: 'de',
    level: 'b1',
    category: 'word_order',
    name: 'El verbo al final en la subordinada',
    prerequisites: ['de.a2.wordorder.verb-final'],
    difficulty: 4,
  },
  {
    id: 'de.b1.conjunction.subordinating',
    lang: 'de',
    level: 'b1',
    category: 'grammar',
    name: 'Elegir la conjunción (weil, dass, obwohl, wenn)',
    prerequisites: ['de.a2.wordorder.verb-final'],
    difficulty: 3,
  },
  {
    id: 'de.b1.verb.praeteritum',
    lang: 'de',
    level: 'b1',
    category: 'grammar',
    name: 'Präteritum: el pasado narrativo',
    prerequisites: ['de.a2.verb.perfekt'],
    difficulty: 4,
  },
  {
    id: 'de.b1.clause.relative',
    lang: 'de',
    level: 'b1',
    category: 'grammar',
    name: 'Oraciones de relativo (der, die, das)',
    prerequisites: ['de.b1.wordorder.subordinate', 'de.a2.case.dativ'],
    difficulty: 5,
  },
  {
    id: 'de.b1.clause.indirect-question',
    lang: 'de',
    level: 'b1',
    category: 'grammar',
    name: 'Preguntas indirectas (ob, W-Wort)',
    prerequisites: ['de.b1.wordorder.subordinate'],
    difficulty: 4,
  },

  // ── Casos avanzados y adjetivo (unidad 2) ───────────────────────────────
  {
    id: 'de.b1.clause.final',
    lang: 'de',
    level: 'b1',
    category: 'grammar',
    name: 'Oraciones finales (um…zu, damit)',
    prerequisites: ['de.b1.wordorder.subordinate'],
    difficulty: 4,
  },
  {
    id: 'de.b1.case.genitiv',
    lang: 'de',
    level: 'b1',
    category: 'grammar',
    name: 'Genitiv: la posesión formal',
    prerequisites: ['de.a2.case.dativ'],
    difficulty: 4,
  },
  {
    id: 'de.b1.adjective.declension',
    lang: 'de',
    level: 'b1',
    category: 'grammar',
    name: 'Declinación del adjetivo',
    prerequisites: ['de.a2.case.dativ', 'de.a2.pronoun.possessive'],
    difficulty: 5,
  },
  {
    id: 'de.b1.vocabulary.work',
    lang: 'de',
    level: 'b1',
    category: 'vocabulary',
    name: 'Trabajo y profesión',
    prerequisites: [],
    difficulty: 2,
  },

  // ── Reclamos y Konjunktiv II (unidad 3) ─────────────────────────────────
  {
    id: 'de.b1.verb.konjunktiv2',
    lang: 'de',
    level: 'b1',
    category: 'grammar',
    name: 'Konjunktiv II de cortesía (wäre, hätte, könnte)',
    prerequisites: ['de.a2.verb.modal'],
    difficulty: 4,
  },
  {
    id: 'de.b1.verb.konjunktiv2-wuerde',
    lang: 'de',
    level: 'b1',
    category: 'grammar',
    name: 'Konjunktiv II con würde + infinitivo',
    prerequisites: ['de.b1.verb.konjunktiv2'],
    difficulty: 4,
  },
  {
    id: 'de.b1.verb.perfekt-zustand',
    lang: 'de',
    level: 'b1',
    category: 'grammar',
    name: 'Acción (Perfekt) frente a estado (sein + participio)',
    prerequisites: ['de.a2.verb.perfekt'],
    difficulty: 4,
  },
  {
    id: 'de.b1.vocabulary.complaints',
    lang: 'de',
    level: 'b1',
    category: 'vocabulary',
    name: 'Reclamar y pedir una solución',
    prerequisites: [],
    difficulty: 3,
  },

  // ── Preposiciones (unidad 4) ────────────────────────────────────────────
  {
    id: 'de.b1.verb.with-preposition',
    lang: 'de',
    level: 'b1',
    category: 'grammar',
    name: 'Verbos con preposición fija (warten auf, denken an…)',
    prerequisites: ['de.a2.preposition.fixed'],
    difficulty: 5,
  },
];

export const SKILL_MAP: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

export function skillsFor(lang: string, level?: string): Skill[] {
  return SKILLS.filter((s) => s.lang === lang && (!level || s.level === level));
}
