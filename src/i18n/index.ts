import type { UserLanguageId } from '../data/userLanguages';
import { de, es, type Dictionary } from './dictionary';

// Un diccionario por UserLanguageId, poblado a medida que se traduzca la
// interfaz. Hoy solo `es` existe — es el único idioma de interfaz activo
// (ver src/data/userLanguages.ts). Agregar un idioma nuevo acá (ej. `en`)
// es el paso real de "traducir la interfaz", además de activarlo en
// USER_LANGUAGES.
const dictionaries: Partial<Record<UserLanguageId, Dictionary>> = {
  es,
  de,
};

// Si el userLang pedido todavía no tiene diccionario propio, cae a `es`
// (el idioma con contenido real hoy) en vez de romper — así activar un
// idioma nuevo en USER_LANGUAGES antes de terminar su traducción no deja
// la interfaz con strings undefined.
export function getDictionary(userLang: UserLanguageId): Dictionary {
  return dictionaries[userLang] ?? es;
}

export type { Dictionary };
