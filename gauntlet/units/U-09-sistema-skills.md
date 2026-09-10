# U-09 · Sistema de skills

- **Estado**: `PASS` — cerrada en ronda 1, con evidencia de ejecución real
- **Tipo**: `automático`
- **Depende de**: —

## Objetivo declarado (antes de auditar)

`INDEX.md` pedía tres candados: cero habilidades huérfanas, cero
referencias a ids inexistentes, y 484/484 lecciones etiquetadas.

## Auditoría previa: dos de los tres ya estaban cerrados

Antes de implementar nada, verificación manual de los tres criterios
contra el código existente. Resultado: `tests/engine.test.ts`
(`describe('catálogo de habilidades')`) ya tenía, literalmente:

- `'ningún prerrequisito apunta a una habilidad que no existe'`
- `'todas las habilidades tienen al menos una lección que las enseña'`
  (cero huérfanas)
- `'las lecciones no referencian habilidades inexistentes'` (cero
  referencias fantasma)

Confirmado también con un script propio de conteo independiente: 484
lecciones, 413 skills en el catálogo, 0 huérfanas, 0 referencias
inexistentes, 0 prerrequisitos rotos — coincide con lo que esos tests ya
bloquean. Duplicar esos dos candados habría sido puro ruido.

**El alcance de esta unidad quedó reducido al hueco real**: nada
comprobaba que las 484 lecciones tuvieran `skills` no vacío. El esquema
Zod permite `skills: []` como default (`src/content.config.ts:107`) —
el mismo tipo de hueco que U-04 ya encontró para `exercises: []`.

## Archivos afectados

- `tests/data-integrity.test.ts` — se extendió el array `lecciones` del
  bloque `describe('frontmatter de las lecciones', ...)` (que ya recorre
  las 484 lecciones para otros chequeos) con un campo `skillsCount`, y
  se agregó un test nuevo. Ningún archivo nuevo.

Ningún archivo de `src/` quedó tocado de forma permanente.

## Criterio de aceptación

1. Ninguna de las 484 lecciones tiene `skills` vacío.
2. (Ya cerrados por `tests/engine.test.ts`, sin tocar: cero huérfanas,
   cero referencias inexistentes, cero prerrequisitos rotos.)
3. `npm run check`, `npm run build`, `npm test` en verde.

## Cómo se prueba

```bash
npx vitest run tests/data-integrity.test.ts
```

## Resultado real

Salida cruda completa en
[`../evidence/U-09-sistema-skills.md`](../evidence/U-09-sistema-skills.md):

```
Test Files  1 passed (1)
     Tests  30 passed (30)
```

## Inversión

Se vació `skills:` en una lección real y versionada
(`src/content/lessons/es-de/a1/zahlen.md`), confirmando el fallo
nombrado:

```
AssertionError: lecciones sin skills:
es-de/a1/zahlen.md: expected [ 'es-de/a1/zahlen.md' ] to deeply equal []
```

Revertido con `git checkout --`, confirmado idéntico con `diff`.

## Falsos positivos

Ninguno encontrado.

## Límites declarados

- **No repite los tres candados que ya existían** — habría sido
  duplicación sin valor. Esta unidad solo cierra el hueco real.
- **No verifica la CALIDAD de la relación lección↔skill**, solo que
  exista al menos una. Que una lección tenga el skill "correcto" es
  revisión de contenido, no un candado automático.

## Veredicto del Critic

Sin bloqueo, en el primer intento. Pegado literal:

---

# U-09 CRITIC — RONDA 1

## VEREDICTO

PASS

## EVIDENCIA

**Alcance reducido — verificado, no solo afirmado**: `git diff --stat
tests/engine.test.ts` → vacío (el Builder no tocó el archivo). `git log
-1 -- tests/engine.test.ts` → último commit anterior a esta unidad: el
describe `catálogo de habilidades` ya existía antes de U-09. Leído el
bloque completo: contiene literalmente los tres tests citados. Ejecutado
aislado (`-t "catálogo de habilidades"`) → `4 passed | 48 skipped (52)`.
Los dos primeros criterios de `INDEX.md` están cubiertos de verdad, no
es una excusa.

**Verificación general**: `npm run check` → `0 errors, 0 warnings, 126
hints`. `npm run build` → `1042 page(s) built` (corrido dos veces, antes
y después de la inversión propia, mismo resultado). `npm test` →
`Test Files 22 passed (22)` / `Tests 559 passed (559)`.

**Lectura de `data-integrity.test.ts` completo**: `contarSkills()` usa
un regex equivalente en efecto al que ya usa `engine.test.ts` para leer
la misma lista — miden lo mismo.

**`npx vitest run tests/data-integrity.test.ts`** aislado → `30 passed
(30)`.

**Inversión propia, distinta a la del Builder**: `git status`/`git
diff --stat` limpios confirmados antes de tocar nada. Vació `skills:`
en `src/content/lessons/en-de/b1/genitiv-case.md` (curso y nivel
distintos al `es-de/a1/zahlen.md` del Builder):

```
FAIL ... > todas las lecciones tienen al menos un skill (484/484 etiquetadas)
AssertionError: lecciones sin skills:
en-de/b1/genitiv-case.md: expected [ 'en-de/b1/genitiv-case.md' ] to deeply equal []
Tests 1 failed | 29 passed (30)
```

Revertido con `git checkout --`, `diff` contra backup propio →
idéntico, `git status --short` vacío, retest → `30/30`, rebuild final
→ `1042 páginas`.

**Estado final**: `git status`/`git diff --stat` coinciden exactamente
con lo declarado.

## DEFECTOS ENCONTRADOS

NINGUNO.

## REGRESIONES

`npm test` completo (559/559) y `npm run build` (1042 páginas)
corridos después de la inversión/reversión del Critic, en verde.

## CONCLUSIÓN

El alcance reducido de U-09 está justificado con evidencia real, no es
una excusa: verificado de primera mano que `tests/engine.test.ts` no
fue tocado y que ya cubría, antes de esta unidad, los dos primeros
criterios de `INDEX.md`. El único trabajo nuevo mide lo que dice medir,
detecta una inversión real hecha en un archivo distinto al del Builder,
nombra el archivo exacto en el fallo, y se revirtió limpiamente. No se
encontraron discrepancias entre lo afirmado y lo ejecutado.

---
