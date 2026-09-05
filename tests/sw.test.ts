import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  esDocumentoSW,
  OFFLINE_URL,
  PRECACHE_URLS,
  redPrimeroSW,
  TIMEOUT_RED_MS,
} from '../src/lib/swPrecache';

const ROOT = join(import.meta.dirname, '..');
const SW_PATH = join(ROOT, 'dist', 'sw.js');

/** Simula lo justo de un Request para probar la clasificación. */
function pedido(opciones: {
  mode?: string;
  destination?: string;
  accept?: string;
}): Parameters<typeof esDocumentoSW>[0] {
  return {
    mode: opciones.mode,
    destination: opciones.destination,
    headers: { get: () => opciones.accept ?? null },
  };
}

const esDocumento = (ruta: string, opciones: Parameters<typeof pedido>[0] = {}) =>
  esDocumentoSW(pedido(opciones), { pathname: ruta });

describe('estrategia de páginas: red primero, sin colgarse', () => {
  // El bug que esto fija: `redPrimero` hacía `await fetch(request)` sin
  // timeout, y el fallback a caché vivía en un `catch`. Una conexión móvil que
  // va y viene no falla — se queda colgada, el fetch ni resuelve ni rechaza —,
  // así que nunca se llegaba al catch y, como `respondWith` bloquea la
  // navegación, la página se quedaba cargando indefinidamente.
  const respuesta = (cuerpo: string) => new Response(cuerpo, { status: 200 });

  /** Arma las dependencias con una red y una caché a medida. */
  function deps(opciones: {
    red: () => Promise<Response>;
    enCache?: Record<string, string>;
    timeoutMs?: number;
  }) {
    const guardadas: string[] = [];
    return {
      guardadas,
      deps: {
        fetch: () => opciones.red(),
        match: async (req: unknown) => {
          const clave = String(req);
          const cuerpo = opciones.enCache?.[clave];
          return cuerpo === undefined ? undefined : respuesta(cuerpo);
        },
        guardar: (req: unknown) => guardadas.push(String(req)),
        sinConexion: () => new Response('sin conexión', { status: 503 }),
        offlineUrl: OFFLINE_URL,
        timeoutMs: opciones.timeoutMs ?? TIMEOUT_RED_MS,
      },
    };
  }

  it('sirve de la red cuando la red responde', async () => {
    const { deps: d, guardadas } = deps({ red: async () => respuesta('de la red') });
    const res = await redPrimeroSW('/es/de/a1', d);
    expect(await res.text()).toBe('de la red');
    // Y la guarda para la próxima.
    expect(guardadas).toEqual(['/es/de/a1']);
  });

  it('cae a la caché cuando la red NO responde ni falla', async () => {
    // El caso que colgaba el sitio: una promesa que no se resuelve nunca.
    // Sin timeout este test se quedaría esperando hasta que vitest lo mate,
    // que es exactamente lo que le pasaba al navegador.
    const { deps: d } = deps({
      red: () => new Promise<Response>(() => {}),
      enCache: { '/es/de/a1': 'de la caché' },
      timeoutMs: 50,
    });
    const antes = Date.now();
    const res = await redPrimeroSW('/es/de/a1', d);
    expect(await res.text()).toBe('de la caché');
    expect(Date.now() - antes).toBeLessThan(1000);
  });

  it('la red gana si llega antes del timeout, aunque haya caché', async () => {
    const { deps: d } = deps({
      red: async () => respuesta('de la red'),
      enCache: { '/es/de/a1': 'de la caché' },
      timeoutMs: 500,
    });
    expect(await (await redPrimeroSW('/es/de/a1', d)).text()).toBe('de la red');
  });

  it('cae a la caché cuando la red falla de verdad', async () => {
    const { deps: d } = deps({
      red: async () => {
        throw new Error('sin red');
      },
      enCache: { '/es/de/a1': 'de la caché' },
    });
    expect(await (await redPrimeroSW('/es/de/a1', d)).text()).toBe('de la caché');
  });

  it('sin red y sin caché de la página, sirve la página offline', async () => {
    const { deps: d } = deps({
      red: async () => {
        throw new Error('sin red');
      },
      enCache: { [OFFLINE_URL]: 'página offline' },
    });
    expect(await (await redPrimeroSW('/es/de/a1', d)).text()).toBe('página offline');
  });

  it('sin red, sin caché y sin página offline, responde algo legible', async () => {
    // Nunca resolver a undefined: respondWith(undefined) le da al navegador un
    // error de red crudo en vez de una pantalla que se pueda leer.
    const { deps: d } = deps({
      red: async () => {
        throw new Error('sin red');
      },
    });
    const res = await redPrimeroSW('/es/de/a1', d);
    expect(res.status).toBe(503);
    expect(await res.text()).toContain('sin conexión');
  });
});

