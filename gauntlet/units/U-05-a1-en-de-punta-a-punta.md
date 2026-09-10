# U-05 · A1 `en→de` de punta a punta

- **Estado**: `PASS` — cerrada en ronda 1, con evidencia de ejecución real y comparación byte a byte
- **Tipo**: `automático + navegador`
- **Depende de**: —

## Objetivo

Una sesión completa de una lección A1 `en→de` — interfaz inglesa, target
alemán — funciona de principio a fin en un navegador real: se abre, se
responden los cinco tipos de ejercicio, se llega al estado "terminado", y
el bucle de refuerzo (DrillTutor) se dispara con una respuesta incorrecta y
muestra texto en inglés real, no vacío ni en español.

## Por qué hacía falta

Antes de esta unidad, **cero cobertura de navegador para el silo inglés**.
El único flujo de Playwright que existía (`driver.mjs`, comando `smoke`)
tiene la URL hardcodeada en `/es/de/a1/articulos-der-die-das/` — nunca toca
`/en/de/**`. La propia ficha de U-01 lo declara como límite explícito: "Lo
que el JS de cliente pinta en ejecución no se cubre... Es trabajo de U-10 y
de los checks de navegador". Esta unidad es exactamente ese check, acotado
al bucle de refuerzo A1 en-de (el resto del contenido dinámico —
`data-skill-catalog`, JSON-LD— sigue siendo trabajo de otra unidad).

## Archivos afectados

- `.claude/skills/run-polylingua/driver.mjs` — un flujo nuevo (`smoke-en` /
  `runSmokeEn`) reusando `launch`, `seedLocalStorage`, `answerItem` que ya
  existían, más un helper nuevo (`answerItemWrong`) para forzar una
  respuesta incorrecta a propósito.
- Ningún archivo de `src/` se tocó: el flujo no encontró ningún defecto que
  reparar (a diferencia de U-01, que sí encontró uno en su primera corrida).

## Criterio de aceptación

1. El driver abre `/en/de/a1/present-tense-regular-verbs/` con
   `userLang=en` sembrado (vía `seedLocalStorage`, ya existente).
2. Responde el primer ítem **mal a propósito** (`de.a1.verb.present-regular`,
   una habilidad con glosa A1 en inglés) y confirma que aparece el aviso
   del bucle de refuerzo (`.drill-tip p`) con el texto exacto de
   `REPAIR_GLOSSES.en['de.a1.verb.present-regular'].explanation`.
3. Responde el resto de la sesión (incluido el ejercicio de refuerzo
   insertado) y llega al estado "terminado" (`[data-score-text]` con
   contenido).
4. Cero errores de consola (`pageerror`) durante todo el flujo.
5. Salida cruda de la corrida guardada como evidencia.
6. `npm run check`, `npm run build` en verde (no aplica `npm test`: esto no
   es un archivo `vitest`, necesita un servidor real corriendo).

## Cómo se prueba

```bash
npm run build
pkill -f "astro preview" 2>/dev/null   # como comando propio, no encadenado
nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
sleep 3
node .claude/skills/run-polylingua/driver.mjs smoke-en --port 4321 --out /tmp/smoke-en.png
npx astro preview stop
```

## Resultado real

Salida cruda completa en
[`../evidence/U-05-smoke-en.md`](../evidence/U-05-smoke-en.md):

```
OK — You got 14 / 20
Ítems respondidos (incluido el de refuerzo insertado): 20
Texto del bucle de refuerzo: "Regular present: drop the -en from the infinitive and add the ending for the person — ich -e, du -st, er/sie/es -t, wir -en, ihr -t, sie/Sie -en."
```

El texto coincide exactamente, carácter por carácter, con
`REPAIR_GLOSSES.en['de.a1.verb.present-regular'].explanation` en
`src/lib/engine/exerciseGenerator.ts` — no es una aproximación.

**Sobre el puntaje (14/20, no perfecto):** es esperado, no un defecto. El
`answerItem` que ya existía (reusado de `smoke`) responde `choice` clicando
la **primera** opción visible, no necesariamente la correcta — la mayoría
de las preguntas de esta lección no tienen la respuesta correcta en el
primer lugar. Esa simplificación ya estaba en el flujo original (`smoke`,
que tampoco saca puntaje perfecto: 7/10). El objetivo de esta unidad no es
un puntaje perfecto, es que la sesión **complete** y que el bucle de
refuerzo se dispare con el idioma correcto — ambas cosas, confirmadas.

## Inversión

Salida cruda en el mismo archivo de evidencia. Se quitaron temporalmente
`de.a1.verb.present-regular` y `de.a1.wordorder.basic` (las dos habilidades
de esta lección) de `REPAIR_GLOSSES.en`, se reconstruyó, y `smoke-en` falló
exactamente donde debía:

```
FALLÓ: El bucle de refuerzo no insertó ningún aviso (.drill-tip) tras la respuesta incorrecta.
```

Revertido con `git checkout -- src/lib/engine/exerciseGenerator.ts` (diff
vacío confirmado), reconstruido, y `smoke-en` vuelve al resultado exacto de
antes. `smoke` (el flujo es-de original, sin tocar) se corrió también tras
el revert para confirmar que no se rompió nada — sigue en 7/10, sin
cambios.

