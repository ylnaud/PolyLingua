import type { LanguageId } from './languages';
import type { LevelId } from './levels';

export interface MatrixWord {
  word: string;
  es: string;
  forms?: string[];
  esForms?: string[];
}

export type MatrixColumnRole = 'subject' | 'modal' | 'action' | 'object';

export interface MatrixColumn {
  label: string;
  labelTarget: string;
  role: MatrixColumnRole;
  items: MatrixWord[];
}

export interface PhraseMatrix {
  id: string;
  name: string;
  description: string;
  level: LevelId;
  columns: MatrixColumn[];
}

export type PhraseAssembler = (words: string[]) => string;

export interface LanguageMatrixConfig {
  matrices: PhraseMatrix[];
  assemble: PhraseAssembler;
}

// Conjugaciones al español compartidas entre idiomas: cada string ya incluye
// el sujeto ("Yo quiero", no solo "quiero") para poder resolver de forma
// pareja construcciones irregulares como "gustar" (pronombre + "gusta", no
// conjugación por sujeto) sin reglas especiales por verbo.
const ES_QUERER = ['Yo quiero', 'Tú quieres', 'Él quiere', 'Ella quiere', 'Nosotros queremos', 'Vosotros queréis'];
const ES_DEBER = ['Yo debo', 'Tú debes', 'Él debe', 'Ella debe', 'Nosotros debemos', 'Vosotros debéis'];
const ES_PODER = ['Yo puedo', 'Tú puedes', 'Él puede', 'Ella puede', 'Nosotros podemos', 'Vosotros podéis'];
const ES_DEBERIA = [
  'Yo debería',
  'Tú deberías',
  'Él debería',
  'Ella debería',
  'Nosotros deberíamos',
  'Vosotros deberíais',
];
const ES_NECESITAR = [
  'Yo necesito',
  'Tú necesitas',
  'Él necesita',
  'Ella necesita',
  'Nosotros necesitamos',
  'Vosotros necesitáis',
];
const ES_TENER_QUE = [
  'Yo tengo que',
  'Tú tienes que',
  'Él tiene que',
  'Ella tiene que',
  'Nosotros tenemos que',
  'Vosotros tenéis que',
];
const ES_GUSTAR = [
  'A mí me gusta',
  'A ti te gusta',
  'A él le gusta',
  'A ella le gusta',
  'A nosotros nos gusta',
  'A vosotros os gusta',
];
const ES_PREFERIR = [
  'Yo prefiero',
  'Tú prefieres',
  'Él prefiere',
  'Ella prefiere',
  'Nosotros preferimos',
  'Vosotros preferís',
];

// Mismos verbos, ahora en pretérito imperfecto (para la matriz de A2 "pasado").
const ES_QUERIA = ['Yo quería', 'Tú querías', 'Él quería', 'Ella quería', 'Nosotros queríamos', 'Vosotros queríais'];
const ES_DEBIA = ['Yo debía', 'Tú debías', 'Él debía', 'Ella debía', 'Nosotros debíamos', 'Vosotros debíais'];
const ES_PODIA = ['Yo podía', 'Tú podías', 'Él podía', 'Ella podía', 'Nosotros podíamos', 'Vosotros podíais'];
const ES_NECESITABA = [
  'Yo necesitaba',
  'Tú necesitabas',
  'Él necesitaba',
  'Ella necesitaba',
  'Nosotros necesitábamos',
  'Vosotros necesitabais',
];
const ES_TENIA_QUE = [
  'Yo tenía que',
  'Tú tenías que',
  'Él tenía que',
  'Ella tenía que',
  'Nosotros teníamos que',
  'Vosotros teníais que',
];
const ES_GUSTABA = [
  'A mí me gustaba',
  'A ti te gustaba',
  'A él le gustaba',
  'A ella le gustaba',
  'A nosotros nos gustaba',
  'A vosotros os gustaba',
];
const ES_PREFERIA = [
  'Yo prefería',
  'Tú preferías',
  'Él prefería',
  'Ella prefería',
  'Nosotros preferíamos',
  'Vosotros preferíais',
];

