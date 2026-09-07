import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Este fichero construía el sitio SIEMPRE, y eso rompía a los demás.
//
// Otros nueve ficheros de test leen `dist/` (autoría, portada, links, sw,
// diálogos, dominio, integridad...). Vitest los corre en paralelo, y
// `astro build` vacía `dist/` antes de rellenarlo: mientras esa ventana está
// abierta, los otros leen un directorio que se está borrando y revientan con
// ENOENT. Pasó de verdad, y de forma intermitente, que es lo peor: una pasada
// daba 5 fallos y 106 tests saltados, y la siguiente, sin tocar nada, verde.
//
// En CI es igual de posible: el workflow hace `npm run build` y después
// `npm run test`, así que `dist/` siempre existe cuando arranca la suite y la
// carrera es exactamente esa.
//
// La regla, que es la que ya usaban los otros nueve: construir solo si no hay
// build. Si `dist/` ya está, el build ya salió bien —no hay otra forma de que
// exista— y estos tests comprueban su resultado, que es lo que importa.
//
// Quien garantiza de verdad que esté es `tests/global-setup.ts`, que construye
// una sola vez antes de que arranque el paralelismo; el `existsSync` de acá
// abajo ya solo sirve para correr este fichero suelto.
const ROOT = join(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');

function countHtmlFiles(dir: string): number {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countHtmlFiles(full);
    } else if (entry.name.endsWith('.html')) {
      count++;
    }
  }
  return count;
}

describe('astro build', () => {
  beforeAll(() => {
    if (existsSync(join(DIST, 'index.html'))) return;
    const result = execSync('npx astro build', {
      cwd: ROOT,
      encoding: 'utf-8',
      timeout: 300_000,
    });
    expect(result).toContain('Complete!');
  }, 300_000);

  it('builds successfully', () => {
    expect(existsSync(join(DIST, 'index.html'))).toBe(true);
  });

  it('generates at least 500 HTML pages', () => {
    expect(countHtmlFiles(DIST)).toBeGreaterThanOrEqual(500);
  });

  it('dist directory contains sitemap', () => {
    expect(readdirSync(DIST)).toContain('sitemap-index.xml');
  });
});
