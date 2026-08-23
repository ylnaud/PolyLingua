import type { LanguageId } from './languages';

export interface MatrixWord {
  word: string;
  es: string;
  forms?: string[];
}

export interface MatrixColumn {
  label: string;
  labelTarget: string;
  items: MatrixWord[];
}

export interface PhraseMatrix {
  id: string;
  name: string;
  description: string;
  columns: MatrixColumn[];
}

export type PhraseAssembler = (words: string[]) => string;

export interface LanguageMatrixConfig {
  matrices: PhraseMatrix[];
  assemble: PhraseAssembler;
}

const GERMAN_SUBJECTS: MatrixWord[] = [
  { word: 'Ich', es: 'yo' },
  { word: 'Du', es: 'tú' },
  { word: 'Er', es: 'él' },
  { word: 'Sie', es: 'ella' },
  { word: 'Wir', es: 'nosotros' },
  { word: 'Ihr', es: 'vosotros' },
];

const GERMAN_MODALS: MatrixWord[] = [
  {
    word: 'wollen',
    es: 'querer',
    forms: ['will', 'willst', 'will', 'will', 'wollen', 'wollt'],
  },
  {
    word: 'müssen',
    es: 'deber',
    forms: ['muss', 'musst', 'muss', 'muss', 'müssen', 'müsst'],
  },
  {
    word: 'können',
    es: 'poder',
    forms: ['kann', 'kannst', 'kann', 'kann', 'können', 'könnt'],
  },
  {
    word: 'sollen',
    es: 'debería',
    forms: ['soll', 'sollst', 'soll', 'soll', 'sollen', 'sollt'],
  },
];

const GERMAN_OBJECTS: MatrixWord[] = [
  { word: 'Deutsch', es: 'alemán' },
  { word: 'Englisch', es: 'inglés' },
  { word: 'Französisch', es: 'francés' },
  { word: 'Spanisch', es: 'español' },
];

const GERMAN_VERBS: MatrixWord[] = [
  { word: 'lernen', es: 'aprender' },
  { word: 'sprechen', es: 'hablar' },
  { word: 'lesen', es: 'leer' },
  { word: 'studieren', es: 'estudiar' },
];

const ENGLISH_SUBJECTS: MatrixWord[] = [
  { word: 'I', es: 'yo' },
  { word: 'You', es: 'tú' },
  { word: 'He', es: 'él' },
  { word: 'She', es: 'ella' },
  { word: 'We', es: 'nosotros' },
  { word: 'They', es: 'ellos' },
];

const ENGLISH_MODALS: MatrixWord[] = [
  {
    word: 'want to',
    es: 'querer',
    forms: ['want to', 'want to', 'wants to', 'wants to', 'want to', 'want to'],
  },
  {
    word: 'need to',
    es: 'necesitar',
    forms: ['need to', 'need to', 'needs to', 'needs to', 'need to', 'need to'],
  },
  {
    word: 'have to',
    es: 'tener que',
    forms: ['have to', 'have to', 'has to', 'has to', 'have to', 'have to'],
  },
  {
    word: 'like to',
    es: 'gustar',
    forms: ['like to', 'like to', 'likes to', 'likes to', 'like to', 'like to'],
  },
];

const ENGLISH_ACTIONS: MatrixWord[] = [
  { word: 'learn', es: 'aprender' },
  { word: 'speak', es: 'hablar' },
  { word: 'read', es: 'leer' },
  { word: 'study', es: 'estudiar' },
];

const ENGLISH_OBJECTS: MatrixWord[] = [
  { word: 'German', es: 'alemán' },
  { word: 'English', es: 'inglés' },
  { word: 'French', es: 'francés' },
  { word: 'Spanish', es: 'español' },
];

const FRENCH_SUBJECTS: MatrixWord[] = [
  { word: 'Je', es: 'yo' },
  { word: 'Tu', es: 'tú' },
  { word: 'Il', es: 'él' },
  { word: 'Elle', es: 'ella' },
  { word: 'Nous', es: 'nosotros' },
  { word: 'Vous', es: 'vosotros' },
];

