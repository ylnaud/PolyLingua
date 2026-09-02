import { describe, it, expect } from 'vitest';
import {
  applyAttempt,
  computeStatus,
  distinctStreak,
  MASTERED_STREAK,
} from '../src/lib/engine/mastery';
import {
  classifyError,
  errorId,
  needsIntensiveRepair,
  recordError,
  recordFix,
  severityFor,
} from '../src/lib/engine/errors';
import {
  INTERVALS_MS,
  isDue,
  nextReviewAt,
  nextStep,
  stepFromStreak,
} from '../src/lib/engine/repetition';
import { chooseNextSkill, rankSkills } from '../src/lib/engine/scheduler';
import { emptyState, migrate, newProgress } from '../src/lib/engine/learnerStore';
import type { LearnerError, Skill, SkillProgress } from '../src/lib/engine/types';

// Los ocho casos que pide el documento del motor adaptativo, más los que
// hicieron falta para cerrar los huecos que aparecieron al escribirlos.

const T0 = 1_700_000_000_000;

function skill(id: string, over: Partial<Skill> = {}): Skill {
  return {
    id,
    lang: 'de',
    level: 'a1',
    category: 'grammar',
    name: id,
    prerequisites: [],
    difficulty: 3,
    ...over,
  };
}

/** Aplica `n` aciertos con ejercicios distintos. */
function acertarDistintos(p: SkillProgress, n: number, desde = 0): SkillProgress {
  let out = p;
  for (let i = 0; i < n; i++) {
    out = applyAttempt(out, {
      correct: true,
      exerciseId: `ej-${desde + i}`,
      difficulty: 3,
      now: T0 + i * 1000,
    });
  }
  return out;
}

describe('Test 1 — responder bien suma acierto, racha y mastery', () => {
  it('sube los tres', () => {
    const antes = newProgress('de.a1.verb.sein');
    const despues = applyAttempt(antes, {
      correct: true,
      exerciseId: 'e1',
      difficulty: 3,
      now: T0,
    });
    expect(despues.correct).toBe(1);
    expect(despues.currentStreak).toBe(1);
    expect(despues.mastery).toBeGreaterThan(antes.mastery);
  });
});

describe('Test 2 — fallar suma error, rompe la racha y registra el error', () => {
  it('incorrect +1 y streak a 0', () => {
    const p = applyAttempt(acertarDistintos(newProgress('s'), 3), {
      correct: false,
      exerciseId: 'e9',
      difficulty: 3,
      now: T0,
    });
    expect(p.incorrect).toBe(1);
    expect(p.currentStreak).toBe(0);
  });

  it('registra el error con su tipo', () => {
    const e = recordError(undefined, {
      skillId: 'de.a1.wordorder.basic',
      expected: 'Heute trinke ich Kaffee',
      actual: 'Heute ich trinke Kaffee',
      now: T0,
    });
    expect(e.type).toBe('word_order');
    expect(e.occurrences).toBe(1);
    expect(e.active).toBe(true);
  });
});

describe('Test 3 — el mismo error repetido sube de severidad', () => {
  it('low → medium → high y llega a reparación intensiva', () => {
    let e: LearnerError | undefined;
    const input = {
      skillId: 'de.a1.wordorder.basic',
      expected: 'Heute trinke ich Kaffee',
      actual: 'Heute ich trinke Kaffee',
    };
    const severidades: string[] = [];
    for (let i = 0; i < 5; i++) {
      e = recordError(e, { ...input, now: T0 + i });
      severidades.push(e.severity);
    }
    expect(severidades).toEqual(['low', 'low', 'medium', 'high', 'high']);
    expect(needsIntensiveRepair(e!)).toBe(true);
  });

  it('el mismo patrón en frases distintas es EL MISMO error', () => {
    const a = recordError(undefined, {
      skillId: 's',
      expected: 'Heute trinke ich Kaffee',
      actual: 'Heute ich trinke Kaffee',
    });
    const b = recordError(a, {
      skillId: 's',
      expected: 'Morgen gehe ich zur Arbeit',
      actual: 'Morgen ich gehe zur Arbeit',
    });
    expect(b.id).toBe(a.id);
    expect(b.occurrences).toBe(2);
  });
});

