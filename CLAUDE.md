# PolyLingua — Instrucciones para Claude Code

## Contexto del proyecto

Sitio estático de aprendizaje de idiomas (alemán, inglés, francés, italiano, portugués)
con niveles MCER A1–C2. Repositorio: github.com/ylnaud/PolyLingua
Producción: https://polylingua.thyronemiguelvegasantana-c6e.workers.dev

## Stack — respétalo SIEMPRE

- Astro 7 en modo SSG (estático, cero servidor)
- CSS puro — NUNCA Tailwind, Bootstrap ni ninguna librería CSS
- JavaScript vainilla mínimo — NUNCA React, Vue, Svelte ni librerías JS pesadas
- Content Collections con Zod para validar frontmatter
- TypeScript en modo estricto
- Una sola integración: @astrojs/sitemap

## Estructura de carpetas clave

```

src/pages/[userLang]/[targetLang]/[level]/[slug].astro  → el silo principal
src/pages/[userLang]/[targetLang]/<herramienta>.astro  → herramientas por curso
src/pages/[userLang]/<herramienta>.astro  → selector "¿en qué idioma?"
src/pages/idiomas/[lang]/...  → SOLO redirecciones 301 legacy al silo
src/layouts/        → layouts reutilizables con <head>, meta tags, header/footer
src/components/     → componentes .astro (tarjetas, quiz, nav...)
src/content/lessons/<userLang>-<targetLang>/<nivel>/<slug>.md  → lecciones
src/content.config.ts  → esquema Zod de la colección "lessons"
src/lib/lessonPath.ts  → parseLessonId(): ÚNICO lugar que conoce el formato del id
src/data/userLanguages.ts  → idiomas de INTERFAZ (cuáles están activos)
src/data/languages.ts      → idiomas META (los que se enseñan)
src/styles/         → CSS global puro
public/             → assets estáticos (favicons, og-image, robots.txt)
astro.config.mjs    → config principal + filtros del sitemap
```

### Las herramientas también están siloadas

Vocabulario, repasar, práctica libre, ahorcado, diario, gramática, mis
errores, escuchar y repetir y situaciones viven **dentro** del silo:
`/<userLang>/<targetLang>/<herramienta>`, con su selector de idioma en
`/<userLang>/<herramienta>`. Estaban en `/idiomas/<targetLang>/...`, fuera
del eje userLang, así que una URL solo podía existir en un idioma. Con la
interfaz en un solo idioma eso no se nota, pero la estructura es la correcta
y evita el enredo de tener las herramientas fuera del silo. Sus textos salen
de `dict.tools` (`src/i18n/dictionary.ts`); el JS de cliente los recibe por
`[data-page-strings]` (ver `src/lib/pageStrings.ts`), porque un
`<script define:vars>` no soporta `import`.

Tres se generan solo en el silo español: **diálogos, generador de frases y
recursos**. Su contenido guarda la traducción en un único idioma (el campo
`es` de `src/content/dialogos`, el `glossEs` de `src/data/matrices.ts`, la
nota de `src/data/resources.ts`) y no tiene eje userLang. El filtro es
`SPANISH_GLOSS_USER_LANG` en `src/lib/courses.ts`.

`src/lib/courses.ts` es el único lugar que sabe qué cursos existen — los
deriva de las carpetas de `src/content/lessons/`, así que un curso nuevo
entra solo. Úsalo (`getCourseStaticPaths`, `getTargetLangsFor`,
`getCourseLessons`) en vez de recorrer `LANGUAGES`: no todos los pares
existen (no hay `es-es` ni `de-de`) y filtrar solo por el campo `language`
mezcla cursos distintos que enseñan el mismo idioma.

## Frontmatter obligatorio en cada lección

```yaml
---
language: 'de' # OBLIGATORIO. de | en | es | fr | it | pt
level: 'a1' # a1 | a2 | b1 | b2 | c1 | c2
title: 'Título SEO con keyword'
description: '130–160 caracteres con keyword. Para meta description.'
order: 1 # número entero, orden dentro del nivel
grammarTopic: 'Tema gramatical'
funFact: 'Truco mnemotécnico para recordar'
minutes: 7 # duración estimada
unit: 1 # agrupa la lección dentro del nivel — ver nota abajo
quiz:
  - question: '¿Pregunta?'
    options: ['Opción A', 'Opción B', 'Opción C']
    answerIndex: 0
    explanation: 'Por qué es correcta'
exercises: # opcional, ver tipos abajo
  - type: 'fill-blank'
    sentence: 'Ich ___ Deutsch.' # debe contener ___ literal
    answer: 'lerne'
vocabulary: # opcional
  - term: 'lernen'
    translation: 'aprender'
---
```

