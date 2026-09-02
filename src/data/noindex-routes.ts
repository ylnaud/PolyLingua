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