describe('Test 4 — cinco respuestas correctas DISTINTAS dan mastered', () => {
  it('llega a mastered con cinco ejercicios distintos', () => {
    const p = acertarDistintos(newProgress('s'), 8);
    expect(distinctStreak(p)).toBeGreaterThanOrEqual(MASTERED_STREAK);
    expect(p.status).toBe('mastered');
  });

  it('NO llega a mastered repitiendo el mismo ejercicio cinco veces', () => {
    let p = newProgress('s');
    for (let i = 0; i < 8; i++) {
      p = applyAttempt(p, {
        correct: true,
        exerciseId: 'siempre-el-mismo',
        difficulty: 3,
        now: T0 + i,
      });
    }
    expect(distinctStreak(p)).toBe(1);
    expect(p.status).not.toBe('mastered');
  });

  it('fallar borra la evidencia de variedad', () => {
    let p = acertarDistintos(newProgress('s'), 4);
    expect(distinctStreak(p)).toBe(4);
    p = applyAttempt(p, { correct: false, exerciseId: 'x', difficulty: 3, now: T0 });
    expect(distinctStreak(p)).toBe(0);
  });
});

describe('Test 5 — una habilidad dominada vuelve tras el intervalo', () => {
  it('no está vencida antes del intervalo y sí después', () => {
    const step = stepFromStreak(5);
    const due = nextReviewAt(step, true, T0);
    expect(isDue(due, T0)).toBe(false);
    expect(isDue(due, due + 1)).toBe(true);
  });

  it('al fallar vuelve al entrenamiento activo, disponible ya', () => {
    expect(nextReviewAt(4, false, T0)).toBe(T0);
    expect(isDue(nextReviewAt(4, false, T0), T0)).toBe(true);
  });

  it('acertar sube un escalón y fallar baja dos', () => {
    expect(nextStep(3, true)).toBe(4);
    expect(nextStep(3, false)).toBe(1);
    expect(nextStep(0, false)).toBe(0);
    expect(nextStep(INTERVALS_MS.length - 1, true)).toBe(INTERVALS_MS.length - 1);
  });
});

describe('Test 6 — una habilidad débil va antes que una nueva', () => {
  it('ordena weak antes que new', () => {
    const skills = [skill('debil'), skill('nueva')];
    const progress: Record<string, SkillProgress> = {
      debil: {
        ...newProgress('debil'),
        attempts: 4,
        correct: 1,
        incorrect: 3,
        mastery: 15,
        status: 'weak',
      },
    };
    const orden = rankSkills({ skills, progress, errors: [], now: T0, random: () => 0.5 });
    expect(orden[0].skillId).toBe('debil');
    expect(orden[0].reason).toBe('weak_skill');
    expect(orden[1].reason).toBe('new_skill');
  });
});

describe('Test 7 — un error persistente va antes que un ejercicio normal', () => {
  it('el error manda sobre la habilidad débil', () => {
    const skills = [skill('con-error'), skill('debil')];
    const progress: Record<string, SkillProgress> = {
      'con-error': {
        ...newProgress('con-error'),
        attempts: 5,
        correct: 4,
        mastery: 70,
        status: 'strong',
      },
      debil: {
        ...newProgress('debil'),
        attempts: 4,
        correct: 1,
        incorrect: 3,
        mastery: 15,
        status: 'weak',
      },
    };
    let e: LearnerError | undefined;
    for (let i = 0; i < 3; i++) {
      e = recordError(e, {
        skillId: 'con-error',
        expected: 'Heute trinke ich Kaffee',
        actual: 'Heute ich trinke Kaffee',
        now: T0 - 1000,
      });
    }
    const elegida = chooseNextSkill({ skills, progress, errors: [e!], now: T0, random: () => 0.5 });
    expect(elegida?.skillId).toBe('con-error');
    expect(elegida?.reason).toBe('persistent_error');
  });

  it('un error en reparación intensiva es grave y va primero de todo', () => {
    const skills = [skill('grave'), skill('persistente')];
    let grave: LearnerError | undefined;
    for (let i = 0; i < 5; i++) {
      grave = recordError(grave, {
        skillId: 'grave',
        expected: 'der Mann',
        actual: 'die Mann',
        now: T0 - 1000,
      });
    }
    let leve: LearnerError | undefined;
    for (let i = 0; i < 3; i++) {
      leve = recordError(leve, {
        skillId: 'persistente',
        expected: 'der Mann',
        actual: 'die Mann',
        now: T0 - 1000,
      });
    }
    const orden = rankSkills({
      skills,
      progress: {},
      errors: [leve!, grave!],
      now: T0,
      random: () => 0.5,
    });
    expect(orden[0].reason).toBe('severe_error');
    expect(orden[0].skillId).toBe('grave');
  });
});

