import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = join(import.meta.dirname, '..');

/**
 * U-14 del Gauntlet: build y despliegue.
 *
 * `tests/sw.test.ts` ya cubre el Service Worker y `tests/dominio.test.ts` ya
 * cubre el Worker de redirección y la fuente única de la URL — pero dos
 * invariantes que la skill `polylingua-deploy` documenta como no
 * negociables no tenían ningún candado:
 *
 * `wrangler.jsonc` "tiene exactamente cuatro cosas", y sobre todo **no
 * lleva `main`** — sin eso, Cloudflare sirve `dist/` como assets estáticos
 * sin ejecutar código; con un `main`, el modelo de despliegue entero
 * cambia (Worker con runtime, consumo de cuota de invocaciones) sin que
 * nada lo anuncie. Y `public/_headers` es "la config de seguridad activa"
 * (CSP, HSTS, etc.) — se podía vaciar o borrar sin que ningún test avisara.
 */
describe('wrangler.jsonc — exactamente lo que documenta polylingua-deploy', () => {
  const wrangler = JSON.parse(readFileSync(join(RAIZ, 'wrangler.jsonc'), 'utf-8'));

  it('tiene exactamente estas cuatro claves de primer nivel', () => {
    expect(Object.keys(wrangler).sort()).toEqual(['assets', 'compatibility_date', 'name'].sort());
  });

  it('NO lleva "main": Cloudflare sirve dist/ como assets, sin ejecutar código', () => {
    expect(Object.prototype.hasOwnProperty.call(wrangler, 'main')).toBe(false);
  });

  it('assets apunta a dist/ y muestra la página 404 real', () => {
    expect(wrangler.assets.directory).toBe('./dist');
    expect(wrangler.assets.not_found_handling).toBe('404-page');
    expect(wrangler.assets.html_handling).toBe('auto-trailing-slash');
  });

  it('name y compatibility_date están presentes y no vacíos', () => {
    expect(wrangler.name).toBe('polylingua');
    expect(typeof wrangler.compatibility_date).toBe('string');
    expect(wrangler.compatibility_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('public/_headers — la config de seguridad activa', () => {
  const headers = readFileSync(join(RAIZ, 'public', '_headers'), 'utf-8');

  it('se aplica a todo el sitio (/*)', () => {
    expect(headers.split('\n')[0]!.trim()).toBe('/*');
  });

  // Los ocho, uno por uno: si falta cualquiera, el mensaje dice cuál — no
  // "la suite falló".
  const esperadas = [
    'Content-Security-Policy',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
    'Permissions-Policy',
    'Strict-Transport-Security',
    'Cross-Origin-Opener-Policy',
    'Cross-Origin-Resource-Policy',
  ];
  it.each(esperadas)('lleva la cabecera %s', (nombre) => {
    expect(headers).toContain(`${nombre}:`);
  });

  it('el Content-Security-Policy sigue siendo restrictivo (default-src self)', () => {
    expect(headers).toMatch(/Content-Security-Policy:.*default-src 'self'/);
  });
});
