/**
 * Dificultad adaptativa (FASE 8).
 *
 * La regla del documento es clara: 5/5 sube, 3/5 mantiene, 1/5 baja. Lo que
 * hay que respetar con cuidado es lo que viene después: **no se baja de nivel
 * MCER**. Alguien que se atasca en A1 no pasa a "pre-A1"; lo que se reduce es
 * la exigencia del ejercicio —frases más cortas, menos opciones, vocabulario
 * más común— manteniendo el mismo contenido. Bajar de nivel sería decirle que
 * retroceda, y no es eso lo que necesita.
 */

import { clamp } from './mastery';

export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 5;

/**
 * Ajusta la dificultad según los últimos resultados.
 *
 * `window` son los aciertos/fallos recientes (true = acierto). Se usa una
 * ventana y no el historial completo porque la dificultad tiene que responder
 * a cómo va AHORA: alguien que falló mucho hace un mes y ahora acierta todo
 * merece subir.
 */
export function adjustDifficulty(current: number, window: boolean[]): number {
  if (window.length < 3) return current;
  const aciertos = window.filter(Boolean).length;
  const ratio = aciertos / window.length;

  if (ratio >= 0.9) return clamp(current + 1, MIN_DIFFICULTY, MAX_DIFFICULTY);
  if (ratio <= 0.35) return clamp(current - 1, MIN_DIFFICULTY, MAX_DIFFICULTY);
  return current;
}

/**
 * Qué significa cada nivel de dificultad en la práctica.
 *
 * El generador usa esto para elegir ejercicio: con dificultad 1 prefiere una
 * opción múltiple de tres opciones sobre una frase corta; con 5, escribir la
 * frase entera sin pistas.
 */
export interface DifficultyProfile {
  /** Máximo de palabras de la frase del enunciado. */
  maxWords: number;
  /** Cuántas opciones ofrecer en las de elegir. */
  options: number;
  /** Si se ofrece pista. */
  hint: boolean;
  /** Tipos de ejercicio adecuados, del más guiado al más exigente. */
  preferredTypes: string[];
}

const PROFILES: Record<number, DifficultyProfile> = {
  1: { maxWords: 5, options: 3, hint: true, preferredTypes: ['multiple_choice'] },
  2: { maxWords: 7, options: 3, hint: true, preferredTypes: ['multiple_choice', 'fill_blank'] },
  3: { maxWords: 9, options: 4, hint: true, preferredTypes: ['fill_blank', 'reorder'] },
  4: { maxWords: 12, options: 4, hint: false, preferredTypes: ['reorder', 'complete_sentence'] },
  5: { maxWords: 99, options: 4, hint: false, preferredTypes: ['write', 'complete_sentence'] },
};

export function profileFor(difficulty: number): DifficultyProfile {
  return PROFILES[clamp(Math.round(difficulty), MIN_DIFFICULTY, MAX_DIFFICULTY)];
}

/** Etiqueta para el dashboard. */
export function describeDifficulty(difficulty: number): string {
  const d = clamp(Math.round(difficulty), MIN_DIFFICULTY, MAX_DIFFICULTY);
  return ['Muy guiado', 'Guiado', 'Normal', 'Exigente', 'Sin ayudas'][d - 1];
}
