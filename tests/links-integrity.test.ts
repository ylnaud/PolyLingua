import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_URL } from '../src/data/site';

/**
 * U-12 del Gauntlet: navegación y enlaces.
 *
 * `tests/links.test.ts` ya valida el MOTOR de enlaces relacionados (que no
 * invente destinos fuera del índice) y que los enlaces curados de `tsa.ts`
 * apunten a páginas reales — pero nada barre el HTML ya construido buscando
 * un `<a href>` que apunte a una página que no existe. Es el mismo tipo de
 * bug que U-08 encontró para hreflang (645/1350 rotos, documentado en
 * BaseSEO.astro) pero nunca se comprobó para los enlaces normales de
 * navegación.
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

/** true si el href es interno (ruta relativa del sitio, o absoluta al mismo
 * origen) — descarta externos, mailto:, tel:, y anclas puras (#foo). */
function esInterno(href: string): boolean {
  if (href.startsWith('#')) return false;
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  if (href.startsWith('http')) return href.startsWith(SITE_URL);
  return href.startsWith('/');
}

/** De un href interno a la ruta de archivo que debería existir en dist/.
 * `/es/pt/repasar?tema=...` es un enlace real a `repasar` con un parámetro
 * de query que el cliente lee en runtime — la ruta de archivo es solo lo
 * que hay antes del `?` (y del `#`, si lo hubiera). */
function distFileFor(href: string): string {
  let pathname = href.startsWith('http') ? new URL(href).pathname : href;
  pathname = pathname.split('#')[0]!.split('?')[0]!.replace(/\/$/, '');
  return join(DIST, pathname, 'index.html');
}

describe('U-12 — barrido de enlaces internos', () => {
  it('cada <a href> interno del sitio construido apunta a una página que existe', () => {
    const rotos: string[] = [];
    let totalInternos = 0;
    for (const file of allIndexFiles(DIST)) {
      const html = readFileSync(file, 'utf-8');
      const anclas = [...html.matchAll(/<a\s[^>]*href="([^"]*)"/g)].map((m) => m[1]!);
      for (const href of anclas) {
        if (!esInterno(href)) continue;
        totalInternos += 1;
        if (!existsSync(distFileFor(href))) {
          rotos.push(`${file.replace(DIST, '')} → href="${href}"`);
        }
      }
    }
    // Con 1042 páginas y ~30-60 enlaces internos por página, un número bajo
    // es señal de que el regex dejó de encontrar nada, no de que el sitio
    // mejoró.
    expect(totalInternos).toBeGreaterThan(10000);
    expect(rotos, `enlaces internos rotos:\n${rotos.join('\n')}`).toEqual([]);
  });
});

describe('U-12 — miga de pan coherente entre silos', () => {
  const casos: Array<[string, string, string]> = [
    ['portada de curso (es/de)', join(DIST, 'es', 'de', 'index.html'), '/es'],
    [
      'una lección real (es/de/a1)',
      join(DIST, 'es', 'de', 'a1', 'articulos-der-die-das', 'index.html'),
      '/es',
    ],
    ['una herramienta (es/de/practicar)', join(DIST, 'es', 'de', 'practicar', 'index.html'), '/es'],
    ['portada de curso (en/de)', join(DIST, 'en', 'de', 'index.html'), '/en'],
    [
      'una lección real (en/de/a1)',
      join(DIST, 'en', 'de', 'a1', 'present-tense-regular-verbs', 'index.html'),
      '/en',
    ],
    ['una herramienta (en/de/practicar)', join(DIST, 'en', 'de', 'practicar', 'index.html'), '/en'],
  ];

  it.each(casos)(
    '%s tiene <nav class="breadcrumbs"> con hrefs del mismo silo',
    (_, file, prefijo) => {
      const html = readFileSync(file, 'utf-8');
      const nav = html.match(/<nav class="breadcrumbs"[^>]*>([\s\S]*?)<\/nav>/);
      expect(nav, `sin <nav class="breadcrumbs"> en ${file}`).not.toBeNull();
      const hrefs = [...nav![1]!.matchAll(/<a href="([^"]*)"/g)].map((m) => m[1]!);
      expect(hrefs.length, 'la miga de pan no tiene ningún enlace').toBeGreaterThan(0);
      for (const href of hrefs) {
        expect(
          href === prefijo || href.startsWith(`${prefijo}/`),
          `href de otro silo en la miga de pan: «${href}» (esperado bajo ${prefijo})`,
        ).toBe(true);
      }
    },
  );

  it('el aria-label de la miga coincide con el idioma de interfaz de la página', () => {
    const es = readFileSync(join(DIST, 'es', 'de', 'index.html'), 'utf-8');
    const en = readFileSync(join(DIST, 'en', 'de', 'index.html'), 'utf-8');
    expect(es).toContain('<nav class="breadcrumbs" aria-label="Ruta de navegación"');
    expect(en).toContain('<nav class="breadcrumbs" aria-label="Breadcrumb"');
  });
});
