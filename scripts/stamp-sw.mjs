// Corre después de `astro build` (via npm's hook `postbuild`). Astro copia
// public/sw.js a dist/sw.js tal cual, sin procesarlo — así que si el
// contenido de sw.js no cambia entre deploys, el navegador nunca detecta una
// versión nueva del Service Worker (la detección de updates es un diff de
// bytes del archivo) y sigue sirviendo la caché vieja para siempre, sin
// importar cuánto haya cambiado el resto del sitio. Este script reescribe
// CACHE_NAME en dist/sw.js con un timestamp de build, para que cada deploy
// produzca un sw.js distinto y dispare el flujo de actualización que ya
// existe (el toast "Nueva versión disponible" en BaseLayout.astro).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Dos ubicaciones posibles: `dist/sw.js` es la de este proyecto (SSG puro,
// sin adapter). `dist/client/sw.js` es donde Astro deja los assets estáticos
// si alguna vez hay un adapter activo — pasó de verdad el 27/08/2026, cuando
// `wrangler deploy` sin `wrangler.jsonc` disparó su asistente de setup, corrió
// `astro add cloudflare` a nuestras espaldas y re-buildeó con el adapter
// puesto. Buscar en ambas evita repetir ese fallo.
const CANDIDATE_SW_PATHS = [
  path.join(repoRoot, 'dist', 'sw.js'),
  path.join(repoRoot, 'dist', 'client', 'sw.js'),
];

// En algunos entornos de build (confirmado en Cloudflare) dist/sw.js puede no
// estar disponible todavía en el instante exacto en que arranca postbuild,
// aunque astro build ya haya terminado con éxito — reintenta unas pocas veces
// antes de darse por vencido, en vez de asumir que el primer intento siempre
// alcanza.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function findAndReadSw(attempts = 10, delayMs = 300) {
  for (let i = 0; i < attempts; i++) {
    for (const candidate of CANDIDATE_SW_PATHS) {
      try {
        return { swPath: candidate, contents: readFileSync(candidate, 'utf8') };
      } catch (err) {
        // Cualquier error que no sea "todavía no existe" es real y sí debe
        // cortar (permisos, disco, etc.) — no lo enmascaramos.
        if (err.code !== 'ENOENT') throw err;
      }
    }
    if (i < attempts - 1) await sleep(delayMs);
  }
  return null;
}

// Este paso es de cache-busting: importante, pero cosmético. Si falla, lo peor
// que pasa es que los usuarios reciben la actualización del Service Worker un
// deploy más tarde. Abortar el build acá sería muchísimo peor: `npm run build`
// saldría con código 1 y Cloudflare cancelaría el deploy entero, dejando el
// sitio sin actualizar — que es exactamente lo que pasó el 27/08/2026. Por eso
// de acá en adelante avisamos fuerte pero salimos con código 0.
function bail(message) {
  console.warn(`[stamp-sw] AVISO: ${message}`);
  console.warn('[stamp-sw] El Service Worker NO se versionó en este build.');
  console.warn(
    '[stamp-sw] El deploy sigue adelante a propósito: los usuarios van a recibir la actualización del SW en el próximo build exitoso.',
  );
  process.exit(0);
}

const buildId = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const found = await findAndReadSw();

if (!found) {
  bail(`no se encontró sw.js en ninguna de estas rutas: ${CANDIDATE_SW_PATHS.join(', ')}`);
}

const stamped = found.contents.replace(
  /const CACHE_NAME = '[^']*';/,
  `const CACHE_NAME = 'polylingua-${buildId}';`,
);

if (stamped === found.contents) {
  bail(`no se encontró la línea "const CACHE_NAME = '...';" en ${found.swPath} — revisar public/sw.js.`);
}

writeFileSync(found.swPath, stamped);
console.log(`[stamp-sw] CACHE_NAME -> polylingua-${buildId}`);
