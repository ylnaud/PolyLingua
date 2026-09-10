# U-01 · Pureza de idioma del silo inglés

- **Estado**: `PASS` — cerrada en ronda 3 del Critic, con evidencia de ejecución real
- **Tipo**: `automático`
- **Depende de**: —

## Objetivo

Ninguna página de `/en/**` sirve texto español visible.

## Archivos afectados

- `tests/lib/spanish-scan.ts` — el detector (funciones puras)
- `tests/lang-purity.test.ts` — el candado
- `src/pages/[userLang]/[targetLang]/[level]/examen.astro` — defecto que el
  candado encontró solo, en su primera ejecución
- `src/components/RelatedLinks.astro`, `src/layouts/LessonLayout.astro`,
  `src/components/ScrollTopButton.astro`, `src/layouts/BaseLayout.astro` y
  `src/i18n/dictionary.ts` — los dos defectos que encontró el **Critic**, y que
  el candado no veía

## Por qué existe

El silo inglés se activó con el #164 y desde entonces el español se le ha colado
tres veces: la prosa SEO de `tsa.ts`, los widgets globales del header, y dos
literales en `/en/de/pronunciacion` encontrados a mano el mismo día que se
escribió esta unidad. Las tres veces lo encontró un barrido manual que se
escribía, se ejecutaba y se tiraba.

## Criterio de aceptación

1. Cero coincidencias de español visible en las páginas de `dist/en/`.
2. **Control de población**: el barrido ha leído más de 100 páginas. Sin esto,
   borrar `dist/en/` daría verde.
3. **Control invertido permanente**: la misma lista marca ≥ 400 páginas de
   `dist/es/`. Si la lista pierde capacidad de detección, este test se pone rojo
   aunque el silo inglés esté impecable.
4. **Sensibilidad contra fixtures**: 22 casos que no dependen del build.
5. **Segundo detector**: ninguna cadena del diccionario español se publica en
   `/en/`, y los nombres de nivel de `LEVELS` tampoco.
6. **Control por palabra**: 8 frases canario que el detector debe seguir
   marcando, una por grupo de la lista.
7. El mensaje de fallo nombra archivo, palabra y contexto.

## Cómo se prueba

```bash
npm run build
npx vitest run tests/lang-purity.test.ts
```

Resultado: **35 pasando**.

## Inversión — hecha, no prometida

Salida cruda en [`../evidence/U-01-inversion.md`](../evidence/U-01-inversion.md).

| Paso                                                                                               | Resultado                                                       |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Verde de partida (tras arreglar `examen.astro`)                                                    | 14 pasando                                                      |
| Se añade una frase española al cuerpo de `en-de/a1/present-tense-regular-verbs.md`, se reconstruye | **ROJO**, nombrando el archivo y las 6 palabras con su contexto |
| `git checkout --` sobre esa lección, se reconstruye                                                | 14 pasando otra vez                                             |

Y antes de todo eso, el candado ya se estrenó en rojo por su cuenta: en su primera
ejecución encontró **«Alemán» en las 6 páginas de examen del silo inglés**.
`examen.astro` calculaba `languageName` desde el diccionario y lo usaba bien en
el JSON-LD, pero la miga de pan visible tiraba de `LANGUAGE_MAP.name`, que guarda
una sola versión y es la española. La misma página decía «German» en sus datos
estructurados y «Alemán» en pantalla.

## Falsos positivos

