# U-03 · Cifras base y rutas críticas

- **Estado**: `PASS` — cerrada en ronda 1, con evidencia de ejecución real
- **Tipo**: `automático`
- **Depende de**: —

## Objetivo

El número de páginas construidas, el número de URLs del sitemap (total y por
silo) y la existencia de las rutas más importantes del sitio quedan fijados
con tolerancia cero a la baja. Si alguno baja, el build falla ahí mismo,
nombrando el número real. Si alguno sube, el test también falla —a propósito—
hasta que se actualice la cifra, que es el mecanismo que obliga a justificar
el cambio en el mismo commit.

## Archivos afectados

- `tests/baseline.test.ts` (nuevo) — los 4 candados: páginas totales,
  sitemap total, sitemap por silo, rutas críticas.
- `tests/build.test.ts` — se quitó `generates at least 500 HTML pages`
  (`toBeGreaterThanOrEqual(500)`, un umbral flojo que ya no medía nada útil
  con 1042 páginas reales) y la función `countHtmlFiles` que solo esa
  aserción usaba. El baseline real vive ahora en un solo sitio.

## Criterio de aceptación

1. `dist/` tiene exactamente **1043** archivos `.html` (1042 rutas que
   genera Astro + `404.html`, que Astro produce aparte y no cuenta en su
   propio «page(s) built»).
2. El sitemap (`dist/sitemap-*.xml`) tiene exactamente **544** URLs.
3. Por silo (primer segmento de la URL): `es` tiene exactamente **436**,
   `en` tiene exactamente **92**.
4. Estas rutas existen en el build: la portada, los hubs de `es` y `en`, los
   6 cursos (`es-de`, `es-en`, `es-fr`, `es-it`, `es-pt`, `en-de`), un nivel
   del silo principal (`es/de/a1`), el blog, los dos ficheros de sitemap y
   `404.html`.
5. `npm run check`, `npm run build`, `npm test` en verde.

## Cómo se prueba

```bash
npm run check
npm run build
npm test
npx vitest run tests/baseline.test.ts
```

## Inversión

Salida cruda completa en
[`../evidence/U-03-inversion.md`](../evidence/U-03-inversion.md). Como
`dist/` es artefacto de build (gitignorado), los dos defectos se inyectaron
directamente sobre el build real y se revirtieron reconstruyendo o
restaurando el archivo, sin tocar nada versionado:

| Defecto inyectado                                            | Tests que lo cazaron                                           | Mensaje                                                                                   |
| ------------------------------------------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Se borró `dist/en/de/index.html` (ruta crítica real)         | conteo de páginas (1043→1042) y rutas críticas                 | `expected 1042 to be 1043` / `en/de/index.html: expected false to be true`                |
| Se quitó a mano una `<url>` de `/es/de/` del `sitemap-0.xml` | conteo de sitemap (544→543) y desglose por silo (`es` 436→435) | `expected […543] to have a length of 544 but got 543` / `silo es: expected 435 to be 436` |

Los dos, revertidos (rebuild completo para el primero, restaurar el XML
para el segundo), vuelven a verde. `git diff --check` y `git status` quedan
limpios en ambos casos — nada versionado se tocó durante la inversión.

## Falsos positivos

Ninguno encontrado. La única decisión de diseño fue si el candado de conteo
debía ser `toBeGreaterThanOrEqual` (tolera subir sin avisar) o `toBe` exacto
(rompe con cualquier cambio, para arriba o para abajo). Se eligió exacto
porque es lo único que cumple «subir el baseline obliga a justificarlo en
el mismo commit»: con `>=`, un aumento real pasaría en silencio y nadie
tocaría el test ni dejaría constancia de por qué cambió el número.

## Límites declarados

- **No cubre navegador.** Es `automático` puro: lee `dist/` con Node, no
  abre un browser. Si algún día hace falta una capa visual sobre estas
  mismas rutas, es trabajo de otra unidad (`+ browser`).
