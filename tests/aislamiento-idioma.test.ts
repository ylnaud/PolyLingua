import { describe, it, expect, afterEach } from 'vitest';
import { SKILLS, SKILL_MAP } from '../src/data/skills';
import {
  REPAIR_TEMPLATES,
  REPAIR_GLOSSES,
  DEFAULT_GLOSS_LANG,
  repairTemplateFor,
  generateRepairSet,
  toRepairExercise,
} from '../src/lib/engine/exerciseGenerator';
import { es, en } from '../src/i18n/dictionary';

/**
 * Aislamiento entre el idioma META y el del USUARIO en el motor de refuerzo.
 *
 * Una plantilla mezcla los dos ejes: `sentence`/`answer` son del idioma que se
 * aprende y `explanation`/`translation` del que lo estudia. Como
 * REPAIR_TEMPLATES se indexa solo por `skillId` —que lleva el meta— una sola
 * entrada llegó a servir a es-de y a en-de, y el curso inglés recibía la
 * explicación en castellano.
 *
 * Estos tests son el candado de que eso no puede volver. No prueban que el
 * contenido inglés exista —hoy no existe, y es correcto que no exista— sino
 * que el sistema está PREPARADO para recibirlo sin filtrar otro idioma por el
 * camino.
 */

const ID = 'de.a1.wordorder.basic';

/** Marca inconfundible: si aparece donde no toca, se ve a simple vista. */
const MARCA = '⟦TEST-EN⟧';

function ponerGlosaDePrueba(skillId: string) {
  const base = REPAIR_TEMPLATES.find((t) => t.skillId === skillId)!;
  REPAIR_GLOSSES.en[skillId] = {
    explanation: `${MARCA} explanation`,
    translations: base.variations.map((_, i) => `${MARCA} translation ${i}`),
  };
  return base;
}

// Ningún dato de prueba sobrevive a su test, pase lo que pase.
afterEach(() => {
  for (const k of Object.keys(REPAIR_GLOSSES.en)) delete REPAIR_GLOSSES.en[k];
});

describe('escenario 1 — es → de encuentra su glosa y se comporta como antes', () => {
  it('devuelve la plantilla española tal cual, en las 253', () => {
    for (const base of REPAIR_TEMPLATES) {
      // No una muestra: TODAS. Un cambio de comportamiento en una sola de
      // ellas rompería un curso en producción.
      expect(repairTemplateFor(base.skillId, 'es'), base.skillId).toEqual(base);
    }
  });

  it('la llamada sin idioma sigue siendo la española', () => {
    // Compatibilidad: el defecto existe para que nada que aún no pase el
    // idioma cambie de comportamiento.
    for (const base of REPAIR_TEMPLATES) {
      expect(repairTemplateFor(base.skillId)).toEqual(base);
      expect(repairTemplateFor(base.skillId, DEFAULT_GLOSS_LANG)).toEqual(base);
    }
  });

  it('la glosa española tiene contenido de verdad', () => {
    // Si esto fallara, el test de arriba pasaría comparando dos vacíos.
    const base = repairTemplateFor(ID, 'es')!;
    expect(base.explanation.length).toBeGreaterThan(20);
    expect(base.variations.length).toBeGreaterThan(0);
    expect(base.variations[0].translation).toBeTruthy();
  });
});

describe('escenario 2 — en → de con el mapa vacío', () => {
  it('el mapa está vacío (si no, los tests de abajo no prueban nada)', () => {
    expect(Object.keys(REPAIR_GLOSSES.en)).toEqual([]);
  });

  it('devuelve null para las 253 plantillas', () => {
    for (const t of REPAIR_TEMPLATES) {
      expect(repairTemplateFor(t.skillId, 'en'), `${t.skillId} filtró contenido`).toBeNull();
    }
  });

  it('no hay tanda de reparación, así que no se abre bucle', () => {
    // Es la señal que leen los dos caminos: sin plantilla no hay con qué
    // insistir y el bucle no llega a abrirse.
    for (const s of SKILLS.filter((x) => x.lang === 'de')) {
      expect(generateRepairSet(s, 5, 'en'), s.id).toEqual([]);
    }
  });

  it('no devuelve español por ninguna vía', () => {
    for (const t of REPAIR_TEMPLATES.filter((x) => x.skillId.startsWith('de.'))) {
      const r = repairTemplateFor(t.skillId, 'en');
      expect(r).toBeNull();
      // Y explícitamente: lo que sea que devuelva no puede ser la española.
      expect(r?.explanation).not.toBe(t.explanation);
    }
  });
});

