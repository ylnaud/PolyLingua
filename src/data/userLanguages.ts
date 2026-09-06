// Idiomas de INTERFAZ posibles para la arquitectura SILO [userLang]/[targetLang]/...
//
// `active: true` significa que ese idioma tiene DOS cosas: lecciones propias
// bajo src/content/lessons/<id>-* y un diccionario de interfaz en
// src/i18n/dictionary.ts. Los activos aparecen en LanguageSelector, se
// enlazan desde el sitio y entran al sitemap (ver el filtro en
// astro.config.mjs, que se deriva de esta lista).
//
// Hoy están activos `es` y `en`. `de` llegó a estarlo, con sus 5 cursos `de-*`
// (386 lecciones) y su diccionario, y se quitó entero; está en el historial de
// git si algún día se quiere de vuelta.
//
// Activar un idioma es lo ÚLTIMO que se hace, no lo primero, y lo que costó
// aquí no fue el diccionario sino el español que vive fuera de él. Al activar
// `en` hubo que perseguirlo por cuatro sitios distintos: la prosa SEO de
// src/data/tsa.ts, las descripciones de src/data/units.ts, los widgets
// globales (los toggles del header y del menú «Más», que tenían los textos a
// mano y sin userLang) y el bloque «Del blog», que enlazaba posts en español
// desde el silo inglés porque el motor de enlaces emparejaba solo por
// targetLang.
//
// La forma de comprobarlo no es leer el código, es barrer el `dist/`: buscar
// palabras funcionales del español en las páginas del idioma nuevo que entren
// al sitemap. Mientras eso no dé cero, el flag se queda en false.
//
// Y otra que se paga cara: los hreflang. BaseSEO.astro tuvo que aprender a
// comprobar que la página equivalente EXISTE antes de declararla; con dos
// idiomas activos y sin eso salieron 645 apuntando a un 404.
//
// Y `es` tiene que seguir siendo el primero del array: varias páginas usan
// ACTIVE_USER_LANGUAGES[0] como idioma por defecto.
export type UserLanguageId = 'es' | 'de' | 'en' | 'fr' | 'it' | 'pt';

export interface UserLanguageMeta {
  id: UserLanguageId;
  name: string;
  flag: string;
  bcp47: string;
  active: boolean;
}

export const USER_LANGUAGES: UserLanguageMeta[] = [
  { id: 'es', name: 'Español', flag: '🇪🇸', bcp47: 'es-ES', active: true },
  { id: 'de', name: 'Deutsch', flag: '🇩🇪', bcp47: 'de-DE', active: false },
  { id: 'en', name: 'English', flag: '🇬🇧', bcp47: 'en-US', active: true },
  { id: 'fr', name: 'Français', flag: '🇫🇷', bcp47: 'fr-FR', active: false },
  { id: 'it', name: 'Italiano', flag: '🇮🇹', bcp47: 'it-IT', active: false },
  { id: 'pt', name: 'Português', flag: '🇵🇹', bcp47: 'pt-PT', active: false },
];

export const ACTIVE_USER_LANGUAGES = USER_LANGUAGES.filter((l) => l.active);

export const USER_LANGUAGE_MAP = Object.fromEntries(USER_LANGUAGES.map((l) => [l.id, l])) as Record<
  UserLanguageId,
  UserLanguageMeta
>;
