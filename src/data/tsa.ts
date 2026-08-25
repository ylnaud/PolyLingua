// Texto SEO de Autoridad (TSA): un bloque de contenido con profundidad
// temática para páginas de listado (como /idiomas/[lang]/[level]) que de
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
      { href: '/idiomas/de/a1/saludos-presentarse', label: 'Saludos y presentarse' },
      { href: '/idiomas/de/a1/articulos-der-die-das', label: 'Der, die, das' },
      { href: '/idiomas/de/a1/presente-verbos', label: 'El presente (Präsens)' },
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
      { href: '/idiomas/de/a2/perfekt-pasado', label: 'Perfekt: el pasado' },
      { href: '/idiomas/de/a2/dativ-akkusativ', label: 'Dativ vs. Akkusativ' },
      { href: '/idiomas/de/a2/verbos-modales', label: 'Verbos modales' },
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
      { href: '/idiomas/de/b1/oraciones-subordinadas', label: 'Oraciones subordinadas' },
      { href: '/idiomas/de/b1/adjektivdeklination', label: 'Adjektivdeklination' },
      { href: '/idiomas/de/b1/genitiv', label: 'Der Genitiv' },
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
      { href: '/idiomas/de/b2/voz-pasiva', label: 'Passiv' },
      { href: '/idiomas/de/b2/konjunktiv-2', label: 'Konjunktiv II' },
      { href: '/idiomas/de/b2/konnektoren', label: 'Konnektoren' },
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
      { href: '/idiomas/de/c1/konjunktiv-1', label: 'Konjunktiv I' },
      { href: '/idiomas/de/c1/nominalstil', label: 'Nominalstil vs. Verbalstil' },
      { href: '/idiomas/de/c1/wissenschaft', label: 'Wissenschaftssprache' },
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
      { href: '/idiomas/de/c2/redewendungen', label: 'Redewendungen' },
      { href: '/idiomas/de/c2/ironie-register', label: 'Ironie und Register' },
      { href: '/idiomas/de/c2/particulas-modales', label: 'Partículas modales' },
    ],
  },
};
