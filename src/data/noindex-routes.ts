// Último segmento de ruta de cada página que setea <BaseLayout noindex>.
// Única fuente de verdad: la lee astro.config.mjs para excluir esas rutas
// del sitemap, y tests/noindex-sitemap.test.ts verifica que esta lista siga
// sincronizada con las páginas reales de src/pages (buscando `noindex` como
// prop booleana). Si agregás una página nueva con `noindex`, agregá su
// último segmento acá o el test de sincronía va a fallar.
export const NOINDEX_LAST_SEGMENTS = [
  'repasar',
  'practicar',
  'practica-libre',
  'vocabulario',
  'examen',
  'logros',
  'ahorcado',
  'diario',
  'pronunciacion',
  'recursos',
  'situaciones',
  'dialogos',
  'gramatica',
  'mis-errores',
  'offline',
  'generador-frases',
];

/**
 * ¿Esta ruta lleva noindex?
 *
 * La usan las DOS puntas —el filtro del sitemap en `astro.config.mjs` y el
 * meta robots que pinta `SiloToolPage.astro`— justamente para que no puedan
 * discrepar. Antes el meta lo ponía el componente y la exclusión del sitemap
 * salía de la lista de arriba: dos sitios que decidían lo mismo por separado.
 */
export function isNoindexRoute(pathname: string): boolean {
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean);

  // La sección de diálogos entera queda fuera del índice: el selector
  // (/es/dialogos), los cinco hubs (/es/de/dialogos) y los 100 diálogos
  // (/es/de/dialogos/im-cafe). Por eso se mira si `dialogos` aparece en
  // CUALQUIER segmento y no solo en el último, que es donde estaban los
  // diálogos sueltos escapándose de esta lista.
  //
  // Es una decisión de contenido, y conviene dejar el razonamiento porque
  // deshace uno anterior. Antes el hub era la excepción: se indexaba a
  // propósito porque los 100 diálogos no recibían ningún enlace seguible y
  // quedaban desconectados del reparto de autoridad interno. Esa razón ya no
  // existe — si los diálogos no se indexan, no hay a quién desatascar, y un
  // hub cuyos 20 enlaces apuntan todos a contenido noindex es una página
  // débil por construcción.
  //
  // El motivo de fondo: los diálogos son las páginas más cortas del sitio con
  // diferencia —235 palabras únicas de mediana frente a las 1140 de una
  // lección, con un cuerpo de 17 a 36 palabras—. No son duplicados entre sí
  // (el solape del español entre los cinco idiomas es del 26,7 %), pero sí
  // demasiado flojas para competir. Pasan a ser una herramienta más, como
  // repasar o vocabulario: intactas para quien usa el sitio, invisibles para
  // Google. Sitemap: de 557 URLs a 452.
  //
  // Si algún día se les escribe contenido de verdad, revertirlo es quitar
  // este bloque.
  if (segments.includes('dialogos')) return true;

  const last = segments[segments.length - 1] ?? '';
  return NOINDEX_LAST_SEGMENTS.includes(last);
}