| Caso                                   | Evidencia                                                                                                                                                                    | Cómo se trata                                                                                                           |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Español` (endónimo del selector)      | En **115/115** páginas inglesas. Un selector nombra cada opción en su propio idioma, igual que «Deutsch»                                                                     | Se retira esa ocurrencia **y se cuenta**: el test exige exactamente una por página, así que una segunda vuelve a saltar |
| `los` como morfema alemán              | 19 apariciones, todas en B2 enseñando compuestos: «Arbeit (work) + los (-less) + igkeit»                                                                                     | Fuera de la lista, con el motivo escrito en `spanish-scan.ts`                                                           |
| Palabras inglesas y españolas a la vez | `general` y `plural` se marcaron como español por error durante el desarrollo del curso                                                                                      | Fuera de la lista, y un test comprueba que no vuelvan                                                                   |
| Slugs de URL                           | **No es un falso positivo real**: viven en `href`, `class`, `id` y `data-*`, que el detector no mira                                                                         | No se excluye nada por ser slug. Lo que se acota es qué atributos se leen: los de texto sí, los de máquina no           |
| Español dentro de `<script>`           | Con esta lista, sin quitar los `<script>`: **1586** coincidencias. Quitándolos: **0**. El JS del proyecto está escrito en español y el JSON-LD viaja dentro de un `<script>` | `textoVisible()` los elimina; hay dos fixtures que lo fijan                                                             |

## Límites declarados

- **Detecta palabras de una lista, no «español» en abstracto.** Y esto no es una
  hipótesis remota: es exactamente por donde se coló «Seguí por acá» en 58
  páginas durante la ronda 1. Cada palabra que falte es un hueco real. Una
  cadena corta sin ninguna de las ~160 («Hola», «Vale») seguiría pasando.
- **Lo que el JS de cliente pinta en ejecución no se cubre.** La razón NO es que
  no esté en `dist/` —la ronda 2 lo decía así y era falso: está, en
  `data-skill-catalog`, `data-page-strings`, `data-item-json`—. La razón es que
  vive en atributos de máquina que el detector no lee, a propósito. Y ahí hay
  español real hoy: `/en/de/practicar` lleva el catálogo de habilidades en
  español en `data-skill-catalog`, y el JSON-LD de `/en/` dice «Curso de
  Alemán». Es trabajo de U-10 y de los checks de navegador.
- **De los atributos, solo los de texto.** `aria-label`, `alt`, `title`,
  `placeholder` y la meta description sí; `href`, `src`, `class`, `id` y
  `data-*` no. **No es un riesgo futuro, es el estado actual**: hay texto de
  interfaz en español dentro de `data-*` ahora mismo, y este candado no lo ve.
- **Las entidades HTML se le escapan.** `lecci&oacute;n` no casa con `lección`.
  El build de Astro no las genera hoy, pero el detector no lo comprueba.
- **El segundo detector solo ve lo que está en el diccionario.** El español
  escrito a mano en un componente, o una lección mal redactada, no está en ningún
  catálogo con el que comparar: para eso sigue haciendo falta la lista de
  palabras, con los huecos que tenga.
- **No juzga calidad.** Que una página no tenga español no dice que su inglés sea
  bueno; eso es revisión de contenido.

## Ronda 1 — `FAIL`, y qué encontró

El Critic tumbó la primera versión con tres defectos, los tres verificados por mi
parte antes de aceptarlos:

**D1 · El objetivo era falso en el mismo build que el candado certificaba verde.**
`RelatedLinks.astro` traía `title = 'Seguí por acá'` como valor por defecto, y
`LessonLayout` lo montaba sin `title`: un `<h2>` en español rioplatense en **58
de las 115** páginas inglesas. Y `ScrollTopButton.astro` llevaba
`aria-label="Volver arriba"` escrito a mano, en **115 de 115** — el nombre
accesible del botón, lo único que un lector de pantalla anuncia.

**D2 · La exclusión por quitado de etiquetas apagaba la detección de más de lo
que decía.** `textoVisible()` descartaba TODO valor de atributo, y la ficha
vendía eso como beneficio puro («los slugs viven en atributos»). El coste no
estaba escrito: `volver` ya estaba en la lista y el detector lo silenciaba en las
115 páginas. Es la regla 3 del contrato incumplida por quien la escribió — una
exclusión que no se acota a la ocurrencia conocida.

**D3 · La cifra «270» no era reproducible.** Estaba publicada en tres sitios como
medición del detector. Salía de una lista de sondeo de seis palabras usada
durante el diagnóstico; con la lista que se publica son **1586**. Se midió con un
instrumento y se reportó como si fuera otro — el mismo error que este proyecto ya
arrastra de antes.

## Reparación (ronda 2)

- `dictionary.ts`: dos claves nuevas, `silo.seguiPorAca` y `widgets.volverArriba`,
  en los dos idiomas. `RelatedLinks` pierde el valor por defecto y `title` pasa a
  ser obligatorio: un valor por defecto solo puede estar en un idioma.
  `ScrollTopButton` recibe `userLang` desde `BaseLayout`.
- El detector mira ahora `aria-label`, `alt`, `title`, `placeholder` y el
  `content` de `<meta name="description">` (`ATRIBUTOS_DE_TEXTO`), y sigue sin
  mirar `href`, `src`, `class`, `id` ni `data-*`, que llevan rutas e
  identificadores. La distinción ya no es «atributo sí / atributo no» sino «esto
  lo lee una persona / esto lo lee el navegador».
- La lista incorpora **18 formas de voseo rioplatense**, que es como escribe el
  proyecto: tenía `aquí` pero no `acá`, `sigue` pero no `seguí`. Por ahí se
  publicó el `<h2>`. Frecuencias medidas en el silo español: acá 376, seguí 334,
  tenés 119.
- La cifra corregida a 1586 en los tres sitios, con la explicación del error.
- 5 tests nuevos (14 → 19): `aria-label`, `alt`/`title`/`placeholder`, meta
  description, que `href`/`class`/`data-*` sigan fuera, y el voseo.

Resultado en el build: «Seguí por acá» 58 → **0** en `/en/`, sustituido por
«Carry on here»; `aria-label="Volver arriba"` 115 → **0**, sustituido por «Back
to top». El silo español intacto: 294 y 641 respectivamente.

**Segunda inversión, por la vía que antes era ciega**: se devolvió el literal al
`aria-label`, rebuild, y el candado se puso **rojo nombrando «Volver» en las
páginas afectadas**. Restaurado, verde otra vez.

## Ronda 2 — `FAIL`, y el patrón que destapó

El Critic volvió a tumbarla, con dos defectos verificados por mi parte:

**El objetivo seguía siendo falso en el build que el candado certificaba.**
`/en/de/` publicaba los seis niveles en español —«A1 · Principiante … C2 ·
Maestría»— un bloque por encima de la escalera que sí los traduce.
`StartLevelPicker.astro` usaba `LEVELS[].name` de `src/data/levels.ts`, que
guarda una sola versión, aunque el componente ya recibía `userLang` y el
diccionario ya tenía `levelNames` en inglés. **Es exactamente el mismo defecto
que `examen.astro`**, que la ronda 0 celebró haber cazado.

**La cifra de recambio también estaba mal.** `1586` era la lista de la ronda 1
sobre el build de la ronda 1. El Critic midió 1819; yo, remidiendo, 1934. Tres
mediciones independientes, tres números.

Y tres apuntes más, todos ciertos: `RE_ATRIBUTOS` empezaba en `\b`, así que
`data-title=` sí se leía —y el test que decía probar lo contrario usaba
`data-page-strings`, que no podía casar por construcción—; el detector era ciego
a la comilla simple y al orden de atributos en la `<meta>`; y el control
invertido no protegía palabras concretas: borrando las 18 formas de voseo
enteras, `/es/` seguía dando 641/641 contra un umbral de 400.

## Reparación (ronda 3) — atacar la clase, no la instancia

Dos rondas seguidas con el mismo patrón: **una lista cerrada de palabras siempre
tiene huecos**. Ronda 1, faltaba `acá`; ronda 2, faltaba `Principiante`. Ampliar
la lista después de cada fallo es perseguir el síntoma, así que esta ronda añade
un **segundo detector que no depende de mi vocabulario**:

`cadenasEspanolasVigiladas(es, en)` toma las cadenas del diccionario español,
descarta las cortas (< 12 caracteres), las idénticas a su versión inglesa y las
que llevan marcador, y comprueba que ninguna de las 197 restantes se publique en
`/en/`. Se mantiene solo: una cadena nueva en el diccionario entra al candado el
día que se escribe. Comprobado que **caza los tres defectos anteriores**:

```
ronda 1 · h2    → CAZADO: ["Seguí por acá"]
ronda 1 · aria  → CAZADO: ["Volver arriba"]
ronda 2 · nivel → CAZADO: ["A1 · Principiante"]
```

Lo demás de la ronda:

- `StartLevelPicker.astro` usa `dict.levelNames`; de `LEVELS` solo saca emoji y
  color. «Principiante» en `/en/`: 6 → **0**. Un test lo fija para siempre.
- **Ningún número copiado a mano.** El test calcula sobre el build del momento
  que sin quitar los `<script>` haya más de 500 coincidencias y quitándolos cero.
  Un número que se verifica solo no puede quedarse viejo; uno copiado, sí — y lo
  hizo dos veces.
- `(?<![\w-])` en vez de `\b`, comilla simple aceptada, `<meta>` leída con los
  atributos en cualquier orden, y el test de `data-*` reescrito con `data-title`,
  que es el caso que de verdad podía colarse.
- **8 canarios** que el detector debe seguir marcando, uno por grupo de la lista:
  borrar el voseo entero ahora pone tres tests en rojo.

## Veredicto del Critic

Ronda 3 tuvo dos intentos. El primero quedó `BLOCKED`: el Critic verificó todo
por lectura (ficha, candado, detector, los cuatro componentes de las
reparaciones anteriores, y el `dist/` ya presente en disco) sin encontrar
ningún defecto, pero el harness le activó Plan Mode a mitad de tarea y no pudo
ejecutar `npm run build` ni `npx vitest run tests/lang-purity.test.ts` —
se negó a fingir esa evidencia y lo marcó `BLOCKED` en vez de `PASS`. Se
relanzó la misma revisión; el segundo intento sí pudo ejecutar todo. Veredicto
final, pegado literal:

---

# U-01 CRITIC — RONDA 3

## VEREDICTO

PASS

## EVIDENCIA

**Ejecución real (no Plan Mode blocked esta vez — lo intenté y corrió sin restricción):**

1. `npm run build` ejecutado desde cero: salida real `[build] 1042 page(s) built in 12.26s` / `[build] Complete!`. Confirmado con `ls -la dist/en` que el directorio se regeneró en el mismo timestamp de esta corrida (`Sep 10 12:01`).

2. `npx vitest run tests/lang-purity.test.ts` sobre el `dist/` recién generado:

```
 Test Files  1 passed (1)
      Tests  35 passed (35)
