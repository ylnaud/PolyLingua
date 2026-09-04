/**
 * El adaptador de Astro para el motor de enlaces internos.
 *
 * Traduce las Content Collections a los `PageRecord` que espera
 * `engine.ts`, y expone las propuestas ya resueltas. Su gemelo es
 * `scripts/links-dryrun.ts`, que arma los mismos registros leyendo el disco;
 * los dos alimentan el MISMO motor, así que lo que aprueba el DRY RUN es
 * exactamente lo que se publica.
 *
 * Las rutas se derivan de los ids de las colecciones vía `parseLessonId()` y
 * de los params de las rutas dinámicas. En ningún punto se concatena una
 * keyword: no hay forma de que salga una URL inventada.
 *
 * Se computa UNA vez por build, al evaluarse el módulo. Es importante que sea
 * acá y no dentro del componente: `RelatedLinks` se renderiza en cientos de
 * páginas, y recalcular el grafo entero en cada una multiplicaría el build.
 * Es el mismo motivo por el que `src/lib/courses.ts` cachea su getCollection().
 */
import { getCollection } from 'astro:content';
import { SKILLS } from '../../data/skills';
import { LANGUAGES } from '../../data/languages';
import { LEVELS } from '../../data/levels';
import { USER_LANGUAGES } from '../../data/userLanguages';
import { parseLessonId } from '../lessonPath';
import { proposeLinks, type PageRecord, type Propuesta } from './engine';

const ACTIVOS = new Set<string>(USER_LANGUAGES.filter((l) => l.active).map((l) => l.id));

const base = {
  unit: null,
  order: null,
  grammarTopic: null,
  skills: [] as string[],
  situation: null,
  tags: [] as string[],
};

const pages: PageRecord[] = [];
const cursos = new Set<string>();

for (const leccion of await getCollection('lessons')) {
  const { userLang, targetLang, level, slug } = parseLessonId(leccion.id);
  pages.push({
    ...base,
    route: `/${userLang}/${targetLang}/${level}/${slug}`,
    kind: 'leccion',
    userLang,
    targetLang,
    level,
    unit: leccion.data.unit ?? null,
    order: leccion.data.order ?? null,
    title: leccion.data.title,
    grammarTopic: leccion.data.grammarTopic ?? null,
    skills: leccion.data.skills ?? [],
    // El silo de un idioma de interfaz inactivo lleva noindex,nofollow.
    // Enlazar ahí sería repartir autoridad hacia páginas que el propio sitio
    // le pide a Google que ignore.
    indexable: ACTIVOS.has(userLang),
  });
  cursos.add(`${userLang}/${targetLang}`);
}

for (const combo of cursos) {
  const [userLang, targetLang] = combo.split('/') as [string, string];
  const nombre = LANGUAGES.find((l) => l.id === targetLang)?.name ?? combo;
  const indexable = ACTIVOS.has(userLang);
  pages.push({
    ...base,
    route: `/${combo}`,
    kind: 'curso',
    userLang,
    targetLang,
    level: null,
    title: nombre,
    indexable,
  });
  for (const nivel of LEVELS) {
    pages.push({
      ...base,
      route: `/${combo}/${nivel.id}`,
      kind: 'nivel',
      userLang,
      targetLang,
      level: nivel.id,
      title: `${nombre} ${nivel.id.toUpperCase()}`,
      grammarTopic: `${nombre} ${nivel.id.toUpperCase()}`,
      indexable,
    });
  }
}

// Los diálogos no tienen eje userLang: su id es "<idioma>/<slug>" y solo se
// generan dentro del silo español (SPANISH_GLOSS_USER_LANG).
for (const dialogo of await getCollection('dialogos')) {
  const partes = dialogo.id.split('/');
  pages.push({
    ...base,
    route: `/es/${partes[0]}/dialogos/${partes[partes.length - 1]}`,
    kind: 'dialogo',
    userLang: 'es',
    targetLang: dialogo.data.language,
    level: dialogo.data.level,
    order: dialogo.data.order,
    title: dialogo.data.title,
    situation: dialogo.data.situation,
    indexable: true,
  });
}

for (const post of await getCollection('blog')) {
  pages.push({
    ...base,
    route: `/blog/${post.id}`,
    kind: 'blog',
    userLang: 'es',
    targetLang: null,
    level: null,
    title: post.data.title,
    tags: post.data.tags,
    indexable: true,
  });
}

const PROPUESTAS = proposeLinks({
  pages,
  skills: SKILLS.map((s) => ({ id: s.id, prerequisites: s.prerequisites })),
  languages: LANGUAGES.map((l) => ({ id: l.id, name: l.name })),
});

/** Los enlaces relacionados de una ruta. Vacío si no llegó al umbral. */
export function relatedFor(route: string): Propuesta[] {
  return PROPUESTAS.get(route.replace(/\/$/, '') || '/') ?? [];
}
