#!/usr/bin/env node
// Valida el frontmatter de las lecciones de PolyLingua y genera un índice
// pensado para subir junto con las lecciones a un Proyecto de Claude.ai con
// RAG. Ver SKILL.md en esta misma carpeta para el detalle de qué chequea y
// por qué. Script standalone: no pasa por Vite/Astro, corre con `node`
// directo y no toca `src/content/lessons/` (solo lee de ahí).

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const SKILL_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SKILL_DIR, '..', '..', '..');
const LESSONS_DIR = join(REPO_ROOT, 'src', 'content', 'lessons');
const INDEX_PATH = join(SKILL_DIR, 'INDEX.md');

const LANGS = ['de', 'en', 'fr', 'it', 'pt'];
const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const REQUIRED_FIELDS = ['level', 'title', 'description', 'order', 'grammarTopic', 'funFact', 'minutes'];
const MAX_BODY_WORDS = 1500;
const DESC_MIN = 20;
const DESC_MAX = 160;
const NEAR_DUP_THRESHOLD = 0.8;

function splitFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;
  return { frontmatter: match[1], body: match[2] };
}

function wordCount(body) {
  const stripped = body.trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).length;
}

function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function jaccard(a, b) {
  const setA = new Set(a.split(' '));
  const setB = new Set(b.split(' '));
  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

const GENERIC_DESCRIPTION = /^lecci[oó]n de \w+$/i;

function loadLessons() {
  const lessons = [];
  for (const lang of LANGS) {
    for (const level of LEVELS) {
      const dir = join(LESSONS_DIR, lang, level);
      let entries;
      try {
        entries = readdirSync(dir);
      } catch {
        continue; // el par idioma/nivel puede no existir aún
      }
      for (const entry of entries) {
        if (!entry.endsWith('.md')) continue;
        const filePath = join(dir, entry);
        if (!statSync(filePath).isFile()) continue;
        const raw = readFileSync(filePath, 'utf-8');
        const split = splitFrontmatter(raw);
        const relPath = `${lang}/${level}/${entry}`;
        if (!split) {
          lessons.push({ relPath, lang, level, parseError: 'sin frontmatter válido (delimitadores --- faltantes)' });
          continue;
        }
        let frontmatter;
        try {
          frontmatter = yaml.load(split.frontmatter) ?? {};
        } catch (e) {
          lessons.push({ relPath, lang, level, parseError: `YAML inválido: ${e.message}` });
          continue;
        }
        lessons.push({ relPath, lang, level, frontmatter, body: split.body });
      }
    }
  }
  return lessons;
}

function validate(lessons) {
  const warnings = [];
  const byLangLevelTitle = new Map(); // "lang/level" -> Map(title -> [relPath...])
  const descByLang = new Map(); // lang -> [{relPath, normalized}]

  for (const lesson of lessons) {
    if (lesson.parseError) {
      warnings.push(`${lesson.relPath}: ${lesson.parseError}`);
      continue;
    }
    const { frontmatter, body, relPath, lang, level } = lesson;

    for (const field of REQUIRED_FIELDS) {
      const value = frontmatter[field];
      if (value === undefined || value === null || value === '') {
        warnings.push(`${relPath}: falta el campo "${field}"`);
      }
    }

    const description = typeof frontmatter.description === 'string' ? frontmatter.description : '';
    if (description) {
      if (description.length < DESC_MIN || description.length > DESC_MAX) {
        warnings.push(
          `${relPath}: description tiene ${description.length} caracteres (esperado ${DESC_MIN}-${DESC_MAX})`,
        );
      }
      if (GENERIC_DESCRIPTION.test(description.trim())) {
        warnings.push(`${relPath}: description es demasiado genérica ("${description}")`);
      }
    }

    const words = wordCount(body ?? '');
    if (words > MAX_BODY_WORDS) {
      warnings.push(`${relPath}: cuerpo de ${words} palabras (>${MAX_BODY_WORDS}) — considerá dividir en dos lecciones`);
    }

    const title = typeof frontmatter.title === 'string' ? frontmatter.title : null;
    if (title) {
      const key = `${lang}/${level}`;
      if (!byLangLevelTitle.has(key)) byLangLevelTitle.set(key, new Map());
      const titleMap = byLangLevelTitle.get(key);
      const normTitle = normalize(title);
      if (!titleMap.has(normTitle)) titleMap.set(normTitle, []);
      titleMap.get(normTitle).push(relPath);
    }

    if (description) {
      if (!descByLang.has(lang)) descByLang.set(lang, []);
      descByLang.get(lang).push({ relPath, normalized: normalize(description) });
    }
  }

  for (const [key, titleMap] of byLangLevelTitle) {
    for (const [title, paths] of titleMap) {
      if (paths.length > 1) {
        warnings.push(`Título duplicado en ${key} ("${title}"): ${paths.join(', ')}`);
      }
    }
  }

  for (const [lang, items] of descByLang) {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        if (a.normalized === b.normalized) {
          warnings.push(`Description idéntica en ${lang} entre ${a.relPath} y ${b.relPath}`);
        } else if (jaccard(a.normalized, b.normalized) >= NEAR_DUP_THRESHOLD) {
          warnings.push(`Description casi idéntica en ${lang} entre ${a.relPath} y ${b.relPath}`);
        }
      }
    }
  }

  return warnings;
}

function buildIndex(lessons) {
  const valid = lessons.filter((l) => !l.parseError && l.frontmatter);
  const byLang = new Map();
  for (const lesson of valid) {
    if (!byLang.has(lesson.lang)) byLang.set(lesson.lang, []);
    byLang.get(lesson.lang).push(lesson);
  }

  const levelRank = Object.fromEntries(LEVELS.map((l, i) => [l, i]));
  const lines = [
    '# Índice de lecciones — PolyLingua',
    '',
    'Generado por `check-lessons.mjs`. No editar a mano — se regenera cada vez',
    'que corre el script. Pensado para subir junto con las lecciones a un',
    'Proyecto de Claude.ai con RAG: da una vista de conjunto antes de que el',
    'modelo recupere fragmentos individuales.',
    '',
  ];

  for (const lang of LANGS) {
    const items = byLang.get(lang) ?? [];
    if (items.length === 0) continue;
    items.sort((a, b) => {
      const levelDiff = (levelRank[a.level] ?? 99) - (levelRank[b.level] ?? 99);
      if (levelDiff !== 0) return levelDiff;
      return (a.frontmatter.order ?? 0) - (b.frontmatter.order ?? 0);
    });
    lines.push(`## ${lang}`, '', '| Nivel | Título | Descripción | Tema gramatical |', '| --- | --- | --- | --- |');
    for (const item of items) {
      const { title = '', description = '', grammarTopic = '' } = item.frontmatter;
      const clean = (s) => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
      lines.push(`| ${item.level} | ${clean(title)} | ${clean(description)} | ${clean(grammarTopic)} |`);
    }
    lines.push('');
  }

  return lines.join('\n') + '\n';
}

const lessons = loadLessons();
const warnings = validate(lessons);

console.log(`Lecciones encontradas: ${lessons.length}`);
if (warnings.length === 0) {
  console.log('Sin advertencias — todo el frontmatter está bien formado para RAG.');
} else {
  console.log(`Advertencias (${warnings.length}):`);
  for (const w of warnings) console.log(`  - ${w}`);
}

writeFileSync(INDEX_PATH, buildIndex(lessons));
console.log(`\nÍndice regenerado en ${INDEX_PATH}`);
