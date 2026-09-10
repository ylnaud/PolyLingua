# U-04 · A1 `es→de` sin regresión

- **Estado**: `PASS` — cerrada en ronda 1 (tras dos reintentos por bloqueo de entorno), con evidencia de ejecución real
- **Tipo**: `automático`
- **Depende de**: —

## Objetivo

El nivel A1 del curso `es→de` no sufre una regresión silenciosa: ni en el
número de lecciones o páginas que genera, ni en el contenido de `quiz` y
`exercises` que llevan sus 32 lecciones.

## Archivos afectados

- `tests/a1-es-de-regression.test.ts` (nuevo) — los 5 candados.

Ningún archivo de `src/` se tocó: esta unidad es puramente de verificación,
igual que U-03.

## Corrección de una cifra publicada

`gauntlet/units/INDEX.md` decía "33 URLs de `/es/de/a1/`". Es incorrecta —
verificado contra el build real: son **34** (32 lecciones + el índice del
nivel + `examen.astro`, página especial por nivel que no viene de una
lección — la misma clase de página que causó el defecto D0 de U-01). Se
corrige en el mismo commit que cierra esta unidad, no se repite el número
viejo en la ficha nueva.

## Criterio de aceptación

1. Exactamente **32** archivos `.md` en `src/content/lessons/es-de/a1/`,
   con sus 32 nombres fijados (no solo el número — un archivo que se borra
   y otro que se crea con contenido distinto mantendría el conteo igual).
2. Exactamente **34** páginas HTML bajo `dist/es/de/a1/` tras el build.
3. Exactamente **106** items de `quiz` y **170** de `exercises`, sumados
   en las 32 lecciones.
4. Ninguna de las 32 lecciones con `quiz` y `exercises` vacíos a la vez
   (el esquema Zod permite `exercises: []` como default, así que esto no
   lo cubre la validación de esquema).
5. Las 32 páginas de lección existen en `dist/`, una por slug.
6. `npm run check`, `npm run build`, `npm test` en verde.

## Cómo se prueba

```bash
npm run check
npm run build
npm test
npx vitest run tests/a1-es-de-regression.test.ts
```

## Inversión

Salida cruda completa en
[`../evidence/U-04-inversion.md`](../evidence/U-04-inversion.md). A
diferencia de U-03 (que manipulaba `dist/`, gitignorado), acá los defectos
se inyectaron sobre lecciones REALES versionadas — se guardó copia exacta
antes de tocar nada y se restauró byte a byte después, confirmado con
`diff` y con `git status` limpio al final:

| Defecto inyectado                                                    | Tests que lo cazaron                            | Mensaje                                                                                   |
| -------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Se borró `zahlen.md` (32→31 lecciones)                               | conteo de lecciones y totales de quiz/exercises | `expected […31] to have a length of 32 but got 31` / `total quiz: expected 103 to be 106` |
| Se vaciaron `quiz`/`exercises` de `tiere.md` (sin borrar el archivo) | totales de quiz/exercises y "ninguna vacía"     | `total quiz: expected 103 to be 106` / `lecciones sin quiz ni exercises: tiere.md`        |

Los dos, revertidos con `cp` desde la copia guardada (`diff` confirmó
"IDÉNTICO" en ambos casos), vuelven a verde. `git status --short` al final
no muestra ningún archivo de lección modificado — solo los 3 nuevos de esta
unidad.

## Falsos positivos

Ninguno encontrado. Una decisión de diseño: el criterio 4 comprueba "quiz Y
exercises vacíos a la vez" (no cada campo por separado), porque el proyecto
mezcla los dos libremente — algunas lecciones tienen solo `quiz`, otras solo
`exercises`, y `Practice.astro` los interlaza en una sola sesión. Exigir
ambos campos no vacíos en cada lección habría sido un criterio más estricto
del que el propio contenido real cumple hoy, y hubiera generado ruido sin
relación con una regresión real.

## Límites declarados

- **No verifica la CALIDAD del contenido**, solo su presencia y cantidad.
  Que una lección tenga 3 items de `quiz` no dice que sean buenos — eso es
  revisión de contenido, no un candado automático.
