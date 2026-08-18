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
};
