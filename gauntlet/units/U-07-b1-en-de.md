# U-07 · B1 `en→de` de punta a punta

- **Estado**: `PASS` — cerrada en ronda 1, con evidencia de ejecución real y comparación byte a byte
- **Tipo**: `automático + navegador`
- **Depende de**: U-02 (glosas de refuerzo A2–C2 para `en-de`)

## Objetivo

La misma prueba de punta a punta que U-05 y U-06, dos niveles más arriba:
una sesión completa de una lección B1 `en→de` funciona de principio a fin
en un navegador real, y el bucle de refuerzo (DrillTutor) se dispara con
una respuesta incorrecta y muestra texto en inglés real de nivel B1.

## Por qué hacía falta

U-05 y U-06 probaron A1 y A2, ambas veces con una skill de morfología
verbal. De las 13 glosas B1 que añadió U-02, ninguna se había visto
disparar en un navegador real — quedaban verificadas solo por lectura de
código y por los tests de `vitest` sobre el mapa en memoria.

## Archivos afectados

- `.claude/skills/run-polylingua/driver.mjs` — se agregó `runSmokeEnB1`
  (wrapper de una línea sobre el helper genérico `runSmokeEnLesson`,
  reusado sin cambios desde U-06) y el comando CLI `smoke-en-b1`. Sin
  cambios de comportamiento en `smoke`, `smoke-en` ni `smoke-en-a2`.
- Ningún archivo de `src/` quedó tocado: el flujo no encontró ningún
  defecto que reparar.

## Lección de prueba: `relative-clauses`

Skills: `de.b1.clause.relative` (primera, con glosa B1 en inglés) y
`de.b1.wordorder.subordinate`. Elegida en vez de otra candidata igual de
válida (`indirect-questions`, misma estructura) para diversificar el tipo
de skill probada por el smoke suite: U-05 y U-06 probaron morfología
verbal (`verb.present-regular`, `verb.modal`); `clause.relative` es
cualitativamente distinta — su plantilla depende de dos condiciones
simultáneas (género heredado del sustantivo + caso de la función dentro
de la cláusula), con más superficie real para que un byte-a-byte falle si
la glosa se edita mal en el futuro.

## Criterio de aceptación

1. El driver abre `/en/de/b1/relative-clauses/` con `userLang=en`
   sembrado.
2. Responde el primer ítem **mal a propósito** (`de.b1.clause.relative`,
   primer skill de la lección, con glosa B1 en inglés) y confirma que
   aparece `.drill-tip p` con el texto exacto de
   `REPAIR_GLOSSES.en['de.b1.clause.relative'].explanation`.
3. Responde el resto de la sesión y llega al estado "terminado"
   (`[data-score-text]` con contenido).
4. Cero errores de consola (`pageerror`) durante todo el flujo.
5. Salida cruda de la corrida guardada como evidencia.
6. `npm run check`, `npm run build`, `npm test` en verde.

## Cómo se prueba

```bash
npm run build
pkill -f "astro preview" 2>/dev/null   # como comando propio, no encadenado
nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
sleep 3
node .claude/skills/run-polylingua/driver.mjs smoke-en-b1 --port 4321 --out /tmp/smoke-en-b1.png
npx astro preview stop
```

## Resultado real

Salida cruda completa en
[`../evidence/U-07-smoke-en.md`](../evidence/U-07-smoke-en.md):

```
OK — You got 12 / 17
Ítems respondidos (incluido el de refuerzo insertado): 17
Texto del bucle de refuerzo: "The relative pronoun takes its GENDER from the noun it refers to, but its CASE from its function inside the clause: der Mann, der hier arbeitet (subject) versus der Mann, den ich sehe (object)."
```

El texto coincide exactamente, carácter por carácter, con
`REPAIR_GLOSSES.en['de.b1.clause.relative'].explanation` en
`src/lib/engine/exerciseGenerator.ts` — confirmado por comparación
directa de string, no una aproximación.

**Sobre el puntaje (12/17, no perfecto):** mismo motivo ya documentado en
U-05 y U-06 — `answerItem` clickea la primera opción de `choice`, no
necesariamente la correcta. No es un defecto de esta unidad.

## Inversión

Salida cruda en el mismo archivo de evidencia. Se quitaron temporalmente
`de.b1.clause.relative` y `de.b1.wordorder.subordinate` (las dos
habilidades de `relative-clauses`) de `REPAIR_GLOSSES.en` — las dos, no
solo la primera, porque `habilidadReforzable()` cae a la segunda skill de
la lección si solo falta la primera. Reconstruido, `smoke-en-b1` falló
exactamente donde debía:

```
FALLÓ: El bucle de refuerzo no insertó ningún aviso (.drill-tip) tras la respuesta incorrecta.
```

Esta inversión prueba algo real y no cosmético: `de.b1.wordorder.subordinate`
no es exclusiva de `relative-clauses` — la comparten `subordinate-clauses`,
`purpose-clauses` e `indirect-questions`. Si un futuro edit rompiera por
accidente esa entrada compartida, silenciaría el bucle de refuerzo en
cuatro lecciones B1 a la vez sin ningún error de build (`repairTemplateFor`
simplemente devuelve `undefined`, sin lanzar) — un modo de fallo silencioso
que solo un navegador real detecta.

