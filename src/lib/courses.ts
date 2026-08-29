import { getCollection } from 'astro:content';
import type { LanguageId } from '../data/languages';
import { parseLessonId } from './lessonPath';

// Qué idiomas meta tiene disponible cada idioma de interfaz, derivado de las
// lecciones que existen de verdad (no todos los userLang tienen los mismos
// targets: es-* tiene 5 cursos, en-* solo en-de).
//
// Se computa UNA sola vez por build, al evaluarse el módulo. Es importante
// que sea acá y no dentro del componente: el Footer se renderiza en las
// ~1300 páginas del sitio, y llamar a getCollection() en cada una llevó el
// build de 23s a 63s — lo suficiente para pasarse del timeout del test.
const lessons = await getCollection('lessons');

const byUserLang = new Map<string, Set<LanguageId>>();
for (const lesson of lessons) {
  const { userLang } = parseLessonId(lesson.id);
  if (!byUserLang.has(userLang)) byUserLang.set(userLang, new Set());
  byUserLang.get(userLang)!.add(lesson.data.language);
}

const TARGET_LANGS_BY_USER_LANG = new Map(
  [...byUserLang].map(([userLang, targets]) => [userLang, [...targets].sort()]),
);

export function getTargetLangsFor(userLang: string): LanguageId[] {
  return TARGET_LANGS_BY_USER_LANG.get(userLang) ?? [];
}
