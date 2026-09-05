import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SKILLS } from '../src/data/skills';
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
import {
  REPAIR_TEMPLATES,
  generateRepairSet,
  repairTemplateFor,
  toRepairExercise,
} from '../src/lib/engine/exerciseGenerator';
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

describe('catálogo de habilidades', () => {
  it('ningún prerrequisito apunta a una habilidad que no existe', () => {
    const ids = new Set(SKILLS.map((s) => s.id));
    const rotos = SKILLS.flatMap((s) =>
      s.prerequisites.filter((p) => !ids.has(p)).map((p) => `${s.id} → ${p}`),
    );
    expect(rotos, `prerrequisitos rotos:\n${rotos.join('\n')}`).toEqual([]);
  });

  it('todas las habilidades tienen al menos una lección que las enseña', () => {
    const referenciadas = new Set<string>();
    const dir = join(import.meta.dirname, '..', 'src', 'content', 'lessons');
    for (const curso of readdirSync(dir)) {
      if (!/^[a-z]{2}-[a-z]{2}$/.test(curso)) continue;
      for (const nivel of readdirSync(join(dir, curso))) {
        for (const f of readdirSync(join(dir, curso, nivel))) {
          if (!f.endsWith('.md')) continue;
          const raw = readFileSync(join(dir, curso, nivel, f), 'utf-8');
          for (const m of raw.matchAll(/^ {2}- ([a-z]{2}\.[a-z0-9]+\.[a-z0-9.-]+)$/gm)) {
            referenciadas.add(m[1]);
          }
        }
      }
    }
    const huerfanas = SKILLS.map((s) => s.id).filter((id) => !referenciadas.has(id));
    expect(huerfanas, `habilidades sin lección:\n${huerfanas.join('\n')}`).toEqual([]);
  });

  it('las lecciones no referencian habilidades inexistentes', () => {
    const ids = new Set(SKILLS.map((s) => s.id));
    const dir = join(import.meta.dirname, '..', 'src', 'content', 'lessons');
    const fantasma: string[] = [];
    for (const curso of readdirSync(dir)) {
      if (!/^[a-z]{2}-[a-z]{2}$/.test(curso)) continue;
      for (const nivel of readdirSync(join(dir, curso))) {
        for (const f of readdirSync(join(dir, curso, nivel))) {
          if (!f.endsWith('.md')) continue;
          const raw = readFileSync(join(dir, curso, nivel, f), 'utf-8');
          for (const m of raw.matchAll(/^ {2}- ([a-z]{2}\.[a-z0-9]+\.[a-z0-9.-]+)$/gm)) {
            if (!ids.has(m[1])) fantasma.push(`${curso}/${nivel}/${f}: ${m[1]}`);
          }
        }
      }
    }
    expect(fantasma, `referencias a habilidades inexistentes:\n${fantasma.join('\n')}`).toEqual([]);
  });

  it('la dificultad está entre 1 y 5', () => {
    for (const s of SKILLS) {
      expect(s.difficulty, s.id).toBeGreaterThanOrEqual(1);
      expect(s.difficulty, s.id).toBeLessThanOrEqual(5);
    }
  });
});

