import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { escanear, textoVisible, PALABRAS_ES, ENDONIMO } from './lib/spanish-scan';

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
    // El JS de este proyecto está escrito en español. Sin esta exclusión el
    // detector daría 1586 falsos positivos y acabaría desactivado.
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
