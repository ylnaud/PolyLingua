import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LEVELS, LEVEL_MAP } from '../src/data/levels';
import { LANGUAGES, LANGUAGE_MAP } from '../src/data/languages';
import { UNITS } from '../src/data/units';
import { RESOURCES, CATEGORY_LABELS } from '../src/data/resources';
import { MATRIX_DATA, isActionObjectCompatible, type MatrixColumnRole } from '../src/data/matrices';

describe('levels', () => {
  it('has exactly 6 CEFR levels', () => {
    expect(LEVELS).toHaveLength(6);
  });

  it('covers a1 through c2', () => {
    const ids = LEVELS.map((l) => l.id);
    expect(ids).toEqual(['a1', 'a2', 'b1', 'b2', 'c1', 'c2']);
  });

  it('has no duplicate ids', () => {
    const ids = LEVELS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every level has all required fields', () => {
    for (const level of LEVELS) {
      expect(level.id).toBeTruthy();
      expect(level.name).toBeTruthy();
      expect(level.tagline).toBeTruthy();
      expect(level.description).toBeTruthy();
      expect(level.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(level.emoji).toBeTruthy();
    }
  });

  it('LEVEL_MAP keys match LEVELS ids', () => {
    const mapKeys = Object.keys(LEVEL_MAP).sort();
    const levelIds = LEVELS.map((l) => l.id).sort();
    expect(mapKeys).toEqual(levelIds);
  });
});

describe('languages', () => {
  it('has exactly 6 languages', () => {
    expect(LANGUAGES).toHaveLength(6);
  });

  it('covers de, en, es, fr, it, pt', () => {
    const ids = LANGUAGES.map((l) => l.id).sort();
    expect(ids).toEqual(['de', 'en', 'es', 'fr', 'it', 'pt']);
  });

  it('has no duplicate ids', () => {
    const ids = LANGUAGES.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every language has all required fields', () => {
    for (const lang of LANGUAGES) {
      expect(lang.id).toBeTruthy();
      expect(lang.name).toBeTruthy();
      expect(lang.nativeName).toBeTruthy();
      expect(lang.flag).toBeTruthy();
      expect(lang.bcp47).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
      expect(lang.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('LANGUAGE_MAP keys match LANGUAGES ids', () => {
    const mapKeys = Object.keys(LANGUAGE_MAP).sort();
    const langIds = LANGUAGES.map((l) => l.id).sort();
    expect(mapKeys).toEqual(langIds);
  });
});

describe('units', () => {
  const langIds = ['de', 'en', 'fr', 'it', 'pt'];
  const levelIds = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

  it('has entries for all lang-level combinations', () => {
    for (const lang of langIds) {
      for (const level of levelIds) {
        const key = `${lang}-${level}`;
        expect(UNITS[key], `missing ${key}`).toBeDefined();
        expect(UNITS[key].length, `${key} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('unit ids are sequential starting from 1', () => {
    for (const [key, units] of Object.entries(UNITS)) {
      const ids = units.map((u) => u.id);
      const expected = units.map((_, i) => i + 1);
      expect(ids, `${key} ids not sequential`).toEqual(expected);
    }
  });

  it('every unit has name, description, and emoji', () => {
    for (const [key, units] of Object.entries(UNITS)) {
      for (const unit of units) {
        expect(unit.name, `${key} unit ${unit.id} missing name`).toBeTruthy();
        expect(unit.description, `${key} unit ${unit.id} missing description`).toBeTruthy();
        expect(unit.emoji, `${key} unit ${unit.id} missing emoji`).toBeTruthy();
      }
    }
  });

  // La página de nivel agrupa las lecciones por unidad. Una lección sin `unit`,
  // o con un `unit` que no está definido acá, no cae en ningún grupo: llegó a
  // haber 15 así, invisibles en su nivel (solo accesibles por URL directa).
  // La página ya no las pierde —las manda a un grupo final—, pero eso es la red
  // de seguridad; lo correcto es que ninguna lección quede suelta.
  it('every lesson belongs to a unit that exists for its level', () => {
    const lessonsDir = join(import.meta.dirname, '..', 'src', 'content', 'lessons');
    const huerfanas: string[] = [];

    for (const course of readdirSync(lessonsDir)) {
      if (!/^[a-z]{2}-[a-z]{2}$/.test(course)) continue;
      const targetLang = course.split('-')[1];

      for (const level of readdirSync(join(lessonsDir, course))) {
        const units = UNITS[`${targetLang}-${level}`];
        // Sin entrada en UNITS la página cae a lista plana y no pierde nada.
        if (!units) continue;
        const ids = new Set(units.map((u) => u.id));

        for (const file of readdirSync(join(lessonsDir, course, level))) {
          if (!file.endsWith('.md')) continue;
          const raw = readFileSync(join(lessonsDir, course, level, file), 'utf-8');
          const match = raw.match(/^unit:\s*(\d+)\s*$/m);
          if (!match || !ids.has(Number(match[1]))) {
            huerfanas.push(`${course}/${level}/${file} (unit: ${match?.[1] ?? 'ausente'})`);
          }
        }
      }
    }

    expect(huerfanas, `lecciones sin unidad válida:\n${huerfanas.join('\n')}`).toEqual([]);
  });

  // BaseLayout ya añade « | PolyLingua» al <title>, y solo si no está: por eso
  // la pestaña salía bien y esto pasó desapercibido. Pero la lección pinta el
  // `title` CRUDO en el <h1> y en el `name` del JSON-LD, así que 73 de las 84
  // lecciones de en-de tenían un titular que terminaba en el nombre del sitio.
  // Se vio al activar el silo inglés, cuando esas páginas entraron al índice.
  //
  // El nombre del sitio va en el <title>, que lo pone el layout. En el
  // frontmatter, nunca.
  it('ningún título de lección lleva el nombre del sitio', () => {
    const lessonsDir = join(import.meta.dirname, '..', 'src', 'content', 'lessons');
    const conMarca: string[] = [];

    for (const course of readdirSync(lessonsDir)) {
      if (!/^[a-z]{2}-[a-z]{2}$/.test(course)) continue;
      for (const level of readdirSync(join(lessonsDir, course))) {
        for (const file of readdirSync(join(lessonsDir, course, level))) {
          if (!file.endsWith('.md')) continue;
          const raw = readFileSync(join(lessonsDir, course, level, file), 'utf-8');
          const title = raw.match(/^title:\s*(.+)$/m)?.[1] ?? '';
          if (title.includes('PolyLingua')) conMarca.push(`${course}/${level}/${file} → ${title}`);
        }
      }
    }

    expect(conMarca, `títulos con el nombre del sitio:\n${conMarca.join('\n')}`).toEqual([]);
  });
});

/**
 * Frontmatter de las lecciones: lo que el esquema Zod no puede exigir.
 *
 * Zod valida que los campos existan y tengan el tipo correcto, y eso es lo que
 * debe hacer: un fallo suyo rompe el build entero. Pero una description corta
 * o dos lecciones con el mismo `order` son problemas de calidad, no de datos
 * inválidos — el sitio compila perfectamente con ellos, y por eso nadie los ve.
 * Ese es justo el trabajo de un test. El mismo reparto que ya documenta
 * tests/dialogos-seo.test.ts para la colección `dialogos`.
 */
describe('frontmatter de las lecciones', () => {
  const lessonsDir = join(import.meta.dirname, '..', 'src', 'content', 'lessons');

  /**
   * Un escalar de una línea del frontmatter, con las dos formas de comillas que
   * usa el repo. La mayoría van entre comillas simples (donde YAML escapa la
   * comilla duplicándola), pero las que llevan un apóstrofo dentro —
   * `quelqu'un`, en es-fr/b1/pronoms-indefinis— van entre dobles. Leer solo una
   * de las dos formas da un falso positivo, no un fallo: la lección parece no
   * tener el campo.
   */
  function escalar(raw: string, campo: string): string | null {
    const m = raw.match(new RegExp(`^${campo}:[ \\t]*(.*)$`, 'm'));
    if (!m) return null;
    const v = m[1]!.trim();
    if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
    if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1).replace(/\\"/g, '"');
    return v;
  }

  /** Cuenta las líneas `  - <id>` bajo `skills:`, el mismo patrón que ya usa
   * `tests/engine.test.ts` para leer esta lista sin un parser YAML completo. */
  function contarSkills(raw: string): number {
    return (raw.match(/^ {2}- [a-z]{2}\.[a-z0-9]+\.[a-z0-9.-]+$/gm) ?? []).length;
  }

  const lecciones = (() => {
    const out: {
      id: string;
      course: string;
      level: string;
      description: string | null;
      unit: string | null;
      order: string | null;
      skillsCount: number;
    }[] = [];
    for (const course of readdirSync(lessonsDir)) {
      if (!/^[a-z]{2}-[a-z]{2}$/.test(course)) continue;
      for (const level of readdirSync(join(lessonsDir, course))) {
        for (const file of readdirSync(join(lessonsDir, course, level))) {
          if (!file.endsWith('.md')) continue;
          const raw = readFileSync(join(lessonsDir, course, level, file), 'utf-8');
          out.push({
            id: `${course}/${level}/${file}`,
            course,
            level,
            description: escalar(raw, 'description'),
            unit: escalar(raw, 'unit'),
            order: escalar(raw, 'order'),
            skillsCount: contarSkills(raw),
          });
        }
      }
    }
    return out;
  })();

  it('hay lecciones que comprobar (control de la propia comprobación)', () => {
    expect(lecciones.length).toBeGreaterThan(400);
  });

  // 130-160 caracteres, el mismo rango que CLAUDE.md exige y que
  // tests/dialogos-seo.test.ts ya imponía a los diálogos. Sin este test la
  // colección `lessons` no tenía a nadie mirando: había 14 lecciones entre 121
  // y 129 repartidas por cinco cursos.
  it('toda description mide entre 130 y 160 caracteres', () => {
    const fuera = lecciones
      .filter(
        (l) => l.description === null || l.description.length < 130 || l.description.length > 160,
      )
      .map((l) => `${l.id} (${l.description === null ? 'ausente' : l.description.length})`);
    expect(fuera, `descriptions fuera de 130-160:\n${fuera.join('\n')}`).toEqual([]);
  });

  // La página de nivel ordena por `order` dentro de cada unidad. Con empates el
  // desempate lo decide el orden en que el glob devuelve los ficheros, no el
  // contenido: la secuencia que ve el alumno —y la numeración del camino, y el
  // anterior/siguiente— dejaría de estar declarada en ningún sitio.
  //
  // Hoy no hay ninguno, y conviene saber por qué: `order` es `z.number()`, no
  // un entero, y las lecciones que se intercalan usan decimales
  // (`articulos-der-die-das` es 3 y las tres de género que la desarrollan son
  // 3.1, 3.2 y 3.3). Leer el campo con un `\d+` los trunca todos al mismo
  // entero e inventa colisiones que no existen — pasó auditando esto. Por eso
  // acá se compara el escalar entero, tal cual está escrito.
  it('no hay dos lecciones con el mismo order dentro de una unidad', () => {
    const grupos = new Map<string, string[]>();
    for (const l of lecciones) {
      const clave = `${l.course}/${l.level} unidad ${l.unit ?? '?'} order ${l.order ?? '?'}`;
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave)!.push(l.id);
    }
    const repetidos = [...grupos.entries()]
      .filter(([, ids]) => ids.length > 1)
      .map(([clave, ids]) => `${clave}: ${ids.join(', ')}`);
    expect(repetidos, `order repetido:\n${repetidos.join('\n')}`).toEqual([]);
  });

  // El esquema Zod acepta `skills: []` como default (necesario: no toda
  // lección alimenta el motor adaptativo el mismo día que se escribe), así
  // que una lección que pierda su lista de skills sigue siendo válida para
  // el build — el mismo hueco que U-04 ya encontró para `exercises: []`.
  // U-09 lo cierra: hoy las 484 lecciones del repo SÍ tienen al menos una.
  it('todas las lecciones tienen al menos un skill (484/484 etiquetadas)', () => {
    const sinSkills = lecciones.filter((l) => l.skillsCount === 0).map((l) => l.id);
    expect(sinSkills, `lecciones sin skills:\n${sinSkills.join('\n')}`).toEqual([]);
  });
});

describe('resources', () => {
  const langIds = ['de', 'en', 'fr', 'it', 'pt'];
  const validCategories = Object.keys(CATEGORY_LABELS);

  it('has resources for every language', () => {
    for (const lang of langIds) {
      expect(RESOURCES[lang as keyof typeof RESOURCES], `missing ${lang}`).toBeDefined();
      expect(RESOURCES[lang as keyof typeof RESOURCES]!.length, `${lang} is empty`).toBeGreaterThan(
        0,
      );
    }
  });

  it('every resource has a valid category', () => {
    for (const [lang, items] of Object.entries(RESOURCES)) {
      for (const item of items ?? []) {
        expect(validCategories, `${lang}: invalid category "${item.category}"`).toContain(
          item.category,
        );
      }
    }
  });

  it('every resource has title and note', () => {
    for (const [lang, items] of Object.entries(RESOURCES)) {
      for (const item of items ?? []) {
        expect(item.title, `${lang}: resource missing title`).toBeTruthy();
        expect(item.note, `${lang}: resource missing note`).toBeTruthy();
      }
    }
  });
});

describe('matrices (Generador de frases)', () => {
  const langIds = ['de', 'en', 'fr', 'it', 'pt'] as const;

  it('every language has at least one matrix per level from a1 through c2', () => {
    const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'] as const;
    for (const lang of langIds) {
      for (const level of levels) {
        const matches = MATRIX_DATA[lang]!.matrices.filter((m) => m.level === level);
        expect(matches.length, `${lang} has no ${level} matrix`).toBeGreaterThan(0);
      }
    }
  });

  it('matrix ids are unique within each language', () => {
    for (const lang of langIds) {
      const ids = MATRIX_DATA[lang]!.matrices.map((m) => m.id);
      expect(new Set(ids).size, `${lang} has duplicate matrix ids`).toBe(ids.length);
    }
  });

  it('every matrix has exactly one subject and one modal column', () => {
    for (const lang of langIds) {
      for (const matrix of MATRIX_DATA[lang]!.matrices) {
        const subjectCount = matrix.columns.filter((c) => c.role === 'subject').length;
        const modalCount = matrix.columns.filter((c) => c.role === 'modal').length;
        expect(subjectCount, `${lang}/${matrix.id}: subject columns`).toBe(1);
        expect(modalCount, `${lang}/${matrix.id}: modal columns`).toBe(1);
      }
    }
  });

  it('when two matrices share a level, each has a distinct tabLabel', () => {
    for (const lang of langIds) {
      const byLevel = new Map<string, string[]>();
      for (const matrix of MATRIX_DATA[lang]!.matrices) {
        const labels = byLevel.get(matrix.level) ?? [];
        labels.push(matrix.tabLabel ?? matrix.level.toUpperCase());
        byLevel.set(matrix.level, labels);
      }
      for (const [level, labels] of byLevel) {
        if (labels.length > 1) {
          expect(new Set(labels).size, `${lang}/${level}: duplicate tab labels`).toBe(
            labels.length,
          );
        }
      }
    }
  });

  it('every column has non-empty items, and forms/esForms (when present) match their agreesWith column length', () => {
    for (const lang of langIds) {
      for (const matrix of MATRIX_DATA[lang]!.matrices) {
        for (const column of matrix.columns) {
          expect(
            column.items.length,
            `${lang}/${matrix.id}/${column.role}: no items`,
          ).toBeGreaterThan(0);

          const agreesWithRole: MatrixColumnRole = column.agreesWith ?? 'subject';
          const agreeColumn = matrix.columns.find((c) => c.role === agreesWithRole);
          const expectedLen = agreeColumn ? agreeColumn.items.length : undefined;

          for (const word of column.items) {
            if (word.forms && expectedLen !== undefined) {
              expect(
                word.forms.length,
                `${lang}/${matrix.id}/${column.role}: "${word.word}" forms length`,
              ).toBe(expectedLen);
            }
            if (word.esForms && expectedLen !== undefined) {
              expect(
                word.esForms.length,
                `${lang}/${matrix.id}/${column.role}: "${word.word}" esForms length`,
              ).toBe(expectedLen);
            }
          }
        }
      }
    }
  });

  it('every matrix has a description (rendered as the pedagogy note)', () => {
    for (const lang of langIds) {
      for (const matrix of MATRIX_DATA[lang]!.matrices) {
        expect(matrix.description, `${lang}/${matrix.id} missing description`).toBeTruthy();
      }
    }
  });

  it('isActionObjectCompatible correctly flags known nonsensical vs. sensible pairs', () => {
    expect(isActionObjectCompatible('aprender', 'alemán')).toBe(true);
    expect(isActionObjectCompatible('hablar', 'francés')).toBe(true);
    expect(isActionObjectCompatible('viajar', 'alemán')).toBe(false);
    expect(isActionObjectCompatible('comprar', 'francés')).toBe(false);
    expect(isActionObjectCompatible('trabajar', 'español')).toBe(false);
    expect(isActionObjectCompatible('viajar', 'el informe')).toBe(true); // no es objeto-idioma
  });

  it('every matrix keeps at least one compatible action per object once incompatible pairs are filtered out (no deck ends up empty)', () => {
    for (const lang of langIds) {
      for (const matrix of MATRIX_DATA[lang]!.matrices) {
        const actionColumn = matrix.columns.find((c) => c.role === 'action');
        const objectColumn = matrix.columns.find((c) => c.role === 'object');
        if (!actionColumn || !objectColumn) continue;
        for (const object of objectColumn.items) {
          const hasCompatibleAction = actionColumn.items.some((action) =>
            isActionObjectCompatible(action.es, object.es),
          );
          expect(
            hasCompatibleAction,
            `${lang}/${matrix.id}: no action is compatible with object "${object.es}"`,
          ).toBe(true);
        }
      }
    }
  });
});
