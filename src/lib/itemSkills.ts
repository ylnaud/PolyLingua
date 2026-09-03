/**
 * Qué habilidades del motor ejercita un ítem de práctica.
 *
 * Vive fuera de `src/lib/engine/` a propósito: el motor no toca el DOM y esto
 * sí — lee dos atributos que publica la página. Lo comparten EngineTracker
 * (que apunta el resultado al terminar) y DrillTutor (que decide qué reforzar
 * al fallar), y tenían que responder exactamente lo mismo: si uno atribuye el
 * fallo a una habilidad y el otro a otra, el bucle refuerza algo distinto de
 * lo que registra.
 *
 * Dos fuentes, en este orden:
 *
 * - `[data-item-skills]`: mapa exacto ítem→habilidades. Lo publica la página de
 *   práctica adaptativa, que sabe para qué habilidad eligió cada ejercicio, y
 *   lo va completando DrillTutor con los ejercicios que inserta.
 * - `[data-lesson-skills]`: la lista de la lección. En una lección normal no se
 *   sabe qué ítem entrena qué habilidad, así que el resultado cuenta para todas
 *   las que enseña — coherente con que la relación sea N:N.
 */

function parse(json: string | undefined, fallback: unknown): any {
  try {
    return JSON.parse(json ?? '');
  } catch {
    return fallback;
  }
}

export function skillsForItem(itemId: string): string[] {
  const exacto = document.querySelector<HTMLElement>('[data-item-skills]');
  if (exacto) {
    const mapa = parse(exacto.dataset.itemSkills, {});
    if (Array.isArray(mapa[itemId])) return mapa[itemId];
  }
  const leccion = document.querySelector<HTMLElement>('[data-lesson-skills]');
  if (!leccion) return [];
  const lista = parse(leccion.dataset.lessonSkills, []);
  return Array.isArray(lista) ? lista : [];
}

/**
 * Declara a qué habilidad pertenece un ítem creado en tiempo de ejecución.
 *
 * Sin esto, un ejercicio de refuerzo insertado en una lección que enseña tres
 * habilidades contaría para las tres, y reforzar el femenino movería también
 * el marcador del masculino.
 */
export function declareItemSkills(itemId: string, skills: string[]): void {
  let host = document.querySelector<HTMLElement>('[data-item-skills]');
  if (!host) {
    host = document.createElement('span');
    host.hidden = true;
    host.dataset.itemSkills = '{}';
    document.body.appendChild(host);
  }
  const mapa = parse(host.dataset.itemSkills, {});
  mapa[itemId] = skills;
  host.dataset.itemSkills = JSON.stringify(mapa);
}
