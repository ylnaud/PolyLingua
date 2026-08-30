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

export interface CourseCombo {
  userLang: string;
  targetLang: LanguageId;
}

// Los 11 pares (idioma de interfaz, idioma meta) que existen, ordenados. Son
// los params de las rutas del silo — incluidas las herramientas
// (/[userLang]/[targetLang]/vocabulario y compañía), que antes vivían fuera
// del silo en /idiomas/[lang]/ y por eso solo podían estar en un idioma.
export const COURSE_COMBOS: CourseCombo[] = [...TARGET_LANGS_BY_USER_LANG]
  .flatMap(([userLang, targets]) => targets.map((targetLang) => ({ userLang, targetLang })))
  .sort((a, b) =>
    a.userLang === b.userLang
      ? a.targetLang.localeCompare(b.targetLang)
      : a.userLang.localeCompare(b.userLang),
  );

export const USER_LANGS_WITH_COURSES: string[] = [...TARGET_LANGS_BY_USER_LANG.keys()].sort();

// getStaticPaths de una herramienta por idioma: una página por curso.
export function getCourseStaticPaths() {
  return COURSE_COMBOS.map((params) => ({ params }));
}

// getStaticPaths de un selector de idioma: una página por idioma de interfaz.
export function getUserLangStaticPaths() {
  return USER_LANGS_WITH_COURSES.map((userLang) => ({ params: { userLang } }));
}

// Las lecciones de UN curso. Filtrar solo por `data.language` no alcanza: ese
// campo es el idioma META, así que es-de y en-de matchean los dos y una
// herramienta de /en/de/… terminaría mostrando las lecciones en español. Es
// el mismo error que ya había roto las redirecciones de /niveles/.
export function getCourseLessons(userLang: string, targetLang: string) {
  return lessons.filter(
    (entry) => entry.data.language === targetLang && parseLessonId(entry.id).userLang === userLang,
  );
}

// ¿Existe esta lección en este curso? Los slugs NO son compartidos entre
// cursos: es-de/a1/articulos-der-die-das y en-de/a1/der-die-das-articles
// enseñan lo mismo con slugs distintos. Lo usa el selector de idioma de
// interfaz para no ofrecer "esta misma lección en español" cuando ese slug
// solo existe en el curso actual — el mismo error que ya había mandado 84
// redirecciones de /niveles/ a un 404.
const LESSON_IDS = new Set(lessons.map((l) => l.id));

export function courseHasLesson(
  userLang: string,
  targetLang: string,
  level: string,
  slug: string,
): boolean {
  return LESSON_IDS.has(`${userLang}-${targetLang}/${level}/${slug}`);
}

// Tres herramientas (diálogos, generador de frases y recursos) NO se sirven
// en todos los silos: su contenido guarda la traducción en UN solo idioma de
// interfaz, el español. Los diálogos de src/content/dialogos tienen un campo
// `es` por línea, las matrices de src/data/matrices.ts un `glossEs`, y las
// recomendaciones de src/data/resources.ts una nota en español. Ese contenido
// no está siloado como las lecciones: no tiene eje userLang.
//
// Generarlas igual en /de/… daría una página con la cáscara en alemán y las
// glosas en español, que es justo el problema que estas rutas vienen a
// arreglar. Así que se generan solo dentro del silo español. Cuando ese
// contenido tenga su eje userLang, se borra este filtro y pasan a usar
// getCourseStaticPaths() como las demás.
export const SPANISH_GLOSS_USER_LANG = 'es';

// Las herramientas afectadas, por slug. Además de acotar sus rutas, sirve para
// que el selector de idioma de interfaz no ofrezca "esta misma página en
// alemán" cuando esa página no se genera.
export const SPANISH_GLOSS_TOOLS = ['dialogos', 'generador-frases', 'recursos'];

export function getSpanishGlossCourseStaticPaths() {
  return COURSE_COMBOS.filter((c) => c.userLang === SPANISH_GLOSS_USER_LANG).map((params) => ({
    params,
  }));
}

export function getSpanishGlossUserLangStaticPaths() {
  return [{ params: { userLang: SPANISH_GLOSS_USER_LANG } }];
}
