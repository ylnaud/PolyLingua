/**
 * Qué conviene practicar AHORA.
 *
 * Es la pieza que convierte la app de "siguiente página" en "siguiente cosa
 * con más valor pedagógico". La UI no decide nada: le pregunta a esto.
 *
 * Función pura sobre datos ya cargados. No lee almacenamiento ni toca el DOM,
 * así que se puede testear entera sin navegador.
 */

import { needsIntensiveRepair, needsReinforcement } from './errors';
import { isDue } from './repetition';
import type { LearnerError, Skill, SkillProgress } from './types';

/** Las seis prioridades de la FASE 6, de más a menos urgente. */
export type Reason =
  'severe_error' | 'persistent_error' | 'weak_skill' | 'due_review' | 'new_skill' | 'random_review';

export const PRIORITY: Reason[] = [
  'severe_error',
  'persistent_error',
  'weak_skill',
  'due_review',
  'new_skill',
  'random_review',
];

export interface Candidate {
  skillId: string;
  reason: Reason;
  /** Cuanto más alto, antes se practica. Ordena DENTRO de una misma razón. */
  score: number;
  /** El error que motiva la elección, si la razón es un error. */
  error?: LearnerError;
}

export interface SchedulerInput {
  skills: Skill[];
  progress: Record<string, SkillProgress>;
  errors: LearnerError[];
  now?: number;
  /** Aleatoriedad inyectable: sin esto el "repaso aleatorio" no se puede
   *  testear de forma determinista. */
  random?: () => number;
}

/**
 * Ordena todas las habilidades practicables por lo que conviene hacer primero.
 *
 * Devuelve la lista entera y no solo la primera para que quien llame pueda
 * armar una sesión de N ejercicios sin repetir habilidad, y para que el
 * dashboard pueda mostrar "necesitás practicar esto" con el mismo criterio con
 * el que el motor elige.
 */
export function rankSkills(input: SchedulerInput): Candidate[] {
  const now = input.now ?? Date.now();
  const random = input.random ?? Math.random;
  const conocidas = new Set(input.skills.map((s) => s.id));

  const candidatos: Candidate[] = [];
  const yaPuestas = new Set<string>();

  // 1 y 2. Errores. Se miran primero porque un error activo es la señal más
  // fuerte que puede dar un alumno sobre qué necesita.
  const erroresOrdenados = [...input.errors]
    .filter((e) => e.active && conocidas.has(e.skillId))
    .sort((a, b) => b.occurrences - a.occurrences || b.lastSeen - a.lastSeen);

  for (const error of erroresOrdenados) {
    if (yaPuestas.has(error.skillId)) continue;
    // Grave = ya está en reparación intensiva (5+) o su severidad es alta y
    // acaba de pasar. "Reciente" importa: un error de hace un mes que no
    // volvió a aparecer no es lo más urgente.
    const reciente = now - error.lastSeen < 7 * 24 * 60 * 60 * 1000;
    const grave = needsIntensiveRepair(error) || (error.severity === 'high' && reciente);
    if (!grave && !needsReinforcement(error)) continue;
    candidatos.push({
      skillId: error.skillId,
      reason: grave ? 'severe_error' : 'persistent_error',
      score: error.occurrences * 10 + (reciente ? 5 : 0),
      error,
    });
    yaPuestas.add(error.skillId);
  }

  for (const skill of input.skills) {
    if (yaPuestas.has(skill.id)) continue;
    const p = input.progress[skill.id];

    // 5. Nunca practicada. Solo si sus prerrequisitos ya están encaminados:
    // proponer el acusativo a quien todavía no tiene los artículos es ruido.
    if (!p || p.attempts === 0) {
      if (!prerequisitesReady(skill, input.progress)) continue;
      candidatos.push({ skillId: skill.id, reason: 'new_skill', score: 5 - skill.difficulty });
      yaPuestas.add(skill.id);
      continue;
    }

    // 3. Débil: se está practicando pero no sale.
    if (p.status === 'weak' || p.status === 'learning') {
      candidatos.push({ skillId: skill.id, reason: 'weak_skill', score: 100 - p.mastery });
      yaPuestas.add(skill.id);
      continue;
    }

    // 4. Repaso vencido.
    if (isDue(p.nextReview, now)) {
      const atraso = now - p.nextReview;
      candidatos.push({ skillId: skill.id, reason: 'due_review', score: atraso / 60_000 });
      yaPuestas.add(skill.id);
      continue;
    }

    // Dominada y sin repaso pendiente: desaparece de la rotación hasta que le
    // toque. Es lo que hace que dominar algo se note —deja de aparecer— y que
    // vuelva más adelante como repaso en vez de seguir ocupando sitio.
    if (p.status === 'mastered') {
      yaPuestas.add(skill.id);
      continue;
    }

    // 6. Nada urgente: entra en el bombo del repaso aleatorio.
    candidatos.push({ skillId: skill.id, reason: 'random_review', score: random() });
    yaPuestas.add(skill.id);
  }

  return candidatos.sort(
    (a, b) => PRIORITY.indexOf(a.reason) - PRIORITY.indexOf(b.reason) || b.score - a.score,
  );
}

/** La habilidad que toca ahora, o null si no hay ninguna practicable. */
export function chooseNextSkill(input: SchedulerInput): Candidate | null {
  return rankSkills(input)[0] ?? null;
}

/**
 * Una sesión de `size` habilidades sin repetir.
 *
 * No es simplemente "los N primeros": si los tres primeros son todos errores
 * de la misma habilidad, la sesión sería monótona. `rankSkills` ya devuelve
 * una habilidad como mucho una vez, así que acá basta con cortar.
 */
export function buildSession(input: SchedulerInput, size = 10): Candidate[] {
  return rankSkills(input).slice(0, size);
}

/**
 * Los prerrequisitos están listos cuando cada uno se practicó al menos una vez
 * y no está en el estado más flojo. No se exige dominarlos: sería un muro, y
 * en la práctica las habilidades se refuerzan entre sí.
 */
export function prerequisitesReady(skill: Skill, progress: Record<string, SkillProgress>): boolean {
  return skill.prerequisites.every((id) => {
    const p = progress[id];
    return !!p && p.attempts > 0 && p.status !== 'weak';
  });
}
