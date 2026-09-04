/**
 * DRY RUN del sistema de enlaces internos. NO escribe nada en src/.
 *
 *   node scripts/links-dryrun.ts            # informe legible
 *   node scripts/links-dryrun.ts --json ruta.json
 *
 * Node 22 ejecuta TypeScript directamente, así que esto carga el MISMO
 * `src/lib/links/engine.ts` que usaría el sitio. No es una copia de la
 * lógica: si fuera una copia, aprobar el informe no garantizaría nada.
 *
 * De dónde salen las rutas: de los ids reales de las colecciones de contenido,
 * leídos del disco, y de nada más. Después cada una se comprueba contra
 * `dist/`, así que una ruta que no exista en el build sale marcada y no se
 * propone. No hay ningún sitio en este archivo donde se concatene una keyword
 * para formar una URL.
 */
import { readdirSync, readFileSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { SKILLS } from '../src/data/skills.ts';
import { LANGUAGES } from '../src/data/languages.ts';
import { USER_LANGUAGES } from '../src/data/userLanguages.ts';
import {
  proposeLinks,
  buildRelations,
  UMBRAL,
  MAX_POR_PAGINA,
  type PageRecord,
  type Propuesta,
} from '../src/lib/links/engine.ts';
import { LEVELS } from '../src/data/levels.ts';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const CONTENT = join(ROOT, 'src', 'content');

const ACTIVOS = new Set<string>(USER_LANGUAGES.filter((l) => l.active).map((l) => l.id));

function md(archivo: string): { data: Record<string, unknown>; cuerpo: string } {
  const raw = readFileSync(archivo, 'utf-8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error(`Sin frontmatter: ${archivo}`);
  return { data: yaml.load(m[1]) as Record<string, unknown>, cuerpo: raw.slice(m[0].length) };
}

function archivosMd(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...archivosMd(p));
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

// ── Cargar las páginas reales ────────────────────────────────────────────────
const pages: PageRecord[] = [];
const cursosVistos = new Set<string>();

// Lecciones: src/content/lessons/<userLang>-<targetLang>/<nivel>/<slug>.md
for (const archivo of archivosMd(join(CONTENT, 'lessons'))) {
  const rel = archivo.slice(join(CONTENT, 'lessons').length + 1);
  const [cursoDir, nivel, nombre] = rel.split('/');
  const [userLang, targetLang] = cursoDir!.split('-');
  const slug = nombre!.replace(/\.md$/, '');
  const { data } = md(archivo);
  pages.push({
    route: `/${userLang}/${targetLang}/${nivel}/${slug}`,
    kind: 'leccion',
    userLang: userLang!,
    targetLang: targetLang!,
    level: nivel!,
    unit: typeof data.unit === 'number' ? data.unit : null,
    order: typeof data.order === 'number' ? data.order : null,
    title: String(data.title ?? ''),
    grammarTopic: data.grammarTopic ? String(data.grammarTopic) : null,
    skills: (data.skills as string[] | undefined) ?? [],
    situation: null,
    tags: [],
    // El silo de un idioma de interfaz inactivo lleva noindex,nofollow
    // (BaseLayout). Enlazar ahí sería regalar autoridad a páginas que el
    // propio sitio le pide a Google que ignore.
    indexable: ACTIVOS.has(userLang!),
  });
  cursosVistos.add(`${userLang}/${targetLang}`);
}

// Cursos y niveles: son páginas generadas por rutas dinámicas, no archivos de
// contenido, así que sus rutas se arman con los mismos params que usa
// getCourseStaticPaths() — y se verifican contra dist/ igual que el resto.
for (const combo of cursosVistos) {
  const [userLang, targetLang] = combo.split('/');
  const nombre = LANGUAGES.find((l) => l.id === targetLang)?.name ?? combo;
  pages.push({
    route: `/${combo}`,
    kind: 'curso',
    userLang: userLang!,
    targetLang: targetLang!,
    level: null,
    unit: null,
    order: null,
    title: nombre,
    grammarTopic: null,
    skills: [],
    situation: null,
    tags: [],
    indexable: ACTIVOS.has(userLang!),
  });
  for (const nivel of LEVELS) {
    pages.push({
      route: `/${combo}/${nivel.id}`,
      kind: 'nivel',
      userLang: userLang!,
      targetLang: targetLang!,
      level: nivel.id,
      unit: null,
      order: null,
      title: `${nombre} ${nivel.id.toUpperCase()}`,
      grammarTopic: `${nombre} ${nivel.id.toUpperCase()}`,
      skills: [],
      situation: null,
      tags: [],
      indexable: ACTIVOS.has(userLang!),
    });
  }
}

// Diálogos: src/content/dialogos/<lang>/<...>/<slug>.md, solo en el silo español.
for (const archivo of archivosMd(join(CONTENT, 'dialogos'))) {
  const rel = archivo.slice(join(CONTENT, 'dialogos').length + 1);
  const partes = rel.split('/');
  const lang = partes[0]!;
  const slug = partes[partes.length - 1]!.replace(/\.md$/, '');
  const { data } = md(archivo);
  pages.push({
    route: `/es/${lang}/dialogos/${slug}`,
    kind: 'dialogo',
    userLang: 'es',
    targetLang: lang,
    level: String(data.level ?? ''),
    unit: null,
    order: typeof data.order === 'number' ? data.order : null,
    title: String(data.title ?? ''),
    grammarTopic: null,
    skills: [],
    situation: data.situation ? String(data.situation) : null,
    tags: [],
    indexable: true,
  });
}

// Blog.
for (const archivo of archivosMd(join(CONTENT, 'blog'))) {
  const slug = archivo.split('/').pop()!.replace(/\.md$/, '');
  const { data } = md(archivo);
  pages.push({
    route: `/blog/${slug}`,
    kind: 'blog',
    userLang: 'es',
    targetLang: null,
    level: null,
    unit: null,
    order: null,
    title: String(data.title ?? ''),
    grammarTopic: null,
    skills: [],
    situation: null,
    tags: (data.tags as string[] | undefined) ?? [],
    indexable: true,
  });
}

// ── Comprobar TODA ruta contra el build ─────────────────────────────────────
const hayDist = existsSync(DIST) && statSync(DIST).isDirectory();
const inexistentes: string[] = [];
if (hayDist) {
  for (const p of pages) {
    if (!existsSync(join(DIST, p.route, 'index.html'))) inexistentes.push(`${p.kind} ${p.route}`);
  }
} else {
  console.error('AVISO: no hay dist/. Corré `npx astro build` para poder verificar las rutas.\n');
}

const validas = hayDist
  ? pages.filter((p) => existsSync(join(DIST, p.route, 'index.html')))
  : pages;

// ── Propuestas ──────────────────────────────────────────────────────────────
const entrada = {
  pages: validas,
  skills: SKILLS.map((s) => ({ id: s.id, prerequisites: s.prerequisites })),
  languages: LANGUAGES.map((l) => ({ id: l.id, name: l.name })),
};
const todas = buildRelations(entrada);
const propuestas = proposeLinks(entrada);

// ── Informe ─────────────────────────────────────────────────────────────────
const enlazables = validas.filter((p) => p.indexable);
const total = [...propuestas.values()].reduce((n, l) => n + l.length, 0);
const conBloque = propuestas.size;

const linea = (s = '') => console.log(s);
linea('════════════════════════════════════════════════════════════════');
linea('  DRY RUN — sistema de enlaces internos. NO se ha modificado nada.');
linea('════════════════════════════════════════════════════════════════');
linea();
linea(`Páginas cargadas del contenido real: ${pages.length}`);
linea(`  verificadas contra dist/:          ${validas.length}`);
if (inexistentes.length) {
  linea(`  NO EXISTEN en el build (descartadas): ${inexistentes.length}`);
  for (const r of inexistentes.slice(0, 10)) linea(`     · ${r}`);
  if (inexistentes.length > 10) linea(`     …y ${inexistentes.length - 10} más`);
}
linea(`  enlazables (indexables):           ${enlazables.length}`);
linea();
linea(`Umbral de score: ${UMBRAL}   ·   máximo por página: ${MAX_POR_PAGINA}`);
linea();
linea(`Relaciones candidatas encontradas:   ${todas.length}`);
linea(`Enlaces que se publicarían:          ${total}`);
linea(`Páginas que reciben bloque:          ${conBloque} / ${enlazables.length}`);
linea(
  `Páginas SIN bloque (no llegan al umbral): ${enlazables.length - conBloque} — se quedan sin enlaces a propósito`,
);
linea();

const porMotivo: Record<string, number> = {};
for (const lista of propuestas.values()) {
  for (const p of lista) porMotivo[p.motivo] = (porMotivo[p.motivo] ?? 0) + 1;
}
linea('POR MOTIVO:');
for (const [m, n] of Object.entries(porMotivo).sort((a, b) => b[1] - a[1])) {
  linea(`  ${String(n).padStart(5)}  ${m}`);
}
linea();

const porTipo: Record<string, { con: number; de: number; enlaces: number }> = {};
for (const p of enlazables) {
  porTipo[p.kind] ??= { con: 0, de: 0, enlaces: 0 };
  porTipo[p.kind]!.de++;
  const l = propuestas.get(p.route);
  if (l) {
    porTipo[p.kind]!.con++;
    porTipo[p.kind]!.enlaces += l.length;
  }
}
linea('POR TIPO DE PÁGINA DE ORIGEN:');
for (const [t, v] of Object.entries(porTipo).sort((a, b) => b[1].de - a[1].de)) {
  linea(
    `  ${t.padEnd(9)} ${String(v.con).padStart(4)}/${String(v.de).padEnd(4)} reciben bloque · ${v.enlaces} enlaces`,
  );
}
linea();

// Concentración: si un puñado de destinos se lleva todo, es una granja.
const entradas = new Map<string, number>();
for (const lista of propuestas.values()) {
  for (const p of lista) entradas.set(p.hasta, (entradas.get(p.hasta) ?? 0) + 1);
}
linea('DESTINOS MÁS ENLAZADOS (para detectar concentración):');
for (const [r, n] of [...entradas.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  linea(`  ${String(n).padStart(4)}  ${r}`);
}
linea();

// Antes / después del grafo editorial.
const sinEntrada = enlazables.filter((p) => !entradas.has(p.route));
linea('EFECTO SOBRE EL GRAFO:');
linea(`  páginas enlazables sin ningún enlace entrante nuevo: ${sinEntrada.length}`);
const huerfanosPorTipo: Record<string, number> = {};
for (const p of sinEntrada) huerfanosPorTipo[p.kind] = (huerfanosPorTipo[p.kind] ?? 0) + 1;
linea(`  ${JSON.stringify(huerfanosPorTipo)}`);
const dialogosConEntrada = validas.filter(
  (p) => p.kind === 'dialogo' && entradas.has(p.route),
).length;
const dialogosTotal = validas.filter((p) => p.kind === 'dialogo').length;
linea(
  `  diálogos que pasan a tener enlace editorial entrante: ${dialogosConEntrada} / ${dialogosTotal}`,
);
linea();

// Muestra revisable: cada propuesta con su porqué.
const MUESTRA = Number(process.env.MUESTRA ?? 25);
linea(`MUESTRA DE PROPUESTAS (${MUESTRA} páginas; el JSON lleva las ${conBloque}):`);
linea();
const ordenadas = [...propuestas.entries()].sort((a, b) => a[0].localeCompare(b[0]));
for (const [desde, lista] of ordenadas.slice(0, MUESTRA)) {
  linea(`  ${desde}`);
  for (const p of lista) {
    linea(`     → ${p.hasta}`);
    linea(`       anchor: "${p.anchor}"`);
    linea(`       motivo: ${p.motivo} (score ${p.score}) — ${p.porque}`);
  }
  linea();
}

const salida: Record<string, Propuesta[]> = {};
for (const [k, v] of ordenadas) salida[k] = v;
const jsonIdx = process.argv.indexOf('--json');
const jsonPath = jsonIdx >= 0 ? process.argv[jsonIdx + 1] : null;
if (jsonPath) {
  writeFileSync(
    jsonPath,
    JSON.stringify({ resumen: { total, conBloque, porMotivo }, propuestas: salida }, null, 1),
  );
  linea(`(propuestas completas en ${jsonPath})`);
}

linea();
linea('No se ha modificado ningún archivo. Para aplicar hace falta tu aprobación.');
