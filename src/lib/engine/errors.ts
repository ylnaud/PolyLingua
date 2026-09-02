/**
 * Qué falló exactamente, y cuánto insiste el alumno en fallarlo.
 *
 * El registro de errores que ya existía (`polylingua-error-log`) guarda "esta
 * pregunta la fallaste", con la respuesta dada y la correcta. Eso sirve para
 * listar errores, pero no para actuar: el motor necesita saber que el fallo
 * fue de ORDEN DE PALABRAS, no de vocabulario, porque el refuerzo es distinto.
 *
 * Este archivo compara las dos cadenas y deduce el patrón. Es heurístico a
 * propósito: sin análisis sintáctico no se puede tener certeza, pero para
 * decidir qué practicar después alcanza con acertar el tipo la mayoría de las
 * veces. Cuando no hay señal clara cae en `vocabulary`, que es el cajón
 * neutro.
 */

import type { ErrorSeverity, ErrorType, LearnerError, SkillCategory } from './types';

/** Palabras funcionales por familia, para los idiomas que enseña el sitio. */
const ARTICLES = new Set([
  // alemán
  'der',
  'die',
  'das',
  'den',
  'dem',
  'des',
  'ein',
  'eine',
  'einen',
  'einem',
  'einer',
  'eines',
  'kein',
  'keine',
  'keinen',
  // español
  'el',
  'la',
  'los',
  'las',
  'un',
  'una',
  'unos',
  'unas',
  'lo',
  'al',
  'del',
  // inglés
  'the',
  'a',
  'an',
  // francés
  'le',
  'les',
  'une',
  'des',
  'du',
  'au',
  'aux',
  // italiano
  'il',
  'lo',
  'gli',
  'uno',
  'della',
  'dello',
  'delle',
  'dei',
  'degli',
  // portugués
  'o',
  'os',
  'as',
  'um',
  'uma',
  'uns',
  'umas',
  'da',
  'do',
  'dos',
  'das',
]);

const PREPOSITIONS = new Set([
  // alemán
  'in',
  'auf',
  'an',
  'mit',
  'zu',
  'von',
  'bei',
  'nach',
  'über',
  'unter',
  'vor',
  'für',
  'ohne',
  'um',
  'aus',
  'seit',
  'durch',
  'gegen',
  // español
  'en',
  'con',
  'por',
  'para',
  'sin',
  'sobre',
  'entre',
  'hasta',
  'desde',
  'hacia',
  'de',
  'a',
  // inglés
  'on',
  'at',
  'with',
  'to',
  'from',
  'for',
  'about',
  'into',
  'over',
  'under',
  // francés
  'dans',
  'sur',
  'avec',
  'pour',
  'sans',
  'chez',
  'vers',
  'depuis',
  'entre',
  // italiano
  'su',
  'con',
  'per',
  'senza',
  'tra',
  'fra',
  'da',
  // portugués
  'em',
  'com',
  'sem',
  'sobre',
  'entre',
  'até',
  'desde',
  'para',
  'por',
]);

/**
 * Pares del mismo artículo en distinto caso (alemán). Distinguirlos importa:
 * "der → den" no es equivocarse de artículo, es equivocarse de CASO, y eso se
 * practica de otra manera.
 */
const CASE_FAMILIES = [
  new Set(['der', 'den', 'dem', 'des']),
  new Set(['die', 'der']),
  new Set(['das', 'dem', 'des']),
  new Set(['ein', 'einen', 'einem', 'eines']),
  new Set(['eine', 'einer']),
  new Set(['kein', 'keinen', 'keinem']),
];

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[¿?¡!.,;:«»"'()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(s: string): string[] {
  const n = normalize(s);
  return n ? n.split(' ') : [];
}

/**
 * Deduce el tipo de error comparando lo esperado con lo respondido.
 *
 * `category` es la categoría de la habilidad que se estaba practicando: se usa
 * como desempate cuando la comparación no da señal (por ejemplo en una opción
 * múltiple, donde las dos respuestas no se parecen en nada).
 */
