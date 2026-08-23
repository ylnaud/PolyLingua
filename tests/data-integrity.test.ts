import { describe, it, expect } from 'vitest';
import { LEVELS, LEVEL_MAP } from '../src/data/levels';
import { LANGUAGES, LANGUAGE_MAP } from '../src/data/languages';
import { UNITS } from '../src/data/units';
import { RESOURCES, CATEGORY_LABELS } from '../src/data/resources';
import { MATRIX_DATA, type MatrixColumnRole } from '../src/data/matrices';

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
  it('has exactly 5 languages', () => {
    expect(LANGUAGES).toHaveLength(5);
  });

  it('covers de, en, fr, it, pt', () => {
    const ids = LANGUAGES.map((l) => l.id).sort();
    expect(ids).toEqual(['de', 'en', 'fr', 'it', 'pt']);
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
});

describe('resources', () => {
  const langIds = ['de', 'en', 'fr', 'it', 'pt'];
  const validCategories = Object.keys(CATEGORY_LABELS);

  it('has resources for every language', () => {
    for (const lang of langIds) {
      expect(RESOURCES[lang as keyof typeof RESOURCES], `missing ${lang}`).toBeDefined();
      expect(RESOURCES[lang as keyof typeof RESOURCES].length, `${lang} is empty`).toBeGreaterThan(
        0,
      );
    }
  });

  it('every resource has a valid category', () => {
    for (const [lang, items] of Object.entries(RESOURCES)) {
      for (const item of items) {
        expect(validCategories, `${lang}: invalid category "${item.category}"`).toContain(
          item.category,
        );
      }
    }
  });

  it('every resource has title and note', () => {
    for (const [lang, items] of Object.entries(RESOURCES)) {
      for (const item of items) {
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
        const matches = MATRIX_DATA[lang].matrices.filter((m) => m.level === level);
        expect(matches.length, `${lang} has no ${level} matrix`).toBeGreaterThan(0);
      }
    }
  });

  it('matrix ids are unique within each language', () => {
    for (const lang of langIds) {
      const ids = MATRIX_DATA[lang].matrices.map((m) => m.id);
      expect(new Set(ids).size, `${lang} has duplicate matrix ids`).toBe(ids.length);
    }
  });

  it('every matrix has exactly one subject and one modal column', () => {
    for (const lang of langIds) {
      for (const matrix of MATRIX_DATA[lang].matrices) {
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
      for (const matrix of MATRIX_DATA[lang].matrices) {
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
      for (const matrix of MATRIX_DATA[lang].matrices) {
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
      for (const matrix of MATRIX_DATA[lang].matrices) {
        expect(matrix.description, `${lang}/${matrix.id} missing description`).toBeTruthy();
      }
    }
  });
});
