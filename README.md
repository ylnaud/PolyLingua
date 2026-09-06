# PolyLingua 🇩🇪 🇬🇧 🇫🇷 🇮🇹 🇵🇹

Aprende **alemán, inglés, francés, italiano o portugués** de **A1 a C2**,
gratis, con gramática explicada de forma divertida en vez de aburrida.
Construido con [Astro](https://astro.build) para ser **ultra ligero** (casi
cero JavaScript) y tener **SEO** de primera desde el día uno.

## ✨ Qué incluye

- **5 cursos** con la interfaz en español, y **484 lecciones** en total
- **6 niveles** siguiendo el Marco Común Europeo de Referencia (A1–C2)
- **Lecciones de gramática gamificadas**: cada regla viene con una
  mnemotecnia o truco visual para que se quede grabada sin sufrimiento
- **Quizzes interactivos** al final de cada lección (sin frameworks
  pesados: JavaScript vainilla, mínimo y rápido)
- **SEO listo para producción**: meta tags, Open Graph, JSON-LD
  (`Course`/`LearningResource`), sitemap automático y `robots.txt`
- **Diseño propio, responsive y accesible** (skip link, `aria-live` en
  los quizzes, contraste cuidado)
- 100% gratis mientras construimos audiencia — pensado para poder añadir
  funciones premium más adelante sin romper lo gratuito

## 🧱 Stack técnico

- [Astro](https://astro.build) (SSG — HTML estático, cero JS por defecto)
- Content Collections con validación de esquema (Zod)
- CSS puro, sin frameworks de UI
- `@astrojs/sitemap` para el sitemap XML automático

## 🚀 Desarrollo local

```bash
npm install
npm run dev       # http://localhost:4321
```

Otros comandos:

```bash
npm run build      # genera el sitio estático en dist/
npm run preview    # sirve el build de producción localmente
npm run check      # chequeo de tipos de Astro/TypeScript
npm test           # tests con Vitest
npm run format     # Prettier
```

No hay `npm run lint`.

## 📂 Estructura del contenido

Cada lección es un archivo Markdown. La ruta lleva **dos idiomas**: el de la
interfaz y el que se enseña.

```
src/content/lessons/<userLang>-<targetLang>/<nivel>/<slug>.md
```

Por ejemplo `src/content/lessons/es-de/a1/articulos-der-die-das.md`: la
explicación está en español y enseña alemán. Los cursos que existen son
`es-de`, `es-en`, `es-fr`, `es-it`, `es-pt` y `en-de` (oculto).

```md
---
language: 'de' # OBLIGATORIO: el idioma que se ENSEÑA. Sin él, el build falla
level: 'a1'
title: 'Título con keyword'
description: 'Meta description de 130 a 160 caracteres, con la keyword'
order: 3 # posición dentro del nivel
unit: 2 # agrupa la lección en su página de nivel (ver src/data/units.ts)
grammarTopic: 'Tema gramatical'
funFact: 'El truco/mnemotecnia para no aburrirse'
minutes: 5
quiz:
  - question: '¿...?'
    options:
      - 'opción A'
      - 'opción B'
      - 'opción C'
    answerIndex: 0
    explanation: 'Por qué es correcta'
---

Contenido de la lección en Markdown normal.
```

El esquema completo —incluidos `exercises`, `vocabulary` y `skills`— vive en
`src/content.config.ts`, que es la fuente de verdad. Si un campo no lo cumple,
`npm run build` falla.

Con eso basta: la página de nivel y la lección se generan solas.

## 🤖 Trabajar con Claude Code

`.claude/skills/` contiene la documentación operativa del proyecto (arquitectura,
contenido, frontend, SEO y despliegue) para que Claude Code trabaje sobre reglas
reales. `CLAUDE.md` es el resumen de entrada y `docs/` guarda las notas largas:
`LEARNING_ENGINE.md` y `MIGRACION-DOMINIO.md`.

## 🗺️ Roadmap

- [x] Completar el temario de los cinco cursos (484 lecciones)
- [x] Ejercicios de vocabulario y audio/pronunciación
- [x] Seguimiento de progreso del usuario en `localStorage`, con copia de
      seguridad exportable desde `/logros`
- [ ] Cuentas de usuario (hoy el progreso vive solo en el navegador)
- [x] Despliegue a producción — Cloudflare Workers, publica solo en cada push
      a `main`
- [ ] Dominio propio (hoy se sirve desde el subdominio `*.workers.dev`)
- [ ] Capa de monetización opcional (premium) sin cerrar el contenido
      gratuito existente

## 📄 Licencia

MIT — ver [LICENSE](./LICENSE).
