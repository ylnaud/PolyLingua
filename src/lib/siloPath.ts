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

/**
 * Lo que una página del silo le pasa a BaseLayout para que BaseSEO arme los
 * hreflang cruzados y el JSON-LD.
 *
 * Vive acá, y no dentro de `BaseLayout.astro`, porque desde que
 * `SiloToolPage.astro` lo reenvía hay dos archivos que necesitan el tipo, y un
 * `.astro` no es un buen sitio del que importar tipos.
 */
export interface SiloContext {
  userLang: string;
  targetLang: string;
  restPath?: string;
  breadcrumbs: { name: string; href: string }[];
  learningResource?: {
    title: string;
    description: string;
    minutes: number;
    grammarTopic: string;
    situation?: string;
    level: string;
    quiz?: { question: string }[];
  };
  /**
   * Una página que lo que hace es LISTAR contenido, como el hub de diálogos.
   *
   * `items` tiene que ser exactamente lo que la página pinta y en el mismo
   * orden: un ItemList que anuncie cosas que no están en el HTML es
   * desinformación para Google, no un extra.
   */
  collection?: {
    name: string;
    about?: string;
    items: { name: string; href: string }[];
  };
}

export function parseSiloPath(pathname: string): SiloPath {
  const [first, second] = pathname.split('/').filter(Boolean);
  const userLang = LANG_IDS.includes(first) ? first : null;
  const targetLang = userLang && LANG_IDS.includes(second) ? second : null;
  return { userLang, targetLang };
}
