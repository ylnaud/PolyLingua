# U-02 · Glosas de refuerzo A2–C2 para `en-de`

- **Estado**: `PASS` — cerrada en ronda 1 (reintento) del Critic, con evidencia de ejecución real
- **Tipo**: `automático + contenido`
- **Depende de**: —

## Objetivo

Toda habilidad alemana (`de.*`) con plantilla de refuerzo tiene su glosa en
inglés, no solo las 17 de A1. El bucle de refuerzo del silo inglés (`en-de`)
deja de apagarse en silencio para A2, B1, B2 y C1-C2.

## Archivos afectados

- `src/lib/engine/exerciseGenerator.ts` — 44 entradas nuevas en
  `REPAIR_GLOSSES.en` (A2 14, B1 13, B2 7, C1 8, C2 2), cada una con
  `explanation` y `translations[]` en inglés, paralela por índice a las
  `variations[]` de su `REPAIR_TEMPLATES` correspondiente.
- `tests/engine.test.ts` — el candado de conteo (17→61) actualizado, y uno
  nuevo: `translations[]` de las 61 (no solo las 17 de A1) tiene que tener el
  mismo largo que su `variations[]`.
- `tests/aislamiento-idioma.test.ts` — el bloque "tanda A1" pasó a filtrar
  por prefijo en vez de asumir que el mapa entero eran 17; `SIN` (la skill de
  ejemplo sin glosa) pasó de `de.a2.verb.perfekt` —que ahora SÍ tiene glosa—
  a `en.a1.verb.to-be`, que nunca la va a tener por arquitectura (no es
  `de.*`); se agregaron `masculino`/`femenino` a la regex de control con una
  exclusión documentada para el morfema alemán `-los`.

## Criterio de aceptación

1. `Object.keys(REPAIR_GLOSSES.en)` tiene longitud **61** (17 A1 + 44
   nuevas) y todos empiezan con `de.`.
2. Cada una de las 44 nuevas tiene un `skillId` real en `REPAIR_TEMPLATES`
   (`de.*`, nivel A2-C1 o C2).
3. **Correspondencia por índice**: para las 61 entradas —no solo las 17 de
   A1—, `translations.length === variations.length` de su plantilla, y cada
   elemento es un string no vacío.
4. Ninguna `explanation` ni `translation` en inglés lleva español evidente
   (tildes, ñ, ¿¡, o alguna de la lista de palabras exclusivas del español).
5. **Control de que la regex mide algo**: sobre las 61 explicaciones
   españolas originales, la regex de "esto es español" tiene que marcarlas
   **todas**. Sin este control, una regex rota pasaría el candado de arriba
   sin detectar nada.
6. `npm run check`, `npm run build`, `npm test` en verde.

## Cómo se prueba

```bash
npm run check
npm run build
npm test
npx vitest run tests/engine.test.ts
npx vitest run tests/aislamiento-idioma.test.ts
```

## Inversión

Salida cruda completa en
[`../evidence/U-02-inversion.md`](../evidence/U-02-inversion.md). Dos
defectos, cada uno inyectado y revertido por separado:

| Defecto inyectado                                                                       | Test que lo cazó                                      | Mensaje                                                |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| Se borró la entrada `de.c2.idiom.prepositional` entera (61→60)                          | `el mapa lleva de.* completo (A1-C2)…`                | `expected […60] to have a length of 61 but got 60`     |
| Se quitó la última `translation` de `de.a2.verb.perfekt` (8→7, `variations` sigue en 8) | `cada translations[] de las 61 tiene el mismo largo…` | `de.a2.verb.perfekt: 7 translations para 8 variations` |

Los dos, revertidos byte a byte, vuelven a verde (`git diff --check` limpio
después de cada revert). El segundo defecto es el que de verdad importa:
demuestra que el candado nuevo (no solo el de conteo) detecta un array
desplazado o corto en cualquiera de las 61, no solo en las 17 de A1.

## Falsos positivos

