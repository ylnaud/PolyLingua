import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { USER_LANGUAGES, ACTIVE_USER_LANGUAGES } from '../src/data/userLanguages';

/**
 * U-08 del Gauntlet: interfaz de idiomas — el selector siempre muestra tres
 * filas (es, de, en), y cada hreflang que el sitio construido declara apunta
 * a una página que existe de verdad.
 *
 * Este segundo punto no es hipotético: `BaseSEO.astro` documenta que, antes
 * de la comprobación de existencia que tiene hoy, activar el inglés produjo
 * 645 de 1350 hreflang apuntando a un 404 — medido sobre el build, no
 * estimado. Este archivo convierte esa medición en un candado permanente.
 */
const DIST = join(import.meta.dirname, '..', 'dist');

function allIndexFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) allIndexFiles(full, out);
    else if (entry.isFile() && entry.name === 'index.html') out.push(full);
  }
  return out;
}

/** De una URL absoluta de hreflang a la ruta de archivo que debería existir
 * en dist/. La raíz del sitio (x-default) resuelve a dist/index.html. */
function distFileFor(href: string): string {
  const pathname = new URL(href).pathname.replace(/\/$/, '');
  return join(DIST, pathname, 'index.html');
}

describe('U-08 — integridad de hreflang', () => {
  it('cada hreflang declarado en el sitio construido apunta a una página que existe', () => {
    const rotos: string[] = [];
    let totalHreflang = 0;
    for (const file of allIndexFiles(DIST)) {
      const html = readFileSync(file, 'utf-8');
      const matches = [...html.matchAll(/hreflang="([^"]*)" href="([^"]*)"/g)];
      for (const [, hreflang, href] of matches) {
        totalHreflang += 1;
        if (!existsSync(distFileFor(href!))) {
          rotos.push(`${file.replace(DIST, '')} → hreflang="${hreflang}" href="${href}"`);
        }
      }
    }
    // Con 6 cursos y dos interfaces activas, el sitio real declara miles de
    // hreflang — un número bajo sería señal de que el regex dejó de
    // encontrar nada, no de que el sitio mejoró.
    expect(totalHreflang).toBeGreaterThan(1000);
    expect(rotos, `hreflang rotos:\n${rotos.join('\n')}`).toEqual([]);
  });
});

describe('U-08 — forma fija de USER_LANGUAGES', () => {
  it('son exactamente tres, en este orden, con este estado de activación', () => {
    expect(USER_LANGUAGES.map((l) => l.id)).toEqual(['es', 'de', 'en']);
    expect(USER_LANGUAGES.map((l) => l.active)).toEqual([true, false, true]);
  });

  it('es es el primer idioma activo (varias páginas usan ACTIVE_USER_LANGUAGES[0] como default)', () => {
    expect(ACTIVE_USER_LANGUAGES[0]?.id).toBe('es');
  });

  it('exactamente dos idiomas activos hoy: es y en', () => {
    expect(ACTIVE_USER_LANGUAGES.map((l) => l.id)).toEqual(['es', 'en']);
  });
});

describe('U-08 — el selector en el DOM construido', () => {
  const casos: Array<[string, string]> = [
    ['portada de curso (es/de)', join(DIST, 'es', 'de', 'index.html')],
    [
      'una lección real (es/de/a1)',
      join(DIST, 'es', 'de', 'a1', 'articulos-der-die-das', 'index.html'),
    ],
    ['herramienta solo-español (dialogos)', join(DIST, 'es', 'de', 'dialogos', 'index.html')],
    ['silo inglés (en/de)', join(DIST, 'en', 'de', 'index.html')],
  ];

  it.each(casos)(
    '%s tiene exactamente 3 .lang-option (2 habilitados + 1 deshabilitado)',
    (_, file) => {
      const html = readFileSync(file, 'utf-8');
      const total = (html.match(/class="lang-option/g) ?? []).length;
      const deshabilitados = (html.match(/class="lang-option disabled"/g) ?? []).length;
      expect(total).toBe(3);
      expect(deshabilitados).toBe(1);
    },
  );
});
