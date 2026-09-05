/**
 * Las URLs que el Service Worker guarda al instalarse, para que el sitio abra
 * sin conexión.
 *
 * Vive acá y no dentro del Service Worker porque así `tests/sw.test.ts` puede
 * importarla y comprobar contra `dist/` que cada una existe de verdad. No es
 * una precaución teórica: el `install` del SW precachea esta lista, y hasta
 * ahora lo hacía con `cache.addAll`, que es atómico — una sola URL rota dejaba
 * el precache entero vacío y la app sin conexión no abría nada. Ahora el SW
 * tolera fallos individuales, pero igual queremos enterarnos si una URL deja
 * de existir.
 */

export const OFFLINE_URL = '/offline';

const LANGS = ['de', 'en', 'fr', 'it', 'pt'] as const;
const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'] as const;

/**
 * ¿Esta petición pide una página HTML?
 *
 * Vive acá, en TypeScript, y `src/pages/sw.js.ts` la inyecta en el Service
 * Worker con `.toString()`. Así el test prueba exactamente el código que se
 * publica, en vez de una copia que puede quedar desincronizada. Por eso no
 * puede referenciar nada de fuera de su propio cuerpo.
 *
 * No alcanza con mirar `request.mode === 'navigate'`. El sitio monta
 * `<ClientRouter />` y tiene `prefetchAll`, así que la mayoría de las páginas
 * NO se piden como navegación del navegador sino como un `fetch()` que hace
 * Astro para intercambiar el DOM. Ese fetch no lleva mode navigate, ni
 * destination document, ni un Accept de HTML — con lo cual caía en la rama de
 * assets, que servía de caché sin revalidar nunca. Efecto para el usuario: las
 * páginas dejaban de cambiar al navegar, congeladas en la copia de la primera
 * visita, y solo se descongelaban si cambiaba el nombre de la caché.
 *
 * Lo que sí es cierto de toda página del sitio es que su ruta no tiene
 * extensión de archivo. Esa es la señal que las atrapa a todas.
 */
export function esDocumentoSW(
  request: {
    mode?: string;
    destination?: string;
    headers: { get(name: string): string | null };
  },
  url: { pathname: string },
): boolean {
  if (request.mode === 'navigate') return true;
  if (request.destination === 'document') return true;
  if ((request.headers.get('accept') || '').includes('text/html')) return true;
  return !/\.[a-z0-9]+$/i.test(url.pathname);
}

/** Cuánto se espera a la red antes de tirar de la copia guardada. */
export const TIMEOUT_RED_MS = 3500;

/**
 * La estrategia con la que se sirve TODA página del sitio: red primero, con la
 * caché como red de seguridad.
 *
 * Igual que `esDocumentoSW`, se inyecta en el Service Worker con `.toString()`
 * para que el test pruebe exactamente esto y no una copia. Por eso recibe
 * `deps` en vez de usar `fetch` y `caches` globales: así el test puede
 * simular una red lenta sin montar un Service Worker de verdad. Y por eso no
 * puede referenciar nada de fuera de su propio cuerpo.
 *
 * El tercer camino es el que faltaba y el que colgaba el sitio. Antes había
 * solo dos —la red responde, o la red falla— y el fallback a caché vivía en un
 * `catch`. Pero una conexión móvil que va y viene no falla: se queda colgada,
 * el `fetch` ni resuelve ni rechaza, y como `event.respondWith()` bloquea la
 * navegación hasta que esa promesa termine, la página se queda cargando para
 * siempre. Nunca llegaba a la caché porque para llegar hacía falta un error
 * que no se producía.
 *
 * Ahora, si la red tarda más de `TIMEOUT_RED_MS` y hay copia guardada, se
 * sirve la copia. El `fetch` NO se aborta: sigue por detrás y refresca la
 * caché, así que la próxima navegación ya trae lo último publicado. Si no hay
 * copia, se sigue esperando — es la primera visita a esa URL y sin red no hay
 * nada que mostrar.
 *
 * Eso conserva lo que esta estrategia vino a garantizar (una página nueva se
 * ve al navegar, sin quedar congelada en la caché) y le quita el único camino
 * que podía dejar la pantalla en blanco indefinidamente.
 */
export async function redPrimeroSW(
  request: unknown,
  deps: {
    fetch: (req: unknown) => Promise<Response>;
    match: (req: unknown, opciones?: { ignoreSearch?: boolean }) => Promise<Response | undefined>;
    guardar: (req: unknown, res: Response) => void;
    sinConexion: () => Response;
    offlineUrl: string;
    timeoutMs: number;
  },
): Promise<Response> {
  const red = deps
    .fetch(request)
    .then((response) => {
      deps.guardar(request, response);
      return response;
    })
    .catch(() => null);

  // `ignoreSearch` es imprescindible: la PWA instalada arranca en
  // `/?utm_source=pwa`, que sin esto NO matchea la portada cacheada como `/`.
  const cacheada = await deps.match(request, { ignoreSearch: true });

  if (cacheada) {
    // Hay copia: se compite contra el reloj. Gana la red si llega a tiempo.
    const reloj = new Promise<null>((resolve) => setTimeout(() => resolve(null), deps.timeoutMs));
    return (await Promise.race([red, reloj])) ?? cacheada;
  }

  // Sin copia no hay carrera posible: o llega la red, o no hay nada que servir.
  const response = await red;
  return response ?? (await deps.match(deps.offlineUrl)) ?? deps.sinConexion();
}

export const PRECACHE_URLS: readonly string[] = [
  '/',
  OFFLINE_URL,
  '/es',
  '/logros',
  // Las herramientas viven dentro del silo desde que se tradujo la interfaz:
  // '/repasar' a secas hoy es solo una redirección 301 a esta URL.
  '/es/repasar',
  ...LANGS.map((l) => `/es/${l}`),
  ...LANGS.flatMap((l) => LEVELS.map((lv) => `/es/${l}/${lv}`)),
];
