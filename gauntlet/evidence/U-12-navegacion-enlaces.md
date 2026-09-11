# Evidencia — U-12 (navegación y enlaces)

## Corrida exitosa

```
$ npm run build
[build] 1042 page(s) built in 9.37s

$ npx vitest run tests/links-integrity.test.ts
Test Files  1 passed (1)
     Tests  8 passed (8)
```

Total de enlaces internos barridos: **43617**, cero rotos.

## Aviso propio: `tests/dominio.test.ts` cazó mi primer borrador

Al correr la suite completa por primera vez, `tests/dominio.test.ts`
(candado de la mudanza de dominio, `docs/MIGRACION-DOMINIO.md`) falló:
mi primer borrador escribía la URL de producción a mano
(`SITE_ORIGIN = 'https://polylingua...'`) en vez de importarla de
`src/data/site.ts` (la única fuente permitida). Corregido importando
`SITE_URL` de ahí — el mismo candado que existe para U-14 (build y
despliegue) hizo su trabajo sobre esta unidad también, sin que hiciera
falta tocar su lista de archivos esperados.

```
$ npm test
FAIL tests/dominio.test.ts > la lista de archivos con la URL escrita a mano > ...
AssertionError: ... "tests/links-integrity.test.ts" ...
```

Corregido, re-corrido:

```
$ npx vitest run tests/links-integrity.test.ts tests/dominio.test.ts
Test Files  2 passed (2)
     Tests  18 passed (18)
```

## Inversión 1 — barrido de enlaces internos (`dist/`, gitignorado, sin riesgo)

```
$ cp dist/es/de/a1/articulos-der-die-das/index.html /tmp/articulos-index-backup.html
$ sed -i 's#href="/es/de/a1/fragewoerter"#href="/es/de/a1/fragewoerter-ROTO"#' dist/es/de/a1/articulos-der-die-das/index.html

$ npx vitest run tests/links-integrity.test.ts
FAIL ... > U-12 — barrido de enlaces internos > cada <a href> interno del sitio construido apunta a una página que existe
AssertionError: enlaces internos rotos:
/es/de/a1/articulos-der-die-das/index.html → href="/es/de/a1/fragewoerter-ROTO"
Test Files  1 failed (1)
     Tests  1 failed | 7 passed (8)
```

Revertido:

```
$ cp /tmp/articulos-index-backup.html dist/es/de/a1/articulos-der-die-das/index.html
$ diff /tmp/articulos-index-backup.html dist/es/de/a1/articulos-der-die-das/index.html
IDÉNTICO tras revertir
$ npx vitest run tests/links-integrity.test.ts
Test Files  1 passed (1)
     Tests  8 passed (8)
```

## Inversión 2 — miga de pan cruzando de silo (`src/`, versionado)

Se cambió temporalmente el `href` del primer tramo de la miga de pan de
la portada de curso, de `/${userLang}` (dinámico) a `/es` (fijo), en
`src/pages/[userLang]/[targetLang]/index.astro`:

```
$ git diff --stat "src/pages/[userLang]/[targetLang]/index.astro"
(vacío — confirmado limpio antes de tocar)

$ npm run build
[build] 1042 page(s) built in 7.10s

$ npx vitest run tests/links-integrity.test.ts
FAIL ... > U-12 — miga de pan coherente entre silos > portada de curso (en/de) tiene <nav class="breadcrumbs"> con hrefs del mismo silo
AssertionError: href de otro silo en la miga de pan: «/es» (esperado bajo /en): expected false to be true
Test Files  1 failed (1)
     Tests  1 failed | 7 passed (8)
```

Revertido:

```
$ git checkout -- "src/pages/[userLang]/[targetLang]/index.astro"
$ diff /tmp/course-index-backup.astro "src/pages/[userLang]/[targetLang]/index.astro"
IDÉNTICO tras revertir
$ npm run build
[build] 1042 page(s) built in 9.39s
$ npx vitest run tests/links-integrity.test.ts
Test Files  1 passed (1)
     Tests  8 passed (8)
```

## Verificación completa (comandos separados)

```
$ npm run check
Result (170 files):
- 0 errors
- 0 warnings
- 126 hints

$ npm run build
[build] 1042 page(s) built in 9.85s

$ npm test
Test Files  23 passed (23)
     Tests  572 passed (572)
```
