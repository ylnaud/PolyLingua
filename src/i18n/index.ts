import type { UserLanguageId } from '../data/userLanguages';
import { es, type Dictionary } from './dictionary';

// Un diccionario por UserLanguageId. Hoy solo existe `es`, el único idioma
// de interfaz activo (ver src/data/userLanguages.ts). Hubo uno en alemán y se
// quitó: la decisión es mantener la interfaz en un solo idioma. Agregar uno
// nuevo acá es el paso real de "traducir la interfaz", además de activarlo en
// USER_LANGUAGES — y el tipo Dictionary no admite claves parciales, así que
// tiene que estar completo o el build falla.
const dictionaries: Partial<Record<UserLanguageId, Dictionary>> = {
  es,
};

// Si el userLang pedido todavía no tiene diccionario propio, cae a `es`
// (el idioma con contenido real hoy) en vez de romper — así activar un
// idioma nuevo en USER_LANGUAGES antes de terminar su traducción no deja
// la interfaz con strings undefined.
export function getDictionary(userLang: UserLanguageId): Dictionary {
  return dictionaries[userLang] ?? es;
}

export type { Dictionary };