describe('escenario 3 — en → de con una glosa inglesa de prueba', () => {
  it('devuelve la glosa inglesa y NUNCA consulta la española', () => {
    const base = ponerGlosaDePrueba(ID);
    const r = repairTemplateFor(ID, 'en')!;

    expect(r).not.toBeNull();
    expect(r.explanation).toBe(`${MARCA} explanation`);
    // Lo que importa: la española no aparece por ningún lado.
    expect(r.explanation).not.toBe(base.explanation);
    expect(JSON.stringify(r)).not.toContain(base.explanation);
    for (const v of base.variations) {
      if (v.translation) expect(JSON.stringify(r)).not.toContain(v.translation);
    }
  });

  it('conserva intactas las frases del idioma meta', () => {
    const base = ponerGlosaDePrueba(ID);
    const r = repairTemplateFor(ID, 'en')!;
    // El alemán no depende de quién estudie: tiene que ser el mismo.
    expect(r.variations.map((v) => v.sentence)).toEqual(base.variations.map((v) => v.sentence));
    expect(r.variations.map((v) => v.answer)).toEqual(base.variations.map((v) => v.answer));
    expect(r.variations.map((v) => v.kind)).toEqual(base.variations.map((v) => v.kind));
    expect(r.skillId).toBe(base.skillId);
  });

  it('es y en coexisten: pedir una no contamina la otra', () => {
    const base = ponerGlosaDePrueba(ID);
    // Alternar los dos idiomas varias veces; ninguno debe arrastrar al otro.
    for (let i = 0; i < 3; i++) {
      expect(repairTemplateFor(ID, 'en')!.explanation).toBe(`${MARCA} explanation`);
      expect(repairTemplateFor(ID, 'es')!.explanation).toBe(base.explanation);
    }
    // Y la plantilla original no se ha mutado por el camino.
    expect(REPAIR_TEMPLATES.find((t) => t.skillId === ID)).toEqual(base);
  });

  it('la glosa solo afecta a su propia habilidad', () => {
    ponerGlosaDePrueba(ID);
    const otras = REPAIR_TEMPLATES.filter((t) => t.skillId !== ID);
    for (const t of otras) expect(repairTemplateFor(t.skillId, 'en'), t.skillId).toBeNull();
  });
});

describe('escenario 4 — skillNames', () => {
  /** La expresión exacta que usan practicar.astro y DrillTutor.astro. */
  const mostrado = (id: string, mapa: Record<string, string>) => mapa[id] ?? SKILL_MAP[id].name;

  it('el español conserva sus nombres: su mapa sigue vacío', () => {
    // es-de lee del catálogo, que ya está en su idioma. Traducir ahí sería
    // duplicar el español en dos sitios.
    expect(es.skillNames).toEqual({});
    for (const s of SKILLS.filter((x) => x.lang === 'de'))
      expect(mostrado(s.id, es.skillNames)).toBe(s.name);
  });

  it('en usa dict.skillNames en las 95 habilidades alemanas', () => {
    const de = SKILLS.filter((s) => s.lang === 'de');
    expect(de).toHaveLength(95);
    for (const s of de)
      expect(
        Object.prototype.hasOwnProperty.call(en.skillNames, s.id),
        `${s.id} sin nombre inglés`,
      ).toBe(true);
  });

  it('ninguna de las 95 cae al nombre del catálogo por falta de traducción', () => {
    // Dos coinciden con el español a propósito y no son una caída: una lista
    // de letras («sch, ch, ck, st, sp») y un término técnico alemán
    // («Funktionsverbgefüge»), que se escriben igual en los dos idiomas. Por
    // eso se comprueba que tengan CLAVE PROPIA, no que el texto difiera.
    for (const s of SKILLS.filter((x) => x.lang === 'de')) {
      const propia = Object.prototype.hasOwnProperty.call(en.skillNames, s.id);
      expect(propia, `${s.id} caería al catálogo español`).toBe(true);
    }
  });

  it('ningún nombre inglés lleva marcas del español', () => {
    const marcas =
      /[áéíóúñ¿¡]|\b(el|la|los|las|del|con|para|verbo|frase|palabras|preposiciones|pronombres)\b/i;
    for (const [id, n] of Object.entries(en.skillNames))
      expect(marcas.test(n), `${id}: «${n}»`).toBe(false);
  });

  it('el mapa no inventa habilidades que no existan', () => {
    const ids = new Set(SKILLS.map((s) => s.id));
    for (const id of Object.keys(en.skillNames)) expect(ids.has(id), `${id} no existe`).toBe(true);
  });

  it('una skill sin localizar mantiene el fallback sin romper nada', () => {
    // El mecanismo sigue existiendo para los idiomas que aún no se traduzcan:
    // se comprueba con una skill de otro idioma meta, que no entra en este
    // trabajo y por tanto no tiene entrada.
    const otra = SKILLS.find((s) => s.lang === 'fr')!;
    expect(Object.prototype.hasOwnProperty.call(en.skillNames, otra.id)).toBe(false);
    expect(mostrado(otra.id, en.skillNames)).toBe(otra.name);
    expect(mostrado(otra.id, en.skillNames).length).toBeGreaterThan(0);
  });

  it('toda habilidad tiene un nombre al que caer', () => {
    for (const s of SKILLS) expect(mostrado(s.id, en.skillNames).length, s.id).toBeGreaterThan(0);
  });
});

