import type { UserLanguageId } from '../data/userLanguages';
import { en, es, type Dictionary } from './dictionary';

// Un diccionario por UserLanguageId. Hoy existen `es` y `en`, los dos idiomas
// de interfaz activos (ver src/data/userLanguages.ts). Hubo uno en alemán y se
// quitó junto con sus cursos `de-*`.
//
// Agregar uno nuevo acá es el paso real de "traducir la interfaz", y va ANTES
// de activarlo en USER_LANGUAGES, nunca al revés: el tipo Dictionary no
// admite claves parciales, así que o está completo o el build falla.
const dictionaries: Partial<Record<UserLanguageId, Dictionary>> = {
  es,
  en,
};

// Si el userLang pedido todavía no tiene diccionario propio, cae a `es`
// (el idioma con contenido real hoy) en vez de romper — así activar un
// idioma nuevo en USER_LANGUAGES antes de terminar su traducción no deja
// la interfaz con strings undefined.
export function getDictionary(userLang: UserLanguageId): Dictionary {
  return dictionaries[userLang] ?? es;
}

export type { Dictionary };
