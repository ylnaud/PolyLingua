/**
 * Motor de enlaces internos.
 *
 * Decide qué páginas del sitio deberían enlazarse entre sí, y por qué. Es
 * puro: no importa nada en tiempo de ejecución, no toca el DOM, no lee el
 * disco y no llama a `astro:content`. Recibe páginas y habilidades ya
 * cargadas y devuelve propuestas.
 *
 * Esa pureza no es estética. Permite que lo carguen dos adaptadores muy
 * distintos —Astro (vía getCollection) para renderizar, y un script de Node
 * (vía filesystem) para el DRY RUN— y que los dos obtengan exactamente las
 * mismas propuestas. Si el DRY RUN corriera sobre una copia de la lógica, no
 * serviría de nada: aprobarías un informe y se aplicaría otra cosa.
 *
 * REGLA DE ORO: acá no se construye ninguna URL. Las rutas entran ya hechas,
 * derivadas de los ids reales de las colecciones por el adaptador. Nunca se
 * concatena una keyword ni se adivina un slug. `proposeLinks()` termina
 * comprobando que todo destino propuesto esté en el índice de páginas, y
 * revienta si no — un enlace inventado es un fallo de build, no un aviso.
 */

export type PageKind = 'leccion' | 'dialogo' | 'nivel' | 'curso' | 'blog';

export interface PageRecord {
  /** Ruta real, derivada por el adaptador del id de la colección. */
  route: string;
  kind: PageKind;
  userLang: string;
  /** Idioma que se enseña. `null` en el blog, que no pertenece a un curso. */
  targetLang: string | null;
  level: string | null;
  unit: number | null;
  order: number | null;
  title: string;
  grammarTopic: string | null;
  /** Ids del catálogo de src/data/skills.ts. Vacío si la lección no está etiquetada. */
  skills: string[];
  /** Solo diálogos: el campo `situation` de su frontmatter. */
  situation: string | null;
  /** Solo blog. */
  tags: string[];
  indexable: boolean;
}

export interface SkillRecord {
  id: string;
  prerequisites: string[];
}

/** Un idioma meta y cómo lo nombra el sitio, para casar los tags del blog. */
export interface LanguageRecord {
  id: string;
  name: string;
}

export type Motivo =
  | 'prerrequisito'
  | 'continuacion'
  | 'misma-habilidad'
  | 'blog-curso'
  | 'curso-blog'
  | 'misma-situacion'
  | 'dialogo-nivel'
  | 'misma-unidad';

export interface Propuesta {
  desde: string;
  hasta: string;
  anchor: string;
  motivo: Motivo;
  score: number;
  /** En una línea, por qué. Se imprime en el DRY RUN y se revisa a mano. */
  porque: string;
}

/**
 * Cuánto vale cada motivo.
 *
 * El orden no es una opinión: va de la relación más declarada a la más
 * genérica. Un prerrequisito está escrito a mano en `src/data/skills.ts` y
 * dice literalmente "esto va antes que aquello"; compartir unidad solo dice
 * "los dos caen en el mismo bloque del temario".
 *
 * NO HAY REGLA DE VOCABULARIO, y no es un olvido. Se midió: de los ~28.000
 * pares de lecciones del mismo curso, solo 200 comparten UN término y apenas
 * 6 llegan a tres. Entre diálogo y lección del mismo idioma y nivel, 4 pares
 * sobre 2.024. El contenido evita repetir vocabulario a propósito, así que el
 * solape léxico acá no mide cercanía temática: mide casualidad. Bajar el
 * umbral hasta que produjera enlaces habría sido fabricarlos.
 */
const PESOS: Record<Motivo, number> = {
  prerrequisito: 100,
  continuacion: 85,
  'misma-habilidad': 75,
  'blog-curso': 70,
  'curso-blog': 70,
  'misma-situacion': 70,
  'dialogo-nivel': 60,
  'misma-unidad': 55,
};

/** Por debajo de esto no se enlaza. Mejor 20 enlaces buenos que 500 forzados. */
export const UMBRAL = 50;

/** Tope por página. Un bloque de "seguí por acá", no una granja de enlaces. */
export const MAX_POR_PAGINA = 3;

/**
 * Tope por motivo dentro de una misma página.
 *
 * "Misma unidad" es cierto para todas las lecciones de la unidad a la vez, así
 * que sin este tope llenaba los tres huecos de las 400 lecciones y dejaba
 * fuera los prerrequisitos, que son la relación que de verdad aporta. Con uno
 * basta para ofrecer "seguí por acá"; el resto de huecos queda libre para algo
 * mejor, y si no lo hay, se quedan vacíos.
 */
const MAX_POR_MOTIVO: Partial<Record<Motivo, number>> = {
  'misma-unidad': 1,
  'misma-situacion': 2,
};