- **La lista de "rutas críticas" no es exhaustiva.** Cubre portada, los dos
  hubs de interfaz, los 6 cursos, un nivel de ejemplo, el blog, el sitemap y
  el 404 — no cada una de las 1043 páginas. Es una muestra representativa de
  lo que rompería más visiblemente, no una prueba de que absolutamente todo
  existe.
- **El desglose por silo es solo `es`/`en`** (los dos ejes activos de
  interfaz). Las secciones fuera del eje userLang (blog, acerca, buscar,
  privacidad, términos: 15 URLs) no tienen candado de cifra propio, solo
  entran en el total de 544.
- **No mide contenido, solo cantidad y existencia.** Que una página exista
  no dice que su contenido sea correcto — eso lo cubren los demás archivos
  de test (`content-schema`, `dialogos-seo`, `lang-purity`, etc.).

## Veredicto del Critic

Un primer intento quedó bloqueado de entrada: el harness le activó Plan
Mode al Critic sin siquiera darle `Edit`/`Write`, así que ni pudo dejar
constancia en un plan — no llegó a ejecutar nada. Se relanzó la misma
revisión; el reintento corrió todo sin restricción. Veredicto, pegado
literal:

---

# U-03 CRITIC — RONDA 1

## VEREDICTO

PASS

## EVIDENCIA

**`npm run check`** — 2 veces: `0 errors, 0 warnings, 126 hints` ambas.

**`npm run build`** — 4 veces, incluido un `rm -rf dist` + rebuild:
siempre `1042 page(s) built`, sin errores.

**Conteo de HTML real, recursivo, en 4 builds distintos**: siempre
**1043**.

**Sitemap**: `grep -o "<loc>" dist/sitemap-0.xml | wc -l` → **544**.
`sitemap-index.xml` tiene 1 `<loc>` (autorreferencia), correctamente
excluida por el regex `/^sitemap-\d+\.xml$/` del test.

**Desglose por silo, calculado de forma independiente**: es 436, en 92,
blog 11, terminos/privacidad/buscar/acerca 1 c/u (15 fuera del eje
userLang), + portada = 544. Coincide exacto.

**Por qué 1043 y no 1042**: confirmado con el log crudo del build, no
asumido — `404.html` aparece en el log de generación por archivo
(`├─ /404.html (+19ms)`) pero no en el tally final `1042 page(s) built`.

**`npm test` completo**: 545/545 en 20 archivos.

**Rutas críticas**: las 14 existen en un build fresco; lista razonable
como "lo que rompería más visiblemente", sin huecos obvios dentro del
alcance declarado.

**Inversión propia, reforzando la del Builder con dos casos nuevos**:

1. Agregó `dist/__critic-test/index.html` (archivo de más) → 1044 →
   `expected 1044 to be 1043` → revertido, vuelve a 1043. Confirma que
   `toBe` exacto también caza SUBIDAS, no solo bajadas — con
   `toBeGreaterThanOrEqual` este caso habría pasado en silencio.
2. Borró `dist/es/pt/index.html` (ruta crítica no probada en la
   inversión original, que solo probó `en/de/`) → cazado por el conteo
   de páginas y por rutas críticas, dos tests distintos → restaurado,
   rebuild completo confirma 1043/544/436/92 y 545/545 en verde.

**`git status`/`git diff --stat`**: coincide exactamente con lo
declarado (`tests/baseline.test.ts` nuevo, `tests/build.test.ts`
modificado sin pérdida real de cobertura, ficha e INDEX). Nada en `src/`
tocado. `.claude/agents/planner.md` confirmado ajeno.

## DEFECTOS ENCONTRADOS

NINGUNO

## REGRESIONES

No. 545/545, 0 errores de check, build determinista en 4 corridas.

## CONCLUSIÓN

U-03 puede considerarse cerrada. Las cuatro cifras verificadas con conteo
independiente sobre builds reconstruidos varias veces, la explicación
1042/1043 confirmada con log crudo, y la elección de `toBe` exacto
probada activamente (no solo argumentada) con una inversión que muestra
que también exige justificar subidas, no solo bloquea bajadas.

---
