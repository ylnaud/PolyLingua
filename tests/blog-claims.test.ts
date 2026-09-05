import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// El blog llegó a tener unas veinte cifras inventadas: «98 %» de certeza para
// una terminación alemana, «casi el 80 % del vocabulario» compartido con el
// italiano, «el 80 % de lo que necesitás» para el Goethe. Ninguna tenía fuente
// y ninguna era comprobable, porque no salían de ningún lado.
//
// La regla que se aplicó al corregirlas: cada número, o se cita o se va. Este
// test la sostiene por el lado más fácil de automatizar, que son los
// porcentajes.
const DIR = join(process.cwd(), 'src/content/blog');
const posts = readdirSync(DIR).filter((f) => f.endsWith('.md'));

describe('afirmaciones del blog', () => {
  it('no hay porcentajes sin fuente', () => {
    // «100 %» se deja pasar: en estos posts nunca es una estadística sino un
    // intensificador —«100 % gratis», «casi 100 % presente»—, y prohibirlo
    // solo obligaría a rodeos. Cualquier otro porcentaje sí afirma un dato
    // medido, y un dato medido necesita de dónde salió.
    const encontrados: string[] = [];
    for (const f of posts) {
      const texto = readFileSync(join(DIR, f), 'utf8');
      texto.split('\n').forEach((linea, i) => {
        for (const m of linea.matchAll(/(\d+(?:[.,]\d+)?)\s*%/g)) {
          if (m[1] === '100') continue;
          encontrados.push(`${f}:${i + 1}  ${linea.trim()}`);
        }
      });
    }
    expect(
      encontrados,
      `porcentajes sin fuente (citalos con un enlace o reformulá sin número):\n${encontrados.join('\n')}`,
    ).toEqual([]);
  });

  it('el post del Goethe A1 no vuelve a describirlo como examen modular', () => {
    // El error más caro que tuvo el blog: decía que el A1 se divide en dos
    // módulos independientes con 60 puntos mínimos en cada uno, y que se puede
    // repetir solo el que falló. Eso es el formato del B1 en adelante. El A1
    // (Start Deutsch 1) es un examen único: 60 sobre 100 EN TOTAL, sin mínimo
    // por sección, y si no se aprueba se repite entero.
    //
    // Alguien podía planificar y pagar mal por esa frase, así que queda fijada.
    //
    // Los patrones evitan las vocales acentuadas a propósito: el archivo está
    // en NFC y un literal escrito en NFD no casa aunque en pantalla se vea
    // idéntico. Un `.` en el hueco ahorra ese dolor de cabeza.
    const texto = readFileSync(join(DIR, 'como-preparar-goethe-a1.md'), 'utf8');
    expect(texto).toMatch(/\*\*examen .nico\*\*, no modular/);
    expect(texto).not.toMatch(/m.dulos\s+son independientes/);
    expect(texto).not.toMatch(/en cada m.dulo/);
  });

  it('los cuatro artículos de falsos amigos no comparten estructura', () => {
    // Eran una plantilla rellenada cuatro veces: cinco H2 palabra por palabra,
    // los mismos cuatro «trucos» en el mismo orden, y una tabla de «verdaderos
    // amigos» con 8 de 10 lemas idénticos entre francés, italiano y portugués.
    // Cuatro artículos con la misma forma compiten entre sí en el buscador y no
    // le dan al lector una razón para leer más de uno.
    //
    // Ahora cada uno se organiza sobre lo que es propio de ese par: el rodeo por
    // el inglés en alemán, los falsos amigos a medias en francés, la ausencia de
    // duda en italiano, y comprensión contra producción en portugués. Lo único
    // que pueden compartir es el andamio (FAQ, cierre, cómo trabajarlo).
    const ANDAMIO = new Set(['Preguntas frecuentes', 'Cómo trabajarlo', 'En resumen']);
    const idiomas = ['aleman', 'frances', 'italiano', 'portugues'];

    const porIdioma = idiomas.map((l) => {
      const texto = readFileSync(join(DIR, `falsos-amigos-${l}-espanol.md`), 'utf8');
      const h2 = [...texto.matchAll(/^## (.+)$/gm)].map((m) => m[1]!.trim());
      return { l, propios: h2.filter((h) => !ANDAMIO.has(h)) };
    });

    const repetidos = new Map<string, string[]>();
    for (const { l, propios } of porIdioma) {
      for (const h of new Set(propios)) repetidos.set(h, [...(repetidos.get(h) ?? []), l]);
    }
    const compartidos = [...repetidos].filter(([, ls]) => ls.length > 1);
    expect(
      compartidos.map(([h, ls]) => `${ls.join('/')}: ${h}`),
      'estos H2 se repiten entre artículos; cada uno debería nombrar lo que es propio de su idioma',
    ).toEqual([]);

    // Y que ninguno vuelva a traer la tabla genérica de cognados latinos.
    for (const l of idiomas) {
      const texto = readFileSync(join(DIR, `falsos-amigos-${l}-espanol.md`), 'utf8');
      expect(texto, `${l} recuperó la tabla de «verdaderos amigos»`).not.toContain(
        'verdaderos amigos',
      );
    }
  });

  it('el plural alemán no se presenta como regla sin excepción', () => {
    // Decía «en plural el artículo siempre es die, sin ninguna excepción», y lo
    // titulaba «la única regla sin excepción de todo el idioma». El dativo
    // plural es den (den Kindern) y el genitivo der.
    const texto = readFileSync(join(DIR, 'der-die-das-trucos.md'), 'utf8');
    expect(texto).not.toMatch(/siempre es "die"\*\*, sin ninguna excepci.n/);
    expect(texto).toMatch(/\*\*den\*\* Kindern/);
  });
});
