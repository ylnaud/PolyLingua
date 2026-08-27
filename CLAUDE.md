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

src/pages/          → rutas .astro (index, idiomas/[lang]/[level]/...)
src/layouts/        → layouts reutilizables con <head>, meta tags, header/footer
src/components/     → componentes .astro (tarjetas, quiz, nav...)
src/content/lessons/<idioma>/<slug>.md  → lecciones en Markdown
src/content.config.ts  → esquema Zod de la colección "lessons"
src/styles/         → CSS global puro
public/             → assets estáticos (favicons, og-image, robots.txt)
astro.config.mjs    → config principal
```

## Frontmatter obligatorio en cada lección

```yaml
---
level: 'a1' # a1 | a2 | b1 | b2 | c1 | c2
title: 'Título SEO con keyword'
description: '130–160 caracteres con keyword. Para meta description.'
order: 1 # número entero, orden dentro del nivel
grammarTopic: 'Tema gramatical'
funFact: 'Truco mnemotécnico para recordar'
minutes: 7 # duración estimada
quiz:
  - question: '¿Pregunta?'
    options: ['Opción A', 'Opción B', 'Opción C']
    answerIndex: 0
    explanation: 'Por qué es correcta'
---
```

Si un campo no cumple el esquema Zod, el build falla. Valida siempre antes de commitear.

## Los 5 idiomas y sus códigos de ruta

| Idioma    | Código |
| --------- | ------ |
| Alemán    | de     |
| Inglés    | en     |
| Francés   | fr     |
| Italiano  | it     |
| Portugués | pt     |

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
