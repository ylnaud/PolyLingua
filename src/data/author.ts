/**
 * Quién firma el sitio.
 *
 * Vive en un solo archivo porque el nombre aparece en cuatro sitios que tienen
 * que decir lo mismo: la página /acerca, el byline de cada post, el `author`
 * del JSON-LD del blog y el valor por defecto del esquema de la colección. Que
 * uno de ellos se quedara viejo es exactamente el problema que había antes,
 * cuando /acerca decía «una sola persona» y el JSON-LD firmaba `Organization`.
 *
 * `PUBLISHER` es la marca, no la persona: en schema.org el `publisher` de un
 * post es quien lo edita y distribuye, y el `author` quien lo escribe. Acá son
 * la misma persona con dos sombreros, pero siguen siendo dos campos distintos.
 */
export const AUTHOR = {
  name: 'Duanly Vega Alderete',
  github: 'https://github.com/ylnaud',
} as const;

export const PUBLISHER = {
  name: 'PolyLingua',
  repo: 'https://github.com/ylnaud/polylingua',
} as const;
