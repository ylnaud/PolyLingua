# Evidencia — U-11 (repair engine, los dos caminos)

## Auditoría previa (por qué el alcance quedó reducido)

Verificación manual de la cobertura existente ANTES de implementar:
`tests/aislamiento-idioma.test.ts` ya tenía `'escenario 5 — los dos
caminos de reparación'`, probando `generateRepairSet` y
`repairTemplateFor`+`toRepairExercise` con un skill sintético inyectado
(`ponerGlosaDePrueba`), más escaneo de fuga de español ya extendido a
las 61 glosas reales de `explanation`/`translations[]`
(`tests/engine.test.ts`), más paridad de longitud
`translations.length === variations.length` (testeada dos veces). El
hueco real: nada corría las dos funciones con las 61 skills REALES y
escaneaba lo que de verdad devuelven, en vez del dato fuente.

## Hallazgo durante la implementación: fuga real en `sentence` (alemán)

Al escribir el escaneo real, la primera versión (que también revisaba
`ej.prompt`) encontró una fuga real y no relacionada con lo anterior:
17 de las 61 skills con glosa inglesa (60 de sus variaciones) llevan
pistas gramaticales en **español** dentro del campo `sentence`
—**alemán**, nunca traducido por `userLang`—, del tipo:

```
'Das Buch liegt auf ___ Tisch. (der, está quieto)'
```

Contado sobre las 253 skills totales de `REPAIR_TEMPLATES` (no solo las
61 con glosa inglesa), son 125 skills / 327 sentence — la mayoría
todavía sin alcance en producción porque no tienen curso `en-de` que
las dispare hoy, pero **17/60 sí están vivas** en el silo inglés.

Decisión del usuario (confirmada explícitamente): no traducir ahora —
es trabajo de contenido grande, fuera de esta unidad. Cerrar U-11
documentando la deuda con un candado que fija el número actual, para
que no crezca en silencio.

## Corrida exitosa

```
$ npx vitest run tests/aislamiento-idioma.test.ts
Test Files  1 passed (1)
     Tests  45 passed (45)
```

(3 tests nuevos: los dos de escenario 8 + el de deuda conocida.)

## Inversión 1 — escenario 8 (explanation/translation, las que SÍ deben estar limpias)

Se inyectó temporalmente español en la glosa real de
`de.a1.wordorder.basic` (`REPAIR_GLOSSES.en`):

```
$ git diff --stat src/lib/engine/exerciseGenerator.ts
(vacío — confirmado limpio antes de tocar)

'The conjugated verb...' → 'El verbo conjugado ocupa la segunda posición de la frase. What comes first...'

$ npx vitest run tests/aislamiento-idioma.test.ts
FAIL ... > escenario 8 ... > repairTemplateFor + toRepairExercise (DrillTutor) no filtra español en ninguna de las 61
AssertionError: de.a1.wordorder.basic[0]: explanation: expected [ 'El', 'El', ... ] to be null
Tests 3 failed | 42 passed (45)
```

(Cazado por 3 tests: los dos nuevos de escenario 8 más el escaneo
preexistente de la tanda A1 — confirma que no hay solapamiento
accidental, se refuerzan.)

Revertido con `git checkout --`, `diff` idéntico, retest → `45/45`.

## Inversión 2 — candado de deuda conocida (simula un arreglo parcial)

Se quitó la pista en español de UNA sola sentence real (de las 60), sin
tocar las demás:

```
'Ich gehe in ___ Park. (der, hay movimiento)' → 'Ich gehe in ___ Park.'

$ npx vitest run tests/aislamiento-idioma.test.ts
FAIL ... > deuda conocida ... > hoy son exactamente 17 skills (60 sentence)
AssertionError: expected 59 to be 60
Tests 1 failed | 44 passed (45)
```

Confirma que el candado también reacciona a una MEJORA no reflejada en
el número — exactamente el comportamiento buscado ("si baja, hay que
bajar el número acá"). Revertido con `git checkout --`, `diff`
idéntico, retest → `45/45`.

## Ronda 1: FAIL del Critic, y la corrección

El Critic de la ronda 1 recontó de forma independiente con su propio
script — la misma regex del candado más una sola palabra española
inequívoca, `la` — y encontró que sin ella se dejaban pasar dos fugas
reales:

```
builderCount: 60
extendedCount: 62
only in extended (la/un added):
  de.a2.time.past-future[5]: "___ Woche war ich krank. (la semana pasada)"
  de.c2.idiom.prepositional[0]: "___ Anhieb hat es geklappt. (a la primera)"
```

Confirmado además que agregar `la` no introduce ningún falso positivo
nuevo en las 61 skills reales. Corrección aplicada: `la` agregada a la
regex `marcas` en las dos copias de esta unidad (`escenario 8` y `deuda
conocida`), número esperado actualizado de 60 a 62.

```
$ npx vitest run tests/aislamiento-idioma.test.ts
Test Files  1 passed (1)
     Tests  45 passed (45)
```

## Verificación completa tras la corrección (comandos separados)

```
$ npm run check
Result (169 files):
- 0 errors
- 0 warnings
- 126 hints

$ npm run build
[build] 1042 page(s) built in 9.41s

$ npm test
Test Files  22 passed (22)
     Tests  564 passed (564)
```
