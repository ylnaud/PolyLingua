// Diccionario de strings de interfaz para la arquitectura SILO
// [userLang]/[targetLang]/... — ver src/data/userLanguages.ts para la lista
// de idiomas de interfaz.
//
// Hoy están poblados `es` y `en`, y los dos están activos. Ojo: tener
// diccionario NO es lo mismo que estar activo, y traducir este archivo es solo
// la mitad del trabajo. La otra mitad es el español escrito a mano FUERA de
// acá — src/data/tsa.ts, src/data/units.ts y los widgets globales — que no se
// ve leyendo el código, solo barriendo el `dist/`. Ver el comentario de
// src/data/userLanguages.ts, que cuenta el orden correcto.
//
// Agregar un diccionario nuevo acá es el paso real de "traducir la interfaz",
// y va SIEMPRE antes del flag — ver src/i18n/index.ts para el fallback.
// Los selectores de idioma ("¿Qué idioma quieres repasar?") son todos la
// misma página con otro texto, así que comparten forma.
export interface PickerStrings {
  metaTitulo: string;
  metaDescripcion: string;
  h1: string;
  desc: string;
}

export interface Dictionary {
  header: {
    logoAria: string;
    navAria: string;
    nav: {
      idiomas: string;
      buscar: string;
      blog: string;
      porQue: string;
      faq: string;
    };
    toolsAria: string;
    tools: {
      repasar: string;
      repasarAria: string;
      vocabulario: string;
      vocabularioAria: string;
      practicaLibre: string;
      practicaLibreAria: string;
      ahorcado: string;
      ahorcadoAria: string;
      logros: string;
      logrosAria: string;
      misErrores: string;
      misErroresAria: string;
    };
    ctaStart: string;
  };
  bottomNav: {
    navAria: string;
    tabs: {
      inicio: string;
      idiomas: string;
      repasar: string;
      logros: string;
      mas: string;
    };
    sheetAria: string;
    groups: {
      practicar: string;
      tuProgreso: string;
      recursos: string;
      sobrePolyLingua: string;
      preferencias: string;
    };
    links: {
      buscarLecciones: string;
      situaciones: string;
      dialogos: string;
      vocabulario: string;
      practicaLibre: string;
      ahorcado: string;
      escucharRepetir: string;
      generadorFrases: string;
      misErrores: string;
      gramatica: string;
      copiaSeguridad: string;
      recursos: string;
      diario: string;
      blog: string;
      porQuePolyLingua: string;
      faq: string;
    };
    ctaStart: string;
  };
  footer: {
    tagline: string;
    idiomas: string;
    proyecto: string;
    codigoGitHub: string;
    blog: string;
    faq: string;
    acercaDe: string;
    privacidad: string;
    terminos: string;
    hechoCon: string;
  };
  breadcrumbAria: string;
  cookies: {
    // Lleva {enlace}, reemplazado por el link a la política de privacidad.
    texto: string;
    enlace: string;
    entendido: string;
  };
  // Nombre de cada idioma META, en el idioma de la interfaz. Vive acá y no
  // en src/data/languages.ts porque ese archivo tiene UN solo `name` por
  // idioma (en español) y el mismo idioma se llama distinto según quién lo
  // lea: 'Inglés' para un hispanohablante, 'Englisch' para un alemán.
  languageNames: Record<'de' | 'en' | 'es' | 'fr' | 'it' | 'pt', string>;
  // Eslogan y descripción de cada idioma meta. Igual que languageNames,
  // están acá y no en src/data/languages.ts porque ese archivo guarda una
  // sola versión (en español) y son textos de marketing que ve el usuario.
  languageTaglines: Record<'de' | 'en' | 'es' | 'fr' | 'it' | 'pt', string>;
  // Nombre, eslogan y descripción de cada nivel MCER, por el mismo motivo
  // que languageNames: src/data/levels.ts guarda una sola versión, en español.
  levelNames: Record<'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2', string>;
  levelTaglines: Record<'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2', string>;
  levelDescriptions: Record<'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2', string>;
  /**
   * Descripciones de unidad, SOLO donde hagan falta traducidas.
   *
   * Las unidades viven en src/data/units.ts, indexadas por
   * `${targetLang}-${level}` — sin eje userLang, así que las mismas 92
   * entradas sirven a `es-de` y a `en-de` y sus `description` están en
   * español. El `name` no: ese va en el idioma que se enseña
   * («Erste Schritte») y no se traduce nunca.
   *
   * Esto es un MAPA DE EXCEPCIONES, no una copia: la clave es la misma de
   * units.ts y dentro va el id de la unidad. Si falta una entrada, la página
   * usa la de units.ts. Así el español no se duplica y units.ts sigue siendo
   * su única fuente.
   */
  unitDescriptions: Record<string, Record<string, string>>;
  /**
   * Nombres de habilidad, SOLO donde hagan falta traducidos.
   *
   * Mismo problema y misma forma que `unitDescriptions`: el catálogo de
   * src/data/skills.ts está indexado por el idioma META (`de.a1.article.der`),
   * sin eje userLang, así que su `name` —«El género de los sustantivos»— sale
   * igual en es-de que en en-de. Se ve en la tarjeta de motivo de /practicar y
   * en la lista de temas flojos del panel.
   *
   * Es un MAPA DE EXCEPCIONES, no una copia: la clave es el id de la
   * habilidad, y si falta se usa el `name` del catálogo. Así el español no se
   * duplica y skills.ts sigue siendo su única fuente.
   *
   * Vacío en los dos idiomas todavía. La caída al catálogo es a propósito y no
   * es «fallback silencioso al español» en el sentido malo: no hay ninguna otra
   * fuente de la que sacarlo, y una etiqueta corta sin traducir es preferible a
   * un hueco. Lo que NUNCA cae de un idioma a otro es la glosa de las
   * plantillas de refuerzo, que es donde está la enseñanza.
   */
  skillNames: Record<string, string>;
  languageDescriptions: Record<'de' | 'en' | 'es' | 'fr' | 'it' | 'pt', string>;
  silo: {
    idiomas: string;
    catalogoEyebrow: string;
    catalogoTitulo: string;
    /** Meta e intro de la portada del silo (/[userLang]). */
    catalogoMetaTitulo: string;
    catalogoMetaDescripcion: string;
    catalogoIntro: string;
    continuar: string;
    repaso: string;
    errores: string;
    racha: string;
    explorarMas: string;
    explorar: {
      practicarAhora: string;
      situaciones: string;
      dialogos: string;
      pronunciacion: string;
      recursos: string;
      sprintSemanal: string;
      diario: string;
      misErrores: string;
      gramatica: string;
      generadorFrases: string;
    };
    nivelVacio: string;
    examenNivel: string;
    examenDesc: string;
    bloqueado: string;
    completado: string;
    irAlExamen: string;
    leccion: string;
    lecciones: string;
    /** Encabezado de un grupo de lecciones: «Unidad 3 — Meine Welt». */
    unidad: string;
    /** Antesala de los enlaces del bloque TSA (ver src/data/tsa.ts). */
    seguiCon: string;
    /**
     * Encabezado por defecto del bloque RelatedLinks. Era un literal en las
     * props del componente («Seguí por acá»), así que salía en español en las
     * 58 páginas del silo inglés que lo montan sin `title`. Lo encontró el
     * Critic de U-01, no el candado: es un `<h2>` visible.
     */
    seguiPorAca: string;
    /** Título del bloque de RelatedLinks en la portada del curso. */
    delBlog: string;
    /** CTA de la tarjeta de idioma de las portadas. */
    verNiveles: string;
    // El selector de nivel de inicio: quien ya sabe algo del idioma no
    // debería tener que aprobar dos exámenes de lo que ya sabe para llegar a
    // su nivel. Ver src/components/StartLevelPicker.astro.
    inicio: {
      titulo: string;
      desc: string;
      // Lleva {nivel}, el nombre del nivel elegido.
      elegido: string;
      cambiar: string;
      cerrar: string;
      aria: string;
    };
  };
  lesson: {
    anterior: string;
    // Llevan el marcador {lang}, que se reemplaza por el nombre del idioma
    // meta ya traducido. Se hace con placeholder y no concatenando porque el
    // orden de las palabras cambia entre idiomas ("Curso de alemán" vs
    // "Deutschkurs").
    cursoNombre: string;
    cursoDescripcion: string;
    trucoTitulo: string;
    vocabularioTitulo: string;
    escuchar: string;
    empezarPractica: string;
    siguiente: string;
    frasesTitulo: string;
    frasesIntro: string;
  };
  practice: {
    kinds: {
      choice: string;
      fillBlank: string;
      match: string;
      write: string;
      order: string;
    };
    publicidad: string;
    tituloSeccion: string;
    aria: string;
    pista: string;
    completado: string;
    completaLaFrase: string;
    ordenaPalabras: string;
    emparejaElementos: string;
    escucharDeNuevo: string;
    fraseConstruyendo: string;
    correcto: string;
    incorrecto: string;
    respuestaCorrecta: string;
    resultado: string;
    /** Etiqueta del campo de respuesta y botón de corregir, en fill-blank/write. */
    tuRespuesta: string;
    comprobar: string;
    /** Botón de rehacer la práctica entera al llegar al resumen final. */
    repetir: string;
    /** Enunciado de un ítem `write` con `spokenOnly`: solo se oye, no se lee. */
    escuchaYEscribe: string;
    /** Botón del modo shadowing: confirma que ya repetiste en voz alta. */
    yaLoDije: string;
  };
  exam: {
    titulo: string;
    tituloPagina: string;
    // Llevan {n}, {nivel}, {lang} como marcadores.
    metaTitulo: string;
    metaDescripcion: string;
    intro: string;
    yDesbloquear: string;
    desbloqueaste: string;
    cursoCompleto: string;
    irA: string;
    aprobado: string;
    todaviaNo: string;
    umbral: string;
    explicacionFallo: string;
    reintentar: string;
    repasarAhora: string;
    verMisLogros: string;
    yCompletarIdioma: string;
  };
  // Strings de las HERRAMIENTAS: los selectores de idioma de /[userLang]/… y
  // las páginas por idioma de /[userLang]/[targetLang]/… Hasta que existió
  // esta sección cada herramienta tenía su texto hardcodeado en español, así
  // que un usuario alemán salía del silo y caía en una página en español.
  //
  // Las que terminan en una página con JS de cliente exponen sus strings al
  // navegador vía [data-page-strings] (ver src/lib/pageStrings.ts): los
  // scripts de esas páginas usan `import`, y un <script define:vars> no
  // soporta imports.
  tools: {
    // Última miga de pan de cada herramienta ("Idiomas / 🇩🇪 Alemán / Aquí").
    nombres: {
      vocabulario: string;
      repasar: string;
      practicaLibre: string;
      ahorcado: string;
      diario: string;
      gramatica: string;
      misErrores: string;
      pronunciacion: string;
      situaciones: string;
    };
    // Compartidos por casi todas las herramientas.
    comun: {
      verLecciones: string;
      // {n} = cantidad total. Chip "ver todos" de los filtros por tema.
      todos: string;
      // Etiquetas de las 6 cajas del SRS. src/lib/srs.ts las tiene solo en
      // español porque también las usa lógica que no ve el usuario.
      mastery: [string, string, string, string, string, string];
      // Fallback cuando el índice de caja se sale de `mastery`. Lleva {n}.
      caja: string;
      practicar: string;
      sinDatos: string;
    };
    // Los selectores "¿en qué idioma?" de /[userLang]/<herramienta>.
    selectores: {
      vocabulario: PickerStrings;
      repasar: PickerStrings;
      practicaLibre: PickerStrings;
      ahorcado: PickerStrings;
      diario: PickerStrings;
      pronunciacion: PickerStrings;
      situaciones: PickerStrings;
    };
    // De acá para abajo, una entrada por herramienta. {lang} se reemplaza por
    // el nombre del idioma meta ya traducido; {n} por una cantidad.
    vocabulario: {
      metaTitulo: string;
      metaDescripcion: string;
      h1: string;
      cargando: string;
      vacioTitulo: string;
      vacioDesc: string;
      palabrasTitulo: string;
      pruebaTitulo: string;
      palabraAprendida: string;
      palabrasAprendidas: string;
      // Consigna de los ítems generados a partir del vocabulario. Lleva {x}.
      comoSeDice: string;
    };
    repasar: {
      metaTitulo: string;
      metaDescripcion: string;
      h1: string;
      cargando: string;
      vacioTitulo: string;
      vacioDesc: string;
      // Llevan {n} y {detalle}.
      pendientes: string;
      pendiente: string;
    };
    practicaLibre: {
      metaTitulo: string;
      metaDescripcion: string;
      h1: string;
      armando: string;
      vacioTitulo: string;
      vacioDesc: string;
      // Lleva {n}.
      sesion: string;
    };
    gramatica: {
      metaTitulo: string;
      metaDescripcion: string;
      h1: string;
      desc: string;
      ejercicio: string;
      ejercicios: string;
    };
    /**
     * Practicar (el motor adaptativo). Es la única herramienta que tenía sus
     * textos escritos a mano en el markup, y por eso salía en español dentro
     * del silo inglés.
     *
     * `motivos` y `categorias` los pinta el <script> sobre la sesión ya
     * armada, así que viajan por [data-page-strings] (src/lib/pageStrings.ts).
     * Las claves de `motivos` son los ids que devuelve el scheduler y las de
     * `categorias` las de `Skill.category`: no se traducen, son datos.
     */
    practicar: {
      metaTitulo: string;
      metaDescripcion: string;
      h1: string;
      /** Mientras el motor arma la sesión en el cliente. */
      preparando: string;
      /** Lleva {n}, el número de ejercicios elegidos. */
      elegidos: string;
      vacioTitulo: string;
      vacioDesc: string;
      /**
       * Cabecera del panel. Lleva {lang}, no un nivel: decía «Tu progreso en
       * A1» con el nivel escrito a mano, y el panel no calcula ninguno — su
       * catálogo son TODAS las habilidades del curso, de A1 a C2.
       */
      progresoTitulo: string;
      /** Resumen del panel. Lleva {pct}, {n} y {total}. */
      progresoGeneral: string;
      debilesTitulo: string;
      motivos: Record<
        | 'severe_error'
        | 'persistent_error'
        | 'weak_skill'
        | 'due_review'
        | 'new_skill'
        | 'random_review',
        { tag: string; texto: string }
      >;
      categorias: Record<
        'grammar' | 'vocabulary' | 'word_order' | 'pronunciation' | 'writing',
        string
      >;
    };
    misErrores: {
      metaTitulo: string;
      metaDescripcion: string;
      h1: string;
      cargando: string;
      vacioTitulo: string;
      vacioDesc: string;
      practicarBtn: string;
      // Llevan {n}.
      conErrores: string;
      conError: string;
      falladoVeces: string;
      tuRespuesta: string;
      correcta: string;
    };
    diario: {
      metaTitulo: string;
      metaDescripcion: string;
      h1: string;
      desc: string;
      etiquetaTextarea: string;
      // Arranque de la entrada, en el idioma META. Uno por idioma.
      placeholder: Record<'de' | 'en' | 'es' | 'fr' | 'it' | 'pt', string>;
      // Lleva {n}.
      palabras: string;
      guardado: string;
      // Lleva {enlace}, reemplazado por el link a DeepL.
      pista: string;
      anterioresTitulo: string;
    };
    pronunciacion: {
      metaTitulo: string;
      metaDescripcion: string;
      h1: string;
      desc: string;
      vacioTitulo: string;
      vacioDesc: string;
      escuchar: string;
      guia: string;
      meSalio: string;
      meCosto: string;
      // Llevan {x} / {n}.
      traduccion: string;
      practicada: string;
      practicadas: string;
    };
    situaciones: {
      metaTitulo: string;
      metaDescripcion: string;
      h1: string;
      desc: string;
      vacioTitulo: string;
      vacioDesc: string;
      frase: string;
      frases: string;
    };
    ahorcado: {
      metaTitulo: string;
      metaDescripcion: string;
      h1: string;
      desc: string;
      vacioTitulo: string;
      vacioDesc: string;
      escuchar: string;
      jugarDeNuevo: string;
      // Llevan {x} (el término), {y} (su traducción) y {lang}.
      pista: string;
      ganaste: string;
      perdiste: string;
      // Consigna del ítem que el juego manda al pool de repaso al fallar.
      consignaSrs: string;
    };
  };
  /**
   * Los avisos y controles que BaseLayout monta en TODAS las páginas.
   *
   * Están acá y no escritos a mano en cada componente porque son justamente
   * los que se ven en cualquier silo: mientras tuvieron el texto fijo en
   * español, una página /en/ salía con la interfaz en inglés y estos cuatro
   * widgets en español encima.
   */
  widgets: {
    /** Enlace de salto al contenido, primer foco de cada página. */
    saltarContenido: string;
    /**
     * Nombre accesible del botón de volver arriba. Era un literal dentro del
     * componente, así que un lector de pantalla lo anunciaba en español en las
     * 115 páginas del silo inglés. El candado de U-01 no lo vio porque vive en
     * un `aria-label` y el detector no miraba atributos; lo encontró el Critic.
     */
    volverArriba: string;
    /** Barra descartable compartida (racha y copia de seguridad). */
    barra: { cerrar: string };
    /** Meta diaria: la píldora del header y su diálogo. */
    metaDiaria: {
      pildoraAria: string;
      titulo: string;
      sub: string;
      opcionesAria: string;
      ahoraNo: string;
    };
    /** Aviso de racha en riesgo. El texto lo arma el cliente con {n} días. */
    racha: { cta: string; texto: string; textos: string };
    copia: { texto: string; cta: string };
    /** Avisos del bucle de refuerzo, escritos sobre el ítem fallado. */
    /** `dominado` cierra el bucle y lleva {tema}, el nombre de la habilidad. */
    refuerzo: { pausado: string; otraVez: string; dominado: string };
    /** Botón de modo shadowing: está en el header y en el menú «Más». */
    shadowing: { aria: string; etiqueta: string };
    /** Selector de idioma de INTERFAZ del header (no el de idioma a aprender). */
    selectorIdioma: { aria: string; proximamente: string };
    /** Botón de tema claro/oscuro. */
    tema: { aria: string; aClaro: string; aOscuro: string };
    /** Botón de sonido. Los dos textos los reescribe el cliente al alternar. */
    sonido: { silenciar: string; activar: string };
    /**
     * Botón de instalar la PWA. `iosPasos` y `otrosPasos` son el texto de
     * respaldo para navegadores sin `beforeinstallprompt`; los escribe el
     * cliente, así que viajan por `[data-install-strings]`.
     */
    instalar: {
      aria: string;
      etiqueta: string;
      comoInstalar: string;
      iosPasos: string;
      otrosPasos: string;
    };
  };
}

