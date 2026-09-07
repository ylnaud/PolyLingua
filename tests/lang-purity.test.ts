import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  escanear,
  textoVisible,
  textoDeAtributos,
  cadenasEspanolasVigiladas,
  fugasDeDiccionario,
  PALABRAS_ES,
  ENDONIMO,
} from './lib/spanish-scan';
import { es, en } from '../src/i18n/dictionary';
import { LEVELS } from '../src/data/levels';

/**
 * U-01 del Gauntlet · Pureza de idioma del silo inglés.
 *
 * Criterio de aceptación: ninguna página de /en/** sirve texto español visible.
 *
 * Lo que hace este archivo NO es solo mirar `dist/en`. Un barrido que da verde
 * puede estar dando verde porque está roto, y eso ya pasó en este proyecto: un
 * test de correspondencia por índice que yo daba por bueno resultó no detectar
 * el intercambio que decía detectar. Así que hay cuatro comprobaciones, y tres
 * son sobre el propio detector:
 *
 *   1. el barrido            → cero español en /en/
 *   2. control de población  → ha leído más de 100 páginas (un conjunto vacío
 *                              pasa trivialmente)
 *   3. control invertido     → la MISMA lista marca casi todo /es/ (si deja de
 *                              detectar español, este test se pone rojo aunque
 *                              el silo inglés esté impecable)
 *   4. sensibilidad          → fixtures con defecto inyectado, sin depender del
 *                              build
 *
 * La inversión de verdad —meter español en una lección, reconstruir, ver rojo,
 * revertir, ver verde— está registrada en gauntlet/evidence/U-01-inversion.md.
 */
const RAIZ = join(import.meta.dirname, '..');
const DIST = join(RAIZ, 'dist');

function htmls(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? htmls(p) : e.name.endsWith('.html') ? [p] : [];
  });
}

/** El build lo genera `build.test.ts` dentro de esta misma suite. */
const HAY_BUILD = existsSync(join(DIST, 'en'));
const PAGINAS_EN = HAY_BUILD ? htmls(join(DIST, 'en')) : [];
const PAGINAS_ES = HAY_BUILD ? htmls(join(DIST, 'es')) : [];

describe('U-01 · el silo inglés no sirve español', () => {
  it('encuentra el build; sin él este archivo no mide nada', () => {
    expect(HAY_BUILD, 'falta dist/en — ejecutá `npm run build` antes').toBe(true);
  });

  it('ha barrido más de 100 páginas (control de población)', () => {
    expect(PAGINAS_EN.length).toBeGreaterThan(100);
  });

  it('ninguna página de /en/ contiene español visible', () => {
    const fallos: string[] = [];
    for (const f of PAGINAS_EN) {
      const { hallazgos } = escanear(readFileSync(f, 'utf-8'));
      for (const h of hallazgos) {
        fallos.push(`${relative(DIST, f)} · «${h.palabra}» · …${h.contexto}…`);
      }
    }
    expect(fallos, `español en el silo inglés:\n${fallos.join('\n')}`).toEqual([]);
  });

  it('el endónimo «Español» aparece exactamente una vez por página', () => {
    // Es correcto que esté: un selector de idioma nombra cada opción en su
    // propio idioma. Se cuenta en vez de ignorarlo, para que una SEGUNDA
    // aparición —que ya no sería el selector— rompa el test.
    const raros = PAGINAS_EN.map((f) => ({
      pagina: relative(DIST, f),
      veces: escanear(readFileSync(f, 'utf-8')).endonimos,
    })).filter((x) => x.veces !== 1);
    expect(raros, `páginas con un número inesperado de «${ENDONIMO}»`).toEqual([]);
  });
});

describe('U-01 · control invertido: el detector sí detecta español', () => {
  it('marca casi todas las páginas del silo español', () => {
    // Si esto baja, la lista de palabras se ha quedado sin capacidad de
    // detección y el verde de arriba no significaría nada.
    const marcadas = PAGINAS_ES.filter(
      (f) => escanear(readFileSync(f, 'utf-8')).hallazgos.length > 0,
    ).length;
    expect(PAGINAS_ES.length).toBeGreaterThan(400);
    expect(marcadas).toBeGreaterThanOrEqual(400);
  });
});