```

Coincide con lo que declara la ficha («35 pasando»).

3. **Verificación independiente con `node --experimental-strip-types`** (no vitest, siguiendo la instrucción de armar casos propios), importando directamente `tests/lib/spanish-scan.ts` y `src/i18n/dictionary.ts` contra el `dist/` fresco — sin depender de que el propio test se autoengañe:
   - `EN pages: 115`, `ES pages: 641` — coincide con «115/115» y «≥400» de la ficha.
   - `VIGILADAS length: 197` — coincide exactamente con la cifra publicada.
   - `fugas de diccionario en /en: 0`, `hallazgos PALABRAS_ES en /en: 0` — cero español real, ambos detectores.
   - `paginas ES marcadas por VIGILADAS: 641/641` y `por PALABRAS_ES: 641/641` — control invertido muy por encima del umbral de 400, con números reales de esta corrida, no supuestos.
   - Umbral `<script>`: medí `conScripts: 1934`, `sinScripts: 0` — coincide con la tercera medición independiente («1934») que la ficha ya documenta como la más reciente, y muy por encima del `> 500` que exige el test. Confirma que el número **se calcula**, no está copiado.

4. **8 canarios verificados por fuera de vitest** (`canaries.mjs`): los 8 detectan correctamente. **Simulé la regresión de ronda 2** quitando las 18 formas de voseo de `PALABRAS_ES` y re-testeando el canario `"Seguí por acá"`: da **0 coincidencias** — es decir, si alguien reintrodujera ese hueco, el canario específico de voseo lo detectaría en rojo, cerrando exactamente el agujero que en ronda 2 dejaba pasar (641/641 seguía en verde con el voseo entero borrado).

5. **Casos adversariales manuales** (`adversarial.mjs`) contra las funciones reales, no contra fixtures del propio test:
   - `data-title="Volver arriba"` → 0 hallazgos (no se confunde con `title`).
   - `title="Volver arriba"` → 1 hallazgo (si se lee de verdad).
   - `aria-label='Volver arriba'` (comilla simple) → detectado.
   - `<meta content="..." name="description">` (orden invertido) → detectado.
   - Entidad HTML `lecci&oacute;n` → no detectado (límite ya declarado en la ficha, no oculto).
   - `<noscript>` con español → sí detectado (no hay hueco ahí).
   - `value="Escribe tu respuesta aquí"` → NO detectado (atributo `value` fuera de `ATRIBUTOS_DE_TEXTO`). Comprobé en `dist/en` real si esto es explotable hoy: `grep -roE 'value="[^"]{1,80}"' dist/en | wc -l` → 936 coincidencias, todas contenido de ejercicio en inglés (`"the cat"`, `"to overlook something obvious"`, etc.), ninguna en español. Es un hueco teórico del detector, no un defecto activo hoy.

6. **Componentes de las reparaciones anteriores, leídos en el código actual:**
   - `RelatedLinks.astro` (líneas 27-35): `title` es prop obligatoria, sin default; `LessonLayout.astro:228` pasa `dict.silo.seguiPorAca`.
   - `ScrollTopButton.astro` (líneas 6-17): `aria-label={t.volverArriba}` desde el diccionario según `userLang`; `BaseLayout.astro:172` le pasa `pageLang`, que en la línea 60 se define como `siloContext?.userLang ?? userLang ?? ...` — el eje correcto, no `targetLang`.
   - `StartLevelPicker.astro` (líneas 21-30, 57-61): `nombreNivel()` lee `dict.levelNames`; de `LEVELS` solo saca `emoji` y `color`. Confirmé con `grep -RloE "Principiante|Maestr[ií]a" dist/en | wc -l` → **0**.
   - `examen.astro` (líneas 27, 106-108, 124): `languageName` sale de `dict.languageNames`; `LANGUAGE_MAP` (línea 29) solo aporta `.flag` y `.bcp47`, nunca `.name`, ni en breadcrumb ni en JSON-LD.

7. **Endónimo «Español»**: recorrí las 115 páginas de `dist/en` con `grep -o "Español" | wc -l` una por una — las 115 dan exactamente 1, sin excepciones, verificando el test correspondiente contra el HTML real.

8. **Límite declarado y no oculto**: confirmé que `/en/de/practicar` sí lleva `data-skill-catalog="...&quot;name&quot;:&quot;Los Umlaute...` y que `dist/en/index.html` sí tiene `"name":"Curso de Alemán"` en su JSON-LD — exactamente lo que la ficha admite como límite conocido (atributos de máquina, fuera del alcance de U-01, trabajo de U-10).

