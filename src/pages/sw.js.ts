/**
 * El Service Worker, generado por Astro en cada build.
 *
 * Antes vivía en `public/sw.js` y un script aparte (`scripts/stamp-sw.mjs`,
 * enganchado al hook `postbuild` de npm) le reescribía el CACHE_NAME con un
 * timestamp. Ese diseño tenía una trampa: solo funcionaba si el build era
 * `npm run build`. Con `astro build` a secas —que es lo que puede estar
 * corriendo el CI o el hosting— el archivo salía byte por byte idéntico al del
 * deploy anterior, el navegador nunca detectaba una versión nueva del Service
 * Worker, y los usuarios se quedaban con la caché vieja para siempre.
 *
 * Generándolo como endpoint el problema desaparece: sea cual sea el comando,
 * es Astro quien lo produce, y el CACHE_NAME sale de este archivo.
 */
import type { APIRoute } from 'astro';
import { esDocumentoSW, OFFLINE_URL, PRECACHE_URLS } from '../lib/swPrecache';

const BUILD_ID = new Date()
  .toISOString()
  .replace(/[-:TZ.]/g, '')
  .slice(0, 14);

const source = `// Generado por src/pages/sw.js.ts — no editar a mano.
const CACHE_NAME = ${JSON.stringify(`polylingua-${BUILD_ID}`)};
const OFFLINE_URL = ${JSON.stringify(OFFLINE_URL)};
const PRECACHE_URLS = ${JSON.stringify(PRECACHE_URLS)};

self.addEventListener('install', (event) => {
  // Toma el control sin esperar a que nadie confirme nada. Es lo que permite
  // que un arreglo del propio Service Worker llegue a quien ya tiene una
  // versión rota instalada.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Uno por uno y no con addAll: addAll es atómico, así que una sola URL
      // caída dejaba el precache entero vacío y la app sin conexión no abría.
      const resultados = await Promise.allSettled(PRECACHE_URLS.map((u) => cache.add(u)));
      const fallidas = PRECACHE_URLS.filter((_, i) => resultados[i].status === 'rejected');
      if (fallidas.length > 0) console.warn('[SW] No se pudieron precachear:', fallidas);
    }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

// Inyectada desde src/lib/swPrecache.ts para que el test pruebe exactamente
// esta función y no una copia. Es la que decide qué se sirve de la red.
const esDocumento = ${esDocumentoSW.toString()};

function guardar(request, response) {
  if (!response || !response.ok || response.redirected) return;
  const clone = response.clone();
  caches
    .open(CACHE_NAME)
    .then((cache) => cache.put(request, clone))
    .catch(() => {});
}

const sinConexion = () =>
  new Response(
    '<!doctype html><meta charset="utf-8"><title>Sin conexión</title>' +
      '<p style="font-family:system-ui;padding:2rem">Sin conexión. Volvé a intentar cuando tengas internet.</p>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );

/** Páginas: siempre lo último publicado; la caché es solo la red de seguridad. */
async function redPrimero(request) {
  try {
    const response = await fetch(request);
    guardar(request, response);
    return response;
  } catch {
    // \`ignoreSearch\` es imprescindible acá: la PWA instalada arranca en
    // \`/?utm_source=pwa\`, que sin esto NO matchea la portada cacheada como
    // \`/\` y hace fallar el fallback entero.
    const cached =
      (await caches.match(request, { ignoreSearch: true })) || (await caches.match(OFFLINE_URL));
    // Nunca resolver a undefined: respondWith(undefined) le da al navegador un
    // error de red crudo en vez de una pantalla legible.
    return cached || sinConexion();
  }
}

/** Assets con hash en el nombre: el contenido no cambia sin cambiar la URL. */
async function cachePrimero(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  guardar(request, response);
  return response;
}

/** El resto: responde ya de caché y refresca por detrás para la próxima vez. */
async function revalidando(request) {
  const cached = await caches.match(request);
  const red = fetch(request)
    .then((response) => {
      guardar(request, response);
      return response;
    })
    .catch(() => null);
  if (cached) return cached;
  return (await red) || sinConexion();
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (esDocumento(event.request, url)) {
    event.respondWith(redPrimero(event.request));
    return;
  }
  if (url.pathname.startsWith('/_astro/')) {
    event.respondWith(cachePrimero(event.request));
    return;
  }
  event.respondWith(revalidando(event.request));
});
`;

export const GET: APIRoute = () =>
  new Response(source, {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/',
    },
  });
