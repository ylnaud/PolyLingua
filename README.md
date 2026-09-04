# PolyLingua 🇩🇪

Aprende alemán de **A1 a C2**, gratis, con gramática explicada de forma
divertida en vez de aburrida. Construido con [Astro](https://astro.build)
para ser **ultra ligero** (casi cero JavaScript) y tener **SEO** de primera
desde el día uno.

## ✨ Qué incluye

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
npm run check       # chequeo de tipos de Astro/TypeScript
```

## 📂 Estructura del contenido

Cada lección vive como un archivo Markdown en
`src/content/lessons/<nivel>/<leccion>.md`, con esta forma:

```md
---
level: a1
title: 'Título de la lección'
description: 'Resumen corto para SEO y tarjetas'
order: 1
grammarTopic: 'Tema gramatical'
funFact: 'El truco/mnemotecnia para no aburrirse'
minutes: 7
quiz:
  - question: '¿...?'
    options: ['opción A', 'opción B', 'opción C']
    answerIndex: 0
    explanation: 'Por qué es correcta'
---

Contenido de la lección en Markdown normal.
```

Con eso basta: la página de nivel y la lección se generan solas.

## 🗺️ Roadmap

- [ ] Completar el temario de cada nivel (actualmente hay lecciones de
      muestra por nivel para validar formato y diseño)
- [ ] Ejercicios de vocabulario y audio/pronunciación
- [ ] Seguimiento de progreso del usuario (localStorage → cuenta)
- [x] Despliegue a producción — Cloudflare Workers, publica solo en cada push
      a `main`
- [ ] Dominio propio (hoy se sirve desde el subdominio `*.workers.dev`)
- [ ] Capa de monetización opcional (premium) sin cerrar el contenido
      gratuito existente

## 📄 Licencia

MIT — ver [LICENSE](./LICENSE).
