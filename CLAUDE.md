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
`/<userLang>/<targetLang>/<herramienta>`, no en `/idiomas/*`. Tres
(diálogos, generador de frases, recursos) son la excepción y se generan
solo en el silo español. Detalle completo, por qué, y qué archivo manda
sobre cada cosa: skill `polylingua-architecture`.

## Frontmatter obligatorio en cada lección

Cada lección es un `.md` con frontmatter validado por Zod
(`src/content.config.ts`) al hacer build. `language` es **siempre el
targetLang** (el idioma que se enseña), nunca el userLang — es el único
campo sin valor por defecto, así que olvidarlo rompe el build. Si un campo
no cumple el esquema, el build falla: valida siempre antes de commitear.

La forma exacta del YAML, los campos opcionales que conviene llenar
siempre (`unit`, `skills`), los cuatro tipos de `exercises` y las trampas
que ya rompieron el build de verdad: skills `polylingua-lessons` y
`create-lesson`. El campo `skills` alimenta el motor de aprendizaje
adaptativo, documentado en `docs/LEARNING_ENGINE.md`.

## Dos ejes: idioma de interfaz × idioma meta

Desde la arquitectura SILO el sitio tiene **dos** ejes de idioma, y
confundirlos es la fuente de errores más común:

- **`userLang` (interfaz)**: en qué idioma está escrita la explicación.
  Definido en `src/data/userLanguages.ts`. **Hoy están activos `es` y
  `en`**; `de` está en `active: false` ("Próximamente" en el selector).
- **`targetLang` (meta)**: qué idioma se enseña. Definido en
  `src/data/languages.ts`. Son 6: `de`, `en`, `es`, `fr`, `it`, `pt`.

La URL es `/<userLang>/<targetLang>/<nivel>/<slug>` y la carpeta es
`src/content/lessons/<userLang>-<targetLang>/<nivel>/`. El campo
`language` del frontmatter es **siempre el targetLang**; el userLang NO
está en el frontmatter, se infiere del nombre de la carpeta vía
`parseLessonId()`.

### Los 6 cursos que existen

| Curso   | Interfaz | Enseña    | Estado  |
| ------- | -------- | --------- | ------- |
| `es-de` | Español  | Alemán    | Visible |
| `es-en` | Español  | Inglés    | Visible |
| `es-fr` | Español  | Francés   | Visible |
| `es-it` | Español  | Italiano  | Visible |
| `es-pt` | Español  | Portugués | Visible |
| `en-de` | Inglés   | Alemán    | Visible |

Añadir una tercera interfaz es una decisión de producto, no de código, y
la respuesta por defecto sigue siendo que no: cada interfaz hay que
escribirla entera y mantenerla. Francés, italiano y portugués **siguen
siendo idiomas que se enseñan** (viven en `src/data/languages.ts`) — no
confundir ese eje con el de interfaz. Si alguna vez se activa un idioma de
interfaz: primero el diccionario completo en `src/i18n/dictionary.ts` (el
tipo `Dictionary` no admite claves parciales, así que si falta una el build
falla), después el flag `active`. Nunca al revés. Detalle completo e
historial: skill `polylingua-architecture`.

## Comandos

```bash
npm run dev      # localhost:4321
npm run build    # genera dist/
npm run preview  # previsualiza el build
npm run check    # chequeo de tipos TypeScript
```

Ejecuta siempre `npm run check && npm run build` antes de dar una tarea por terminada.

## Gauntlet Loop

Para cambios no triviales, el proyecto sigue un contrato de verificación
independiente: quien implementa no decide solo que su trabajo está bien
(Builder → Critic → `PASS`/`FAIL`/`BLOCKED`). Contrato completo, estados y
comandos reales: `gauntlet/README.md`.

## Despliegue

Producción vive en **Cloudflare Workers** (`wrangler.jsonc`), sirviendo
`dist/` como assets estáticos — sin servidor, sin adapter. Push a `main`
construye y publica solo; cualquier comando de build sirve (`npm run
build` o `astro build`). El Service Worker se genera como endpoint de
Astro (`src/pages/sw.js.ts`) y tiene reglas no negociables sobre cómo sirve
las páginas (red primero, clasificando por ruta, nunca por `request.mode`)
— rómperlas ya rompió producción una vez. Detalle completo: skill
`polylingua-deploy`.

El dominio propio está pendiente (hoy se sirve desde `*.workers.dev`); la
mudanza está documentada paso a paso en `docs/MIGRACION-DOMINIO.md` —
leelo antes de tocar nada, sobre todo por el orden de los pasos.

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

- meta title: keyword + "| PolyLingua"; meta description: 130–160 chars con
  keyword, en el frontmatter de cada `.md`
- Slugs descriptivos con keywords; JSON-LD y canonical en cada página

Todo esto está **centralizado** (`BaseSEO.astro`, `BaseLayout.astro`,
`noindex-routes.ts`) — nunca a mano por página. Tabla completa de JSON-LD
por tipo de página y la regla de qué se indexa: skill `polylingua-seo`.

## Progreso del usuario (localStorage)

Todo el progreso del usuario (SRS de repaso, logros, racha diaria, tema,
sonido, etc.) se persiste client-side vía el wrapper `src/lib/storage.ts`
(`read`/`write`, con try/catch) — nunca `localStorage` directo. Key con
prefijo `polylingua-`. No es apto para nada indexable o SEO-relevante — eso
sigue siendo contenido estático en el `.md`/frontmatter. Detalle completo,
las excepciones reales, y por qué `define:vars` no admite `import`: skill
`polylingua-frontend`.

## Lo que NUNCA debes hacer

- Añadir React, Vue, Svelte o cualquier framework JS
- Añadir Tailwind, Bootstrap u otro framework CSS
- Usar sessionStorage, o `localStorage` directo sin pasar por `src/lib/storage.ts`
- Crear páginas sin meta tags (title, description, canonical)
- Usar slugs genéricos como "leccion-01" o "page-1"
- Hacer fetch a APIs externas en tiempo de build sin avisar
