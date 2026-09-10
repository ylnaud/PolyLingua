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
 * Estos tests son el candado de que eso no puede volver: sin glosa en el
 * idioma pedido se devuelve `null`, nunca la de otro idioma.
 */

/** Una habilidad CON glosa inglesa (tanda A1). */
const CON = 'de.a1.wordorder.basic';
/**
 * Una SIN glosa inglesa, y que nunca la va a tener: no es `de.*`. Tras U-02
 * (A2-C2 completo — ver `tests/engine.test.ts`, describe "glosa de las
 * plantillas por idioma de usuario") ya no queda ningún skillId alemán con
 * plantilla y sin glosa — hace falta una de otro idioma meta, que por
 * arquitectura no tiene curso con interfaz inglesa (`en-de` es el único).
 */
const SIN = 'en.a1.verb.to-be';

/** Marca inconfundible: si aparece donde no toca, se ve a simple vista. */
const MARCA = '⟦TEST-EN⟧';

/**
 * Las glosas reales, capturadas al cargar el módulo.
 *
 * El `afterEach` restaura EXACTAMENTE esto en vez de vaciar el mapa: vaciarlo
 * borraría las 17 entradas A1 de verdad y los tests siguientes medirían sobre
 * un mapa vacío sin enterarse.
 */
const REALES = { ...REPAIR_GLOSSES.en };

function ponerGlosaDePrueba(skillId: string) {
  const base = REPAIR_TEMPLATES.find((t) => t.skillId === skillId)!;
  REPAIR_GLOSSES.en[skillId] = {
    explanation: `${MARCA} explanation`,
    translations: base.variations.map((_, i) => `${MARCA} translation ${i}`),
  };
  return base;
}

afterEach(() => {
  for (const k of Object.keys(REPAIR_GLOSSES.en)) delete REPAIR_GLOSSES.en[k];
  Object.assign(REPAIR_GLOSSES.en, REALES);
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
    for (const base of REPAIR_TEMPLATES) {
      expect(repairTemplateFor(base.skillId)).toEqual(base);
      expect(repairTemplateFor(base.skillId, DEFAULT_GLOSS_LANG)).toEqual(base);
    }
  });

  it('tener glosa inglesa no altera la española de esa misma habilidad', () => {
    const base = REPAIR_TEMPLATES.find((t) => t.skillId === CON)!;
    const esp = repairTemplateFor(CON, 'es')!;
    expect(esp).toEqual(base);
    expect(esp.explanation).toBe(base.explanation);
    expect(esp.variations[0].translation).toBe(base.variations[0].translation);
  });
});

describe('escenario 2 — una habilidad sin glosa inglesa', () => {
  it('devuelve null', () => {
    expect(repairTemplateFor(SIN, 'en')).toBeNull();
  });

  it('null en todas las plantillas que aún no tienen glosa', () => {
    const sinGlosa = REPAIR_TEMPLATES.filter((t) => !REPAIR_GLOSSES.en[t.skillId]);
    expect(sinGlosa.length).toBeGreaterThan(0);
    for (const t of sinGlosa) {
      expect(repairTemplateFor(t.skillId, 'en'), `${t.skillId} filtró contenido`).toBeNull();
    }
  });

  it('sin glosa no hay tanda de reparación, así que no se abre bucle', () => {
    const skill = SKILL_MAP[SIN];
    expect(generateRepairSet(skill, 5, 'en')).toEqual([]);
  });

  it('no devuelve español por ninguna vía', () => {
    for (const t of REPAIR_TEMPLATES.filter((x) => !REPAIR_GLOSSES.en[x.skillId])) {
      const r = repairTemplateFor(t.skillId, 'en');
      expect(r).toBeNull();
      expect(r?.explanation).not.toBe(t.explanation);
    }
  });
});

