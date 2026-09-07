# U-01 · Pureza de idioma del silo inglés

- **Estado**: `CRITIC` (ronda 2) — reparada tras un `FAIL`; esperando reveredicto
- **Tipo**: `automático`
- **Depende de**: —

## Objetivo

Ninguna página de `/en/**` sirve texto español visible.

## Archivos afectados

- `tests/lib/spanish-scan.ts` — el detector (funciones puras)
- `tests/lang-purity.test.ts` — el candado
- `src/pages/[userLang]/[targetLang]/[level]/examen.astro` — defecto que el
  candado encontró solo, en su primera ejecución
- `src/components/RelatedLinks.astro`, `src/layouts/LessonLayout.astro`,
  `src/components/ScrollTopButton.astro`, `src/layouts/BaseLayout.astro` y
  `src/i18n/dictionary.ts` — los dos defectos que encontró el **Critic**, y que
  el candado no veía

## Por qué existe

El silo inglés se activó con el #164 y desde entonces el español se le ha colado
tres veces: la prosa SEO de `tsa.ts`, los widgets globales del header, y dos
literales en `/en/de/pronunciacion` encontrados a mano el mismo día que se
escribió esta unidad. Las tres veces lo encontró un barrido manual que se
escribía, se ejecutaba y se tiraba.

## Criterio de aceptación

1. Cero coincidencias de español visible en las páginas de `dist/en/`.
2. **Control de población**: el barrido ha leído más de 100 páginas. Sin esto,
   borrar `dist/en/` daría verde.
3. **Control invertido permanente**: la misma lista marca ≥ 400 páginas de
   `dist/es/`. Si la lista pierde capacidad de detección, este test se pone rojo
   aunque el silo inglés esté impecable.
4. **Sensibilidad contra fixtures**: 14 casos que no dependen del build.
5. El mensaje de fallo nombra archivo, palabra y contexto.

## Cómo se prueba

```bash
npm run build
npx vitest run tests/lang-purity.test.ts
```

Resultado: **19 pasando**.

## Inversión — hecha, no prometida

Salida cruda en [`../evidence/U-01-inversion.md`](../evidence/U-01-inversion.md).

| Paso                                                                                               | Resultado                                                       |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Verde de partida (tras arreglar `examen.astro`)                                                    | 14 pasando                                                      |
| Se añade una frase española al cuerpo de `en-de/a1/present-tense-regular-verbs.md`, se reconstruye | **ROJO**, nombrando el archivo y las 6 palabras con su contexto |
| `git checkout --` sobre esa lección, se reconstruye                                                | 14 pasando otra vez                                             |

Y antes de todo eso, el candado ya se estrenó en rojo por su cuenta: en su primera
ejecución encontró **«Alemán» en las 6 páginas de examen del silo inglés**.
`examen.astro` calculaba `languageName` desde el diccionario y lo usaba bien en
el JSON-LD, pero la miga de pan visible tiraba de `LANGUAGE_MAP.name`, que guarda
una sola versión y es la española. La misma página decía «German» en sus datos
estructurados y «Alemán» en pantalla.

## Falsos positivos

