// Lee los dos ejes de idioma de una URL del silo: /<userLang>/<targetLang>/…
//
// Lo usan el Header y el BottomNav, que necesitan saber en qué curso está el
// usuario para enlazar las herramientas de ese idioma (Mis errores, Gramática).
// Antes lo hacían con el regex /^\/(?:idiomas|[a-z]{2})\/(de|en|fr|it|pt)/, que
// tenía dos problemas: no distinguía el idioma de INTERFAZ del idioma META (el
// primer segmento se descartaba), y dejaba fuera 'es' como idioma meta, así que
// en /de/es/… —un alemán aprendiendo español— no reconocía ningún idioma y
// escondía los enlaces.
const LANG_IDS = ['de', 'en', 'es', 'fr', 'it', 'pt'];

export interface SiloPath {
  userLang: string | null;
  targetLang: string | null;
}

export function parseSiloPath(pathname: string): SiloPath {
  const [first, second] = pathname.split('/').filter(Boolean);
  const userLang = LANG_IDS.includes(first) ? first : null;
  const targetLang = userLang && LANG_IDS.includes(second) ? second : null;
  return { userLang, targetLang };
}
