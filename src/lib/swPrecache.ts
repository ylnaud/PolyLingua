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