describe('clasificación de peticiones del Service Worker', () => {
  // El bug que rompió la app: <ClientRouter /> pide las páginas con un fetch()
  // que NO lleva mode navigate, así que caía en la rama de assets —caché
  // primero, sin revalidar— y las páginas dejaban de cambiar al navegar.
  it('trata como documento el fetch de ClientRouter, que no declara nada', () => {
    expect(esDocumento('/es/de/a1')).toBe(true);
    expect(esDocumento('/es/de/a1/articulos-der-die-das')).toBe(true);
    expect(esDocumento('/blog/der-die-das-trucos')).toBe(true);
    expect(esDocumento('/')).toBe(true);
  });

  it('trata como documento la navegación normal del navegador', () => {
    expect(esDocumento('/es/de/a1', { mode: 'navigate' })).toBe(true);
    expect(esDocumento('/es', { destination: 'document' })).toBe(true);
    expect(esDocumento('/es', { accept: 'text/html,*/*' })).toBe(true);
  });

  it('NO trata como documento los assets, que sí pueden ir de caché', () => {
    expect(esDocumento('/_astro/page.BCFaNAQy.js')).toBe(false);
    expect(esDocumento('/_astro/estilos.abc123.css')).toBe(false);
    expect(esDocumento('/icon-192.png')).toBe(false);
    expect(esDocumento('/manifest.webmanifest')).toBe(false);
    expect(esDocumento('/favicon.svg')).toBe(false);
    expect(esDocumento('/sw.js')).toBe(false);
  });
});

describe('sw.js generado en el build', () => {
  beforeAll(() => {
    if (existsSync(SW_PATH)) return;
    execSync('npx astro build', { cwd: ROOT, encoding: 'utf-8', timeout: 300_000 });
  }, 300_000);

  it('lo genera Astro, sea cual sea el comando de build', () => {
    expect(existsSync(SW_PATH)).toBe(true);
  });

  // Si el nombre de caché no cambia entre deploys, el navegador nunca detecta
  // una versión nueva del Service Worker y sirve la caché vieja para siempre.
  it('lleva un CACHE_NAME versionado, no un literal fijo', () => {
    const sw = readFileSync(SW_PATH, 'utf-8');
    expect(sw).toMatch(/const CACHE_NAME = ["']polylingua-\d{14}["'];/);
  });

  it('sirve los documentos de la red primero', () => {
    const sw = readFileSync(SW_PATH, 'utf-8');
    expect(sw).toMatch(
      /if \(esDocumento\(event\.request, url\)\) \{\s*event\.respondWith\(redPrimero/,
    );
  });

  // addAll es atómico: una sola URL rota dejaba el precache entero vacío.
  it('precachea tolerando fallos individuales', () => {
    const sw = readFileSync(SW_PATH, 'utf-8');
    expect(sw).toContain('Promise.allSettled');
    // La llamada, no la palabra: el comentario del propio SW la menciona.
    expect(sw).not.toMatch(/\.addAll\s*\(/);
  });
});

describe('las URLs precacheadas existen de verdad', () => {
  beforeAll(() => {
    if (existsSync(SW_PATH)) return;
    execSync('npx astro build', { cwd: ROOT, encoding: 'utf-8', timeout: 300_000 });
  }, 300_000);

  // Esto es lo que no comprobaba nadie. Una URL de esta lista que deje de
  // existir —un renombrado de ruta, una herramienta que se mueve— rompía la
  // app sin conexión en silencio.
  it.each([...PRECACHE_URLS])('%s existe en el build', (ruta) => {
    const archivo = join(ROOT, 'dist', ruta === '/' ? '' : ruta, 'index.html');
    expect(existsSync(archivo)).toBe(true);
  });

  it('la página de sin-conexión está entre ellas', () => {
    expect(PRECACHE_URLS).toContain(OFFLINE_URL);
  });
});