const curso = (p: PageRecord) => `${p.userLang}-${p.targetLang}`;

/** El texto del enlace sale del contenido de la página destino, nunca de una keyword. */
export function anchorPara(destino: PageRecord): string {
  const tema = destino.grammarTopic?.trim();
  if (tema && tema.length > 0 && tema.length <= 60) return tema;
  // Los títulos son de SEO y suelen llevar un gancho tras dos puntos o raya
  // ("Der, die, das: cómo funciona el género"). Para un enlace dentro de un
  // texto, la mitad de la izquierda es la que nombra el tema.
  return destino.title.split(/\s*[:—–]\s*/)[0]!.trim();
}

function añadir(
  acc: Propuesta[],
  desde: PageRecord,
  hasta: PageRecord,
  motivo: Motivo,
  score: number,
  porque: string,
): void {
  if (desde.route === hasta.route) return;
  if (!desde.indexable || !hasta.indexable) return;
  acc.push({
    desde: desde.route,
    hasta: hasta.route,
    anchor: anchorPara(hasta),
    motivo,
    score,
    porque,
  });
}

export interface Entrada {
  pages: PageRecord[];
  skills: SkillRecord[];
  languages: LanguageRecord[];
}

/**
 * Todas las relaciones que se pueden demostrar contra el contenido real.
 *
 * Nada de similitud de títulos ni de "estas dos palabras se parecen": cada
 * regla se apoya en un campo que alguien escribió a propósito.
 */
export function buildRelations({ pages, skills, languages }: Entrada): Propuesta[] {
  const out: Propuesta[] = [];
  const lecciones = pages.filter((p) => p.kind === 'leccion');
  const dialogos = pages.filter((p) => p.kind === 'dialogo');
  const blog = pages.filter((p) => p.kind === 'blog');
  const cursos = pages.filter((p) => p.kind === 'curso');

  const prereqDe = new Map(skills.map((s) => [s.id, s.prerequisites]));

  // Qué lecciones enseñan cada habilidad, por curso.
  const porHabilidad = new Map<string, PageRecord[]>();
  for (const l of lecciones) {
    for (const s of l.skills) {
      const clave = `${curso(l)}|${s}`;
      if (!porHabilidad.has(clave)) porHabilidad.set(clave, []);
      porHabilidad.get(clave)!.push(l);
    }
  }

  for (const a of lecciones) {
    for (const habilidad of a.skills) {
      // R1/R2 — prerrequisito declarado en src/data/skills.ts. Es la relación
      // más fuerte que existe en el repo: no la inferimos, está escrita.
      for (const prereq of prereqDe.get(habilidad) ?? []) {
        for (const b of porHabilidad.get(`${curso(a)}|${prereq}`) ?? []) {
          añadir(
            out,
            a,
            b,
            'prerrequisito',
            PESOS.prerrequisito,
            `"${habilidad}" tiene como prerrequisito "${prereq}", que enseña la lección destino`,
          );
          añadir(
            out,
            b,
            a,
            'continuacion',
            PESOS.continuacion,
            `la lección destino enseña "${habilidad}", que tiene a "${prereq}" como prerrequisito`,
          );
        }
      }
      // R3 — la misma habilidad enseñada en otra lección del mismo curso.
      for (const b of porHabilidad.get(`${curso(a)}|${habilidad}`) ?? []) {
        añadir(
          out,
          a,
          b,
          'misma-habilidad',
          PESOS['misma-habilidad'],
          `las dos lecciones enseñan "${habilidad}"`,
        );
      }
    }
  }

  // R4 — misma unidad del mismo nivel y curso. Lo declara src/data/units.ts.
  const porUnidad = new Map<string, PageRecord[]>();
  for (const l of lecciones) {
    if (l.unit === null || l.level === null) continue;
    const clave = `${curso(l)}|${l.level}|${l.unit}`;
    if (!porUnidad.has(clave)) porUnidad.set(clave, []);
    porUnidad.get(clave)!.push(l);
  }
  for (const grupo of porUnidad.values()) {
    for (const a of grupo) {
      for (const b of grupo) {
        añadir(
          out,
          a,
          b,
          'misma-unidad',
          PESOS['misma-unidad'],
          `misma unidad ${a.unit} de ${a.level?.toUpperCase()}`,
        );
      }
    }
  }

  // R5 — diálogos que comparten `situation` dentro del mismo idioma. El campo
  // lo escribe quien crea el diálogo, así que la relación está declarada, no
  // inferida. Cubre los 100: todos tienen entre 1 y 3 hermanos de situación.
  const porSituacion = new Map<string, PageRecord[]>();
  for (const d of dialogos) {
    if (!d.situation) continue;
    const clave = `${d.targetLang}|${d.situation}`;
    if (!porSituacion.has(clave)) porSituacion.set(clave, []);
    porSituacion.get(clave)!.push(d);
  }
  for (const grupo of porSituacion.values()) {
    for (const a of grupo) {
      for (const b of grupo) {
        añadir(
          out,
          a,
          b,
          'misma-situacion',
          PESOS['misma-situacion'],
          `los dos son diálogos de "${a.situation}" en el mismo idioma`,
        );
      }
    }
  }

  // R6 — un diálogo hacia la página de su nivel. Lo declaran sus campos
  // `language` y `level`, y le da al diálogo la única salida que hoy no tiene:
  // volver al curso.
  const niveles = pages.filter((p) => p.kind === 'nivel');
  for (const d of dialogos) {
    for (const n of niveles) {
      if (n.targetLang !== d.targetLang || n.level !== d.level || n.userLang !== d.userLang)
        continue;
      añadir(
        out,
        d,
        n,
        'dialogo-nivel',
        PESOS['dialogo-nivel'],
        `el diálogo declara nivel ${d.level?.toUpperCase()} y esta es la página de ese nivel`,
      );
    }
  }

  // R7 — un post del blog cuyo tag nombra un idioma, y el curso de ese idioma.
  // El match tag↔idioma ya existe en src/pages/blog/[slug].astro para elegir la
  // og-image; acá se reutiliza el mismo criterio, no se inventa otro.
  //
  // Va en los dos sentidos a propósito. El blog es hoy una isla: manda 49
  // enlaces al silo y no recibe ni uno de vuelta desde una lección, aunque
  // CLAUDE.md lo llame "la herramienta SEO principal". La misma evidencia
  // justifica la ida y la vuelta.
  for (const post of blog) {
    const idiomas = languages.filter((lang) =>
      post.tags.some((t) => t.toLowerCase() === lang.name.toLowerCase()),
    );
    for (const lang of idiomas) {
      for (const c of cursos.filter((c) => c.targetLang === lang.id)) {
        añadir(
          out,
          post,
          c,
          'blog-curso',
          PESOS['blog-curso'],
          `el post lleva el tag "${lang.name}" y este es el curso de ${lang.name}`,
        );
        añadir(
          out,
          c,
          post,
          'curso-blog',
          PESOS['curso-blog'],
          `este post lleva el tag "${lang.name}", el idioma que enseña el curso`,
        );
      }
    }
  }

  return out;
}

