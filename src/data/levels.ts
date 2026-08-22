export type LevelId = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';

export interface LevelMeta {
  id: LevelId;
  name: string;
  tagline: string;
  description: string;
  color: string;
  emoji: string;
}

export const LEVELS: LevelMeta[] = [
  {
    id: 'a1',
    name: 'A1 · Principiante',
    tagline: 'Tus primeras palabras',
    description:
      'Preséntate, pide algo de comer y sobrevive tu primer día hablando el idioma sin entrar en pánico.',
    color: '#2f9e6e',
    emoji: '🌱',
  },
  {
    id: 'a2',
    name: 'A2 · Elemental',
    tagline: 'Cuenta lo que hiciste ayer',
    description: 'Pasado, rutinas y las primeras frases que te hacen sonar (casi) como un local.',
    color: '#2f8fce',
    emoji: '🧩',
  },
  {
    id: 'b1',
    name: 'B1 · Intermedio',
    tagline: 'Conversaciones con sustancia',
    description:
      'Conecta ideas con causa, contraste y condición, y empieza a opinar como quien domina el idioma.',
    color: '#5b6ee1',
    emoji: '🧭',
  },
  {
    id: 'b2',
    name: 'B2 · Intermedio alto',
    tagline: 'Domina la voz pasiva y el subjuntivo',
    description: 'Habla de hipótesis, noticias y matices con la precisión de un hablante avanzado.',
    color: '#8a5bd6',
    emoji: '⚙️',
  },
  {
    id: 'c1',
    name: 'C1 · Avanzado',
    tagline: 'Estilo, matices y modo subjuntivo',
    description: 'Redacta, debate y comprende textos complejos con soltura casi nativa.',
    color: '#c2569b',
    emoji: '🎓',
  },
  {
    id: 'c2',
    name: 'C2 · Maestría',
    tagline: 'El idioma al nivel de un nativo culto',
    description: 'Ironía, registro coloquial y matices estilísticos que solo dominan los expertos.',
    color: '#d6763a',
    emoji: '👑',
  },
];

export const LEVEL_MAP = Object.fromEntries(LEVELS.map((l) => [l.id, l])) as Record<
  LevelId,
  LevelMeta
>;