`language` es el idioma **que se enseña** (el meta), nunca el de la
interfaz — ese se infiere del nombre de la carpeta. Es el único campo sin
valor por defecto además de los de texto, así que olvidarlo rompe el build.

`unit` es opcional para Zod, pero **no** para la página de nivel: si el nivel
tiene unidades definidas en `src/data/units.ts` (hoy todos las tienen), la
página agrupa las lecciones por unidad, y una lección sin `unit` —o con un
`unit` que no existe en esa lista— no pertenece a ningún grupo. Llegó a haber
15 así, invisibles en su nivel aunque seguían en el sitemap. La página ya no
las pierde (van a un grupo final) y hay un test en
`tests/data-integrity.test.ts` que falla si aparece alguna, pero lo correcto es
poner siempre un `unit` que exista. Si el tema no entra en ninguna unidad,
agregá una nueva a `units.ts` en vez de dejar el campo vacío.

El campo `skills` es opcional y alimenta el **motor de aprendizaje
adaptativo** (`src/lib/engine/`, documentado en `docs/LEARNING_ENGINE.md`).
Lista las habilidades que enseña la lección, con ids del catálogo de
`src/data/skills.ts` (`de.a1.wordorder.basic`). La relación es N:N: una
lección enseña varias y una habilidad aparece en varias lecciones. Hoy solo
están etiquetadas las 29 lecciones de A1 alemán; el resto simplemente no
alimenta al motor todavía. Hay tests que fallan si se referencia una habilidad
inexistente o si una habilidad se queda sin lección.

Tipos de `exercises` que acepta el schema: `fill-blank` (necesita `___` en
`sentence`), `match` (mínimo 3 `pairs`), `write`, `order`.

Si un campo no cumple el esquema Zod, el build falla. Valida siempre antes de commitear.

## Dos ejes: idioma de interfaz × idioma meta

Desde la arquitectura SILO el sitio tiene **dos** ejes de idioma, y
confundirlos es la fuente de errores más común:

- **`userLang` (interfaz)**: en qué idioma está escrita la explicación.
  Definido en `src/data/userLanguages.ts`. **Hoy solo `es` está activo.**
- **`targetLang` (meta)**: qué idioma se enseña. Definido en
  `src/data/languages.ts`. Son 6: `de`, `en`, `es`, `fr`, `it`, `pt`.

La URL es `/<userLang>/<targetLang>/<nivel>/<slug>` y la carpeta es
`src/content/lessons/<userLang>-<targetLang>/<nivel>/`. El campo
`language` del frontmatter es **siempre el targetLang**; el userLang NO
está en el frontmatter, se infiere del nombre de la carpeta vía
`parseLessonId()`.

### Los 6 cursos que existen

| Curso   | Interfaz | Enseña    | Estado                    |
| ------- | -------- | --------- | ------------------------- |
| `es-de` | Español  | Alemán    | Visible                   |
| `es-en` | Español  | Inglés    | Visible                   |
| `es-fr` | Español  | Francés   | Visible                   |
| `es-it` | Español  | Italiano  | Visible                   |
| `es-pt` | Español  | Portugués | Visible                   |
| `en-de` | Inglés   | Alemán    | Publicado pero **oculto** |

### La interfaz va en un solo idioma

Es una decisión de producto: **el sitio se mantiene solo en español**. Llegó
a haber una interfaz en alemán activa, con su diccionario y 5 cursos `de-*`
(386 lecciones), y se quitó entera. Si algún día se quiere de vuelta, está
en el historial de git — no hace falta reescribirla.

Así que, antes de traducir la interfaz a otro idioma, preguntá: hoy la
respuesta por defecto es que no.

`en` sigue en `active: false` porque no tiene diccionario de interfaz en
`src/i18n/dictionary.ts`: activarlo mostraría lecciones en inglés dentro de
una cáscara en español.

Mientras un idioma siga inactivo, sus páginas:

- se generan y son accesibles por URL directa,
- no aparecen en `LanguageSelector` (sale "Próximamente"),
- **no entran al sitemap** — el filtro en `astro.config.mjs` se deriva de
  `USER_LANGUAGES`, así que al poner `active: true` vuelven solas.

Si alguna vez se decide activar un idioma de interfaz: escribir su
diccionario completo en `src/i18n/dictionary.ts` (el tipo `Dictionary` no
admite claves parciales, así que si falta una el build falla) y recién
después cambiar el flag. No al revés.

## Comandos

```bash
npm run dev      # localhost:4321
npm run build    # genera dist/
npm run preview  # previsualiza el build
npm run check    # chequeo de tipos TypeScript
```

Ejecuta siempre `npm run check && npm run build` antes de dar una tarea por terminada.

## Despliegue

