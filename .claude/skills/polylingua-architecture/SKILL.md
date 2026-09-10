---
name: polylingua-architecture
description: Arquitectura de PolyLingua — los dos ejes de idioma (interfaz × meta), la estructura SILO de rutas, qué módulo es la autoridad sobre qué, y las rutas legacy. Úsala antes de tocar rutas, páginas nuevas, `src/lib/`, `src/data/` o cualquier cosa que recorra los cursos o los idiomas.
when_to_use: 'Cuando haya que crear o mover una página, añadir un curso o un idioma, recorrer las lecciones desde código, o entender por qué una URL tiene la forma que tiene. También ante cualquier duda sobre qué archivo manda sobre qué.'
---

# Arquitectura de PolyLingua

Sitio **estático puro** (Astro SSG). 1042 páginas HTML en `dist/`, servidas por
Cloudflare como assets. **No hay servidor, ni adapter, ni API, ni base de datos.** Todo
el estado del usuario vive en su navegador.

## Los dos ejes de idioma

Es la fuente de errores número uno del proyecto. Cada página de curso tiene **dos**
idiomas:

- **`userLang`** — en qué idioma está escrita la explicación. Definido en
  `src/data/userLanguages.ts`. **Hoy están activos `es` y `en`.**
- **`targetLang`** — qué idioma se enseña. Definido en `src/data/languages.ts`. Seis:
  `de en es fr it pt`.

```
URL:      /<userLang>/<targetLang>/<nivel>/<slug>
Carpeta:  src/content/lessons/<userLang>-<targetLang>/<nivel>/<slug>.md
```

El campo `language` del frontmatter es **siempre el targetLang**. El userLang no está
en el frontmatter: se infiere del nombre de la carpeta.

**No todos los pares existen.** Hay seis cursos: `es-de`, `es-en`, `es-fr`, `es-it`,
`es-pt` y `en-de`. No hay `es-es` ni `de-de`. Filtrar solo por `data.language`
mezcla `es-de` con `en-de`, que enseñan lo mismo a públicos distintos — es un bug que
ya mandó 84 redirecciones a un 404.

## Quién manda sobre qué

Cada uno de estos es la **única** autoridad en lo suyo. No dupliques su lógica ni
hardcodees lo que ellos derivan:

| Archivo                      | Autoridad sobre                                                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/courses.ts`         | Qué cursos existen. Los **deriva del filesystem**, así que un curso nuevo entra solo. Usa `getCourseStaticPaths`, `getTargetLangsFor`, `getCourseLessons`, `courseHasLesson` |
| `src/lib/lessonPath.ts`      | El formato del id de una lección (`parseLessonId`)                                                                                                                           |
| `src/lib/siloPath.ts`        | Construcción de rutas del silo                                                                                                                                               |
| `src/data/userLanguages.ts`  | Qué idiomas de interfaz existen y cuáles están activos                                                                                                                       |
| `src/data/languages.ts`      | Qué idiomas se enseñan                                                                                                                                                       |
| `src/data/levels.ts`         | Los seis niveles MCER y su metadata                                                                                                                                          |
| `src/data/units.ts`          | Las unidades de cada `<targetLang>-<nivel>`                                                                                                                                  |
| `src/data/noindex-routes.ts` | Qué rutas no se indexan — **y el filtro del sitemap**                                                                                                                        |
| `src/data/site.ts`           | La URL pública del sitio                                                                                                                                                     |
| `src/content.config.ts`      | El esquema de las tres colecciones                                                                                                                                           |

`courses.ts` llama a `getCollection()` **una sola vez al evaluarse el módulo**, no por
página. No lo muevas dentro de un componente: el Footer se renderiza en las ~1300
páginas y hacerlo por página llevó el build de 23 s a 63 s.

## Las herramientas también están siloadas

Vocabulario, repasar, práctica libre, ahorcado, diario, gramática, mis errores,
pronunciación y situaciones viven **dentro** del silo
(`/<userLang>/<targetLang>/<herramienta>`), con su selector en
`/<userLang>/<herramienta>`.

Tres se generan **solo en el silo español**: diálogos, generador de frases y recursos.
Su contenido guarda la traducción en un único idioma (el campo `es` de
`src/content/dialogos`, el `glossEs` de `src/data/matrices.ts`, la nota de
`src/data/resources.ts`) y no tiene eje userLang. El filtro es
`SPANISH_GLOSS_USER_LANG` en `courses.ts`.

## La interfaz va en español e inglés

Son dos, y solo dos — no es una tarea pendiente, es el estado actual. El inglés se
activó con su diccionario completo en `src/i18n/dictionary.ts`; sus 92 URLs (el curso
`en-de`) entran al sitemap igual que las del silo español.

Añadir una tercera interfaz sigue siendo una decisión de producto, no de código, y la
respuesta por defecto sigue siendo que no. Llegó a haber una en alemán con 5 cursos
`de-*` (386 lecciones) y se quitó entera; y `fr`, `it`, `pt` estuvieron en la lista sin
diccionario y sin lecciones, prometiendo desde el selector algo que nadie escribía, así
que se quitaron también. Todo está en el historial de git si algún día se retoma.

`de` sigue en la lista con `active: false`: es el único candidato real, porque ya tuvo
interfaz y cursos. El selector lo muestra como "Próximamente".

Si alguna vez se activa un idioma de interfaz nuevo: **primero** el diccionario completo
en `src/i18n/dictionary.ts` (el tipo `Dictionary` no admite claves parciales, así que si
falta una el build falla), **después** el flag. Nunca al revés.

Mientras un idioma siga inactivo, sus páginas se generan y son accesibles por URL
directa, no aparecen en `LanguageSelector`, y no entran al sitemap — el filtro de
`astro.config.mjs` se deriva de `USER_LANGUAGES`, así que al ponerlo en `true` vuelven
solas.

## Rutas legacy

`/niveles/*` y `/idiomas/*` son **solo redirecciones 301** al silo, no páginas de
contenido. Las primeras son anteriores a la arquitectura SILO; las segundas, anteriores
a que las herramientas entraran al silo. Se mantienen para que ningún enlace viejo se
rompa, pero están excluidas del sitemap (`LEGACY_REDIRECT_PREFIXES` en
`astro.config.mjs`). No añadas contenido nuevo ahí.

## Contenido: tres colecciones

| Colección  | Archivos | Base                   |
| ---------- | -------- | ---------------------- |
| `lessons`  | 484      | `src/content/lessons`  |
| `dialogos` | 100      | `src/content/dialogos` |
| `blog`     | 10       | `src/content/blog`     |

Los diálogos son 20 situaciones × 5 idiomas, y toda la sección es `noindex` desde que
se midió que son las páginas más cortas del sitio (235 palabras únicas de mediana
frente a 1140 de una lección).

## El motor adaptativo

`src/lib/engine/` (8 módulos, documentado en `docs/LEARNING_ENGINE.md`) modela qué
habilidades domina el alumno. El catálogo está en `src/data/skills.ts`; las lecciones
lo alimentan con su campo `skills`. Toda habilidad de categoría `grammar` o
`word_order` necesita una plantilla de refuerzo en `src/lib/engine/exerciseGenerator.ts`
— hay un test que lo exige.

## Lo que nunca se añade

Sin consultar antes: **ninguna dependencia**. El proyecto tiene dos en producción
(`astro` y `@astrojs/sitemap`) y el principio es «cero JS extra». Nada de React, Vue,
Svelte, Tailwind ni Bootstrap.
