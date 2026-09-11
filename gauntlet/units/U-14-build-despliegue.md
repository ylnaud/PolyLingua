# U-14 · Build y despliegue

- **Estado**: `PASS` — cerrada en ronda 1, con evidencia de ejecución real
- **Tipo**: `automático`
- **Depende de**: —

## Objetivo

Dos candados sobre dos invariantes que la skill `polylingua-deploy`
declara como no negociables y que hasta ahora nadie comprobaba:
`wrangler.jsonc` tiene exactamente la forma documentada (y sobre todo,
no lleva `main`), y `public/_headers` sigue trayendo las ocho cabeceras
de seguridad activas. Más el registro del commit exacto donde
`check`/`build`/`test` quedaron verdes juntos.

## Por qué hacía falta

`tests/sw.test.ts` ya cubre el Service Worker y `tests/dominio.test.ts`
ya cubre el Worker de redirección y la fuente única de `SITE_URL` — pero
ninguno de los dos toca `wrangler.jsonc` ni `public/_headers`
directamente. La propia skill `polylingua-deploy` es explícita: **"No
hay `main`. Eso significa que Cloudflare sirve los archivos y no
ejecuta código"** — agregar uno sin querer (por ejemplo al cablear el
Worker de redirección del dominio propio, que sí existe como código en
`worker/redirect.ts` pero hoy no está activo) cambiaría el modelo de
despliegue entero en silencio, sin que ningún test lo notara.

## Archivos afectados

- `tests/deploy.test.ts` (nuevo) — los dos candados.

Ningún archivo de despliegue quedó modificado de forma permanente.

## Criterio de aceptación

1. `wrangler.jsonc` tiene exactamente `name`, `compatibility_date` y
   `assets` como claves de primer nivel — nada más, y en particular
   nunca `main`.
2. `assets.directory` es `./dist`, `assets.not_found_handling` es
   `404-page`, `assets.html_handling` es `auto-trailing-slash`.
3. `public/_headers` se aplica a `/*` y trae las ocho cabeceras de
   seguridad activas (CSP con `default-src 'self'`, X-Content-Type-
   Options, X-Frame-Options, Referrer-Policy, Permissions-Policy,
   Strict-Transport-Security, Cross-Origin-Opener-Policy,
   Cross-Origin-Resource-Policy).
4. `npm run check`, `npm run build`, `npm test` en verde, con el commit
   exacto donde se confirmó registrado en la ficha.

## Cómo se prueba

```bash
npx vitest run tests/deploy.test.ts
npm run check
npm run build
npm test
```

## Resultado real

Salida cruda completa en
[`../evidence/U-14-build-despliegue.md`](../evidence/U-14-build-despliegue.md):

```
Test Files  1 passed (1)
     Tests  14 passed (14)
```

`npm run check` → 0 errores. `npm run build` → 1042 páginas. `npm test`
→ 588/588 (subiendo de 574 por los 14 tests nuevos).

## Commit exacto identificado

`check`/`build`/`test` confirmados en verde, en ese orden, sobre
`fb0b6a97b7c0ba8a9e70b39f3e2ad8f76425e799` (el commit del piloto de
Liquid Glass, inmediatamente anterior a esta unidad) — sin ningún
cambio intermedio sin verificar entre ese commit y el que cierra U-14.

## Inversión

Dos inversiones distintas, salida cruda en el archivo de evidencia:

| Defecto inyectado                                           | Dónde                      | Candado que lo cazó                                               |
| ----------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------- |
| Se agregó `"main": "worker/redirect.ts"` a `wrangler.jsonc` | raíz del repo (versionado) | dos tests: forma exacta de 4 claves, y "NO lleva main" específico |
| Se quitó `X-Frame-Options: DENY` de `public/_headers`       | `public/` (versionado)     | test nombrado por cabecera, `it.each`                             |

Los dos, revertidos con `cp`/`diff`, confirmados idénticos, vuelven a
verde.

## Falsos positivos

Ninguno encontrado.

## Límites declarados

- **No prueba el despliegue real en Cloudflare** (no hay acceso a la
  cuenta desde este entorno) — verifica que la configuración declarada
  en el repo es la correcta, no que el `wrangler deploy` real funcione.
- **`compatibility_date` se comprueba en formato, no en valor exacto**
  — fijar la fecha exacta sería un candado que se rompe solo con el
  tiempo, sin que eso sea nunca un defecto real.
- **El contenido exacto de cada valor de cabecera** (por ejemplo la
  lista completa de directivas del CSP) no se compara carácter por
  carácter, solo que la cabecera exista y que el CSP siga teniendo
  `default-src 'self'` — un cambio de matiz en una directiva no crítica
  no lo detecta este candado.

## Veredicto del Critic

Sin bloqueo, en el primer intento. Pegado literal:

---

# U-14 CRITIC — RONDA 1

## VEREDICTO

PASS

## EVIDENCIA

**Comandos base**: `npm run check` → `0 errors`. `npm run build` →
`1042 páginas`. `npm test` → `588 passed (588)`. `npx vitest run
tests/deploy.test.ts` aislado → `14 passed (14)`.

**Lectura de `polylingua-deploy/SKILL.md` línea por línea**: "wrangler.jsonc
tiene exactamente cuatro cosas" y "**No hay `main`.** Eso significa que
Cloudflare sirve los archivos y no ejecuta código" están literalmente
ahí — no son invención del Builder.

**Lectura de `wrangler.jsonc` y `public/_headers` reales**: coinciden
byte a byte con lo que el test exige.

**Confirmación del hash de commit citado**: `git log --oneline -1
fb0b6a97b7c0ba8a9e70b39f3e2ad8f76425e799` → `fb0b6a9 Piloto de estilo
Liquid Glass en header y selector de idioma`. `git show --stat`
confirma los 3 archivos tocados — corresponde exactamente a lo descrito
en la ficha, y es HEAD actual.

**Inversión propia A** (`wrangler.jsonc`, distinta a la del Builder):
cambió `assets.directory` de `./dist` a `./build` (sin tocar `main`).
`FAIL` en `assets apunta a dist/...` — confirma que el candado caza
cambios de VALOR, no solo la presencia de `main`. Revertido, `diff`
idéntico, retest → `14/14`.

**Inversión propia B** (`public/_headers`, distinta a la del Builder):
quitó solo `default-src 'self'; ` del CSP, dejando el resto de la
directiva y la cabecera intacta. `FAIL` en el test de CSP restrictivo
— confirma que ese candado detecta debilitaciones específicas del
contenido, no solo la ausencia de la cabecera completa. Revertido,
`diff` idéntico, retest → `14/14`.

**Estado final**: `git status`/`git diff --stat` coinciden exactamente
con lo declarado. `dist/` confirmado gitignorado.

## DEFECTOS ENCONTRADOS

NINGUNO.

## REGRESIONES

Ninguna. `npm test` corre los 25 archivos existentes en verde
(588/588), incluidos `sw.test.ts` y `dominio.test.ts`.

## CONCLUSIÓN

Las cuatro afirmaciones del criterio de aceptación se verificaron con
evidencia de primera mano. Las dos inversiones propias confirman que
los candados detectan tanto cambios de valor dentro de `assets` como
debilitaciones específicas del contenido del CSP, no solo la ausencia
completa de una cabecera o clave. El hash de commit citado existe y
corresponde exactamente a lo descrito. No se encontró ningún defecto.

---