describe('Test 8 — el estado sobrevive a una recarga', () => {
  it('un estado serializado y vuelto a leer es el mismo', () => {
    const state = emptyState();
    state.progress['s'] = acertarDistintos(newProgress('s'), 3);
    state.errors['e'] = recordError(undefined, {
      skillId: 's',
      expected: 'a b',
      actual: 'b a',
      now: T0,
    });
    const recuperado = migrate(JSON.parse(JSON.stringify(state)));
    expect(recuperado).toEqual(state);
  });

  it('un estado de otra versión no se carga a medias: empieza limpio', () => {
    expect(migrate({ version: 999, progress: { roto: 1 } })).toEqual(emptyState());
  });

  it('basura en localStorage no rompe nada', () => {
    expect(migrate(null)).toEqual(emptyState());
    expect(migrate('texto suelto')).toEqual(emptyState());
    expect(migrate({ version: 1, progress: 'no es un objeto' }).progress).toEqual({});
  });
});

describe('clasificador de errores', () => {
  const casos: [string, string, string][] = [
    ['Heute trinke ich Kaffee', 'Heute ich trinke Kaffee', 'word_order'],
    ['Ich sehe den Mann', 'Ich sehe der Mann', 'case'],
    ['Das ist die Frau', 'Das ist eine Frau', 'article'],
    ['Ich fahre mit dem Bus', 'Ich fahre in dem Bus', 'preposition'],
    ['Du trinkst Wasser', 'Du trinke Wasser', 'conjugation'],
    ['Ich habe einen Hund', 'Ich habe einen Hond', 'spelling'],
    ['Ich lerne Deutsch', 'Ich koche Deutsch', 'vocabulary'],
    ['Ich gehe in die Schule', 'Ich gehe die Schule', 'preposition'],
  ];
  for (const [esperado, dado, tipo] of casos) {
    it(`"${dado}" → ${tipo}`, () => {
      expect(classifyError(esperado, dado)).toBe(tipo);
    });
  }
});

describe('reparación de un error', () => {
  it('hacen falta dos aciertos para cerrarlo, no uno', () => {
    const e = recordError(undefined, { skillId: 's', expected: 'a b', actual: 'b a', now: T0 });
    const unaVez = recordFix(e, T0 + 1);
    expect(unaVez.active).toBe(true);
    const dosVeces = recordFix(unaVez, T0 + 2);
    expect(dosVeces.active).toBe(false);
  });
});

describe('prerrequisitos', () => {
  it('una habilidad nueva no se propone si su prerrequisito está flojo', () => {
    const skills = [skill('avanzada', { prerequisites: ['base'] }), skill('base')];
    const progress: Record<string, SkillProgress> = {
      base: {
        ...newProgress('base'),
        attempts: 3,
        correct: 0,
        incorrect: 3,
        mastery: 5,
        status: 'weak',
      },
    };
    const orden = rankSkills({ skills, progress, errors: [], now: T0, random: () => 0.5 });
    expect(orden.find((c) => c.skillId === 'avanzada')).toBeUndefined();
  });
});

describe('estados de mastery', () => {
  it('sin intentos es new', () => {
    expect(computeStatus(newProgress('s'))).toBe('new');
  });

  it('severityFor sigue el escalado del documento', () => {
    expect([1, 2, 3, 4, 5].map(severityFor)).toEqual(['low', 'low', 'medium', 'high', 'high']);
  });

  it('errorId agrupa por habilidad y tipo', () => {
    expect(errorId('de.a1.wordorder.basic', 'word_order')).toBe(
      'de.a1.wordorder.basic::word_order',
    );
  });
});

describe('Test 9 — una habilidad dominada desaparece y vuelve como repaso', () => {
  it('no se propone mientras no toque', () => {
    const skills = [skill('dominada')];
    const progress: Record<string, SkillProgress> = {
      dominada: {
        ...newProgress('dominada'),
        attempts: 10,
        correct: 10,
        mastery: 95,
        status: 'mastered',
        nextReview: T0 + 60_000,
        streakExerciseIds: ['a', 'b', 'c', 'd', 'e'],
      },
    };
    const orden = rankSkills({ skills, progress, errors: [], now: T0, random: () => 0.5 });
    expect(orden).toHaveLength(0);
  });

  it('vuelve cuando el repaso vence', () => {
    const skills = [skill('dominada')];
    const progress: Record<string, SkillProgress> = {
      dominada: {
        ...newProgress('dominada'),
        attempts: 10,
        correct: 10,
        mastery: 95,
        status: 'mastered',
        nextReview: T0 - 1,
        streakExerciseIds: ['a', 'b', 'c', 'd', 'e'],
      },
    };
    const orden = rankSkills({ skills, progress, errors: [], now: T0, random: () => 0.5 });
    expect(orden).toHaveLength(1);
    expect(orden[0].reason).toBe('due_review');
  });
});
