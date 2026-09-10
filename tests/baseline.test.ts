import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * U-03 del Gauntlet: páginas construidas, URLs de sitemap por silo y rutas
 * críticas, con tolerancia cero a la baja.
 *
 * `tests/build.test.ts` ya prueba que el build compila y produce un sitemap;
 * esto es distinto a propósito: fija números EXACTOS, no "al menos". Si el
 * número real cambia —para arriba o para abajo— el test rompe. Bajar por
 * accidente (una página que dejó de generarse, un curso que se rompió) lo
 * revienta enseguida; subir a propósito (una lección nueva, un curso nuevo)
 * exige tocar la cifra de acá, que es exactamente donde queda escrito el
 * porqué, en el mismo commit que sube el número real.
 */
const DIST = join(import.meta.dirname, '..', 'dist');

function countHtmlFiles(dir: string): number {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) count += countHtmlFiles(full);
    else if (entry.name.endsWith('.html')) count++;
  }
  return count;
}

function sitemapUrls(): string[] {
  return readdirSync(DIST)
    .filter((f) => /^sitemap-\d+\.xml$/.test(f))
    .flatMap((f) =>
      [...readFileSync(join(DIST, f), 'utf-8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!),
    );
}

/** Primer segmento de la ruta: es el silo (userLang) o, para lo que vive
 * fuera del eje userLang (blog, acerca, buscar...), esa misma sección. */
function siloOf(url: string): string {
  return new URL(url).pathname.replace(/^\//, '').split('/')[0] || '(raíz)';
}

describe('U-03 — baseline de páginas, sitemap y rutas críticas', () => {
  it('el build genera exactamente 1043 páginas HTML', () => {
    // 1042 rutas de Astro + 404.html, que Astro genera aparte y no cuenta en
    // su propio «page(s) built» (es un archivo de error, no una ruta).
    expect(countHtmlFiles(DIST)).toBe(1043);
  });

  it('el sitemap tiene exactamente 544 URLs', () => {
    expect(sitemapUrls()).toHaveLength(544);
  });

  it('el sitemap por silo: es 436, en 92', () => {
    const porSilo = new Map<string, number>();
    for (const u of sitemapUrls()) {
      const s = siloOf(u);
      porSilo.set(s, (porSilo.get(s) ?? 0) + 1);
    }
    expect(porSilo.get('es'), 'silo es').toBe(436);
    expect(porSilo.get('en'), 'silo en').toBe(92);
  });

  it('las rutas críticas existen en el build', () => {
    const rutas = [
      // La portada y los dos hubs de interfaz activos.
      'index.html',
      'es/index.html',
      'en/index.html',
      // Los 6 cursos que existen — ver CLAUDE.md.
      'es/de/index.html',
      'es/en/index.html',
      'es/fr/index.html',
      'es/it/index.html',
      'es/pt/index.html',
      'en/de/index.html',
      // Que el silo principal genere de verdad hasta el nivel.
      'es/de/a1/index.html',
      // El blog, herramienta SEO principal según CLAUDE.md.
      'blog/index.html',
      // Sitemap y el 404 estático que sirve Cloudflare.
      'sitemap-index.xml',
      'sitemap-0.xml',
      '404.html',
    ];
    for (const r of rutas) {
      expect(existsSync(join(DIST, r)), r).toBe(true);
    }
  });
});
