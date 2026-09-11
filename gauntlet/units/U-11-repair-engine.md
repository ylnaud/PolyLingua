# U-11 · Repair engine (los dos caminos)

- **Estado**: `PASS` — `FAIL` en ronda 1 (el propio candado de la deuda subcontaba), reparado y `PASS` en ronda 2, con evidencia de ejecución real
- **Tipo**: `automático`
- **Depende de**: —

## Objetivo declarado (antes de auditar)

`INDEX.md` pedía: sin caída de idioma entre glosas, por los dos caminos
(DrillTutor y reparación intensiva de `practicar`).

## Auditoría previa: la mayor parte ya estaba cerrada

Antes de implementar, verificación manual de la cobertura existente en
`tests/aislamiento-idioma.test.ts` y `tests/engine.test.ts`. Resultado:
ya había un `'escenario 5 — los dos caminos de reparación'` probando
`generateRepairSet` (practicar) y `repairTemplateFor`+`toRepairExercise`
(DrillTutor) con un skill sintético inyectado, más escaneo de fuga de
español ya extendido a las 61 glosas reales, más paridad de longitud
`translations.length === variations.length`.

**El hueco real**: nada corría las dos funciones con las **61 skills
reales** y escaneaba lo que de verdad **devuelven** — todo lo anterior
escaneaba el dato fuente (`REPAIR_GLOSSES.en` directamente) o probaba el
mecanismo con un solo skill de prueba.

## Hallazgo durante la implementación: una deuda real, distinta

Al escribir el escaneo real se encontró que **17 de las 61 skills con
glosa inglesa** (62 de sus variaciones) llevan pistas gramaticales en
**español** dentro del campo `sentence` —el lado **alemán**, que
`repairTemplateFor()` nunca traduce por `userLang` a propósito, porque
es la frase que se está aprendiendo—, del tipo:

```
'Das Buch liegt auf ___ Tisch. (der, está quieto)'
```

Un alumno angloparlante ve esa pista tal cual. Es una fuga real, pero de
un tipo distinto al que el resto de la suite ya cazaba (que vigila
`explanation`/`translation`, el lado que sí se traduce). Consultado
explícitamente al usuario cómo seguir: **decisión confirmada —
documentar como deuda conocida con un candado que fija el número actual,
sin traducir ahora** (trabajo de contenido grande, fuera de esta
unidad).

## Archivos afectados

- `tests/aislamiento-idioma.test.ts` — `describe('escenario 8 — los dos
caminos con datos reales, no sintéticos')` (candado real, el objetivo
  original) y `describe('deuda conocida — pistas en español dentro de
sentence (alemán)')` (candado de la deuda encontrada).

Ningún archivo de `src/lib/` ni de contenido quedó tocado de forma
permanente — esta unidad es puramente de verificación y documentación.

## Criterio de aceptación

1. `generateRepairSet(skill, N, 'en')`, para las 61 skills reales con
   glosa inglesa, no devuelve `explanation` ni `translation` con marcas
   de español.
2. `repairTemplateFor(id, 'en')` + `toRepairExercise(...)`, para las
   mismas 61, tampoco.
3. La deuda conocida (pistas en español dentro de `sentence`) queda
   fijada en un número exacto — hoy 17 skills / 62 sentence — para que
   no crezca sin que alguien lo note y lo justifique en el mismo commit.
4. `npm run check`, `npm run build`, `npm test` en verde.

## Corrección tras el FAIL de la ronda 1

El Critic de la ronda 1 recontó de forma independiente (con su propio
script, la misma regex del candado más una sola palabra) y encontró que
la regex `marcas` omitía `la` — un artículo español inequívoco, sin
riesgo de falso positivo contra el alemán — lo que dejaba sin contar dos
fugas reales y completas:

- `de.a2.time.past-future[5]`: `'___ Woche war ich krank. (la semana pasada)'`
- `de.c2.idiom.prepositional[0]`: `'___ Anhieb hat es geklappt. (a la primera)'`

El número de skills (17) seguía siendo correcto — las dos fugas caían en
skills ya listadas —, pero el número de sentence estaba mal: 60 en vez
de 62. Se agregó `la` a la regex (en las dos copias de esta unidad,
`escenario 8` y `deuda conocida`; **no** se tocó la regex original de
U-01/U-02 en los otros archivos del repo, fuera del alcance de esta
unidad), se recontó, y el número correcto es **17 skills / 62 sentence**
— confirmado por el propio test, que ahora pasa con ese valor real, no
uno supuesto.

## Cómo se prueba

```bash
npx vitest run tests/aislamiento-idioma.test.ts
```

## Resultado real

Salida cruda completa en
[`../evidence/U-11-repair-engine.md`](../evidence/U-11-repair-engine.md):

```
Test Files  1 passed (1)
     Tests  45 passed (45)
```

## Inversión

Dos inversiones distintas, salida cruda en el archivo de evidencia:

| Defecto inyectado                                                     | Candado que lo cazó                                                         |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Español inyectado en la glosa real de `de.a1.wordorder.basic`         | escenario 8 (2 tests) + el escaneo preexistente de la tanda A1 (3 en total) |
| Se quitó la pista en español de UNA sentence real (simula un arreglo) | candado de deuda conocida — reacciona también a una mejora                  |