describe('U-01 · sensibilidad del detector (fixtures, sin build)', () => {
  const envuelve = (cuerpo: string) => `<html lang="en"><body>${cuerpo}</body></html>`;

  it('detecta español en el texto visible', () => {
    const r = escanear(envuelve('<p>Completa alguna lección primero.</p>'));
    expect(r.hallazgos.map((h) => h.palabra.toLowerCase())).toContain('lección');
  });

  it('no detecta nada en una página realmente inglesa', () => {
    const r = escanear(envuelve('<h1>German Present Tense</h1><p>Finish a lesson first.</p>'));
    expect(r.hallazgos).toEqual([]);
  });

  it('ignora el español que vive dentro de <script>', () => {
    // El JS de este proyecto está escrito en español; sin esta exclusión el
    // detector se ahoga en ruido. Cuánto ruido lo mide el test de más abajo
    // sobre el build real, en vez de copiar aquí un número que se queda viejo.
    const r = escanear(
      envuelve('<p>Check</p><script>const siguiente = "Todavía no hay lecciones";</script>'),
    );
    expect(r.hallazgos).toEqual([]);
  });

  // Los cuatro casos siguientes son los que el Critic usó para tumbar la
  // primera versión de esta unidad: el detector descartaba TODO valor de
  // atributo, así que un aria-label en español pasaba invisible aunque su
  // palabra estuviera en la lista.
  it('detecta español en un aria-label', () => {
    const r = escanear(envuelve('<button aria-label="Volver arriba">↑</button>'));
    expect(r.hallazgos.map((h) => h.palabra.toLowerCase())).toContain('volver');
  });

  it('detecta español en alt, title y placeholder', () => {
    for (const attr of ['alt', 'title', 'placeholder']) {
      const r = escanear(envuelve(`<input ${attr}="Escribe tu respuesta aquí">`));
      expect(r.hallazgos.length, `${attr} no se está mirando`).toBeGreaterThan(0);
    }
  });

  it('detecta español en la meta description', () => {
    // CLAUDE.md la exige en cada página; es texto que ve quien busca en Google.
    const r = escanear(
      '<html><head><meta name="description" content="Aprender alemán desde cero"></head><body></body></html>',
    );
    expect(r.hallazgos.length).toBeGreaterThan(0);
  });

  it('NO mira href, src, class ni data-*: ahí viven rutas e identificadores', () => {
    const r = escanear(
      envuelve(
        '<a href="/en/de/vocabulario" class="nivel-actual" data-page-strings=\'{"siguiente":"Next"}\'>Vocabulary</a>',
      ),
    );
    expect(r.hallazgos).toEqual([]);
  });

  it('data-title NO se confunde con title (el guion no es frontera de palabra)', () => {
    // La ronda 2 usaba `\b` delante del nombre del atributo, así que
    // `data-title=` casaba y el detector leía atributos de máquina mientras el
    // test de arriba afirmaba lo contrario. El caso que lo prueba tiene que ser
    // un data-* que TERMINE en un nombre vigilado, no uno cualquiera.
    expect(textoDeAtributos('<span data-title="Volver arriba y seguí">x</span>')).toBe('');
    expect(textoDeAtributos('<span title="Volver arriba">x</span>')).toContain('Volver');
  });

  it('ve el aria-label aunque venga con comilla simple', () => {
    expect(textoDeAtributos("<button aria-label='Volver arriba'>x</button>")).toContain('Volver');
  });

  it('ve la meta description con los atributos en cualquier orden', () => {
    const alReves = '<meta content="Aprender alemán desde cero" name="description">';
    expect(textoDeAtributos(alReves)).toContain('alemán');
  });

  it('conoce el voseo rioplatense, que es como escribe este proyecto', () => {
    // El hueco por el que se publicó «Seguí por acá» en 58 páginas inglesas:
    // la lista tenía `aquí` pero no `acá`, y `sigue` pero no `seguí`.
    const r = escanear(envuelve('<h2>Seguí por acá</h2>'));
    const palabras = r.hallazgos.map((h) => h.palabra.toLowerCase());
    expect(palabras).toContain('seguí');
    expect(palabras).toContain('acá');
  });

  it('ignora el JSON-LD, que viaja dentro de un <script>', () => {
    const r = escanear(
      envuelve('<script type="application/ld+json">{"name":"Curso de alemán"}</script>'),
    );
    expect(r.hallazgos).toEqual([]);
  });

  it('deja pasar el endónimo una vez, pero no dos', () => {
    const una = escanear(envuelve(`<a>${ENDONIMO}</a><p>Pick a language</p>`));
    expect(una.hallazgos).toEqual([]);
    expect(una.endonimos).toBe(1);

    const dos = escanear(envuelve(`<a>${ENDONIMO}</a><p>Ahora en ${ENDONIMO}</p>`));
    expect(dos.endonimos).toBe(2);
    expect(dos.hallazgos.length).toBeGreaterThan(0); // «ahora» sigue saltando
  });

  it('no confunde el morfema alemán -los con el artículo español', () => {
    // Medido: sus 19 apariciones en el silo inglés son B2 enseñando compuestos,
    // «Arbeit (work) + los (-less) + igkeit».
    const r = escanear(envuelve('<p>Arbeit (work) + los (-less) + igkeit → arbeitslos</p>'));
    expect(r.hallazgos).toEqual([]);
  });

  it('no confunde palabras que son inglesas y españolas a la vez', () => {
    // `general` y `plural` se marcaron como español por error durante el
    // desarrollo de este curso. Las dos son inglesas.
    const r = escanear(envuelve('<p>The general rule for the plural is regular.</p>'));
    expect(r.hallazgos).toEqual([]);
  });

  it('los slugs de URL no llegan al texto: viven en href, que no se mira', () => {
    const r = escanear(envuelve('<a href="/en/de/vocabulario">Vocabulary</a>'));
    expect(r.hallazgos).toEqual([]);
    expect(textoVisible('<a href="/en/de/vocabulario">Vocabulary</a>')).not.toContain(
      'vocabulario',
    );
  });

  it('la lista no contiene palabras que también sean inglesas o alemanas', () => {
    const prohibidas = [
      'general',
      'plural',
      'no',
      'total',
      'final',
      'personal',
      'capital',
      'error',
      'similar',
      'familiar',
      'animal',
      'hotel',
      'son',
      'sin',
      'van',
      'he',
      'los',
      'die',
      'der',
      'das',
      'in',
      'an',
      'man',
      'so',
      'was',
      'ist',
      'wie',
      'leer',
      'de',
      'en',
      'el',
      'la',
    ];
    expect(PALABRAS_ES.filter((p) => prohibidas.includes(p))).toEqual([]);
  });
});

