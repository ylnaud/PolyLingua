import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');

/**
 * Construye el sitio UNA vez, antes de que arranque ningún fichero de test.
 *
 * Diez ficheros de la suite leen `dist/`, y hasta ahora cada uno se las
 * arreglaba solo con un `if (existsSync(dist)) return; execSync('astro
 * build')` en su `beforeAll`. Ese patrón tiene dos agujeros, y los dos se
 * reprodujeron:
 *
 * 1. Con `dist/` ya construido, `tests/build.test.ts` lo reconstruía igual, y
 *    `astro build` vacía el directorio antes de rellenarlo. Los otros nueve
 *    ficheros, que vitest corre en paralelo, leían mientras tanto y petaban
 *    con ENOENT. Una pasada daba 5 fallos y 106 tests saltados; la siguiente,
 *    sin tocar nada, verde.
 * 2. Sin `dist/`, el agujero es el contrario: los diez ven que no hay build y
 *    lanzan `astro build` A LA VEZ, todos sobre el mismo directorio,
 *    pisándose entre ellos.
 *
 * El `existsSync` de cada fichero no puede arreglar esto porque la carrera
 * está justamente entre el `existsSync` y el build. La única forma de que
 * `dist/` esté quieto mientras se lee es construirlo antes de que empiece el
 * paralelismo, que es lo que hace este fichero: vitest ejecuta `globalSetup`
 * una sola vez, en el proceso principal, antes de cargar ningún test.
 *
 * Los `beforeAll` de los ficheros individuales se dejan como están: con esto
 * en su sitio, su `existsSync` siempre acierta y salen sin hacer nada. Siguen
 * sirviendo para correr un fichero suelto sin pasar por la config.
 */
export default function setup() {
  if (existsSync(join(DIST, 'index.html'))) return;
  execSync('npx astro build', { cwd: ROOT, stdio: 'inherit', timeout: 300_000 });
}
