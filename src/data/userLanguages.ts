// Idiomas de INTERFAZ posibles para la arquitectura SILO [userLang]/[targetLang]/...
// Hoy solo "es" tiene contenido real (todas las lecciones viven bajo
// src/content/lessons/es-*); el resto queda listado para cuando se traduzca
// la interfaz, pero `active: false` los excluye de getStaticPaths para no
// generar páginas vacías.
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