Los dos, revertidos con `git checkout --`, confirmados idénticos con
`diff`, vuelven a verde.

## Falsos positivos

Ninguno encontrado.

## Límites declarados

- **La deuda de las 17/62 sentence queda documentada, no resuelta.**
  Traducir las pistas al inglés es trabajo de contenido aparte —
  decisión explícita del usuario, no un olvido.
- **El escaneo real solo cubre las 61 skills con glosa inglesa hoy.** Si
  U-02 se extiende a más skills en el futuro, el candado las cubre
  automáticamente (itera `Object.keys(REPAIR_GLOSSES.en)`), pero no
  audita las 253 skills totales de `REPAIR_TEMPLATES` — solo las que de
  verdad son alcanzables hoy desde `en-de`.
- **No cubre navegador** — tipo `auto` según `INDEX.md`; que el DOM real
  pinte esto correctamente ya está cubierto indirectamente por U-05/U-06/
  U-07 (que verifican el texto exacto de `.drill-tip` para skills
  concretas, ninguna de las 17 con deuda).

## Veredicto del Critic

### Ronda 1 — FAIL

Pegado literal:

---

# U-11 CRITIC — RONDA 1

## VEREDICTO

FAIL

## EVIDENCIA

(resumen — ver `gauntlet/evidence/U-11-repair-engine.md` para el
recuento independiente completo)

Confirmó la auditoría previa (escenario 5 usa un skill sintético, no
real) y la lectura de `repairTemplateFor`/`toRepairExercise`. Recontó
de forma independiente con su propia copia de la regex más la palabra
`la` — hallazgo: dos fugas reales sin contar
(`de.a2.time.past-future[5]`, `de.c2.idiom.prepositional[0]`), sin
falsos positivos nuevos sobre las 61 reales.

## DEFECTOS ENCONTRADOS

El criterio de aceptación #3 y el test de deuda conocida fijaban "17
skills / 60 sentence" — el número real de sentence es 62, no 60. La
regex `marcas` omitía `la` (palabra española inequívoca).

## CONCLUSIÓN

Mecánica sólida (hallazgo cualitativo real, escenario 8 correcto,
alcance bien acotado), pero el número exacto que el criterio de
aceptación promete no se cumple tal como está. Corregible, no cerrado.

---

### Ronda 2 — tras corregir la regex (agregar `la`, recontar, actualizar 60→62)

Pegado literal:

---

# U-11 CRITIC — RONDA 2

## VEREDICTO

PASS

## EVIDENCIA

**Confirmación de la corrección en el código de test** (no en la
narrativa): `escenario 8` y `deuda conocida` incluyen `la` en la regex
`marcas`; `expect(sentencesConFuga).toBe(62)` — no 60. `git diff` de
`tests/aislamiento-idioma.test.ts` e `INDEX.md`: limpio, solo agrega lo
declarado.

**Recuento independiente** (script propio, escrito de cero, no reusa el
del Builder ni el de la ronda 1): `skillsWithLeak.length = 17`,
`sentenceCount = 62` — coincide. Confirmadas las cadenas exactas de las
dos fugas que motivaron el FAIL de ronda 1.

**Chequeo de falsos positivos** por agregar `la`: `\bla\b` en las 61
skills reales da 6 hits, todos dentro de pistas en español legítimas ya
justificadas. Probadas palabras alemanas plausibles con "la" como
substring (`Klasse`, `klar`, `Plan`, `Glas`, `Labor`, `Land`, `lang`,
`langsam`, `laufen`, `lassen`, `las`, `laut`) — ninguna matchea `\bla\b`.

**Verificación completa** (comandos separados): `npm run check` → `0
errors`. `npm run build` → `1042 páginas`. `npm test` → `564 passed
(564)`. `npx vitest run tests/aislamiento-idioma.test.ts` → `45/45`.

**Inversión propia de esta ronda**: inyectó una pista con
específicamente la palabra `la` en `de.a1.wordorder.time-verb-subject`
(skill fuera de la lista de 17). El candado corregido la detectó
(aparece como 18ª entrada); confirmado que sin la corrección de ronda 1
esta fuga habría pasado desapercibida (no contiene ninguna otra marca).
Revertido, `diff` idéntico, retest → `45/45`.

**Estado final**: limpio salvo los archivos declarados de la unidad.

## DEFECTOS ENCONTRADOS

NINGUNO. El defecto de ronda 1 está corregido, verificado con recuento
propio e independiente.

## REGRESIONES

Ninguna. `npm test` completo sigue en verde, incluyendo
`tests/engine.test.ts` (regex distinta, fuera de alcance, confirmado no
tocada).

## CONCLUSIÓN

La corrección aplicada tras el FAIL de ronda 1 es correcta y está
verificada de primera mano, no solo citada. El script independiente
recontó 17 skills / 62 sentence contra los datos reales, coincidiendo
exactamente. Confirmado que `la` no introduce falsos positivos. La
inversión propia de esta ronda demuestra que el candado corregido
detecta este tipo específico de fuga. U-11 cumple su criterio de
aceptación con evidencia de ejecución real.

---
