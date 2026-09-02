/**
 * Cuándo volver a preguntar una habilidad.
 *
 * Separado del resto a propósito (FASE 7): el algoritmo de repetición es lo
 * primero que se querrá afinar más adelante —SM-2, FSRS, lo que sea— y así se
 * cambia sin tocar mastery, errores ni scheduler.
 *
 * Convive con `src/lib/srs.ts`, que NO se toca: aquel programa ÍTEMS concretos
 * de lección ("volvé a ver esta pregunta") con cajas Leitner en días, y sigue
 * funcionando igual. Esto programa HABILIDADES. La diferencia práctica es que
 * acá los dos primeros escalones son de minutos y horas: cuando alguien acaba
 * de fallar el orden de palabras, esperar un día entero para volver a
 * intentarlo desperdicia el momento en el que está receptivo.
 */

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

/** Los ocho escalones de la FASE 7, en milisegundos. */
export const INTERVALS_MS = [
  10 * MINUTO,
  1 * HORA,
  1 * DIA,
  3 * DIA,
  7 * DIA,
  14 * DIA,
  30 * DIA,
  60 * DIA,
];

export const MAX_STEP = INTERVALS_MS.length - 1;

/**
 * Al acertar se sube un escalón; al fallar se baja DOS.
 *
 * Bajar dos y no uno es deliberado: fallar algo que ya estaba en el escalón de
 * 30 días significa que no estaba consolidado, y devolverlo a 14 días lo daría
 * por sabido otra vez demasiado pronto. Con -2 vuelve a un ritmo en el que se
 * puede reconstruir.
 */
export function nextStep(currentStep: number, correct: boolean): number {
  if (correct) return Math.min(MAX_STEP, currentStep + 1);
  return Math.max(0, currentStep - 2);
}

/** Momento del próximo repaso. Al fallar, vuelve al entrenamiento activo:
 *  disponible ya, sin esperar. */
export function nextReviewAt(step: number, correct: boolean, now = Date.now()): number {
  if (!correct) return now;
  return now + INTERVALS_MS[Math.min(MAX_STEP, Math.max(0, step))];
}

export function isDue(nextReview: number, now = Date.now()): boolean {
  return nextReview <= now;
}

/**
 * Deduce en qué escalón está una habilidad a partir de su racha de aciertos.
 *
 * El escalón no se guarda como campo propio: se deriva de `currentStreak`, que
 * ya está en SkillProgress. Un dato menos que mantener sincronizado, y un dato
 * menos que puede quedar incoherente con el resto del progreso.
 */
export function stepFromStreak(currentStreak: number): number {
  return Math.min(MAX_STEP, Math.max(0, currentStreak));
}

/** Etiqueta legible del intervalo, para el dashboard ("en 3 días"). */
export function describeInterval(step: number): string {
  const ms = INTERVALS_MS[Math.min(MAX_STEP, Math.max(0, step))];
  if (ms < HORA) return `${Math.round(ms / MINUTO)} min`;
  if (ms < DIA) return `${Math.round(ms / HORA)} h`;
  const dias = Math.round(ms / DIA);
  return dias === 1 ? '1 día' : `${dias} días`;
}
