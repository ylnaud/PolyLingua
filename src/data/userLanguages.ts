// Idiomas de INTERFAZ posibles para la arquitectura SILO [userLang]/[targetLang]/...
//
// `active: true` significa que ese idioma tiene DOS cosas: lecciones propias
// bajo src/content/lessons/<id>-* y un diccionario de interfaz en
// src/i18n/dictionary.ts. Los activos aparecen en LanguageSelector, se
// enlazan desde el sitio y entran al sitemap (ver el filtro en
// astro.config.mjs, que se deriva de esta lista).
//
// Hoy solo `es` está activo. `de` llegó a estarlo, con sus 5 cursos `de-*`
// (386 lecciones) y su diccionario, y se quitó entero; está en el historial de
// git si algún día se quiere de vuelta.
//
// `en` está a medio camino, y conviene saber en qué mitad. YA tiene su
// diccionario completo en src/i18n/dictionary.ts, así que el silo /en/ pinta
// la interfaz en inglés de verdad — antes declaraba <html lang="en-US"> y
// mostraba la cáscara en español, que es peor que no traducirla porque el
// atributo de idioma mentía a buscadores y lectores de pantalla.
//
// Lo que falta para poder poner `active: true` NO es el diccionario, es el
// español que vive fuera de él y que solo se ve al mirar una página /en/:
//
//   - src/data/tsa.ts — 735 líneas, 30 bloques de prosa SEO por curso y
//     nivel. No se traduce: hay que ESCRIBIRLO en inglés.
//   - src/data/units.ts — las descripciones de unidad de todos los cursos.
//   - DailyGoal, StreakReminder, BackupReminder y DrillTutor: montados en
//     todas las páginas y con los textos escritos a mano, sin userLang.
//   - LanguageCard («lecciones»), src/pages/index.astro y
//     src/pages/[userLang]/index.astro.
//
// Activarlo antes de eso publicaría 92 URLs mitad en inglés y mitad en
// español, y encima indexadas. El orden correcto es siempre: primero que la
// página esté entera en su idioma, después el flag.
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
