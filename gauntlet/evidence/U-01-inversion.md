# Evidencia · U-01 · inversión del candado

Salida cruda de las cuatro ejecuciones. Sin esto, «el test detecta el defecto»
sería una afirmación en vez de un hecho.

Comando en todas: `npx vitest run tests/lang-purity.test.ts`, con
`npm run build` delante cuando el paso cambia el contenido.

---

## 0 · Primera ejecución del candado — ROJO no provocado

El detector encontró un defecto real antes de que nadie inyectara nada.

```
FAIL  tests/lang-purity.test.ts > U-01 · el silo inglés no sirve español >
      ninguna página de /en/ contiene español visible
AssertionError: español en el silo inglés:
en/de/a1/examen/index.html · «Alemán» · …se it. Back up ✕ Languages / 🇩🇪 Alemán / A1 · Beginner / Test 🏆 Level test — A1 ·…
en/de/a2/examen/index.html · «Alemán» · …se it. Back up ✕ Languages / 🇩🇪 Alemán / A2 · Elementary / Test 🏆 Level test — A2…
en/de/b1/examen/index.html · «Alemán» · …se it. Back up ✕ Languages / 🇩🇪 Alemán / B1 · Intermediate / Test 🏆 Level test — B…
en/de/b2/examen/index.html · «Alemán» · …se it. Back up ✕ Languages / 🇩🇪 Alemán / B2 · Upper intermediate / Test 🏆 Level te…
en/de/c1/examen/index.html · «Alemán» · …se it. Back up ✕ Languages / 🇩🇪 Alemán / C1 · Advanced / Test 🏆 Level test — C1 ·…
en/de/c2/examen/index.html · «Alemán» · …se it. Back up ✕ Languages / 🇩🇪 Alemán / C2 · Mastery / Test 🏆 Level test — C2 · M…

 Test Files  1 failed (1)
      Tests  1 failed | 13 passed (14)
```

Causa: `src/pages/[userLang]/[targetLang]/[level]/examen.astro` pasaba
`languageMeta?.name` (de `LANGUAGE_MAP`, que guarda una sola versión, la
española) a la miga de pan visible, mientras el JSON-LD de la misma página ya
usaba `languageName` del diccionario. Arreglado en el mismo commit.

---

## 1 · Verde de partida

Tras el arreglo y `npm run build` (1042 páginas):

```
 Test Files  1 passed (1)
      Tests  14 passed (14)
```

---

## 2 · Defecto inyectado a propósito → ROJO esperado

Añadido al final de `src/content/lessons/en-de/a1/present-tense-regular-verbs.md`:

```
Ahora escribe la respuesta correcta en cada ejercicio del nivel.
```

`npm run build` (1042 páginas) y:

```
AssertionError: español en el silo inglés:
en/de/a1/present-tense-regular-verbs/index.html · «Ahora» · …flex is what makes German verb conjugation start to feel automatic. Ahora escribe la respuesta correcta en cada ejercicio del nivel.…
en/de/a1/present-tense-regular-verbs/index.html · «escribe» · …s what makes German verb conjugation start to feel automatic. Ahora escribe la respuesta correcta en cada ejercicio del nivel. …
en/de/a1/present-tense-regular-verbs/index.html · «respuesta» · …s German verb conjugation start to feel automatic. Ahora escribe la respuesta correcta en cada ejercicio del nivel. 📚 Vocabular…
en/de/a1/present-tense-regular-verbs/index.html · «cada» · …ion start to feel automatic. Ahora escribe la respuesta correcta en cada ejercicio del nivel. 📚 Vocabulary from this lesson…
en/de/a1/present-tense-regular-verbs/index.html · «ejercicio» · …tart to feel automatic. Ahora escribe la respuesta correcta en cada ejercicio del nivel. 📚 Vocabulary from this lesson…
en/de/a1/present-tense-regular-verbs/index.html · «nivel» · …utomatic. Ahora escribe la respuesta correcta en cada ejercicio del nivel. 📚 Vocabulary from this lesson 🔊 Liste…
```

Identifica el archivo exacto, las 6 palabras y su contexto. No dice solo que
falló.

---

## 3 · Reversión exacta → VERDE otra vez

```
$ git checkout -- src/content/lessons/en-de/a1/present-tense-regular-verbs.md
$ git status --short
 M src/pages/[userLang]/[targetLang]/[level]/examen.astro
?? tests/lang-purity.test.ts
?? tests/lib/
```

(La lección desaparece de la lista: la reversión fue exacta, no manual.)

`npm run build` (1042 páginas) y:

```
 Test Files  1 passed (1)
      Tests  14 passed (14)
```

---

**VERDE → defecto → ROJO → revertir → VERDE.** El candado no es decorativo.