## Falsos positivos

Ninguno encontrado. Una decisión de diseño: `answerItemWrong` solo
implementa el kind `choice` (lanza si se usa con otro) — es el único que
necesita esta unidad, y una respuesta "mal a propósito" genérica para los
otros cuatro kinds (`fill-blank`, `write`, `match`, `order`) no tiene una
forma obviamente correcta de implementarse sin inventar comportamiento
nuevo; se deja fuera en vez de forzarlo.

## Límites declarados

- **Una sola lección, un solo skill probado directamente.** No recorre las
  29 lecciones de `en-de/a1` ni las 17 habilidades con glosa A1 — es una
  prueba de punta a punta de UN camino real, no un barrido exhaustivo. Un
  barrido de las 29 sería otra unidad (o una ampliación de esta, fuera de
  alcance ahora).
- **No cubre los otros 4 `kind` de ejercicio en el camino de refuerzo**,
  solo `choice` para forzar el fallo. El resto de la sesión sí pasa por
  `fill-blank`/`write`/`match`/`order` normalmente (vía `answerItem`), pero
  el disparo intencional del bucle es solo con `choice`.
- **No verifica `data-skill-catalog` ni el JSON-LD en español** — límites
  ya declarados por U-01 como fuera de su alcance; siguen sin cobertura
  después de esta unidad también. Es trabajo de U-10.
- **El puntaje final no es perfecto (14/20)**, por una simplificación ya
  existente en `answerItem` (elige la primera opción de `choice`, no
  necesariamente la correcta) — no es un defecto de esta unidad, y no lo
  intenté arreglar porque `answerItem` es código compartido con `smoke` y
  tocarlo está fuera del alcance declarado.

## Veredicto del Critic

Sin bloqueo, en el primer intento. Pegado literal:

---

# U-05 CRITIC — RONDA 1

## VEREDICTO

PASS

## EVIDENCIA

**Flujo `smoke-en` corrido de punta a punta, comandos separados (no
encadenados)**: `npm run build` → `1042 page(s) built` / `Complete!`;
`astro preview` levantado como proceso propio; `curl` confirmó `200` en
`/en/de/a1/present-tense-regular-verbs/`; el driver dio
`OK — You got 14 / 20`, con el texto del bucle de refuerzo comparado
**byte a byte** contra el string real en `exerciseGenerator.ts` (líneas
361-363): `diff source-gloss.txt driver-captured.txt` → `IDENTICAL`.

**`driver.mjs` leído completo**: `answerItemWrong` clickea
`[data-option][data-correct="false"]`, cruzado contra `Practice.astro:184`
donde ese atributo sale de `oi === item.data.answerIndex`, no adivinado.
Sobre el riesgo de leer `.drill-tip` demasiado rápido: `reveal()` dispara
`practice-item-answered` **síncronamente** dentro del mismo handler de
click, y `DrillTutor` inserta el `.drill-tip` también síncronamente — el
`waitForTimeout(200)` es margen extra, no una carrera real.

**Segunda inversión, variante distinta a la del Builder**: quitó _solo_
`de.a1.verb.present-regular` (dejando `de.a1.wordorder.basic` intacta) —
al revés de lo que hizo el Builder (había quitado las dos). El bucle no
desapareció, cambió de habilidad: el texto capturado pasó a ser
exactamente el `explanation` de `de.a1.wordorder.basic`. Confirma que
`habilidadReforzable()` en `DrillTutor.astro` se comporta tal como
documenta la ficha — toma la primera habilidad de la lección con plantilla
localizada, no solo detecta "hay o no hay". Revertido con
`git checkout --`, confirmado vacío, reconstruido, vuelve al resultado
exacto original.

**Puntaje 14/20 confirmado como no-defecto**: `answerItem` para `choice`
clickea la primera opción sin mirar `data-correct` — leído en el código,
no asumido.

**`smoke` (es-de) sin regresión**: corrido tras cada revert, sigue en
`7 / 10`.

**Comandos completos**: `npm run check` (0 errores), `npm run build`
(1042 páginas), `npm test` (550/550).

**`git status`/`git diff --stat` final**: exactamente lo declarado. U-04
sigue pendiente de commit, sin tocar. `git diff` de `exerciseGenerator.ts`
y de `src/content/lessons/` vacíos al terminar — las dos inversiones
quedaron completamente revertidas. Servidor de preview parado y
confirmado sin proceso ni puerto abierto.

## DEFECTOS ENCONTRADOS

NINGUNO

## REGRESIONES

No. `smoke` sin cambios, suite completa en verde, todo corrido de
primera mano.

## CONCLUSIÓN

U-05 puede cerrarse con `PASS`. Verificación de punta a punta con salida
propia, comparación byte a byte del texto de refuerzo, y una segunda
inversión con una variante distinta a la del Builder que confirma el
comportamiento real y documentado de `habilidadReforzable()`. Los límites
declarados en la ficha son honestos, no fallas ocultas.

---
