# PolyLingua — Instrucciones para Claude Code

## Contexto del proyecto
Sitio estático de aprendizaje de idiomas (alemán, inglés, francés, italiano, portugués)
con niveles MCER A1–C2. Repositorio: github.com/ylnaud/PolyLingua
Producción: https://poly-lingua.vercel.app

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
level: "a1"           # a1 | a2 | b1 | b2 | c1 | c2
title: "Título SEO con keyword"
description: "130–160 caracteres con keyword. Para meta description."
order: 1              # número entero, orden dentro del nivel
grammarTopic: "Tema gramatical"
funFact: "Truco mnemotécnico para recordar"
minutes: 7            # duración estimada
quiz:
  - question: "¿Pregunta?"
    options: ["Opción A", "Opción B", "Opción C"]
    answerIndex: 0
    explanation: "Por qué es correcta"
---
```

Si un campo no cumple el esquema Zod, el build falla. Valida siempre antes de commitear.

## Los 5 idiomas y sus códigos de ruta
| Idioma    | Código |
|-----------|--------|
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
Push a `main` → Vercel construye y publica automáticamente.
No hace falta adaptador @astrojs/vercel ni vercel.json.

## Reglas de trabajo
1. Explica cada paso en lenguaje sencillo (desarrollador principiante en Astro).
2. Indica siempre el nombre del archivo antes de escribir código.
3. Prioriza .astro estático. JS de cliente solo si es imprescindible.
4. Todo cambio de layout debe preservar los meta tags, Open Graph y canonical.
5. Toda lección nueva debe incluir JSON-LD de tipo LearningResource.
6. Los slugs de lección deben ser descriptivos con keywords: 
   ✅ articulos-der-die-das   ❌ leccion-01
7. No añadas dependencias sin consultar. El principio es "cero JS extra".
8. El blog en /blog es la herramienta SEO principal: posts de mínimo 800 palabras.

## SEO — prioridades
- meta title: incluye keyword + "| PolyLingua"
- meta description: 130–160 chars con keyword, en el frontmatter de cada .md
- JSON-LD LearningResource en cada lección
- Slugs descriptivos en las URLs
- Canonical en cada página para evitar duplicados
- Sitemap generado automáticamente por @astrojs/sitemap

## Lo que NUNCA debes hacer
- Añadir React, Vue, Svelte o cualquier framework JS
- Añadir Tailwind, Bootstrap u otro framework CSS
- Usar localStorage o sessionStorage
- Crear páginas sin meta tags (title, description, canonical)
- Usar slugs genéricos como "leccion-01" o "page-1"
- Hacer fetch a APIs externas en tiempo de build sin avisar
