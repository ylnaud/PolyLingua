import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const hayBuild = existsSync(DIST);

/** Todos los index.html del build, recursivamente. */
function paginas(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) paginas(full, acc);
    else if (e.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

describe.skipIf(!hayBuild)('portada y lecciones', () => {
  it('no se cuela «lecciónes» en ninguna página', () => {
    // El plural de «lección» es «lecciones», sin tilde. LanguageCard lo armaba
    // como `lección` + `es`, así que la portada decía «91 lecciónes» cinco
    // veces, una por idioma. Es la clase de error que la guía de contenido útil
    // pregunta directamente: si tiene fallos que se comprueban de un vistazo.
    const malas = paginas(DIST).filter((p) => readFileSync(p, 'utf8').includes('lecciónes'));
    expect(malas.map((p) => p.replace(DIST, ''))).toEqual([]);
  });

  it('los contadores de la portada traen el número real en el HTML', () => {
    // Solo estaban en `data-count-to` y el texto era un 0 literal, así que sin
    // JS la portada afirmaba tener cero lecciones. La animación sigue estando;
    // lo que cambió es de dónde parte el HTML.
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    const stats = [...html.matchAll(/data-count-to="(\d+)"[^>]*>(\d+)</g)];
    expect(stats.length, 'no se encontraron los contadores del hero').toBe(3);
    for (const [, esperado, pintado] of stats) {
      expect(pintado, `el contador de ${esperado} se pinta como ${pintado}`).toBe(esperado);
    }
    expect(html).not.toMatch(/data-count-to="\d+"[^>]*>0</);
  });

  it('ninguna lección monta un hueco de anuncio vacío', () => {
    // Eran dos por lección en 484 lecciones: 968 rectángulos grises de 280px
    // etiquetados PUBLICIDAD, sin nada dentro, partiendo el flujo entre la
    // teoría y los ejercicios. El componente AdSlot sigue en el repo para
    // cuando haya un pub-id real; lo que no puede volver es montarlo vacío.
    const conHueco = paginas(DIST).filter((p) => readFileSync(p, 'utf8').includes('ad-slot-label'));
    expect(conHueco.length, `${conHueco.length} páginas con hueco de anuncio vacío`).toBe(0);
  });

  it('no se publica un ads.txt con un ID de ejemplo', () => {
    const ads = join(DIST, 'ads.txt');
    if (!existsSync(ads)) return; // lo normal hoy: no existe
    expect(readFileSync(ads, 'utf8')).not.toContain('pub-0000000000000000');
  });
});
