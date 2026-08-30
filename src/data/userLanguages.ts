// Idiomas de INTERFAZ posibles para la arquitectura SILO [userLang]/[targetLang]/...
//
// `active: true` significa que ese idioma tiene DOS cosas: lecciones propias
// bajo src/content/lessons/<id>-* y un diccionario de interfaz en
// src/i18n/dictionary.ts. Los activos aparecen en LanguageSelector, se
// enlazan desde el sitio y entran al sitemap (ver el filtro en
// astro.config.mjs, que se deriva de esta lista).
//
// Hoy solo `es` está activo, y es una decisión de producto: la interfaz se
// mantiene en un solo idioma. `de` llegó a estar activo (con sus 5 cursos y
// su diccionario) y se quitó entero. `en` tiene el curso en-de escrito pero
// no tiene diccionario, así que activarlo mostraría lecciones en inglés
// dentro de una interfaz en español.
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
  { id: 'en', name: 'English', flag: '🇬🇧', bcp47: 'en-US', active: false },
  { id: 'fr', name: 'Français', flag: '🇫🇷', bcp47: 'fr-FR', active: false },
  { id: 'it', name: 'Italiano', flag: '🇮🇹', bcp47: 'it-IT', active: false },
  { id: 'pt', name: 'Português', flag: '🇵🇹', bcp47: 'pt-PT', active: false },
];

export const ACTIVE_USER_LANGUAGES = USER_LANGUAGES.filter((l) => l.active);

export const USER_LANGUAGE_MAP = Object.fromEntries(USER_LANGUAGES.map((l) => [l.id, l])) as Record<
  UserLanguageId,
  UserLanguageMeta
>;
