export type LanguageId = 'de' | 'en' | 'fr' | 'it' | 'pt';

export interface LanguageMeta {
  id: LanguageId;
  name: string;
  nativeName: string;
  flag: string;
  tagline: string;
  description: string;
  color: string;
}

export const LANGUAGES: LanguageMeta[] = [
  {
    id: 'de',
    name: 'Alemán',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    tagline: 'Precisión, casos y palabras larguísimas',
    description:
      'El idioma de la lógica: reglas claras, orden de palabras curioso y un vocabulario que se construye como piezas de Lego.',
    color: '#d80027',
  },
  {
    id: 'en',
    name: 'Inglés',
    nativeName: 'English',
    flag: '🇬🇧',
    tagline: 'El idioma que ya usas sin saberlo',
    description:
      'Gramática simple en la superficie, con matices (tiempos verbales, phrasal verbs) que marcan la diferencia entre sonar bien y sonar nativo.',
    color: '#2f5fce',
  },
  {
    id: 'fr',
    name: 'Francés',
    nativeName: 'Français',
    flag: '🇫🇷',
    tagline: 'Elegancia, género y ese famoso subjonctif',
    description:
      'Sonidos nasales, un género gramatical por dominar y un modo subjuntivo que separa a los buenos hablantes de los excelentes.',
    color: '#3d5ce8',
  },
  {
    id: 'it',
    name: 'Italiano',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    tagline: 'Melódico, expresivo y más cercano de lo que crees',
    description:
      'Muy afín al español en vocabulario, con su propio ritmo, dobles consonantes y un congiuntivo que vale la pena conquistar.',
    color: '#2f9e6e',
  },
  {
    id: 'pt',
    name: 'Portugués',
    nativeName: 'Português',
    flag: '🇵🇹',
    tagline: 'El primo cercano que sorprende con sus matices',
    description:
      'Parecido al español en superficie, con sonidos nasales propios y estructuras (como el futuro do subjuntivo) que no existen en tu idioma.',
    color: '#1f8a5c',
  },
];

export const LANGUAGE_MAP = Object.fromEntries(
  LANGUAGES.map((l) => [l.id, l])
) as Record<LanguageId, LanguageMeta>;