| Caso                                                                          | Evidencia                                                                                                                                                                            | Cómo se trata                                                                                                                                                                          |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `masculino`/`femenino` faltaban en la regex de control                        | `de.b2.preposition.genitiv` —explicación española sin tilde, ñ ni ninguna palabra de la lista vieja— pasaba el control invertido sin que la regex la marcara (60/61 en vez de 61/61) | Se agregaron las dos palabras a la lista, documentado en el comentario del test                                                                                                        |
| `-los` (sufijo alemán, hoffnungslos) confundido con el artículo español «los» | La glosa de `de.c1.wordformation.affixes` explica el sufijo `-los`; con `masculino`/`femenino` agregadas la regex marcaba esa ocurrencia como español                                | Igual que el mismo caso ya documentado en el detector de U-01 (`tests/lib/spanish-scan.ts`): se acota con `(?<!-)` — un `los` sin guion antes sigue detectándose, el morfema alemán no |

## Límites declarados

- **No cubre `en.*`, `fr.*`, `it.*` ni `pt.*`.** Solo `de.*` tiene curso con
  interfaz inglesa (`en-de`); los demás targetLang no tienen — ni van a
  tener bajo la arquitectura actual — una glosa en inglés que tenga sentido
  publicar.
- **No valida que la traducción al inglés sea la MEJOR posible**, solo que
  exista, tenga la forma esperada por índice y no filtre español. La calidad
  pedagógica del inglés es revisión de contenido, no un candado automático.
- **No hay verificación de navegador** (DrillTutor, `/practicar` en inglés
  mostrando de verdad las 44 nuevas): esta unidad es `automático + contenido`,
  no `+ navegador`. Si hace falta esa capa, es una unidad aparte o una
  ampliación del criterio.
