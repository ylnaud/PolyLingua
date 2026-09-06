---
name: polylingua-seo
description: Reglas de SEO de PolyLingua — canonical y hreflang centralizados en BaseSEO.astro, JSON-LD por tipo de página, `noindex-routes.ts` como única fuente del meta robots y del filtro del sitemap, y las longitudes de title y description. Úsala al crear páginas, tocar layouts o decidir qué se indexa.
when_to_use: 'Cuando crees una página nueva, modifiques un layout o un componente de <head>, cambies qué se indexa, toques el sitemap, o escribas titles y meta descriptions.'
---

# SEO en PolyLingua

El SEO es la razón de ser de la arquitectura estática. Lo que sigue son reglas que ya
costaron un error real cada una.

## Nada de esto se decide página por página

`src/components/BaseSEO.astro` centraliza canonical, hreflang (con `x-default`) y el
JSON-LD, que se emite como un único `@graph`. `src/layouts/BaseLayout.astro` es por
donde pasan todas las páginas.

Si estás escribiendo `<link rel="canonical">` o un `<meta name="robots">` a mano en una
página, casi seguro te has salido del camino. Pásalo por el layout.

## Qué se indexa: una sola fuente

**`src/data/noindex-routes.ts`** decide las dos cosas a la vez:

1. El `<meta name="robots">` que pinta `BaseLayout`.
2. La exclusión del sitemap, vía el filtro de `astro.config.mjs`.

Las dos puntas llaman a la **misma función** `isNoindexRoute()` justamente para que no
puedan discrepar. Antes decidían por separado y discrepaban.

Al añadir una página que no deba indexarse, añade su último segmento a
`NOINDEX_LAST_SEGMENTS` — y comprueba que `tests/noindex-sitemap.test.ts` sigue en
verde: verifica que la lista está sincronizada con las páginas reales de `src/pages`.

**El fallo que enseñó a mirar todos los segmentos.** `dialogos` llevaba tiempo en la
lista, pero el último segmento de `/es/de/dialogos/im-cafe` es `im-cafe`, así que
ninguno de los 100 diálogos cumplía la regla que parecía aplicada. Si una sección
entera debe quedar fuera, comprueba el segmento **en cualquier posición**, no solo el
último.

Hoy está fuera del índice: toda la sección de diálogos (100 + 5 hubs), las herramientas
(repasar, vocabulario, ahorcado, diario, gramática, mis errores…), y los silos de
idiomas de interfaz inactivos. Sitemap: **452 URLs**.

## Tres cosas que un sitemap no arregla

- **El sitemap es una sugerencia.** Excluir una página de él no impide que Google
  llegue. Si no debe indexarse, necesita `noindex` de verdad — por eso las dos puntas
  salen de la misma función.
- **Una página `noindex` acaba tratada como `nofollow`.** No cuentes con que reparta
  autoridad a lo que enlaza.
- **Anunciar en el sitemap una página que se declara `noindex` es contradictorio.** Es
  el error que evitan `isNoindexPage()`, `isInactiveUserLangPage()` y
  `isLegacyRedirectPage()` en `astro.config.mjs`.

## JSON-LD

Todo va en un `@graph` por página. Lo que emite el build hoy:

| Tipo                          | Páginas |
| ----------------------------- | ------- |
| `BreadcrumbList`              | 685     |
| `LearningResource`            | 584     |
| `Course`                      | 537     |
| `CourseInstance`              | 484     |
| `Person` / `Organization`     | autoría |
| `BlogPosting`                 | 20      |
| `CollectionPage` + `ItemList` | hubs    |

Reglas: toda lección lleva `LearningResource`; toda página con migas lleva
`BreadcrumbList`; **ningún `@type` se repite** dentro de una misma página —
`tests/dialogos-seo.test.ts` lo comprueba. Y un `ItemList` declarado debe coincidir con
lo que la página pinta de verdad, en el mismo orden.

## Textos

- **`title`**: keyword + `| PolyLingua`. El sufijo lo pone el layout, no lo escribas en
  el frontmatter.
- **`description`**: **130-160 caracteres**, con la keyword. Hay tests que fallan fuera
  de ese rango (`tests/dialogos-seo.test.ts`), y también si dos descriptions son
  idénticas o casi idénticas dentro de la misma colección.
- **Slugs descriptivos con keywords**: `articulos-der-die-das`, nunca `leccion-01`.
- No repitas el idioma en el título si el layout ya lo añade. Pasó con los diálogos:
  «En el café **en portugués** · Diálogo A1 **en Portugués**».

## Enlaces internos

El motor está en `src/lib/links/` y es **puro**: no toca el DOM, no lee disco, no llama
a `astro:content`. Recibe páginas y habilidades ya cargadas y devuelve propuestas. Esa
pureza permite que el mismo código alimente el render y un DRY RUN de Node, y obtengan
las mismas propuestas.

**Regla de oro, literal del código: acá no se construye ninguna URL.** Las rutas entran
ya hechas, derivadas de ids reales de las colecciones. Nunca se concatena una keyword
ni se adivina un slug. `proposeLinks()` comprueba que todo destino esté en el índice de
páginas y revienta si no — un enlace inventado es un fallo de build, no un aviso.

Los enlaces relacionados los pinta `RelatedLinks.astro` dentro de un
`<aside class="related">`. Ojo al medirlos: **sus `href` no llevan barra final**.

## Antes de dar por bueno un cambio de SEO

`npm run build` y comprueba sobre `dist/`, que es lo que ve Google — no sobre el
código. Cuenta las URLs del sitemap y los `<meta name="robots">` antes y después: si el
número cambia en algo que no esperabas, ahí está el error.
