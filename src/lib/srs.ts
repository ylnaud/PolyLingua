export const INTERVAL_DAYS = [1, 3, 7, 14, 30, 60];
export const MAX_BOX = INTERVAL_DAYS.length;
export const MASTERY_LABELS = [
  'Nueva',
  'Aprendiendo',
  'Familiar',
  'Buena',
  'Dominada',
  'Muy dominada',
];

/**
 * Idioma META a partir de un id de lección o de ítem.
 *
 * Desde la arquitectura SILO los ids son `<userLang>-<targetLang>/<nivel>/<slug>`
 * (`es-de/a1/uhrzeit`). Varios sitios tomaban el primer segmento como "el
 * idioma" —lo que antes era cierto, cuando el id era `de/a1/uhrzeit`— y desde
 * la migración guardaban `es-de` donde el resto del código busca `de`. El
 * resultado era que el pool de repaso, el registro de errores y el vocabulario
 * aprendido se llenaban con un idioma que ningún lector reconocía, así que
 * Repasar, Mis errores y Vocabulario salían siempre vacíos.
 */
export function targetLangFromId(id: string): string {
  const curso = id.split('#')[0].split('/')[0] ?? '';
  return curso.includes('-') ? (curso.split('-')[1] ?? '') : curso;
}

/**
 * ¿Una entrada guardada pertenece a este idioma meta?
 *
 * Acepta las dos formas a propósito: quien ya tenga progreso guardado lo tiene
 * con el valor viejo (`es-de`), y no se le va a pedir que lo pierda para que
 * la corrección le llegue.
 */
export function matchesLang(guardado: string | undefined, targetLang: string): boolean {
  if (!guardado) return false;
  if (guardado === targetLang) return true;
  return guardado.includes('-') && guardado.split('-')[1] === targetLang;
}