El hosting real hoy es **Cloudflare** (Workers con assets estáticos, vía
`wrangler.jsonc`, que le dice a Cloudflare que sirva `dist/` como sitio
estático). Producción vive en:

**https://polylingua.thyronemiguelvegasantana-c6e.workers.dev/**

Push a `main` construye y publica ahí automáticamente. El build sigue
siendo `npm run build` (no `astro build` solo — hay que correr el hook
`postbuild` que versiona el Service Worker); Astro sigue en modo SSG
puro, sin adapter de servidor. `public/_headers` es hoy la config de
seguridad activa (Cloudflare la lee directo del build output).

Vercel dejó de ser el hosting real. `vercel.json` ya se borró del repo —
la config de seguridad activa vive solo en `public/_headers` (formato
Cloudflare). El proyecto de Vercel en sí (dashboard, integración con
GitHub) queda pendiente de desconectar/borrar a mano — Claude Code no
tiene acceso de escritura a la cuenta de Vercel.

### Pendiente para terminar el corte a Cloudflare

1. **Dominio propio**: todavía se sirve desde el subdominio
   `*.workers.dev` de arriba, no desde un dominio comprado. El repo ya
   está preparado para cuando se compre uno — la URL del sitio se lee
   de `Astro.site` (`astro.config.mjs`, `site:`) en vez de estar
   hardcodeada, así que apuntar a un dominio nuevo es editar **una sola
   línea** ahí. Esa línea, junto con las URLs hardcodeadas que se
   listaban acá (`public/robots.txt`, `public/llms.txt`,
   `public/og-image.svg`, `src/styles/global.css`,
   `src/pages/privacidad.astro`), ya apuntan al `*.workers.dev` de
   arriba — cuando se compre el dominio propio, hay que volver a tocar
   esos mismos archivos.
2. **Vercel**: desconectar la integración con GitHub y/o borrar el
   proyecto desde el dashboard de Vercel (vercel.com/dashboard →
   proyecto PolyLingua → Settings → Git / Delete Project). Es un paso
   manual, fuera del repo.

## Reglas de trabajo

1. Explica cada paso en lenguaje sencillo (desarrollador principiante en Astro).
2. Indica siempre el nombre del archivo antes de escribir código.
3. Prioriza .astro estático. JS de cliente solo si es imprescindible.
4. Todo cambio de layout debe preservar los meta tags, Open Graph y canonical.
5. Toda lección nueva debe incluir JSON-LD de tipo LearningResource.
6. Los slugs de lección deben ser descriptivos con keywords:
   ✅ articulos-der-die-das ❌ leccion-01
7. No añadas dependencias sin consultar. El principio es "cero JS extra".
8. El blog en /blog es la herramienta SEO principal: posts de mínimo 800 palabras.

## SEO — prioridades

- meta title: incluye keyword + "| PolyLingua"
- meta description: 130–160 chars con keyword, en el frontmatter de cada .md
- JSON-LD LearningResource en cada lección
- Slugs descriptivos en las URLs
- Canonical en cada página para evitar duplicados
- Sitemap generado automáticamente por @astrojs/sitemap

## Progreso del usuario (localStorage)

Todo el progreso del usuario (SRS de repaso, logros, racha diaria, lecciones
completadas, vocabulario aprendido, tema, sonido) se persiste client-side con
`localStorage`, vía el wrapper `src/lib/storage.ts` (`read`/`write`, con
try/catch — nunca llames a `localStorage` directo). Es el patrón ya usado en
`src/components/ProgressTracker.astro`, `DailyGoal.astro`, `ThemeToggle.astro`,
`src/lib/sound.ts` y las páginas `repasar`/`practica-libre`/`vocabulario`. Si
agregas una funcionalidad de progreso nueva, sigue este mismo patrón (key con
prefijo `polylingua-`, lectura/escritura por `storage.ts`) en vez de inventar
otro mecanismo. No es apto para nada que deba ser indexable o SEO-relevante —
para eso sigue siendo contenido estático en el `.md`/frontmatter.

Scripts con `define:vars` en Astro se tratan como `is:inline` y por eso NO
soportan `import` — si tu script necesita `import { read, write } from
'../lib/storage'`, usa un `<script>` plano y lee los datos que necesites del
DOM (atributos `data-*`) o de la URL en vez de inyectarlos como props.

## Lo que NUNCA debes hacer

- Añadir React, Vue, Svelte o cualquier framework JS
- Añadir Tailwind, Bootstrap u otro framework CSS
- Usar sessionStorage, o `localStorage` directo sin pasar por `src/lib/storage.ts`
- Crear páginas sin meta tags (title, description, canonical)
- Usar slugs genéricos como "leccion-01" o "page-1"
- Hacer fetch a APIs externas en tiempo de build sin avisar
