import type { LanguageId } from './languages';

export interface ResourceItem {
  category: 'podcast' | 'serie' | 'pelicula' | 'lectura';
  title: string;
  note: string;
  level?: string;
}

// Recomendaciones de inmersión por idioma — solo títulos reales y ampliamente
// documentados (nada inventado). Las de alemán vienen directo de un video sobre
// técnicas de estudio que compartió el usuario; las de los otros 4 idiomas son
// equivalentes de alta confianza (medios/series/podcasts hechos específicamente
// para estudiantes, o muy conocidos en su idioma original).
export const RESOURCES: Record<LanguageId, ResourceItem[]> = {
  de: [
    { category: 'podcast', title: 'Slow German (Annik Rubens)', note: 'Alemán hablado despacio y claro, pensado para estudiantes.', level: 'A2–B1' },
    { category: 'podcast', title: 'Deutsche Welle — Langsam gesprochene Nachrichten', note: 'Noticias reales, narradas más lento de lo habitual.', level: 'A2–B2' },
    { category: 'serie', title: 'Dark', note: 'Serie de Netflix, alemán natural con mucho diálogo.', level: 'B2+' },
    { category: 'serie', title: 'Tatort', note: 'La serie policial más longeva de Alemania — alemán cotidiano.', level: 'B1+' },
    { category: 'serie', title: 'Dogs of Berlin', note: 'Serie policial ambientada en Berlín (Netflix).', level: 'B2+' },
    { category: 'serie', title: 'How to Sell Drugs Online (Fast)', note: 'Basada en una historia real, rodada en Alemania.', level: 'B1+' },
    { category: 'serie', title: 'Stromberg', note: 'La versión alemana de "The Office" — vocabulario de oficina, no muy complejo.', level: 'B1+' },
    { category: 'serie', title: '4 Blocks', note: 'Serie sobre el mundo criminal de Berlín.', level: 'B2+' },
    { category: 'pelicula', title: 'Sonne und Beton', note: 'Película sobre adolescentes en Berlín.', level: 'B1+' },
    { category: 'pelicula', title: 'Im Westen nichts Neues', note: '"Sin novedad en el frente" — adaptación de Netflix.', level: 'B2+' },
    { category: 'pelicula', title: 'Das Experiment', note: 'Thriller psicológico alemán.', level: 'B1+' },
    { category: 'pelicula', title: 'Goodbye, Lenin!', note: 'Clásico del cine alemán, ritmo accesible.', level: 'B1+' },
    { category: 'lectura', title: 'Der kleine Prinz', note: 'El Principito en alemán — vocabulario simple, ideal para empezar a leer.', level: 'A2–B1' },
    { category: 'lectura', title: 'Revista Deutsch Perfekt', note: 'Artículos escritos específicamente para estudiantes de alemán.', level: 'B1+' },
  ],
  en: [
    { category: 'podcast', title: 'BBC Learning English — 6 Minute English', note: 'Episodios cortos sobre temas de actualidad, pensados para estudiantes.', level: 'A2–B2' },
    { category: 'serie', title: 'Extra English', note: 'Sitcom hecha específicamente para aprender inglés.', level: 'A2–B1' },
    { category: 'serie', title: 'Friends', note: 'Diálogos claros y muy usados en la enseñanza de inglés.', level: 'B1+' },
    { category: 'lectura', title: 'Graded readers (Oxford / Penguin Readers)', note: 'Libros adaptados por nivel — buscá el tuyo en la colección de tu nivel.', level: 'A1–B2' },
  ],
  fr: [
    { category: 'podcast', title: 'RFI — Journal en français facile', note: 'Noticias diarias narradas con vocabulario y ritmo simplificados.', level: 'A2–B1' },
    { category: 'serie', title: 'Extra French', note: 'Sitcom hecha específicamente para aprender francés.', level: 'A2–B1' },
    { category: 'serie', title: "Dix pour cent (Call My Agent!)", note: 'Serie francesa muy popular, diálogos naturales.', level: 'B2+' },
    { category: 'lectura', title: 'Le Petit Prince', note: 'El Principito en francés original — vocabulario simple.', level: 'A2–B1' },
  ],
  it: [
    { category: 'podcast', title: 'News in Slow Italian', note: 'Noticias narradas despacio, pensadas para estudiantes.', level: 'A2–B1' },
    { category: 'serie', title: 'Il Commissario Montalbano', note: 'Serie policial italiana muy conocida, ritmo de conversación real.', level: 'B1+' },
    { category: 'lectura', title: 'Il piccolo principe', note: 'El Principito en italiano — vocabulario simple.', level: 'A2–B1' },
  ],
  pt: [
    { category: 'podcast', title: 'Practice Portuguese', note: 'Podcast y recursos hechos para estudiantes, en portugués europeo.', level: 'A2–B2' },
    { category: 'serie', title: '3%', note: 'Serie brasileña de ciencia ficción (Netflix), muy popular.', level: 'B1+' },
    { category: 'lectura', title: 'O Principezinho', note: 'El Principito en portugués — vocabulario simple.', level: 'A2–B1' },
  ],
};

export const CATEGORY_LABELS: Record<ResourceItem['category'], string> = {
  podcast: '🎙️ Podcasts',
  serie: '📺 Series',
  pelicula: '🎬 Películas',
  lectura: '📖 Lectura',
};
