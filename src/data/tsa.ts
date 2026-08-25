// Texto SEO de Autoridad (TSA): un bloque de contenido largo y con
// profundidad temática para páginas de listado (como /idiomas/[lang]/[level])
// que de otra forma tienen poco texto propio para Google. Se coloca después
// del grid de lecciones, no antes, para no retrasar el contenido que el
// usuario realmente busca. Clave: `${lang}-${level}`. Si una combinación no
// tiene entrada acá, la página simplemente no muestra el bloque.
export interface TsaLink {
  href: string;
  label: string;
}

export interface TsaEntry {
  heading: string;
  paragraphs: string[];
  links: TsaLink[];
}

export const TSA: Partial<Record<string, TsaEntry>> = {
  'de-a1': {
    heading: 'Aprender alemán A1 gratis: qué vas a lograr y por qué no es tan difícil como parece',
    paragraphs: [
      'El nivel A1 según el Marco Común Europeo de Referencia (MCER) es el punto de partida oficial para aprender alemán: cubre lo esencial para sobrevivir una conversación cotidiana sin entrar en pánico. Al terminarlo vas a poder presentarte, saludar, pedir en un restaurante, preguntar precios y direcciones, hablar de tu familia y contar tu rutina diaria en presente — con frases simples, pero reales.',
      'La mayoría de los hispanohablantes le tiene miedo al alemán por fama de "idioma difícil", pero en A1 la dificultad real está en solo tres cosas: el género gramatical (der, die, das), el orden de palabras (el verbo va en segunda posición) y algunos sonidos nuevos (ch, ü, ö). El vocabulario y la gramática básica, en cambio, son bastante regulares y predecibles una vez entendés el patrón — por eso en PolyLingua cada lección de este nivel viene con una mnemotecnia para memorizar la regla, no solo la lista de palabras.',
      'Con dedicación de 15-20 minutos diarios, un principiante absoluto suele completar A1 en 6-8 semanas. El orden que seguimos acá no es al azar: primero saludos y presentarte (para que puedas usar el idioma desde el día uno), después los artículos der/die/das (la base de toda la gramática alemana), y recién ahí el presente de los verbos, que es lo que te permite armar tus primeras frases completas.',
    ],
    links: [
      { href: '/idiomas/de/a1/saludos-presentarse', label: 'Saludos y presentarse' },
      { href: '/idiomas/de/a1/articulos-der-die-das', label: 'Der, die, das' },
      { href: '/idiomas/de/a1/presente-verbos', label: 'El presente (Präsens)' },
    ],
  },
};