const FRENCH_MODALS: MatrixWord[] = [
  {
    word: 'vouloir',
    es: 'querer',
    forms: ['veux', 'veux', 'veut', 'veut', 'voulons', 'voulez'],
  },
  {
    word: 'devoir',
    es: 'deber',
    forms: ['dois', 'dois', 'doit', 'doit', 'devons', 'devez'],
  },
  {
    word: 'pouvoir',
    es: 'poder',
    forms: ['peux', 'peux', 'peut', 'peut', 'pouvons', 'pouvez'],
  },
  {
    word: 'aimer',
    es: 'gustar',
    forms: ['aime', 'aimes', 'aime', 'aime', 'aimons', 'aimez'],
  },
];

const FRENCH_ACTIONS: MatrixWord[] = [
  { word: 'apprendre', es: 'aprender' },
  { word: 'parler', es: 'hablar' },
  { word: 'lire', es: 'leer' },
  { word: 'étudier', es: 'estudiar' },
];

const FRENCH_OBJECTS: MatrixWord[] = [
  { word: "l'allemand", es: 'alemán' },
  { word: "l'anglais", es: 'inglés' },
  { word: 'le français', es: 'francés' },
  { word: "l'espagnol", es: 'español' },
];

const ITALIAN_SUBJECTS: MatrixWord[] = [
  { word: 'Io', es: 'yo' },
  { word: 'Tu', es: 'tú' },
  { word: 'Lui', es: 'él' },
  { word: 'Lei', es: 'ella' },
  { word: 'Noi', es: 'nosotros' },
  { word: 'Voi', es: 'vosotros' },
];

const ITALIAN_MODALS: MatrixWord[] = [
  {
    word: 'volere',
    es: 'querer',
    forms: ['voglio', 'vuoi', 'vuole', 'vuole', 'vogliamo', 'volete'],
  },
  {
    word: 'dovere',
    es: 'deber',
    forms: ['devo', 'devi', 'deve', 'deve', 'dobbiamo', 'dovete'],
  },
  {
    word: 'potere',
    es: 'poder',
    forms: ['posso', 'puoi', 'può', 'può', 'possiamo', 'potete'],
  },
  {
    word: 'preferire',
    es: 'preferir',
    forms: ['preferisco', 'preferisci', 'preferisce', 'preferisce', 'preferiamo', 'preferite'],
  },
];

const ITALIAN_ACTIONS: MatrixWord[] = [
  { word: 'imparare', es: 'aprender' },
  { word: 'parlare', es: 'hablar' },
  { word: 'leggere', es: 'leer' },
  { word: 'studiare', es: 'estudiar' },
];

const ITALIAN_OBJECTS: MatrixWord[] = [
  { word: 'il tedesco', es: 'alemán' },
  { word: "l'inglese", es: 'inglés' },
  { word: 'il francese', es: 'francés' },
  { word: 'lo spagnolo', es: 'español' },
];

const PORTUGUESE_SUBJECTS: MatrixWord[] = [
  { word: 'Eu', es: 'yo' },
  { word: 'Tu', es: 'tú' },
  { word: 'Ele', es: 'él' },
  { word: 'Ela', es: 'ella' },
  { word: 'Nós', es: 'nosotros' },
  { word: 'Vocês', es: 'vosotros' },
];

const PORTUGUESE_MODALS: MatrixWord[] = [
  {
    word: 'querer',
    es: 'querer',
    forms: ['quero', 'queres', 'quer', 'quer', 'queremos', 'querem'],
  },
  {
    word: 'precisar',
    es: 'necesitar',
    forms: ['preciso', 'precisas', 'precisa', 'precisa', 'precisamos', 'precisam'],
  },
  {
    word: 'poder',
    es: 'poder',
    forms: ['posso', 'podes', 'pode', 'pode', 'podemos', 'podem'],
  },
  {
    word: 'dever',
    es: 'deber',
    forms: ['devo', 'deves', 'deve', 'deve', 'devemos', 'devem'],
  },
];

const PORTUGUESE_ACTIONS: MatrixWord[] = [
  { word: 'aprender', es: 'aprender' },
  { word: 'falar', es: 'hablar' },
  { word: 'ler', es: 'leer' },
  { word: 'estudar', es: 'estudiar' },
];

