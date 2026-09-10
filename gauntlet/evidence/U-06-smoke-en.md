# Evidencia — U-06 (A2 `en→de` de punta a punta)

Salida cruda, comandos separados (no encadenados), tal como exige el
Gauntlet.

## Corrida exitosa

```
$ npm run build
[build] 1042 page(s) built in 11.41s
[build] Complete!

$ pkill -f "astro preview" 2>/dev/null   # comando propio
$ nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
$ curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/en/de/a2/modal-verbs/
200

$ node .claude/skills/run-polylingua/driver.mjs smoke-en-a2 --port 4321 --out /tmp/smoke-en-a2.png
OK — You got 14 / 20
Ítems respondidos (incluido el de refuerzo insertado): 20
Texto del bucle de refuerzo: "Modal verbs are irregular in the singular: ich and er/sie/es take no ending and usually change the vowel (ich kann, ich muss, ich will). The plural is regular."
Captura guardada en /tmp/smoke-en-a2.png
```

Comparación byte a byte contra `REPAIR_GLOSSES.en['de.a2.verb.modal'].explanation`
(`src/lib/engine/exerciseGenerator.ts:518-519`):

```
$ diff /tmp/source-gloss-a2.txt /tmp/driver-captured-a2.txt
IDENTICAL
```

Re-confirmación de que `smoke` (es-de, sin tocar) no cambió:

```
$ node .claude/skills/run-polylingua/driver.mjs smoke --port 4321 --out /tmp/smoke.png
OK — Acertaste 7 / 10
```

## Inversión

Se quitaron temporalmente las dos entradas de `REPAIR_GLOSSES.en` que usa
`modal-verbs` (`de.a2.verb.modal` y `de.a2.wordorder.verb-final` — las dos
habilidades de la lección, igual que hizo el Builder de U-05, porque
quitar solo la primera hace que `habilidadReforzable()` caiga a la
segunda en vez de fallar).

```
$ git diff --stat src/lib/engine/exerciseGenerator.ts
 src/lib/engine/exerciseGenerator.ts | 26 --------------------------
 1 file changed, 26 deletions(-)

$ npm run build
[build] 1042 page(s) built in 11.03s

$ nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
$ node .claude/skills/run-polylingua/driver.mjs smoke-en-a2 --port 4321
FALLÓ: El bucle de refuerzo no insertó ningún aviso (.drill-tip) tras la respuesta incorrecta.
```

Revertido:

```
$ npx astro preview stop
$ git checkout -- src/lib/engine/exerciseGenerator.ts
$ diff /tmp/exerciseGenerator-backup.ts src/lib/engine/exerciseGenerator.ts
IDÉNTICO tras revertir
$ git status --short src/lib/engine/exerciseGenerator.ts
(vacío)
```

Reconstruido y vuelto a correr, resultado exacto original:

```
$ npm run build
[build] 1042 page(s) built in 11.49s

$ nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
$ node .claude/skills/run-polylingua/driver.mjs smoke-en-a2 --port 4321
OK — You got 14 / 20
Ítems respondidos (incluido el de refuerzo insertado): 20
Texto del bucle de refuerzo: "Modal verbs are irregular in the singular: ich and er/sie/es take no ending and usually change the vowel (ich kann, ich muss, ich will). The plural is regular."
```

## Verificación completa (comandos separados)

```
$ npm run check
Result (168 files):
- 0 errors
- 0 warnings
- 126 hints

$ npm run build
[build] 1042 page(s) built in 11.52s

$ npm test
Test Files  21 passed (21)
     Tests  550 passed (550)
```

Servidor de preview parado y confirmado sin proceso ni puerto abierto al
terminar.