// Mismos verbos, ahora en condicional (para la matriz de B1 "cortesía/hipótesis").
const ES_QUISIERA = [
  'Yo quisiera',
  'Tú quisieras',
  'Él quisiera',
  'Ella quisiera',
  'Nosotros quisiéramos',
  'Vosotros quisierais',
];
const ES_PODRIA = ['Yo podría', 'Tú podrías', 'Él podría', 'Ella podría', 'Nosotros podríamos', 'Vosotros podríais'];
const ES_NECESITARIA = [
  'Yo necesitaría',
  'Tú necesitarías',
  'Él necesitaría',
  'Ella necesitaría',
  'Nosotros necesitaríamos',
  'Vosotros necesitaríais',
];
const ES_TENDRIA_QUE = [
  'Yo tendría que',
  'Tú tendrías que',
  'Él tendría que',
  'Ella tendría que',
  'Nosotros tendríamos que',
  'Vosotros tendríais que',
];
const ES_GUSTARIA = [
  'A mí me gustaría',
  'A ti te gustaría',
  'A él le gustaría',
  'A ella le gustaría',
  'A nosotros nos gustaría',
  'A vosotros os gustaría',
];
const ES_PREFERIRIA = [
  'Yo preferiría',
  'Tú preferirías',
  'Él preferiría',
  'Ella preferiría',
  'Nosotros preferiríamos',
  'Vosotros preferiríais',
];

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
    esForms: ES_QUERER,
  },
  {
    word: 'müssen',
    es: 'deber',
    forms: ['muss', 'musst', 'muss', 'muss', 'müssen', 'müsst'],
    esForms: ES_DEBER,
  },
  {
    word: 'können',
    es: 'poder',
    forms: ['kann', 'kannst', 'kann', 'kann', 'können', 'könnt'],
    esForms: ES_PODER,
  },
  {
    word: 'sollen',
    es: 'debería',
    forms: ['soll', 'sollst', 'soll', 'soll', 'sollen', 'sollt'],
    esForms: ES_DEBERIA,
  },
];

const GERMAN_MODALS_PAST: MatrixWord[] = [
  {
    word: 'wollen',
    es: 'querer',
    forms: ['wollte', 'wolltest', 'wollte', 'wollte', 'wollten', 'wolltet'],
    esForms: ES_QUERIA,
  },
  {
    word: 'müssen',
    es: 'deber',
    forms: ['musste', 'musstest', 'musste', 'musste', 'mussten', 'musstet'],
    esForms: ES_DEBIA,
  },
  {
    word: 'können',
    es: 'poder',
    forms: ['konnte', 'konntest', 'konnte', 'konnte', 'konnten', 'konntet'],
    esForms: ES_PODIA,
  },
  {
    word: 'sollen',
    es: 'debía',
    forms: ['sollte', 'solltest', 'sollte', 'sollte', 'sollten', 'solltet'],
    esForms: ES_DEBIA,
  },
];

// wollen no usa condicional regular en alemán: la forma natural y cortés es
// "möchte" (de mögen), no "würde wollen" — así lo enseñan las lecciones del
// sitio. müssen/können/sollen sí usan su propio Konjunktiv II.
const GERMAN_MODALS_COND: MatrixWord[] = [
  {
    word: 'möchten',
    es: 'querer',
    forms: ['möchte', 'möchtest', 'möchte', 'möchte', 'möchten', 'möchtet'],
    esForms: ES_QUISIERA,
  },
  {
    word: 'müssen',
    es: 'deber',
    forms: ['müsste', 'müsstest', 'müsste', 'müsste', 'müssten', 'müsstet'],
    esForms: ES_DEBERIA,
  },
  {
    word: 'können',
    es: 'poder',
    forms: ['könnte', 'könntest', 'könnte', 'könnte', 'könnten', 'könntet'],
    esForms: ES_PODRIA,
  },
  {
    word: 'sollen',
    es: 'debería',
    forms: ['sollte', 'solltest', 'sollte', 'sollte', 'sollten', 'solltet'],
    esForms: ES_DEBERIA,
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
    esForms: ES_QUERER,
  },
  {
    word: 'need to',
    es: 'necesitar',
    forms: ['need to', 'need to', 'needs to', 'needs to', 'need to', 'need to'],
    esForms: ES_NECESITAR,
  },
  {
    word: 'have to',
    es: 'tener que',
    forms: ['have to', 'have to', 'has to', 'has to', 'have to', 'have to'],
    esForms: ES_TENER_QUE,
  },
  {
    word: 'like to',
    es: 'gustar',
    forms: ['like to', 'like to', 'likes to', 'likes to', 'like to', 'like to'],
    esForms: ES_GUSTAR,
  },
];

