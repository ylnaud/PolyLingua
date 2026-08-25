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

const distSwPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'dist',
  'sw.js',
);

const buildId = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const original = readFileSync(distSwPath, 'utf8');
const stamped = original.replace(
  /const CACHE_NAME = '[^']*';/,
  `const CACHE_NAME = 'polylingua-${buildId}';`,
);

if (stamped === original) {
  throw new Error(
    `stamp-sw.mjs: no se encontró la línea "const CACHE_NAME = '...';" en ${distSwPath} — revisar public/sw.js.`,
  );
}

writeFileSync(distSwPath, stamped);
console.log(`[stamp-sw] CACHE_NAME -> polylingua-${buildId}`);
