# Plantilla de referencia: lección completa con quiz + exercises

Archivo real del repo: `src/content/lessons/de/a1/articulos-der-die-das.md`

Cópialo como base de formato — especialmente el punto exacto donde `exercises:`
empieza (justo después del último ítem de `quiz`, antes del `---` de cierre) y el
estilo de bloque YAML (todo con `-` en líneas separadas, nunca `[a, b, c]`).

```markdown
---
language: de
level: a1
title: "Der, die, das: la guía definitiva para dejar de adivinar"
description: "Categorías por significado, terminaciones con su porcentaje de acierto y las excepciones que sí importan — todo lo que necesitas para dejar de tirar una moneda al aire."
order: 1
grammarTopic: "Artículos determinados (der/die/das)"
funFact: "Esto no son reglas fijas, son tendencias: con estas categorías acertarás la gran mayoría de las veces, pero el alemán siempre se reserva un puñado de excepciones. Aprende cada palabra nueva CON su artículo pegado — der Tisch, no solo 'Tisch' — y tu memoria hará el resto."
minutes: 12
quiz:
  - question: "¿Cuál es el artículo correcto para 'Lehrer' (profesor)?"
    options: ["der Lehrer", "die Lehrer", "das Lehrer"]
    answerIndex: 0
    explanation: "Las personas de sexo masculino son siempre masculinas: der Lehrer, der Arzt, der Mann."
  - question: "'Mädchen' (niña) usa el artículo 'das' aunque hable de una persona femenina. ¿Por qué?"
    options:
      - "Porque todas las palabras cortas son neutras"
      - "Porque termina en el diminutivo -chen, y los diminutivos en -chen/-lein siempre son neutros (100% de certeza)"
      - "Es un error histórico del idioma"
    answerIndex: 1
    explanation: "Regla sin excepciones: cualquier palabra que termine en -chen o -lein es SIEMPRE neutra (das), sin importar el significado."
exercises:
  - type: "fill-blank"
    sentence: "___ Mädchen spielt im Garten."
    answer: "Das"
    accepted: ["das"]
    hint: "Termina en -chen: los diminutivos en -chen/-lein son siempre neutros, sin excepción."
    translation: "La niña juega en el jardín."
  - type: "fill-blank"
    sentence: "___ Zeitung liegt auf dem Tisch."
    answer: "Die"
    accepted: ["die"]
    hint: "Terminación -ung: femenina con 98% de certeza."
    translation: "El periódico está sobre la mesa."
  - type: "match"
    instructions: "Empareja cada palabra con su artículo correcto."
    pairs:
      - left: "Zeitung"
        right: "die"
      - left: "Mädchen"
        right: "das"
      - left: "Lehrer"
        right: "der"
      - left: "Freiheit"
        right: "die"
      - left: "Ergebnis"
        right: "das"
  - type: "write"
    prompt: "Escribe el artículo correcto (der/die/das) para 'Honig' (miel)."
    answer: "der"
    accepted: ["Der"]
    hint: "Terminación -ig: masculina con 98% de certeza."
  - type: "write"
    prompt: "Escribe el artículo correcto (der/die/das) para 'Freundschaft' (amistad)."
    answer: "die"
    accepted: ["Die"]
    hint: "Terminación -schaft: femenina con 98% de certeza."
  - type: "order"
    sentence: "Der Lehrer trinkt heute Kaffee"
    translation: "El profesor toma café hoy."
---

En español decimos "la mesa" y en alemán... también puede ser "der Tisch", "die Tisch" o
"das Tisch" — y solo una de esas opciones es correcta. Bienvenido al primer gran reto del
alemán: **el género gramatical**.

## Los tres colores del alemán

- 🔵 **der** — masculino
- 🔴 **die** — femenino
- 🟢 **das** — neutro

## DER (masculino): categorías por significado

| Categoría | Ejemplos |
| --- | --- |
| Personas y animales masculinos | der Mann, der Lehrer, der Arzt, der Hund |
| Días de la semana (sin excepción) | der Montag, der Samstag, der Sonntag |

## El truco mental para memorizar

Cuando aprendas una palabra nueva, no la guardes sola: guárdala **con su artículo
pegado**, como si fuera una sola palabra.
```

## Por qué este archivo es la referencia correcta

- Usa los 4 tipos de `exercises` en un solo lugar, así que sirve de plantilla completa.
- El cuerpo Markdown usa tablas, un bloque de código (` ``` `) y negritas — el mismo
  repertorio visual que el resto de las 240 lecciones.
- El `funFact` no es trivia suelta: siempre conecta con el `grammarTopic` y aparece
  bajo el eyebrow "💡 Truco para no aburrirte" en la página (ver `LessonLayout.astro`).