const ENGLISH_MODALS_PAST: MatrixWord[] = [
  {
    word: 'wanted to',
    es: 'querer',
    forms: ['wanted to', 'wanted to', 'wanted to', 'wanted to', 'wanted to', 'wanted to'],
    esForms: ES_QUERIA,
  },
  {
    word: 'needed to',
    es: 'necesitar',
    forms: ['needed to', 'needed to', 'needed to', 'needed to', 'needed to', 'needed to'],
    esForms: ES_NECESITABA,
  },
  {
    word: 'had to',
    es: 'tener que',
    forms: ['had to', 'had to', 'had to', 'had to', 'had to', 'had to'],
    esForms: ES_TENIA_QUE,
  },
  {
    word: 'liked to',
    es: 'gustar',
    forms: ['liked to', 'liked to', 'liked to', 'liked to', 'liked to', 'liked to'],
    esForms: ES_GUSTABA,
  },
];

const ENGLISH_MODALS_COND: MatrixWord[] = [
  {
    word: 'would like to',
    es: 'querer',
    forms: [
      'would like to',
      'would like to',
      'would like to',
      'would like to',
      'would like to',
      'would like to',
    ],
    esForms: ES_QUISIERA,
  },
  {
    word: 'would need to',
    es: 'necesitar',
    forms: [
      'would need to',
      'would need to',
      'would need to',
      'would need to',
      'would need to',
      'would need to',
    ],
    esForms: ES_NECESITARIA,
  },
  {
    word: 'would have to',
    es: 'tener que',
    forms: [
      'would have to',
      'would have to',
      'would have to',
      'would have to',
      'would have to',
      'would have to',
    ],
    esForms: ES_TENDRIA_QUE,
  },
  {
    word: 'would love to',
    es: 'gustar',
    forms: [
      'would love to',
      'would love to',
      'would love to',
      'would love to',
      'would love to',
      'would love to',
    ],
    esForms: ES_GUSTARIA,
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
    esForms: ES_QUERER,
  },
  {
    word: 'devoir',
    es: 'deber',
    forms: ['dois', 'dois', 'doit', 'doit', 'devons', 'devez'],
    esForms: ES_DEBER,
  },
  {
    word: 'pouvoir',
    es: 'poder',
    forms: ['peux', 'peux', 'peut', 'peut', 'pouvons', 'pouvez'],
    esForms: ES_PODER,
  },
  {
    word: 'aimer',
    es: 'gustar',
    forms: ['aime', 'aimes', 'aime', 'aime', 'aimons', 'aimez'],
    esForms: ES_GUSTAR,
  },
];

const FRENCH_MODALS_PAST: MatrixWord[] = [
  {
    word: 'vouloir',
    es: 'querer',
    forms: ['voulais', 'voulais', 'voulait', 'voulait', 'voulions', 'vouliez'],
    esForms: ES_QUERIA,
  },
  {
    word: 'devoir',
    es: 'deber',
    forms: ['devais', 'devais', 'devait', 'devait', 'devions', 'deviez'],
    esForms: ES_DEBIA,
  },
  {
    word: 'pouvoir',
    es: 'poder',
    forms: ['pouvais', 'pouvais', 'pouvait', 'pouvait', 'pouvions', 'pouviez'],
    esForms: ES_PODIA,
  },
  {
    word: 'aimer',
    es: 'gustar',
    forms: ['aimais', 'aimais', 'aimait', 'aimait', 'aimions', 'aimiez'],
    esForms: ES_GUSTABA,
  },
];