export function classifyError(
  expected: string,
  actual: string,
  category?: SkillCategory,
): ErrorType {
  const e = words(expected);
  const a = words(actual);

  if (e.length === 0 || a.length === 0) return fallback(category);

  // Mismas palabras en distinto orden: es EL error de orden de palabras.
  // Se comprueba antes que nada porque es el más específico y el que peor
  // detectan las comparaciones por posición.
  if (e.length === a.length && sameMultiset(e, a) && e.join(' ') !== a.join(' ')) {
    return 'word_order';
  }

  // Si sobra o falta una palabra hay que mirar CUÁL antes de comparar por
  // posición: con un hueco de por medio, todo lo que viene después queda
  // corrido y la comparación posicional enfrenta palabras que no se
  // corresponden ("in" contra "die" en «Ich gehe [in] die Schule»).
  if (e.length !== a.length) {
    const faltante = missingWord(e, a);
    if (faltante) {
      if (ARTICLES.has(faltante)) return 'article';
      if (PREPOSITIONS.has(faltante)) return 'preposition';
      return e.length > a.length ? 'vocabulary' : 'word_order';
    }
  }

  const diff = firstDifference(e, a);
  if (diff) {
    const { expectedWord, actualWord } = diff;

    if (ARTICLES.has(expectedWord) && ARTICLES.has(actualWord)) {
      return sameCaseFamily(expectedWord, actualWord) ? 'case' : 'article';
    }
    if (PREPOSITIONS.has(expectedWord) && PREPOSITIONS.has(actualWord)) return 'preposition';

    // Misma raíz, terminación distinta: conjugación ("trinke" vs "trinkst").
    if (sharedPrefix(expectedWord, actualWord) >= 3 && expectedWord !== actualWord) {
      return editDistance(expectedWord, actualWord) <= 2 ? 'conjugation' : 'vocabulary';
    }

    // Muy parecidas pero sin raíz común larga: falta de ortografía.
    if (editDistance(expectedWord, actualWord) <= 2 && expectedWord.length > 3) return 'spelling';

    return fallback(category);
  }

  return fallback(category);
}

/** La palabra que está en una lista y no en la otra, si es solo una. */
function missingWord(e: string[], a: string[]): string | null {
  const larga = e.length > a.length ? e : a;
  const corta = e.length > a.length ? a : e;
  const restantes = [...corta];
  const sobrantes: string[] = [];
  for (const w of larga) {
    const i = restantes.indexOf(w);
    if (i === -1) sobrantes.push(w);
    else restantes.splice(i, 1);
  }
  return sobrantes.length === 1 ? sobrantes[0] : null;
}

function fallback(category?: SkillCategory): ErrorType {
  if (category === 'word_order') return 'word_order';
  if (category === 'grammar') return 'verb';
  return 'vocabulary';
}

function sameMultiset(a: string[], b: string[]): boolean {
  const sa = [...a].sort().join('|');
  const sb = [...b].sort().join('|');
  return sa === sb;
}

function firstDifference(
  e: string[],
  a: string[],
): { expectedWord: string; actualWord: string } | null {
  const len = Math.min(e.length, a.length);
  for (let i = 0; i < len; i++) {
    if (e[i] !== a[i]) return { expectedWord: e[i], actualWord: a[i] };
  }
  return null;
}

function sameCaseFamily(a: string, b: string): boolean {
  return CASE_FAMILIES.some((f) => f.has(a) && f.has(b));
}

function sharedPrefix(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

/**
 * Identidad de un error: la misma habilidad fallando del mismo modo es EL
 * MISMO error aunque la frase concreta cambie. Por eso la clave lleva el tipo
 * y no el texto: es lo que permite contar "van cuatro veces con el orden de
 * palabras" en vez de cuatro errores sueltos.
 */
export function errorId(skillId: string, type: ErrorType): string {
  return `${skillId}::${type}`;
}

/** Escalado de la FASE 5: 1 registrar · 2 observar · 3 reforzar · 4 prioridad
 *  alta · 5+ reparación intensiva. */
export function severityFor(occurrences: number): ErrorSeverity {
  if (occurrences >= 4) return 'high';
  if (occurrences >= 3) return 'medium';
  return 'low';
}

export const REINFORCE_AT = 3;
export const INTENSIVE_REPAIR_AT = 5;

export function needsReinforcement(e: LearnerError): boolean {
  return e.active && e.occurrences >= REINFORCE_AT;
}

export function needsIntensiveRepair(e: LearnerError): boolean {
  return e.active && e.occurrences >= INTENSIVE_REPAIR_AT;
}

export interface RecordErrorInput {
  skillId: string;
  expected: string;
  actual: string;
  category?: SkillCategory;
  now?: number;
}

/** Registra un fallo: crea el error o incrementa el que ya existía. */
export function recordError(
  existing: LearnerError | undefined,
  input: RecordErrorInput,
): LearnerError {
  const now = input.now ?? Date.now();
  const type = classifyError(input.expected, input.actual, input.category);
  const occurrences = (existing?.occurrences ?? 0) + 1;
  return {
    id: errorId(input.skillId, type),
    skillId: input.skillId,
    type,
    expected: input.expected,
    actual: input.actual,
    occurrences,
    fixedCount: existing?.fixedCount ?? 0,
    active: true,
    severity: severityFor(occurrences),
    firstSeen: existing?.firstSeen ?? now,
    lastSeen: now,
  };
}

/**
 * Registra un acierto en una habilidad que tenía errores abiertos.
 *
 * Un error se da por reparado tras dos aciertos, no tras uno: acertar una vez
 * después de fallar cuatro puede ser suerte o memoria a corto plazo.
 */
export const FIXES_TO_CLOSE = 2;

export function recordFix(error: LearnerError, now = Date.now()): LearnerError {
  const fixedCount = error.fixedCount + 1;
  return {
    ...error,
    fixedCount,
    active: fixedCount < FIXES_TO_CLOSE,
    lastSeen: now,
  };
}