describe('escenario 5 — los dos caminos de reparación', () => {
  it('camino de practicar.astro (reparación intensiva)', () => {
    const skill = SKILLS.find((s) => s.id === ID)!;
    // Sin glosa: no hay tanda, y la página cae al generateExercise normal.
    expect(generateRepairSet(skill, 5, 'en')).toEqual([]);
    // Con glosa: hay tanda, y lleva el texto inglés.
    ponerGlosaDePrueba(ID);
    const tanda = generateRepairSet(skill, 3, 'en');
    expect(tanda).toHaveLength(3);
    for (const ej of tanda) {
      expect(ej.explanation).toBe(`${MARCA} explanation`);
      expect(ej.skillId).toBe(ID);
    }
    // Y en español sigue dando la tanda española.
    expect(generateRepairSet(skill, 3, 'es')[0].explanation).not.toBe(`${MARCA} explanation`);
  });

  it('camino de DrillTutor (plantilla + toRepairExercise)', () => {
    const skill = SKILLS.find((s) => s.id === ID)!;
    // Sin glosa el tutor no encuentra plantilla y no abre bucle.
    expect(repairTemplateFor(ID, 'en')).toBeNull();

    ponerGlosaDePrueba(ID);
    const plantilla = repairTemplateFor(ID, 'en')!;
    const ej = toRepairExercise(skill, plantilla, plantilla.variations[0], 0);
    expect(ej.explanation).toBe(`${MARCA} explanation`);
    const data = ej.render?.data as { translation?: string; sentence?: string };
    expect(data.translation).toBe(`${MARCA} translation 0`);
    // La frase alemana insertada es la de siempre.
    const base = REPAIR_TEMPLATES.find((t) => t.skillId === ID)!;
    expect(data.sentence).toBe(base.variations[0].sentence);
  });
});

describe('escenario 6 — en → de no puede caer a ningún otro idioma', () => {
  it('los skillId son únicos, así que la búsqueda no puede cruzarse', () => {
    const ids = REPAIR_TEMPLATES.map((t) => t.skillId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('una skill alemana nunca devuelve una plantilla de otro idioma meta', () => {
    ponerGlosaDePrueba(ID);
    const r = repairTemplateFor(ID, 'en')!;
    expect(r.skillId.startsWith('de.')).toBe(true);
    // Y ninguna de sus frases sale de una plantilla fr/it/pt/en.
    const ajenas = REPAIR_TEMPLATES.filter((t) => !t.skillId.startsWith('de.')).flatMap((t) =>
      t.variations.map((v) => v.sentence),
    );
    for (const v of r.variations) expect(ajenas).not.toContain(v.sentence);
  });

  it('un idioma de usuario sin mapa devuelve null, no el de otro', () => {
    // fr, it, pt y un idioma inventado: ninguno tiene entrada en
    // REPAIR_GLOSSES, así que todos caen a null — nunca al español.
    for (const lang of ['fr', 'it', 'pt', 'xx', '']) {
      expect(repairTemplateFor(ID, lang), lang).toBeNull();
    }
  });

  it('poner una glosa inglesa no la hace visible para otro idioma', () => {
    ponerGlosaDePrueba(ID);
    for (const lang of ['fr', 'it', 'pt', 'xx']) {
      expect(repairTemplateFor(ID, lang), lang).toBeNull();
    }
    // El español sigue viendo la suya, no la inglesa.
    expect(repairTemplateFor(ID, 'es')!.explanation).not.toContain(MARCA);
  });
});

describe('escenario 7 — es → de intacto', () => {
  it('ninguna plantilla ha sido mutada por los tests de arriba', () => {
    // Los tests inyectan glosas; si alguna hubiera mutado el array base en vez
    // de copiarlo, se vería acá.
    for (const t of REPAIR_TEMPLATES) {
      expect(JSON.stringify(t)).not.toContain(MARCA);
    }
  });

  it('el mapa de glosas queda limpio al terminar', () => {
    expect(Object.keys(REPAIR_GLOSSES.en)).toEqual([]);
  });

  it('las tandas españolas siguen completas', () => {
    const skill = SKILLS.find((s) => s.id === 'de.a1.article.die')!;
    const tanda = generateRepairSet(skill, 5, 'es');
    expect(tanda).toHaveLength(5);
    for (const ej of tanda) expect(ej.explanation).toBeTruthy();
  });
});
