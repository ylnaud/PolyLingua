import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { NOINDEX_LAST_SEGMENTS } from '../src/data/noindex-routes';

const PAGES_DIR = join(import.meta.dirname, '..', 'src', 'pages');

// 404.astro es una convención especial de Astro, no una ruta indexable real
// — el sitemap no la trata como página normal, así que no aplica acá.
const IGNORED_FILES = new Set(['404.astro']);

function findAstroPages(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findAstroPages(full));
    } else if (entry.name.endsWith('.astro')) {
      files.push(full);
    }
  }
  return files;
}

function lastSegmentFor(filePath: string): string {
  const rel = relative(PAGES_DIR, filePath).replace(/\.astro$/, '');
  const parts = rel.split('/');
  const last = parts[parts.length - 1];
  return last === 'index' ? parts[parts.length - 2] : last;
}

function declaresNoindex(source: string): boolean {
  // Prop booleana shorthand tal como se usa en todo src/pages: una línea que
  // es exactamente `noindex` dentro del bloque de props de BaseLayout/etc.
  return /^\s*noindex\s*$/m.test(source);
}

describe('noindex routes stay in sync with the sitemap exclusion list', () => {
  const pages = findAstroPages(PAGES_DIR).filter((f) => !IGNORED_FILES.has(f.split('/').pop()!));
  const noindexPages = pages.filter((f) => declaresNoindex(readFileSync(f, 'utf-8')));

  it('found at least one noindex page (sanity check for the scan itself)', () => {
    expect(noindexPages.length).toBeGreaterThan(0);
  });

  it('every page with `noindex` has its last URL segment in NOINDEX_LAST_SEGMENTS', () => {
    for (const file of noindexPages) {
      const segment = lastSegmentFor(file);
      expect(
        NOINDEX_LAST_SEGMENTS,
        `${relative(PAGES_DIR, file)} sets noindex but "${segment}" is missing from NOINDEX_LAST_SEGMENTS (src/data/noindex-routes.ts) — the sitemap will still list it`,
      ).toContain(segment);
    }
  });
});