9. **Git**: `git status --porcelain` sin cambios pendientes salvo un archivo no relacionado (`.claude/agents/planner.md`, fuera del alcance de esta unidad). `git show 1df6c8f --stat` confirma que la reparación de ronda 3 (segundo detector, 8 canarios, fix de `StartLevelPicker`) está en un único commit ya existente, consistente con lo narrado en la ficha y en `gauntlet/evidence/U-01-inversion.md` (que también leí completo: las cuatro inversiones documentadas con salida cruda, incluidas las dos rondas previas).

## DEFECTOS ENCONTRADOS

NINGUNO que constituya incumplimiento del criterio de aceptación. Observación menor no bloqueante: el atributo `value=` de `<input>` no está en `ATRIBUTOS_DE_TEXTO` y por tanto queda fuera del barrido (igual categoría que el límite ya declarado sobre `data-*`), pero verifiqué que hoy no hay ningún `value=` en español en `dist/en` — es una superficie de riesgo futura, no un defecto presente, y es del mismo tipo que los límites ya declarados explícitamente en la ficha (atributos de máquina no cubiertos).

## REGRESIONES

No. Verifiqué activamente que los tres defectos de rondas 1 y 2 (`Seguí por acá`, `aria-label="Volver arriba"`, `A1 · Principiante`/`Maestría`) siguen en 0 apariciones sobre el `dist/en` que yo mismo construí, y que el control invertido (`/es/`) y los 8 canarios siguen detectando con margen.

