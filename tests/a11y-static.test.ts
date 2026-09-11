import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * U-13 del Gauntlet: candados estáticos de accesibilidad sobre `dist/`.
 *
 * Las páginas de redirección 301 a rutas nuevas —tanto las del namespace
 * `src/pages/idiomas/[lang]/...` como las de nivel superior sin userLang
 * (`src/pages/ahorcado.astro`, `diario.astro`, `dialogos.astro`, etc.)— son
 * meta-refresh sin `<html>` ni contenido real, `noindex`, pensadas para bots
 * y para quien llega por un enlace viejo, no para leerse. El filtro que
 * las excluye es por CONTENIDO (`http-equiv="refresh"`), no por ruta, así
 * que cubre las dos familias sin necesidad de enumerar carpetas. Exigirles
 * un `<h1>` sería un criterio más estricto del que su propio diseño cumple.
 */
const DIST = join(import.meta.dirname, '..', 'dist');

function allIndexFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) allIndexFiles(full, out);
    else if (entry.isFile() && entry.name === 'index.html') out.push(full);
  }
  return out;
}

function esRedireccion(html: string): boolean {
  return html.includes('http-equiv="refresh"');
}

describe('U-13 — accesibilidad estática', () => {
  it('cada página de contenido real tiene exactamente un <h1>', () => {
    const sinH1: string[] = [];
    const conVarios: string[] = [];
    let totalReales = 0;
    for (const file of allIndexFiles(DIST)) {
      const html = readFileSync(file, 'utf-8');
      if (esRedireccion(html)) continue;
      totalReales += 1;
      const count = (html.match(/<h1[ >]/g) ?? []).length;
      if (count === 0) sinH1.push(file.replace(DIST, ''));
      if (count > 1) conVarios.push(`${file.replace(DIST, '')} (${count})`);
    }
    // Con 774 páginas de contenido real, un número bajo es señal de que el
    // filtro de redirecciones dejó de funcionar, no de que el sitio mejoró.
    expect(totalReales).toBeGreaterThan(700);
    expect(sinH1, `páginas sin h1:\n${sinH1.join('\n')}`).toEqual([]);
    expect(conVarios, `páginas con más de un h1:\n${conVarios.join('\n')}`).toEqual([]);
  });

  it('el <html lang> de cada página real coincide con su silo de interfaz', () => {
    const malos: string[] = [];
    let totalReales = 0;
    for (const file of allIndexFiles(DIST)) {
      const html = readFileSync(file, 'utf-8');
      if (esRedireccion(html)) continue;
      totalReales += 1;
      const rel = file.replace(DIST, '').replace(/\\/g, '/');
      const esperado = rel.startsWith('/en/') ? 'en-US' : 'es-ES';
      const m = html.match(/<html lang="([^"]*)"/);
      if (!m || m[1] !== esperado) {
        malos.push(`${rel} → lang="${m?.[1] ?? 'AUSENTE'}" (esperado "${esperado}")`);
      }
    }
    expect(totalReales).toBeGreaterThan(700);
    expect(malos, `html lang incorrecto:\n${malos.join('\n')}`).toEqual([]);
  });
});
