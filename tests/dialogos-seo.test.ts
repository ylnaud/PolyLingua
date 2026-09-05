import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Las meta descriptions de los diálogos.
 *
 * El schema Zod de `src/content.config.ts` pide `description: z.string()` y
 * nada más, así que las 100 estuvieron entre 74 y 115 caracteres —ninguna
 * llegaba a las 130-160 que exige CLAUDE.md— sin que nada lo detectara. Una
 * auditoría del build lo encontró; este test es lo que impide que vuelva.
 *
 * El rango no se mete en el schema porque un fallo de Zod rompe el build
 * entero, y una descripción corta es un problema de calidad, no de datos
 * inválidos: mejor un test rojo que un sitio que no compila.
 */
const RAIZ = join(import.meta.dirname, '..', 'src', 'content', 'dialogos');
const MIN = 130;
const MAX = 160;

function archivos(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? archivos(p) : e.name.endsWith('.md') ? [p] : [];
  });
}

/**
 * Se lee la línea directamente en vez de parsear el YAML: `js-yaml` no trae
 * tipos y el proyecto no añade dependencias por un test. La description es
 * siempre una cadena entre comillas simples, donde YAML escapa la comilla
 * duplicándola.
 */
function descriptionDe(archivo: string): string {
  const raw = readFileSync(archivo, 'utf-8');
  const m = raw.match(/^description: '((?:[^']|'')*)'\s*$/m);
  if (!m) throw new Error(`Sin description entre comillas simples: ${archivo}`);
  return m[1]!.replace(/''/g, "'");
}

const dialogos = archivos(RAIZ).map((f) => ({
  id: relative(RAIZ, f).replace(/\.md$/, ''),
  description: descriptionDe(f),
}));

describe('meta descriptions de los diálogos', () => {
  it('hay diálogos que comprobar (control de la propia comprobación)', () => {
    expect(dialogos.length).toBeGreaterThan(50);
  });

  it.each(dialogos.map((d) => [d.id, d.description] as const))(
    '%s tiene una description de 130-160 caracteres',
    (_id, description) => {
      expect(description.length).toBeGreaterThanOrEqual(MIN);
      expect(description.length).toBeLessThanOrEqual(MAX);
    },
  );

  it('no hay dos descriptions idénticas', () => {
    const vistas = new Map<string, string[]>();
    for (const d of dialogos) {
      if (!vistas.has(d.description)) vistas.set(d.description, []);
      vistas.get(d.description)!.push(d.id);
    }
    const dup = [...vistas.values()].filter((l) => l.length > 1);
    expect(dup, `descriptions repetidas: ${JSON.stringify(dup)}`).toHaveLength(0);
  });

  // Los cinco supermercados tienen literalmente el mismo diálogo de cuatro
  // líneas en de/en/fr/it/pt, así que es fácil que sus descripciones acaben
  // siendo la misma frase con el idioma cambiado. Para Google eso son cinco
  // páginas que dicen lo mismo.
  it('no hay descriptions casi idénticas entre sí', () => {
    const palabras = (s: string) =>
      new Set(
        s
          .toLowerCase()
          .replace(/[^\p{L}\s]/gu, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 3),
      );
    const parecidas: string[] = [];
    for (let i = 0; i < dialogos.length; i++) {
      for (let j = i + 1; j < dialogos.length; j++) {
        const a = palabras(dialogos[i]!.description);
        const b = palabras(dialogos[j]!.description);
        const comunes = [...a].filter((w) => b.has(w)).length;
        if (comunes / Math.max(a.size, b.size) >= 0.85) {
          parecidas.push(`${dialogos[i]!.id} ~ ${dialogos[j]!.id}`);
        }
      }
    }
    expect(parecidas, `descriptions casi idénticas: ${parecidas.join(', ')}`).toHaveLength(0);
  });
});

/**
 * Datos estructurados de los diálogos y sus hubs.
 *
 * Los hubs se indexaron para desatascar los 100 diálogos, que no recibían
 * ningún enlace seguible. Pero salieron sin NINGÚN dato estructurado, y los
 * diálogos sin BreadcrumbList aunque pintaran las migas. Esto lo fija.
 */