## CONCLUSIÓN

U-01 puede considerarse formalmente cerrada. El criterio de aceptación se cumple con evidencia de ejecución real (build fresco propio + `npx vitest run tests/lang-purity.test.ts` con 35/35, más verificación independiente por fuera de la suite con `node` contra las mismas funciones y el mismo `dist/`). Los dos patrones que causaron los `FAIL` previos (lista de palabras con huecos, atributos de máquina mal filtrados) están cerrados con un segundo detector estructural (`cadenasEspanolasVigiladas`) que no depende de vocabulario, y los 8 canarios demuestran —los probé yo mismo simulando la regresión de ronda 2— que una reapertura del hueco de voseo volvería a ponerse en rojo.

---

Nota sobre la primera ronda: `.claude/agents/gauntlet-critic.md` se creó en esta
misma sesión, y la lista de agentes se carga al arrancar, así que el harness
todavía no lo reconocía. La revisión se lanzó con un agente genérico llevándole
ese mismo contrato. Es decir: en esta ronda la prohibición de `Edit`/`Write` fue
**instruida, no impuesta**. A partir de la próxima sesión el agente existe y la
restricción la aplica la propia definición.

## Rebote de verificación (sesión posterior)

Pedido explícito de re-auditar U-01 de cero, sin asumir válido el `PASS`
anterior. Critic independiente, ronda 1 del rebote, con foco específico en:
español visible en `/en/**`, `data-title` y otros atributos, comillas
simples/dobles, orden de atributos, `StartLevelPicker`, `examen.astro`,
falsos PASS por `<script>`, baseline hardcodeado, control inverso y
regresión de los defectos de rondas 1-2. Build propio, `npx vitest run
tests/lang-purity.test.ts` → 35/35, y verificación independiente por fuera
de vitest contra las funciones reales del detector — incluida una
simulación propia de la regresión de ronda 1 (quitar el voseo de una copia
de la lista, sin tocar el repo) que confirmó que el canario específico la
detecta aunque el control agregado no lo haría. `PASS`, sin bloqueo,
`NINGUNO` defecto, `No` regresión. U-01 se confirma cerrada.
