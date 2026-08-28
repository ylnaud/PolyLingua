// Texto SEO de Autoridad (TSA): un bloque de contenido con profundidad
// temática para páginas de listado (como /es/[lang]/[level]) que de
// otra forma tienen poco texto propio para Google. Se coloca después del
// grid de lecciones, no antes, para no retrasar el contenido que el
// usuario realmente busca. Formato pensado para escanear, no para leer de
// corrido: lede corta + checklist + un insight breve + un dato de tiempo.
// Clave: `${lang}-${level}`. Si una combinación no tiene entrada acá, la
// página simplemente no muestra el bloque.
export interface TsaLink {
  href: string;
  label: string;
}

export interface TsaEntry {
  heading: string;
  intro: string;
  achievements: string[];
  insight: string;
  stat: { value: string; label: string };
  links: TsaLink[];
}

export const TSA: Partial<Record<string, TsaEntry>> = {
  'de-a1': {
    heading: 'Aprender alemán A1 gratis: qué vas a lograr y por qué no es tan difícil como parece',
    intro:
      'El nivel A1 según el MCER es el punto de partida oficial: lo esencial para sobrevivir una conversación cotidiana sin entrar en pánico. La mayoría le tiene miedo al alemán por fama de "idioma difícil", pero en A1 la dificultad real está en solo tres cosas.',
    achievements: [
      'Presentarte y saludar en distintos contextos',
      'Pedir en un restaurante y hacer compras',
      'Preguntar precios y direcciones',
      'Hablar de tu familia y tu rutina diaria',
      'Contar en presente lo que hacés y te gusta',
    ],
    insight:
      'El género gramatical (der, die, das), el orden de palabras (el verbo va en segunda posición) y algunos sonidos nuevos (ch, ü, ö) son la única dificultad real de este nivel — el resto es bastante regular y predecible una vez entendés el patrón.',
    stat: { value: '6-8 semanas', label: 'a 15-20 min diarios' },
    links: [
      { href: '/es/de/a1/saludos-presentarse', label: 'Saludos y presentarse' },
      { href: '/es/de/a1/articulos-der-die-das', label: 'Der, die, das' },
      { href: '/es/de/a1/presente-verbos', label: 'El presente (Präsens)' },
    ],
  },
  'de-a2': {
    heading: 'Alemán A2 gratis: el pasado, los casos y las frases que ya te hacen sonar local',
    intro:
      'A2 es donde el alemán deja de ser "frases sueltas" y empieza a ser conversación real: contás lo que hiciste ayer, pedís un turno médico, hacés planes. También es donde aparece el verdadero examen del idioma — los casos.',
    achievements: [
      'Contar en pasado (Perfekt) lo que hiciste',
      'Pedir un turno médico y describir síntomas',
      'Atender el teléfono y dejar un mensaje',
      'Usar Dativ y Akkusativ para decir quién recibe qué',
      'Comparar cosas con Komparativ y Superlativ',
    ],
    insight:
      'El verdadero salto de dificultad en A2 no es el vocabulario nuevo, es el Dativ vs. Akkusativ: decidir qué artículo usar según si algo "recibe" o "es" la acción. Es la base gramatical de todo lo que viene después, así que vale la pena dominarlo acá y no arrastrarlo.',
    stat: { value: '8-10 semanas', label: 'si ya completaste A1' },
    links: [
      { href: '/es/de/a2/perfekt-pasado', label: 'Perfekt: el pasado' },
      { href: '/es/de/a2/dativ-akkusativ', label: 'Dativ vs. Akkusativ' },
      { href: '/es/de/a2/verbos-modales', label: 'Verbos modales' },
    ],
  },
  'de-b1': {
    heading: 'Alemán B1: conecta ideas como un adulto (y sobrevive al Adjektivdeklination)',
    intro:
      'En B1 dejás de hablar en frases cortas y empezás a argumentar: por qué, aunque, aunque no. Es el nivel donde el alemán empieza a sonar a idioma de verdad — con oraciones subordinadas y opiniones con matices.',
    achievements: [
      'Conectar ideas con weil, dass, obwohl',
      'Usar Genitiv, el caso de la posesión formal',
      'Declinar adjetivos correctamente (der/ein/sin artículo)',
      'Hablar de tu trabajo y vida profesional',
      'Contar historias en Präteritum',
    ],
    insight:
      'El Adjektivdeklination (qué terminación lleva un adjetivo según el caso, género y si hay artículo) tiene fama de ser lo más temido del alemán intermedio. La buena noticia: sigue un patrón de tabla fijo, no hay que memorizar excepciones — solo la tabla correcta.',
    stat: { value: '10-12 semanas', label: 'nivel intermedio real' },
    links: [
      { href: '/es/de/b1/oraciones-subordinadas', label: 'Oraciones subordinadas' },
      { href: '/es/de/b1/adjektivdeklination', label: 'Adjektivdeklination' },
      { href: '/es/de/b1/genitiv', label: 'Der Genitiv' },
    ],
  },
  'de-b2': {
    heading: 'Alemán B2: domina la voz pasiva, el subjuntivo y el alemán de las noticias',
    intro:
      'B2 es el nivel de "puedo leer el diario y entender casi todo". Acá aparece la voz pasiva de verdad, el Konjunktiv II para hablar de hipótesis, y los conectores que usan los adultos para debatir en serio.',
    achievements: [
      'Entender y usar la voz pasiva (Passiv)',
      'Hablar de hipótesis y cortesía con Konjunktiv II',
      'Hablar del futuro con Futur I y II',
      'Debatir con Konnektoren de nivel argumentativo',
      'Leer vocabulario de economía y sociedad',
    ],
    insight:
      'La voz pasiva en alemán no es solo "werden + participio" — cambia según si es un proceso (Vorgangspassiv) o un resultado (Zustandspassiv), una distinción que el español no tiene y que hace sonar mucho más nativo a quien la domina.',
    stat: { value: '3-4 meses', label: 'nivel intermedio alto' },
    links: [
      { href: '/es/de/b2/voz-pasiva', label: 'Passiv' },
      { href: '/es/de/b2/konjunktiv-2', label: 'Konjunktiv II' },
      { href: '/es/de/b2/konnektoren', label: 'Konnektoren' },
    ],
  },
  'de-c1': {
    heading: 'Alemán C1: el registro formal, académico y periodístico',
    intro:
      'C1 es el idioma de la universidad y la oficina: discurso indirecto sin comillas, frases nominales en vez de verbales, y el vocabulario que necesitás para leer un paper o escribir un informe.',
    achievements: [
      'Repetir lo que otros dijeron con Konjunktiv I',
      'Escribir en Nominalstil, el estilo formal alemán',
      'Usar preposiciones de registro académico',
      'Entender Funktionsverbgefüge (verbos disfrazados de frase)',
      'Leer y escribir textos científicos',
    ],
    insight:
      'El Konjunktiv I (para el discurso indirecto: "dijo que había llegado") casi no se usa al hablar, pero es el estándar en noticias y textos formales — reconocerlo es lo que separa entender un artículo del diario de solo entender una conversación.',
    stat: { value: '4-6 meses', label: 'nivel avanzado' },
    links: [
      { href: '/es/de/c1/konjunktiv-1', label: 'Konjunktiv I' },
      { href: '/es/de/c1/nominalstil', label: 'Nominalstil vs. Verbalstil' },
      { href: '/es/de/c1/wissenschaft', label: 'Wissenschaftssprache' },
    ],
  },
  'de-c2': {
    heading: 'Alemán C2: ironía, humor y los matices que solo domina un nativo culto',
    intro:
      'C2 no es "más gramática" — a este nivel ya la sabés casi toda. Es entender el chiste sin traducirlo, notar cuándo alguien es irónico, y reconocer que un berlinés y un bávaro no hablan exactamente el mismo alemán.',
    achievements: [
      'Detectar ironía y cambios de registro',
      'Entender Redewendungen (modismos) de uso diario',
      'Reconocer Jugendsprache y anglicismos actuales',
      'Notar diferencias entre variantes regionales',
      'Usar partículas modales (ja, doch, mal, halt)',
    ],
    insight:
      'Las partículas modales — ja, doch, mal, halt — no tienen traducción directa y casi no aparecen en los libros de texto, pero son lo que más delata a un hablante no nativo. Dominarlas es la diferencia entre "hablar alemán perfecto" y "sonar alemán".',
    stat: { value: 'maestría', label: 'sin techo fijo de tiempo' },
    links: [
      { href: '/es/de/c2/redewendungen', label: 'Redewendungen' },
      { href: '/es/de/c2/ironie-register', label: 'Ironie und Register' },
      { href: '/es/de/c2/particulas-modales', label: 'Partículas modales' },
    ],
  },

  'en-a1': {
    heading: 'Aprender inglés A1 gratis: lo básico que ya casi sabés (sin darte cuenta)',
    intro:
      'El inglés comparte tanto vocabulario con el español (información, nación, posible) que A1 avanza más rápido que en otros idiomas — el reto real está en la pronunciación y en un verbo que hace todo el trabajo.',
    achievements: [
      'Presentarte y hablar de tu familia',
      'Pedir en un restaurante y hacer compras',
      'Preguntar y decir la hora',
      'Contar rutinas con Simple Present',
      "Usar 'to be' en cualquier frase",
    ],
    insight:
      "El verbo 'to be' aparece en casi cada frase en inglés — para describir, ubicar y hasta decir la edad ('I am 20', no 'I have 20 years' como en español). Dominarlo desde el día uno evita que arrastres ese error durante meses.",
    stat: { value: '5-7 semanas', label: 'gracias al vocabulario compartido con el español' },
    links: [
      { href: '/es/en/a1/to-be', label: "El verbo 'to be'" },
      { href: '/es/en/a1/simple-present', label: 'Simple Present' },
      { href: '/es/en/a1/articles', label: 'A, An, The' },
    ],
  },
  'en-a2': {
    heading: "Inglés A2 gratis: el pasado, las comparaciones y el 'do' que tanto cuesta",
    intro:
      'En A2 empezás a contar historias (Past Simple) y a comparar todo, pero también aparece la estructura que más le cuesta a los hispanohablantes: hacer preguntas con do/does.',
    achievements: [
      'Contar en pasado lo que hiciste',
      'Comparar cosas con -er/-est y more',
      'Hablar por teléfono y en el médico',
      'Usar preposiciones in/on/at sin adivinar',
      'Formar preguntas con do/does',
    ],
    insight:
      "En español preguntás invirtiendo el orden ('¿Comes pizza?'); en inglés necesitás un verbo auxiliar que no significa nada ('Do you eat pizza?'). Es el error #1 de los hispanohablantes en A2 — y una vez que hace clic, no se olvida.",
    stat: { value: '7-9 semanas', label: 'si ya completaste A1' },
    links: [
      { href: '/es/en/a2/past-simple', label: 'Past Simple' },
      { href: '/es/en/a2/question-formation', label: 'Question Formation' },
      { href: '/es/en/a2/comparatives-superlatives', label: 'Comparatives and Superlatives' },
    ],
  },
  'en-b1': {
    heading: 'Inglés B1: la confusión #1 de los hispanohablantes (Present Perfect) y más',
    intro:
      'B1 te da fluidez real: hablás del futuro con distintos matices, conectás ideas con relative clauses, y por fin enfrentás el tiempo verbal que en español simplemente no existe igual.',
    achievements: [
      'Distinguir Present Perfect de Past Simple',
      'Hablar del futuro con will/going to',
      'Conectar frases con who/which/that',
      'Usar gerundios e infinitivos correctamente',
      'Hablar de hábitos pasados con used to',
    ],
    insight:
      "El Present Perfect ('I have lived here for 5 years') no tiene equivalente exacto en español — no es ni pasado ni presente, es una acción que empezó antes y sigue conectada a ahora. Es la trampa gramatical más común de este nivel.",
    stat: { value: '9-11 semanas', label: 'nivel intermedio real' },
    links: [
      { href: '/es/en/b1/present-perfect', label: 'Present Perfect vs. Past Simple' },
      { href: '/es/en/b1/future-forms', label: 'Future Forms' },
      { href: '/es/en/b1/relative-clauses', label: 'Relative Clauses' },
    ],
  },
  'en-b2': {
    heading: 'Inglés B2: domina los condicionales y la voz pasiva de las noticias',
    intro:
      'B2 es leer el New York Times y entender casi todo: condicionales para hipótesis, voz pasiva para reportar hechos sin culpar a nadie, y los conectores que usan los adultos para argumentar.',
    achievements: [
      'Usar los 3 tipos de condicionales',
      'Formar la voz pasiva en cualquier tiempo',
      'Reportar preguntas indirectamente',
      'Conectar ideas con however/moreover/despite',
      'Hablar de deseos y arrepentimientos con wish',
    ],
    insight:
      "Los Mixed Conditionals (mezclar un condicional de pasado con uno de presente: 'If I had studied medicine, I would be a doctor now') son donde más se traban los hablantes de B2, porque combinan dos estructuras aprendidas por separado.",
    stat: { value: '3-4 meses', label: 'nivel intermedio alto' },
    links: [
      { href: '/es/en/b2/conditionals', label: 'Conditionals' },
      { href: '/es/en/b2/passive-voice', label: 'Passive Voice' },
      { href: '/es/en/b2/advanced-connectors', label: 'Advanced Connectors' },
    ],
  },
  'en-c1': {
    heading: 'Inglés C1: el registro formal, académico y de negocios',
    intro:
      'C1 es el inglés de la universidad y la sala de juntas: reported speech para citar sin comillas, cleft sentences para dar énfasis, y el vocabulario para un email profesional en inglés.',
    achievements: [
      'Reportar lo que otros dijeron sin comillas',
      'Escribir con collocations avanzadas',
      'Dar énfasis con cleft sentences',
      'Comprender participle clauses',
      'Comunicarte en inglés de negocios',
    ],
    insight:
      "Las collocations (qué palabras 'van juntas' en inglés — 'make a decision', no 'do a decision') son lo que separa un inglés técnicamente correcto de uno que suena natural. Nadie las adivina por lógica, hay que aprenderlas como bloques.",
    stat: { value: '4-6 meses', label: 'nivel avanzado' },
    links: [
      { href: '/es/en/c1/reported-speech', label: 'Reported Speech' },
      { href: '/es/en/c1/collocations', label: 'Advanced Collocations' },
      { href: '/es/en/c1/business-english', label: 'Business English' },
    ],
  },
  'en-c2': {
    heading: 'Inglés C2: phrasal verbs, ironía y el humor que solo entiende un nativo',
    intro:
      'C2 no es más gramática — es el código secreto del inglés hablado real: phrasal verbs, entender un chiste sin que te lo expliquen, y notar la diferencia entre el inglés británico y el americano.',
    achievements: [
      'Usar phrasal verbs con fluidez',
      'Detectar understatement e ironía',
      'Distinguir inglés británico y americano',
      'Reconocer proverbios y dichos',
      'Usar inversion para sonar casi nativo',
    ],
    insight:
      "Los phrasal verbs (look up, give in, put off) son la razón por la que muchos C1 avanzados se sienten 'perdidos' escuchando a nativos — no están en ningún examen tradicional, pero son gran parte del inglés hablado real.",
    stat: { value: 'maestría', label: 'sin techo fijo de tiempo' },
    links: [
      { href: '/es/en/c2/phrasal-verbs', label: 'Phrasal Verbs' },
      { href: '/es/en/c2/wordplay-irony', label: 'Wordplay and Irony' },
      { href: '/es/en/c2/british-american', label: 'British vs. American English' },
    ],
  },

  'fr-a1': {
    heading: 'Aprender francés A1 gratis: sobrevive al género (y a la pronunciación)',
    intro:
      'El francés A1 tiene fama de romántico pero difícil de pronunciar — la buena noticia es que la gramática básica es predecible una vez agarrás el patrón de le/la y los tres grupos de verbos.',
    achievements: [
      'Saludar y presentarte en francés',
      'Pedir en un restaurante y hacer compras',
      'Preguntar y decir la hora',
      'Usar el presente de los 3 grupos de verbos',
      'Contar del 0 al 100',
    ],
    insight:
      'Cada sustantivo en francés es masculino o femenino sin lógica aparente (le vs. la) — como en español, pero sin las pistas de -o/-a. La estrategia que funciona es memorizar cada palabra CON su artículo desde el día uno.',
    stat: { value: '6-8 semanas', label: 'a 15-20 min diarios' },
    links: [
      { href: '/es/fr/a1/salutations', label: 'Salutations' },
      { href: '/es/fr/a1/articles-genre', label: 'Le, la, un, une' },
      { href: '/es/fr/a1/present-indicatif', label: 'Le présent' },
    ],
  },
  'fr-a2': {
    heading: 'Francés A2: el pasado, los pronombres COD/COI y las primeras frases con fluidez',
    intro:
      'En A2 empezás a contar el pasado con le passé composé, a reemplazar sustantivos con pronombres para no repetir, y a decidir dónde va cada adjetivo — el francés tiene reglas propias para eso.',
    achievements: [
      'Contar en pasado con le passé composé',
      'Reemplazar objetos con pronombres COD/COI',
      'Ubicar adjetivos antes o después del sustantivo',
      'Pedir con il faut y los verbos modales',
      'Comparar cosas con plus/moins/aussi',
    ],
    insight:
      "A diferencia del español, en francés la posición del adjetivo cambia el significado a veces ('un homme grand' = un hombre alto, 'un grand homme' = un gran hombre) — detalles que separan un francés correcto de uno elegante.",
    stat: { value: '8-10 semanas', label: 'si ya completaste A1' },
    links: [
      { href: '/es/fr/a2/passe-compose', label: 'Le passé composé' },
      { href: '/es/fr/a2/pronoms-cod-coi', label: 'Pronoms COD et COI' },
      { href: '/es/fr/a2/place-adjectifs', label: 'La place des adjectifs' },
    ],
  },
  'fr-b1': {
    heading: 'Francés B1: el condicional, los conectores de tiempo y sonar más fluido',
    intro:
      'B1 te da matices reales: pedís cosas con cortesía usando le conditionnel, marcás con precisión cuándo pasa algo, y por fin distinguís el fondo de una historia de la acción principal.',
    achievements: [
      'Pedir con cortesía usando le conditionnel',
      'Marcar el tiempo con depuis/pendant/il y a',
      'Distinguir imparfait de passé composé',
      'Reemplazar lugares e ideas con y/en',
      'Hablar de tu trabajo y vida profesional',
    ],
    insight:
      "L'imparfait (el fondo de una historia: 'il pleuvait') y le passé composé (la acción puntual: 'je suis sorti') son la trampa #1 de este nivel — el español los distingue igual (imperfecto vs. pretérito), la lógica ya la tenés.",
    stat: { value: '10-12 semanas', label: 'nivel intermedio real' },
    links: [
      { href: '/es/fr/b1/conditionnel-present', label: 'Le conditionnel présent' },
      { href: '/es/fr/b1/imparfait-passe-compose', label: 'Imparfait vs. passé composé' },
      { href: '/es/fr/b1/depuis-pendant-il-y-a-dans', label: 'Depuis, pendant, il y a, dans' },
    ],
  },
  'fr-b2': {
    heading: 'Francés B2: domina la voz pasiva, el gerundio y el francés de las noticias',
    intro:
      'B2 es leer Le Monde y entender casi todo: voz pasiva para reportar sin culpar, pronombres relativos para frases elegantes, y los conectores lógicos que usan los adultos para argumentar.',
    achievements: [
      'Formar la voz pasiva en cualquier tiempo',
      'Conectar ideas con pronombres relativos',
      'Usar le gérondif para dos acciones a la vez',
      'Explicar causa y consecuencia con precisión',
      'Hablar de lo que ya había pasado con le plus-que-parfait',
    ],
    insight:
      "Los pronombres relativos compuestos (celui qui, ce dont, ce à quoi) son lo que hace que una frase suene elegante en vez de repetitiva — cambiar 'la persona que...' por 'celui qui...' es donde se nota el salto de nivel.",
    stat: { value: '3-4 meses', label: 'nivel intermedio alto' },
    links: [
      { href: '/es/fr/b2/voix-passive', label: 'La voix passive' },
      { href: '/es/fr/b2/pronoms-relatifs', label: 'Les pronoms relatifs' },
      { href: '/es/fr/b2/connecteurs-logiques', label: 'Connecteurs logiques' },
    ],
  },
  'fr-c1': {
    heading: 'Francés C1: el subjuntivo, el registro formal y el francés de negocios',
    intro:
      'C1 es el francés de la universidad y la sala de juntas: le subjonctif para expresar duda y emoción, le discours indirect para citar con precisión, y el vocabulario para escribir como un profesional.',
    achievements: [
      'Usar le subjonctif para duda y emoción',
      'Reportar lo que otros dijeron con precisión',
      'Dar énfasis con la mise en relief',
      'Comunicarte en francés de negocios',
      'Escribir con vocabulario académico',
    ],
    insight:
      "Le subjonctif no se traduce por lógica desde el español — se activa por ciertos verbos y expresiones ('il faut que', 'je doute que'), no por el significado de la frase. Es lo que más diferencia a un C1 real de alguien que memorizó reglas.",
    stat: { value: '4-6 meses', label: 'nivel avanzado' },
    links: [
      { href: '/es/fr/c1/subjonctif', label: 'Le subjonctif' },
      { href: '/es/fr/c1/discours-indirect', label: 'Le discours indirect' },
      { href: '/es/fr/c1/francais-affaires', label: 'Le français des affaires' },
    ],
  },
  'fr-c2': {
    heading: 'Francés C2: argot, ironía y el humor que solo entiende un nativo',
    intro:
      'C2 no es más gramática — es el argot que no está en los libros, entender un chiste sin que te lo expliquen, y notar que un québécois y un parisino no hablan exactamente el mismo francés.',
    achievements: [
      'Entender argot y verlan cotidiano',
      'Detectar ironía y humor en francés',
      'Reconocer variantes de la Francophonie',
      'Usar partículas como donc/quand même/enfin',
      'Escribir con el estilo soutenu de un editorial',
    ],
    insight:
      'Las partículas de discurso —donc, quand même, enfin, ben— no tienen traducción directa y casi no aparecen en los libros, pero son lo que más delata a un hablante no nativo. Es la diferencia entre "hablar francés perfecto" y "sonar francés".',
    stat: { value: 'maestría', label: 'sin techo fijo de tiempo' },
    links: [
      { href: '/es/fr/c2/registres-particules', label: 'Particules de discours' },
      { href: '/es/fr/c2/ironie-humour', label: "L'ironie et l'humour" },
      { href: '/es/fr/c2/francophonie', label: 'La Francophonie' },
    ],
  },

  'it-a1': {
    heading: 'Aprender italiano A1 gratis: el idioma más cercano al español (con trampas)',
    intro:
      'El italiano es el idioma más fácil para un hispanohablante — comparten vocabulario y sonidos — pero justo esa cercanía esconde falsos amigos y detalles que te delatan como principiante.',
    achievements: [
      'Saludar y presentarte en italiano',
      'Pedir en un restaurante y hacer compras',
      'Preguntar y decir la hora',
      'Usar el presente de los verbos regulares',
      'Formar preguntas sin invertir nada',
    ],
    insight:
      "En italiano no invertís el orden para preguntar como en inglés — 'Parli italiano?' se forma igual que la afirmación, solo cambia la entonación. Es una de las pocas reglas donde el italiano es más simple que el español.",
    stat: { value: '5-7 semanas', label: 'el idioma más rápido para hispanohablantes' },
    links: [
      { href: '/es/it/a1/saluti', label: 'Saluti' },
      { href: '/es/it/a1/presente-indicativo', label: 'Il presente' },
      { href: '/es/it/a1/fare-domande', label: 'Fare domande' },
    ],
  },
  'it-a2': {
    heading: 'Italiano A2: el pasado, los pronombres y las primeras frases con fluidez',
    intro:
      'En A2 contás el pasado con il passato prossimo, reemplazás objetos con pronombres para no repetir, y aprendés cuándo usar dovere, potere y volere — los tres verbos que abren cualquier puerta.',
    achievements: [
      'Contar en pasado con il passato prossimo',
      'Reemplazar objetos con pronomi diretti e indiretti',
      'Pedir y opinar con dovere/potere/volere',
      'Ubicar adjetivos antes o después del sustantivo',
      'Comparar cosas con più/meno/come',
    ],
    insight:
      "Il passato prossimo se forma con essere o avere según el verbo, y con essere el participio concuerda en género y número ('sono andata' si sos mujer) — un detalle que el español no tiene y sorprende a muchos en este nivel.",
    stat: { value: '7-9 semanas', label: 'si ya completaste A1' },
    links: [
      { href: '/es/it/a2/passato-prossimo', label: 'Il passato prossimo' },
      { href: '/es/it/a2/pronomi-diretti-indiretti', label: 'Pronomi diretti e indiretti' },
      { href: '/es/it/a2/verbi-modali', label: 'Dovere, potere, volere' },
    ],
  },
  'it-b1': {
    heading: 'Italiano B1: el condicional, la trampa da/per y sonar más fluido',
    intro:
      'B1 te da matices reales: pedís con cortesía usando il condizionale, distinguís el fondo de una historia de la acción principal, y enfrentás una preposición que confunde a todo hispanohablante.',
    achievements: [
      'Pedir con cortesía usando il condizionale',
      'Distinguir da y per en el tiempo',
      'Distinguir imperfetto de passato prossimo',
      'Conectar ideas con perché/sebbene/quando',
      'Hablar de tu trabajo y vida profesional',
    ],
    insight:
      "Da y per parecen intercambiables desde el español, pero en italiano marcan duración distinta: 'da tre anni' (desde hace 3 años, sigue) vs. 'per tre anni' (durante 3 años, ya terminó). La trampa temporal #1 de este nivel.",
    stat: { value: '9-11 semanas', label: 'nivel intermedio real' },
    links: [
      { href: '/es/it/b1/condizionale-presente', label: 'Il condizionale presente' },
      { href: '/es/it/b1/da-per', label: 'Da vs. per' },
      { href: '/es/it/b1/imperfetto-passato-prossimo', label: 'Imperfetto vs. passato prossimo' },
    ],
  },
  'it-b2': {
    heading: 'Italiano B2: domina la voz pasiva, el gerundio y el italiano de las noticias',
    intro:
      'B2 es leer il Corriere della Sera y entender casi todo: voz pasiva para reportar sin culpar, pronombres relativos para frases elegantes, y el periodo ipotetico para hablar de lo que podría pasar.',
    achievements: [
      'Formar la voz pasiva en cualquier tiempo',
      'Conectar ideas con pronomi relativi',
      'Usar il gerundio para dos acciones a la vez',
      'Hablar de hipótesis con il periodo ipotetico',
      'Explicar causa y consecuencia con precisión',
    ],
    insight:
      'Il periodo ipotetico tiene tres tipos —realidad, posibilidad e irrealidad— y cada uno exige una combinación distinta de modos y tiempos verbales. Dominarlos es matizar exactamente cuán probable es algo, no solo "hablar de hipótesis".',
    stat: { value: '3-4 meses', label: 'nivel intermedio alto' },
    links: [
      { href: '/es/it/b2/voce-passiva', label: 'La voce passiva' },
      { href: '/es/it/b2/pronomi-relativi', label: 'I pronomi relativi' },
      { href: '/es/it/b2/periodo-ipotetico', label: 'Periodo ipotetico' },
    ],
  },
  'it-c1': {
    heading: 'Italiano C1: il congiuntivo, el registro formal y el italiano de negocios',
    intro:
      'C1 es el italiano de la universidad y la sala de juntas: il congiuntivo para expresar duda y emoción, il discorso indiretto para citar con precisión, y el vocabulario para escribir como un profesional.',
    achievements: [
      'Usar il congiuntivo para duda y emoción',
      'Reportar lo que otros dijeron con precisión',
      'Dar énfasis con la dislocazione',
      'Comunicarte en italiano de negocios',
      'Reconocer il passato remoto en textos literarios',
    ],
    insight:
      "Il congiuntivo no se traduce por lógica desde el español — se activa por ciertos verbos y expresiones ('penso che', 'è possibile che'), no por el significado de la frase. Es lo que más diferencia a un C1 real de alguien que memorizó reglas.",
    stat: { value: '4-6 meses', label: 'nivel avanzado' },
    links: [
      { href: '/es/it/c1/congiuntivo', label: 'Il congiuntivo' },
      { href: '/es/it/c1/discorso-indiretto', label: 'Il discorso indiretto' },
      { href: '/es/it/c1/italiano-affari', label: "L'italiano degli affari" },
    ],
  },
  'it-c2': {
    heading: 'Italiano C2: slang, ironía y el humor que solo entiende un nativo',
    intro:
      'C2 no es más gramática — es el slang giovanile que no está en los libros, entender un chiste sin que te lo expliquen, y notar que un siciliano y un milanés no hablan exactamente el mismo italiano.',
    achievements: [
      'Entender slang giovanile y neologismos',
      'Detectar ironia e umorismo en italiano',
      'Reconocer varianti regionali',
      'Usar partículas como mica/dai/magari',
      'Escribir con el estilo formale de un editorial',
    ],
    insight:
      'Las partículas de discurso —mica, dai, magari, ecco— no tienen traducción directa y casi no aparecen en los libros, pero son lo que más delata a un hablante no nativo. Es la diferencia entre "hablar italiano perfecto" y "sonar italiano".',
    stat: { value: 'maestría', label: 'sin techo fijo de tiempo' },
    links: [
      { href: '/es/it/c2/particelle-registro', label: 'Particelle di registro' },
      { href: '/es/it/c2/ironia-umorismo', label: "L'ironia e l'umorismo" },
      { href: '/es/it/c2/varianti-regionali', label: 'Varianti regionali' },
    ],
  },

  'pt-a1': {
    heading: 'Aprender portugués A1 gratis: el primo cercano que sorprende con sus sonidos',
    intro:
      'El portugués parece un espejo del español en la gramática, pero la pronunciación (vocales nasales, la letra x) es otro mundo — eso hace que suene distinto desde el primer día.',
    achievements: [
      'Saludar y presentarte en portugués',
      'Hacer preguntas desde el día uno',
      'Preguntar y decir la hora',
      'Usar el presente de los verbos regulares',
      'Contar del 0 al 100',
    ],
    insight:
      'Las vocales nasales (ão, ãe, õe) no existen en español y son la principal marca de acento — practicarlas desde A1, en vez de ignorarlas, es lo que más rápido te hace sonar auténtico en portugués.',
    stat: { value: '5-7 semanas', label: 'gracias a la cercanía con el español' },
    links: [
      { href: '/es/pt/a1/saudacoes', label: 'Saudações' },
      { href: '/es/pt/a1/presente-indicativo', label: 'O presente' },
      { href: '/es/pt/a1/perguntas', label: 'Como fazer perguntas' },
    ],
  },
  'pt-a2': {
    heading: 'Portugués A2: el pasado, los pronombres de objeto y las primeras frases con fluidez',
    intro:
      'En A2 contás el pasado con o pretérito perfeito (sin auxiliar, a diferencia del inglés o francés), reemplazás objetos con o/a/lhe, y aprendés a expresar necesidad con é preciso.',
    achievements: [
      'Contar en pasado con o pretérito perfeito',
      'Reemplazar objetos con o/a/lhe',
      'Expresar necesidad con é preciso',
      'Pedir y opinar con poder/dever/querer',
      'Comparar cosas con mais... do que',
    ],
    insight:
      "A diferencia del inglés o francés, el portugués forma el pasado simple sin auxiliar: 'eu falei' (hablé). Es más simple que otros idiomas en este punto — el reto está en las terminaciones irregulares de los verbos más comunes.",
    stat: { value: '7-9 semanas', label: 'si ya completaste A1' },
    links: [
      { href: '/es/pt/a2/preterito-perfeito', label: 'O pretérito perfeito' },
      { href: '/es/pt/a2/pronomes-diretos-indiretos', label: 'O, a, lhe' },
      { href: '/es/pt/a2/e-preciso', label: 'É preciso' },
    ],
  },
  'pt-b1': {
    heading: 'Portugués B1: la colocación pronominal y sonar más fluido',
    intro:
      'B1 te da matices reales: pedís con cortesía usando o condicional, distinguís el fondo de una historia de la acción principal, y enfrentás algo que no existe en español — dónde va el pronombre.',
    achievements: [
      'Pedir con cortesía usando o condicional',
      'Distinguir imperfeito de pretérito perfeito',
      'Ubicar el pronombre con próclise, ênclise e mesóclise',
      'Conectar ideas con porque/embora/quando',
      'Hablar de tu trabajo y vida profesional',
    ],
    insight:
      "La colocación pronominal ('te vejo' vs 'vejo-te') no tiene equivalente en español y varía entre el portugués de Brasil y de Portugal. Es la trampa más particular de este nivel — y la que más rápido delata qué variante aprendiste.",
    stat: { value: '9-11 semanas', label: 'nivel intermedio real' },
    links: [
      { href: '/es/pt/b1/colocacao-pronominal', label: 'Colocação pronominal' },
      { href: '/es/pt/b1/condicional-presente', label: 'O condicional presente' },
      { href: '/es/pt/b1/imperfeito-preterito-perfeito', label: 'Imperfeito vs. pretérito perfeito' },
    ],
  },
  'pt-b2': {
    heading: 'Portugués B2: domina la voz pasiva, el gerundio y el portugués de las noticias',
    intro:
      "B2 es leer un diario en portugués y entender casi todo: voz pasiva (incluida la versión con 'se', muy usada), pronombres relativos para frases elegantes, y conectores para argumentar como un adulto.",
    achievements: [
      'Formar la voz pasiva y la voz pasiva con se',
      'Conectar ideas con pronomes relativos',
      'Usar o gerúndio (mucho más que en español)',
      'Explicar causa y consecuencia con precisión',
      'Hablar de lo que ya había pasado con mais-que-perfeito',
    ],
    insight:
      "El portugués usa el gerundio con mucha más libertad que el español ('estou fazendo' es la forma cotidiana, no la excepción) — uno de los rasgos que más rápido distingue a alguien que aprendió portugués de alguien que solo lo entiende por el español.",
    stat: { value: '3-4 meses', label: 'nivel intermedio alto' },
    links: [
      { href: '/es/pt/b2/voz-passiva', label: 'A voz passiva' },
      { href: '/es/pt/b2/pronomes-relativos', label: 'Os pronomes relativos' },
      { href: '/es/pt/b2/gerundio', label: 'O gerúndio' },
    ],
  },
  'pt-c1': {
    heading: 'Portugués C1: el futuro do subjuntivo (único del portugués) y el registro formal',
    intro:
      'C1 es el portugués de la universidad y la sala de juntas: un tiempo verbal que no existe en ningún otro idioma romance, el infinitivo pessoal, y el vocabulario para escribir como un profesional.',
    achievements: [
      'Usar o futuro do subjuntivo (exclusivo del portugués)',
      'Conjugar o infinitivo pessoal',
      'Reportar lo que otros dijeron con o discurso indireto',
      'Comunicarte en português dos negócios',
      'Dar énfasis con frases clivadas',
    ],
    insight:
      "O futuro do subjuntivo ('quando eu falar') no existe en español, inglés, francés ni italiano — es exclusivo del portugués, y se usa en frases condicionales cotidianas ('se você quiser'). Sorprende a quien ya domina otro idioma romance.",
    stat: { value: '4-6 meses', label: 'nivel avanzado' },
    links: [
      { href: '/es/pt/c1/futuro-subjuntivo', label: 'O futuro do subjuntivo' },
      { href: '/es/pt/c1/infinitivo-pessoal', label: 'O infinitivo pessoal' },
      { href: '/es/pt/c1/portugues-negocios', label: 'Português dos negócios' },
    ],
  },
  'pt-c2': {
    heading: 'Portugués C2: gírias, ironía y el humor que solo entiende un nativo',
    intro:
      'C2 no es más gramática — son las gírias que no están en el libro, entender un chiste sin que te lo expliquen, y notar que un carioca y un lisboeta casi no hablan el mismo portugués.',
    achievements: [
      'Entender gírias y estrangeirismos cotidianos',
      'Detectar ironia e humor en portugués',
      'Reconocer variantes regionales (Brasil vs. Portugal)',
      'Usar diminutivos y aumentativos con matiz',
      'Escribir con el estilo formal de un editorial',
    ],
    insight:
      'Las partículas de discurso —né, então, tipo assim, pois é— no tienen traducción directa y casi no aparecen en los libros, pero son lo que más delata a un hablante no nativo. Es la diferencia entre "hablar portugués perfecto" y "sonar portugués".',
    stat: { value: 'maestría', label: 'sin techo fijo de tiempo' },
    links: [
      { href: '/es/pt/c2/registro-particulas', label: 'Partículas de registro' },
      { href: '/es/pt/c2/ironia-humor', label: 'Ironia e humor' },
      { href: '/es/pt/c2/variantes-regionais', label: 'Variantes regionais' },
    ],
  },
};

