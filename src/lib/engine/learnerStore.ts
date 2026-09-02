/**
 * Única fuente de verdad del motor, y la capa que aísla al resto del motor de
 * DÓNDE se guarda el progreso.
 *
 * Hoy es localStorage; mañana puede ser una API. Por eso ningún otro archivo
 * del motor lee o escribe almacenamiento: todos pasan por acá. Si el día de
 * mañana esto se vuelve asíncrono, cambia este archivo y los que lo llaman,
 * no la lógica de mastery, errores o scheduling.
 *
 * Vive en una clave nueva y versionada (`polylingua-engine`) en vez de
 * absorber las 25 claves que ya usa la app (racha, logros, pool SRS,
 * vocabulario, lecciones completadas, diario...). Migrarlas habría obligado a
 * reescribir todas las funciones existentes a la vez, con el riesgo de borrar
 * el progreso real de quien ya usa la app. La copia de seguridad de /logros
 * exporta todo lo que empieza por `polylingua-`, así que este estado entra
 * sola en el backup sin tocar nada.
 */

import { read, write } from '../storage';
import type { LearnerError, SkillProgress } from './types';

export const ENGINE_KEY = 'polylingua-engine';
export const ENGINE_VERSION = 1;

export interface EngineState {
  version: number;
  /** Progreso por skillId. */
  progress: Record<string, SkillProgress>;
  /** Errores por id de error (skillId + patrón). */
  errors: Record<string, LearnerError>;
  settings: {
    /** Dificultad actual por skillId, 1-5. La ajusta difficulty.ts. */
    difficulty: Record<string, number>;
  };
}

export function emptyState(): EngineState {
  return { version: ENGINE_VERSION, progress: {}, errors: {}, settings: { difficulty: {} } };
}

/**
 * Migra un estado guardado a la versión actual.
 *
 * Hoy solo hay una versión, así que lo único que hace es descartar lo que no
 * reconoce. Existe desde el principio a propósito: el día que cambie la forma
 * del estado, el punto de entrada ya está y no hay que inventarlo con datos
 * de usuarios reales en juego.
 */
export function migrate(raw: unknown): EngineState {
  if (!raw || typeof raw !== 'object') return emptyState();
  const state = raw as Partial<EngineState>;
  if (state.version !== ENGINE_VERSION) return emptyState();
  return {
    version: ENGINE_VERSION,
    progress: isRecord(state.progress) ? (state.progress as Record<string, SkillProgress>) : {},
    errors: isRecord(state.errors) ? (state.errors as Record<string, LearnerError>) : {},
    settings: {
      difficulty: isRecord(state.settings?.difficulty)
        ? (state.settings!.difficulty as Record<string, number>)
        : {},
    },
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

export function getState(): EngineState {
  const raw = read(ENGINE_KEY);
  if (!raw) return emptyState();
  try {
    return migrate(JSON.parse(raw));
  } catch {
    return emptyState();
  }
}

export function saveState(state: EngineState): void {
  write(ENGINE_KEY, JSON.stringify(state));
}

/** Progreso de una habilidad, o uno nuevo en blanco si nunca se practicó. */
export function getProgress(skillId: string, state = getState()): SkillProgress {
  return state.progress[skillId] ?? newProgress(skillId);
}

export function newProgress(skillId: string): SkillProgress {
  return {
    skillId,
    attempts: 0,
    correct: 0,
    incorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
    mastery: 0,
    lastAttempt: 0,
    nextReview: 0,
    status: 'new',
    streakExerciseIds: [],
  };
}

export function saveProgress(progress: SkillProgress, state = getState()): EngineState {
  const next = { ...state, progress: { ...state.progress, [progress.skillId]: progress } };
  saveState(next);
  return next;
}

export function getErrors(state = getState()): LearnerError[] {
  return Object.values(state.errors);
}

export function saveError(error: LearnerError, state = getState()): EngineState {
  const next = { ...state, errors: { ...state.errors, [error.id]: error } };
  saveState(next);
  return next;
}

export function getDifficulty(skillId: string, fallback: number, state = getState()): number {
  return state.settings.difficulty[skillId] ?? fallback;
}

export function saveDifficulty(skillId: string, value: number, state = getState()): EngineState {
  const next = {
    ...state,
    settings: { ...state.settings, difficulty: { ...state.settings.difficulty, [skillId]: value } },
  };
  saveState(next);
  return next;
}
