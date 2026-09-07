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
