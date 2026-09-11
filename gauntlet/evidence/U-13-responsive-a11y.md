# Evidencia — U-13 (responsive y accesibilidad)

## Corrida exitosa — candados estáticos

```
$ npm run build
[build] 1042 page(s) built in 15.88s

$ npx vitest run tests/a11y-static.test.ts
Test Files  1 passed (1)
     Tests  2 passed (2)
```

774 páginas de contenido real barridas (excluidas las 268 páginas de
redirección legacy, que no tienen `<html>` ni contenido): 0 sin `h1`, 0
con más de uno, 0 con `<html lang>` incorrecto.

## Corrida exitosa — candado de navegador

```
$ nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
$ node .claude/skills/run-polylingua/driver.mjs check-overflow --port 4321
OK — 5 páginas × 3 anchos, sin desbordamiento horizontal
```

## Inversión 1 — `<html lang>` incorrecto (`dist/`, gitignorado, sin riesgo)

```
$ cp dist/en/de/index.html /tmp/en-de-index-backup-u13.html
$ sed -i 's#<html lang="en-US"#<html lang="es-ES"#' dist/en/de/index.html

$ npx vitest run tests/a11y-static.test.ts
FAIL ... > el <html lang> de cada página real coincide con su silo de interfaz
AssertionError: html lang incorrecto:
/en/de/index.html → lang="es-ES" (esperado "en-US")
Tests  1 failed | 1 passed (2)
```

Revertido:

```
$ cp /tmp/en-de-index-backup-u13.html dist/en/de/index.html
$ diff /tmp/en-de-index-backup-u13.html dist/en/de/index.html
IDÉNTICO tras revertir
$ npx vitest run tests/a11y-static.test.ts
Test Files  1 passed (1)
     Tests  2 passed (2)
```

## Inversión 2 — segundo `<h1>` real (`src/`, versionado)

Se agregó un segundo `<h1>` en la portada de curso
(`src/pages/[userLang]/[targetLang]/index.astro`, componente compartido
por los 6 cursos):

```
$ git diff --stat "src/pages/[userLang]/[targetLang]/index.astro"
(vacío — confirmado limpio antes de tocar)

$ npm run build
[build] 1042 page(s) built in 7.34s

$ npx vitest run tests/a11y-static.test.ts
FAIL ... > cada página de contenido real tiene exactamente un <h1>
AssertionError: páginas con más de un h1:
/en/de/index.html (2)
/es/de/index.html (2)
/es/en/index.html (2)
/es/fr/index.html (2)
/es/it/index.html (2)
/es/pt/index.html (2)
Tests  1 failed | 1 passed (2)
```

Revertido:

```
$ cp /tmp/course-index-backup-u13.astro "src/pages/[userLang]/[targetLang]/index.astro"
$ diff /tmp/course-index-backup-u13.astro "src/pages/[userLang]/[targetLang]/index.astro"
IDÉNTICO tras revertir
$ npm run build
[build] 1042 page(s) built in 8.61s
$ npx vitest run tests/a11y-static.test.ts
Test Files  1 passed (1)
     Tests  2 passed (2)
```

## Inversión 3 — desbordamiento horizontal real (`src/styles/global.css`, versionado)

Se agregó `min-width: 2000px` temporalmente a `.silo-layout`:

```
$ git diff --stat src/styles/global.css
(vacío — confirmado limpio antes de tocar)

$ npm run build
[build] 1042 page(s) built in 6.52s

$ nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
$ node .claude/skills/run-polylingua/driver.mjs check-overflow --port 4321
FALLÓ: Desbordamiento horizontal:
/es/de/ @ 360px: scrollWidth=2000 > clientWidth=360
/es/de/ @ 768px: scrollWidth=2000 > clientWidth=768
/es/de/ @ 1280px: scrollWidth=2000 > clientWidth=1280
/en/de/ @ 360px: scrollWidth=2000 > clientWidth=360
/en/de/ @ 768px: scrollWidth=2000 > clientWidth=768
/en/de/ @ 1280px: scrollWidth=2000 > clientWidth=1280
```

Revertido:

```
$ npx astro preview stop
$ cp /tmp/global-css-backup-u13.css src/styles/global.css
$ diff /tmp/global-css-backup-u13.css src/styles/global.css
IDÉNTICO tras revertir
$ npm run build
[build] 1042 page(s) built in 8.68s
$ nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
$ node .claude/skills/run-polylingua/driver.mjs check-overflow --port 4321
OK — 5 páginas × 3 anchos, sin desbordamiento horizontal
```

## Verificación completa (comandos separados)

```
$ npm run check
Result (171 files):
- 0 errors
- 0 warnings
- 126 hints

$ npm run build
[build] 1042 page(s) built in 8.93s

$ npm test
Test Files  24 passed (24)
     Tests  574 passed (574)
```

Servidor de preview parado y confirmado sin proceso ni puerto abierto al
terminar.