describe('plantillas de refuerzo', () => {
  // `Exercise.render.data` es `unknown` a propósito: el motor no conoce la
  // forma de los ítems del sitio, solo los transporta hasta
  // practiceItemMarkup.ts. El test sí sabe qué está mirando, así que la
  // estrecha acá en vez de aflojar el tipo del motor.
  const pintado = (data: unknown) => (data ?? {}) as { answer?: string; sentence?: string };

  // El bucle del tutor (DrillTutor.astro) sale con 3 aciertos seguidos y se
  // rinde a los 6 insertados: una plantilla con menos de 6 variaciones se
  // quedaría sin material antes de llegar al tope y el bucle se cortaría solo,
  // que no es lo mismo que rendirse.
  const MINIMO_VARIACIONES = 6;

  it('toda habilidad de gramática y orden tiene plantilla, en cualquier idioma', () => {
    // Sin plantilla, DrillTutor no abre bucle: la habilidad alimenta el modelo
    // pero fallar en ella no trae más ejercicios. Este test es lo que impide
    // que se etiquete un nivel nuevo y el refuerzo se quede mudo ahí.
    //
    // El filtro era `lang === 'de'` mientras el alemán era el único idioma
    // etiquetado. Al entrar el inglés se quitó a propósito: si el candado solo
    // vigila un idioma, el siguiente entra sin material y nadie se entera.
    const necesitan = SKILLS.filter(
      (s) => s.category === 'grammar' || s.category === 'word_order',
    ).map((s) => s.id);
    const sinPlantilla = necesitan.filter((id) => !repairTemplateFor(id));
    expect(sinPlantilla, `habilidades sin refuerzo:\n${sinPlantilla.join('\n')}`).toEqual([]);
  });

  it('cada plantilla tiene variaciones suficientes y distintas entre sí', () => {
    for (const t of REPAIR_TEMPLATES) {
      expect(t.variations.length, t.skillId).toBeGreaterThanOrEqual(MINIMO_VARIACIONES);
      const frases = t.variations.map((v) => v.sentence);
      expect(new Set(frases).size, `${t.skillId} repite una frase`).toBe(frases.length);
      expect(t.explanation.length, t.skillId).toBeGreaterThan(20);
    }
  });

  it('toda variación trae su answer, y la de orden es la frase entera', () => {
    // `answer` es obligatorio en el tipo, así que esto no debería poder
    // fallar... salvo que la variación se escriba y nadie mire la línea
    // `- N errors` de astro check. Pasó: seis variaciones de orden en francés
    // llegaron a CI sin `answer`. El tipo ya lo cazaba; el test lo caza
    // también con vitest, que es lo que se corre primero.
    //
    // En las de orden `toRepairExercise` usa `sentence` como respuesta y no
    // mira `answer` — por eso se exige que sean iguales: un `answer` distinto
    // ahí es dato muerto que miente sobre lo que se corrige.
    for (const t of REPAIR_TEMPLATES) {
      for (const v of t.variations) {
        expect(v.answer?.trim(), `${t.skillId}: ${v.sentence}`).toBeTruthy();
        if (v.kind === 'order') {
          expect(v.answer, `${t.skillId}: ${v.sentence}`).toBe(v.sentence);
          // La frase se parte por espacios para armar las fichas, así que un
          // punto final se queda pegado a la última palabra.
          expect(/[.?!]$/.test(v.sentence), `${t.skillId}: ${v.sentence}`).toBe(false);
        }
      }
    }
  });

  it('cada plantilla apunta a una habilidad que existe', () => {
    const ids = new Set(SKILLS.map((s) => s.id));
    const fantasma = REPAIR_TEMPLATES.filter((t) => !ids.has(t.skillId)).map((t) => t.skillId);
    expect(fantasma).toEqual([]);
  });

  it('las variaciones de hueco traen UN ___ y las de orden ninguno', () => {
    // Exactamente uno, no «al menos uno»: buildItemFieldset parte la frase por
    // el primer ___ y el segundo se quedaría escrito en pantalla como texto.
    // Se coló una así al escribir las de inglés y el test no la vio.
    for (const t of REPAIR_TEMPLATES) {
      for (const v of t.variations) {
        const huecos = v.sentence.split('___').length - 1;
        if (v.kind === 'order') expect(huecos, `${t.skillId}: ${v.sentence}`).toBe(0);
        else expect(huecos, `${t.skillId}: ${v.sentence}`).toBe(1);
      }
    }
  });

  it('una variación de orden se pinta como ejercicio de ordenar', () => {
    const skill = SKILLS.find((s) => s.id === 'de.a1.wordorder.questions')!;
    const plantilla = repairTemplateFor(skill.id)!;
    const v = plantilla.variations.find((x) => x.kind === 'order')!;
    const ej = toRepairExercise(skill, plantilla, v, 0);
    expect(ej.type).toBe('reorder');
    expect(ej.render?.kind).toBe('order');
    expect(pintado(ej.render?.data).sentence).toBe(v.sentence);
    expect(ej.expectedAnswer).toBe(v.sentence);
  });

  it('generateRepairSet sigue devolviendo ejercicios pintables', () => {
    const skill = SKILLS.find((s) => s.id === 'de.a1.article.die')!;
    const tanda = generateRepairSet(skill, 5);
    expect(tanda).toHaveLength(5);
    for (const ej of tanda) {
      expect(ej.skillId).toBe(skill.id);
      const data = pintado(ej.render?.data);
      expect(data.answer ?? data.sentence).toBeTruthy();
    }
  });
});