describe('escenario 3 — glosa inglesa inyectada', () => {
  it('devuelve la glosa inglesa y NUNCA consulta la española', () => {
    const base = ponerGlosaDePrueba(SIN);
    const r = repairTemplateFor(SIN, 'en')!;

    expect(r.explanation).toBe(`${MARCA} explanation`);
    expect(JSON.stringify(r)).not.toContain(base.explanation);
    for (const v of base.variations) {
      if (v.translation) expect(JSON.stringify(r)).not.toContain(v.translation);
    }
  });

  it('conserva intactas las frases del idioma meta', () => {
    const base = ponerGlosaDePrueba(SIN);
    const r = repairTemplateFor(SIN, 'en')!;
    expect(r.variations.map((v) => v.sentence)).toEqual(base.variations.map((v) => v.sentence));
    expect(r.variations.map((v) => v.answer)).toEqual(base.variations.map((v) => v.answer));
    expect(r.variations.map((v) => v.kind)).toEqual(base.variations.map((v) => v.kind));
    expect(r.skillId).toBe(base.skillId);
  });

  it('es y en coexisten: pedir una no contamina la otra', () => {
    const base = ponerGlosaDePrueba(SIN);
    for (let i = 0; i < 3; i++) {
      expect(repairTemplateFor(SIN, 'en')!.explanation).toBe(`${MARCA} explanation`);
      expect(repairTemplateFor(SIN, 'es')!.explanation).toBe(base.explanation);
    }
    expect(REPAIR_TEMPLATES.find((t) => t.skillId === SIN)).toEqual(base);
  });
});

describe('escenario 4 — skillNames', () => {
  /** La expresión exacta que usan practicar.astro y DrillTutor.astro. */
  const mostrado = (id: string, mapa: Record<string, string>) => mapa[id] ?? SKILL_MAP[id].name;

  it('el español conserva sus nombres: su mapa sigue vacío', () => {
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
    const otra = SKILLS.find((s) => s.lang === 'fr')!;
    expect(Object.prototype.hasOwnProperty.call(en.skillNames, otra.id)).toBe(false);
    expect(mostrado(otra.id, en.skillNames)).toBe(otra.name);
  });
});

describe('escenario 5 — los dos caminos de reparación', () => {
  it('camino de practicar.astro (reparación intensiva)', () => {
    const skill = SKILL_MAP[SIN];
    expect(generateRepairSet(skill, 5, 'en')).toEqual([]);
    ponerGlosaDePrueba(SIN);
    const tanda = generateRepairSet(skill, 3, 'en');
    expect(tanda).toHaveLength(3);
    for (const ej of tanda) expect(ej.explanation).toBe(`${MARCA} explanation`);
    expect(generateRepairSet(skill, 3, 'es')[0].explanation).not.toBe(`${MARCA} explanation`);
  });

  it('camino de DrillTutor (plantilla + toRepairExercise)', () => {
    const skill = SKILL_MAP[SIN];
    expect(repairTemplateFor(SIN, 'en')).toBeNull();
    ponerGlosaDePrueba(SIN);
    const plantilla = repairTemplateFor(SIN, 'en')!;
    const ej = toRepairExercise(skill, plantilla, plantilla.variations[0], 0);
    expect(ej.explanation).toBe(`${MARCA} explanation`);
    const data = ej.render?.data as { translation?: string; sentence?: string };
    expect(data.translation).toBe(`${MARCA} translation 0`);
    const base = REPAIR_TEMPLATES.find((t) => t.skillId === SIN)!;
    expect(data.sentence).toBe(base.variations[0].sentence);
  });
});