const FRENCH_MODALS_COND: MatrixWord[] = [
  {
    word: 'vouloir',
    es: 'querer',
    forms: ['voudrais', 'voudrais', 'voudrait', 'voudrait', 'voudrions', 'voudriez'],
    esForms: ES_QUISIERA,
  },
  {
    word: 'devoir',
    es: 'deber',
    forms: ['devrais', 'devrais', 'devrait', 'devrait', 'devrions', 'devriez'],
    esForms: ES_DEBERIA,
  },
  {
    word: 'pouvoir',
    es: 'poder',
    forms: ['pourrais', 'pourrais', 'pourrait', 'pourrait', 'pourrions', 'pourriez'],
    esForms: ES_PODRIA,
  },
  {
    word: 'aimer',
    es: 'gustar',
    forms: ['aimerais', 'aimerais', 'aimerait', 'aimerait', 'aimerions', 'aimeriez'],
    esForms: ES_GUSTARIA,
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
    esForms: ES_QUERER,
  },
  {
    word: 'dovere',
    es: 'deber',
    forms: ['devo', 'devi', 'deve', 'deve', 'dobbiamo', 'dovete'],
    esForms: ES_DEBER,
  },
  {
    word: 'potere',
    es: 'poder',
    forms: ['posso', 'puoi', 'può', 'può', 'possiamo', 'potete'],
    esForms: ES_PODER,
  },
  {
    word: 'preferire',
    es: 'preferir',
    forms: ['preferisco', 'preferisci', 'preferisce', 'preferisce', 'preferiamo', 'preferite'],
    esForms: ES_PREFERIR,
  },
];

const ITALIAN_MODALS_PAST: MatrixWord[] = [
  {
    word: 'volere',
    es: 'querer',
    forms: ['volevo', 'volevi', 'voleva', 'voleva', 'volevamo', 'volevate'],
    esForms: ES_QUERIA,
  },
  {
    word: 'dovere',
    es: 'deber',
    forms: ['dovevo', 'dovevi', 'doveva', 'doveva', 'dovevamo', 'dovevate'],
    esForms: ES_DEBIA,
  },
  {
    word: 'potere',
    es: 'poder',
    forms: ['potevo', 'potevi', 'poteva', 'poteva', 'potevamo', 'potevate'],
    esForms: ES_PODIA,
  },
  {
    word: 'preferire',
    es: 'preferir',
    forms: ['preferivo', 'preferivi', 'preferiva', 'preferiva', 'preferivamo', 'preferivate'],
    esForms: ES_PREFERIA,
  },
];

const ITALIAN_MODALS_COND: MatrixWord[] = [
  {
    word: 'volere',
    es: 'querer',
    forms: ['vorrei', 'vorresti', 'vorrebbe', 'vorrebbe', 'vorremmo', 'vorreste'],
    esForms: ES_QUISIERA,
  },
  {
    word: 'dovere',
    es: 'deber',
    forms: ['dovrei', 'dovresti', 'dovrebbe', 'dovrebbe', 'dovremmo', 'dovreste'],
    esForms: ES_DEBERIA,
  },
  {
    word: 'potere',
    es: 'poder',
    forms: ['potrei', 'potresti', 'potrebbe', 'potrebbe', 'potremmo', 'potreste'],
    esForms: ES_PODRIA,
  },
  {
    word: 'preferire',
    es: 'preferir',
    forms: ['preferirei', 'preferiresti', 'preferirebbe', 'preferirebbe', 'preferiremmo', 'preferireste'],
    esForms: ES_PREFERIRIA,
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
    esForms: ES_QUERER,
  },
  {
    word: 'precisar',
    es: 'necesitar',
    forms: ['preciso', 'precisas', 'precisa', 'precisa', 'precisamos', 'precisam'],
    esForms: ES_NECESITAR,
  },
  {
    word: 'poder',
    es: 'poder',
    forms: ['posso', 'podes', 'pode', 'pode', 'podemos', 'podem'],
    esForms: ES_PODER,
  },
  {
    word: 'dever',
    es: 'deber',
    forms: ['devo', 'deves', 'deve', 'deve', 'devemos', 'devem'],
    esForms: ES_DEBER,
  },
];

