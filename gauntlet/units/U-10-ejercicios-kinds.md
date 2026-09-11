# U-10 · Ejercicios (los 5 `kind`)

- **Estado**: `PASS` — cerrada en ronda 1, con evidencia de ejecución real y un defecto real corregido
- **Tipo**: `automático + navegador`
- **Depende de**: —

## Objetivo

Dos candados: los cinco tipos de ejercicio (`choice`, `fill-blank`,
`match`, `write`, `order`) responden y puntúan de verdad en un navegador
real dentro de una sola sesión; y cada `fill-blank` real del repo lleva
exactamente un `___` (ni cero, ni más de uno).

## Defecto real encontrado durante la auditoría previa

Antes de escribir el candado del `___`, un barrido de las 975 `sentence`
reales de `fill-blank` en todo el repo encontró **3 con 2 o 3 `___`** en
vez de uno: dos en `es-it/a1/saluti.md`, una en `es-pt/a1/saudacoes.md`.
`Practice.astro` (`splitSentence()`) solo convierte el **primer** `___`
en el input real — un segundo o tercer `___` en la misma `sentence`
queda como texto literal visible para el alumno. No era hipotético: era
un bug ya publicado.

Corregido en el mismo commit que cierra esta unidad: cada uno de los 3
se redujo a un solo hueco (el más relevante pedagógicamente), rellenando
los demás con la palabra correcta ya evidenciada por el propio contenido
de la lección (quiz, vocabulario). Ningún dato inventado — ver el diff.

## Por qué también hacía falta la parte de navegador

`smoke` (el flujo original, es-de/a1/articulos-der-die-das) ya cubría
`choice`, `fill-blank`, `match` y `order` — pero **nunca** `write`, y
ningún otro flujo de Playwright del repo lo toca tampoco. `write` nunca
había sido ejercitado por un navegador real en este proyecto.

## Archivos afectados

- `src/content/lessons/es-it/a1/saluti.md`,
  `src/content/lessons/es-pt/a1/saudacoes.md` — arreglo del defecto real.
- `tests/data-integrity.test.ts` — candado nuevo (`describe('ejercicios
fill-blank')`).
- `.claude/skills/run-polylingua/driver.mjs` — `runSmokeKinds` (nuevo) y
  comando CLI `smoke-kinds`, sobre `es-de/a1/presente-verbos` (única
  lección del repo con los 5 `kind` en un solo archivo).

## Criterio de aceptación

1. Cada `fill-blank` real del repo tiene exactamente un `___`.
2. Una sesión real en `/es/de/a1/presente-verbos/` pasa por los 5 `kind`
   (`choice`, `fill-blank`, `match`, `write`, `order`), cada uno
   respondido, y llega al estado "terminado" con un puntaje real.
3. Cero errores de consola durante el flujo.
4. `npm run check`, `npm run build`, `npm test` en verde.

## Cómo se prueba

```bash
npx vitest run tests/data-integrity.test.ts
npm run build
nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
node .claude/skills/run-polylingua/driver.mjs smoke-kinds --port 4321 --out /tmp/smoke-kinds.png
npx astro preview stop
```

## Resultado real

Salida cruda completa en
[`../evidence/U-10-ejercicios-kinds.md`](../evidence/U-10-ejercicios-kinds.md):

```
OK — Acertaste 8 / 10
Kinds vistos: choice, fill-blank, match, order, write
```

## Inversión

Dos inversiones distintas, salida cruda en el archivo de evidencia:

| Defecto inyectado                                                        | Dónde               | Candado que lo cazó                                           |
| ------------------------------------------------------------------------ | ------------------- | ------------------------------------------------------------- |
| Se reinyectó un segundo `___` en `saudacoes.md` (ya corregido)           | `src/` (versionado) | `'cada fill-blank lleva exactamente un ___'`                  |
| Se cambió el único ejercicio `write` de `presente-verbos` a `fill-blank` | `src/` (versionado) | `runSmokeKinds`: `"La lección no pasó por estos kind: write"` |

Los dos, revertidos (`cp`/`diff` para el primero, `cp`/`diff` para el
segundo), confirmados idénticos, vuelven a verde.

## Falsos positivos

Ninguno encontrado.

## Límites declarados

- **El candado de navegador prueba una sola lección.** `presente-verbos`
  es la única con los 5 `kind` en un archivo; no es un barrido de las
  484 lecciones. Sí prueba, por primera vez en el repo, que `write`
  responde y puntúa de verdad en un DOM real.
