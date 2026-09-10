# Evidencia — U-09 (sistema de skills)

## Auditoría previa (por qué el alcance quedó reducido a un solo test)

Antes de escribir nada, verificación manual de los tres criterios que
`INDEX.md` declaraba para esta unidad, contra `tests/engine.test.ts`
(describe `'catálogo de habilidades'`, líneas 403-448 antes de esta
unidad):

```
$ node -e "... (script de auditoría, ver sesión) ..."
total lessons: 484
lecciones sin skills (o campo vacio): 0
catalog size: 413
unique refs from lessons: 413
refs NOT in catalog: 0
catalog skills never referenced by any lesson: 0
prerequisites apuntando a id inexistente: 0
skills que se listan a si mismas como prerequisito: 0
```

Confirmado por lectura: `tests/engine.test.ts` ya tiene, literalmente,
`'ningún prerrequisito apunta a una habilidad que no existe'`, `'todas
las habilidades tienen al menos una lección que las enseña'` (cero
huérfanas) y `'las lecciones no referencian habilidades inexistentes'`
(cero referencias fantasma) — los dos primeros criterios de U-09 ya
estaban cerrados. El único hueco real: nada comprobaba que las 484
lecciones tuvieran `skills` no vacío (el esquema Zod permite
`skills: []` como default).

## Corrida exitosa

```
$ npx vitest run tests/data-integrity.test.ts
Test Files  1 passed (1)
     Tests  30 passed (30)
```

(29 tests preexistentes + 1 nuevo: `'todas las lecciones tienen al menos
un skill (484/484 etiquetadas)'`.)

## Inversión

Se vació temporalmente `skills:` en una lección real y versionada
(`src/content/lessons/es-de/a1/zahlen.md`, que en el repo real tiene
`skills: [de.a1.vocabulary.numbers]`):

```
$ git diff --stat src/content/lessons/es-de/a1/zahlen.md
(vacío — confirmado limpio antes de tocar)
$ cp src/content/lessons/es-de/a1/zahlen.md /tmp/zahlen-backup-u09.md
```

Cambio: `skills:\n  - de.a1.vocabulary.numbers` → `skills: []`.

```
$ npx vitest run tests/data-integrity.test.ts
FAIL tests/data-integrity.test.ts > frontmatter de las lecciones > todas las lecciones tienen al menos un skill (484/484 etiquetadas)
AssertionError: lecciones sin skills:
es-de/a1/zahlen.md: expected [ 'es-de/a1/zahlen.md' ] to deeply equal []
Test Files  1 failed (1)
     Tests  1 failed | 29 passed (30)
```

Revertido:

```
$ git checkout -- src/content/lessons/es-de/a1/zahlen.md
$ diff /tmp/zahlen-backup-u09.md src/content/lessons/es-de/a1/zahlen.md
IDÉNTICO tras revertir
$ git status --short src/content/lessons/es-de/a1/zahlen.md
(vacío)
```

## Verificación completa (comandos separados)

```
$ npm run check
Result (169 files):
- 0 errors
- 0 warnings
- 126 hints

$ npm run build
[build] 1042 page(s) built in 11.22s

$ npm test
Test Files  22 passed (22)
     Tests  559 passed (559)
```