describe('U-01 · segundo detector: cadenas del diccionario español', () => {
  // La lista de palabras falló dos rondas seguidas por lo mismo: es cerrada y
  // siempre tiene huecos («acá» en la ronda 1, «Principiante» en la ronda 2).
  // Esto no adivina qué es español: coge las cadenas españolas que el proyecto
  // tiene de verdad y comprueba que ninguna se publica en una página inglesa.
  // Se mantiene solo, y habría cazado los dos fallos anteriores.
  const VIGILADAS = cadenasEspanolasVigiladas(es, en);

  it('hay cadenas que vigilar (control de la propia comprobación)', () => {
    // El umbral solo demuestra que el conjunto no se ha quedado vacío por un
    // filtro mal puesto. Hoy son 197; se pide 150 para no convertir una cifra
    // exacta en otro número frágil que haya que perseguir a cada cambio del
    // diccionario. Que sea >= 150 y no == 197 es deliberado.
    expect(VIGILADAS.length).toBeGreaterThanOrEqual(150);
  });

  it('ninguna cadena del diccionario español se publica en /en/', () => {
    const fallos: string[] = [];
    for (const f of PAGINAS_EN) {
      for (const s of fugasDeDiccionario(readFileSync(f, 'utf-8'), VIGILADAS)) {
        fallos.push(`${relative(DIST, f)} · «${s}»`);
      }
    }
    expect(fallos, `cadenas españolas en el silo inglés:\n${fallos.join('\n')}`).toEqual([]);
  });

  it('los nombres de nivel salen del diccionario, no de LEVELS', () => {
    // src/data/levels.ts guarda una sola versión, en español, y StartLevelPicker
    // la publicaba tal cual: /en/de/ mostraba «A1 · Principiante» justo encima
    // de «A1 · Beginner». Mismo defecto que ya tuvo examen.astro con el nombre
    // del idioma. Este candado lo fija para los dos silos.
    const españoles = LEVELS.map((l) => l.name);
    const fallos: string[] = [];
    for (const f of PAGINAS_EN) {
      const texto = textoVisible(readFileSync(f, 'utf-8'));
      for (const n of españoles)
        if (texto.includes(n)) fallos.push(`${relative(DIST, f)} · «${n}»`);
    }
    expect(fallos, `nombres de nivel en español en /en/:\n${fallos.join('\n')}`).toEqual([]);
  });

  it('el control funciona: esas mismas cadenas SÍ aparecen en /es/', () => {
    const marcadas = PAGINAS_ES.filter(
      (f) => fugasDeDiccionario(readFileSync(f, 'utf-8'), VIGILADAS).length > 0,
    ).length;
    expect(marcadas).toBeGreaterThanOrEqual(400);
  });
});