- **No cubre navegador.** No abre `Practice.astro` en un navegador para
  confirmar que los 106+170 items se renderizan y funcionan — eso es
  trabajo de otra unidad (`U-10`, ejercicios, `+ browser`).
- **Solo A1 `es→de`.** No es un patrón que se replique automáticamente a
  otros niveles o cursos; si hace falta el mismo candado para B1, C1, etc.,
  es trabajo aparte (ninguna unidad del índice lo pide todavía salvo A1).
- **El conteo de `quiz`/`exercises` es por marcador de línea** (`- question:`
  / `- type:`), no un parser YAML completo — coherente con el patrón ya
  usado en `tests/data-integrity.test.ts` para no añadir una dependencia
  nueva, pero significa que un YAML mal indentado que rompiera ese patrón
  daría un conteo incorrecto sin que este test lo distinga de una regresión
  real. En la práctica, `npm run build` ya rompería antes por el esquema
  Zod si el YAML estuviera mal formado.

## Veredicto del Critic

Dos intentos previos quedaron `BLOCKED`: el harness les activó Plan Mode y
no pudieron ejecutar `npm run check`/`build`/`test` ni hacer una inversión
propia editando una lección real — ambos verificaron todo lo demás por
lectura (conteos con métodos independientes, ausencia de solapamiento con
otros tests) sin encontrar ningún defecto, pero ninguno fingió haber
corrido lo que no pudo correr. Un tercer intento sí pudo ejecutar todo sin
restricción. Veredicto, pegado literal:

---

# U-04 CRITIC — RONDA 1

## VEREDICTO

PASS

## EVIDENCIA

**`npm run check`** — `0 errors, 0 warnings, 126 hints`.

**`npm run build`** — `1042 page(s) built`, sin errores.

**`npm test`** — `Test Files 21 passed (21)` / `Tests 550 passed (550)`.

**`npx vitest run tests/a1-es-de-regression.test.ts`** — 5/5.

**Verificación independiente de las cifras**: 32 archivos reales en
`src/content/lessons/es-de/a1/`, nombres coincidentes uno a uno con
`SLUGS_ESPERADOS`; 34 páginas bajo `dist/es/de/a1/` tras el build fresco
(32 lecciones + índice + examen); un script Python propio, con un regex
distinto al del test, dio los mismos totales (quiz 106, exercises 170,
ninguna lección con ambos vacíos) — descarta que el resultado dependa de
un artefacto del regex del test.

**No solapamiento** confirmado leyendo `data-integrity.test.ts` completo y
grepeando `content-schema.test.ts`: ninguno fija estos números ni esta
lista de slugs.

**Inversión propia, dos casos distintos a los ya documentados por el
Builder** (con backup y restauración verificada con `diff` en ambos):

1. Vaciar solo `quiz` (dejando `exercises` intacto) en `arbeit-alltag.md`
   → el criterio de totales lo cazó, y el criterio 4 ("ambos vacíos a la
   vez") correctamente **no** se disparó — confirma que la decisión de
   diseño del criterio 4 no esconde una pérdida real de contenido, porque
   el criterio de totales la caza igual.
2. Copiar `zahlen.md` como una 33ª lección (`zahlen-copia-extra.md`) → el
   conteo exacto de lecciones y de totales lo cazaron — confirma que el
   candado también caza un AUMENTO, no solo una baja.

**Estado final del repo**: coincide exactamente con lo declarado. Sin
ningún "33" incorrecto vigente en el repositorio (solo queda dentro de
esta ficha, citando el error histórico como contexto).

## DEFECTOS ENCONTRADOS

NINGUNO

## REGRESIONES

No. Suite completa (550 tests) en verde, con salida real, sin mocks.

## CONCLUSIÓN

U-04 puede considerarse cerrada. Los 6 criterios verificados con
ejecución real y reconteo independiente, más dos inversiones propias que
prueban tanto la dirección de aumento como que la decisión de diseño del
criterio 4 no deja un hueco real.

---