// Misma idea que TSA, pero para /es/[lang]/ (la página de idioma
// completa, un nivel más arriba que /es/[lang]/[level]/): en vez de
// hablar de un nivel puntual, vende la ruta completa A1-C2 y linkea a
// niveles en vez de lecciones. Clave: el id del idioma (de/en/fr/it/pt).
export const TSA_LANG: Partial<Record<string, TsaEntry>> = {
  de: {
    heading: 'Aprender alemán gratis online: la ruta completa de A1 a C2',
    intro:
      'El alemán tiene fama de ser el idioma más difícil de Europa, pero esa fama viene de generalizar: la gramática básica es predecible una vez entendés el patrón, y el vocabulario técnico ya lo reconocés (Auto, Hotel, Musik). Acá seguís la ruta MCER completa, desde tu primera frase hasta el registro académico.',
    achievements: [
      'Presentarte y sobrevivir el día a día (A1-A2)',
      'Opinar y debatir con matices (B1-B2)',
      'Leer textos académicos y noticias (C1)',
      'Entender ironía y humor como un nativo (C2)',
      'Practicar con quizzes interactivos en cada lección',
    ],
    insight:
      'Los tres obstáculos reales del alemán —género gramatical, orden de palabras y los casos (Dativ/Akkusativ)— aparecen temprano, en A1-A2. Una vez los superás, el resto del camino es mayormente memorizar vocabulario y patrones, no pelear con reglas nuevas.',
    stat: { value: '81 lecciones', label: 'en 6 niveles MCER, gratis' },
    links: [
      { href: '/es/de/a1', label: 'Empezar en A1' },
      { href: '/es/de/b1', label: 'Nivel B1' },
      { href: '/es/de/c1', label: 'Nivel C1' },
    ],
  },
  en: {
    heading: 'Aprender inglés gratis online: la ruta completa de A1 a C2',
    intro:
      "El inglés es el idioma más fácil de empezar para un hispanohablante — compartís miles de palabras — pero también el que más rápido se estanca en un 'nivel intermedio para siempre'. Acá seguís la ruta MCER completa, diseñada para que sigas avanzando después del 'ya entiendo casi todo'.",
    achievements: [
      'Sobrevivir conversaciones básicas (A1-A2)',
      'Distinguir Present Perfect y condicionales (B1-B2)',
      'Escribir y hablar en registro profesional (C1)',
      'Usar phrasal verbs y entender el humor nativo (C2)',
      'Practicar con quizzes interactivos en cada lección',
    ],
    insight:
      'La mayoría de los hispanohablantes se estanca en B1 porque deja de estudiar estructura y solo "practica hablando" — funciona para lo básico, pero el salto a B2-C1 (condicionales, voz pasiva, registro formal) necesita estudio explícito, no solo exposición.',
    stat: { value: '67 lecciones', label: 'en 6 niveles MCER, gratis' },
    links: [
      { href: '/es/en/a1', label: 'Empezar en A1' },
      { href: '/es/en/b1', label: 'Nivel B1' },
      { href: '/es/en/c1', label: 'Nivel C1' },
    ],
  },
  fr: {
    heading: 'Aprender francés gratis online: la ruta completa de A1 a C2',
    intro:
      'El francés tiene fama de romántico pero intimidante: la pronunciación silenciosa, el género, el subjonctif. Acá seguís la ruta MCER completa, que desarma cada uno de esos miedos paso a paso, sin necesidad de vivir en Francia.',
    achievements: [
      'Sobrevivir el día a día con las bases (A1-A2)',
      'Conectar ideas con fluidez (B1-B2)',
      'Dominar le subjonctif y el registro formal (C1)',
      'Entender argot y humor como un local (C2)',
      'Practicar con quizzes interactivos en cada lección',
    ],
    insight:
      'Le subjonctif, el gran temido del francés, no aparece hasta C1 en esta ruta — porque primero necesitás una base sólida de presente, pasado y condicional. Intentar aprenderlo antes de tiempo es la razón #1 por la que tanta gente abandona el francés a mitad de camino.',
    stat: { value: '67 lecciones', label: 'en 6 niveles MCER, gratis' },
    links: [
      { href: '/es/fr/a1', label: 'Empezar en A1' },
      { href: '/es/fr/b1', label: 'Nivel B1' },
      { href: '/es/fr/c1', label: 'Nivel C1' },
    ],
  },
  it: {
    heading: 'Aprender italiano gratis online: la ruta completa de A1 a C2',
    intro:
      'El italiano es, lejos, el idioma más rápido de aprender para un hispanohablante — compartís vocabulario, sonidos y hasta estructura de frase. Acá seguís la ruta MCER completa, que aprovecha esa cercanía en vez de tratarte como si empezaras de cero.',
    achievements: [
      'Sobrevivir el día a día con las bases (A1-A2)',
      'Conectar ideas y opinar con matices (B1-B2)',
      'Dominar il congiuntivo y el registro formal (C1)',
      'Entender slang y humor como un local (C2)',
      'Practicar con quizzes interactivos en cada lección',
    ],
    insight:
      "La cercanía con el español es una ventaja enorme, pero también una trampa: los falsos amigos ('burro' no es burro, 'pila' no es solo pila) aparecen desde A1, y confiar demasiado en la intuición es el error #1 de los hispanohablantes que aprenden italiano.",
    stat: { value: '65 lecciones', label: 'en 6 niveles MCER, gratis' },
    links: [
      { href: '/es/it/a1', label: 'Empezar en A1' },
      { href: '/es/it/b1', label: 'Nivel B1' },
      { href: '/es/it/c1', label: 'Nivel C1' },
    ],
  },
  pt: {
    heading: 'Aprender portugués gratis online: la ruta completa de A1 a C2',
    intro:
      'El portugués parece un espejo del español, y en la gramática casi lo es — la verdadera curva de aprendizaje está en el oído, no en la lógica. Acá seguís la ruta MCER completa, que le da a la pronunciación el lugar que otros cursos le niegan.',
    achievements: [
      'Sobrevivir el día a día con las bases (A1-A2)',
      'Conectar ideas con fluidez (B1-B2)',
      'Dominar el futuro do subjuntivo, único del portugués (C1)',
      'Entender gírias y humor como un local (C2)',
      'Practicar con quizzes interactivos en cada lección',
    ],
    insight:
      'Entender portugués escrito es casi automático para un hispanohablante — entenderlo hablado no. Las vocales nasales y el ritmo distinto hacen que muchos lean perfecto pero se pierdan en una conversación real; por eso esta ruta mete pronunciación desde la primera lección, no al final.',
    stat: { value: '65 lecciones', label: 'en 6 niveles MCER, gratis' },
    links: [
      { href: '/es/pt/a1', label: 'Empezar en A1' },
      { href: '/es/pt/b1', label: 'Nivel B1' },
      { href: '/es/pt/c1', label: 'Nivel C1' },
    ],
  },
};