export const es: Dictionary = {
  header: {
    logoAria: 'PolyLingua — inicio',
    navAria: 'Navegación principal',
    nav: {
      idiomas: 'Idiomas',
      buscar: 'Buscar',
      blog: 'Blog',
      porQue: 'Por qué',
      faq: 'FAQ',
    },
    toolsAria: 'Más herramientas',
    tools: {
      repasar: 'Repasar',
      repasarAria: 'Repasar palabras falladas',
      vocabulario: 'Vocabulario',
      vocabularioAria: 'Ver y repasar tu vocabulario',
      practicaLibre: 'Práctica libre',
      practicaLibreAria: 'Práctica libre aleatoria',
      ahorcado: 'Ahorcado',
      ahorcadoAria: 'Jugar al ahorcado',
      logros: 'Logros',
      logrosAria: 'Ver tus logros',
      misErrores: 'Mis errores',
      misErroresAria: 'Ver tus errores frecuentes',
    },
    ctaStart: 'Empezar gratis',
  },
  bottomNav: {
    navAria: 'Navegación principal móvil',
    tabs: {
      inicio: 'Inicio',
      idiomas: 'Idiomas',
      repasar: 'Repasar',
      logros: 'Logros',
      mas: 'Más',
    },
    sheetAria: 'Más opciones',
    groups: {
      practicar: 'Practicar',
      tuProgreso: 'Tu progreso',
      recursos: 'Recursos',
      sobrePolyLingua: 'Sobre PolyLingua',
      preferencias: 'Preferencias',
    },
    links: {
      buscarLecciones: 'Buscar lecciones',
      situaciones: 'Situaciones',
      dialogos: 'Diálogos',
      vocabulario: 'Vocabulario',
      practicaLibre: 'Práctica libre',
      ahorcado: 'Ahorcado',
      escucharRepetir: 'Escuchar y repetir',
      generadorFrases: 'Generador de frases',
      misErrores: 'Mis errores',
      gramatica: 'Gramática',
      copiaSeguridad: 'Copia de seguridad',
      recursos: 'Recursos',
      diario: 'Diario',
      blog: 'Blog',
      porQuePolyLingua: 'Por qué PolyLingua',
      faq: 'FAQ',
    },
    ctaStart: 'Empezar gratis',
  },
  footer: {
    tagline:
      'Idiomas de A1 a C2, con gramática que se aprende jugando. Gratis mientras construimos la comunidad.',
    idiomas: 'Idiomas',
    proyecto: 'Proyecto',
    codigoGitHub: 'Código en GitHub',
    blog: 'Blog',
    faq: 'Preguntas frecuentes',
    acercaDe: 'Acerca de',
    terminos: 'Términos de uso',
    privacidad: 'Privacidad',
    hechoCon: 'Hecho con ☕ para quienes aman los idiomas.',
  },
  breadcrumbAria: 'Ruta de navegación',
  cookies: {
    texto:
      'PolyLingua guarda tu progreso solo en tu navegador — no usamos cookies de rastreo. Más detalles en la {enlace}.',
    enlace: 'Política de privacidad',
    entendido: 'Entendido',
  },
  languageNames: {
    de: 'Alemán',
    en: 'Inglés',
    es: 'Español',
    fr: 'Francés',
    it: 'Italiano',
    pt: 'Portugués',
  },
  levelNames: {
    a1: 'A1 · Principiante',
    a2: 'A2 · Elemental',
    b1: 'B1 · Intermedio',
    b2: 'B2 · Intermedio alto',
    c1: 'C1 · Avanzado',
    c2: 'C2 · Maestría',
  },
  levelTaglines: {
    a1: 'Tus primeras palabras',
    a2: 'Cuenta lo que hiciste ayer',
    b1: 'Conversaciones con sustancia',
    b2: 'Domina la voz pasiva y el subjuntivo',
    c1: 'Estilo, matices y modo subjuntivo',
    c2: 'El idioma al nivel de un nativo culto',
  },
  levelDescriptions: {
    a1: 'Preséntate, pide algo de comer y sobrevive tu primer día hablando el idioma.',
    a2: 'Pasado, rutinas y las primeras frases que te hacen sonar (casi) como un local.',
    b1: 'Conecta ideas con causa, contraste y condición, y empieza a opinar como quien domina el idioma.',
    b2: 'Habla de hipótesis, noticias y matices con la precisión de un hablante avanzado.',
    c1: 'Redacta, debate y comprende textos complejos con soltura casi nativa.',
    c2: 'Ironía, registro coloquial y matices estilísticos que solo dominan los expertos.',
  },
  // Vacío a propósito: units.ts ya guarda estas descripciones en español.
  unitDescriptions: {},
  skillNames: {},
  languageTaglines: {
    de: 'Precisión, casos y palabras larguísimas',
    en: 'El idioma que ya usas sin saberlo',
    es: 'Ser o estar: esa es la cuestión',
    fr: 'Elegancia, género y ese famoso subjonctif',
    it: 'Melódico, expresivo y más cercano de lo que crees',
    pt: 'El primo cercano que sorprende con sus matices',
  },
  languageDescriptions: {
    de: 'El idioma de la lógica: reglas claras, orden de palabras curioso y un vocabulario que se construye como piezas de Lego.',
    en: 'Gramática simple en la superficie, con matices (tiempos verbales, phrasal verbs) que marcan la diferencia entre sonar bien y sonar nativo.',
    es: 'Uno de los idiomas más hablados del mundo, con una gramática verbal rica (el subjuntivo aparece en todas partes) pero sin declinación por casos.',
    fr: 'Sonidos nasales, un género gramatical por dominar y un modo subjuntivo que separa a los buenos hablantes de los excelentes.',
    it: 'Muy afín al español en vocabulario, con su propio ritmo, dobles consonantes y un congiuntivo que vale la pena conquistar.',
    pt: 'Parecido al español en superficie, con sonidos nasales propios y estructuras (como el futuro do subjuntivo) que no existen en tu idioma.',
  },
  silo: {
    idiomas: 'Idiomas',
    catalogoEyebrow: 'Catálogo de idiomas',
    catalogoTitulo: '¿Qué idioma quieres aprender?',
    catalogoMetaTitulo: 'Idiomas disponibles',
    catalogoMetaDescripcion:
      'Elige el idioma que quieres aprender: alemán, inglés, francés, italiano o portugués. Gramática gamificada de A1 a C2, gratis.',
    catalogoIntro:
      'Cada idioma tiene su propia ruta de A1 a C2, con la misma gramática gamificada que hace que aprender no se sienta como estudiar.',
    continuar: 'Continuar',
    repaso: 'Repaso',
    errores: 'Errores',
    racha: 'Racha',
    explorarMas: '🧭 Explorá más',
    explorar: {
      practicarAhora: 'Practicar ahora',
      situaciones: 'Situaciones',
      dialogos: 'Diálogos',
      pronunciacion: 'Escuchar y repetir',
      recursos: 'Recursos',
      sprintSemanal: 'Sprint semanal',
      diario: 'Diario',
      misErrores: 'Mis errores',
      gramatica: 'Gramática',
      generadorFrases: 'Generador de frases',
    },
    nivelVacio: 'Estamos preparando lecciones para este nivel. ¡Vuelve pronto!',
    examenNivel: 'Examen de nivel',
    examenDesc:
      'Combina todo lo que aprendiste en {nivel} — apruébalo para desbloquear el siguiente nivel.',
    bloqueado: '🔒 Bloqueado',
    completado: '✓ Completado',
    irAlExamen: 'Ir al examen →',
    leccion: 'lección',
    lecciones: 'lecciones',
    unidad: 'Unidad',
    seguiCon: 'Seguí con:',
    seguiPorAca: 'Seguí por acá',
    delBlog: 'Del blog',
    verNiveles: 'Ver niveles →',
    inicio: {
      titulo: '¿Ya sabés algo?',
      desc: 'Elegí desde qué nivel querés empezar. Los anteriores quedan abiertos por si querés repasarlos.',
      elegido: 'Empezás en {nivel}',
      cambiar: 'Cambiar nivel',
      cerrar: 'Listo',
      aria: 'Elegir nivel de inicio',
    },
  },
  lesson: {
    anterior: '← Anterior',
    cursoNombre: 'Curso de {lang} Interactivo — PolyLingua',
    cursoDescripcion:
      'Aprende {lang} de A1 a C2 gratis con gramática divertida y ejercicios interactivos.',
    trucoTitulo: '💡 Truco para no aburrirte',
    vocabularioTitulo: '📚 Vocabulario de esta lección',
    escuchar: 'Escuchar',
    empezarPractica: 'Empezar práctica →',
    siguiente: 'Siguiente →',
    frasesTitulo: '🗣️ Frases para usar hoy',
    frasesIntro: 'Escuchá cada frase y repetila en voz alta antes de practicar.',
  },
  practice: {
    kinds: {
      choice: '🔘 Opción múltiple',
      fillBlank: '✏️ Completa el hueco',
      match: '🔗 Empareja',
      write: '⌨️ Escribe la respuesta',
      order: '🧩 Ordena la frase',
    },
    publicidad: 'Publicidad',
    tituloSeccion: '🎮 Ponte a prueba',
    aria: 'Práctica interactiva',
    pista: '💡 Pista',
    completado: '¡Completado!',
    completaLaFrase: 'Completa la frase',
    ordenaPalabras: 'Ordena las palabras para formar la frase correcta',
    emparejaElementos: 'Empareja cada elemento con su pareja correcta',
    escucharDeNuevo: 'Escuchar de nuevo',
    fraseConstruyendo: 'Frase que estás construyendo',
    correcto: '✅ ¡Correcto!',
    incorrecto: '❌ No del todo.',
    respuestaCorrecta: 'Correcto:',
    resultado: 'Acertaste',
    tuRespuesta: 'Tu respuesta',
    comprobar: 'Comprobar',
    repetir: 'Repetir',
    escuchaYEscribe: '🔊 Escucha y escribe lo que oís',
    yaLoDije: '🎤 Ya lo dije en voz alta',
  },
  exam: {
    titulo: 'Examen',
    tituloPagina: 'Examen de nivel',
    metaTitulo: 'Examen de {lang} — {nivel}',
    metaDescripcion:
      'Examen final de {nivel} de {lang}: combina todo lo aprendido en el nivel. Apruébalo con 70% o más para desbloquear el siguiente nivel.',
    intro: 'Este examen combina preguntas y ejercicios de las {n} lecciones de {nivel}. Necesitas',
    yDesbloquear: 'y desbloquear',
    desbloqueaste: 'Desbloqueaste',
    cursoCompleto: 'Completaste todo el curso de {lang}. ¡Felicidades!',
    irA: 'Ir a',
    aprobado: '¡Aprobado!',
    todaviaNo: 'Todavía no',
    umbral: '70% o más',
    explicacionFallo:
      'Necesitas al menos 70% para aprobar. Tus fallos ya quedaron guardados para repasar.',
    reintentar: 'Reintentar',
    repasarAhora: 'Repasar ahora',
    verMisLogros: 'Ver mis logros',
    yCompletarIdioma: 'y completar el idioma',
  },
  tools: {
    nombres: {
      vocabulario: 'Vocabulario',
      repasar: 'Repasar',
      practicaLibre: 'Práctica libre',
      ahorcado: 'Ahorcado',
      diario: 'Diario',
      gramatica: 'Gramática',
      misErrores: 'Mis errores',
      pronunciacion: 'Escuchar y repetir',
      situaciones: 'Situaciones',
    },
    comun: {
      verLecciones: 'Ver lecciones',
      todos: 'Todos ({n})',
      mastery: ['Nueva', 'Aprendiendo', 'Familiar', 'Buena', 'Dominada', 'Muy dominada'],
      caja: 'Caja {n}',
      practicar: 'Practicar',
      sinDatos: 'Sin datos',
    },
    selectores: {
      vocabulario: {
        metaTitulo: 'Vocabulario',
        metaDescripcion:
          'Todas las palabras nuevas que aprendiste en tus lecciones, en un solo lugar para verlas y repasarlas.',
        h1: '¿Vocabulario de qué idioma quieres ver?',
        desc: 'Elige un idioma para ver las palabras que ya aprendiste.',
      },
      repasar: {
        metaTitulo: 'Repasar',
        metaDescripcion:
          'Repasa las palabras y ejercicios que fallaste, con repetición espaciada, hasta que los aprendas de verdad.',
        h1: '¿Qué idioma quieres repasar?',
        desc: 'Elige un idioma para ver tu repaso pendiente.',
      },
      practicaLibre: {
        metaTitulo: 'Práctica libre',
        metaDescripcion:
          'Practica con una sesión aleatoria de preguntas y ejercicios de todas tus lecciones, distinta cada vez.',
        h1: '¿Qué idioma quieres practicar?',
        desc: 'Elige un idioma para una sesión de práctica libre.',
      },
      ahorcado: {
        metaTitulo: 'Ahorcado',
        metaDescripcion:
          'Juega al ahorcado con el vocabulario que ya aprendiste en PolyLingua, en el idioma que estés estudiando.',
        h1: '¿En qué idioma quieres jugar?',
        desc: 'Elige un idioma para jugar al ahorcado con tu vocabulario.',
      },
      diario: {
        metaTitulo: 'Diario de escritura',
        metaDescripcion:
          'Escribe unas líneas cada día en el idioma que estudias para practicar escritura libre, sin respuestas fijas.',
        h1: '¿En qué idioma quieres escribir hoy?',
        desc: 'Elige un idioma para escribir tu entrada de hoy.',
      },
      pronunciacion: {
        metaTitulo: 'Escuchar y repetir',
        metaDescripcion:
          'Escuchá palabras con voz nativa y repetilas en voz alta para practicar tu pronunciación en el idioma que estudias.',
        h1: '¿En qué idioma quieres practicar?',
        desc: 'Elige un idioma para escuchar palabras y repetirlas en voz alta.',
      },
      situaciones: {
        metaTitulo: 'Situaciones cotidianas',
        metaDescripcion:
          'Aprendé idiomas por situaciones reales — trabajo, casa, compras — con las frases que de verdad se usan todos los días.',
        h1: '¿En qué idioma quieres practicar situaciones?',
        desc: 'Elige un idioma para aprender con frases reales, no con reglas sueltas.',
      },
    },
    vocabulario: {
      metaTitulo: 'Vocabulario de {lang}',
      metaDescripcion:
        'Todas las palabras de {lang} que aprendiste en tus lecciones, en un solo lugar para verlas y repasarlas.',
      h1: 'Tu vocabulario de {lang}',
      cargando: 'Cargando tu vocabulario…',
      vacioTitulo: 'Todavía no aprendiste vocabulario en {lang}',
      vacioDesc: 'Completa una lección para que sus palabras nuevas empiecen a aparecer acá.',
      palabrasTitulo: '📚 Palabras aprendidas',
      pruebaTitulo: '🎯 Ponte a prueba',
      palabraAprendida: '{n} palabra aprendida.',
      palabrasAprendidas: '{n} palabras aprendidas.',
      comoSeDice: '¿Cómo se dice "{x}"?',
    },
    repasar: {
      metaTitulo: 'Repasar {lang}',
      metaDescripcion:
        'Repasa las palabras y ejercicios de {lang} que fallaste, con repetición espaciada, hasta que los aprendas de verdad.',
      h1: 'Repasar {lang}',
      cargando: 'Cargando tu repaso…',
      vacioTitulo: 'No te queda nada por repasar hoy',
      vacioDesc: 'Vuelve mañana, o sigue avanzando con lecciones nuevas mientras tanto.',
      pendientes: 'Tienes {n} ítems por repasar{detalle}',
      pendiente: 'Tienes {n} ítem por repasar{detalle}',
    },
    practicaLibre: {
      metaTitulo: 'Práctica libre de {lang}',
      metaDescripcion:
        'Practica {lang} con una sesión aleatoria de preguntas y ejercicios de todas tus lecciones, distinta cada vez.',
      h1: 'Práctica libre de {lang}',
      armando: 'Armando una sesión aleatoria…',
      vacioTitulo: 'Todavía no hay ejercicios para practicar',
      vacioDesc: 'Completa alguna lección primero y vuelve por aquí.',
      sesion: 'Una sesión aleatoria de {n} ítems, distinta cada vez que visitas esta página.',
    },
    gramatica: {
      metaTitulo: 'Gramática — {lang}',
      metaDescripcion:
        'Repasa los temas gramaticales de {lang}: mira tu nivel de dominio y practica los que más necesites.',
      h1: 'Gramática de {lang}',
      desc: 'Tu dominio por tema gramatical.',
      ejercicio: '{n} ejercicio',
      ejercicios: '{n} ejercicios',
    },
    practicar: {
      metaTitulo: 'Practicar {lang}',
      metaDescripcion:
        'Practica {lang} con ejercicios elegidos según lo que ya sabes y lo que sueles fallar.',
      h1: 'Practicar {lang}',
      preparando: 'Preparando tu sesión…',
      elegidos: '{n} ejercicios elegidos para ti.',
      vacioTitulo: 'Todavía no hay nada que practicar',
      vacioDesc: 'Haz una lección primero y el motor empezará a saber qué necesitas reforzar.',
      progresoTitulo: '📊 Tu progreso en {lang}',
      progresoGeneral: 'Progreso general {pct}% · {n} de {total} habilidades empezadas',
      debilesTitulo: 'Necesitas practicar',
      motivos: {
        severe_error: {
          tag: '🔴 Necesitas practicar esto',
          texto: 'Este patrón se te ha resistido varias veces. Vamos a por él con calma.',
        },
        persistent_error: {
          tag: '🟠 Se te repite',
          texto: 'Has fallado esto más de una vez, así que toca reforzarlo.',
        },
        weak_skill: {
          tag: '🟡 Aún no sale solo',
          texto: 'Lo estás aprendiendo: un poco más de práctica.',
        },
        due_review: {
          tag: '🔁 Toca repasar',
          texto: 'Hace un tiempo que no lo ves. A ver si sigue ahí.',
        },
        new_skill: { tag: '🌱 Algo nuevo', texto: 'Estás listo para esto.' },
        random_review: {
          tag: '✨ Repaso suelto',
          texto: 'Todo en orden: un repaso para mantenerlo fresco.',
        },
      },
      categorias: {
        grammar: 'Gramática',
        vocabulary: 'Vocabulario',
        word_order: 'Orden de palabras',
        pronunciation: 'Pronunciación',
        writing: 'Escritura',
      },
    },
    misErrores: {
      metaTitulo: 'Mis errores — {lang}',
      metaDescripcion: 'Revisa y practica los ejercicios de {lang} que más te cuestan.',
      h1: 'Mis errores',
      cargando: 'Cargando tus errores…',
      vacioTitulo: 'No tienes errores registrados',
      vacioDesc: 'Cuando falles un ejercicio, aparecerá aquí para que puedas repasarlo.',
      practicarBtn: 'Practicar mis errores',
      conErrores: 'Tienes {n} ejercicios con errores.',
      conError: 'Tienes {n} ejercicio con errores.',
      falladoVeces: '{n}× fallado',
      tuRespuesta: 'Tu respuesta:',
      correcta: 'Correcta:',
    },
    diario: {
      metaTitulo: 'Diario de escritura en {lang}',
      metaDescripcion:
        'Escribe unas líneas cada día en {lang} para practicar escritura libre, sin respuestas fijas — guardado solo en tu navegador.',
      h1: 'Diario de {lang}',
      desc: 'Escribe unas líneas sobre tu día — sin presión, sin respuesta correcta. Se guarda solo en este navegador.',
      etiquetaTextarea: 'Tu entrada de hoy',
      placeholder: {
        de: 'Heute habe ich...',
        en: 'Today I...',
        es: 'Hoy he...',
        fr: "Aujourd'hui j'ai...",
        it: 'Oggi ho...',
        pt: 'Hoje eu...',
      },
      palabras: '{n} palabras',
      guardado: '✅ Guardado',
      pista:
        '💡 Si querés revisar tu texto, podés pegarlo en {enlace} para chequear la gramática — no es parte de PolyLingua, es una herramienta externa opcional.',
      anterioresTitulo: '📅 Entradas anteriores',
    },
    pronunciacion: {
      metaTitulo: 'Escuchar y repetir en {lang}',
      metaDescripcion:
        'Escuchá palabras de {lang} con voz nativa, repetilas en voz alta y marcá cuáles te cuestan — las difíciles vuelven más seguido.',
      h1: 'Escuchar y repetir en {lang}',
      desc: 'Escuchá la palabra, hacé una pausa y repetila en voz alta. Después marcá si te salió — las que te cuestan van a volver más seguido.',
      vacioTitulo: 'Todavía no hay vocabulario',
      vacioDesc: 'Completa alguna lección de {lang} primero para desbloquear esta práctica.',
      escuchar: '🔊 Escuchar',
      guia: 'Escuchá, hacé una pausa, y repetila en voz alta.',
      meSalio: '✅ Me salió',
      meCosto: '🔁 Me costó',
      traduccion: 'Traducción: {x}',
      practicada: '{n} palabra practicada',
      practicadas: '{n} palabras practicadas',
    },
    situaciones: {
      metaTitulo: 'Situaciones cotidianas en {lang}',
      metaDescripcion:
        'Aprendé {lang} por situaciones reales — trabajo, casa, compras — con las frases que de verdad se usan todos los días.',
      h1: 'Situaciones cotidianas',
      desc: 'En vez de estudiar reglas sueltas, aprendé las frases que se usan de verdad en cada situación. Escuchalas, repetilas en voz alta y practicá produciéndolas vos.',
      vacioTitulo: 'Todavía no hay situaciones en {lang}',
      vacioDesc: 'Estamos armando este modo idioma por idioma — volvé pronto.',
      frase: '{n} frase',
      frases: '{n} frases',
    },
    ahorcado: {
      metaTitulo: 'Ahorcado de {lang}',
      metaDescripcion:
        'Juega al ahorcado con el vocabulario de {lang} que ya aprendiste en PolyLingua — adivina la palabra letra por letra.',
      h1: 'Ahorcado de {lang}',
      desc: 'Adivina la palabra letra por letra antes de quedarte sin intentos.',
      vacioTitulo: 'Todavía no hay vocabulario',
      vacioDesc: 'Completa alguna lección de {lang} primero para desbloquear el ahorcado.',
      escuchar: '🔊 Escuchar',
      jugarDeNuevo: '🔁 Jugar de nuevo',
      pista: 'Pista: {x}',
      ganaste: '🎉 ¡Bien! La palabra era "{x}" ({y}).',
      perdiste: '💀 Se acabaron los intentos. La palabra era "{x}" ({y}).',
      consignaSrs: 'Escribe esta palabra en {lang}: "{x}"',
    },
  },
  widgets: {
    saltarContenido: 'Saltar al contenido',
    volverArriba: 'Volver arriba',
    barra: { cerrar: 'Cerrar aviso' },
    metaDiaria: {
      pildoraAria: 'Ver o cambiar tu meta de práctica de hoy',
      titulo: '¿Cuánto quieres practicar hoy?',
      sub: 'Elige una meta para hoy — puedes cambiarla cuando quieras.',
      opcionesAria: 'Minutos por día',
      ahoraNo: 'Ahora no',
    },
    racha: {
      cta: 'Practicar ahora',
      texto: 'No pierdas tu racha de {n} día — practica algo hoy.',
      textos: 'No pierdas tu racha de {n} días — practica algo hoy.',
    },
    copia: {
      texto: 'Tu progreso vive solo en este navegador — hacé una copia antes de perderlo.',
      cta: 'Hacer copia',
    },
    refuerzo: {
      pausado:
        'Este tema se te está resistiendo hoy. Seguimos con la lección y te lo guardo para «Practicar ahora».',
      otraVez: 'Vamos otra vez con la misma estructura, en otra frase.',
      dominado: 'Tres seguidos con {tema}. Tema dominado: seguimos con la lección.',
    },
    shadowing: {
      aria: 'Modo shadowing: repetir en voz alta antes de seguir',
      etiqueta: 'Modo shadowing (repetir en voz alta)',
    },
    selectorIdioma: { aria: 'Cambiar idioma de la interfaz', proximamente: 'Próximamente' },
    tema: {
      aria: 'Cambiar entre modo oscuro y modo claro',
      aClaro: ' Cambiar a modo claro',
      aOscuro: ' Cambiar a modo oscuro',
    },
    sonido: { silenciar: 'Silenciar sonidos', activar: 'Activar sonidos' },
    instalar: {
      aria: 'Instalar PolyLingua como aplicación',
      etiqueta: '📲 Instalar app',
      comoInstalar: '❓ Cómo instalar',
      iosPasos: 'Tocá Compartir (□↑) y elegí "Agregar a pantalla de inicio".',
      otrosPasos:
        'Tocá el menú (⋮) de tu navegador y elegí "Agregar a pantalla de inicio" o "Instalar aplicación".',
    },
  },
};

