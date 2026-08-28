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
};