Revertido con `git checkout -- src/lib/engine/exerciseGenerator.ts` (diff
vacío confirmado con `diff` contra una copia de respaldo previa),
reconstruido, y `smoke-en-b1` vuelve al resultado exacto de antes.
`smoke`, `smoke-en` y `smoke-en-a2` se corrieron también tras el revert
para confirmar que no se rompió nada — sin cambios.

## Falsos positivos

Ninguno encontrado.

## Límites declarados

- **Una sola lección, un solo skill probado directamente** —
  `de.b1.clause.relative`. No recorre las 12 lecciones de `en-de/b1` ni
  las 13 habilidades con glosa B1. `de.b1.wordorder.subordinate` queda
  probada solo como fallback compartido en la inversión, no como objetivo
  primario de esta unidad. Mismo alcance que U-05 y U-06 declararon para
  A1 y A2.
- **No cubre los otros 4 `kind` de ejercicio en el camino de refuerzo**,
  solo `choice` para forzar el fallo — mismo límite heredado de
  `answerItemWrong`.
- **No verifica `data-skill-catalog` ni el JSON-LD** — fuera de alcance,
  igual que en U-05 y U-06.
- **El puntaje final no es perfecto (12/17)**, por la misma simplificación
  ya documentada y aceptada en U-05 y U-06.

## Veredicto del Critic

Sin bloqueo, en el primer intento. Pegado literal:

---

# U-07 CRITIC — RONDA 1

## VEREDICTO

PASS

## EVIDENCIA

Nota de entorno: el aviso de "modo plan" resultó ser falso positivo,
confirmado empíricamente (igual que en U-01/U-03/U-04/U-06) — `npm run
check`, `npm run build`, ediciones de archivo y `git checkout` se
ejecutaron sin restricción real.

**Suite completa, comandos separados**: `npm run check` → `0 errors, 0
warnings, 126 hints`. `npm run build` → `1042 page(s) built in 12.04s`.
`npm test` → `Test Files 21 passed (21)` / `Tests 550 passed (550)`.

**Servidor de preview real levantado por el Critic** (pid propio
confirmado), `curl` a `/en/de/b1/relative-clauses/` → `200`.

**`smoke-en-b1` corrido de primera mano**:

```
OK — You got 12 / 17
Ítems respondidos (incluido el de refuerzo insertado): 17
Texto del bucle de refuerzo: "The relative pronoun takes its GENDER from the noun it refers to, but its CASE from its function inside the clause: der Mann, der hier arbeitet (subject) versus der Mann, den ich sehe (object)."
```

Coincide exactamente con lo declarado.

**Comparación byte a byte independiente** (script Python propio, no la
afirmación del Builder): extraído `REPAIR_GLOSSES.en['de.b1.clause.relative'].explanation`
directo del código fuente con regex propio, comparado contra el string
capturado por el driver → `IDENTICAL`.

**Lección verificada directamente**: `relative-clauses.md` tiene
`skills: [de.b1.clause.relative, de.b1.wordorder.subordinate]` en ese
orden — confirma que la primera skill es la probada.

**Regresión de los tres comandos previos**, corridos por separado:
`smoke` → `7/10`; `smoke-en` → `14/20` con texto de
`de.a1.verb.present-regular`; `smoke-en-a2` → `14/20` con texto de
`de.a2.verb.modal`. Los tres iguales a U-04/U-05/U-06.

**`driver.mjs` leído completo**: el diff es puramente aditivo — un
wrapper de una línea, un `else if` que agrega `'smoke-en-b1'` sin tocar
la lógica de `smoke-en`/`smoke-en-a2`, y una línea del mensaje de uso.

**Inversión propia, distinta a la del Builder**: el Builder quitó ambas
skills de la lección; el Critic probó quitar SOLO
`de.b1.wordorder.subordinate`, dejando `de.b1.clause.relative` intacta.
Con `git status` limpio confirmado antes, backup guardado, edición con
script propio (verificada línea por línea con `git diff`), reconstruido,
`smoke-en-b1` dio el mismo resultado exacto (`12/17`, mismo texto) —
confirma que el ítem 1 usa `de.b1.clause.relative` y que remover la
segunda skill no la afecta. Revertido (`git checkout --`), `diff` contra
el backup → `IDÉNTICO`, reconstruido de nuevo, los cuatro comandos smoke
volvieron a sus resultados exactos. Confirmó además con `grep` que
`de.b1.wordorder.subordinate` aparece en las 4 lecciones que la ficha
declara como dependientes.

**Servidor de preview detenido y confirmado**: sin proceso ni puerto
abierto al terminar.

**`git status --short` final**: `src/` completamente limpio.
`.claude/agents/planner.md` sigue sin trackear, ajeno al alcance de
U-07.

## DEFECTOS ENCONTRADOS

NINGUNO.

## REGRESIONES

Ninguna. `smoke`, `smoke-en` y `smoke-en-a2` re-ejecutados antes y
después de la inversión propia, coinciden byte a byte con lo documentado
en U-05 y U-06. El diff de `driver.mjs` es puramente aditivo.

## CONCLUSIÓN

Todos los criterios de aceptación verificados con ejecución real, de
primera mano, más una inversión propia distinta de la del Builder
(eliminar solo la skill secundaria compartida entre cuatro lecciones B1)
que confirma que el camino primario de refuerzo no depende de ella. No se
encontró ninguna discrepancia entre lo declarado y lo reproducido.
Repositorio limpio salvo los archivos declarados por la unidad.

---
