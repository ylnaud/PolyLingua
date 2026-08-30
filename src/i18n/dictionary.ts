// Diccionario de strings de interfaz para la arquitectura SILO
// [userLang]/[targetLang]/... — ver src/data/userLanguages.ts para la lista
// de idiomas de interfaz. Hoy solo `es` está poblado (es el único
// UserLanguageId con `active: true`); agregar un diccionario nuevo acá es
// el paso de "traducir la interfaz" cuando se active otro idioma — ver
// src/i18n/index.ts para el mecanismo de fallback.
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
  languageDescriptions: Record<'de' | 'en' | 'es' | 'fr' | 'it' | 'pt', string>;
  silo: {
    idiomas: string;
    catalogoEyebrow: string;
    catalogoTitulo: string;
    continuar: string;
    repaso: string;
    errores: string;
    racha: string;
    explorarMas: string;
    explorar: {
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
    leccion: string;
    lecciones: string;
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
    continuar: 'Continuar',
    repaso: 'Repaso',
    errores: 'Errores',
    racha: 'Racha',
    explorarMas: '🧭 Explorá más',
    explorar: {
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
    leccion: 'lección',
    lecciones: 'lecciones',
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
};
