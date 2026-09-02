/**
 * Cuánto domina el alumno cada habilidad, y en qué estado está.
 *
 * La regla que da sentido a todo el archivo: **acertar una pregunta no es
 * dominar**. Para llegar a `mastered` hacen falta cinco aciertos seguidos en
 * ejercicios DISTINTOS, porque el objetivo es aprender la estructura, no
 * memorizar una frase. Alguien que responde bien "Heute trinke ich Kaffee"
 * cinco veces no ha aprendido el orden de palabras; alguien que lo hace con
 * "Heute lerne ich Deutsch", "Morgen gehe ich zur Arbeit" y tres frases más,
 * sí.
 *
 * Funciones puras: reciben progreso y devuelven progreso. No leen ni escriben
 * almacenamiento — de eso se ocupa learnerStore.
 */

import type { SkillProgress, SkillStatus } from './types';

/** Aciertos consecutivos, en ejercicios distintos, para dar algo por dominado. */
export const MASTERED_STREAK = 5;

/** Umbrales de `mastery` (0-100) para cada estado. */
export const THRESHOLDS = { learning: 1, weak: 30, strong: 60, mastered: 85 } as const;

export interface AttemptInput {
  correct: boolean;
  /** Identifica el ejercicio concreto. Dos aciertos con el mismo id cuentan
   *  como uno solo a efectos de racha para dominar. */
  exerciseId: string;
  /** Dificultad del ejercicio, 1-5. Acertar algo difícil sube más. */
  difficulty: number;
  /** Inyectable para poder testear sin depender del reloj. */
  now?: number;
}

/**
 * Aplica un intento y devuelve el progreso actualizado.
 *
 * El `mastery` no es el porcentaje de aciertos a secas: eso premiaría a quien
 * acertó 3 de 3 por encima de quien lleva 40 de 50. Se mezcla la tasa de
 * acierto con la evidencia acumulada (cuántos intentos hay detrás) y con la
 * racha actual, y se pondera por dificultad.
 */
export function applyAttempt(progress: SkillProgress, input: AttemptInput): SkillProgress {
  const now = input.now ?? Date.now();
  const next: SkillProgress = {
    ...progress,
    attempts: progress.attempts + 1,
    lastAttempt: now,
    streakExerciseIds: [...progress.streakExerciseIds],
  };

  if (input.correct) {
    next.correct = progress.correct + 1;
    next.currentStreak = progress.currentStreak + 1;
    next.bestStreak = Math.max(progress.bestStreak, next.currentStreak);
    // Solo suma a la racha "de ejercicios distintos" si es uno que no estaba.
    if (!next.streakExerciseIds.includes(input.exerciseId)) {
      next.streakExerciseIds.push(input.exerciseId);
    }
  } else {
    next.incorrect = progress.incorrect + 1;
    next.currentStreak = 0;
    // Al fallar se rompe la evidencia de variedad: hay que volver a
    // demostrarla desde cero, si no bastaría con acumular aciertos sueltos
    // entre fallos para acabar dominando.
    next.streakExerciseIds = [];
  }

  next.mastery = computeMastery(next, input.difficulty);
  next.status = computeStatus(next);
  return next;
}

/**
 * 0-100. Tres componentes:
 *
 * - tasa de acierto (lo que sabe),
 * - confianza según cuántos intentos hay (cuánta evidencia hay de que lo sabe),
 * - racha actual (si lo sabe AHORA, no hace tres semanas).
 *
 * La dificultad escala el resultado: dominar algo de dificultad 5 vale más que
 * dominar algo de dificultad 1.
 */
export function computeMastery(p: SkillProgress, difficulty = 3): number {
  if (p.attempts === 0) return 0;

  const accuracy = p.correct / p.attempts;
  // Con 1 intento la evidencia es débil; a partir de ~8 ya es razonable.
  const confidence = Math.min(1, p.attempts / 8);
  const streak = Math.min(1, p.currentStreak / MASTERED_STREAK);

  const base = accuracy * 0.55 + confidence * 0.2 + streak * 0.25;
  // Dificultad 3 es neutra: por debajo descuenta un poco, por encima premia.
  const weight = 0.9 + (clamp(difficulty, 1, 5) - 3) * 0.05;

  return Math.round(clamp(base * weight * 100, 0, 100));
}

export function computeStatus(p: SkillProgress): SkillStatus {
  if (p.attempts === 0) return 'new';

  // Dominado es lo más exigente y no depende solo del número: exige haberlo
  // demostrado en cinco ejercicios distintos seguidos.
  if (p.mastery >= THRESHOLDS.mastered && distinctStreak(p) >= MASTERED_STREAK) {
    return 'mastered';
  }
  if (p.mastery >= THRESHOLDS.strong) return 'strong';
  if (p.mastery >= THRESHOLDS.weak) return 'learning';
  return 'weak';
}

/** Aciertos seguidos en ejercicios distintos. */
export function distinctStreak(p: SkillProgress): number {
  return p.streakExerciseIds.length;
}

/** Cuánto le falta para dominar, para poder mostrarlo ("3 de 5"). */
export function remainingForMastery(p: SkillProgress): number {
  return Math.max(0, MASTERED_STREAK - distinctStreak(p));
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
