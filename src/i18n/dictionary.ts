// Diccionario de strings de interfaz para la arquitectura SILO
// [userLang]/[targetLang]/... — ver src/data/userLanguages.ts para la lista
// de idiomas de interfaz. Hoy solo `es` está poblado (es el único
// UserLanguageId con `active: true`); agregar un diccionario nuevo acá es
// el paso de "traducir la interfaz" cuando se active otro idioma — ver
// src/i18n/index.ts para el mecanismo de fallback.
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
};

// Interfaz en alemán, para los cursos de-* (alemán aprendiendo otro idioma).
// El objeto tiene que estar COMPLETO: el tipo Dictionary no permite claves
// parciales, así que si falta una el build falla en vez de dejar un hueco
// silencioso en la UI.
export const de: Dictionary = {
  header: {
    logoAria: 'PolyLingua — Startseite',
    navAria: 'Hauptnavigation',
    nav: {
      idiomas: 'Sprachen',
      buscar: 'Suchen',
      blog: 'Blog',
      porQue: 'Warum',
      faq: 'FAQ',
    },
    toolsAria: 'Weitere Werkzeuge',
    tools: {
      repasar: 'Wiederholen',
      repasarAria: 'Vokabeln wiederholen',
      vocabulario: 'Wortschatz',
      vocabularioAria: 'Meinen Wortschatz ansehen',
      practicaLibre: 'Freies Üben',
      practicaLibreAria: 'Frei üben',
      ahorcado: 'Galgenmännchen',
      ahorcadoAria: 'Galgenmännchen spielen',
      logros: 'Erfolge',
      logrosAria: 'Meine Erfolge ansehen',
      misErrores: 'Meine Fehler',
      misErroresAria: 'Meine Fehler ansehen',
    },
    ctaStart: 'Kostenlos starten',
  },
  bottomNav: {
    navAria: 'Mobile Hauptnavigation',
    tabs: {
      inicio: 'Start',
      idiomas: 'Sprachen',
      repasar: 'Wiederholen',
      logros: 'Erfolge',
      mas: 'Mehr',
    },
    sheetAria: 'Weitere Optionen',
    groups: {
      practicar: 'Üben',
      tuProgreso: 'Dein Fortschritt',
      recursos: 'Ressourcen',
      sobrePolyLingua: 'Über PolyLingua',
      preferencias: 'Einstellungen',
    },
    links: {
      buscarLecciones: 'Lektionen suchen',
      situaciones: 'Situationen',
      dialogos: 'Dialoge',
      vocabulario: 'Wortschatz',
      practicaLibre: 'Freies Üben',
      ahorcado: 'Galgenmännchen',
      escucharRepetir: 'Hören und nachsprechen',
      generadorFrases: 'Satzgenerator',
      misErrores: 'Meine Fehler',
      gramatica: 'Grammatik',
      copiaSeguridad: 'Sicherungskopie',
      recursos: 'Ressourcen',
      diario: 'Tagebuch',
      blog: 'Blog',
      porQuePolyLingua: 'Warum PolyLingua',
      faq: 'FAQ',
    },
    ctaStart: 'Kostenlos starten',
  },
  footer: {
    tagline:
      'Sprachen von A1 bis C2, mit Grammatik zum spielerischen Lernen. Kostenlos, solange wir die Community aufbauen.',
    idiomas: 'Sprachen',
    proyecto: 'Projekt',
    codigoGitHub: 'Code auf GitHub',
    blog: 'Blog',
    faq: 'Häufige Fragen',
    acercaDe: 'Über uns',
    privacidad: 'Datenschutz',
    hechoCon: 'Mit ☕ gemacht für alle, die Sprachen lieben.',
  },
  breadcrumbAria: 'Navigationspfad',
  cookies: {
    texto:
      'PolyLingua speichert deinen Fortschritt nur in deinem Browser — wir verwenden keine Tracking-Cookies. Mehr dazu in der {enlace}.',
    enlace: 'Datenschutzerklärung',
    entendido: 'Verstanden',
  },
  languageNames: {
    de: 'Deutsch',
    en: 'Englisch',
    es: 'Spanisch',
    fr: 'Französisch',
    it: 'Italienisch',
    pt: 'Portugiesisch',
  },
  levelNames: {
    a1: 'A1 · Anfänger',
    a2: 'A2 · Grundlagen',
    b1: 'B1 · Mittelstufe',
    b2: 'B2 · Obere Mittelstufe',
    c1: 'C1 · Fortgeschritten',
    c2: 'C2 · Meisterschaft',
  },
  levelTaglines: {
    a1: 'Deine ersten Wörter',
    a2: 'Erzähl, was du gestern gemacht hast',
    b1: 'Gespräche mit Substanz',
    b2: 'Passiv und Konjunktiv im Griff',
    c1: 'Stil, Nuancen und Konjunktiv',
    c2: 'Die Sprache auf dem Niveau gebildeter Muttersprachler',
  },
  levelDescriptions: {
    a1: 'Stell dich vor, bestell etwas zu essen und überlebe deinen ersten Tag in der Sprache.',
    a2: 'Vergangenheit, Alltagsroutinen und die ersten Sätze, mit denen du (fast) wie ein Einheimischer klingst.',
    b1: 'Verknüpfe Ideen mit Ursache, Kontrast und Bedingung — und fang an, wie ein Könner zu argumentieren.',
    b2: 'Sprich über Hypothesen, Nachrichten und Nuancen mit der Präzision fortgeschrittener Sprecher.',
    c1: 'Schreib, diskutiere und verstehe komplexe Texte mit nahezu muttersprachlicher Leichtigkeit.',
    c2: 'Ironie, Umgangssprache und stilistische Feinheiten, die nur Profis beherrschen.',
  },
  languageTaglines: {
    de: 'Präzision, Fälle und sehr lange Wörter',
    en: 'Die Sprache, die du längst benutzt, ohne es zu merken',
    es: 'Ser oder estar: das ist hier die Frage',
    fr: 'Eleganz, Genus und der berühmte Subjonctif',
    it: 'Melodisch, ausdrucksstark und näher, als du denkst',
    pt: 'Der nahe Verwandte, der mit seinen Nuancen überrascht',
  },
  languageDescriptions: {
    de: 'Die Sprache der Logik: klare Regeln, eine eigenwillige Wortstellung und ein Wortschatz, der sich wie Legosteine zusammensetzt.',
    en: 'An der Oberfläche einfache Grammatik, mit Feinheiten (Zeitformen, Phrasal Verbs), die den Unterschied zwischen gut und muttersprachlich ausmachen.',
    es: 'Eine der meistgesprochenen Sprachen der Welt: reiche Verbgrammatik — der Subjuntivo taucht überall auf — aber ohne Fälle.',
    fr: 'Nasale Laute, ein Genus-System zum Meistern und ein Subjonctif, der gute von exzellenten Sprechern trennt.',
    it: 'Klanglich sehr eigen, mit Doppelkonsonanten, eigenem Rhythmus und einem Congiuntivo, den zu erobern sich lohnt.',
    pt: 'An der Oberfläche vertraut, mit eigenen Nasallauten und Strukturen wie dem Futuro do Subjuntivo, die es im Deutschen nicht gibt.',
  },
  silo: {
    idiomas: 'Sprachen',
    catalogoEyebrow: 'Sprachkatalog',
    catalogoTitulo: 'Welche Sprache möchtest du lernen?',
    continuar: 'Weiter',
    repaso: 'Wiederholung',
    errores: 'Fehler',
    racha: 'Serie',
    explorarMas: '🧭 Mehr entdecken',
    explorar: {
      situaciones: 'Situationen',
      dialogos: 'Dialoge',
      pronunciacion: 'Hören und nachsprechen',
      recursos: 'Ressourcen',
      sprintSemanal: 'Wochen-Sprint',
      diario: 'Tagebuch',
      misErrores: 'Meine Fehler',
      gramatica: 'Grammatik',
      generadorFrases: 'Satzgenerator',
    },
    nivelVacio: 'Wir bereiten die Lektionen für dieses Niveau gerade vor. Schau bald wieder vorbei!',
    examenNivel: 'Niveautest',
    examenDesc:
      'Verbindet alles, was du in {nivel} gelernt hast — bestehe ihn, um das nächste Niveau freizuschalten.',
    bloqueado: '🔒 Gesperrt',
    leccion: 'Lektion',
    lecciones: 'Lektionen',
  },
  lesson: {
    anterior: '← Zurück',
    cursoNombre: 'Interaktiver {lang}-Kurs — PolyLingua',
    cursoDescripcion:
      'Lerne {lang} von A1 bis C2 — kostenlos, mit unterhaltsamer Grammatik und interaktiven Übungen.',
    trucoTitulo: '💡 Damit es nicht langweilig wird',
    vocabularioTitulo: '📚 Wortschatz dieser Lektion',
    escuchar: 'Anhören',
    empezarPractica: 'Übung starten →',
    siguiente: 'Weiter →',
    frasesTitulo: '🗣️ Sätze für heute',
    frasesIntro: 'Hör dir jeden Satz an und sprich ihn laut nach, bevor du übst.',
  },
  practice: {
    kinds: {
      choice: '🔘 Multiple Choice',
      fillBlank: '✏️ Lücke ausfüllen',
      match: '🔗 Zuordnen',
      write: '⌨️ Antwort schreiben',
      order: '🧩 Satz ordnen',
    },
    publicidad: 'Werbung',
    tituloSeccion: '🎮 Teste dich selbst',
    aria: 'Interaktive Übung',
    pista: '💡 Tipp',
    completado: 'Geschafft!',
    completaLaFrase: 'Vervollständige den Satz',
    ordenaPalabras: 'Ordne die Wörter zum richtigen Satz',
    emparejaElementos: 'Ordne jedes Element seinem Gegenstück zu',
    escucharDeNuevo: 'Noch einmal anhören',
    fraseConstruyendo: 'Satz, den du gerade baust',
    correcto: '✅ Richtig!',
    incorrecto: '❌ Nicht ganz.',
    respuestaCorrecta: 'Richtig:',
    resultado: 'Du hast',
  },
  exam: {
    titulo: 'Test',
    tituloPagina: 'Niveautest',
    metaTitulo: '{lang}-Test — {nivel}',
    metaDescripcion:
      'Abschlusstest für {nivel} in {lang}: verbindet alles, was du im Niveau gelernt hast. Bestehe ihn mit 70% oder mehr, um das nächste Niveau freizuschalten.',
    intro: 'Dieser Test verbindet Fragen und Übungen aus den {n} Lektionen von {nivel}. Du brauchst',
    yDesbloquear: 'und freizuschalten:',
    desbloqueaste: 'Freigeschaltet:',
    cursoCompleto: 'Du hast den gesamten {lang}-Kurs abgeschlossen. Glückwunsch!',
    irA: 'Weiter zu',
    aprobado: 'Bestanden!',
    todaviaNo: 'Noch nicht',
    umbral: '70% oder mehr',
    explicacionFallo:
      'Du brauchst mindestens 70% zum Bestehen. Deine Fehler wurden zum Wiederholen gespeichert.',
    reintentar: 'Nochmal versuchen',
    repasarAhora: 'Jetzt wiederholen',
    verMisLogros: 'Meine Erfolge ansehen',
    yCompletarIdioma: 'und die Sprache abzuschließen',
  },
};
