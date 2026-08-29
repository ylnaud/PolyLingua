const CACHE_NAME = 'polylingua-v3';
const OFFLINE_URL = '/offline';

const LANGS = ['de', 'en', 'fr', 'it', 'pt'];
const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/es',
  '/logros',
  '/repasar',
  ...LANGS.map((l) => `/es/${l}`),
  ...LANGS.flatMap((l) => LEVELS.map((lv) => `/es/${l}/${lv}`)),
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Pre-cache parcial:', err);
        return cache.add('/');
      }),
    ),
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

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          // `ignoreSearch` es imprescindible acá: la PWA instalada arranca en
          // `/?utm_source=pwa`, que sin esto NO matchea la portada cacheada
          // como `/` y hace fallar el fallback entero.
          const cached =
            (await caches.match(event.request, { ignoreSearch: true })) ??
            (await caches.match(OFFLINE_URL));
          if (cached) return cached;
          // Nunca resolver a undefined: `respondWith(undefined)` le da al
          // navegador un error de red crudo (ERR_FAILED, "no se puede acceder
          // a este sitio") en vez de una pantalla de sin-conexión legible.
          return new Response(
            '<!doctype html><meta charset="utf-8"><title>Sin conexión</title>' +
              '<p style="font-family:system-ui;padding:2rem">Sin conexión. Volvé a intentar cuando tengas internet.</p>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
          );
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }),
  );
});
