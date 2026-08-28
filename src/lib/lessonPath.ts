// Las lecciones viven en src/content/lessons/[userLang]-[targetLang]/[level]/[slug].md,
// así que el id que da la Content Collection (glob loader) tiene la forma
// "es-de/a1/articulos-der-die-das". Este helper es el único lugar que conoce
// ese formato — todas las rutas del silo [userLang]/[targetLang]/... lo usan
// en vez de repetir el split a mano.
export interface LessonPathParts {
  userLang: string;
  targetLang: string;
  level: string;
  slug: string;
}

export function parseLessonId(id: string): LessonPathParts {
  const [combo, level, slug] = id.split('/');
  const [userLang, targetLang] = combo.split('-');
  return { userLang, targetLang, level, slug };
}