const PORTUGUESE_MODALS_PAST: MatrixWord[] = [
  {
    word: 'querer',
    es: 'querer',
    forms: ['queria', 'querias', 'queria', 'queria', 'queríamos', 'queriam'],
    esForms: ES_QUERIA,
  },
  {
    word: 'precisar',
    es: 'necesitar',
    forms: ['precisava', 'precisavas', 'precisava', 'precisava', 'precisávamos', 'precisavam'],
    esForms: ES_NECESITABA,
  },
  {
    word: 'poder',
    es: 'poder',
    forms: ['podia', 'podias', 'podia', 'podia', 'podíamos', 'podiam'],
    esForms: ES_PODIA,
  },
  {
    word: 'dever',
    es: 'deber',
    forms: ['devia', 'devias', 'devia', 'devia', 'devíamos', 'deviam'],
    esForms: ES_DEBIA,
  },
];

const PORTUGUESE_MODALS_COND: MatrixWord[] = [
  {
    word: 'gostaria de',
    es: 'querer',
    forms: [
      'gostaria de',
      'gostarias de',
      'gostaria de',
      'gostaria de',
      'gostaríamos de',
      'gostariam de',
    ],
    esForms: ES_QUISIERA,
  },
  {
    word: 'precisar',
    es: 'necesitar',
    forms: ['precisaria', 'precisarias', 'precisaria', 'precisaria', 'precisaríamos', 'precisariam'],
    esForms: ES_NECESITARIA,
  },
  {
    word: 'poder',
    es: 'poder',
    forms: ['poderia', 'poderias', 'poderia', 'poderia', 'poderíamos', 'poderiam'],
    esForms: ES_PODRIA,
  },
  {
    word: 'dever',
    es: 'deber',
    forms: ['deveria', 'deverias', 'deveria', 'deveria', 'deveríamos', 'deveriam'],
    esForms: ES_DEBERIA,
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

// El español siempre va sujeto-modal-acción-objeto, sin importar el orden de
// palabras del idioma meta (a diferencia de assemble()) — por eso ubica cada
// columna por su `role` en vez de por posición.
export function assembleSpanishSentence(matrix: PhraseMatrix, colIndices: number[]): string {
  const subjectColIdx = matrix.columns.findIndex((c) => c.role === 'subject');
  const modalColIdx = matrix.columns.findIndex((c) => c.role === 'modal');
  const actionColIdx = matrix.columns.findIndex((c) => c.role === 'action');
  const objectColIdx = matrix.columns.findIndex((c) => c.role === 'object');

  const subjectIdx = colIndices[subjectColIdx];
  const modalItem = matrix.columns[modalColIdx].items[colIndices[modalColIdx]];
  const actionEs = matrix.columns[actionColIdx].items[colIndices[actionColIdx]].es;
  const objectEs = matrix.columns[objectColIdx].items[colIndices[objectColIdx]].es;
  const subjectModalEs = modalItem.esForms?.[subjectIdx] ?? modalItem.es;

  return `${subjectModalEs} ${actionEs} ${objectEs}.`;
}

export const MATRIX_DATA: Record<LanguageId, LanguageMatrixConfig> = {
  de: {
    matrices: [
      {
        id: 'basico-modal',
        name: 'Verbos modales',
        description:
          'Combina sujetos, verbos modales, idiomas e infinitivos. En alemán el infinitivo va al final de la frase.',
        level: 'a1',
        columns: [
          { label: 'Quién', labelTarget: 'Subjekt', role: 'subject', items: GERMAN_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modalverb', role: 'modal', items: GERMAN_MODALS },
          { label: 'Qué', labelTarget: 'Objekt', role: 'object', items: GERMAN_OBJECTS },
          { label: 'Acción', labelTarget: 'Infinitiv', role: 'action', items: GERMAN_VERBS },
        ],
      },
      {
        id: 'pasado-modal',
        name: 'Verbos modales en pasado',
        description:
          'Combina sujetos, verbos modales en pasado (Präteritum), idiomas e infinitivos — para contar qué querías, podías o debías hacer.',
        level: 'a2',
        columns: [
          { label: 'Quién', labelTarget: 'Subjekt', role: 'subject', items: GERMAN_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modalverb', role: 'modal', items: GERMAN_MODALS_PAST },
          { label: 'Qué', labelTarget: 'Objekt', role: 'object', items: GERMAN_OBJECTS },
          { label: 'Acción', labelTarget: 'Infinitiv', role: 'action', items: GERMAN_VERBS },
        ],
      },
      {
        id: 'condicional-modal',
        name: 'Verbos modales de cortesía',
        description:
          'Combina sujetos con möchte/müsste/könnte/sollte para pedir las cosas con cortesía, como en alemán se pide realmente.',
        level: 'b1',
        columns: [
          { label: 'Quién', labelTarget: 'Subjekt', role: 'subject', items: GERMAN_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modalverb', role: 'modal', items: GERMAN_MODALS_COND },
          { label: 'Qué', labelTarget: 'Objekt', role: 'object', items: GERMAN_OBJECTS },
          { label: 'Acción', labelTarget: 'Infinitiv', role: 'action', items: GERMAN_VERBS },
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
        level: 'a1',
        columns: [
          { label: 'Quién', labelTarget: 'Subject', role: 'subject', items: ENGLISH_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: ENGLISH_MODALS },
          { label: 'Acción', labelTarget: 'Action', role: 'action', items: ENGLISH_ACTIONS },
          { label: 'Qué', labelTarget: 'Object', role: 'object', items: ENGLISH_OBJECTS },
        ],
      },
      {
        id: 'pasado-modal',
        name: 'Modal verbs in the past',
        description:
          'Combina sujetos, modales en pasado, acciones y objetos — para contar qué querías, necesitabas o tenías que hacer.',
        level: 'a2',
        columns: [
          { label: 'Quién', labelTarget: 'Subject', role: 'subject', items: ENGLISH_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: ENGLISH_MODALS_PAST },
          { label: 'Acción', labelTarget: 'Action', role: 'action', items: ENGLISH_ACTIONS },
          { label: 'Qué', labelTarget: 'Object', role: 'object', items: ENGLISH_OBJECTS },
        ],
      },
      {
        id: 'condicional-modal',
        name: 'Polite modal verbs',
        description:
          'Combina sujetos con would like to/would need to/would have to/would love to para pedir las cosas con cortesía.',
        level: 'b1',
        columns: [
          { label: 'Quién', labelTarget: 'Subject', role: 'subject', items: ENGLISH_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: ENGLISH_MODALS_COND },
          { label: 'Acción', labelTarget: 'Action', role: 'action', items: ENGLISH_ACTIONS },
          { label: 'Qué', labelTarget: 'Object', role: 'object', items: ENGLISH_OBJECTS },
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
        level: 'a1',
        columns: [
          { label: 'Quién', labelTarget: 'Sujet', role: 'subject', items: FRENCH_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: FRENCH_MODALS },
          { label: 'Acción', labelTarget: 'Action', role: 'action', items: FRENCH_ACTIONS },
          { label: 'Qué', labelTarget: 'Objet', role: 'object', items: FRENCH_OBJECTS },
        ],
      },
      {
        id: 'pasado-modal',
        name: 'Verbes modaux à l\'imparfait',
        description:
          'Combina sujetos, modales en imparfait, acciones y objetos — para contar qué querías, debías o podías hacer.',
        level: 'a2',
        columns: [
          { label: 'Quién', labelTarget: 'Sujet', role: 'subject', items: FRENCH_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: FRENCH_MODALS_PAST },
          { label: 'Acción', labelTarget: 'Action', role: 'action', items: FRENCH_ACTIONS },
          { label: 'Qué', labelTarget: 'Objet', role: 'object', items: FRENCH_OBJECTS },
        ],
      },
      {
        id: 'condicional-modal',
        name: 'Verbes modaux au conditionnel',
        description:
          'Combina sujetos con voudrais/devrais/pourrais/aimerais para pedir las cosas con cortesía.',
        level: 'b1',
        columns: [
          { label: 'Quién', labelTarget: 'Sujet', role: 'subject', items: FRENCH_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: FRENCH_MODALS_COND },
          { label: 'Acción', labelTarget: 'Action', role: 'action', items: FRENCH_ACTIONS },
          { label: 'Qué', labelTarget: 'Objet', role: 'object', items: FRENCH_OBJECTS },
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
        level: 'a1',
        columns: [
          { label: 'Quién', labelTarget: 'Soggetto', role: 'subject', items: ITALIAN_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modale', role: 'modal', items: ITALIAN_MODALS },
          { label: 'Acción', labelTarget: 'Azione', role: 'action', items: ITALIAN_ACTIONS },
          { label: 'Qué', labelTarget: 'Oggetto', role: 'object', items: ITALIAN_OBJECTS },
        ],
      },
      {
        id: 'pasado-modal',
        name: "Verbi modali all'imperfetto",
        description:
          'Combina sujetos, modales en imperfetto, acciones y objetos — para contar qué querías, debías o podías hacer.',
        level: 'a2',
        columns: [
          { label: 'Quién', labelTarget: 'Soggetto', role: 'subject', items: ITALIAN_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modale', role: 'modal', items: ITALIAN_MODALS_PAST },
          { label: 'Acción', labelTarget: 'Azione', role: 'action', items: ITALIAN_ACTIONS },
          { label: 'Qué', labelTarget: 'Oggetto', role: 'object', items: ITALIAN_OBJECTS },
        ],
      },
      {
        id: 'condicional-modal',
        name: 'Verbi modali al condizionale',
        description:
          'Combina sujetos con vorrei/dovrei/potrei/preferirei para pedir las cosas con cortesía.',
        level: 'b1',
        columns: [
          { label: 'Quién', labelTarget: 'Soggetto', role: 'subject', items: ITALIAN_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modale', role: 'modal', items: ITALIAN_MODALS_COND },
          { label: 'Acción', labelTarget: 'Azione', role: 'action', items: ITALIAN_ACTIONS },
          { label: 'Qué', labelTarget: 'Oggetto', role: 'object', items: ITALIAN_OBJECTS },
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
        level: 'a1',
        columns: [
          { label: 'Quién', labelTarget: 'Sujeito', role: 'subject', items: PORTUGUESE_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: PORTUGUESE_MODALS },
          { label: 'Acción', labelTarget: 'Ação', role: 'action', items: PORTUGUESE_ACTIONS },
          { label: 'Qué', labelTarget: 'Objeto', role: 'object', items: PORTUGUESE_OBJECTS },
        ],
      },
      {
        id: 'pasado-modal',
        name: 'Verbos modais no pretérito imperfeito',
        description:
          'Combina sujetos, modales en pretérito imperfecto, acciones y objetos — para contar qué querías, precisabas o podías hacer.',
        level: 'a2',
        columns: [
          { label: 'Quién', labelTarget: 'Sujeito', role: 'subject', items: PORTUGUESE_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: PORTUGUESE_MODALS_PAST },
          { label: 'Acción', labelTarget: 'Ação', role: 'action', items: PORTUGUESE_ACTIONS },
          { label: 'Qué', labelTarget: 'Objeto', role: 'object', items: PORTUGUESE_OBJECTS },
        ],
      },
      {
        id: 'condicional-modal',
        name: 'Verbos modais no condicional',
        description:
          'Combina sujetos con gostaria de/precisaria/poderia/deveria para pedir las cosas con cortesía.',
        level: 'b1',
        columns: [
          { label: 'Quién', labelTarget: 'Sujeito', role: 'subject', items: PORTUGUESE_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: PORTUGUESE_MODALS_COND },
          { label: 'Acción', labelTarget: 'Ação', role: 'action', items: PORTUGUESE_ACTIONS },
          { label: 'Qué', labelTarget: 'Objeto', role: 'object', items: PORTUGUESE_OBJECTS },
        ],
      },
    ],
    assemble: joinWords,
  },
};
