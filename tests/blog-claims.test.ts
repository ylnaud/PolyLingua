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

  it('el plural alemán no se presenta como regla sin excepción', () => {
    // Decía «en plural el artículo siempre es die, sin ninguna excepción», y lo
    // titulaba «la única regla sin excepción de todo el idioma». El dativo
    // plural es den (den Kindern) y el genitivo der.
    const texto = readFileSync(join(DIR, 'der-die-das-trucos.md'), 'utf8');
    expect(texto).not.toMatch(/siempre es "die"\*\*, sin ninguna excepci.n/);
    expect(texto).toMatch(/\*\*den\*\* Kindern/);
  });
});