describe('datos estructurados de diálogos y hubs', () => {
  const DIST = join(import.meta.dirname, '..', 'dist');
  const LANGS = ['de', 'en', 'fr', 'it', 'pt'];

  beforeAll(() => {
    if (existsSync(join(DIST, 'index.html'))) return;
    execSync('npx astro build', { cwd: join(import.meta.dirname, '..'), timeout: 300_000 });
  }, 300_000);

  const jsonLd = (archivo: string) =>
    [
      ...readFileSync(archivo, 'utf-8').matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
      ),
    ]
      .map((m) => JSON.parse(m[1]!.replace(/\\u003c/g, '<')))
      .flatMap((j) => (j['@graph'] ? j['@graph'] : [j]));

  it.each(LANGS)('el hub de %s declara un ItemList igual al DOM, en el mismo orden', (lang) => {
    const archivo = join(DIST, 'es', lang, 'dialogos', 'index.html');
    const html = readFileSync(archivo, 'utf-8');
    const coleccion = jsonLd(archivo).find((x) => x['@type'] === 'CollectionPage');
    expect(coleccion, `sin CollectionPage en /es/${lang}/dialogos`).toBeDefined();

    const declarados = coleccion.mainEntity.itemListElement.map((i: { url: string }) =>
      new URL(i.url).pathname.replace(/\/$/, ''),
    );
    // Lo que la página pinta de verdad, en orden de aparición.
    const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)![1]!;
    const re = new RegExp(`href="(/es/${lang}/dialogos/[^"]+)"`, 'g');
    const enLaPagina = [...new Set([...main.matchAll(re)].map((m) => m[1]!.replace(/\/$/, '')))];

    expect(declarados).toEqual(enLaPagina);
    expect(coleccion.mainEntity.numberOfItems).toBe(enLaPagina.length);
  });

  it.each(LANGS)('el hub de %s tiene una description de 130-160 caracteres', (lang) => {
    const html = readFileSync(join(DIST, 'es', lang, 'dialogos', 'index.html'), 'utf-8');
    const desc = html
      .match(/<meta name="description" content="([^"]*)"/)![1]!
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
    expect(desc.length).toBeGreaterThanOrEqual(MIN);
    expect(desc.length).toBeLessThanOrEqual(MAX);
  });

  it.each(LANGS)('el hub de %s lleva BreadcrumbList y no repite tipos', (lang) => {
    const tipos = jsonLd(join(DIST, 'es', lang, 'dialogos', 'index.html')).map((x) => x['@type']);
    expect(tipos).toContain('BreadcrumbList');
    expect(new Set(tipos).size, `tipos repetidos: ${tipos.join(', ')}`).toBe(tipos.length);
  });

  it('cada diálogo lleva BreadcrumbList y LearningResource, sin duplicar ninguno', () => {
    for (const d of dialogos) {
      // El id es "<idioma>/<nivel>/<slug>" y la ruta publicada
      // "/es/<idioma>/dialogos/<slug>": el nivel no aparece en la URL.
      const [idioma, , slug] = d.id.split('/');
      const archivo = join(DIST, 'es', idioma!, 'dialogos', slug!, 'index.html');
      const tipos = jsonLd(archivo).map((x) => x['@type']);
      expect(tipos, d.id).toContain('BreadcrumbList');
      expect(tipos, d.id).toContain('LearningResource');
      expect(new Set(tipos).size, `${d.id}: tipos repetidos`).toBe(tipos.length);
    }
  });

  // BaseSEO arma los hreflang como /<userLang>/<targetLang><restPath>. Sin
  // restPath, cada diálogo declararía la portada del curso como su propia
  // alternativa de idioma.
  it('el hreflang de un diálogo apunta a sí mismo, no a la portada del curso', () => {
    const html = readFileSync(
      join(DIST, 'es', 'de', 'dialogos', 'im-supermarkt', 'index.html'),
      'utf-8',
    );
    const alt = [...html.matchAll(/hreflang="es-ES" href="([^"]*)"/g)].map(
      (m) => new URL(m[1]!).pathname,
    );
    expect(alt).toEqual(['/es/de/dialogos/im-supermarkt']);
  });
});