- **El arreglo de contenido tocó solo 3 ejercicios** de 975 — el resto
  ya cumplía. No se revisó la calidad pedagógica de los 972 restantes,
  solo la forma técnica (exactamente un `___`).
- **No cubre los otros cuatro `kind` en el camino de refuerzo de
  DrillTutor** (eso es U-05/U-06/U-07, que ya declararon ese límite).

## Veredicto del Critic

Sin bloqueo, en el primer intento. Pegado literal:

---

# U-10 CRITIC — RONDA 1

## VEREDICTO

PASS

## EVIDENCIA

**Lectura del defecto en `Practice.astro`** (`splitSentence`, usa
`indexOf` — primera ocurrencia únicamente; todo lo que queda en `after`,
incluido cualquier `___` adicional, se renderiza literal). Confirmado
real, no cosmético.

**Verificación independiente del barrido de 975 sentence**, con un
parser YAML real (`js-yaml`) en vez de la técnica de split-por-regex del
Builder — método deliberadamente distinto: `total fill-blank: 975`,
`bad count: 0`. Coincide exactamente.

**Verificación lingüística de los 3 arreglos**, leídos los archivos
completos: "Mi chiamo Marco" y "Piacere!" confirmados en `phrases:` y en
el diálogo del cuerpo de `saluti.md`; "Buonasera" y "come sta"
confirmados igual; "Prazer!" confirmado en `phrases:` y en el cuerpo de
`saudacoes.md`. Ningún contenido inventado.

**Verificación completa** (comandos separados): `npm run check` → `0
errors`. `npm run build` → `1042 páginas`. `npm test` → `561 passed
(561)`. `npx vitest run tests/data-integrity.test.ts` → `32/32`. Todo
coincide con lo declarado.

**Candado de navegador**, servidor real levantado, `curl` → `200`:
`smoke-kinds` → `OK — Acertaste 8 / 10`, los 5 kinds. Confirmado que
`articulos-der-die-das.md` (usada por `smoke`) no tiene `write`.

**Regresión de los otros 4 flujos**: `smoke` 7/10, `smoke-en` 14/20,
`smoke-en-a2` 14/20, `smoke-en-b1` 12/17 — todos exactos.

**Dos inversiones propias, distintas a las del Builder**:

- Candado automático, caso 0 huecos: quitó el único `___` de otra
  sentence de `presente-verbos.md` (`'Du ___ das sehr gut.'` →
  `'Du das sehr gut.'`):

  ```
  FAIL ... > cada fill-blank lleva exactamente un ___
  es-de/a1/presente-verbos.md: 'Du das sehr gut.' (0 huecos)
  Tests 1 failed | 31 passed (32)
  ```

  Revertido, `diff` idéntico, retest → `32/32`.

- Candado de navegador, kind faltante distinto: quitó el bloque `match`
  completo (en vez de tocar `write`):
  ```
  FALLÓ: La lección no pasó por estos kind: match
  ```
  Revertido, `diff` idéntico, retest → `OK — Acertaste 8 / 10`, los 5
  kinds de vuelta.

**Estado final**: `git status`/`git diff --stat` coinciden con lo
declarado. Servidor de preview parado y confirmado sin proceso ni
puerto abierto.

## DEFECTOS ENCONTRADOS

NINGUNO. El defecto de contenido descrito por el Builder es real y su
corrección es correcta y no inventada; los candados nuevos detectan
casos de falla en ambas direcciones (más de un hueco / cero huecos;
falta un kind distinto al probado por el Builder).

## REGRESIONES

Ninguna. Los 4 flujos Playwright preexistentes dan exactamente los
mismos puntajes que antes de esta unidad, y la suite completa sigue en
verde.

## CONCLUSIÓN

El defecto real en `Practice.astro::splitSentence` quedó confirmado
leyendo el código, no solo la descripción del Builder; los 3 arreglos
de contenido se verificaron palabra por palabra contra el vocabulario/
frases de la misma lección; el barrido de 975 sentence fue reproducido
con un parser YAML independiente y dio la misma cifra. Las dos
inversiones propias — distintas a las del Builder tanto en la sentence
tocada como en el tipo de defecto (cero huecos en vez de duplicado;
`match` faltante en vez de `write`) — confirmaron que ambos candados
cazan el defecto en direcciones que el Builder no había probado.

---
