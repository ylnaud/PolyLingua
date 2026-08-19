export interface UnitMeta {
  id: number;
  name: string;
  description: string;
  emoji: string;
}

export const UNITS: Record<string, UnitMeta[]> = {
  'de-a1': [
    { id: 1, name: 'Erste Schritte', description: 'Pronunciación y primeras frases', emoji: '👋' },
    { id: 2, name: 'Grammatik-Grundlagen', description: 'Las bases gramaticales', emoji: '📐' },
    { id: 3, name: 'Meine Welt', description: 'Vocabulario del día a día', emoji: '🌍' },
    { id: 4, name: 'Alltag', description: 'Situaciones cotidianas', emoji: '🏠' },
    { id: 5, name: 'Unterwegs', description: 'Fuera de casa', emoji: '🚌' },
  ],
  'en-a1': [
    { id: 1, name: 'First Sounds', description: 'Pronunciación desde cero', emoji: '🗣️' },
    { id: 2, name: 'Grammar Foundations', description: 'Las bases gramaticales', emoji: '📐' },
    { id: 3, name: 'Everyday Life', description: 'Vocabulario del día a día', emoji: '🌍' },
  ],
  'fr-a1': [
    { id: 1, name: 'Les bases', description: 'Gramática esencial', emoji: '📐' },
    { id: 2, name: 'Parler au quotidien', description: 'Vocabulario y conversación', emoji: '💬' },
  ],
  'it-a1': [
    { id: 1, name: 'Le basi', description: 'Gramática esencial', emoji: '📐' },
    { id: 2, name: 'Parlare ogni giorno', description: 'Vocabulario y conversación', emoji: '💬' },
  ],
  'pt-a1': [
    { id: 1, name: 'As bases', description: 'Gramática esencial', emoji: '📐' },
    { id: 2, name: 'Falar no dia a dia', description: 'Vocabulario y conversación', emoji: '💬' },
  ],
  'de-a2': [
    { id: 1, name: 'Die Vergangenheit', description: 'Pasado y verbos modales', emoji: '⏳' },
    { id: 2, name: 'Der richtige Fall', description: 'Casos y preposiciones', emoji: '🎯' },
    { id: 3, name: 'Pronomen & Präpositionen', description: 'Pronombres y preposiciones fijas', emoji: '🔗' },
    { id: 4, name: 'Alltag meistern', description: 'Situaciones cotidianas avanzadas', emoji: '🏙️' },
  ],
  'en-a2': [
    { id: 1, name: 'Building Blocks', description: 'Estructuras gramaticales clave', emoji: '🧱' },
    { id: 2, name: 'Real-World English', description: 'Inglés para el día a día', emoji: '🌎' },
  ],
  'fr-a2': [
    { id: 1, name: 'Construire des phrases', description: 'Estructuras gramaticales clave', emoji: '🧱' },
    { id: 2, name: "S'exprimer au quotidien", description: 'Expresarse en el día a día', emoji: '🗣️' },
  ],
  'it-a2': [
    { id: 1, name: 'Costruire frasi', description: 'Estructuras gramaticales clave', emoji: '🧱' },
    { id: 2, name: 'Esprimersi ogni giorno', description: 'Expresarse en el día a día', emoji: '🗣️' },
  ],
  'pt-a2': [
    { id: 1, name: 'Construir frases', description: 'Estructuras gramaticales clave', emoji: '🧱' },
    { id: 2, name: 'Expressar-se no dia a dia', description: 'Expresarse en el día a día', emoji: '🗣️' },
  ],
};
