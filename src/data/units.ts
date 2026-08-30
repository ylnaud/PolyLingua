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
    { id: 6, name: 'Präpositionen', description: 'Preposiciones de lugar y tiempo', emoji: '🧭' },
  ],
  'en-a1': [
    { id: 1, name: 'First Sounds', description: 'Pronunciación desde cero', emoji: '🗣️' },
    { id: 2, name: 'Grammar Foundations', description: 'Las bases gramaticales', emoji: '📐' },
    { id: 3, name: 'Everyday Life', description: 'Vocabulario del día a día', emoji: '🌍' },
    { id: 4, name: 'Real Situations', description: 'Situaciones cotidianas', emoji: '🏠' },
  ],
  'fr-a1': [
    { id: 1, name: 'Les bases', description: 'Gramática esencial', emoji: '📐' },
    { id: 2, name: 'Parler au quotidien', description: 'Vocabulario y conversación', emoji: '💬' },
    {
      id: 3,
      name: 'Aller plus loin',
      description: 'Gramática intermedia y pronunciación',
      emoji: '🚀',
    },
    { id: 4, name: 'Situations', description: 'Situaciones cotidianas', emoji: '🏠' },
  ],
  'it-a1': [
    { id: 1, name: 'Le basi', description: 'Gramática esencial', emoji: '📐' },
    { id: 2, name: 'Parlare ogni giorno', description: 'Vocabulario y conversación', emoji: '💬' },
    {
      id: 3,
      name: 'Andare avanti',
      description: 'Gramática intermedia y pronunciación',
      emoji: '🚀',
    },
  ],
  'pt-a1': [
    { id: 1, name: 'As bases', description: 'Gramática esencial', emoji: '📐' },
    { id: 2, name: 'Falar no dia a dia', description: 'Vocabulario y conversación', emoji: '💬' },
    { id: 3, name: 'Ir além', description: 'Gramática intermedia y pronunciación', emoji: '🚀' },
  ],
  'de-a2': [
    { id: 1, name: 'Die Vergangenheit', description: 'Pasado y verbos modales', emoji: '⏳' },
    { id: 2, name: 'Der richtige Fall', description: 'Casos y preposiciones', emoji: '🎯' },
    {
      id: 3,
      name: 'Pronomen & Präpositionen',
      description: 'Pronombres y preposiciones fijas',
      emoji: '🔗',
    },
    {
      id: 4,
      name: 'Alltag meistern',
      description: 'Situaciones cotidianas avanzadas',
      emoji: '🏙️',
    },
  ],
  'en-a2': [
    { id: 1, name: 'Building Blocks', description: 'Estructuras gramaticales clave', emoji: '🧱' },
    { id: 2, name: 'Real-World English', description: 'Inglés para el día a día', emoji: '🌎' },
  ],
  'fr-a2': [
    {
      id: 1,
      name: 'Construire des phrases',
      description: 'Estructuras gramaticales clave',
      emoji: '🧱',
    },
    {
      id: 2,
      name: "S'exprimer au quotidien",
      description: 'Expresarse en el día a día',
      emoji: '🗣️',
    },
  ],
  'it-a2': [
    { id: 1, name: 'Costruire frasi', description: 'Estructuras gramaticales clave', emoji: '🧱' },
    {
      id: 2,
      name: 'Esprimersi ogni giorno',
      description: 'Expresarse en el día a día',
      emoji: '🗣️',
    },
  ],
  'pt-a2': [
    { id: 1, name: 'Construir frases', description: 'Estructuras gramaticales clave', emoji: '🧱' },
    {
      id: 2,
      name: 'Expressar-se no dia a dia',
      description: 'Expresarse en el día a día',
      emoji: '🗣️',
    },
  ],
  'de-b1': [
    {
      id: 1,
      name: 'Komplexe Sätze',
      description: 'Oraciones subordinadas y tiempos narrativos',
      emoji: '🔀',
    },
    {
      id: 2,
      name: 'Deutsch im Alltag',
      description: 'Gramática aplicada y vocabulario profesional',
      emoji: '💼',
    },
    {
      id: 3,
      name: 'Konjunktiv II & Perfekt',
      description: 'Reclamar, pedir y contar con cortesía',
      emoji: '🙋',
    },
    {
      id: 4,
      name: 'Präpositionen',
      description: 'Verbos con preposición fija y guía completa',
      emoji: '🧭',
    },
  ],
  'en-b1': [
    {
      id: 1,
      name: 'Complex Grammar',
      description: 'Tiempos compuestos y estructuras avanzadas',
      emoji: '🔀',
    },
    {
      id: 2,
      name: 'English in Practice',
      description: 'Gramática aplicada y vocabulario profesional',
      emoji: '💼',
    },
    {
      id: 3,
      name: 'Pronouns & Time',
      description: 'Indefinidos y expresiones de duración',
      emoji: '🕐',
    },
  ],
  'fr-b1': [
    {
      id: 1,
      name: 'Phrases complexes',
      description: 'Subordinadas, tiempos y pronombres',
      emoji: '🔀',
    },
    {
      id: 2,
      name: 'Le français en pratique',
      description: 'Gramática aplicada y vocabulario profesional',
      emoji: '💼',
    },
    {
      id: 3,
      name: 'Pronoms et durée',
      description: 'Indefinidos y expresiones de duración',
      emoji: '🕐',
    },
  ],
  'it-b1': [
    {
      id: 1,
      name: 'Frasi complesse',
      description: 'Subordinadas, tiempos y pronombres',
      emoji: '🔀',
    },
    {
      id: 2,
      name: "L'italiano in pratica",
      description: 'Gramática aplicada y vocabulario profesional',
      emoji: '💼',
    },
    {
      id: 3,
      name: 'Pronomi e durata',
      description: 'Indefinidos y expresiones de duración',
      emoji: '🕐',
    },
  ],
  'pt-b1': [
    {
      id: 1,
      name: 'Frases complexas',
      description: 'Subordinadas, tiempos y pronombres',
      emoji: '🔀',
    },
    {
      id: 2,
      name: 'Português na prática',
      description: 'Gramática aplicada y vocabulario profesional',
      emoji: '💼',
    },
    {
      id: 3,
      name: 'Pronomes e duração',
      description: 'Indefinidos y expresiones de duración',
      emoji: '🕐',
    },
  ],
  'de-b2': [
    {
      id: 1,
      name: 'Fortgeschrittene Strukturen',
      description: 'Pasiva, subjuntivo y futuro',
      emoji: '🏗️',
    },
    {
      id: 2,
      name: 'Ausdruck und Stil',
      description: 'Conectores avanzados y vocabulario temático',
      emoji: '🎨',
    },
  ],
  'en-b2': [
    {
      id: 1,
      name: 'Advanced Structures',
      description: 'Condicionales, pasiva y discurso indirecto',
      emoji: '🏗️',
    },
    {
      id: 2,
      name: 'Expression & Style',
      description: 'Conectores avanzados y vocabulario temático',
      emoji: '🎨',
    },
    {
      id: 3,
      name: 'Wishes & Deduction',
      description: 'Deseos, arrepentimiento y deducción modal',
      emoji: '🔮',
    },
  ],
  'fr-b2': [
    {
      id: 1,
      name: 'Structures avancées',
      description: 'Pasiva, relativos y condicional pasado',
      emoji: '🏗️',
    },
    {
      id: 2,
      name: 'Expression et style',
      description: 'Conectores avanzados y vocabulario temático',
      emoji: '🎨',
    },
    {
      id: 3,
      name: 'Temps composés et démonstratifs',
      description: 'Plus-que-parfait y pronombres demostrativos',
      emoji: '⏳',
    },
  ],
  'it-b2': [
    {
      id: 1,
      name: 'Strutture avanzate',
      description: 'Pasiva, relativos y condicional pasado',
      emoji: '🏗️',
    },
    {
      id: 2,
      name: 'Espressione e stile',
      description: 'Conectores avanzados y vocabulario temático',
      emoji: '🎨',
    },
    {
      id: 3,
      name: 'Trapassato e periodo ipotetico',
      description: 'Pasado compuesto e hipótesis',
      emoji: '⏳',
    },
  ],
  'pt-b2': [
    {
      id: 1,
      name: 'Estruturas avançadas',
      description: 'Pasiva, relativos y condicional compuesto',
      emoji: '🏗️',
    },
    {
      id: 2,
      name: 'Expressão e estilo',
      description: 'Conectores avanzados y vocabulario temático',
      emoji: '🎨',
    },
    {
      id: 3,
      name: 'Tempos compostos e demonstrativos',
      description: 'Pasado compuesto y pronombres demostrativos',
      emoji: '⏳',
    },
  ],
  'de-c1': [
    {
      id: 1,
      name: 'Meisterklasse Grammatik',
      description: 'Konjunktiv I, participio y verbos modales',
      emoji: '🎓',
    },
    {
      id: 2,
      name: 'Akademischer Stil',
      description: 'Estilo nominal, conectores y vocabulario académico',
      emoji: '📖',
    },
    {
      id: 3,
      name: 'Präpositionen',
      description: 'Preposiciones de registro académico y profesional',
      emoji: '🧭',
    },
  ],
  'en-c1': [
    {
      id: 1,
      name: 'Mastery Grammar',
      description: 'Discurso indirecto, modales y cleft sentences',
      emoji: '🎓',
    },
    {
      id: 2,
      name: 'Professional English',
      description: 'Colocaciones, conectores y vocabulario de negocios',
      emoji: '📖',
    },
    {
      id: 3,
      name: 'Reduced Clauses & Formal Register',
      description: 'Cláusulas de participio y subjuntivo formal',
      emoji: '🧩',
    },
  ],
  'fr-c1': [
    {
      id: 1,
      name: 'Maîtrise grammaticale',
      description: 'Subjonctif, discurso indirecto y mise en relief',
      emoji: '🎓',
    },
    {
      id: 2,
      name: 'Le français professionnel',
      description: 'Expresiones idiomáticas y vocabulario especializado',
      emoji: '📖',
    },
    {
      id: 3,
      name: 'Relatifs complexes et futur antérieur',
      description: 'Relativos compuestos y futuro anterior',
      emoji: '🧩',
    },
  ],
  'it-c1': [
    {
      id: 1,
      name: 'Padronanza grammaticale',
      description: 'Congiuntivo, discurso indirecto y dislocación',
      emoji: '🎓',
    },
    {
      id: 2,
      name: "L'italiano professionale",
      description: 'Expresiones idiomáticas y vocabulario especializado',
      emoji: '📖',
    },
    {
      id: 3,
      name: 'Congiuntivo avanzato e futuro anteriore',
      description: 'Subjuntivo compuesto y futuro anterior',
      emoji: '🧩',
    },
  ],
  'pt-c1': [
    {
      id: 1,
      name: 'Domínio gramatical',
      description: 'Subjuntivo futuro, discurso indirecto y clivadas',
      emoji: '🎓',
    },
    {
      id: 2,
      name: 'Português profissional',
      description: 'Expresiones idiomáticas y vocabulario especializado',
      emoji: '📖',
    },
    {
      id: 3,
      name: 'Estruturas exclusivas do português',
      description: 'Passiva com se e infinitivo pessoal',
      emoji: '🧩',
    },
  ],
  'de-c2': [
    {
      id: 1,
      name: 'Sprache und Kultur',
      description: 'Partículas modales, expresiones y registro',
      emoji: '🏛️',
    },
    {
      id: 2,
      name: 'Kreatives Deutsch',
      description: 'Variedades regionales, humor y retórica',
      emoji: '✨',
    },
    {
      id: 3,
      name: 'Präpositionen',
      description: 'Idiomática y matices con preposiciones',
      emoji: '🧭',
    },
  ],
  'en-c2': [
    {
      id: 1,
      name: 'Language & Culture',
      description: 'Inversión, phrasal verbs y registro',
      emoji: '🏛️',
    },
    {
      id: 2,
      name: 'Creative English',
      description: 'Retórica, humor y estilo literario',
      emoji: '✨',
    },
    {
      id: 3,
      name: 'Nuance & Indirection',
      description: 'Nominalización y sutileza británica',
      emoji: '🗨️',
    },
  ],
  'fr-c2': [
    {
      id: 1,
      name: 'Langue et culture',
      description: 'Registros, estilo formal e ironía',
      emoji: '🏛️',
    },
    {
      id: 2,
      name: 'Le français créatif',
      description: 'Francofonía, juegos de palabras y retórica',
      emoji: '✨',
    },
    {
      id: 3,
      name: 'Français des jeunes et emprunts',
      description: 'Argot, verlan y anglicismos',
      emoji: '🗨️',
    },
  ],
  'it-c2': [
    {
      id: 1,
      name: 'Lingua e cultura',
      description: 'Registro, estilo formal e ironía',
      emoji: '🏛️',
    },
    {
      id: 2,
      name: "L'italiano creativo",
      description: 'Variedades regionales, juegos de palabras y retórica',
      emoji: '✨',
    },
    {
      id: 3,
      name: 'Italiano dei giovani',
      description: 'Slang, anglicismos y neologismos',
      emoji: '🗨️',
    },
  ],
  'pt-c2': [
    {
      id: 1,
      name: 'Língua e cultura',
      description: 'Registro, estilo formal e ironía',
      emoji: '🏛️',
    },
    {
      id: 2,
      name: 'Português criativo',
      description: 'Variedades regionales, juegos de palabras y retórica',
      emoji: '✨',
    },
    {
      id: 3,
      name: 'Português informal',
      description: 'Gírias, estrangeirismos y diminutivos',
      emoji: '🗨️',
    },
  ],
};
