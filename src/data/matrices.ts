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
  /**
   * Qué columna elige el índice para resolver `forms`/`esForms` de esta
   * columna. Por defecto 'subject' (comportamiento de siempre, no rompe
   * nada existente). En la matriz pasiva, el participio concuerda en
   * género con el sujeto-sustantivo vía agreesWith: 'subject' (default).
   */
  agreesWith?: MatrixColumnRole;
}

export interface PhraseMatrix {
  id: string;
  name: string;
  /** Nota pedagógica corta: se renderiza en la UI debajo de la pestaña de nivel. */
  description: string;
  level: LevelId;
  columns: MatrixColumn[];
  /** Label corto de pestaña. Sin esto, cae a level.toUpperCase(). Necesario
   *  cuando un nivel tiene más de una matriz (B2 pasiva + subjuntivo). */
  tabLabel?: string;
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
const ES_QUERER = [
  'Yo quiero',
  'Tú quieres',
  'Él quiere',
  'Ella quiere',
  'Nosotros queremos',
  'Vosotros queréis',
];
const ES_DEBER = [
  'Yo debo',
  'Tú debes',
  'Él debe',
  'Ella debe',
  'Nosotros debemos',
  'Vosotros debéis',
];
const ES_PODER = [
  'Yo puedo',
  'Tú puedes',
  'Él puede',
  'Ella puede',
  'Nosotros podemos',
  'Vosotros podéis',
];
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
// Nuevo modal compartido A1-B1: "saber (hacer algo)" en fr/it/pt, y su
// equivalente de permiso "poder/tener permiso de" en de/en.
const ES_SABER = [
  'Yo sé',
  'Tú sabes',
  'Él sabe',
  'Ella sabe',
  'Nosotros sabemos',
  'Vosotros sabéis',
];
const ES_TENGO_PERMISO = [
  'Yo tengo permiso de',
  'Tú tienes permiso de',
  'Él tiene permiso de',
  'Ella tiene permiso de',
  'Nosotros tenemos permiso de',
  'Vosotros tenéis permiso de',
];

// Mismos verbos, ahora en pretérito imperfecto (para la matriz de A2 "pasado").
const ES_QUERIA = [
  'Yo quería',
  'Tú querías',
  'Él quería',
  'Ella quería',
  'Nosotros queríamos',
  'Vosotros queríais',
];
const ES_DEBIA = [
  'Yo debía',
  'Tú debías',
  'Él debía',
  'Ella debía',
  'Nosotros debíamos',
  'Vosotros debíais',
];
const ES_PODIA = [
  'Yo podía',
  'Tú podías',
  'Él podía',
  'Ella podía',
  'Nosotros podíamos',
  'Vosotros podíais',
];
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
const ES_SABIA = [
  'Yo sabía',
  'Tú sabías',
  'Él sabía',
  'Ella sabía',
  'Nosotros sabíamos',
  'Vosotros sabíais',
];
const ES_TENIA_PERMISO = [
  'Yo tenía permiso de',
  'Tú tenías permiso de',
  'Él tenía permiso de',
  'Ella tenía permiso de',
  'Nosotros teníamos permiso de',
  'Vosotros teníais permiso de',
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
const ES_PODRIA = [
  'Yo podría',
  'Tú podrías',
  'Él podría',
  'Ella podría',
  'Nosotros podríamos',
  'Vosotros podríais',
];
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
const ES_SABRIA = [
  'Yo sabría',
  'Tú sabrías',
  'Él sabría',
  'Ella sabría',
  'Nosotros sabríamos',
  'Vosotros sabríais',
];
const ES_TENDRIA_PERMISO = [
  'Yo tendría permiso de',
  'Tú tendrías permiso de',
  'Él tendría permiso de',
  'Ella tendría permiso de',
  'Nosotros tendríamos permiso de',
  'Vosotros tendríais permiso de',
];

// Glosas compartidas para las matrices nuevas de B2 (subjuntivo: "hablar"/
// "leer" conjugados en indicativo español, ya que el discurso indirecto o la
// subordinada impersonal en español no exige subjuntivo en la traducción).
// A diferencia de ES_QUERER y compañía, van SIN pronombre: en la matriz de
// subjuntivo el sujeto ya se emite por separado (ver assembleSpanishSentence),
// así que acá el pronombre se duplicaría ("Ella dice que yo Yo hablo...").
const ES_HABLA = ['hablo', 'hablas', 'habla', 'habla', 'hablamos', 'habláis'];
const ES_LEE = ['leo', 'lees', 'lee', 'lee', 'leemos', 'leéis'];
const ES_VIAJA = ['viajo', 'viajas', 'viaja', 'viaja', 'viajamos', 'viajáis'];

// Glosas compartidas para C1 "Condicional hipotético" (si + subjuntivo
// imperfecto + condicional). El sujeto va SIEMPRE separado en español
// ("Si yo fuera..."), así que estas glosas van sin pronombre repetido salvo
// en ES_SI_SUBJECT, que es justamente el disparador+sujeto.
const ES_SI_SUBJECT = ['Si yo', 'Si tú', 'Si él', 'Si ella', 'Si nosotros', 'Si vosotros'];
// índice 3 = "ella" (femenino real); 4/5 = plural. El resto usa masculino
// por defecto — no hay forma de saber el género real de "yo/tú" a partir
// de datos fijos, así que se sigue la convención de género no marcado.
const ES_FUERA_RICO = [
  'fuera rico,',
  'fueras rico,',
  'fuera rico,',
  'fuera rica,',
  'fuéramos ricos,',
  'fuerais ricos,',
];
const ES_FUERA_POBRE = [
  'fuera pobre,',
  'fueras pobre,',
  'fuera pobre,',
  'fuera pobre,',
  'fuéramos pobres,',
  'fuerais pobres,',
];
const ES_FUERA_FELIZ = [
  'fuera feliz,',
  'fueras feliz,',
  'fuera feliz,',
  'fuera feliz,',
  'fuéramos felices,',
  'fuerais felices,',
];
const ES_FUERA_OCUPADO = [
  'fuera ocupado,',
  'fueras ocupado,',
  'fuera ocupado,',
  'fuera ocupada,',
  'fuéramos ocupados,',
  'fuerais ocupados,',
];
const ES_FUERA_FUERTE = [
  'fuera fuerte,',
  'fueras fuerte,',
  'fuera fuerte,',
  'fuera fuerte,',
  'fuéramos fuertes,',
  'fuerais fuertes,',
];
const ES_FUERA_INTELIGENTE = [
  'fuera inteligente,',
  'fueras inteligente,',
  'fuera inteligente,',
  'fuera inteligente,',
  'fuéramos inteligentes,',
  'fuerais inteligentes,',
];
const ES_VIAJARIA_MAS = [
  'viajaría más',
  'viajarías más',
  'viajaría más',
  'viajaría más',
  'viajaríamos más',
  'viajaríais más',
];

// Glosas compartidas para C2 "Discurso indirecto en pasado" (backshift:
// "Dijo que había hablado..."). Sin pronombre propio: en este generador el
// disparador ya es un sujeto fijo en 3ra persona ("Él dijo que..."), y el
// sujeto de la cláusula reportada se emite por separado en su propia
// columna — así que acá alcanza con la forma verbal.
const ES_DIJO_QUE = 'Él dijo que';
const ES_HABIA_HABLADO = [
  'había hablado',
  'habías hablado',
  'había hablado',
  'había hablado',
  'habíamos hablado',
  'habíais hablado',
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
  {
    word: 'dürfen',
    es: 'tener permiso de',
    forms: ['darf', 'darfst', 'darf', 'darf', 'dürfen', 'dürft'],
    esForms: ES_TENGO_PERMISO,
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
  {
    word: 'dürfen',
    es: 'tenía permiso de',
    forms: ['durfte', 'durftest', 'durfte', 'durfte', 'durften', 'durftet'],
    esForms: ES_TENIA_PERMISO,
  },
];

// wollen no usa condicional regular en alemán: la forma natural y cortés es
// "möchte" (de mögen), no "würde wollen" — así lo enseñan las lecciones del
// sitio. müssen/können/sollen/dürfen sí usan su propio Konjunktiv II.
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
  {
    word: 'dürfen',
    es: 'tendría permiso de',
    forms: ['dürfte', 'dürftest', 'dürfte', 'dürfte', 'dürften', 'dürftet'],
    esForms: ES_TENDRIA_PERMISO,
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
  { word: 'reisen', es: 'viajar' },
  { word: 'kaufen', es: 'comprar' },
  { word: 'arbeiten', es: 'trabajar' },
  { word: 'leben', es: 'vivir' },
];

// B2 · Pasiva: sustantivos-paciente + auxiliar invariable (wird) + participio
// invariable (el alemán no concuerda el participio con el sujeto).
const GERMAN_PASSIVE_NOUNS: MatrixWord[] = [
  { word: 'Der Bericht', es: 'el informe' },
  { word: 'Der Vertrag', es: 'el contrato' },
  { word: 'Das Projekt', es: 'el proyecto' },
  { word: 'Der Brief', es: 'la carta' },
  { word: 'Der Vorschlag', es: 'la propuesta' },
  { word: 'Die Entscheidung', es: 'la decisión' },
];
const GERMAN_PASSIVE_AUX: MatrixWord[] = [{ word: 'wird', es: 'es' }];
// El participio alemán es invariable, pero la glosa en español sí concuerda
// con el género del sustantivo español (informe/contrato/proyecto = m,
// carta/propuesta/decisión = f), por eso lleva esForms aunque `forms` no.
const GERMAN_PASSIVE_PARTICIPLE: MatrixWord[] = [
  {
    word: 'geschrieben',
    es: 'escrito',
    esForms: ['escrito', 'escrito', 'escrito', 'escrita', 'escrita', 'escrita'],
  },
  {
    word: 'geschickt',
    es: 'enviado',
    esForms: ['enviado', 'enviado', 'enviado', 'enviada', 'enviada', 'enviada'],
  },
];

// B2 · Subjuntivo (Konjunktiv I, discurso indirecto): "Sie sagt, dass..." es
// el disparador natural en alemán — no hay subjuntivo tras expresiones
// impersonales como en francés/italiano/portugués.
const GERMAN_REPORT_TRIGGER: MatrixWord[] = [{ word: 'Sie sagt, dass', es: 'Ella dice que' }];
const GERMAN_SUBJUNCTIVE_VERBS: MatrixWord[] = [
  {
    word: 'sprechen',
    es: 'hablar',
    forms: ['spreche', 'sprechest', 'spreche', 'spreche', 'sprechen', 'sprechet'],
    esForms: ES_HABLA,
  },
  {
    word: 'lesen',
    es: 'leer',
    forms: ['lese', 'lesest', 'lese', 'lese', 'lesen', 'leset'],
    esForms: ES_LEE,
  },
  {
    word: 'reisen',
    es: 'viajar',
    forms: ['reise', 'reisest', 'reise', 'reise', 'reisen', 'reiset'],
    esForms: ES_VIAJA,
  },
];

// C1 · Condicional hipotético: "Wenn ich reich wäre, würde ich mehr
// reisen." El sujeto (Ich/Du/...) va MUDO (word: '') porque ya viene
// horneado dentro del disparador ("Wenn ich"); si no, se repetiría.
const GERMAN_C1_SILENT_SUBJECTS: MatrixWord[] = GERMAN_SUBJECTS.map((s) => ({
  word: '',
  es: s.es,
}));
const GERMAN_C1_TRIGGER: MatrixWord[] = [
  {
    word: 'Wenn',
    es: 'Si',
    forms: ['Wenn ich', 'Wenn du', 'Wenn er', 'Wenn sie', 'Wenn wir', 'Wenn ihr'],
  },
];
// El adjetivo va ANTES del verbo (orden verbo-final del alemán en
// subordinadas), con la coma horneada al final de cada forma.
const GERMAN_C1_ADJECTIVES: MatrixWord[] = [
  {
    word: 'reich',
    es: 'rico/a',
    forms: [
      'reich wäre,',
      'reich wärst,',
      'reich wäre,',
      'reich wäre,',
      'reich wären,',
      'reich wärt,',
    ],
    esForms: ES_FUERA_RICO,
  },
  {
    word: 'arm',
    es: 'pobre',
    forms: ['arm wäre,', 'arm wärst,', 'arm wäre,', 'arm wäre,', 'arm wären,', 'arm wärt,'],
    esForms: ES_FUERA_POBRE,
  },
  {
    word: 'glücklich',
    es: 'feliz',
    forms: [
      'glücklich wäre,',
      'glücklich wärst,',
      'glücklich wäre,',
      'glücklich wäre,',
      'glücklich wären,',
      'glücklich wärt,',
    ],
    esForms: ES_FUERA_FELIZ,
  },
  {
    word: 'beschäftigt',
    es: 'ocupado/a',
    forms: [
      'beschäftigt wäre,',
      'beschäftigt wärst,',
      'beschäftigt wäre,',
      'beschäftigt wäre,',
      'beschäftigt wären,',
      'beschäftigt wärt,',
    ],
    esForms: ES_FUERA_OCUPADO,
  },
  {
    word: 'stark',
    es: 'fuerte',
    forms: [
      'stark wäre,',
      'stark wärst,',
      'stark wäre,',
      'stark wäre,',
      'stark wären,',
      'stark wärt,',
    ],
    esForms: ES_FUERA_FUERTE,
  },
  {
    word: 'intelligent',
    es: 'inteligente',
    forms: [
      'intelligent wäre,',
      'intelligent wärst,',
      'intelligent wäre,',
      'intelligent wäre,',
      'intelligent wären,',
      'intelligent wärt,',
    ],
    esForms: ES_FUERA_INTELIGENTE,
  },
];
const GERMAN_C1_APODOSIS: MatrixWord[] = [
  {
    word: 'würde',
    es: 'viajaría',
    forms: [
      'würde ich mehr reisen',
      'würdest du mehr reisen',
      'würde er mehr reisen',
      'würde sie mehr reisen',
      'würden wir mehr reisen',
      'würdet ihr mehr reisen',
    ],
    esForms: ES_VIAJARIA_MAS,
  },
];

// C2 · Discurso indirecto en pasado: "Er sagte, dass ich Deutsch
// gesprochen habe." Konjunktiv-I-Perfekt ("habe gesprochen") es la forma
// real de discurso indirecto en pasado en alemán — se reusa el objeto
// "idioma" (GERMAN_OBJECTS) en vez de un sustantivo con caso acusativo,
// para no necesitar declinación (der Bericht → den Bericht) acá.
const GERMAN_PAST_TRIGGER: MatrixWord[] = [{ word: 'Er sagte, dass', es: ES_DIJO_QUE }];
// dass-Sätze van con el verbo al final, y el pronombre no va mayúscula
// salvo al inicio de la oración — por eso una variante en minúscula.
const GERMAN_SUBJECTS_LOWER: MatrixWord[] = GERMAN_SUBJECTS.map((s) => ({
  word: s.word.toLowerCase(),
  es: s.es,
}));
// "ich"/"wir" pasan a Konjunktiv II (hätte/hätten) porque ahí el
// Konjunktiv I de haben coincide con el indicativo (ich habe, wir haben)
// y no suena a discurso indirecto para un hablante nativo. du/er/sie/ihr
// sí usan Konjunktiv I real (habest/habe/habet), distinto del indicativo.
const GERMAN_PLUPERFECT_SPRECHEN: MatrixWord[] = [
  {
    word: 'gesprochen',
    es: 'hablado',
    forms: [
      'gesprochen hätte',
      'gesprochen habest',
      'gesprochen habe',
      'gesprochen habe',
      'gesprochen hätten',
      'gesprochen habet',
    ],
    esForms: ES_HABIA_HABLADO,
  },
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
  {
    word: 'are allowed to',
    es: 'tener permiso de',
    forms: [
      'am allowed to',
      'are allowed to',
      'is allowed to',
      'is allowed to',
      'are allowed to',
      'are allowed to',
    ],
    esForms: ES_TENGO_PERMISO,
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
  {
    word: 'were allowed to',
    es: 'tener permiso de',
    forms: [
      'was allowed to',
      'were allowed to',
      'was allowed to',
      'was allowed to',
      'were allowed to',
      'were allowed to',
    ],
    esForms: ES_TENIA_PERMISO,
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
  {
    word: 'would be allowed to',
    es: 'tener permiso de',
    forms: [
      'would be allowed to',
      'would be allowed to',
      'would be allowed to',
      'would be allowed to',
      'would be allowed to',
      'would be allowed to',
    ],
    esForms: ES_TENDRIA_PERMISO,
  },
];

const ENGLISH_ACTIONS: MatrixWord[] = [
  { word: 'learn', es: 'aprender' },
  { word: 'speak', es: 'hablar' },
  { word: 'read', es: 'leer' },
  { word: 'study', es: 'estudiar' },
  { word: 'travel', es: 'viajar' },
  { word: 'buy', es: 'comprar' },
  { word: 'work', es: 'trabajar' },
  { word: 'live', es: 'vivir' },
];

const ENGLISH_OBJECTS: MatrixWord[] = [
  { word: 'German', es: 'alemán' },
  { word: 'English', es: 'inglés' },
  { word: 'French', es: 'francés' },
  { word: 'Spanish', es: 'español' },
];

const ENGLISH_PASSIVE_NOUNS: MatrixWord[] = [
  { word: 'The report', es: 'el informe' },
  { word: 'The contract', es: 'el contrato' },
  { word: 'The project', es: 'el proyecto' },
  { word: 'The letter', es: 'la carta' },
  { word: 'The proposal', es: 'la propuesta' },
  { word: 'The decision', es: 'la decisión' },
];
const ENGLISH_PASSIVE_AUX: MatrixWord[] = [{ word: 'is', es: 'es' }];
// El participio inglés es invariable, pero la glosa en español sí concuerda
// con el género del sustantivo español (mismo orden que ENGLISH_PASSIVE_NOUNS).
const ENGLISH_PASSIVE_PARTICIPLE: MatrixWord[] = [
  {
    word: 'written',
    es: 'escrito',
    esForms: ['escrito', 'escrito', 'escrito', 'escrita', 'escrita', 'escrita'],
  },
  {
    word: 'sent',
    es: 'enviado',
    esForms: ['enviado', 'enviado', 'enviado', 'enviada', 'enviada', 'enviada'],
  },
];

const ENGLISH_MANDATIVE_TRIGGER: MatrixWord[] = [
  { word: "It's essential that", es: 'Es esencial que' },
];
const ENGLISH_SUBJUNCTIVE_VERBS: MatrixWord[] = [
  {
    word: 'speak',
    es: 'hablar',
    forms: ['speak', 'speak', 'speak', 'speak', 'speak', 'speak'],
    esForms: ES_HABLA,
  },
  {
    word: 'read',
    es: 'leer',
    forms: ['read', 'read', 'read', 'read', 'read', 'read'],
    esForms: ES_LEE,
  },
  {
    word: 'travel',
    es: 'viajar',
    forms: ['travel', 'travel', 'travel', 'travel', 'travel', 'travel'],
    esForms: ES_VIAJA,
  },
];

// C1 · Hypothetical conditional: "If I were rich, I would travel more."
const ENGLISH_C1_SILENT_SUBJECTS: MatrixWord[] = ENGLISH_SUBJECTS.map((s) => ({
  word: '',
  es: s.es,
}));
const ENGLISH_C1_TRIGGER: MatrixWord[] = [
  {
    word: 'If',
    es: 'Si',
    forms: ['If I', 'If you', 'If he', 'If she', 'If we', 'If they'],
  },
];
const ENGLISH_C1_ADJECTIVES: MatrixWord[] = [
  {
    word: 'rich',
    es: 'rico/a',
    forms: ['were rich,', 'were rich,', 'were rich,', 'were rich,', 'were rich,', 'were rich,'],
    esForms: ES_FUERA_RICO,
  },
  {
    word: 'poor',
    es: 'pobre',
    forms: ['were poor,', 'were poor,', 'were poor,', 'were poor,', 'were poor,', 'were poor,'],
    esForms: ES_FUERA_POBRE,
  },
  {
    word: 'happy',
    es: 'feliz',
    forms: [
      'were happy,',
      'were happy,',
      'were happy,',
      'were happy,',
      'were happy,',
      'were happy,',
    ],
    esForms: ES_FUERA_FELIZ,
  },
  {
    word: 'busy',
    es: 'ocupado/a',
    forms: ['were busy,', 'were busy,', 'were busy,', 'were busy,', 'were busy,', 'were busy,'],
    esForms: ES_FUERA_OCUPADO,
  },
  {
    word: 'strong',
    es: 'fuerte',
    forms: [
      'were strong,',
      'were strong,',
      'were strong,',
      'were strong,',
      'were strong,',
      'were strong,',
    ],
    esForms: ES_FUERA_FUERTE,
  },
  {
    word: 'intelligent',
    es: 'inteligente',
    forms: [
      'were intelligent,',
      'were intelligent,',
      'were intelligent,',
      'were intelligent,',
      'were intelligent,',
      'were intelligent,',
    ],
    esForms: ES_FUERA_INTELIGENTE,
  },
];
const ENGLISH_C1_APODOSIS: MatrixWord[] = [
  {
    word: 'would',
    es: 'viajaría',
    forms: [
      'I would travel more',
      'you would travel more',
      'he would travel more',
      'she would travel more',
      'we would travel more',
      'they would travel more',
    ],
    esForms: ES_VIAJARIA_MAS,
  },
];

// C2 · Reported speech with tense backshift: "He said that I had spoken
// German." English pluperfect ("had spoken") doesn't conjugate by person.
const ENGLISH_PAST_TRIGGER: MatrixWord[] = [{ word: 'He said that', es: ES_DIJO_QUE }];
const ENGLISH_PLUPERFECT_SPOKEN: MatrixWord[] = [
  {
    word: 'spoken',
    es: 'hablado',
    forms: ['had spoken', 'had spoken', 'had spoken', 'had spoken', 'had spoken', 'had spoken'],
    esForms: ES_HABIA_HABLADO,
  },
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
  {
    word: 'savoir',
    es: 'saber',
    forms: ['sais', 'sais', 'sait', 'sait', 'savons', 'savez'],
    esForms: ES_SABER,
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
  {
    word: 'savoir',
    es: 'saber',
    forms: ['savais', 'savais', 'savait', 'savait', 'savions', 'saviez'],
    esForms: ES_SABIA,
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
  {
    word: 'savoir',
    es: 'saber',
    forms: ['saurais', 'saurais', 'saurait', 'saurait', 'saurions', 'sauriez'],
    esForms: ES_SABRIA,
  },
];

const FRENCH_ACTIONS: MatrixWord[] = [
  { word: 'apprendre', es: 'aprender' },
  { word: 'parler', es: 'hablar' },
  { word: 'lire', es: 'leer' },
  { word: 'étudier', es: 'estudiar' },
  { word: 'voyager', es: 'viajar' },
  { word: 'acheter', es: 'comprar' },
  { word: 'travailler', es: 'trabajar' },
  { word: 'vivre', es: 'vivir' },
];

const FRENCH_OBJECTS: MatrixWord[] = [
  { word: "l'allemand", es: 'alemán' },
  { word: "l'anglais", es: 'inglés' },
  { word: 'le français', es: 'francés' },
  { word: "l'espagnol", es: 'español' },
];

// B2 · Pasiva: 3 sustantivos masculinos + 3 femeninos (orden: m,f,m,f,m,f)
// para practicar la concordancia del participio con "être".
const FRENCH_PASSIVE_NOUNS: MatrixWord[] = [
  { word: 'Le rapport', es: 'el informe' },
  { word: 'La lettre', es: 'la carta' },
  { word: 'Le contrat', es: 'el contrato' },
  { word: 'La proposition', es: 'la propuesta' },
  { word: 'Le projet', es: 'el proyecto' },
  { word: 'La décision', es: 'la decisión' },
];
const FRENCH_PASSIVE_AUX: MatrixWord[] = [{ word: 'est', es: 'es' }];
const FRENCH_PASSIVE_PARTICIPLE: MatrixWord[] = [
  {
    word: 'écrit',
    es: 'escrito/a',
    forms: ['écrit', 'écrite', 'écrit', 'écrite', 'écrit', 'écrite'],
    esForms: ['escrito', 'escrita', 'escrito', 'escrita', 'escrito', 'escrita'],
  },
  {
    word: 'envoyé',
    es: 'enviado/a',
    forms: ['envoyé', 'envoyée', 'envoyé', 'envoyée', 'envoyé', 'envoyée'],
    esForms: ['enviado', 'enviada', 'enviado', 'enviada', 'enviado', 'enviada'],
  },
];

// B2 · Subjuntivo: "il faut que" exige elisión con il/elle ("qu'il"/"qu'elle")
// y el sujeto no vuelve a aparecer suelto — se hornea sujeto+trigger juntos
// por persona, y la columna "subject" solo aporta el gloss en español (su
// `word` queda vacío y se filtra al armar la frase en francés).
const FRENCH_SUBJUNCTIVE_SUBJECTS_SILENT: MatrixWord[] = FRENCH_SUBJECTS.map((s) => ({
  word: '',
  es: s.es,
}));
const FRENCH_SUBJUNCTIVE_TRIGGER: MatrixWord[] = [
  {
    word: 'Il faut que',
    es: 'Es necesario que',
    forms: [
      'Il faut que je',
      'Il faut que tu',
      "Il faut qu'il",
      "Il faut qu'elle",
      'Il faut que nous',
      'Il faut que vous',
    ],
  },
];
// parler/lire: ninguna forma empieza con vocal, así se evita necesitar otra
// elisión ("j'apprenne") además de la ya resuelta en el disparador.
const FRENCH_SUBJUNCTIVE_VERBS: MatrixWord[] = [
  {
    word: 'parler',
    es: 'hablar',
    forms: ['parle', 'parles', 'parle', 'parle', 'parlions', 'parliez'],
    esForms: ES_HABLA,
  },
  {
    word: 'lire',
    es: 'leer',
    forms: ['lise', 'lises', 'lise', 'lise', 'lisions', 'lisiez'],
    esForms: ES_LEE,
  },
  {
    word: 'voyager',
    es: 'viajar',
    forms: ['voyage', 'voyages', 'voyage', 'voyage', 'voyagions', 'voyagiez'],
    esForms: ES_VIAJA,
  },
];

// C1 · Conditionnel hypothétique: "Si j'étais riche, je voyagerais plus."
// El francés necesita elisión ("j'étais", "s'il était") que no se puede
// resolver con un simple join de columnas separadas — por eso acá TODO
// (disparador+sujeto+verbo+adjetivo+coma) va horneado a mano en un solo
// item por adjetivo. subject/modal quedan mudos (word: ''), solo aportan
// el gloss en español vía `es`.
const FRENCH_C1_SILENT_SUBJECTS: MatrixWord[] = FRENCH_SUBJECTS.map((s) => ({
  word: '',
  es: s.es,
}));
const FRENCH_C1_TRIGGER_PLACEHOLDER: MatrixWord[] = [{ word: '', es: 'Si' }];
const FRENCH_C1_ADJECTIVES: MatrixWord[] = [
  {
    word: 'riche',
    es: 'rico/a',
    forms: [
      "Si j'étais riche,",
      'Si tu étais riche,',
      "S'il était riche,",
      'Si elle était riche,',
      'Si nous étions riches,',
      'Si vous étiez riches,',
    ],
    esForms: ES_FUERA_RICO,
  },
  {
    word: 'pauvre',
    es: 'pobre',
    forms: [
      "Si j'étais pauvre,",
      'Si tu étais pauvre,',
      "S'il était pauvre,",
      'Si elle était pauvre,',
      'Si nous étions pauvres,',
      'Si vous étiez pauvres,',
    ],
    esForms: ES_FUERA_POBRE,
  },
  {
    word: 'heureux',
    es: 'feliz',
    forms: [
      "Si j'étais heureux,",
      'Si tu étais heureux,',
      "S'il était heureux,",
      'Si elle était heureuse,',
      'Si nous étions heureux,',
      'Si vous étiez heureux,',
    ],
    esForms: ES_FUERA_FELIZ,
  },
  {
    word: 'occupé',
    es: 'ocupado/a',
    forms: [
      "Si j'étais occupé,",
      'Si tu étais occupé,',
      "S'il était occupé,",
      'Si elle était occupée,',
      'Si nous étions occupés,',
      'Si vous étiez occupés,',
    ],
    esForms: ES_FUERA_OCUPADO,
  },
  {
    word: 'fort',
    es: 'fuerte',
    forms: [
      "Si j'étais fort,",
      'Si tu étais fort,',
      "S'il était fort,",
      'Si elle était forte,',
      'Si nous étions forts,',
      'Si vous étiez forts,',
    ],
    esForms: ES_FUERA_FUERTE,
  },
  {
    word: 'intelligent',
    es: 'inteligente',
    forms: [
      "Si j'étais intelligent,",
      'Si tu étais intelligent,',
      "S'il était intelligent,",
      'Si elle était intelligente,',
      'Si nous étions intelligents,',
      'Si vous étiez intelligents,',
    ],
    esForms: ES_FUERA_INTELIGENTE,
  },
];
const FRENCH_C1_APODOSIS: MatrixWord[] = [
  {
    word: 'voyagerais',
    es: 'viajaría',
    forms: [
      'je voyagerais plus',
      'tu voyagerais plus',
      'il voyagerait plus',
      'elle voyagerait plus',
      'nous voyagerions plus',
      'vous voyageriez plus',
    ],
    esForms: ES_VIAJARIA_MAS,
  },
];

// C2 · Discours indirect avec recul du temps: "Il a dit qu'il avait parlé
// allemand." Reusa el mismo patrón de disparador horneado que el
// subjuntivo de B2 (FRENCH_SUBJUNCTIVE_SUBJECTS_SILENT), ahora en passé
// composé.
// El verbo que sigue (avais/avait...) siempre empieza con vocal, así que
// "je" queda pre-elidido con apóstrofo final ("j'") — frenchAssemble lo
// funde con la siguiente palabra sin espacio ("j'avais").
const FRENCH_PAST_TRIGGER: MatrixWord[] = [
  {
    word: 'Il a dit que',
    es: ES_DIJO_QUE,
    forms: [
      "Il a dit que j'",
      'Il a dit que tu',
      "Il a dit qu'il",
      "Il a dit qu'elle",
      'Il a dit que nous',
      'Il a dit que vous',
    ],
  },
];
const FRENCH_PLUPERFECT_PARLE: MatrixWord[] = [
  {
    word: 'parlé',
    es: 'hablado',
    forms: [
      'avais parlé',
      'avais parlé',
      'avait parlé',
      'avait parlé',
      'avions parlé',
      'aviez parlé',
    ],
    esForms: ES_HABIA_HABLADO,
  },
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
  {
    word: 'sapere',
    es: 'saber',
    forms: ['so', 'sai', 'sa', 'sa', 'sappiamo', 'sapete'],
    esForms: ES_SABER,
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
  {
    word: 'sapere',
    es: 'saber',
    forms: ['sapevo', 'sapevi', 'sapeva', 'sapeva', 'sapevamo', 'sapevate'],
    esForms: ES_SABIA,
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
    forms: [
      'preferirei',
      'preferiresti',
      'preferirebbe',
      'preferirebbe',
      'preferiremmo',
      'preferireste',
    ],
    esForms: ES_PREFERIRIA,
  },
  {
    word: 'sapere',
    es: 'saber',
    forms: ['saprei', 'sapresti', 'saprebbe', 'saprebbe', 'sapremmo', 'sapreste'],
    esForms: ES_SABRIA,
  },
];

const ITALIAN_ACTIONS: MatrixWord[] = [
  { word: 'imparare', es: 'aprender' },
  { word: 'parlare', es: 'hablar' },
  { word: 'leggere', es: 'leer' },
  { word: 'studiare', es: 'estudiar' },
  { word: 'viaggiare', es: 'viajar' },
  { word: 'comprare', es: 'comprar' },
  { word: 'lavorare', es: 'trabajar' },
  { word: 'vivere', es: 'vivir' },
];

const ITALIAN_OBJECTS: MatrixWord[] = [
  { word: 'il tedesco', es: 'alemán' },
  { word: "l'inglese", es: 'inglés' },
  { word: 'il francese', es: 'francés' },
  { word: 'lo spagnolo', es: 'español' },
];

const ITALIAN_PASSIVE_NOUNS: MatrixWord[] = [
  { word: 'Il rapporto', es: 'el informe' },
  { word: 'La lettera', es: 'la carta' },
  { word: 'Il contratto', es: 'el contrato' },
  { word: 'La proposta', es: 'la propuesta' },
  { word: 'Il progetto', es: 'el proyecto' },
  { word: 'La decisione', es: 'la decisión' },
];
const ITALIAN_PASSIVE_AUX: MatrixWord[] = [{ word: 'è', es: 'es' }];
const ITALIAN_PASSIVE_PARTICIPLE: MatrixWord[] = [
  {
    word: 'scritto',
    es: 'escrito/a',
    forms: ['scritto', 'scritta', 'scritto', 'scritta', 'scritto', 'scritta'],
    esForms: ['escrito', 'escrita', 'escrito', 'escrita', 'escrito', 'escrita'],
  },
  {
    word: 'inviato',
    es: 'enviado/a',
    forms: ['inviato', 'inviata', 'inviato', 'inviata', 'inviato', 'inviata'],
    esForms: ['enviado', 'enviada', 'enviado', 'enviada', 'enviado', 'enviada'],
  },
];

const ITALIAN_SUBJUNCTIVE_TRIGGER: MatrixWord[] = [{ word: 'Bisogna che', es: 'Es necesario que' }];
const ITALIAN_SUBJUNCTIVE_VERBS: MatrixWord[] = [
  {
    word: 'parlare',
    es: 'hablar',
    forms: ['parli', 'parli', 'parli', 'parli', 'parliamo', 'parliate'],
    esForms: ES_HABLA,
  },
  {
    word: 'leggere',
    es: 'leer',
    forms: ['legga', 'legga', 'legga', 'legga', 'leggiamo', 'leggiate'],
    esForms: ES_LEE,
  },
  {
    word: 'viaggiare',
    es: 'viajar',
    forms: ['viaggi', 'viaggi', 'viaggi', 'viaggi', 'viaggiamo', 'viaggiate'],
    esForms: ES_VIAJA,
  },
];

// C1 · Condizionale ipotetico: "Se fossi ricco, viaggerei di più." El
// italiano no tiene problemas de elisión acá, así que sujeto/disparador
// van separados como en cualquier otra matriz.
const ITALIAN_C1_SILENT_SUBJECTS: MatrixWord[] = ITALIAN_SUBJECTS.map((s) => ({
  word: '',
  es: s.es,
}));
const ITALIAN_C1_TRIGGER: MatrixWord[] = [
  {
    word: 'Se',
    es: 'Si',
    forms: ['Se io', 'Se tu', 'Se lui', 'Se lei', 'Se noi', 'Se voi'],
  },
];
const ITALIAN_C1_ADJECTIVES: MatrixWord[] = [
  {
    word: 'ricco',
    es: 'rico/a',
    forms: [
      'fossi ricco,',
      'fossi ricco,',
      'fosse ricco,',
      'fosse ricca,',
      'fossimo ricchi,',
      'foste ricchi,',
    ],
    esForms: ES_FUERA_RICO,
  },
  {
    word: 'povero',
    es: 'pobre',
    forms: [
      'fossi povero,',
      'fossi povero,',
      'fosse povero,',
      'fosse povera,',
      'fossimo poveri,',
      'foste poveri,',
    ],
    esForms: ES_FUERA_POBRE,
  },
  {
    word: 'felice',
    es: 'feliz',
    forms: [
      'fossi felice,',
      'fossi felice,',
      'fosse felice,',
      'fosse felice,',
      'fossimo felici,',
      'foste felici,',
    ],
    esForms: ES_FUERA_FELIZ,
  },
  {
    word: 'occupato',
    es: 'ocupado/a',
    forms: [
      'fossi occupato,',
      'fossi occupato,',
      'fosse occupato,',
      'fosse occupata,',
      'fossimo occupati,',
      'foste occupati,',
    ],
    esForms: ES_FUERA_OCUPADO,
  },
  {
    word: 'forte',
    es: 'fuerte',
    forms: [
      'fossi forte,',
      'fossi forte,',
      'fosse forte,',
      'fosse forte,',
      'fossimo forti,',
      'foste forti,',
    ],
    esForms: ES_FUERA_FUERTE,
  },
  {
    word: 'intelligente',
    es: 'inteligente',
    forms: [
      'fossi intelligente,',
      'fossi intelligente,',
      'fosse intelligente,',
      'fosse intelligente,',
      'fossimo intelligenti,',
      'foste intelligenti,',
    ],
    esForms: ES_FUERA_INTELIGENTE,
  },
];
// El italiano es pro-drop: no repite el pronombre en la apódosis.
const ITALIAN_C1_APODOSIS: MatrixWord[] = [
  {
    word: 'viaggerei',
    es: 'viajaría',
    forms: [
      'viaggerei di più',
      'viaggeresti di più',
      'viaggerebbe di più',
      'viaggerebbe di più',
      'viaggeremmo di più',
      'viaggereste di più',
    ],
    esForms: ES_VIAJARIA_MAS,
  },
];

// C2 · Discorso indiretto al passato: "Ha detto che io avevo parlato
// tedesco." El pronombre no va mayúscula fuera del inicio de la oración.
const ITALIAN_SUBJECTS_LOWER: MatrixWord[] = ITALIAN_SUBJECTS.map((s) => ({
  word: s.word.toLowerCase(),
  es: s.es,
}));
const ITALIAN_PAST_TRIGGER: MatrixWord[] = [{ word: 'Ha detto che', es: ES_DIJO_QUE }];
const ITALIAN_PLUPERFECT_PARLATO: MatrixWord[] = [
  {
    word: 'parlato',
    es: 'hablado',
    forms: [
      'avevo parlato',
      'avevi parlato',
      'aveva parlato',
      'aveva parlato',
      'avevamo parlato',
      'avevate parlato',
    ],
    esForms: ES_HABIA_HABLADO,
  },
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
  {
    word: 'saber',
    es: 'saber',
    forms: ['sei', 'sabes', 'sabe', 'sabe', 'sabemos', 'sabem'],
    esForms: ES_SABER,
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
  {
    word: 'saber',
    es: 'saber',
    forms: ['sabia', 'sabias', 'sabia', 'sabia', 'sabíamos', 'sabiam'],
    esForms: ES_SABIA,
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
    forms: [
      'precisaria',
      'precisarias',
      'precisaria',
      'precisaria',
      'precisaríamos',
      'precisariam',
    ],
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
  {
    word: 'saber',
    es: 'saber',
    forms: ['saberia', 'saberias', 'saberia', 'saberia', 'saberíamos', 'saberiam'],
    esForms: ES_SABRIA,
  },
];

const PORTUGUESE_ACTIONS: MatrixWord[] = [
  { word: 'aprender', es: 'aprender' },
  { word: 'falar', es: 'hablar' },
  { word: 'ler', es: 'leer' },
  { word: 'estudar', es: 'estudiar' },
  { word: 'viajar', es: 'viajar' },
  { word: 'comprar', es: 'comprar' },
  { word: 'trabalhar', es: 'trabajar' },
  { word: 'viver', es: 'vivir' },
];

const PORTUGUESE_OBJECTS: MatrixWord[] = [
  { word: 'alemão', es: 'alemán' },
  { word: 'inglês', es: 'inglés' },
  { word: 'francês', es: 'francés' },
  { word: 'espanhol', es: 'español' },
];

const PORTUGUESE_PASSIVE_NOUNS: MatrixWord[] = [
  { word: 'O relatório', es: 'el informe' },
  { word: 'A carta', es: 'la carta' },
  { word: 'O contrato', es: 'el contrato' },
  { word: 'A proposta', es: 'la propuesta' },
  { word: 'O projeto', es: 'el proyecto' },
  { word: 'A decisão', es: 'la decisión' },
];
const PORTUGUESE_PASSIVE_AUX: MatrixWord[] = [{ word: 'é', es: 'es' }];
const PORTUGUESE_PASSIVE_PARTICIPLE: MatrixWord[] = [
  {
    word: 'escrito',
    es: 'escrito/a',
    forms: ['escrito', 'escrita', 'escrito', 'escrita', 'escrito', 'escrita'],
    esForms: ['escrito', 'escrita', 'escrito', 'escrita', 'escrito', 'escrita'],
  },
  {
    word: 'enviado',
    es: 'enviado/a',
    forms: ['enviado', 'enviada', 'enviado', 'enviada', 'enviado', 'enviada'],
    esForms: ['enviado', 'enviada', 'enviado', 'enviada', 'enviado', 'enviada'],
  },
];

const PORTUGUESE_SUBJUNCTIVE_TRIGGER: MatrixWord[] = [
  { word: 'É importante que', es: 'Es importante que' },
];
const PORTUGUESE_SUBJUNCTIVE_VERBS: MatrixWord[] = [
  {
    word: 'falar',
    es: 'hablar',
    forms: ['fale', 'fales', 'fale', 'fale', 'falemos', 'falem'],
    esForms: ES_HABLA,
  },
  {
    word: 'ler',
    es: 'leer',
    forms: ['leia', 'leias', 'leia', 'leia', 'leiamos', 'leiam'],
    esForms: ES_LEE,
  },
  {
    word: 'viajar',
    es: 'viajar',
    forms: ['viaje', 'viajes', 'viaje', 'viaje', 'viajemos', 'viajem'],
    esForms: ES_VIAJA,
  },
];

// C1 · Condicional hipotético: "Se eu fosse rico, viajaria mais."
const PORTUGUESE_C1_SILENT_SUBJECTS: MatrixWord[] = PORTUGUESE_SUBJECTS.map((s) => ({
  word: '',
  es: s.es,
}));
const PORTUGUESE_C1_TRIGGER: MatrixWord[] = [
  {
    word: 'Se',
    es: 'Si',
    forms: ['Se eu', 'Se tu', 'Se ele', 'Se ela', 'Se nós', 'Se vocês'],
  },
];
const PORTUGUESE_C1_ADJECTIVES: MatrixWord[] = [
  {
    word: 'rico',
    es: 'rico/a',
    forms: [
      'fosse rico,',
      'fosses rico,',
      'fosse rico,',
      'fosse rica,',
      'fôssemos ricos,',
      'fossem ricos,',
    ],
    esForms: ES_FUERA_RICO,
  },
  {
    word: 'pobre',
    es: 'pobre',
    forms: [
      'fosse pobre,',
      'fosses pobre,',
      'fosse pobre,',
      'fosse pobre,',
      'fôssemos pobres,',
      'fossem pobres,',
    ],
    esForms: ES_FUERA_POBRE,
  },
  {
    word: 'feliz',
    es: 'feliz',
    forms: [
      'fosse feliz,',
      'fosses feliz,',
      'fosse feliz,',
      'fosse feliz,',
      'fôssemos felizes,',
      'fossem felizes,',
    ],
    esForms: ES_FUERA_FELIZ,
  },
  {
    word: 'ocupado',
    es: 'ocupado/a',
    forms: [
      'fosse ocupado,',
      'fosses ocupado,',
      'fosse ocupado,',
      'fosse ocupada,',
      'fôssemos ocupados,',
      'fossem ocupados,',
    ],
    esForms: ES_FUERA_OCUPADO,
  },
  {
    word: 'forte',
    es: 'fuerte',
    forms: [
      'fosse forte,',
      'fosses forte,',
      'fosse forte,',
      'fosse forte,',
      'fôssemos fortes,',
      'fossem fortes,',
    ],
    esForms: ES_FUERA_FUERTE,
  },
  {
    word: 'inteligente',
    es: 'inteligente',
    forms: [
      'fosse inteligente,',
      'fosses inteligente,',
      'fosse inteligente,',
      'fosse inteligente,',
      'fôssemos inteligentes,',
      'fossem inteligentes,',
    ],
    esForms: ES_FUERA_INTELIGENTE,
  },
];
// El portugués es pro-drop: no repite el pronombre en la apódosis.
const PORTUGUESE_C1_APODOSIS: MatrixWord[] = [
  {
    word: 'viajaria',
    es: 'viajaría',
    forms: [
      'viajaria mais',
      'viajarias mais',
      'viajaria mais',
      'viajaria mais',
      'viajaríamos mais',
      'viajariam mais',
    ],
    esForms: ES_VIAJARIA_MAS,
  },
];

// C2 · Discurso indireto no passado: "Disse que eu tinha falado alemão."
// El pronombre no va mayúscula fuera del inicio de la oración.
const PORTUGUESE_SUBJECTS_LOWER: MatrixWord[] = PORTUGUESE_SUBJECTS.map((s) => ({
  word: s.word.toLowerCase(),
  es: s.es,
}));
const PORTUGUESE_PAST_TRIGGER: MatrixWord[] = [{ word: 'Disse que', es: ES_DIJO_QUE }];
const PORTUGUESE_PLUPERFECT_FALADO: MatrixWord[] = [
  {
    word: 'falado',
    es: 'hablado',
    forms: [
      'tinha falado',
      'tinhas falado',
      'tinha falado',
      'tinha falado',
      'tínhamos falado',
      'tinham falado',
    ],
    esForms: ES_HABIA_HABLADO,
  },
];

function joinWords(words: string[]): string {
  return words.filter((w) => w.length > 0).join(' ');
}

const VOWELS = 'aeiouyâàéèêëîïôùûüœæ';

function frenchAssemble(words: string[]): string {
  const clean = words.filter((w) => w.length > 0);
  if (clean.length === 0) return '';

  // Funde cualquier elemento que termine en apóstrofo con el siguiente, sin
  // espacio ("Il a dit que j'" + "avais parlé" → "Il a dit que j'avais
  // parlé"). Esta elisión se hornea a mano en los datos (nunca aparece en
  // las matrices existentes), así que es un agregado seguro y no cambia el
  // comportamiento de ninguna matriz previa.
  const fused: string[] = [];
  for (const word of clean) {
    if (fused.length > 0 && fused[fused.length - 1].endsWith("'")) {
      fused[fused.length - 1] += word;
    } else {
      fused.push(word);
    }
  }

  if (fused.length < 2) return fused.join(' ');
  const [subject, ...rest] = fused;
  if (subject.toLowerCase() === 'je' && rest.length > 0) {
    const next = rest[0];
    if (next && VOWELS.includes(next[0].toLowerCase())) {
      return "J'" + next + (rest.length > 1 ? ' ' + rest.slice(1).join(' ') : '');
    }
  }
  return fused.join(' ');
}

function esTextFor(matrix: PhraseMatrix, colIdx: number, colIndices: number[]): string {
  const column = matrix.columns[colIdx];
  const item = column.items[colIndices[colIdx]];
  const agreesWithRole = column.agreesWith ?? 'subject';
  const agreeColIdx = matrix.columns.findIndex((c) => c.role === agreesWithRole);
  const agreeIdx = agreeColIdx === -1 ? colIndices[colIdx] : colIndices[agreeColIdx];
  return item.esForms?.[agreeIdx] ?? item.es;
}

// El resto de los roles (todo lo que no sea sujeto/modal) siempre va en este
// orden en español, sin importar el orden de palabras del idioma meta.
const SPANISH_TAIL_ORDER: MatrixColumnRole[] = ['action', 'object'];

// El español arma sujeto+modal de dos formas distintas según el tipo de
// matriz:
//  - Matrices "de siempre" (modales conjugados): el modal ya lleva el sujeto
//    adentro vía esForms ("Yo quiero", no solo "quiero") — se emite un solo
//    bloque, igual que siempre.
//  - Matrices nuevas (cópula/disparador invariable, sin esForms): sujeto y
//    modal se emiten por separado, en el orden en que aparecen las columnas
//    de la matriz, así "Ella dice que" sale antes que "yo" y no al revés.
export function assembleSpanishSentence(matrix: PhraseMatrix, colIndices: number[]): string {
  const parts: string[] = [];
  const subjectColIdx = matrix.columns.findIndex((c) => c.role === 'subject');
  const modalColIdx = matrix.columns.findIndex((c) => c.role === 'modal');
  const modalColumn = modalColIdx === -1 ? undefined : matrix.columns[modalColIdx];
  const modalItem = modalColumn ? modalColumn.items[colIndices[modalColIdx]] : undefined;
  const modalIsPersonBaked =
    modalItem?.esForms !== undefined && (modalColumn?.agreesWith ?? 'subject') === 'subject';

  if (modalIsPersonBaked && subjectColIdx !== -1) {
    parts.push(esTextFor(matrix, modalColIdx, colIndices));
  } else {
    matrix.columns.forEach((col, colIdx) => {
      if (col.role !== 'subject' && col.role !== 'modal') return;
      const text = esTextFor(matrix, colIdx, colIndices);
      if (text) parts.push(text);
    });
  }

  for (const role of SPANISH_TAIL_ORDER) {
    const colIdx = matrix.columns.findIndex((c) => c.role === role);
    if (colIdx === -1) continue;
    const text = esTextFor(matrix, colIdx, colIndices);
    if (text) parts.push(text);
  }

  return `${parts.join(' ')}.`;
}

export const MATRIX_DATA: Record<LanguageId, LanguageMatrixConfig> = {
  de: {
    matrices: [
      {
        id: 'basico-modal-v2',
        name: 'Verbos modales',
        description:
          'Empezás por la base: sujetos, verbos modales en presente y los primeros sustantivos y adjetivos. Acá no hay tiempos verbales que confundan — solo automatizás el orden de la frase alemana (sujeto-modal-objeto-infinitivo) y vocabulario nuevo.',
        level: 'a1',
        columns: [
          { label: 'Quién', labelTarget: 'Subjekt', role: 'subject', items: GERMAN_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modalverb', role: 'modal', items: GERMAN_MODALS },
          { label: 'Qué', labelTarget: 'Objekt', role: 'object', items: GERMAN_OBJECTS },
          { label: 'Acción', labelTarget: 'Infinitiv', role: 'action', items: GERMAN_VERBS },
        ],
      },
      {
        id: 'pasado-modal-v2',
        name: 'Verbos modales en pasado',
        description:
          'Mismos modales, ahora en Präteritum (pasado), sobre el mismo vocabulario. Sigue al A1 porque el orden de la frase ya lo tenés incorporado — el desafío ahora es la conjugación en pasado, no la estructura.',
        level: 'a2',
        columns: [
          { label: 'Quién', labelTarget: 'Subjekt', role: 'subject', items: GERMAN_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modalverb', role: 'modal', items: GERMAN_MODALS_PAST },
          { label: 'Qué', labelTarget: 'Objekt', role: 'object', items: GERMAN_OBJECTS },
          { label: 'Acción', labelTarget: 'Infinitiv', role: 'action', items: GERMAN_VERBS },
        ],
      },
      {
        id: 'condicional-modal-v2',
        name: 'Verbos modales de cortesía',
        description:
          'Subís a los modales de cortesía (möchte/müsste/könnte/sollte/dürfte) para pedir las cosas como se pide realmente en alemán. Viene después del A2 porque para pedir con cortesía primero necesitás dominar el modal en sus tiempos básicos.',
        level: 'b1',
        columns: [
          { label: 'Quién', labelTarget: 'Subjekt', role: 'subject', items: GERMAN_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modalverb', role: 'modal', items: GERMAN_MODALS_COND },
          { label: 'Qué', labelTarget: 'Objekt', role: 'object', items: GERMAN_OBJECTS },
          { label: 'Acción', labelTarget: 'Infinitiv', role: 'action', items: GERMAN_VERBS },
        ],
      },
      {
        id: 'pasiva-b2',
        name: 'Voz pasiva',
        description:
          'El foco cambia: en vez de quién hace algo, practicás quién lo recibe con el Passiv (wird + participio). Llega después de B1 porque necesitás los verbos automatizados — la pasiva es reorganizar esa misma info con el foco en otro lado.',
        level: 'b2',
        tabLabel: 'B2 · Pasiva',
        columns: [
          {
            label: 'Sustantivo',
            labelTarget: 'Subjekt',
            role: 'subject',
            items: GERMAN_PASSIVE_NOUNS,
          },
          { label: 'Auxiliar', labelTarget: 'Hilfsverb', role: 'modal', items: GERMAN_PASSIVE_AUX },
          {
            label: 'Participio',
            labelTarget: 'Partizip',
            role: 'action',
            items: GERMAN_PASSIVE_PARTICIPLE,
          },
        ],
      },
      {
        id: 'subjuntivo-b2',
        name: 'Konjunktiv I (discurso indirecto)',
        description:
          'Practicás el Konjunktiv I, la forma que usa el alemán para citar lo que dijo otra persona — el equivalente más cercano al subjuntivo que buscás. Va después de la pasiva porque ya sabés separar sujeto y acción; ahora el desafío es una conjugación distinta, no un orden de palabras nuevo.',
        level: 'b2',
        tabLabel: 'B2 · Subjuntivo',
        columns: [
          {
            label: 'Disparador',
            labelTarget: 'Auslöser',
            role: 'modal',
            items: GERMAN_REPORT_TRIGGER,
          },
          { label: 'Quién', labelTarget: 'Subjekt', role: 'subject', items: GERMAN_SUBJECTS },
          {
            label: 'Acción',
            labelTarget: 'Konjunktiv I',
            role: 'action',
            items: GERMAN_SUBJUNCTIVE_VERBS,
          },
          { label: 'Qué', labelTarget: 'Objekt', role: 'object', items: GERMAN_OBJECTS },
        ],
      },
      {
        id: 'condicional-hipotetico-c1',
        name: 'Condicional hipotético',
        description:
          'Retomás los modales de B1, pero ahora dentro de una condición real: "Wenn ich reich wäre, würde ich mehr reisen." Viene después de B2 porque ya sabés separar sujeto y acción por separado — acá se combinan una prótasis y una consecuencia en una sola frase.',
        level: 'c1',
        tabLabel: 'C1 · Hipotético',
        columns: [
          { label: 'Condición', labelTarget: 'Bedingung', role: 'modal', items: GERMAN_C1_TRIGGER },
          {
            label: 'Quién',
            labelTarget: 'Subjekt',
            role: 'subject',
            items: GERMAN_C1_SILENT_SUBJECTS,
          },
          {
            label: 'Adjetivo',
            labelTarget: 'Adjektiv',
            role: 'action',
            items: GERMAN_C1_ADJECTIVES,
          },
          {
            label: 'Consecuencia',
            labelTarget: 'Folge',
            role: 'object',
            items: GERMAN_C1_APODOSIS,
          },
        ],
      },
      {
        id: 'discurso-indirecto-c2',
        name: 'Konjunktiv I en pasado',
        description:
          'El disparador pasa de presente a pasado ("Er sagte, dass...") y el verbo reportado retrocede un tiempo — esa es la marca de dominio C2 en discurso indirecto. Viene después de C1 porque ya sabés armar prótasis y consecuencia; acá el desafío es una conjugación en pasado, no una estructura nueva.',
        level: 'c2',
        tabLabel: 'C2 · Discurso indirecto',
        columns: [
          {
            label: 'Disparador',
            labelTarget: 'Auslöser',
            role: 'modal',
            items: GERMAN_PAST_TRIGGER,
          },
          { label: 'Quién', labelTarget: 'Subjekt', role: 'subject', items: GERMAN_SUBJECTS_LOWER },
          { label: 'Qué', labelTarget: 'Objekt', role: 'object', items: GERMAN_OBJECTS },
          {
            label: 'Acción',
            labelTarget: 'Plusquamperfekt',
            role: 'action',
            items: GERMAN_PLUPERFECT_SPRECHEN,
          },
        ],
      },
    ],
    assemble: joinWords,
  },
  en: {
    matrices: [
      {
        id: 'basico-modal-v2',
        name: 'Modal verbs',
        description:
          "You start with the base: subjects, modal verbs in the present, and your first nouns and adjectives. There's no tense to confuse you yet — you're just automating English word order (subject-modal-action-object) and new vocabulary.",
        level: 'a1',
        columns: [
          { label: 'Quién', labelTarget: 'Subject', role: 'subject', items: ENGLISH_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: ENGLISH_MODALS },
          { label: 'Acción', labelTarget: 'Action', role: 'action', items: ENGLISH_ACTIONS },
          { label: 'Qué', labelTarget: 'Object', role: 'object', items: ENGLISH_OBJECTS },
        ],
      },
      {
        id: 'pasado-modal-v2',
        name: 'Modal verbs in the past',
        description:
          'Same modals, now in the past, over the same vocabulary. It follows A1 because you already have the sentence order down — the challenge now is the past tense, not the structure.',
        level: 'a2',
        columns: [
          { label: 'Quién', labelTarget: 'Subject', role: 'subject', items: ENGLISH_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: ENGLISH_MODALS_PAST },
          { label: 'Acción', labelTarget: 'Action', role: 'action', items: ENGLISH_ACTIONS },
          { label: 'Qué', labelTarget: 'Object', role: 'object', items: ENGLISH_OBJECTS },
        ],
      },
      {
        id: 'condicional-modal-v2',
        name: 'Polite modal verbs',
        description:
          'You move up to polite modals (would like to/would need to/would have to/would love to/would be allowed to) to ask for things politely. It comes after A2 because asking politely first requires mastering the modal in its basic tenses.',
        level: 'b1',
        columns: [
          { label: 'Quién', labelTarget: 'Subject', role: 'subject', items: ENGLISH_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: ENGLISH_MODALS_COND },
          { label: 'Acción', labelTarget: 'Action', role: 'action', items: ENGLISH_ACTIONS },
          { label: 'Qué', labelTarget: 'Object', role: 'object', items: ENGLISH_OBJECTS },
        ],
      },
      {
        id: 'pasiva-b2',
        name: 'Passive voice',
        description:
          'The focus shifts: instead of who does something, you practice who receives it, with be + participle. It comes after B1 because you need the verbs automatized already — passive voice is that same information reorganized with the focus moved.',
        level: 'b2',
        tabLabel: 'B2 · Passive',
        columns: [
          {
            label: 'Sustantivo',
            labelTarget: 'Subject',
            role: 'subject',
            items: ENGLISH_PASSIVE_NOUNS,
          },
          {
            label: 'Auxiliar',
            labelTarget: 'Auxiliary',
            role: 'modal',
            items: ENGLISH_PASSIVE_AUX,
          },
          {
            label: 'Participio',
            labelTarget: 'Participle',
            role: 'action',
            items: ENGLISH_PASSIVE_PARTICIPLE,
          },
        ],
      },
      {
        id: 'subjuntivo-b2',
        name: 'Mandative subjunctive',
        description:
          'You practice the mandative subjunctive — the base form of the verb after triggers like "it\'s essential that", with no -s even for he/she. It comes after passive voice because you already separate subject from action; now the challenge is a form that stays invariable, not a new word order.',
        level: 'b2',
        tabLabel: 'B2 · Subjunctive',
        columns: [
          {
            label: 'Disparador',
            labelTarget: 'Trigger',
            role: 'modal',
            items: ENGLISH_MANDATIVE_TRIGGER,
          },
          { label: 'Quién', labelTarget: 'Subject', role: 'subject', items: ENGLISH_SUBJECTS },
          {
            label: 'Acción',
            labelTarget: 'Subjunctive',
            role: 'action',
            items: ENGLISH_SUBJUNCTIVE_VERBS,
          },
          { label: 'Qué', labelTarget: 'Object', role: 'object', items: ENGLISH_OBJECTS },
        ],
      },
      {
        id: 'condicional-hipotetico-c1',
        name: 'Hypothetical conditional',
        description:
          'You go back to B1\'s modals, but now inside a real condition: "If I were rich, I would travel more." It comes after B2 because you already separate subject from action — here a protasis and a consequence combine into one sentence.',
        level: 'c1',
        tabLabel: 'C1 · Hypothetical',
        columns: [
          {
            label: 'Condición',
            labelTarget: 'Condition',
            role: 'modal',
            items: ENGLISH_C1_TRIGGER,
          },
          {
            label: 'Quién',
            labelTarget: 'Subject',
            role: 'subject',
            items: ENGLISH_C1_SILENT_SUBJECTS,
          },
          {
            label: 'Adjetivo',
            labelTarget: 'Adjective',
            role: 'action',
            items: ENGLISH_C1_ADJECTIVES,
          },
          {
            label: 'Consecuencia',
            labelTarget: 'Consequence',
            role: 'object',
            items: ENGLISH_C1_APODOSIS,
          },
        ],
      },
      {
        id: 'discurso-indirecto-c2',
        name: 'Reported speech with backshift',
        description:
          'The trigger shifts from present to past ("He said that...") and the reported verb moves one tense further back — that\'s the mark of C2 mastery in reported speech. It comes after C1 because you already build a protasis and a consequence; the challenge here is a past tense, not a new structure.',
        level: 'c2',
        tabLabel: 'C2 · Reported speech',
        columns: [
          {
            label: 'Disparador',
            labelTarget: 'Trigger',
            role: 'modal',
            items: ENGLISH_PAST_TRIGGER,
          },
          { label: 'Quién', labelTarget: 'Subject', role: 'subject', items: ENGLISH_SUBJECTS },
          {
            label: 'Acción',
            labelTarget: 'Pluperfect',
            role: 'action',
            items: ENGLISH_PLUPERFECT_SPOKEN,
          },
          { label: 'Qué', labelTarget: 'Object', role: 'object', items: ENGLISH_OBJECTS },
        ],
      },
    ],
    assemble: joinWords,
  },
  fr: {
    matrices: [
      {
        id: 'basico-modal-v2',
        name: 'Verbes modaux',
        description:
          'Empezás por la base: sujetos, verbos modales en presente y los primeros sustantivos y adjetivos. Acá no hay tiempos verbales que confundan — solo automatizás el orden de la frase francesa y vocabulario nuevo.',
        level: 'a1',
        columns: [
          { label: 'Quién', labelTarget: 'Sujet', role: 'subject', items: FRENCH_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: FRENCH_MODALS },
          { label: 'Acción', labelTarget: 'Action', role: 'action', items: FRENCH_ACTIONS },
          { label: 'Qué', labelTarget: 'Objet', role: 'object', items: FRENCH_OBJECTS },
        ],
      },
      {
        id: 'pasado-modal-v2',
        name: "Verbes modaux à l'imparfait",
        description:
          'Mismos modales, ahora en imparfait, sobre el mismo vocabulario. Sigue al A1 porque el orden de la frase ya lo tenés incorporado — el desafío ahora es la conjugación en pasado, no la estructura.',
        level: 'a2',
        columns: [
          { label: 'Quién', labelTarget: 'Sujet', role: 'subject', items: FRENCH_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: FRENCH_MODALS_PAST },
          { label: 'Acción', labelTarget: 'Action', role: 'action', items: FRENCH_ACTIONS },
          { label: 'Qué', labelTarget: 'Objet', role: 'object', items: FRENCH_OBJECTS },
        ],
      },
      {
        id: 'condicional-modal-v2',
        name: 'Verbes modaux au conditionnel',
        description:
          'Subís a los modales de cortesía (voudrais/devrais/pourrais/aimerais/saurais) para pedir las cosas con cortesía. Viene después del A2 porque para pedir con cortesía primero necesitás dominar el modal en sus tiempos básicos.',
        level: 'b1',
        columns: [
          { label: 'Quién', labelTarget: 'Sujet', role: 'subject', items: FRENCH_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: FRENCH_MODALS_COND },
          { label: 'Acción', labelTarget: 'Action', role: 'action', items: FRENCH_ACTIONS },
          { label: 'Qué', labelTarget: 'Objet', role: 'object', items: FRENCH_OBJECTS },
        ],
      },
      {
        id: 'pasiva-b2',
        name: 'Voix passive',
        description:
          'El foco cambia: en vez de quién hace algo, practicás quién lo recibe con être + participio, concordando en género con el sustantivo. Llega después de B1 porque necesitás los verbos automatizados — la pasiva es reorganizar esa misma info con el foco en otro lado.',
        level: 'b2',
        tabLabel: 'B2 · Passive',
        columns: [
          {
            label: 'Sustantivo',
            labelTarget: 'Sujet',
            role: 'subject',
            items: FRENCH_PASSIVE_NOUNS,
          },
          {
            label: 'Auxiliar',
            labelTarget: 'Auxiliaire',
            role: 'modal',
            items: FRENCH_PASSIVE_AUX,
          },
          {
            label: 'Participio',
            labelTarget: 'Participe',
            role: 'action',
            items: FRENCH_PASSIVE_PARTICIPLE,
            agreesWith: 'subject',
          },
        ],
      },
      {
        id: 'subjuntivo-b2',
        name: 'Subjonctif (déclencheur impersonnel)',
        description:
          'Practicás el subjuntivo real del francés, disparado por "il faut que" — la construcción impersonal más común para expresar necesidad. Va después de la pasiva porque ya sabés separar sujeto y acción; ahora el desafío es un modo verbal nuevo, no un orden de palabras nuevo.',
        level: 'b2',
        tabLabel: 'B2 · Subjonctif',
        columns: [
          {
            label: 'Disparador',
            labelTarget: 'Déclencheur',
            role: 'modal',
            items: FRENCH_SUBJUNCTIVE_TRIGGER,
          },
          {
            label: 'Quién',
            labelTarget: 'Sujet',
            role: 'subject',
            items: FRENCH_SUBJUNCTIVE_SUBJECTS_SILENT,
          },
          {
            label: 'Acción',
            labelTarget: 'Subjonctif',
            role: 'action',
            items: FRENCH_SUBJUNCTIVE_VERBS,
          },
          { label: 'Qué', labelTarget: 'Objet', role: 'object', items: FRENCH_OBJECTS },
        ],
      },
      {
        id: 'condicional-hipotetico-c1',
        name: 'Conditionnel hypothétique',
        description:
          'Retomás los modales de B1, pero ahora dentro de una condición real: "Si j\'étais riche, je voyagerais plus." Viene después de B2 porque ya sabés separar sujeto y acción por separado — acá se combinan una prótasis y una consecuencia en una sola frase.',
        level: 'c1',
        tabLabel: 'C1 · Hypothétique',
        columns: [
          {
            label: 'Condición',
            labelTarget: 'Condition',
            role: 'modal',
            items: FRENCH_C1_TRIGGER_PLACEHOLDER,
          },
          {
            label: 'Quién',
            labelTarget: 'Sujet',
            role: 'subject',
            items: FRENCH_C1_SILENT_SUBJECTS,
          },
          {
            label: 'Adjetivo',
            labelTarget: 'Adjectif',
            role: 'action',
            items: FRENCH_C1_ADJECTIVES,
          },
          {
            label: 'Consecuencia',
            labelTarget: 'Conséquence',
            role: 'object',
            items: FRENCH_C1_APODOSIS,
          },
        ],
      },
      {
        id: 'discurso-indirecto-c2',
        name: 'Discours indirect au passé',
        description:
          'El disparador pasa de presente a pasado ("Il a dit que...") y el verbo reportado retrocede un tiempo — esa es la marca de dominio C2 en discurso indirecto. Viene después de C1 porque ya sabés armar prótasis y consecuencia; acá el desafío es una conjugación en pasado, no una estructura nueva.',
        level: 'c2',
        tabLabel: 'C2 · Discours indirect',
        columns: [
          {
            label: 'Disparador',
            labelTarget: 'Déclencheur',
            role: 'modal',
            items: FRENCH_PAST_TRIGGER,
          },
          {
            label: 'Quién',
            labelTarget: 'Sujet',
            role: 'subject',
            items: FRENCH_SUBJUNCTIVE_SUBJECTS_SILENT,
          },
          {
            label: 'Acción',
            labelTarget: 'Plus-que-parfait',
            role: 'action',
            items: FRENCH_PLUPERFECT_PARLE,
          },
          { label: 'Qué', labelTarget: 'Objet', role: 'object', items: FRENCH_OBJECTS },
        ],
      },
    ],
    assemble: frenchAssemble,
  },
  it: {
    matrices: [
      {
        id: 'basico-modal-v2',
        name: 'Verbi modali',
        description:
          'Empezás por la base: sujetos, verbos modales en presente y los primeros sustantivos y adjetivos. Acá no hay tiempos verbales que confundan — solo automatizás el orden de la frase italiana y vocabulario nuevo.',
        level: 'a1',
        columns: [
          { label: 'Quién', labelTarget: 'Soggetto', role: 'subject', items: ITALIAN_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modale', role: 'modal', items: ITALIAN_MODALS },
          { label: 'Acción', labelTarget: 'Azione', role: 'action', items: ITALIAN_ACTIONS },
          { label: 'Qué', labelTarget: 'Oggetto', role: 'object', items: ITALIAN_OBJECTS },
        ],
      },
      {
        id: 'pasado-modal-v2',
        name: "Verbi modali all'imperfetto",
        description:
          'Mismos modales, ahora en imperfetto, sobre el mismo vocabulario. Sigue al A1 porque el orden de la frase ya lo tenés incorporado — el desafío ahora es la conjugación en pasado, no la estructura.',
        level: 'a2',
        columns: [
          { label: 'Quién', labelTarget: 'Soggetto', role: 'subject', items: ITALIAN_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modale', role: 'modal', items: ITALIAN_MODALS_PAST },
          { label: 'Acción', labelTarget: 'Azione', role: 'action', items: ITALIAN_ACTIONS },
          { label: 'Qué', labelTarget: 'Oggetto', role: 'object', items: ITALIAN_OBJECTS },
        ],
      },
      {
        id: 'condicional-modal-v2',
        name: 'Verbi modali al condizionale',
        description:
          'Subís a los modales de cortesía (vorrei/dovrei/potrei/preferirei/saprei) para pedir las cosas con cortesía. Viene después del A2 porque para pedir con cortesía primero necesitás dominar el modal en sus tiempos básicos.',
        level: 'b1',
        columns: [
          { label: 'Quién', labelTarget: 'Soggetto', role: 'subject', items: ITALIAN_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modale', role: 'modal', items: ITALIAN_MODALS_COND },
          { label: 'Acción', labelTarget: 'Azione', role: 'action', items: ITALIAN_ACTIONS },
          { label: 'Qué', labelTarget: 'Oggetto', role: 'object', items: ITALIAN_OBJECTS },
        ],
      },
      {
        id: 'pasiva-b2',
        name: 'Voce passiva',
        description:
          'El foco cambia: en vez de quién hace algo, practicás quién lo recibe con essere + participio, concordando en género con el sustantivo. Llega después de B1 porque necesitás los verbos automatizados — la pasiva es reorganizar esa misma info con el foco en otro lado.',
        level: 'b2',
        tabLabel: 'B2 · Passiva',
        columns: [
          {
            label: 'Sustantivo',
            labelTarget: 'Soggetto',
            role: 'subject',
            items: ITALIAN_PASSIVE_NOUNS,
          },
          {
            label: 'Auxiliar',
            labelTarget: 'Ausiliare',
            role: 'modal',
            items: ITALIAN_PASSIVE_AUX,
          },
          {
            label: 'Participio',
            labelTarget: 'Participio',
            role: 'action',
            items: ITALIAN_PASSIVE_PARTICIPLE,
            agreesWith: 'subject',
          },
        ],
      },
      {
        id: 'subjuntivo-b2',
        name: 'Congiuntivo (disparador impersonale)',
        description:
          'Practicás el congiuntivo real del italiano, disparado por "bisogna che" — la construcción impersonal más común para expresar necesidad. Va después de la pasiva porque ya sabés separar sujeto y acción; ahora el desafío es un modo verbal nuevo, no un orden de palabras nuevo.',
        level: 'b2',
        tabLabel: 'B2 · Congiuntivo',
        columns: [
          {
            label: 'Disparador',
            labelTarget: 'Disparador',
            role: 'modal',
            items: ITALIAN_SUBJUNCTIVE_TRIGGER,
          },
          { label: 'Quién', labelTarget: 'Soggetto', role: 'subject', items: ITALIAN_SUBJECTS },
          {
            label: 'Acción',
            labelTarget: 'Congiuntivo',
            role: 'action',
            items: ITALIAN_SUBJUNCTIVE_VERBS,
          },
          { label: 'Qué', labelTarget: 'Oggetto', role: 'object', items: ITALIAN_OBJECTS },
        ],
      },
      {
        id: 'condicional-hipotetico-c1',
        name: 'Condizionale ipotetico',
        description:
          'Retomás los modales de B1, pero ahora dentro de una condición real: "Se fossi ricco, viaggerei di più." Viene después de B2 porque ya sabés separar sujeto y acción por separado — acá se combinan una prótasis y una consecuencia en una sola frase.',
        level: 'c1',
        tabLabel: 'C1 · Ipotetico',
        columns: [
          {
            label: 'Condición',
            labelTarget: 'Condizione',
            role: 'modal',
            items: ITALIAN_C1_TRIGGER,
          },
          {
            label: 'Quién',
            labelTarget: 'Soggetto',
            role: 'subject',
            items: ITALIAN_C1_SILENT_SUBJECTS,
          },
          {
            label: 'Adjetivo',
            labelTarget: 'Aggettivo',
            role: 'action',
            items: ITALIAN_C1_ADJECTIVES,
          },
          {
            label: 'Consecuencia',
            labelTarget: 'Conseguenza',
            role: 'object',
            items: ITALIAN_C1_APODOSIS,
          },
        ],
      },
      {
        id: 'discurso-indirecto-c2',
        name: 'Discorso indiretto al passato',
        description:
          'El disparador pasa de presente a pasado ("Ha detto che...") y el verbo reportado retrocede un tiempo — esa es la marca de dominio C2 en discurso indirecto. Viene después de C1 porque ya sabés armar prótasis y consecuencia; acá el desafío es una conjugación en pasado, no una estructura nueva.',
        level: 'c2',
        tabLabel: 'C2 · Discorso indiretto',
        columns: [
          {
            label: 'Disparador',
            labelTarget: 'Disparador',
            role: 'modal',
            items: ITALIAN_PAST_TRIGGER,
          },
          {
            label: 'Quién',
            labelTarget: 'Soggetto',
            role: 'subject',
            items: ITALIAN_SUBJECTS_LOWER,
          },
          {
            label: 'Acción',
            labelTarget: 'Trapassato',
            role: 'action',
            items: ITALIAN_PLUPERFECT_PARLATO,
          },
          { label: 'Qué', labelTarget: 'Oggetto', role: 'object', items: ITALIAN_OBJECTS },
        ],
      },
    ],
    assemble: joinWords,
  },
  pt: {
    matrices: [
      {
        id: 'basico-modal-v2',
        name: 'Verbos modais',
        description:
          'Empezás por la base: sujetos, verbos modales en presente y los primeros sustantivos y adjetivos. Acá no hay tiempos verbales que confundan — solo automatizás el orden de la frase portuguesa y vocabulario nuevo.',
        level: 'a1',
        columns: [
          { label: 'Quién', labelTarget: 'Sujeito', role: 'subject', items: PORTUGUESE_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: PORTUGUESE_MODALS },
          { label: 'Acción', labelTarget: 'Ação', role: 'action', items: PORTUGUESE_ACTIONS },
          { label: 'Qué', labelTarget: 'Objeto', role: 'object', items: PORTUGUESE_OBJECTS },
        ],
      },
      {
        id: 'pasado-modal-v2',
        name: 'Verbos modais no pretérito imperfeito',
        description:
          'Mismos modales, ahora en pretérito imperfecto, sobre el mismo vocabulario. Sigue al A1 porque el orden de la frase ya lo tenés incorporado — el desafío ahora es la conjugación en pasado, no la estructura.',
        level: 'a2',
        columns: [
          { label: 'Quién', labelTarget: 'Sujeito', role: 'subject', items: PORTUGUESE_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: PORTUGUESE_MODALS_PAST },
          { label: 'Acción', labelTarget: 'Ação', role: 'action', items: PORTUGUESE_ACTIONS },
          { label: 'Qué', labelTarget: 'Objeto', role: 'object', items: PORTUGUESE_OBJECTS },
        ],
      },
      {
        id: 'condicional-modal-v2',
        name: 'Verbos modais no condicional',
        description:
          'Subís a los modales de cortesía (gostaria de/precisaria/poderia/deveria/saberia) para pedir las cosas con cortesía. Viene después del A2 porque para pedir con cortesía primero necesitás dominar el modal en sus tiempos básicos.',
        level: 'b1',
        columns: [
          { label: 'Quién', labelTarget: 'Sujeito', role: 'subject', items: PORTUGUESE_SUBJECTS },
          { label: 'Motivo', labelTarget: 'Modal', role: 'modal', items: PORTUGUESE_MODALS_COND },
          { label: 'Acción', labelTarget: 'Ação', role: 'action', items: PORTUGUESE_ACTIONS },
          { label: 'Qué', labelTarget: 'Objeto', role: 'object', items: PORTUGUESE_OBJECTS },
        ],
      },
      {
        id: 'pasiva-b2',
        name: 'Voz passiva',
        description:
          'El foco cambia: en vez de quién hace algo, practicás quién lo recibe con ser + participio, concordando en género con el sustantivo. Llega después de B1 porque necesitás los verbos automatizados — la pasiva es reorganizar esa misma info con el foco en otro lado.',
        level: 'b2',
        tabLabel: 'B2 · Passiva',
        columns: [
          {
            label: 'Sustantivo',
            labelTarget: 'Sujeito',
            role: 'subject',
            items: PORTUGUESE_PASSIVE_NOUNS,
          },
          {
            label: 'Auxiliar',
            labelTarget: 'Auxiliar',
            role: 'modal',
            items: PORTUGUESE_PASSIVE_AUX,
          },
          {
            label: 'Participio',
            labelTarget: 'Particípio',
            role: 'action',
            items: PORTUGUESE_PASSIVE_PARTICIPLE,
            agreesWith: 'subject',
          },
        ],
      },
      {
        id: 'subjuntivo-b2',
        name: 'Subjuntivo (disparador impessoal)',
        description:
          'Practicás el subjuntivo real del portugués, disparado por "é importante que" — la construcción impersonal más común para expresar necesidad. Va después de la pasiva porque ya sabés separar sujeto y acción; ahora el desafío es un modo verbal nuevo, no un orden de palabras nuevo.',
        level: 'b2',
        tabLabel: 'B2 · Subjuntivo',
        columns: [
          {
            label: 'Disparador',
            labelTarget: 'Disparador',
            role: 'modal',
            items: PORTUGUESE_SUBJUNCTIVE_TRIGGER,
          },
          { label: 'Quién', labelTarget: 'Sujeito', role: 'subject', items: PORTUGUESE_SUBJECTS },
          {
            label: 'Acción',
            labelTarget: 'Subjuntivo',
            role: 'action',
            items: PORTUGUESE_SUBJUNCTIVE_VERBS,
          },
          { label: 'Qué', labelTarget: 'Objeto', role: 'object', items: PORTUGUESE_OBJECTS },
        ],
      },
      {
        id: 'condicional-hipotetico-c1',
        name: 'Condicional hipotético',
        description:
          'Retomás los modales de B1, pero ahora dentro de una condición real: "Se eu fosse rico, viajaria mais." Viene después de B2 porque ya sabés separar sujeto y acción por separado — acá se combinan una prótasis y una consecuencia en una sola frase.',
        level: 'c1',
        tabLabel: 'C1 · Hipotético',
        columns: [
          {
            label: 'Condición',
            labelTarget: 'Condição',
            role: 'modal',
            items: PORTUGUESE_C1_TRIGGER,
          },
          {
            label: 'Quién',
            labelTarget: 'Sujeito',
            role: 'subject',
            items: PORTUGUESE_C1_SILENT_SUBJECTS,
          },
          {
            label: 'Adjetivo',
            labelTarget: 'Adjetivo',
            role: 'action',
            items: PORTUGUESE_C1_ADJECTIVES,
          },
          {
            label: 'Consecuencia',
            labelTarget: 'Consequência',
            role: 'object',
            items: PORTUGUESE_C1_APODOSIS,
          },
        ],
      },
      {
        id: 'discurso-indirecto-c2',
        name: 'Discurso indireto no passado',
        description:
          'El disparador pasa de presente a pasado ("Disse que...") y el verbo reportado retrocede un tiempo — esa es la marca de dominio C2 en discurso indirecto. Viene después de C1 porque ya sabés armar prótasis y consecuencia; acá el desafío es una conjugación en pasado, no una estructura nueva.',
        level: 'c2',
        tabLabel: 'C2 · Discurso indireto',
        columns: [
          {
            label: 'Disparador',
            labelTarget: 'Disparador',
            role: 'modal',
            items: PORTUGUESE_PAST_TRIGGER,
          },
          {
            label: 'Quién',
            labelTarget: 'Sujeito',
            role: 'subject',
            items: PORTUGUESE_SUBJECTS_LOWER,
          },
          {
            label: 'Acción',
            labelTarget: 'Mais-que-perfeito',
            role: 'action',
            items: PORTUGUESE_PLUPERFECT_FALADO,
          },
          { label: 'Qué', labelTarget: 'Objeto', role: 'object', items: PORTUGUESE_OBJECTS },
        ],
      },
    ],
    assemble: joinWords,
  },
};