describe('escenario 6 — en → de no puede caer a ningún otro idioma', () => {
  it('los skillId son únicos, así que la búsqueda no puede cruzarse', () => {
    const ids = REPAIR_TEMPLATES.map((t) => t.skillId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('una skill alemana nunca devuelve una plantilla de otro idioma meta', () => {
    const r = repairTemplateFor(CON, 'en')!;
    expect(r.skillId.startsWith('de.')).toBe(true);
    const ajenas = REPAIR_TEMPLATES.filter((t) => !t.skillId.startsWith('de.')).flatMap((t) =>
      t.variations.map((v) => v.sentence),
    );
    for (const v of r.variations) expect(ajenas).not.toContain(v.sentence);
  });

  it('un idioma de usuario sin mapa devuelve null, no el de otro', () => {
    for (const lang of ['fr', 'it', 'pt', 'xx', '']) {
      expect(repairTemplateFor(CON, lang), lang).toBeNull();
      expect(repairTemplateFor(SIN, lang), lang).toBeNull();
    }
  });
});

describe('escenario 7 — es → de intacto', () => {
  it('ninguna plantilla ha sido mutada por los tests de arriba', () => {
    for (const t of REPAIR_TEMPLATES) expect(JSON.stringify(t)).not.toContain(MARCA);
  });

  it('el mapa de glosas vuelve a su contenido real al terminar cada test', () => {
    expect(Object.keys(REPAIR_GLOSSES.en).sort()).toEqual(Object.keys(REALES).sort());
    for (const [id, g] of Object.entries(REPAIR_GLOSSES.en))
      expect(g.explanation).not.toContain(MARCA);
  });

  it('las tandas españolas siguen completas', () => {
    const skill = SKILL_MAP['de.a1.article.die'];
    const tanda = generateRepairSet(skill, 5, 'es');
    expect(tanda).toHaveLength(5);
    for (const ej of tanda) expect(ej.explanation).toBeTruthy();
  });
});

/**
 * La tanda A1 de glosas inglesas.
 *
 * Es la primera con contenido real, así que estos candados vigilan tanto que
 * esté completa como que no se haya colado nada de más ni en otro idioma.
 */
describe('tanda A1 — las 17 glosas inglesas', () => {
  const A1 = [
    'de.a1.wordorder.time-verb-subject',
    'de.a1.wordorder.basic',
    'de.a1.article.der-die-das',
    'de.a1.article.der',
    'de.a1.article.die',
    'de.a1.article.das',
    'de.a1.question.words',
    'de.a1.wordorder.questions',
    'de.a1.verb.present-regular',
    'de.a1.verb.present-irregular',
    'de.a1.verb.sein',
    'de.a1.verb.haben',
    'de.a1.pronoun.personal',
    'de.a1.negation.nicht-kein',
    'de.a1.noun.plural',
    'de.a1.verb.imperative',
    'de.a1.preposition.place-time',
  ];

  /** Solo las de A1, filtradas del mapa completo (que desde U-02 también lleva A2-C2). */
  const soloA1 = () => Object.keys(REPAIR_GLOSSES.en).filter((id) => id.startsWith('de.a1.'));

  it('hay exactamente 17', () => {
    expect(soloA1()).toHaveLength(17);
  });

  it('son exactamente esas 17, sin sobrantes', () => {
    expect(soloA1().sort()).toEqual([...A1].sort());
  });

  it('cada skillId existe de verdad en REPAIR_TEMPLATES', () => {
    const ids = new Set(REPAIR_TEMPLATES.map((t) => t.skillId));
    for (const id of Object.keys(REPAIR_GLOSSES.en)) expect(ids.has(id), id).toBe(true);
  });

  it('cada glosa tiene explanation con contenido', () => {
    for (const [id, g] of Object.entries(REPAIR_GLOSSES.en)) {
      expect(g.explanation, id).toBeTruthy();
      expect(g.explanation.length, id).toBeGreaterThan(30);
    }
  });

  it('repairTemplateFor(id, en) devuelve la glosa inglesa en las 17', () => {
    for (const id of A1) {
      const r = repairTemplateFor(id, 'en');
      expect(r, id).not.toBeNull();
      expect(r!.explanation, id).toBe(REPAIR_GLOSSES.en[id].explanation);
    }
  });

  it('repairTemplateFor(id, es) sigue devolviendo el español original', () => {
    for (const id of A1) {
      const base = REPAIR_TEMPLATES.find((t) => t.skillId === id)!;
      expect(repairTemplateFor(id, 'es'), id).toEqual(base);
    }
  });

  it('la inglesa NUNCA es la española: no hay fallback', () => {
    for (const id of A1) {
      const base = REPAIR_TEMPLATES.find((t) => t.skillId === id)!;
      expect(repairTemplateFor(id, 'en')!.explanation, id).not.toBe(base.explanation);
    }
  });

  it('ninguna glosa inglesa lleva español evidente', () => {
    // Solo palabras que NO existen en inglés: `plural`, `general` o `hay` sí
    // existen y darían falsos positivos (ya me pasó midiendo otra cosa).
    //
    // `masculino`/`femenino` se agregaron al ampliar el control a las 61
    // (U-02, A2-C2): sin ellas, `de.b2.preposition.genitiv` —cuya explicación
    // española no lleva tilde, ñ ni ninguna otra palabra de la lista— pasaba
    // el control invertido de abajo sin que la regex la detectara.
    //
    // `los` lleva `(?<!-)` porque es también un morfema alemán real: la glosa
    // de `de.c1.wordformation.affixes` explica el sufijo «-los» (hoffnungslos)
    // y sin la exclusión el guion delante no evita el límite de palabra. Ya
    // pasó lo mismo con este morfema en el detector de U-01
    // (`tests/lib/spanish-scan.ts`) — se acota la ocurrencia conocida, no se
    // quita `los` de la lista.
    const marcas =
      /[áéíóúñ¿¡]|\b(el|las|del|una|pero|verbo|frase|palabra|palabras|segunda|posicion|siempre|articulo|sustantivo|persona|personas|cambian?|lleva|todo|todos|otras?|demas|mismo|misma|masculino|femenino)\b|(?<!-)\blos\b/i;

    // Control: la regex TIENE que marcar los originales españoles. Sin esto,
    // una regex rota pasaría el test de abajo sin detectar nada.
    const originales = REPAIR_TEMPLATES.filter((t) => REPAIR_GLOSSES.en[t.skillId]);
    const marcados = originales.filter((t) => marcas.test(t.explanation));
    expect(marcados.length, 'la regex no detecta español: no mide nada').toBe(originales.length);

    for (const [id, g] of Object.entries(REPAIR_GLOSSES.en)) {
      const m = g.explanation.match(marcas);
      expect(m, `${id}: «${m?.[0]}» en «${g.explanation.slice(0, 70)}…»`).toBeNull();
    }
  });

  it('no se introducen asteriscos de markdown nuevos', () => {
    // Los consumidores pintan con textContent, así que un ** saldría literal.
    // El original de wordorder.time-verb-subject los lleva; la glosa no.
    for (const [id, g] of Object.entries(REPAIR_GLOSSES.en))
      expect(g.explanation.includes('**'), id).toBe(false);
  });

  it('la plantilla alemana original no se ha tocado', () => {
    for (const id of A1) {
      const base = REPAIR_TEMPLATES.find((t) => t.skillId === id)!;
      expect(base.explanation, id).toBeTruthy();
      // Sigue siendo española: la glosa no la reemplaza, convive con ella.
      expect(base.explanation, id).not.toBe(REPAIR_GLOSSES.en[id].explanation);
      expect(
        base.variations.every((v) => v.translation),
        id,
      ).toBe(true);
    }
  });

  it('las 128 translations están, una por variación y en su índice', () => {
    let total = 0;
    for (const id of A1) {
      const base = REPAIR_TEMPLATES.find((t) => t.skillId === id)!;
      const tr = REPAIR_GLOSSES.en[id].translations;
      expect(
        tr.length,
        `${id}: ${tr.length} traducciones para ${base.variations.length} variaciones`,
      ).toBe(base.variations.length);
      tr.forEach((t, i) => {
        expect(typeof t, `${id}[${i}]`).toBe('string');
        expect(t.trim().length, `${id}[${i}] vacía`).toBeGreaterThan(0);
      });
      total += tr.length;
    }
    expect(total).toBe(128);
  });

  /**
   * Correspondencia POR ÍNDICE.
   *
   * Contar 128 no detecta un array desplazado: si la traducción 3 acaba en la
   * posición 4, los conteos siguen cuadrando y el alumno ve la frase que no es.
   * Se compara la FORMA de cada original con la de su traducción —interrogación,
   * flecha del plural, paréntesis pedagógico— que es lo que se conserva al
   * traducir y lo que se rompe al desplazar.
   */
  it('cada traducción conserva la forma de SU variación, no la de otra', () => {
    for (const id of A1) {
      const base = REPAIR_TEMPLATES.find((t) => t.skillId === id)!;
      const tr = REPAIR_GLOSSES.en[id].translations;
      base.variations.forEach((v, i) => {
        const o = v.translation ?? '';
        const n = tr[i];
        expect(n.trim().endsWith('?'), `${id}[${i}] interrogación: «${o}» → «${n}»`).toBe(
          o.trim().endsWith('?'),
        );
        expect(n.includes('→'), `${id}[${i}] flecha: «${o}» → «${n}»`).toBe(o.includes('→'));
        expect(n.includes('('), `${id}[${i}] paréntesis: «${o}» → «${n}»`).toBe(o.includes('('));
      });
    }
  });

  /**
   * Anclas textuales: nombres propios que aparecen IGUAL en la frase alemana y
   * en su traducción inglesa (Berlin, Anna, Peter, Müller…).
   *
   * Es el único candado que ata una traducción a SU variación concreta. El de
   * la forma no llega: intercambiar dos entradas con la misma pinta —las dos
   * con flecha, las dos sin paréntesis— lo pasa sin enterarse. Lo comprobé
   * intercambiando dos del plural y no saltó.
   *
   * Cubre 9 de las 128. Para el resto no hay señal comprobable sin un
   * diccionario bilingüe, así que la garantía es parcial y conviene saberlo.
   */
  it('las traducciones con nombre propio corresponden a SU frase alemana', () => {
    let ancladas = 0;
    for (const id of A1) {
      const base = REPAIR_TEMPLATES.find((t) => t.skillId === id)!;
      base.variations.forEach((v, i) => {
        const propios = v.sentence.match(/\b[A-ZÄÖÜ][a-zäöüß]{3,}\b/g) ?? [];
        for (const w of propios) {
          // Solo los que de verdad viajan a la traducción: Berlin sí, Zeitung no.
          if (
            !base.variations.some((_, j) =>
              (REPAIR_GLOSSES.en[id].translations[j] ?? '').includes(w),
            )
          )
            continue;
          expect(
            REPAIR_GLOSSES.en[id].translations[i],
            `${id}[${i}] no menciona «${w}», que sí está en «${v.sentence}»`,
          ).toContain(w);
          ancladas++;
        }
      });
    }
    expect(ancladas, 'no se ancló ninguna: el candado no mide nada').toBeGreaterThanOrEqual(9);
  });

  it('la primera y la última de cada skill están fijadas', () => {
    // Pinta los extremos: una rotación o un reverso del array cae aquí aunque
    // todas las entradas tengan la misma forma.
    expect(REPAIR_GLOSSES.en['de.a1.noun.plural'].translations[0]).toBe('the table → the tables');
    expect(REPAIR_GLOSSES.en['de.a1.noun.plural'].translations[7]).toBe(
      'the teacher → the teachers (no change)',
    );
    expect(REPAIR_GLOSSES.en['de.a1.verb.sein'].translations[0]).toBe('I am tired.');
    expect(REPAIR_GLOSSES.en['de.a1.verb.sein'].translations[7]).toBe('Are you a teacher?');
    expect(REPAIR_GLOSSES.en['de.a1.question.words'].translations[0]).toBe('What is your name?');
    expect(REPAIR_GLOSSES.en['de.a1.question.words'].translations[7]).toBe(
      'Where are you going to?',
    );
    expect(REPAIR_GLOSSES.en['de.a1.wordorder.questions'].translations[0]).toBe(
      'When does the course begin?',
    );
    expect(REPAIR_GLOSSES.en['de.a1.wordorder.questions'].translations[5]).toBe(
      'What are you doing at the weekend?',
    );
  });

  it('las 6 de wordorder.questions son el enunciado: preguntas, no fichas', () => {
    // En `order` la traducción va DELANTE de las fichas y es lo único que dice
    // qué frase montar. Sin ella el ejercicio no tiene objetivo.
    const base = REPAIR_TEMPLATES.find((t) => t.skillId === 'de.a1.wordorder.questions')!;
    const tr = REPAIR_GLOSSES.en['de.a1.wordorder.questions'].translations;
    expect(base.variations.every((v) => v.kind === 'order')).toBe(true);
    expect(tr).toHaveLength(6);
    for (const t of tr) expect(t.trim().endsWith('?'), `«${t}» no es una pregunta`).toBe(true);
  });

  it('los 9 paréntesis pedagógicos sobreviven a la traducción', () => {
    const conNota: string[] = [];
    for (const id of A1) {
      const base = REPAIR_TEMPLATES.find((t) => t.skillId === id)!;
      base.variations.forEach((v, i) => {
        if ((v.translation ?? '').includes('(')) {
          conNota.push(`${id}[${i}]`);
          expect(REPAIR_GLOSSES.en[id].translations[i], `${id}[${i}] perdió la nota`).toContain(
            '(',
          );
        }
      });
    }
    expect(conNota).toHaveLength(9);
  });

  it('ninguna traducción inglesa lleva español evidente', () => {
    const marcas =
      /[áéíóúñ¿¡]|\b(el|los|las|del|una|pero|con|hermano|hermana|libro|mesa|casa|noche|tengo|tienes|tiene|estoy|somos|vivo|vives|vive|niño|niña|niños|mujer|profesor|profesora|coche|periodico|silla|excepcion|cambio|sin|los)\b/i;

    // Control: la regex TIENE que marcar los originales españoles.
    const originales = A1.flatMap(
      (id) => REPAIR_TEMPLATES.find((t) => t.skillId === id)!.variations,
    ).map((v) => v.translation ?? '');
    const marcados = originales.filter((o) => marcas.test(o));
    expect(marcados.length, 'la regex no detecta español: no mide nada').toBeGreaterThan(100);

    for (const id of A1)
      REPAIR_GLOSSES.en[id].translations.forEach((t, i) => {
        const m = t.match(marcas);
        expect(m, `${id}[${i}]: «${m?.[0]}» en «${t}»`).toBeNull();
      });
  });

  it('en devuelve las inglesas y es sigue devolviendo las españolas', () => {
    for (const id of A1) {
      const base = REPAIR_TEMPLATES.find((t) => t.skillId === id)!;
      const ing = repairTemplateFor(id, 'en')!;
      const esp = repairTemplateFor(id, 'es')!;
      ing.variations.forEach((v, i) => {
        expect(v.translation, `${id}[${i}]`).toBe(REPAIR_GLOSSES.en[id].translations[i]);
        expect(v.translation, `${id}[${i}] devolvió la española`).not.toBe(
          base.variations[i].translation,
        );
        // La frase alemana, intacta en las dos.
        expect(v.sentence).toBe(base.variations[i].sentence);
        expect(v.answer).toBe(base.variations[i].answer);
      });
      expect(esp).toEqual(base);
    }
  });

  it('rellenar las translations no ha mutado REPAIR_TEMPLATES', () => {
    for (const id of A1) {
      const base = REPAIR_TEMPLATES.find((t) => t.skillId === id)!;
      // Las 128 originales siguen ahí y siguen siendo españolas.
      expect(
        base.variations.every((v) => v.translation),
        id,
      ).toBe(true);
      for (const v of base.variations)
        expect(REPAIR_GLOSSES.en[id].translations).not.toContain(v.translation);
    }
  });
});