---

# Ronda 2 · tras el `FAIL` del Critic

El Critic tumbó la ronda 1. Aquí la evidencia de la reparación y de la segunda
inversión, esta vez por la vía que el detector tenía ciega: los atributos.

## 4 · Los dos defectos que el candado NO veía, ahora medidos

Antes de reparar:

```
$ grep -rl 'Seguí por acá' dist/en --include=*.html | wc -l
58                                    # de 115 páginas inglesas — es un <h2> visible
$ grep -rl 'aria-label="Volver arriba"' dist/en --include=*.html | wc -l
115                                   # las 115 — nombre accesible del botón
$ npx vitest run tests/lang-purity.test.ts
      Tests  14 passed (14)           # verde encima de los dos
```

Después de reparar:

```
$ grep -rl 'Seguí por acá' dist/en --include=*.html | wc -l
0
$ grep -rl 'Volver arriba' dist/en --include=*.html | wc -l
0
$ grep -rl 'Carry on here' dist/en --include=*.html | wc -l
58
$ grep -rl 'aria-label="Back to top"' dist/en --include=*.html | wc -l
115
```

Control de no regresión en español:

```
$ grep -rl 'Seguí por acá' dist/es --include=*.html | wc -l
294
$ grep -rl 'aria-label="Volver arriba"' dist/es --include=*.html | wc -l
641
```

## 5 · La cifra falsa (D3), remedida

```
con la lista de 6 palabras que usé aquel día, sin quitar <script>:  270
con la lista REAL del detector, sin quitar <script>:               1586
```

El 270 estaba publicado en tres sitios como si describiera el detector. Corregido
a 1586, con la explicación del error en `spanish-scan.ts`.

## 6 · Segunda inversión, por la vía ciega → ROJO

Se devolvió el literal al `aria-label` de `ScrollTopButton.astro`, `npm run build`:

```
AssertionError: español en el silo inglés:
en/ahorcado/index.html · «Volver» · …witch between dark and light mode · Dismiss notice · Dismiss notice · Volver arriba · Main mobile navigation · More options · Install PolyLi…
en/de/a1/animals-vocabulary/index.html · «Volver» · …the full sentence · plural of Vogel · The sentence you are building · Volver arriba · Main mobile navigation · More options · Install PolyLi…
en/de/a1/at-the-restaurant/index.html · «Volver» · …the full sentence · type the phrase · The sentence you are building · Volver arriba · Main mobile navigation · More options · Install PolyLi…
```

La ronda 1 daba **verde** ante este mismo HTML.

## 7 · Restaurado → VERDE

```
$ npm run build      → 1042 page(s) built
$ npx vitest run tests/lang-purity.test.ts
 Test Files  1 passed (1)
      Tests  19 passed (19)
$ npm test
      Tests  522 passed (522)
$ npm run check
- 0 errors  - 0 warnings
```

---

# Ronda 3 · tras el segundo `FAIL`

## 8 · El defecto de la ronda 2, medido antes y después

```
antes  $ grep -rl 'Principiante' dist/en --include=*.html
       dist/en/de/index.html
       # texto visible: «Change level 🌱 A1 · Principiante 🧩 A2 · Elemental …
       #                 👑 C2 · Maestría 🌱 A1 · Beginner Your first words …»

después $ grep -rl 'Principiante' dist/en --include=*.html | wc -l   → 0
        $ grep -c 'A1 · Beginner' dist/en/de/index.html              → 1
        $ grep -c 'Principiante' dist/es/de/index.html               → 1   (control)
```

## 9 · La cifra: tres mediciones, tres números

```
1586   lista ronda 1 · build ronda 1     (lo que se publicó como si fuera el detector actual)
1819   medición del Critic
1934   medición propia, lista actual · build actual
```

Conclusión: la magnitud no es estable, depende de la lista, del build y de la
variante del pipeline. Ya no se copia ningún número; el test lo calcula y exige
`> 500` con `<script>` y `0` sin ellos.

## 10 · El segundo detector caza los tres defectos anteriores

Ejecutado contra el módulo real:

```
ronda 1 · h2       → CAZADO: ["Seguí por acá"]
ronda 1 · aria     → CAZADO: ["Volver arriba"]
ronda 2 · nivel    → CAZADO: ["A1 · Principiante"]
cadenas vigiladas: 197
```

Es la prueba de que ataca la clase de defecto y no la instancia: ninguno de los
tres se cazó ampliando la lista de palabras.

## 11 · Validación

```
$ npm run build   → 1042 page(s) built
$ npm test        → 19 files, 538 passed (538)
$ npm run check   → 0 errors, 0 warnings
$ npx prettier --check  → All matched files use Prettier code style!
```
