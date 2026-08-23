---
name: rag-optimizer
description: >
  Usa este skill cuando el usuario quiera preparar o revisar lecciones de
  PolyLingua (src/content/lessons/**/*.md) antes de subirlas a un Proyecto
  de Claude.ai con RAG. Valida frontmatter, longitud, y genera un índice
  para mejorar la recuperación semántica. Actívalo con frases como
  "optimiza las lecciones para RAG", "revisa el frontmatter",
  "genera el índice de lecciones".
---

# RAG Optimizer para PolyLingua

## Qué hace

`check-lessons.mjs` recorre `src/content/lessons/<idioma>/<nivel>/*.md`
(los 5 idiomas × 6 niveles reales del repo — no `src/content/lessons/<nivel>/*.md`,
que es un nivel de carpeta menos del que realmente existe) y por cada
lección valida:

- Frontmatter completo: `level`, `title`, `description`, `order`,
  `grammarTopic`, `funFact`, `minutes` (mismos campos obligatorios que
  `src/content.config.ts` exige para la colección `lessons` — es la fuente
  de verdad, léela si el schema cambió).
- `description` entre 20 y 160 caracteres (ni vacía ni un genérico tipo
  "Lección de alemán").
- `title` único dentro del mismo `(idioma, nivel)`.
- El cuerpo Markdown no supera ~1500 palabras; si lo supera, sugiere
  dividir en dos lecciones (RAG recupera fragmentos, no documentos
  completos, así que una lección larga diluye la relevancia del chunk).
- `description` duplicadas o casi idénticas dentro del mismo idioma
  (confunden la búsqueda semántica) — exacta siempre se reporta, "casi
  idéntica" vía similitud de palabras con umbral 0.8.

Al final regenera `.claude/skills/rag-optimizer/INDEX.md`: una tabla por
idioma (Nivel | Título | Descripción | Tema gramatical), ordenada por nivel
y luego por `order`.

**El índice no vive en `src/content/lessons/`.** Esa carpeta es
exactamente la que escanea la colección `lessons` de Astro
(`src/content.config.ts`), y un `INDEX.md` ahí sin el frontmatter
obligatorio rompería `npx astro build` con un error de validación Zod. Si
necesitás subir el índice junto con las lecciones a un Proyecto de
Claude.ai, tomalo de `.claude/skills/rag-optimizer/INDEX.md`.

## Cómo ejecutarlo

```bash
node .claude/skills/rag-optimizer/check-lessons.mjs
```

Usa `js-yaml` para parsear el frontmatter — ya está presente en
`node_modules` como dependencia transitiva de Astro, no hace falta
instalar nada nuevo.

Imprime advertencias en consola y siempre regenera `INDEX.md`, incluso si
no hay advertencias. Las advertencias son señales de calidad para RAG, no
errores de build — el script no falla con exit code distinto de 0 salvo
un error real de parseo/IO (frontmatter sin delimitadores `---`, YAML
inválido).

## Qué hacer con las advertencias

- **Campo faltante / description fuera de rango / genérica**: corregí el
  frontmatter de esa lección directamente.
- **Cuerpo demasiado largo**: evaluá dividir la lección en dos (por
  ejemplo, separar teoría de ejercicios extensos), siguiendo el patrón de
  `slug.md` + `slug-2.md` si el tema lo permite.
- **Título o description duplicados**: son casi siempre copy-paste sin
  terminar de editar — revisá ambos archivos señalados y diferenciá el
  contenido real, no solo el texto superficial.