/**
 * De todas las relaciones, las que de verdad se publicarían.
 *
 * Corta por umbral, ordena por score, y deja como mucho MAX_POR_PAGINA por
 * página, sin repetir destino ni texto de enlace. Si una página no llega al
 * umbral con nada, se queda sin bloque: no se rellena.
 */
export function proposeLinks(entrada: Entrada): Map<string, Propuesta[]> {
  const rutas = new Set(entrada.pages.map((p) => p.route));
  const porOrigen = new Map<string, Propuesta[]>();

  for (const p of buildRelations(entrada)) {
    if (p.score < UMBRAL) continue;
    if (!porOrigen.has(p.desde)) porOrigen.set(p.desde, []);
    porOrigen.get(p.desde)!.push(p);
  }

  const salida = new Map<string, Propuesta[]>();
  for (const [desde, candidatas] of porOrigen) {
    const vistos = new Set<string>();
    const anclas = new Set<string>();
    const porMotivo = new Map<Motivo, number>();
    const elegidas: Propuesta[] = [];
    // Empate: gana el destino con ruta menor, para que el resultado sea
    // determinista entre builds y el DRY RUN se pueda comparar consigo mismo.
    for (const c of candidatas.sort(
      (a, b) => b.score - a.score || a.hasta.localeCompare(b.hasta),
    )) {
      if (elegidas.length >= MAX_POR_PAGINA) break;
      if (vistos.has(c.hasta) || anclas.has(c.anchor.toLowerCase())) continue;
      const usados = porMotivo.get(c.motivo) ?? 0;
      if (usados >= (MAX_POR_MOTIVO[c.motivo] ?? MAX_POR_PAGINA)) continue;
      vistos.add(c.hasta);
      anclas.add(c.anchor.toLowerCase());
      porMotivo.set(c.motivo, usados + 1);
      elegidas.push(c);
    }
    if (elegidas.length > 0) salida.set(desde, elegidas);
  }

  // El candado: ninguna ruta propuesta puede no existir. Si esto salta, hay un
  // bug en el adaptador, y es mejor romper el build que publicar un 404.
  for (const [desde, lista] of salida) {
    if (!rutas.has(desde)) throw new Error(`Origen inexistente: ${desde}`);
    for (const p of lista) {
      if (!rutas.has(p.hasta)) throw new Error(`Destino inexistente: ${p.hasta} (desde ${desde})`);
    }
  }

  return salida;
}
