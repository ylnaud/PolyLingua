# Plantilla de referencia: lección completa con quiz + exercises

**Copia literal del archivo real `src/content/lessons/es-de/a1/articulos-der-die-das.md`.**
No está escrita a mano: se generó desde ese archivo, así que si el original cambia,
esta copia se queda vieja — al usarla, comprueba que la ruta sigue existiendo antes de
fiarte del resto.

Fíjate sobre todo en:

- La **ruta**: `es-de` es `<userLang>-<targetLang>`, no un idioma suelto. No existe
  `src/content/lessons/de/`.
- `language: de` es el idioma que se **enseña**; el `es` de la carpeta es el de la
  interfaz y no aparece en el frontmatter.
- `unit: 2` — sin esto la lección no aparece agrupada en su página de nivel.
- `skills:` — los ids salen del catálogo de `src/data/skills.ts`.
- El punto exacto donde empieza `exercises:` (después del último ítem de `quiz`) y el
  estilo de bloque YAML: todo con `-` en líneas separadas, nunca `[a, b, c]`.

```markdown
---
language: de
level: a1
title: 'Der, die, das: cómo funciona el género en alemán'
description: 'Los tres artículos del alemán, la única regla que no falla nunca y el truco para memorizarlos. El punto de partida antes de ver cada género por separado.'
order: 3
unit: 2
grammarTopic: 'Artículos determinados (der/die/das)'
funFact: "Esto no son reglas fijas, son tendencias: con las categorías de las tres páginas siguientes acertarás la gran mayoría de las veces. Aprende cada palabra nueva CON su artículo pegado — der Tisch, no solo 'Tisch' — y tu memoria hará el resto."
skills:
  - de.a1.article.der-die-das
minutes: 5
quiz:
  - question: 'En plural, ¿qué artículo se usa sin importar el género original de la palabra?'
    options: ['die, siempre', 'depende del género original', 'se elimina el artículo']
    answerIndex: 0
    explanation: "En plural el artículo es SIEMPRE 'die', sin excepción: der Tisch → die Tische, das Mädchen → die Mädchen, die Zeitung → die Zeitungen."
  - question: '¿Cuántos géneros gramaticales tiene el alemán?'
    options: ['Dos: masculino y femenino', 'Tres: masculino, femenino y neutro', 'Cuatro']
    answerIndex: 1
    explanation: 'Masculino (der), femenino (die) y neutro (das). El neutro es el que no existe en español y el que más cuesta al principio.'
  - question: '¿Cuál es la mejor forma de aprender una palabra nueva en alemán?'
    options:
      - 'Memorizar solo la palabra y deducir el artículo después'
      - 'Memorizar la palabra CON su artículo, como si fueran una sola palabra'
      - 'Usar siempre die, que es el más común'
    answerIndex: 1
    explanation: "Guarda 'der Tisch', no 'Tisch'. El artículo forma parte de la palabra: separarlos es lo que obliga luego a adivinar."
  - question: "¿Por qué 'das Mädchen' (niña) es neutro si habla de una persona femenina?"
    options:
      - 'Porque todas las palabras cortas son neutras'
      - 'Porque la terminación manda sobre el significado: -chen es siempre neutro'
      - 'Es un error histórico del idioma'
    answerIndex: 1
    explanation: 'Cuando una terminación tiene regla propia, gana a la categoría de significado. Es el principio que explica las tres páginas siguientes.'
exercises:
  - type: 'fill-blank'
    sentence: 'Der Tisch ist neu. ___ Tische sind neu.'
    answer: 'Die'
    accepted: ['die']
    hint: 'En plural siempre die, venga de donde venga la palabra.'
    translation: 'La mesa es nueva. Las mesas son nuevas.'
    placeholder: 'der / die / das'
  - type: 'match'
    instructions: 'Empareja cada palabra con su artículo. Los verás uno por uno en las páginas siguientes.'
    pairs:
      - left: 'Lehrer'
        right: 'der'
      - left: 'Zeitung'
        right: 'die'
      - left: 'Mädchen'
        right: 'das'
  - type: 'order'
    sentence: 'Der Lehrer trinkt heute Kaffee'
    translation: 'El profesor toma café hoy.'
vocabulary:
  - term: 'der Tisch'
    translation: 'la mesa'
  - term: 'die Zeitung'
    translation: 'el periódico'
  - term: 'das Mädchen'
    translation: 'la niña'
---

En español decimos "la mesa" y en alemán... también puede ser "der Tisch", "die Tisch" o
"das Tisch" — y solo una de esas opciones es correcta. Bienvenido al primer gran reto del
alemán: **el género gramatical**.

La buena noticia: no tienes que memorizar palabra por palabra desde cero. Existen
categorías de significado y terminaciones que cubren la gran mayoría de los casos.

(… cuerpo de la lección en Markdown normal …)
```