// Diccionario de interfaz en inglés, para el silo /en/ (hoy, el curso en-de:
// 84 lecciones de alemán explicadas en inglés).
//
// El tipo `Dictionary` no admite claves parciales a propósito: si falta una,
// el build falla en vez de publicar una página con un string vacío. Así que
// esto es una traducción COMPLETA de `es`, no un subconjunto.
//
// Dos cosas que no se traducen y conviene no "arreglar":
//
// - `tools.diario.placeholder` son ejemplos EN el idioma que se estudia
//   («Heute habe ich…»), no texto de interfaz. Van igual en los dos
//   diccionarios.
// - Los marcadores `{lang}`, `{nivel}`, `{n}`, `{x}`, `{y}`, `{enlace}` y
//   `{detalle}` los sustituye src/lib/interpolate.ts por nombre; si se
//   traducen o se renombran, el texto sale con el marcador crudo.
//
// Y un detalle de montaje: los strings del examen `intro`, `umbral`,
// `yDesbloquear` y `yCompletarIdioma` son FRAGMENTOS que examen.astro
// concatena en una sola frase («You need **70% or more** to unlock **A2**»),
// no oraciones sueltas. Traducirlos por separado sin mirar cómo se unen da
// inglés roto. Lo mismo con `pendientes`, que no lleva punto final porque
// `{detalle}` lo aporta.
export const en: Dictionary = {
  header: {
    logoAria: 'PolyLingua — home',
    navAria: 'Main navigation',
    nav: {
      idiomas: 'Languages',
      buscar: 'Search',
      blog: 'Blog',
      porQue: 'Why',
      faq: 'FAQ',
    },
    toolsAria: 'More tools',
    tools: {
      repasar: 'Review',
      repasarAria: 'Review words you got wrong',
      vocabulario: 'Vocabulary',
      vocabularioAria: 'See and review your vocabulary',
      practicaLibre: 'Free practice',
      practicaLibreAria: 'Random free practice',
      ahorcado: 'Hangman',
      ahorcadoAria: 'Play hangman',
      logros: 'Achievements',
      logrosAria: 'See your achievements',
      misErrores: 'My mistakes',
      misErroresAria: 'See your most frequent mistakes',
    },
    ctaStart: 'Start for free',
  },
  bottomNav: {
    navAria: 'Main mobile navigation',
    tabs: {
      inicio: 'Home',
      idiomas: 'Languages',
      repasar: 'Review',
      logros: 'Achievements',
      mas: 'More',
    },
    sheetAria: 'More options',
    groups: {
      practicar: 'Practise',
      tuProgreso: 'Your progress',
      recursos: 'Resources',
      sobrePolyLingua: 'About PolyLingua',
      preferencias: 'Preferences',
    },
    links: {
      buscarLecciones: 'Search lessons',
      situaciones: 'Situations',
      dialogos: 'Dialogues',
      vocabulario: 'Vocabulary',
      practicaLibre: 'Free practice',
      ahorcado: 'Hangman',
      escucharRepetir: 'Listen and repeat',
      generadorFrases: 'Sentence builder',
      misErrores: 'My mistakes',
      gramatica: 'Grammar',
      copiaSeguridad: 'Backup',
      recursos: 'Resources',
      diario: 'Journal',
      blog: 'Blog',
      porQuePolyLingua: 'Why PolyLingua',
      faq: 'FAQ',
    },
    ctaStart: 'Start for free',
  },
  footer: {
    tagline:
      'Languages from A1 to C2, with grammar you actually enjoy learning. Free while we build the community.',
    idiomas: 'Languages',
    proyecto: 'Project',
    codigoGitHub: 'Code on GitHub',
    blog: 'Blog',
    faq: 'FAQ',
    acercaDe: 'About',
    terminos: 'Terms of use',
    privacidad: 'Privacy',
    hechoCon: 'Made with ☕ for people who love languages.',
  },
  breadcrumbAria: 'Breadcrumb',
  cookies: {
    texto:
      'PolyLingua saves your progress in your browser only — we use no tracking cookies. More detail in the {enlace}.',
    enlace: 'privacy policy',
    entendido: 'Got it',
  },
  languageNames: {
    de: 'German',
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    it: 'Italian',
    pt: 'Portuguese',
  },
  levelNames: {
    a1: 'A1 · Beginner',
    a2: 'A2 · Elementary',
    b1: 'B1 · Intermediate',
    b2: 'B2 · Upper intermediate',
    c1: 'C1 · Advanced',
    c2: 'C2 · Mastery',
  },
  levelTaglines: {
    a1: 'Your first words',
    a2: 'Talk about what you did yesterday',
    b1: 'Conversations with substance',
    b2: 'Master the passive and the subjunctive',
    c1: 'Style, nuance and register',
    c2: 'The language at an educated native level',
  },
  levelDescriptions: {
    a1: 'Introduce yourself, order food and survive your first day speaking the language.',
    a2: 'The past, daily routines and the first sentences that make you sound (almost) local.',
    b1: 'Link ideas with cause, contrast and condition, and start giving opinions like someone who owns the language.',
    b2: 'Talk about hypotheses, news and nuance with the precision of an advanced speaker.',
    c1: 'Write, argue and follow complex texts with near-native ease.',
    c2: 'Irony, colloquial register and the stylistic nuance only experts handle.',
  },
  // Solo los bloques `de-*`: son los únicos que ve un usuario del silo inglés,
  // porque en-de es hoy el único curso con la interfaz en inglés. Los otros 24
  // bloques de units.ts sirven a cursos es-* y su español es el correcto.
  unitDescriptions: {
    'de-a1': {
      1: 'Pronunciation and your first phrases',
      2: 'The grammar foundations',
      3: 'Everyday vocabulary',
      4: 'Everyday situations',
      5: 'Out and about',
      6: 'Prepositions of place and time',
    },
    'de-a2': {
      1: 'The past and modal verbs',
      2: 'Cases and prepositions',
      3: 'Pronouns and fixed prepositions',
      4: 'Advanced everyday situations',
    },
    'de-b1': {
      1: 'Subordinate clauses and narrative tenses',
      2: 'Applied grammar and professional vocabulary',
      3: 'Complaining, asking and telling politely',
      4: 'Verbs with fixed prepositions, and the full guide',
    },
    'de-b2': {
      1: 'Passive, subjunctive and future',
      2: 'Advanced connectors and topic vocabulary',
    },
    'de-c1': {
      1: 'Konjunktiv I, participles and modal verbs',
      2: 'Nominal style, connectors and academic vocabulary',
      3: 'Prepositions in academic and professional register',
    },
    'de-c2': {
      1: 'Modal particles, idioms and register',
      2: 'Regional varieties, humour and rhetoric',
      3: 'Idiomatic use and nuance with prepositions',
    },
  },
  // Las 95 habilidades del catálogo alemán, que es el único curso con eje
  // inglés (en-de). 91 las enseñan sus lecciones; las otras cuatro —los tres
  // artículos por separado y hin/her— solo tienen lección en es-de, pero
  // practicar.astro manda el catálogo ENTERO al cliente, así que pueden salir
  // igual en el panel de progreso. Por eso están las 95 y no 91.
  //
  // Son etiquetas de interfaz, no contenido: describen la habilidad, no la
  // enseñan. Los términos alemanes (Perfekt, Wechselpräpositionen,
  // Funktionsverbgefüge) se conservan porque son el nombre técnico del tema y
  // es como los va a encontrar el alumno en cualquier gramática.
  skillNames: {
    // ── A1 ────────────────────────────────────────────────────────
    'de.a1.pron.umlaute': 'The umlauts (ä, ö, ü)',
    'de.a1.pron.diptongos': 'Diphthongs (ei, ie, eu, au)',
    'de.a1.pron.consonantes': 'sch, ch, ck, st, sp',
    'de.a1.introduction.name': 'Saying your name',
    'de.a1.introduction.origin': 'Saying where you are from',
    'de.a1.question.words': 'Question words (W-Fragen)',
    'de.a1.article.der-die-das': 'The articles der / die / das',
    'de.a1.article.der': 'The article der (masculine)',
    'de.a1.article.die': 'The article die (feminine)',
    'de.a1.article.das': 'The article das (neuter)',
    'de.a1.verb.present-regular': 'Present tense of regular verbs',
    'de.a1.verb.present-irregular': 'Vowel-changing verbs',
    'de.a1.vocabulary.numbers': 'Numbers (0-100)',
    'de.a1.vocabulary.time': 'Telling the time',
    'de.a1.wordorder.basic': 'The verb in second position',
    'de.a1.wordorder.time-verb-subject': 'Starting with a time phrase (Heute trinke ich…)',
    'de.a1.wordorder.questions': 'Word order in questions',
    'de.a1.verb.sein': 'The verb sein',
    'de.a1.verb.haben': 'The verb haben',
    'de.a1.pronoun.personal': 'Personal pronouns',
    'de.a1.negation.nicht-kein': 'Negating with nicht and kein',
    'de.a1.noun.plural': 'Forming the plural',
    'de.a1.verb.imperative': 'The imperative',
    'de.a1.vocabulary.family': 'Family',
    'de.a1.vocabulary.food': 'Food and drink',
    'de.a1.vocabulary.home': 'The home',
    'de.a1.vocabulary.work': 'Work and jobs',
    'de.a1.vocabulary.shopping': 'Shopping',
    'de.a1.writing.about-me': 'Writing about yourself',
    'de.a1.vocabulary.restaurant': 'At the restaurant',
    'de.a1.vocabulary.transport': 'Transport and directions',
    'de.a1.vocabulary.freetime': 'Likes and free time',
    'de.a1.vocabulary.animals': 'Animals',
    'de.a1.preposition.place-time': 'Prepositions of place and time',

    // ── A2 ────────────────────────────────────────────────────────
    'de.a2.verb.perfekt': 'Perfekt: choosing haben or sein',
    'de.a2.verb.participle': 'Forming the participle (ge-…-t / ge-…-en)',
    'de.a2.verb.modal': 'Modal verbs (können, müssen, wollen…)',
    'de.a2.wordorder.verb-final': 'The second verb at the end of the sentence',
    'de.a2.verb.separable': 'Separable verbs (trennbare Verben)',
    'de.a2.adjective.comparative': 'Comparative and superlative',
    'de.a2.case.akkusativ': 'Akkusativ: the direct object',
    'de.a2.case.dativ': 'Dativ: who the action reaches',
    'de.a2.preposition.fixed': 'Fixed Akkusativ and Dativ prepositions',
    'de.a2.preposition.wechsel': 'Wechselpräpositionen: movement or position',
    'de.a2.verb.reflexive': 'Reflexive verbs (sich + verb)',
    'de.a2.vocabulary.freetime': 'Free time and hobbies',
    'de.a2.pronoun.akkusativ': 'Akkusativ pronouns (mich, dich, ihn…)',
    'de.a2.pronoun.possessive': 'Possessives (mein, dein, sein…)',
    'de.a2.time.past-future': 'Talking about the past and the future',
    'de.a2.vocabulary.phone': 'On the phone',
    'de.a2.vocabulary.health': 'Health and the doctor',
    'de.a2.vocabulary.money': 'Money and payments',
    'de.a2.vocabulary.problems': 'Everyday problems',
    'de.a2.vocabulary.plans': 'Making plans: inviting, accepting, cancelling',

    // ── B1 ────────────────────────────────────────────────────────
    'de.b1.wordorder.subordinate': 'The verb at the end in subordinate clauses',
    'de.b1.conjunction.subordinating': 'Choosing the conjunction (weil, dass, obwohl, wenn)',
    'de.b1.verb.praeteritum': 'Präteritum: the narrative past',
    'de.b1.clause.relative': 'Relative clauses (der, die, das)',
    'de.b1.clause.indirect-question': 'Indirect questions (ob, W-Wort)',
    'de.b1.clause.final': 'Purpose clauses (um…zu, damit)',
    'de.b1.case.genitiv': 'Genitiv: formal possession',
    'de.b1.adjective.declension': 'Adjective declension',
    'de.b1.vocabulary.work': 'Work and profession',
    'de.b1.verb.konjunktiv2': 'Polite Konjunktiv II (wäre, hätte, könnte)',
    'de.b1.verb.konjunktiv2-wuerde': 'Konjunktiv II with würde + infinitive',
    'de.b1.verb.perfekt-zustand': 'Action (Perfekt) vs. state (sein + participle)',
    'de.b1.vocabulary.complaints': 'Complaining and asking for a solution',
    'de.b1.adverb.direction': 'Adverbs of direction (hin, her, da-)',
    'de.b1.verb.with-preposition': 'Verbs with fixed prepositions (warten auf, denken an…)',

    // ── B2 ────────────────────────────────────────────────────────
    'de.b2.verb.futur': 'Futur I and Futur II',
    'de.b2.clause.conditional-irreal': 'Unreal conditionals (wenn + Konjunktiv II)',
    'de.b2.voice.passive': 'The passive with werden',
    'de.b2.voice.zustandspassiv': 'Zustandspassiv vs. Vorgangspassiv',
    'de.b2.connector.discourse': 'Discourse connectors (deshalb, trotzdem, allerdings)',
    'de.b2.conjunction.double': 'Double conjunctions (sowohl…als auch, je…desto)',
    'de.b2.preposition.genitiv': 'Genitiv prepositions (trotz, wegen, während)',
    'de.b2.vocabulary.economy': 'Economy and society',

    // ── C1 ────────────────────────────────────────────────────────
    'de.c1.verb.konjunktiv1': 'Konjunktiv I: reported speech',
    'de.c1.verb.modal-subjective': 'Speculative modals (er muss krank sein)',
    'de.c1.construction.participial': 'Participial constructions',
    'de.c1.construction.funktionsverb': 'Funktionsverbgefüge (in Frage stellen…)',
    'de.c1.style.nominal': 'Nominal vs. verbal style',
    'de.c1.connector.causal': 'Causal connectors (da, denn, zumal)',
    'de.c1.wordformation.affixes': 'Word formation: prefixes and suffixes',
    'de.c1.preposition.academic': 'Prepositions in academic register',
    'de.c1.vocabulary.academic': 'Academic and scientific language',

    // ── C2 ────────────────────────────────────────────────────────
    'de.c2.particle.modal': 'Modal particles (doch, mal, ja, wohl)',
    'de.c2.idiom.prepositional': 'Idiomatic use of prepositions',
    'de.c2.idiom.redewendungen': 'Idiomatic expressions',
    'de.c2.idiom.sprichwoerter': 'Proverbs and sayings',
    'de.c2.variety.regional': 'Regional varieties (Austria, Switzerland)',
    'de.c2.variety.youth': 'Jugendsprache and anglicisms',
    'de.c2.style.irony-register': 'Irony and register',
    'de.c2.style.rhetoric': 'Rhetorical devices',
    'de.c2.style.wordplay': 'Humour and wordplay',
  },
  languageTaglines: {
    de: 'Precision, cases and gloriously long words',
    en: 'The language you already use without noticing',
    es: 'Ser or estar: that is the question',
    fr: 'Elegance, gender and that famous subjonctif',
    it: 'Melodic, expressive and closer than you think',
    pt: 'The close cousin that surprises you with its nuance',
  },
  languageDescriptions: {
    de: 'The language of logic: clear rules, a curious word order and a vocabulary you build like Lego bricks.',
    en: 'Simple grammar on the surface, with nuance (tenses, phrasal verbs) that separates sounding fine from sounding native.',
    es: 'One of the most spoken languages in the world, with rich verb grammar — the subjunctive turns up everywhere — but no case declensions.',
    fr: 'Nasal sounds, a grammatical gender to master and a subjunctive mood that separates good speakers from excellent ones.',
    it: 'Very close to Spanish in vocabulary, with its own rhythm, double consonants and a congiuntivo worth conquering.',
    pt: 'Familiar on the surface if you know Spanish, with nasal sounds of its own and structures — like the future subjunctive — that your language simply lacks.',
  },
  silo: {
    idiomas: 'Languages',
    catalogoEyebrow: 'Language catalogue',
    catalogoTitulo: 'Which language do you want to learn?',
    catalogoMetaTitulo: 'Available languages',
    catalogoMetaDescripcion:
      'Pick the language you want to learn: German, English, French, Italian or Portuguese. Gamified grammar from A1 to C2, free.',
    catalogoIntro:
      'Every language has its own path from A1 to C2, with the same gamified grammar that keeps learning from feeling like studying.',
    continuar: 'Continue',
    repaso: 'Review',
    errores: 'Mistakes',
    racha: 'Streak',
    explorarMas: '🧭 Explore more',
    explorar: {
      practicarAhora: 'Practise now',
      situaciones: 'Situations',
      dialogos: 'Dialogues',
      pronunciacion: 'Listen and repeat',
      recursos: 'Resources',
      sprintSemanal: 'Weekly sprint',
      diario: 'Journal',
      misErrores: 'My mistakes',
      gramatica: 'Grammar',
      generadorFrases: 'Sentence builder',
    },
    nivelVacio: 'We are still writing lessons for this level. Check back soon!',
    examenNivel: 'Level test',
    examenDesc: 'Everything you learned in {nivel} in one go — pass it to unlock the next level.',
    bloqueado: '🔒 Locked',
    completado: '✓ Completed',
    irAlExamen: 'Take the test →',
    leccion: 'lesson',
    lecciones: 'lessons',
    unidad: 'Unit',
    seguiCon: 'Carry on with:',
    seguiPorAca: 'Carry on here',
    delBlog: 'From the blog',
    verNiveles: 'See levels →',
    inicio: {
      titulo: 'Already know some?',
      desc: 'Pick the level you want to start from. Everything below it stays open in case you want to review.',
      elegido: 'Starting at {nivel}',
      cambiar: 'Change level',
      cerrar: 'Done',
      aria: 'Choose starting level',
    },
  },
  lesson: {
    anterior: '← Previous',
    cursoNombre: 'Interactive {lang} Course — PolyLingua',
    cursoDescripcion:
      'Learn {lang} from A1 to C2 for free, with grammar that is actually fun and interactive exercises.',
    trucoTitulo: '💡 A trick so you do not get bored',
    vocabularioTitulo: '📚 Vocabulary from this lesson',
    escuchar: 'Listen',
    empezarPractica: 'Start practising →',
    siguiente: 'Next →',
    frasesTitulo: '🗣️ Phrases to use today',
    frasesIntro: 'Listen to each phrase and say it out loud before you practise.',
  },
  practice: {
    kinds: {
      choice: '🔘 Multiple choice',
      fillBlank: '✏️ Fill the gap',
      match: '🔗 Match',
      write: '⌨️ Type the answer',
      order: '🧩 Put the sentence in order',
    },
    publicidad: 'Advertisement',
    tituloSeccion: '🎮 Test yourself',
    aria: 'Interactive practice',
    pista: '💡 Hint',
    completado: 'Done!',
    completaLaFrase: 'Complete the sentence',
    ordenaPalabras: 'Put the words in the right order',
    emparejaElementos: 'Match each item with its pair',
    escucharDeNuevo: 'Listen again',
    fraseConstruyendo: 'The sentence you are building',
    correcto: '✅ Correct!',
    incorrecto: '❌ Not quite.',
    respuestaCorrecta: 'Correct:',
    resultado: 'You got',
    tuRespuesta: 'Your answer',
    comprobar: 'Check',
    repetir: 'Repeat',
    escuchaYEscribe: '🔊 Listen and write what you hear',
    yaLoDije: '🎤 I said it out loud',
  },
  exam: {
    titulo: 'Test',
    tituloPagina: 'Level test',
    metaTitulo: '{lang} test — {nivel}',
    metaDescripcion:
      'Final {nivel} test for {lang}: everything you learned in the level in one go. Score 70% or more to unlock the next level.',
    intro: 'This test mixes questions and exercises from the {n} lessons in {nivel}. You need',
    yDesbloquear: 'to unlock',
    desbloqueaste: 'You unlocked',
    cursoCompleto: 'You finished the whole {lang} course. Congratulations!',
    irA: 'Go to',
    aprobado: 'Passed!',
    todaviaNo: 'Not yet',
    umbral: '70% or more',
    explicacionFallo:
      'You need at least 70% to pass. Everything you got wrong is already saved for review.',
    reintentar: 'Try again',
    repasarAhora: 'Review now',
    verMisLogros: 'See my achievements',
    yCompletarIdioma: 'to finish the language',
  },
  tools: {
    nombres: {
      vocabulario: 'Vocabulary',
      repasar: 'Review',
      practicaLibre: 'Free practice',
      ahorcado: 'Hangman',
      diario: 'Journal',
      gramatica: 'Grammar',
      misErrores: 'My mistakes',
      pronunciacion: 'Listen and repeat',
      situaciones: 'Situations',
    },
    comun: {
      verLecciones: 'See lessons',
      todos: 'All ({n})',
      mastery: ['New', 'Learning', 'Familiar', 'Good', 'Strong', 'Mastered'],
      caja: 'Box {n}',
      practicar: 'Practise',
      sinDatos: 'No data',
    },
    selectores: {
      vocabulario: {
        metaTitulo: 'Vocabulary',
        metaDescripcion:
          'Every new word you have learned across your lessons, in one place to look over and review.',
        h1: 'Which language do you want to see vocabulary for?',
        desc: 'Pick a language to see the words you already know.',
      },
      repasar: {
        metaTitulo: 'Review',
        metaDescripcion:
          'Review the words and exercises you got wrong, with spaced repetition, until you really know them.',
        h1: 'Which language do you want to review?',
        desc: 'Pick a language to see what you have due.',
      },
      practicaLibre: {
        metaTitulo: 'Free practice',
        metaDescripcion:
          'Practise with a random session of questions and exercises drawn from all your lessons, different every time.',
        h1: 'Which language do you want to practise?',
        desc: 'Pick a language for a free practice session.',
      },
      ahorcado: {
        metaTitulo: 'Hangman',
        metaDescripcion:
          'Play hangman with the vocabulary you have already learned on PolyLingua, in whichever language you are studying.',
        h1: 'Which language do you want to play in?',
        desc: 'Pick a language to play hangman with your own vocabulary.',
      },
      diario: {
        metaTitulo: 'Writing journal',
        metaDescripcion:
          'Write a few lines every day in the language you are studying to practise free writing, with no fixed answers.',
        h1: 'Which language do you want to write in today?',
        desc: "Pick a language to write today's entry.",
      },
      pronunciacion: {
        metaTitulo: 'Listen and repeat',
        metaDescripcion:
          'Hear words in a native voice and say them out loud to practise your pronunciation in the language you are studying.',
        h1: 'Which language do you want to practise?',
        desc: 'Pick a language to hear words and repeat them out loud.',
      },
      situaciones: {
        metaTitulo: 'Everyday situations',
        metaDescripcion:
          'Learn languages through real situations — work, home, shopping — with the phrases people actually use every day.',
        h1: 'Which language do you want to practise situations in?',
        desc: 'Pick a language to learn with real phrases instead of isolated rules.',
      },
    },
    vocabulario: {
      metaTitulo: '{lang} vocabulary',
      metaDescripcion:
        'Every {lang} word you have learned across your lessons, in one place to look over and review.',
      h1: 'Your {lang} vocabulary',
      cargando: 'Loading your vocabulary…',
      vacioTitulo: 'You have not learned any {lang} vocabulary yet',
      vacioDesc: 'Finish a lesson and its new words will start showing up here.',
      palabrasTitulo: '📚 Words learned',
      pruebaTitulo: '🎯 Test yourself',
      palabraAprendida: '{n} word learned.',
      palabrasAprendidas: '{n} words learned.',
      comoSeDice: 'How do you say "{x}"?',
    },
    repasar: {
      metaTitulo: 'Review {lang}',
      metaDescripcion:
        'Review the {lang} words and exercises you got wrong, with spaced repetition, until you really know them.',
      h1: 'Review {lang}',
      cargando: 'Loading your review…',
      vacioTitulo: 'Nothing left to review today',
      vacioDesc: 'Come back tomorrow, or keep going with new lessons in the meantime.',
      pendientes: 'You have {n} items to review{detalle}',
      pendiente: 'You have {n} item to review{detalle}',
    },
    practicaLibre: {
      metaTitulo: '{lang} free practice',
      metaDescripcion:
        'Practise {lang} with a random session of questions and exercises from all your lessons, different every time.',
      h1: '{lang} free practice',
      armando: 'Putting a random session together…',
      vacioTitulo: 'No exercises to practise yet',
      vacioDesc: 'Finish a lesson first and come back here.',
      sesion: 'A random session of {n} items, different every time you visit this page.',
    },
    gramatica: {
      metaTitulo: 'Grammar — {lang}',
      metaDescripcion:
        'Go over the grammar topics in {lang}: see how well you know each one and practise the ones you need most.',
      h1: '{lang} grammar',
      desc: 'How well you know each grammar topic.',
      ejercicio: '{n} exercise',
      ejercicios: '{n} exercises',
    },
    practicar: {
      metaTitulo: 'Practise {lang}',
      metaDescripcion:
        'Practise {lang} with exercises picked from what you already know and what you tend to get wrong.',
      h1: 'Practise {lang}',
      preparando: 'Putting your session together…',
      elegidos: '{n} exercises picked for you.',
      vacioTitulo: 'Nothing to practise yet',
      vacioDesc:
        'Finish a lesson first and the engine will start learning what you need to work on.',
      progresoTitulo: '📊 Your progress in {lang}',
      progresoGeneral: 'Overall progress {pct}% · {n} of {total} skills started',
      debilesTitulo: 'Worth practising',
      motivos: {
        severe_error: {
          tag: '🔴 Worth practising',
          texto: 'This pattern has caught you out several times. Let us take it slowly.',
        },
        persistent_error: {
          tag: '🟠 It keeps happening',
          texto: 'You have got this wrong more than once, so it is time to shore it up.',
        },
        weak_skill: {
          tag: '🟡 Not automatic yet',
          texto: 'You are getting there: a bit more practice.',
        },
        due_review: {
          tag: '🔁 Time for a review',
          texto: 'You have not seen this in a while. Let us check it is still there.',
        },
        new_skill: { tag: '🌱 Something new', texto: 'You are ready for this one.' },
        random_review: {
          tag: '✨ Just a refresher',
          texto: 'All good here: a quick review to keep it fresh.',
        },
      },
      categorias: {
        grammar: 'Grammar',
        vocabulary: 'Vocabulary',
        word_order: 'Word order',
        pronunciation: 'Pronunciation',
        writing: 'Writing',
      },
    },
    misErrores: {
      metaTitulo: 'My mistakes — {lang}',
      metaDescripcion: 'Go back over the {lang} exercises you find hardest and practise them.',
      h1: 'My mistakes',
      cargando: 'Loading your mistakes…',
      vacioTitulo: 'No mistakes recorded',
      vacioDesc: 'When you get an exercise wrong, it will show up here so you can go over it.',
      practicarBtn: 'Practise my mistakes',
      conErrores: 'You have {n} exercises with mistakes.',
      conError: 'You have {n} exercise with mistakes.',
      falladoVeces: 'got wrong {n}×',
      tuRespuesta: 'Your answer:',
      correcta: 'Correct:',
    },
    diario: {
      metaTitulo: 'Writing journal in {lang}',
      metaDescripcion:
        'Write a few lines every day in {lang} to practise free writing, with no fixed answers — saved in your browser only.',
      h1: '{lang} journal',
      desc: 'Write a few lines about your day — no pressure, no right answer. It is saved in this browser only.',
      etiquetaTextarea: "Today's entry",
      placeholder: {
        de: 'Heute habe ich...',
        en: 'Today I...',
        es: 'Hoy he...',
        fr: "Aujourd'hui j'ai...",
        it: 'Oggi ho...',
        pt: 'Hoje eu...',
      },
      palabras: '{n} words',
      guardado: '✅ Saved',
      pista:
        '💡 If you want to check your text, you can paste it into {enlace} to look over the grammar — it is not part of PolyLingua, just an optional outside tool.',
      anterioresTitulo: '📅 Earlier entries',
    },
    pronunciacion: {
      metaTitulo: 'Listen and repeat in {lang}',
      metaDescripcion:
        'Hear {lang} words in a native voice, say them out loud and mark the hard ones — those come back more often.',
      h1: 'Listen and repeat in {lang}',
      desc: 'Listen to the word, pause, and say it out loud. Then mark whether you got it — the ones you find hard will come back more often.',
      vacioTitulo: 'No vocabulary yet',
      vacioDesc: 'Finish a {lang} lesson first to unlock this practice.',
      escuchar: '🔊 Listen',
      guia: 'Listen, pause, and say it out loud.',
      meSalio: '✅ Got it',
      meCosto: '🔁 Found it hard',
      traduccion: 'Translation: {x}',
      practicada: '{n} word practised',
      practicadas: '{n} words practised',
    },
    situaciones: {
      metaTitulo: 'Everyday situations in {lang}',
      metaDescripcion:
        'Learn {lang} through real situations — work, home, shopping — with the phrases people actually use every day.',
      h1: 'Everyday situations',
      desc: 'Instead of studying isolated rules, learn the phrases people really use in each situation. Listen to them, say them out loud, and practise producing them yourself.',
      vacioTitulo: 'No situations in {lang} yet',
      vacioDesc: 'We are building this mode language by language — check back soon.',
      frase: '{n} phrase',
      frases: '{n} phrases',
    },
    ahorcado: {
      metaTitulo: '{lang} hangman',
      metaDescripcion:
        'Play hangman with the {lang} vocabulary you have already learned on PolyLingua — guess the word letter by letter.',
      h1: '{lang} hangman',
      desc: 'Guess the word letter by letter before you run out of tries.',
      vacioTitulo: 'No vocabulary yet',
      vacioDesc: 'Finish a {lang} lesson first to unlock hangman.',
      escuchar: '🔊 Listen',
      jugarDeNuevo: '🔁 Play again',
      pista: 'Hint: {x}',
      ganaste: '🎉 Nice! The word was "{x}" ({y}).',
      perdiste: '💀 Out of tries. The word was "{x}" ({y}).',
      consignaSrs: 'Write this word in {lang}: "{x}"',
    },
  },
  widgets: {
    saltarContenido: 'Skip to content',
    volverArriba: 'Back to top',
    barra: { cerrar: 'Dismiss notice' },
    metaDiaria: {
      pildoraAria: "See or change today's practice goal",
      titulo: 'How much do you want to practise today?',
      sub: 'Pick a goal for today — you can change it whenever you like.',
      opcionesAria: 'Minutes per day',
      ahoraNo: 'Not now',
    },
    racha: {
      cta: 'Practise now',
      texto: 'Do not lose your {n}-day streak — practise something today.',
      textos: 'Do not lose your {n}-day streak — practise something today.',
    },
    copia: {
      texto: 'Your progress lives in this browser only — back it up before you lose it.',
      cta: 'Back up',
    },
    refuerzo: {
      pausado:
        'This topic is fighting back today. We will carry on with the lesson and save it for "Practise now".',
      otraVez: 'Same structure once more, in a different sentence.',
      dominado: 'Three in a row with {tema}. Topic mastered: back to the lesson.',
    },
    shadowing: {
      aria: 'Shadowing mode: say it out loud before moving on',
      etiqueta: 'Shadowing mode (say it out loud)',
    },
    selectorIdioma: { aria: 'Change interface language', proximamente: 'Coming soon' },
    tema: {
      aria: 'Switch between dark and light mode',
      aClaro: ' Switch to light mode',
      aOscuro: ' Switch to dark mode',
    },
    sonido: { silenciar: 'Mute sounds', activar: 'Unmute sounds' },
    instalar: {
      aria: 'Install PolyLingua as an app',
      etiqueta: '📲 Install app',
      comoInstalar: '❓ How to install',
      iosPasos: 'Tap Share (□↑) and choose "Add to Home Screen".',
      otrosPasos: 'Tap your browser menu (⋮) and choose "Add to Home Screen" or "Install app".',
    },
  },
};
