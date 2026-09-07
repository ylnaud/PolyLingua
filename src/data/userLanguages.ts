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
//
// Por qué son TRES y no seis. La lista llegó a incluir `fr`, `it` y `pt`, y no
// eran un plan: eran tres filas grises en el selector del header prometiendo
// una interfaz que nadie estaba escribiendo. Ninguno tenía diccionario en
// src/i18n/dictionary.ts ni lecciones bajo src/content/lessons/fr-*, it-* ni
// pt-*, así que no generaban una sola página — su único efecto era la promesa.
// Si algún día se retoman están en el historial de git, igual que el alemán;
// pero reponerlos "porque la arquitectura los soporta" es volver a prometer.
//
// Ojo con no confundir ejes: francés, italiano y portugués SIGUEN enseñándose.
// Eso es el idioma META y vive en src/data/languages.ts, otro archivo.
export type UserLanguageId = 'es' | 'de' | 'en';

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
];

export const ACTIVE_USER_LANGUAGES = USER_LANGUAGES.filter((l) => l.active);

export const USER_LANGUAGE_MAP = Object.fromEntries(USER_LANGUAGES.map((l) => [l.id, l])) as Record<
  UserLanguageId,
  UserLanguageMeta
>;