- **`docs/LEARNING_ENGINE.md`** sigue con los dos datos fósiles ya
  encontrados en la ronda de inventario (línea 187: "470 lecciones sin
  habilidades"; líneas 194-196: "17 tienen plantilla" en vez de 253). No se
  tocan en esta unidad — quedan registrados como deuda documental aparte,
  como ya se había decidido.

## Veredicto del Critic

Primer intento quedó `BLOCKED`: el Critic verificó todo por lectura y con
scripts propios de solo lectura (números, correspondencia por índice,
exclusión de `los`, cambio de `SIN`, la inversión del Builder y una propia)
y muestreó a mano la calidad de 12 traducciones en los 5 niveles sin
encontrar ningún defecto — pero el harness le activó Plan Mode a mitad de
tarea y no pudo ejecutar `npm run check`/`build`/`test`. Se relanzó la misma
revisión; el reintento sí pudo ejecutar todo. Veredicto final, pegado
literal:

---

# U-02 CRITIC — RONDA 1

## VEREDICTO

PASS

## EVIDENCIA

**Comandos de aceptación #6, ejecutados por mí, completos, sin encadenar:**

```
$ npm run check
...
Result (166 files):
- 0 errors
- 0 warnings
- 126 hints
```

```
$ npm run build
...
12:40:37 ✓ Completed in 5.29s.
12:40:37 [build] ✓ Completed in 7.82s.
12:40:38 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
12:40:38 [build] 1042 page(s) built in 10.19s
12:40:38 [build] Complete!
```

```
$ npm test
 Test Files  19 passed (19)
      Tests  541 passed (541)
```

**Números verificados con mi propio script** (`tests/tmp-critic-verify.test.ts`, temporal, borrado después — `git status` confirma que no quedó rastro):

```
TOTAL_KEYS 61
ALL_DE_PREFIX true
TOTAL_TEMPLATES 253
MISSING_TEMPLATE []
MISMATCH []
EMPTY_STRINGS []
```

- 61 claves en `REPAIR_GLOSSES.en`, todas `de.*` — confirmado también contando bloques por nivel en el código fuente: A2=14, B1=13, B2=7, C1=8, C2=2 = 44 + 17 A1 = 61.
- Correspondencia 1:1 con `REPAIR_TEMPLATES`: 0 `skillId` sin plantilla real.
- `translations.length === variations.length` en las 61, no una muestra: 0 mismatches.
- 0 strings vacíos en ninguna de las 61.

**Regex de control (criterio 5)**: `originales = REPAIR_TEMPLATES.filter(t => REPAIR_GLOSSES.en[t.skillId])` captura las 61, y `expect(marcados.length).toBe(originales.length)` pasó dentro de la corrida completa.

**`SIN` y arquitectura**: `en.a1.verb.to-be` existe en `REPAIR_TEMPLATES` pero no tiene entrada en `REPAIR_GLOSSES.en` — coherente con que las 61 claves son exclusivamente `de.*`.

## CALIDAD DE TRADUCCIÓN (muestreo manual)

Revisé 8 entradas de las 44 nuevas, cubriendo los 5 niveles (64 traducciones en total), comparando cada `variation.sentence` con `___` reemplazado por `answer` contra su `translations[i]` correspondiente: A2 (`de.a2.verb.perfekt`, `de.a2.preposition.wechsel`), B1 (`de.b1.clause.relative`, `de.b1.verb.konjunktiv2`), B2 (`de.b2.preposition.genitiv`), C1 (`de.c1.wordformation.affixes`, `de.c1.verb.modal-subjective`), C2 (`de.c2.particle.modal`, `de.c2.idiom.prepositional`).

No encontré ningún desplazamiento de índice, ninguna traducción incorrecta, ninguna mezcla de idioma ni ningún hueco pedagógico en las 64 revisadas.

## DEFECTOS ENCONTRADOS

NINGUNO que invalide el criterio de aceptación. Dos observaciones no bloqueantes:

1. **Comentario colgante**: `tests/aislamiento-idioma.test.ts:30` decía "ver `tanda A2-C2` más abajo" — esa sección no existe en ningún archivo del repo. Cosmético.
2. **Cobertura de regex desigual**: el candado "sin español evidente" cubría las 61 `explanation` pero solo las 17 `translations[]` de A1 — las 44 nuevas no tenían ese candado automático (el Critic verificó a mano que el contenido estaba limpio, pero notó el hueco).

## REGRESIONES

No. `npm test` completo: 541/541 en 19 archivos. `git diff` solo toca los archivos declarados. El test eliminado ("todas son de A1") es obsolescencia esperada, reemplazado funcionalmente por `soloA1()` + el candado global de 61/`de.*`.

**Inversión propia del Critic** (distinta de las dos del Builder): inyectó español al final de la `explanation` de `de.b1.clause.indirect-question` (una de las 44 nuevas) → `ninguna glosa inglesa lleva español evidente` la cazó nombrando el archivo, la palabra y el contexto. Revertido byte a byte, confirmado con `git diff --check` limpio.

## CONCLUSIÓN

U-02 puede considerarse cerrada. Los 6 criterios verificados con salida real y propia, muestreo manual de 64 traducciones sin errores, e inversión propia confirmando que el candado protege también a las 44 nuevas.

---

### Reparación post-veredicto

Las dos observaciones no bloqueantes se corrigieron antes de dar la unidad
por cerrada del todo, ya que eran baratas y el propio Critic las señaló como
mejora pendiente (no como excusa para reabrir la ronda):

1. Comentario corregido en `tests/aislamiento-idioma.test.ts:29-33`, apunta
   ahora al describe real que existe.
2. Candado nuevo en `tests/engine.test.ts`: `ninguna translations[] de las
61 lleva español evidente` — mismo control invertido (sobre las 348
   `translation` originales, no solo las `explanation`), mismas exclusiones
   documentadas (`masculino`/`femenino`, `(?<!-)` para `los`). Cierra
   exactamente el hueco de cobertura que el Critic encontró para las 44 de
   A2-C2.

Verificado de nuevo tras estos dos cambios: `npm run check` (0 errores),
`npm run build` (1042 páginas), `npm test` (542/542, +1 por el candado
nuevo).