describe('U-01 · el control invertido protege palabra por palabra', () => {
  // El control «marca ≥400 páginas de /es/» es demasiado grueso: el Critic
  // borró las 18 formas de voseo enteras y seguía dando 641/641. Es decir, el
  // hueco que causó la ronda 1 podía reabrirse sin poner nada en rojo. Estas
  // frases reales del proyecto obligan a que cada grupo de la lista siga vivo.
  const CANARIOS: ReadonlyArray<[string, string]> = [
    ['voseo', 'Seguí por acá'],
    ['voseo', 'Elegí el nivel'],
    ['voseo', 'Ya tenés una racha'],
    ['tildes', 'Todavía no hay lecciones'],
    ['tildes', '¿Qué idioma querés aprender?'],
    ['comunes', 'Completa alguna lección primero'],
    ['comunes', 'Volver arriba'],
    ['comunes', 'Escribe tu respuesta'],
  ];

  it.each(CANARIOS)('sigue detectando %s: «%s»', (_grupo, frase) => {
    const r = escanear(`<html lang="en"><body><p>${frase}</p></body></html>`);
    expect(r.hallazgos.length, `«${frase}» ya no se detecta`).toBeGreaterThan(0);
  });
});

describe('U-01 · la exclusión de <script> se mide, no se afirma', () => {
  // Este comentario llegó a publicar «270» y luego «1586», y las dos veces era
  // falso: la magnitud depende de la lista, del build y de la variante del
  // pipeline. Tres mediciones independientes dieron 1586, 1819 y 1934. Así que
  // ya no se copia ningún número: se calcula aquí, sobre el build del momento.
  const RE = new RegExp(`(?<!\\p{L})(${PALABRAS_ES.join('|')})(?!\\p{L})`, 'giu');

  it('sin quitar los <script> hay cientos de coincidencias; quitándolos, cero', () => {
    let conScripts = 0;
    let sinScripts = 0;
    for (const f of PAGINAS_EN) {
      const raw = readFileSync(f, 'utf-8');
      const todo = raw
        .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<[^>]*>/g, ' ');
      conScripts += [...`${todo} · ${textoDeAtributos(raw)}`.matchAll(RE)].length;
      sinScripts += escanear(raw).hallazgos.length;
    }
    expect(sinScripts).toBe(0);
    expect(conScripts, 'la exclusión de <script> ya no filtra nada').toBeGreaterThan(500);
  });
});
