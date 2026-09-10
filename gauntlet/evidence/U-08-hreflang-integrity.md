# Evidencia — U-08 (interfaz de idiomas)

Salida cruda, comandos separados (no encadenados).

## Corrida exitosa

```
$ npm run build
[build] 1042 page(s) built in 11.20s

$ npx vitest run tests/hreflang-integrity.test.ts
Test Files  1 passed (1)
     Tests  8 passed (8)
```

Total de hreflang barridos en el build real: **1380**, cero rotos. El
propio comentario de `BaseSEO.astro` cita 645 de 1350 rotos como el bug
histórico que esto guarda — hoy son más páginas (1380 vs 1350) y cero
rotos.

## Inversión 1 — corromper un hreflang en `dist/` (gitignorado, sin riesgo)

```
$ cp dist/es/de/index.html /tmp/es-de-index-backup.html
$ sed -i 's#href="https://…/en/de"#href="https://…/en/de-ROTO"#' dist/es/de/index.html

$ npx vitest run tests/hreflang-integrity.test.ts
FAIL tests/hreflang-integrity.test.ts > U-08 — integridad de hreflang > cada hreflang declarado en el sitio construido apunta a una página que existe
AssertionError: hreflang rotos:
/es/de/index.html → hreflang="en-US" href="https://…/en/de-ROTO": expected [ Array(1) ] to deeply equal []
Test Files  1 failed (1)
     Tests  1 failed | 7 passed (8)
```

Revertido:

```
$ cp /tmp/es-de-index-backup.html dist/es/de/index.html
$ diff /tmp/es-de-index-backup.html dist/es/de/index.html
IDÉNTICO tras revertir

$ npx vitest run tests/hreflang-integrity.test.ts
Test Files  1 passed (1)
     Tests  8 passed (8)
```

## Inversión 2 — activar `de` sin haber escrito su diccionario (`src/`, versionado)

```
$ git diff --stat src/data/userLanguages.ts
(vacío — confirmado limpio antes de tocar)
$ cp src/data/userLanguages.ts /tmp/userLanguages-backup.ts
```

Cambio: `{ id: 'de', ..., active: false }` → `active: true`.

```
$ npx vitest run tests/hreflang-integrity.test.ts
FAIL ... > forma fija de USER_LANGUAGES > exactamente dos idiomas activos hoy: es y en
AssertionError: expected [ 'es', 'de', 'en' ] to deeply equal [ 'es', 'en' ]
Test Files  1 failed (1)
     Tests  2 failed | 6 passed (8)
```

(Dos tests lo cazaron: el candado de `active` por posición y el de
`ACTIVE_USER_LANGUAGES` exacto.)

Revertido:

```
$ git checkout -- src/data/userLanguages.ts
$ diff /tmp/userLanguages-backup.ts src/data/userLanguages.ts
IDÉNTICO tras revertir
$ git status --short src/data/userLanguages.ts
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
[build] 1042 page(s) built in 11.03s

$ npm test
Test Files  22 passed (22)
     Tests  558 passed (558)
```
