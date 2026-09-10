import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * U-04 del Gauntlet: A1 `es→de` sin regresión.
 *
 * `tests/content-schema.test.ts` valida el esquema Zod contra fixtures
 * sintéticas, y `tests/data-integrity.test.ts` valida invariantes globales
 * (unidades, `order`, longitud de `description`) sobre todas las lecciones
 * del repo. Ninguno de los dos es un snapshot de este nivel en particular:
 * el esquema permite `exercises: []` (es su default), así que una lección
 * que pierda todo su contenido de práctica sigue siendo válida para Zod y
 * para esos dos archivos. Esto es distinto a propósito — igual que U-03,
 * fija números EXACTOS de este nivel, no invariantes genéricos.
 */
const LESSONS_DIR = join(import.meta.dirname, '..', 'src', 'content', 'lessons', 'es-de', 'a1');
const DIST_LEVEL_DIR = join(import.meta.dirname, '..', 'dist', 'es', 'de', 'a1');

const SLUGS_ESPERADOS = [
  'arbeit-alltag',
  'articulo-das-neutro',
  'articulo-der-masculino',
  'articulo-die-femenino',
  'articulos-der-die-das',
  'aussprache-ch-sch-ck',
  'aussprache-ei-ie',
  'aussprache-h-und-er',
  'aussprache-st-sp-pf-tz',
  'aussprache-umlaute',
  'einkaufen',
  'essen-trinken',
  'familie',
  'familie-freunde',
  'fragewoerter',
  'freizeit-alltag',
  'haben-sein',
  'im-restaurant',
  'imperativo',
  'negacion-nicht-kein',
  'personalpronomen',
  'pluralbildung',
  'praepositionen-ort-zeit',
  'presente-verbos',
  'saludos-presentarse',
  'sein-haben-alltag',
  'tiere',
  'uhrzeit',
  'unregelmaessige-verben',
  'unterwegs',
  'zahlen',
  'zu-hause',
];

function lessonFiles(): string[] {
  return readdirSync(LESSONS_DIR).filter((f) => f.endsWith('.md'));
}

/** Cuenta items de lista bajo una clave de primer nivel, por el marcador de
 * su primer campo (`- question:` para quiz, `- type:` para exercises). No
 * hace falta un parser YAML completo — ya es el patrón que usa
 * `tests/data-integrity.test.ts` para leer frontmatter sin esa dependencia. */
function countList(raw: string, marker: string): number {
  return (raw.match(new RegExp(`^  - ${marker}:`, 'gm')) ?? []).length;
}

describe('U-04 — A1 es→de sin regresión', () => {
  it('hay exactamente 32 lecciones, con estos 32 nombres', () => {
    const slugsReales = lessonFiles()
      .map((f) => f.replace(/\.md$/, ''))
      .sort();
    expect(slugsReales).toHaveLength(32);
    expect(slugsReales).toEqual([...SLUGS_ESPERADOS].sort());
  });

  it('el build genera exactamente 34 páginas bajo /es/de/a1/', () => {
    // 32 lecciones + el índice del nivel + examen.astro (página especial,
    // no viene de una lección — la misma clase de página que causó el
    // defecto D0 de U-01 cuando se olvidó del eje userLang).
    const paginas = readdirSync(DIST_LEVEL_DIR, { withFileTypes: true, recursive: true }).filter(
      (e) => e.isFile() && e.name === 'index.html',
    );
    expect(paginas).toHaveLength(34);
  });

  it('exactamente 106 items de quiz y 170 de exercises, sumados', () => {
    let quiz = 0;
    let exercises = 0;
    for (const f of lessonFiles()) {
      const raw = readFileSync(join(LESSONS_DIR, f), 'utf-8');
      quiz += countList(raw, 'question');
      exercises += countList(raw, 'type');
    }
    expect(quiz, 'total quiz').toBe(106);
    expect(exercises, 'total exercises').toBe(170);
  });

  it('ninguna de las 32 lecciones tiene quiz Y exercises vacíos a la vez', () => {
    const vacias: string[] = [];
    for (const f of lessonFiles()) {
      const raw = readFileSync(join(LESSONS_DIR, f), 'utf-8');
      const quiz = countList(raw, 'question');
      const exercises = countList(raw, 'type');
      if (quiz === 0 && exercises === 0) vacias.push(f);
    }
    expect(vacias, `lecciones sin quiz ni exercises: ${vacias.join(', ')}`).toEqual([]);
  });

  it('las 32 páginas de lección existen en dist/, una por slug', () => {
    for (const slug of SLUGS_ESPERADOS) {
      expect(existsSync(join(DIST_LEVEL_DIR, slug, 'index.html')), slug).toBe(true);
    }
  });
});
