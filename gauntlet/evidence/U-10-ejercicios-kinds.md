# Evidencia — U-10 (los cinco `kind` de ejercicio)

## Defecto real encontrado durante la auditoría previa

Al diseñar el candado de `___`, un barrido de las 975 `sentence` de
`fill-blank` reales del repo encontró 3 con 2-3 `___` en vez de uno:

```
$ node -e "... (script de auditoría) ..."
total fill-blank exercises: 975
con ___ distinto de 1: 3
   src/content/lessons/es-it/a1/saluti.md -> '___! ___ Marco. ___!'
   src/content/lessons/es-it/a1/saluti.md -> '___, come ___?'
   src/content/lessons/es-pt/a1/saudacoes.md -> '___! Meu nome é Ana. ___!'
```

`Practice.astro` (`splitSentence()`) solo convierte el PRIMER `___` en el
input real; los demás quedan como texto literal — confirmado leyendo el
componente, no asumido. Corregidos los 3 (ver el commit de esta unidad
para el diff exacto), reconfirmado con el mismo script:

```
total fill-blank exercises: 975
con ___ distinto de 1: 0
```

## Corrida exitosa — candado automático

```
$ npx vitest run tests/data-integrity.test.ts
Test Files  1 passed (1)
     Tests  32 passed (32)
```

## Inversión 1 — candado automático (`___` duplicado)

Se reinyectó temporalmente el segundo `___` en `saudacoes.md` (ya
corregido) para confirmar que el candado nuevo lo detecta:

```
$ npx vitest run tests/data-integrity.test.ts
FAIL ... > cada fill-blank lleva exactamente un ___
AssertionError: fill-blank con un número de huecos distinto de 1:
es-pt/a1/saudacoes.md: '___! Meu nome é Ana. ___!' (2 huecos)
Test Files  1 failed (1)
     Tests  1 failed | 31 passed (32)
```

Revertido con `cp` desde backup, `diff` idéntico, retest → `32/32`.

## Corrida exitosa — candado de navegador

```
$ npm run build
[build] 1042 page(s) built in 27.12s

$ nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
$ curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/es/de/a1/presente-verbos/
200

$ node .claude/skills/run-polylingua/driver.mjs smoke-kinds --port 4321 --out /tmp/smoke-kinds.png
OK — Acertaste 8 / 10
Kinds vistos: choice, fill-blank, match, order, write
```

Re-confirmación de que `smoke`, `smoke-en`, `smoke-en-a2` y `smoke-en-b1`
no cambiaron, corridos por separado en el mismo servidor:

```
$ node .claude/skills/run-polylingua/driver.mjs smoke --port 4321
OK — Acertaste 7 / 10

$ node .claude/skills/run-polylingua/driver.mjs smoke-en --port 4321
OK — You got 14 / 20

$ node .claude/skills/run-polylingua/driver.mjs smoke-en-a2 --port 4321
OK — You got 14 / 20

$ node .claude/skills/run-polylingua/driver.mjs smoke-en-b1 --port 4321
OK — You got 12 / 17
```

## Inversión 2 — candado de navegador

Se cambió temporalmente el único ejercicio `write` de `presente-verbos.md`
a `fill-blank` (contenido real, versionado; backup guardado antes):

```
$ git diff --stat src/content/lessons/es-de/a1/presente-verbos.md
(vacío — confirmado limpio antes de tocar)

$ npm run build
[build] 1042 page(s) built in 9.84s

$ nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
$ node .claude/skills/run-polylingua/driver.mjs smoke-kinds --port 4321
FALLÓ: La lección no pasó por estos kind: write
```

Revertido:

```
$ npx astro preview stop
$ cp /tmp/presente-verbos-backup-u10.md src/content/lessons/es-de/a1/presente-verbos.md
$ diff /tmp/presente-verbos-backup-u10.md src/content/lessons/es-de/a1/presente-verbos.md
IDÉNTICO tras revertir
```

Reconstruido y vuelto a correr, resultado exacto original:

```
$ npm run build
[build] 1042 page(s) built in 10.30s

$ nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
$ node .claude/skills/run-polylingua/driver.mjs smoke-kinds --port 4321
OK — Acertaste 8 / 10
Kinds vistos: choice, fill-blank, match, order, write
```

## Verificación completa (comandos separados)

```
$ npm run check
Result (169 files):
- 0 errors
- 0 warnings
- 126 hints

$ npm run build
[build] 1042 page(s) built in 9.21s

$ npm test
Test Files  22 passed (22)
     Tests  561 passed (561)
```

Servidor de preview parado y confirmado sin proceso ni puerto abierto al
terminar.
