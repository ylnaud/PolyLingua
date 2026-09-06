---
name: polylingua-deploy
description: Despliegue de PolyLingua en Cloudflare Workers (solo assets, sin código), el Service Worker que se genera como endpoint de Astro, la CSP viva en public/_headers, y las restricciones que hay que respetar para no romper producción. Úsala antes de tocar wrangler.jsonc, el Service Worker, las cabeceras o cualquier cosa que afecte al build publicado.
when_to_use: 'Antes de modificar wrangler.jsonc, src/pages/sw.js.ts, src/lib/swPrecache.ts, public/_headers, astro.config.mjs, o de proponer cambios de hosting, dominio o caché.'
---

# Despliegue de PolyLingua

**Producción vive en Cloudflare Workers**, sirviendo `dist/` como assets estáticos.
Push a `main` construye y publica automáticamente. **No migres a Vercel, Netlify ni
otro proveedor**: Vercel fue el hosting anterior y ya se retiró (`vercel.json` está
borrado); la config de seguridad activa es `public/_headers`, en formato Cloudflare.

## `wrangler.jsonc` tiene exactamente cuatro cosas

```jsonc
{
  "name": "polylingua",
  "compatibility_date": "...",
  "assets": {
    "directory": "./dist",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page",
  },
}
```

**No hay `main`.** Eso significa que Cloudflare sirve los archivos y **no ejecuta
código**: no hay Worker, no hay runtime, no hay variables de entorno en request. Astro
sigue en SSG puro, sin adapter de servidor.

Servir assets sin Worker no consume cuota de invocaciones; poner un `main` sí. Si
alguna vez hace falta (por ejemplo para redirigir un dominio viejo), léete primero
`docs/MIGRACION-DOMINIO.md`, que explica los dos campos obligatorios y el precio.

Cualquier comando de build sirve — `npm run build` o `astro build` dan lo mismo.

## El Service Worker: dos reglas que ya se rompieron

Se genera como **endpoint de Astro** (`src/pages/sw.js.ts`) a partir de
`src/lib/swPrecache.ts`. Antes vivía en `public/sw.js` con un hook `postbuild` que le
versionaba el `CACHE_NAME`; un build con `astro build` a secas publicaba un SW idéntico
byte a byte, el navegador nunca detectaba la versión nueva y los usuarios se quedaban
con la caché vieja.

### 1. Las páginas se sirven de la red primero, y se clasifican por RUTA

No es una preferencia. `BaseLayout` monta `<ClientRouter />` y `astro.config.mjs` tiene
`prefetchAll`, así que **un clic en un enlace no es una navegación del navegador** sino
un `fetch()` que hace Astro para intercambiar el DOM. Ese fetch no lleva
`mode: 'navigate'`, ni `destination: 'document'`, ni un `Accept` de HTML.

Si el SW decide la estrategia mirando `request.mode`, todas las páginas caen en la rama
de assets —caché primero, sin revalidar— y **dejan de cambiar al navegar**, congeladas
en la copia de la primera visita. Pasó de verdad.

Por eso `esDocumentoSW()` clasifica por la ruta: **sin extensión de archivo = página =
red primero**. Si tocas el SW, no vuelvas a decidir por `request.mode`.

### 2. La red primero necesita un reloj

`redPrimeroSW()` no hace un `await fetch()` pelado. Una conexión móvil que va y viene
deja el fetch colgado —ni resuelve ni rechaza—, nunca se llega al `catch`, y como
`event.respondWith()` bloquea la navegación hasta que la promesa termine, **la página
se queda cargando indefinidamente**. Ni siquiera cae a la copia guardada, porque para
caer haría falta un fallo que no se produce.

Hay tres caminos, y los tres importan: red a tiempo (3,5 s) → se sirve y se guarda; red
lenta **con** copia → se sirve la copia al vencer el reloj mientras el fetch sigue por
detrás refrescando la caché; red lenta **sin** copia → se espera, porque no hay
alternativa.

### 3. El precache va con `Promise.allSettled`, no con `cache.addAll`

`addAll` es atómico: una sola URL rota dejaba el precache entero vacío y la app sin
conexión no abría nada.

Las funciones del SW viven en `src/lib/swPrecache.ts` y se inyectan con `.toString()`
para que `tests/sw.test.ts` pruebe **exactamente el código que se publica**, no una
copia. Mantén ese patrón.

Un detalle práctico al verificar: el arreglo del cuelgue solo se nota **a partir de la
segunda visita**, porque la primera instala el SW nuevo.

## `public/_headers` es la CSP viva

Cloudflare la lee directo del build output. Es restrictiva a propósito:
`default-src 'self'`, sin dominios externos, `frame-ancestors 'none'`, HSTS con
preload.

Consecuencia práctica: **no puedes cargar nada de un CDN**. Ni fuentes de Google, ni
scripts de terceros, ni imágenes remotas. Las fuentes están en `public/fonts/`. Si algo
necesita una petición externa, no funcionará en producción aunque funcione en local — y
fallará en silencio.

## La URL del sitio tiene una sola fuente

`src/data/site.ts`. De ahí salen el `site:` de `astro.config.mjs` —y con él canonical,
Open Graph y sitemap—, el host que muestra `/privacidad` y el que compara el Worker de
redirección. Hay ficheros estáticos que no pueden importarla (`robots.txt`, `llms.txt`,
`og-image.svg`, `global.css`): `tests/dominio.test.ts` recorre el repo y falla si la URL
aparece en un archivo no documentado.

**El dominio propio está pendiente**, y la mudanza está preparada y documentada paso a
paso en `docs/MIGRACION-DOMINIO.md`. Léelo antes de tocar nada, sobre todo por el orden
de los pasos. Un aviso que ya costó investigar: **`_redirects` NO sirve para redirigir
un dominio.** Cloudflare no soporta redirecciones por dominio, y una regla `/*` haría
que el dominio nuevo se redirigiese a sí mismo en bucle. La redirección va en
`worker/redirect.ts`, hoy inerte porque `wrangler.jsonc` no lo referencia.

## Verificación antes de dar por bueno un cambio de despliegue

Los tres comandos que existen en `package.json` — no hay `npm run lint`:

```bash
npm run check   # lee la línea "- N errors"; el output acaba en ~125 hints
npm test        # línea base 451 tests en 17 archivos
npm run build   # línea base 1042 páginas
```

Si el cambio afecta al SW o a las cabeceras, no basta con los tests: levanta el build
con `astro preview` y ábrelo en un navegador real **dos veces** (la primera instala el
SW). La skill `run-polylingua` tiene el flujo y el driver de Playwright ya montados.