| Caso                                   | Evidencia                                                                                                                                                                    | Cómo se trata                                                                                                           |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Español` (endónimo del selector)      | En **115/115** páginas inglesas. Un selector nombra cada opción en su propio idioma, igual que «Deutsch»                                                                     | Se retira esa ocurrencia **y se cuenta**: el test exige exactamente una por página, así que una segunda vuelve a saltar |
| `los` como morfema alemán              | 19 apariciones, todas en B2 enseñando compuestos: «Arbeit (work) + los (-less) + igkeit»                                                                                     | Fuera de la lista, con el motivo escrito en `spanish-scan.ts`                                                           |
| Palabras inglesas y españolas a la vez | `general` y `plural` se marcaron como español por error durante el desarrollo del curso                                                                                      | Fuera de la lista, y un test comprueba que no vuelvan                                                                   |
| Slugs de URL                           | **No es un falso positivo real**: viven en `href`, `class`, `id` y `data-*`, que el detector no mira                                                                         | No se excluye nada por ser slug. Lo que se acota es qué atributos se leen: los de texto sí, los de máquina no           |
| Español dentro de `<script>`           | Con esta lista, sin quitar los `<script>`: **1586** coincidencias. Quitándolos: **0**. El JS del proyecto está escrito en español y el JSON-LD viaja dentro de un `<script>` | `textoVisible()` los elimina; hay dos fixtures que lo fijan                                                             |

## Límites declarados

- **Detecta palabras de una lista, no «español» en abstracto.** Y esto no es una
  hipótesis remota: es exactamente por donde se coló «Seguí por acá» en 58
  páginas durante la ronda 1. Cada palabra que falte es un hueco real. Una
  cadena corta sin ninguna de las ~160 («Hola», «Vale») seguiría pasando.
- **Solo mira `dist/`.** El texto que el JS de cliente inserta en ejecución —los
  ítems de `practiceItemMarkup.ts`, por ejemplo— no está en el HTML servido y
  esta unidad no lo cubre. Es trabajo de U-10 y de los checks de navegador.
- **De los atributos, solo los de texto.** `aria-label`, `alt`, `title`,
  `placeholder` y la meta description sí; `href`, `src`, `class`, `id` y
  `data-*` no. Si algún día se mete texto de interfaz en un `data-*`, este
  candado no lo verá.
- **Las entidades HTML se le escapan.** `lecci&oacute;n` no casa con `lección`.
  El build de Astro no las genera hoy, pero el detector no lo comprueba.
- **No juzga calidad.** Que una página no tenga español no dice que su inglés sea
  bueno; eso es revisión de contenido.

## Ronda 1 — `FAIL`, y qué encontró

El Critic tumbó la primera versión con tres defectos, los tres verificados por mi
parte antes de aceptarlos:

**D1 · El objetivo era falso en el mismo build que el candado certificaba verde.**
`RelatedLinks.astro` traía `title = 'Seguí por acá'` como valor por defecto, y
`LessonLayout` lo montaba sin `title`: un `<h2>` en español rioplatense en **58
de las 115** páginas inglesas. Y `ScrollTopButton.astro` llevaba
`aria-label="Volver arriba"` escrito a mano, en **115 de 115** — el nombre
accesible del botón, lo único que un lector de pantalla anuncia.

**D2 · La exclusión por quitado de etiquetas apagaba la detección de más de lo
que decía.** `textoVisible()` descartaba TODO valor de atributo, y la ficha
vendía eso como beneficio puro («los slugs viven en atributos»). El coste no
estaba escrito: `volver` ya estaba en la lista y el detector lo silenciaba en las
115 páginas. Es la regla 3 del contrato incumplida por quien la escribió — una
exclusión que no se acota a la ocurrencia conocida.

**D3 · La cifra «270» no era reproducible.** Estaba publicada en tres sitios como
medición del detector. Salía de una lista de sondeo de seis palabras usada
durante el diagnóstico; con la lista que se publica son **1586**. Se midió con un
instrumento y se reportó como si fuera otro — el mismo error que este proyecto ya
arrastra de antes.

## Reparación (ronda 2)

- `dictionary.ts`: dos claves nuevas, `silo.seguiPorAca` y `widgets.volverArriba`,
  en los dos idiomas. `RelatedLinks` pierde el valor por defecto y `title` pasa a
  ser obligatorio: un valor por defecto solo puede estar en un idioma.
  `ScrollTopButton` recibe `userLang` desde `BaseLayout`.
- El detector mira ahora `aria-label`, `alt`, `title`, `placeholder` y el
  `content` de `<meta name="description">` (`ATRIBUTOS_DE_TEXTO`), y sigue sin
  mirar `href`, `src`, `class`, `id` ni `data-*`, que llevan rutas e
  identificadores. La distinción ya no es «atributo sí / atributo no» sino «esto
  lo lee una persona / esto lo lee el navegador».
- La lista incorpora **18 formas de voseo rioplatense**, que es como escribe el
  proyecto: tenía `aquí` pero no `acá`, `sigue` pero no `seguí`. Por ahí se
  publicó el `<h2>`. Frecuencias medidas en el silo español: acá 376, seguí 334,
  tenés 119.
- La cifra corregida a 1586 en los tres sitios, con la explicación del error.
- 5 tests nuevos (14 → 19): `aria-label`, `alt`/`title`/`placeholder`, meta
  description, que `href`/`class`/`data-*` sigan fuera, y el voseo.

Resultado en el build: «Seguí por acá» 58 → **0** en `/en/`, sustituido por
«Carry on here»; `aria-label="Volver arriba"` 115 → **0**, sustituido por «Back
to top». El silo español intacto: 294 y 641 respectivamente.

**Segunda inversión, por la vía que antes era ciega**: se devolvió el literal al
`aria-label`, rebuild, y el candado se puso **rojo nombrando «Volver» en las
páginas afectadas**. Restaurado, verde otra vez.

## Veredicto del Critic

Pendiente. Se pega aquí literal —`PASS` / `FAIL` / `BLOCKED` con su evidencia—
cuando la revisión independiente termine. Hasta entonces esta unidad **no está
cerrada**, por muy verde que esté el candado: que quien implementa vea verde es
exactamente lo que el bucle no acepta como prueba.

Nota sobre la primera ronda: `.claude/agents/gauntlet-critic.md` se creó en esta
misma sesión, y la lista de agentes se carga al arrancar, así que el harness
todavía no lo reconocía. La revisión se lanzó con un agente genérico llevándole
ese mismo contrato. Es decir: en esta ronda la prohibición de `Edit`/`Write` fue
**instruida, no impuesta**. A partir de la próxima sesión el agente existe y la
restricción la aplica la propia definición.
