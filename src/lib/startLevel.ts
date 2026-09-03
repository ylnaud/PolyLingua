/**
 * Desde qué nivel empieza el usuario.
 *
 * Hasta ahora el curso solo se abría hacia adelante: A1 estaba desbloqueado y
 * cada nivel siguiente pedía aprobar el examen del anterior. Para quien llega
 * sabiendo algo del idioma —la mayoría de los que buscan B1— eso significaba
 * aprobar dos exámenes de cosas que ya sabe antes de ver una sola lección
 * útil, o entrar por una URL directa esquivando el candado.
 *
 * La regla nueva: el usuario declara su nivel y con eso queda abierto todo
 * hasta ahí. Hacia adelante no cambia nada — el examen sigue siendo la puerta.
 * Los niveles por debajo del elegido quedan abiertos a propósito: repasar algo
 * más fácil nunca fue el problema.
 *
 * Sin nivel elegido el comportamiento es idéntico al de siempre, porque el
 * valor por defecto es el primer nivel.
 */

import { read, write } from './storage';
import type { LevelId } from '../data/levels';

/** Una clave por curso: alguien puede ir por B1 en inglés y A1 en alemán. */
export function startLevelKey(targetLang: string): string {
  return `polylingua-start-level-${targetLang}`;
}

export function readStartLevel(targetLang: string, levelIds: readonly string[]): string {
  const guardado = read(startLevelKey(targetLang));
  // Se valida contra la lista real: una clave vieja con un nivel que ya no
  // existe abriría medio curso o ninguno, según cómo cayera el índice.
  return guardado && levelIds.includes(guardado) ? guardado : (levelIds[0] ?? '');
}

export function writeStartLevel(targetLang: string, level: LevelId | string): void {
  write(startLevelKey(targetLang), level);
}

export interface OpenLevelInput {
  /** Los niveles del curso, en orden. */
  levelIds: readonly string[];
  /** El que el usuario declaró como punto de partida. */
  startLevel: string;
  /** Si el examen de ese nivel está aprobado. */
  isPassed: (levelId: string) => boolean;
}

/**
 * Si el nivel de la posición `index` está abierto.
 *
 * Dos caminos, y basta con uno: estar en el tramo que el usuario declaró
 * conocer, o haber aprobado el examen del nivel anterior.
 */
export function isLevelOpen(index: number, input: OpenLevelInput): boolean {
  const inicio = input.levelIds.indexOf(input.startLevel);
  const hastaElInicio = inicio === -1 ? 0 : inicio;
  if (index <= hastaElInicio) return true;
  const anterior = input.levelIds[index - 1];
  return !!anterior && input.isPassed(anterior);
}
