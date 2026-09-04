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
  const last = segments[segments.length - 1] ?? '';
  if (!NOINDEX_LAST_SEGMENTS.includes(last)) return false;
  // Excepción: el hub de diálogos de un curso (/es/de/dialogos, 3 segmentos).
  //
  // Los 100 diálogos son `index, follow` y están en el sitemap, pero su ÚNICO
  // enlace entrante venía de este hub — y el hub, al ser noindex, salía además
  // con `nofollow`. O sea que ninguna ruta seguible del sitio llegaba a un
  // diálogo: 100 de 551 páginas indexables (el 18 %) desconectadas del reparto
  // de autoridad interno. El hub tiene título y descripción propios por idioma
  // y lista contenido real, así que se indexa.
  //
  // El selector /es/dialogos (2 segmentos) sigue fuera: es una lista de
  // idiomas sin contenido propio.
  if (last === 'dialogos' && segments.length === 3) return false;
  return true;
}