const PORTUGUESE_OBJECTS: MatrixWord[] = [
  { word: 'alemão', es: 'alemán' },
  { word: 'inglês', es: 'inglés' },
  { word: 'francês', es: 'francés' },
  { word: 'espanhol', es: 'español' },
];

function joinWords(words: string[]): string {
  return words.join(' ');
}

const VOWELS = 'aeiouyâàéèêëîïôùûüœæ';

function frenchAssemble(words: string[]): string {
  if (words.length < 2) return words.join(' ');
  const [subject, ...rest] = words;
  if (subject.toLowerCase() === 'je' && rest.length > 0) {
    const next = rest[0];
    if (next && VOWELS.includes(next[0].toLowerCase())) {
      return "J'" + next + (rest.length > 1 ? ' ' + rest.slice(1).join(' ') : '');
    }
  }
  return words.join(' ');
}

export const MATRIX_DATA: Record<LanguageId, LanguageMatrixConfig> = {
  de: {
    matrices: [
      {
        id: 'basico-modal',
        name: 'Verbos modales',
        description:
          'Combina sujetos, verbos modales, idiomas e infinitivos. En alemán el infinitivo va al final de la frase.',
        columns: [
          { label: 'Quién', labelTarget: 'Subjekt', items: GERMAN_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modalverb', items: GERMAN_MODALS },
          { label: 'Qué', labelTarget: 'Objekt', items: GERMAN_OBJECTS },
          { label: 'Acción', labelTarget: 'Infinitiv', items: GERMAN_VERBS },
        ],
      },
    ],
    assemble: joinWords,
  },
  en: {
    matrices: [
      {
        id: 'basico-modal',
        name: 'Modal verbs',
        description:
          'Combina sujetos, modales, acciones y objetos. El orden en inglés es sujeto-modal-acción-objeto.',
        columns: [
          { label: 'Quién', labelTarget: 'Subject', items: ENGLISH_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', items: ENGLISH_MODALS },
          { label: 'Acción', labelTarget: 'Action', items: ENGLISH_ACTIONS },
          { label: 'Qué', labelTarget: 'Object', items: ENGLISH_OBJECTS },
        ],
      },
    ],
    assemble: joinWords,
  },
  fr: {
    matrices: [
      {
        id: 'basico-modal',
        name: 'Verbes modaux',
        description:
          'Combina sujetos, modales, acciones y objetos. El francés aplica elisión (je + vocal = j\').',
        columns: [
          { label: 'Quién', labelTarget: 'Sujet', items: FRENCH_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', items: FRENCH_MODALS },
          { label: 'Acción', labelTarget: 'Action', items: FRENCH_ACTIONS },
          { label: 'Qué', labelTarget: 'Objet', items: FRENCH_OBJECTS },
        ],
      },
    ],
    assemble: frenchAssemble,
  },
  it: {
    matrices: [
      {
        id: 'basico-modal',
        name: 'Verbi modali',
        description:
          'Combina sujetos, modales, acciones y objetos. El italiano sigue el orden sujeto-modal-acción-objeto.',
        columns: [
          { label: 'Quién', labelTarget: 'Soggetto', items: ITALIAN_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modale', items: ITALIAN_MODALS },
          { label: 'Acción', labelTarget: 'Azione', items: ITALIAN_ACTIONS },
          { label: 'Qué', labelTarget: 'Oggetto', items: ITALIAN_OBJECTS },
        ],
      },
    ],
    assemble: joinWords,
  },
  pt: {
    matrices: [
      {
        id: 'basico-modal',
        name: 'Verbos modais',
        description:
          'Combina sujetos, modales, acciones y objetos. El portugués sigue sujeto-modal-acción-objeto.',
        columns: [
          { label: 'Quién', labelTarget: 'Sujeito', items: PORTUGUESE_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', items: PORTUGUESE_MODALS },
          { label: 'Acción', labelTarget: 'Ação', items: PORTUGUESE_ACTIONS },
          { label: 'Qué', labelTarget: 'Objeto', items: PORTUGUESE_OBJECTS },
        ],
      },
    ],
    assemble: joinWords,
  },
};
