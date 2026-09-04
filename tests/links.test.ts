import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  proposeLinks,
  buildRelations,
  anchorPara,
  UMBRAL,
  MAX_POR_PAGINA,
  type Entrada,
  type PageRecord,
} from '../src/lib/links/engine';
import { anclaDeNivel } from '../src/lib/links/labels';
import { TSA, TSA_LANG } from '../src/data/tsa';

const ROOT = join(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');

function pagina(p: Partial<PageRecord> & { route: string }): PageRecord {
  return {
    kind: 'leccion',
    userLang: 'es',
    targetLang: 'de',
    level: 'a1',
    unit: null,
    order: null,
    title: 'Título',
    grammarTopic: null,
    skills: [],
    situation: null,
    tags: [],
    indexable: true,
    ...p,
  };
}

/** Un curso mínimo con una cadena de prerrequisitos real. */
function fixture(): Entrada {
  return {
    pages: [
      pagina({
        route: '/es/de/a1/genero',
        skills: ['de.a1.article.gender'],
        unit: 1,
        grammarTopic: 'El género',
      }),
      pagina({
        route: '/es/de/a2/dativo',
        level: 'a2',
        skills: ['de.a2.case.dativ'],
        unit: 1,
        grammarTopic: 'El dativo',
      }),
      pagina({ route: '/es/de/a1/otra', unit: 1, grammarTopic: 'Otra cosa' }),
      pagina({ route: '/es/de/a1/tercera', unit: 1, grammarTopic: 'Tercera cosa' }),
      pagina({ route: '/es/de/a1/cuarta', unit: 1, grammarTopic: 'Cuarta cosa' }),
      // Otro curso: nada debería cruzar hacia acá.
      pagina({
        route: '/es/fr/a1/genre',
        targetLang: 'fr',
        skills: ['de.a1.article.gender'],
        unit: 1,
      }),
      // Silo inactivo: no se enlaza ni desde ni hacia.
      pagina({
        route: '/en/de/a1/gender',
        userLang: 'en',
        skills: ['de.a2.case.dativ'],
        unit: 1,
        indexable: false,
      }),
    ],
    skills: [
      { id: 'de.a1.article.gender', prerequisites: [] },
      { id: 'de.a2.case.dativ', prerequisites: ['de.a1.article.gender'] },
    ],
    languages: [{ id: 'de', name: 'Alemán' }],
  };
}

describe('motor de enlaces internos', () => {
  it('propone el prerrequisito declarado, y la continuación al revés', () => {
    const r = proposeLinks(fixture());
    expect(r.get('/es/de/a2/dativo')?.map((p) => p.hasta)).toContain('/es/de/a1/genero');
    const vuelta = r.get('/es/de/a1/genero')?.find((p) => p.hasta === '/es/de/a2/dativo');
    expect(vuelta?.motivo).toBe('continuacion');
  });

  // El candado central: una URL propuesta que no exista es un fallo de build.
  it('revienta si un destino no está en el índice de páginas', () => {
    const entrada = fixture();
    const roto: Entrada = {
      ...entrada,
      // Se quita la página destino pero se deja la relación que la nombra.
      pages: entrada.pages.filter((p) => p.route !== '/es/de/a1/genero'),
    };
    // Sin la página destino, la relación ni siquiera se genera: no hay forma
    // de que salga una ruta que no venga del propio índice.
    const r = proposeLinks(roto);
    for (const lista of r.values()) {
      for (const p of lista) expect(p.hasta).not.toBe('/es/de/a1/genero');
    }
  });

  it('nunca enlaza fuera del curso', () => {
    for (const [desde, lista] of proposeLinks(fixture())) {
      const curso = desde.split('/').slice(1, 3).join('/');
      for (const p of lista) {
        if (p.motivo === 'blog-curso' || p.motivo === 'curso-blog') continue;
        expect(p.hasta.split('/').slice(1, 3).join('/')).toBe(curso);
      }
    }
  });

  it('nunca enlaza una página a sí misma', () => {
    for (const [desde, lista] of proposeLinks(fixture())) {
      for (const p of lista) expect(p.hasta).not.toBe(desde);
    }
  });

  it('no enlaza ni desde ni hacia páginas no indexables', () => {
    const r = proposeLinks(fixture());
    expect(r.has('/en/de/a1/gender')).toBe(false);
    for (const lista of r.values()) {
      for (const p of lista) expect(p.hasta.startsWith('/en/')).toBe(false);
    }
  });

  it('respeta el tope por página y no repite destino ni ancla', () => {
    for (const lista of proposeLinks(fixture()).values()) {
      expect(lista.length).toBeLessThanOrEqual(MAX_POR_PAGINA);
      expect(new Set(lista.map((p) => p.hasta)).size).toBe(lista.length);
      expect(new Set(lista.map((p) => p.anchor.toLowerCase())).size).toBe(lista.length);
    }
  });

  // Sin este tope, "misma unidad" llenaba los tres huecos de las 400 lecciones
  // y dejaba fuera los prerrequisitos, que son la relación que aporta.
  it('deja como mucho un enlace de "misma unidad" por página', () => {
    for (const lista of proposeLinks(fixture()).values()) {
      expect(lista.filter((p) => p.motivo === 'misma-unidad').length).toBeLessThanOrEqual(1);
    }
  });

  it('descarta lo que no llegue al umbral, salvo los motivos de apoyo', () => {
    for (const lista of proposeLinks(fixture()).values()) {
      for (const p of lista) {
        if (p.motivo === 'misma-unidad') continue; // apoyo: se valida abajo
        expect(p.score).toBeGreaterThanOrEqual(UMBRAL);
      }
    }
  });

  // "Misma unidad" es un cajón del temario, no un tema: es-fr/a1/u1 mete en el
  // mismo saco los artículos y decir la hora. Sirve para completar un bloque
  // que ya tiene algo bueno, nunca para justificar uno entero.
  it('"misma unidad" nunca aparece como única evidencia de un bloque', () => {
    for (const lista of proposeLinks(fixture()).values()) {
      if (lista.every((p) => p.motivo === 'misma-unidad')) {
        throw new Error(`bloque sostenido solo por "misma-unidad": ${JSON.stringify(lista)}`);
      }
    }
  });

  it('"misma unidad" sí acompaña cuando ya hay una relación fuerte', () => {
    const conFuerte = proposeLinks(fixture()).get('/es/de/a2/dativo') ?? [];
    expect(conFuerte.some((p) => p.motivo === 'prerrequisito')).toBe(true);
  });

  it('una página cuyas únicas relaciones son de unidad se queda sin bloque', () => {
    const soloUnidad: Entrada = {
      pages: [
        pagina({ route: '/es/de/a1/uno', unit: 9, grammarTopic: 'Uno' }),
        pagina({ route: '/es/de/a1/dos', unit: 9, grammarTopic: 'Dos' }),
      ],
      skills: [],
      languages: [],
    };
    expect(proposeLinks(soloUnidad).size).toBe(0);
  });

  it('una página sin ninguna relación se queda sin bloque, no se rellena', () => {
    const sola: Entrada = {
      pages: [pagina({ route: '/es/de/a1/aislada', unit: 7 })],
      skills: [],
      languages: [],
    };
    expect(proposeLinks(sola).size).toBe(0);
  });

  // El texto del enlace sale del contenido del destino, nunca de una keyword.
  it('el ancla sale del grammarTopic o del título del destino', () => {
    expect(anchorPara(pagina({ route: '/x', grammarTopic: 'El dativo' }))).toBe('El dativo');
    expect(
      anchorPara(pagina({ route: '/x', title: 'Der, die, das: cómo funciona el género' })),
    ).toBe('Der, die, das');
  });

  // Los grammarTopic están escritos como encabezados de temario y llegan a 59
  // caracteres. Como texto de enlace eso no se lee.
  it('acorta el ancla larga quitando el paréntesis, que es la aclaración', () => {
    expect(
      anchorPara(
        pagina({ route: '/x', grammarTopic: 'Konjunktiv II (würde + Infinitiv, hätte, wäre)' }),
      ),
    ).toBe('Konjunktiv II');
    expect(
      anchorPara(
        pagina({
          route: '/x',
          grammarTopic: 'Nominalstil (estilo nominal) vs. Verbalstil (estilo verbal)',
          title: 'Nominalstil vs. Verbalstil: el registro escrito',
        }),
      ),
    ).toBe('Nominalstil vs. Verbalstil');
  });

  it('no toca un ancla que ya se lee bien', () => {
    const corta = 'Artículos determinados (der/die/das)';
    expect(anchorPara(pagina({ route: '/x', grammarTopic: corta }))).toBe(corta);
  });

  // Truncar por número de caracteres deja anclas partidas a media palabra, que
  // es peor que una larga.
  it('deja el ancla larga intacta si no hay nada que quitar sin partir palabras', () => {
    const sinParentesis = 'Perfekt para el pasado y presente para el futuro';
    expect(anchorPara(pagina({ route: '/x', grammarTopic: sinParentesis }))).toBe(sinParentesis);
  });

  it('la etiqueta de una página de nivel describe qué hay al otro lado', () => {
    expect(anclaDeNivel('Alemán', 'a1')).toBe('Todas las lecciones de alemán A1');
    expect(anclaDeNivel('Portugués', 'a2')).toBe('Todas las lecciones de portugués A2');
  });

  it('no inventa relaciones de vocabulario (esa regla no existe)', () => {
    const motivos = new Set(buildRelations(fixture()).map((p) => p.motivo));
    expect(motivos.has('vocabulario' as never)).toBe(false);
  });
});

// Los 106 enlaces curados de src/data/tsa.ts no los validaba nadie. Hoy no
// están rotos, pero nada impide que lo estén mañana si se renombra un slug.
describe('los enlaces curados de tsa.ts apuntan a páginas que existen', () => {
  beforeAll(() => {
    if (existsSync(join(DIST, 'index.html'))) return;
    execSync('npx astro build', { cwd: ROOT, encoding: 'utf-8', timeout: 300_000 });
  }, 300_000);

  const todos = [...Object.values(TSA), ...Object.values(TSA_LANG)]
    .filter((e) => e !== undefined)
    .flatMap((e) => e.links);

  it('hay enlaces que comprobar (control de la propia comprobación)', () => {
    expect(todos.length).toBeGreaterThan(50);
  });

  it.each(todos.map((l) => [l.href, l.label] as const))('%s (%s) existe en el build', (href) => {
    expect(existsSync(join(DIST, href, 'index.html'))).toBe(true);
  });
});
