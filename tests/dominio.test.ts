import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { SITE_HOST, SITE_URL } from '../src/data/site';
import { destinoCanonico } from '../src/lib/dominio';
import worker from '../worker/redirect';

const RAIZ = join(import.meta.dirname, '..');

describe('destinoCanonico', () => {
  // EL test de esta suite. Si alguna vez devuelve una URL en vez de null, el
  // dominio propio se redirige a sí mismo y el sitio entero entra en bucle.
  it('NO redirige cuando la petición ya está en el dominio canónico', () => {
    expect(destinoCanonico('https://ejemplo.com/es/de/a1/', 'ejemplo.com')).toBeNull();
    expect(destinoCanonico('https://ejemplo.com/', 'ejemplo.com')).toBeNull();
  });

  it('manda el subdominio viejo al canónico', () => {
    expect(destinoCanonico(`https://${SITE_HOST}/es/pt/c1/futuro-subjuntivo/`, 'ejemplo.com')).toBe(
      'https://ejemplo.com/es/pt/c1/futuro-subjuntivo/',
    );
  });

  it('conserva la ruta y la query', () => {
    expect(destinoCanonico('https://viejo.dev/blog/?utm_source=x&pag=2', 'ejemplo.com')).toBe(
      'https://ejemplo.com/blog/?utm_source=x&pag=2',
    );
  });

  it('fuerza https y descarta el puerto', () => {
    expect(destinoCanonico('http://viejo.dev:8080/es/de', 'ejemplo.com')).toBe(
      'https://ejemplo.com/es/de',
    );
  });

  it('canonicaliza también un www que sobre', () => {
    expect(destinoCanonico('https://www.ejemplo.com/es/en', 'ejemplo.com')).toBe(
      'https://ejemplo.com/es/en',
    );
  });
});

/**
 * La función pura de arriba puede estar perfecta y el Worker seguir roto si el
 * cableado falla: un 302 en vez de un 301, olvidar llamar al binding de
 * assets. Así que acá se ejercita el `export default` de verdad, el mismo que
 * Cloudflare invocaría, con un `env` de mentira. Es la misma razón por la que
 * `tests/sw.test.ts` prueba el código que se publica y no una copia.
 */
describe('worker/redirect.ts — el Worker que se desplegaría', () => {
  const envFalso = (respuesta = new Response('la página')) => {
    const llamadas: string[] = [];
    return {
      llamadas,
      env: {
        ASSETS: {
          fetch: async (request: Request) => {
            llamadas.push(request.url);
            return respuesta;
          },
        },
      },
    };
  };

  // Ojo con leer esto al revés: hoy SITE_HOST ES el host canónico, así que
  // para ver una redirección hay que pedir desde OTRO host. Tras la mudanza
  // los papeles se invierten solos —el canónico pasa a ser el dominio nuevo y
  // el `*.workers.dev` cae en esta rama— sin tocar el test.
  it('responde 301 —no 302— y conserva la ruta, sin tocar los assets', async () => {
    const { env, llamadas } = envFalso();
    const respuesta = await worker.fetch(
      new Request('https://otro-host.example/es/pt/c1/futuro-subjuntivo/?ref=x'),
      env,
    );
    expect(respuesta.status).toBe(301);
    expect(respuesta.headers.get('location')).toBe(`${SITE_URL}/es/pt/c1/futuro-subjuntivo/?ref=x`);
    expect(llamadas).toEqual([]);
  });

  it('sirve el asset y NO redirige cuando ya está en el dominio canónico', async () => {
    const { env, llamadas } = envFalso();
    const url = `${SITE_URL}/es/de/a1/articulos-der-die-das/`;
    const respuesta = await worker.fetch(new Request(url), env);
    expect(respuesta.status).toBe(200);
    expect(llamadas).toEqual([url]);
  });
});

describe('la URL del sitio tiene una sola fuente de verdad', () => {
  it('astro.config.mjs importa SITE_URL en vez de escribir la URL a mano', () => {
    const config = readFileSync(join(RAIZ, 'astro.config.mjs'), 'utf-8');
    expect(config).toContain('site: SITE_URL');
    expect(config).not.toContain(`site: '${SITE_URL}'`);
  });

  it('SITE_HOST se deriva de SITE_URL, no se escribe aparte', () => {
    expect(SITE_URL).toContain(SITE_HOST);
    expect(new URL(SITE_URL).hostname).toBe(SITE_HOST);
  });
});

/**
 * El candado de la lista de la mudanza.
 *
 * `docs/MIGRACION-DOMINIO.md` promete enumerar TODOS los sitios donde la URL
 * de producción está escrita a mano. Una lista así se queda vieja sola: basta
 * que alguien pegue la URL en una página nueva y el día de la mudanza esa
 * página se quede apuntando al dominio muerto, sin que nada avise.
 *
 * Así que la lista no se mantiene a mano: se comprueba. Si aparece la URL en
 * un archivo que no está acá, este test falla y dice cuál.
 */
describe('la lista de archivos con la URL escrita a mano', () => {
  const ESPERADOS = [
    // La fuente de verdad. Es LA línea que se cambia el día de la mudanza.
    'src/data/site.ts',
    // Ficheros estáticos servidos tal cual: no pueden importar nada.
    'public/llms.txt',
    'public/robots.txt',
    'public/og-image.svg',
    // CSS de impresión: `content:` no puede leer una constante de TypeScript.
    'src/styles/global.css',
    // Documentación.
    'CLAUDE.md',
    'docs/MIGRACION-DOMINIO.md',
  ];

  const IGNORADOS = new Set([
    'node_modules',
    'dist',
    '.git',
    '.astro',
    '.claude',
    '.vercel',
    'coverage',
  ]);

  function archivosConLaUrl(dir: string, encontrados: string[] = []): string[] {
    for (const entrada of readdirSync(dir)) {
      if (IGNORADOS.has(entrada)) continue;
      const ruta = join(dir, entrada);
      if (statSync(ruta).isDirectory()) {
        archivosConLaUrl(ruta, encontrados);
        continue;
      }
      let contenido: string;
      try {
        contenido = readFileSync(ruta, 'utf-8');
      } catch {
        continue; // binario o ilegible: no puede contener la URL como texto
      }
      if (contenido.includes(SITE_HOST)) encontrados.push(relative(RAIZ, ruta));
    }
    return encontrados;
  }

  it('no hay ningún archivo con la URL fuera de la lista documentada', () => {
    const encontrados = archivosConLaUrl(RAIZ)
      // Este mismo archivo no escribe la URL: la importa. Pero package-lock y
      // demás generados podrían arrastrarla, y no son sitios a editar a mano.
      .filter((f) => f !== 'package-lock.json')
      .sort();
    expect(encontrados).toEqual([...ESPERADOS].sort());
  });
});
