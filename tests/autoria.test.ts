import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { AUTHOR } from '../src/data/author';

// El sitio no decía quién lo escribe. /acerca hablaba de «una sola persona sin
// empresa detrás» sin nombrarla, y el JSON-LD del blog firmaba
// `author: Organization: PolyLingua`, que decía lo contrario: o lo escribe una
// organización o lo escribe una persona.
//
// La firma vive ahora en src/data/author.ts y la usan cuatro sitios. Estos
// tests comprueban que los cuatro siguen diciendo lo mismo, que es la parte
// que se desincroniza sola.
const DIST = join(process.cwd(), 'dist');
const hayBuild = existsSync(DIST);

/** Extrae los objetos JSON-LD de una página del build. */
function jsonLd(rel: string): unknown[] {
  const html = readFileSync(join(DIST, rel), 'utf8');
  const bloques = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  return bloques.flatMap((m) => {
    const dato = JSON.parse(m[1]!) as { '@graph'?: unknown[] };
    return dato['@graph'] ?? [dato];
  });
}

const nodo = (nodos: unknown[], tipo: string) =>
  nodos.find((n) => (n as { '@type'?: string })['@type'] === tipo) as
    Record<string, unknown> | undefined;

describe.skipIf(!hayBuild)('autoría', () => {
  it('/acerca nombra a la persona y emite su nodo Person', () => {
    const html = readFileSync(join(DIST, 'acerca/index.html'), 'utf8');
    expect(html).toContain(AUTHOR.name);

    const persona = nodo(jsonLd('acerca/index.html'), 'Person');
    expect(persona, 'falta el nodo Person en /acerca').toBeDefined();
    expect(persona!.name).toBe(AUTHOR.name);
    // El @id es lo que permite que el `author` de cada post apunte acá en vez
    // de repetir el nombre suelto. Si cambia, hay que cambiarlo en los dos.
    expect(String(persona!['@id'])).toMatch(/\/acerca#autor$/);
  });

  it('/acerca declara cómo se produce el contenido', () => {
    // El eje «Cómo» de la guía de contenido útil: son casi 500 lecciones
    // redactadas con asistencia de IA, y el lector tiene que poder saberlo.
    // Se comprueba el hecho declarado, no la redacción exacta.
    const html = readFileSync(join(DIST, 'acerca/index.html'), 'utf8');
    expect(html.toLowerCase()).toContain('inteligencia artificial');
  });

  it('cada post firma con una Person que apunta a /acerca, no con la marca', () => {
    const posts = readdirSync(join(DIST, 'blog'), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => `blog/${e.name}/index.html`);
    expect(posts.length).toBeGreaterThan(5);

    for (const p of posts) {
      const post = nodo(jsonLd(p), 'BlogPosting');
      expect(post, `${p} no emite BlogPosting`).toBeDefined();

      const autor = post!.author as Record<string, unknown>;
      expect(autor['@type'], `${p}: el autor no es una persona`).toBe('Person');
      expect(autor.name, `${p}: nombre de autor distinto`).toBe(AUTHOR.name);
      expect(String(autor['@id']), `${p}: el autor no apunta a /acerca`).toMatch(/\/acerca#autor$/);

      // El publisher sí es la marca: escribir y editar son cosas distintas
      // aunque hoy las haga la misma persona.
      const editor = post!.publisher as Record<string, unknown>;
      expect(editor['@type'], `${p}: el publisher debería ser la marca`).toBe('Organization');
    }
  });

  it('el byline se ve en la página, no solo en los datos estructurados', () => {
    // Un autor que solo existe en el JSON-LD no le sirve a nadie que lea la
    // página. Google además desconfía de lo que se declara y no se muestra.
    const html = readFileSync(join(DIST, 'blog/der-die-das-trucos/index.html'), 'utf8');
    const meta = html.match(/<div class="meta"[^>]*>.*?<\/div>/s);
    expect(meta, 'no hay bloque .meta en el post').not.toBeNull();
    expect(meta![0]).toContain(AUTHOR.name);
  });

  it('existe la página de términos y se llega a ella desde /acerca', () => {
    expect(existsSync(join(DIST, 'terminos/index.html'))).toBe(true);
    const html = readFileSync(join(DIST, 'acerca/index.html'), 'utf8');
    expect(html).toContain('href="/terminos"');
  });
});
