# Evidencia — U-07 (B1 `en→de` de punta a punta)

Salida cruda, comandos separados (no encadenados), tal como exige el
Gauntlet.

## Corrida exitosa

```
$ npm run build
[build] 1042 page(s) built in 11.65s
[build] Complete!

$ pkill -f "astro preview" 2>/dev/null   # comando propio
$ nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
$ curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/en/de/b1/relative-clauses/
200

$ node .claude/skills/run-polylingua/driver.mjs smoke-en-b1 --port 4321 --out /tmp/smoke-en-b1.png
OK — You got 12 / 17
Ítems respondidos (incluido el de refuerzo insertado): 17
Texto del bucle de refuerzo: "The relative pronoun takes its GENDER from the noun it refers to, but its CASE from its function inside the clause: der Mann, der hier arbeitet (subject) versus der Mann, den ich sehe (object)."
Captura guardada en /tmp/smoke-en-b1.png
```

Comparación byte a byte contra `REPAIR_GLOSSES.en['de.b1.clause.relative'].explanation`
(`src/lib/engine/exerciseGenerator.ts:725-727`): comparación con Python
(`source == captured`) → `IDENTICAL`.

Re-confirmación de que `smoke`, `smoke-en` y `smoke-en-a2` no cambiaron,
corridos por separado en el mismo servidor:

```
$ node .claude/skills/run-polylingua/driver.mjs smoke --port 4321
OK — Acertaste 7 / 10

$ node .claude/skills/run-polylingua/driver.mjs smoke-en --port 4321
OK — You got 14 / 20
Texto del bucle de refuerzo: "Regular present: drop the -en from the infinitive..."

$ node .claude/skills/run-polylingua/driver.mjs smoke-en-a2 --port 4321
OK — You got 14 / 20
Texto del bucle de refuerzo: "Modal verbs are irregular in the singular..."
```

## Inversión

Se quitaron temporalmente las dos entradas de `REPAIR_GLOSSES.en` que usa
`relative-clauses` (`de.b1.clause.relative` y `de.b1.wordorder.subordinate`
— las dos habilidades de la lección, no solo la primera, porque
`habilidadReforzable()` cae a la segunda skill con plantilla si solo falta
la primera, comportamiento ya confirmado de forma independiente por el
Critic en U-05 y U-06).

```
$ git diff --stat src/lib/engine/exerciseGenerator.ts
 src/lib/engine/exerciseGenerator.ts | 26 --------------------------
 1 file changed, 26 deletions(-)

$ npm run build
[build] 1042 page(s) built in 11.65s

$ nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
$ node .claude/skills/run-polylingua/driver.mjs smoke-en-b1 --port 4321
FALLÓ: El bucle de refuerzo no insertó ningún aviso (.drill-tip) tras la respuesta incorrecta.
```

Revertido:

```
$ npx astro preview stop
$ git checkout -- src/lib/engine/exerciseGenerator.ts
$ diff /tmp/exerciseGenerator-backup-u07.ts src/lib/engine/exerciseGenerator.ts
IDÉNTICO tras revertir
$ git status --short src/lib/engine/exerciseGenerator.ts
(vacío)
```

Reconstruido y vuelto a correr, resultado exacto original:

```
$ npm run build
[build] 1042 page(s) built in 11.31s

$ nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
$ node .claude/skills/run-polylingua/driver.mjs smoke-en-b1 --port 4321
OK — You got 12 / 17
Ítems respondidos (incluido el de refuerzo insertado): 17
Texto del bucle de refuerzo: "The relative pronoun takes its GENDER from the noun it refers to, but its CASE from its function inside the clause: der Mann, der hier arbeitet (subject) versus der Mann, den ich sehe (object)."
```

## Verificación completa (comandos separados)

```
$ npm run check
Result (168 files):
- 0 errors
- 0 warnings
- 126 hints

$ npm run build
[build] 1042 page(s) built in 11.58s

$ npm test
Test Files  21 passed (21)
     Tests  550 passed (550)
```

Servidor de preview parado y confirmado sin proceso ni puerto abierto al
terminar.
