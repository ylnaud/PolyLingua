/**
 * De qué ejercicio concreto se sirve el motor para practicar una habilidad.
 *
 * Dos fuentes, en este orden:
 *
 * 1. **El banco que ya existe.** Las lecciones traen 4301 ítems escritos a
 *    mano (quiz y ejercicios). Etiquetadas con `skills`, se convierten en un
 *    banco de ejercicios reales, con contextos distintos entre sí — que es
 *    justo lo que pide el documento cuando dice que dominar una estructura no
 *    es repetir la misma frase. Escribir ejercicios nuevos habría sido
 *    ignorar el mejor material que tiene el proyecto.
 *
 * 2. **Plantillas**, solo para el modo reparación. Cuando alguien lleva cinco
 *    fallos con el mismo patrón, hace falta insistir con variaciones dirigidas
 *    ("Heute ___ ich Deutsch", "Morgen ___ ich zur Arbeit") y el banco puede
 *    no tener suficientes del mismo patrón.
 *
 * Sin DOM ni almacenamiento: recibe el banco ya cargado y devuelve ejercicios.
 */

import { profileFor } from './difficulty';
import type { Exercise, Skill } from './types';

/** Un ítem del banco, tal como lo publica la página en su manifiesto. */
export interface BankItem {
  /** Id estable del ítem: `<lessonId>#<índice>`, igual que el pool SRS. */
  id: string;
  /** `choice` | `fill-blank` | `match` | `write` | `order`, lo que entiende
   *  practiceItemMarkup.ts. */
  kind: string;
  data: any;
  /** Habilidades que ejercita, heredadas de la lección de la que sale. */
  skills: string[];
}

/** Los `kind` del sitio, traducidos a los tipos del documento. */
const KIND_TO_TYPE: Record<string, Exercise['type']> = {
  choice: 'multiple_choice',
  'fill-blank': 'fill_blank',
  match: 'match',
  write: 'write',
  order: 'reorder',
};

export interface GenerateInput {
  skill: Skill;
  difficulty: number;
  bank: BankItem[];
  /** Ids ya usados en esta sesión o en la racha actual: no se repiten, que es
   *  lo que obliga a demostrar la habilidad en contextos distintos. */
  exclude?: string[];
  random?: () => number;
}

/**
 * Elige un ejercicio para la habilidad, respetando la dificultad.
 *
 * Devuelve `null` si no hay nada disponible; quien llama decide si baja las
 * exigencias o pasa a otra habilidad. Prefiere no devolver nada antes que
 * devolver un ejercicio de otra habilidad: un ejercicio que no ejercita lo que
 * hay que practicar es peor que ninguno.
 */
export function generateExercise(input: GenerateInput): Exercise | null {
  const excluidos = new Set(input.exclude ?? []);
  const random = input.random ?? Math.random;
  const perfil = profileFor(input.difficulty);

  const delTema = input.bank.filter(
    (i) => i.skills.includes(input.skill.id) && !excluidos.has(i.id),
  );
  if (delTema.length === 0) return null;

  // Primero los del tipo que mejor le va a esta dificultad; si no hay, vale
  // cualquiera del tema: es mejor practicar la habilidad con un formato poco
  // ideal que no practicarla.
  const preferidos = delTema.filter((i) => {
    const tipo = KIND_TO_TYPE[i.kind];
    return tipo && perfil.preferredTypes.includes(tipo);
  });
  const candidatos = preferidos.length > 0 ? preferidos : delTema;

  const elegido = candidatos[Math.floor(random() * candidatos.length)];
  return toExercise(elegido, input.skill, input.difficulty);
}

/** Varios ejercicios distintos de la misma habilidad, para una tanda. */
export function generateSet(input: GenerateInput, count: number): Exercise[] {
  const out: Exercise[] = [];
  const usados = [...(input.exclude ?? [])];
  for (let i = 0; i < count; i++) {
    const ej = generateExercise({ ...input, exclude: usados });
    if (!ej) break;
    out.push(ej);
    usados.push(ej.id);
  }
  return out;
}

export function toExercise(item: BankItem, skill: Skill, difficulty: number): Exercise {
  const type = KIND_TO_TYPE[item.kind] ?? 'multiple_choice';
  const { prompt, expected, accepted, explanation, options } = extract(item);
  return {
    id: item.id,
    skillId: skill.id,
    level: skill.level,
    difficulty,
    type,
    prompt,
    expectedAnswer: expected,
    acceptedAnswers: accepted,
    explanation,
    options,
    // Se conserva la forma original para poder pintarlo con el mismo markup
    // que genera Practice.astro en build, vía practiceItemMarkup.ts.
    render: { kind: item.kind, data: item.data },
  };
}

/** Saca enunciado y respuesta de cada forma de ítem del sitio. */
function extract(item: BankItem): {
  prompt: string;
  expected: string;
  accepted: string[];
  explanation: string;
  options?: string[];
} {
  const d = item.data ?? {};
  switch (item.kind) {
    case 'choice':
      return {
        prompt: d.question ?? '',
        expected: d.options?.[d.answerIndex] ?? '',
        accepted: [d.options?.[d.answerIndex] ?? ''],
        explanation: d.explanation ?? '',
        options: d.options ?? [],
      };
    case 'fill-blank':
      return {
        prompt: d.sentence ?? '',
        expected: d.answer ?? '',
        accepted: [d.answer, ...(d.accepted ?? [])].filter(Boolean),
        explanation: d.hint ?? '',
      };
    case 'write':
      return {
        prompt: d.prompt ?? '',
        expected: d.answer ?? '',
        accepted: [d.answer, ...(d.accepted ?? [])].filter(Boolean),
        explanation: d.hint ?? '',
      };
    case 'order':
      return {
        prompt: d.translation ?? d.sentence ?? '',
        expected: d.sentence ?? '',
        accepted: [d.sentence].filter(Boolean),
        explanation: '',
      };
    case 'match':
      return {
        prompt: d.instructions ?? '',
        expected: (d.pairs ?? []).map((p: any) => `${p.left}=${p.right}`).join(', '),
        accepted: [],
        explanation: '',
      };
    default:
      return { prompt: '', expected: '', accepted: [], explanation: '' };
  }
}

/**
 * Plantillas del modo reparación.
 *
 * La idea del documento: si alguien pone el sujeto antes del verbo, no sirve
 * repetirle la misma frase, sirve hacerle producir la misma ESTRUCTURA con
 * contextos distintos hasta que el patrón quede. Por eso una plantilla es una
 * frase con un hueco y una lista de contextos que la rellenan.
 */
export interface RepairVariation {
  /** Con `kind: 'fill-blank'` (el defecto), la frase lleva `___`. Con
   *  `kind: 'order'`, es la frase completa y correcta a reconstruir. */
  sentence: string;
  answer: string;
  translation?: string;
  /** Ordenar palabras es el único formato que comprueba de verdad una
   *  habilidad de orden: un hueco en medio de la frase no obliga a colocar
   *  nada. Por eso una plantilla puede mezclar formatos. */
  kind?: 'fill-blank' | 'order';
}

export interface RepairTemplate {
  skillId: string;
  /** Explicación corta que se muestra antes, no una clase. */
  explanation: string;
  variations: RepairVariation[];
}

export const REPAIR_TEMPLATES: RepairTemplate[] = [
  {
    skillId: 'de.a1.wordorder.time-verb-subject',
    explanation:
      'En alemán el verbo va SIEMPRE en segunda posición. Si la frase empieza por el tiempo, el verbo se queda segundo y el sujeto pasa detrás: Heute **trinke ich** Kaffee.',
    variations: [
      { sentence: 'Heute ___ ich Deutsch.', answer: 'lerne', translation: 'Hoy aprendo alemán.' },
      { sentence: 'Heute ___ ich Kaffee.', answer: 'trinke', translation: 'Hoy tomo café.' },
      {
        sentence: 'Morgen ___ ich zur Arbeit.',
        answer: 'gehe',
        translation: 'Mañana voy al trabajo.',
      },
      { sentence: 'Danach ___ ich Sport.', answer: 'mache', translation: 'Después hago deporte.' },
      {
        sentence: 'Am Montag ___ ich meine Familie.',
        answer: 'besuche',
        translation: 'El lunes visito a mi familia.',
      },
      { sentence: 'Jetzt ___ ich ein Buch.', answer: 'lese', translation: 'Ahora leo un libro.' },
    ],
  },
  {
    skillId: 'de.a1.wordorder.basic',
    explanation:
      'El verbo conjugado ocupa la segunda posición de la frase. Lo que va primero puede cambiar, el verbo no se mueve.',
    variations: [
      {
        sentence: 'Ich ___ jeden Tag Deutsch.',
        answer: 'lerne',
        translation: 'Aprendo alemán todos los días.',
      },
      {
        sentence: 'Meine Schwester ___ in Berlin.',
        answer: 'wohnt',
        translation: 'Mi hermana vive en Berlín.',
      },
      {
        sentence: 'Am Wochenende ___ wir ins Kino.',
        answer: 'gehen',
        translation: 'El fin de semana vamos al cine.',
      },
      {
        sentence: 'Um acht Uhr ___ das Geschäft.',
        answer: 'öffnet',
        translation: 'A las ocho abre la tienda.',
      },
      {
        sentence: 'Im Sommer ___ ich immer nach Spanien.',
        answer: 'fahre',
        translation: 'En verano siempre voy a España.',
      },
      {
        sentence: 'Meine Eltern ___ in Hamburg.',
        answer: 'arbeiten',
        translation: 'Mis padres trabajan en Hamburgo.',
      },
    ],
  },
  {
    skillId: 'de.a1.article.der-die-das',
    explanation:
      'El artículo va con el sustantivo, no con su significado: se aprenden juntos, como una sola palabra.',
    variations: [
      { sentence: '___ Mann ist groß.', answer: 'Der', translation: 'El hombre es alto.' },
      { sentence: '___ Frau arbeitet hier.', answer: 'Die', translation: 'La mujer trabaja aquí.' },
      { sentence: '___ Kind spielt draußen.', answer: 'Das', translation: 'El niño juega afuera.' },
      { sentence: '___ Tisch ist neu.', answer: 'Der', translation: 'La mesa es nueva.' },
      { sentence: '___ Haus ist alt.', answer: 'Das', translation: 'La casa es vieja.' },
      {
        sentence: '___ Zeitung liegt hier.',
        answer: 'Die',
        translation: 'El periódico está aquí.',
      },
    ],
  },
  {
    skillId: 'de.a1.article.der',
    explanation:
      'Masculino: personas masculinas, días, meses, estaciones, puntos cardinales y las terminaciones -ig, -ismus, -ich, -ling. Ojo con las dos excepciones que rompen sus propias categorías: die Nacht y das Bier.',
    variations: [
      { sentence: '___ Montag ist frei.', answer: 'Der', translation: 'El lunes está libre.' },
      { sentence: '___ Winter ist kalt.', answer: 'Der', translation: 'El invierno es frío.' },
      { sentence: '___ Honig ist süß.', answer: 'Der', translation: 'La miel es dulce.' },
      {
        sentence: '___ Nacht ist lang.',
        answer: 'Die',
        translation: 'La noche es larga. (excepción: los demás momentos del día son der)',
      },
      { sentence: '___ Teppich ist alt.', answer: 'Der', translation: 'La alfombra es vieja.' },
      {
        sentence: '___ Bier ist kalt.',
        answer: 'Das',
        translation: 'La cerveza está fría. (excepción: las demás bebidas alcohólicas son der)',
      },
      {
        sentence: '___ Journalist schreibt.',
        answer: 'Der',
        translation: 'El periodista escribe.',
      },
      { sentence: '___ Süden ist warm.', answer: 'Der', translation: 'El sur es cálido.' },
    ],
  },
  {
    skillId: 'de.a1.article.die',
    explanation:
      'Femenino: personas femeninas y las terminaciones más fiables del idioma — -ung, -heit, -keit, -schaft, -ion, -tät, -ei, -ik, -in. La -e tira al femenino, pero der Name y der Käse son excepciones.',
    variations: [
      { sentence: '___ Zeitung ist neu.', answer: 'Die', translation: 'El periódico es nuevo.' },
      {
        sentence: '___ Freiheit ist wichtig.',
        answer: 'Die',
        translation: 'La libertad es importante.',
      },
      {
        sentence: '___ Lehrerin erklärt viel.',
        answer: 'Die',
        translation: 'La profesora explica mucho.',
      },
      { sentence: '___ Musik ist laut.', answer: 'Die', translation: 'La música está alta.' },
      {
        sentence: '___ Universität ist groß.',
        answer: 'Die',
        translation: 'La universidad es grande.',
      },
      {
        sentence: '___ Name ist schwer.',
        answer: 'Der',
        translation: 'El nombre es difícil. (excepción: -e suele ser femenino)',
      },
      {
        sentence: '___ Bäckerei öffnet früh.',
        answer: 'Die',
        translation: 'La panadería abre temprano.',
      },
      {
        sentence: '___ Nation feiert heute.',
        answer: 'Die',
        translation: 'La nación celebra hoy.',
      },
    ],
  },
  {
    skillId: 'de.a1.article.das',
    explanation:
      'Neutro: los diminutivos -chen y -lein (100% de certeza, aunque hablen de personas), -um, -nis, -ment, los préstamos internacionales y los infinitivos usados como sustantivo.',
    variations: [
      {
        sentence: '___ Mädchen liest ein Buch.',
        answer: 'Das',
        translation: 'La niña lee un libro.',
      },
      {
        sentence: '___ Brötchen ist frisch.',
        answer: 'Das',
        translation: 'El panecillo está fresco.',
      },
      { sentence: '___ Zentrum ist modern.', answer: 'Das', translation: 'El centro es moderno.' },
      { sentence: '___ Ergebnis ist gut.', answer: 'Das', translation: 'El resultado es bueno.' },
      {
        sentence: '___ Marketing funktioniert.',
        answer: 'Das',
        translation: 'El marketing funciona.',
      },
      {
        sentence: '___ Schmetterling ist schön.',
        answer: 'Der',
        translation: 'La mariposa es bonita. (-ling alemán, no el -ing inglés)',
      },
      { sentence: '___ Leben ist schön.', answer: 'Das', translation: 'La vida es bella.' },
      {
        sentence: '___ Hotel liegt im Zentrum.',
        answer: 'Das',
        translation: 'El hotel está en el centro.',
      },
    ],
  },
  {
    skillId: 'de.a1.question.words',
    explanation:
      'Cada W-Frage pide un dato distinto: wer (quién), was (qué), wo (dónde), woher (de dónde), wohin (adónde), wann (cuándo), wie (cómo) y warum (por qué).',
    variations: [
      {
        sentence: '___ heißt du? — Ich heiße Ana.',
        answer: 'Wie',
        translation: '¿Cómo te llamas?',
      },
      {
        sentence: '___ kommst du? — Aus Spanien.',
        answer: 'Woher',
        translation: '¿De dónde vienes?',
      },
      { sentence: '___ wohnst du? — In Berlin.', answer: 'Wo', translation: '¿Dónde vives?' },
      { sentence: '___ ist das? — Mein Bruder.', answer: 'Wer', translation: '¿Quién es ese?' },
      {
        sentence: '___ beginnt der Kurs? — Um acht.',
        answer: 'Wann',
        translation: '¿Cuándo empieza el curso?',
      },
      {
        sentence: '___ machst du hier? — Ich arbeite.',
        answer: 'Was',
        translation: '¿Qué haces aquí?',
      },
      {
        sentence: '___ lernst du Deutsch? — Für die Arbeit.',
        answer: 'Warum',
        translation: '¿Por qué aprendes alemán?',
      },
      { sentence: '___ gehst du? — Nach Hause.', answer: 'Wohin', translation: '¿Adónde vas?' },
    ],
  },
  {
    skillId: 'de.a1.verb.present-regular',
    explanation:
      'Presente regular: se quita el -en del infinitivo y se añade la terminación de la persona — ich -e, du -st, er/sie/es -t, wir -en, ihr -t, sie/Sie -en.',
    variations: [
      { sentence: 'Ich ___ Deutsch. (lernen)', answer: 'lerne', translation: 'Aprendo alemán.' },
      { sentence: 'Du ___ in Berlin. (wohnen)', answer: 'wohnst', translation: 'Vives en Berlín.' },
      {
        sentence: 'Er ___ Fußball. (spielen)',
        answer: 'spielt',
        translation: 'Él juega al fútbol.',
      },
      { sentence: 'Wir ___ Kaffee. (trinken)', answer: 'trinken', translation: 'Bebemos café.' },
      { sentence: 'Ihr ___ viel. (arbeiten)', answer: 'arbeitet', translation: 'Trabajáis mucho.' },
      {
        sentence: 'Die Kinder ___ nach Hause. (gehen)',
        answer: 'gehen',
        translation: 'Los niños van a casa.',
      },
      {
        sentence: 'Meine Mutter ___ gern. (kochen)',
        answer: 'kocht',
        translation: 'A mi madre le gusta cocinar.',
      },
      {
        sentence: 'Du ___ jeden Tag. (lernen)',
        answer: 'lernst',
        translation: 'Aprendes todos los días.',
      },
    ],
  },
  {
    skillId: 'de.a1.verb.present-irregular',
    explanation:
      'Algunos verbos cambian la vocal SOLO en du y en er/sie/es: e→i (sprechen → du sprichst), e→ie (lesen → du liest) y a→ä (fahren → du fährst). Las demás personas son regulares.',
    variations: [
      {
        sentence: 'Ich fahre, du ___ Auto. (fahren)',
        answer: 'fährst',
        translation: 'Yo conduzco, tú conduces.',
      },
      {
        sentence: 'Ich esse, er ___ Brot. (essen)',
        answer: 'isst',
        translation: 'Yo como, él come pan.',
      },
      {
        sentence: 'Ich lese, sie ___ ein Buch. (lesen)',
        answer: 'liest',
        translation: 'Yo leo, ella lee un libro.',
      },
      {
        sentence: 'Ich spreche, du ___ Deutsch. (sprechen)',
        answer: 'sprichst',
        translation: 'Yo hablo, tú hablas alemán.',
      },
      {
        sentence: 'Ich schlafe, er ___ lange. (schlafen)',
        answer: 'schläft',
        translation: 'Yo duermo, él duerme mucho.',
      },
      {
        sentence: 'Ich nehme, du ___ den Bus. (nehmen)',
        answer: 'nimmst',
        translation: 'Yo tomo, tú tomas el autobús.',
      },
      {
        sentence: 'Ich gebe, sie ___ mir das Buch. (geben)',
        answer: 'gibt',
        translation: 'Yo doy, ella me da el libro.',
      },
      {
        sentence: 'Wir laufen, er ___ schnell. (laufen)',
        answer: 'läuft',
        translation: 'Nosotros corremos, él corre rápido.',
      },
    ],
  },
  {
    skillId: 'de.a1.wordorder.questions',
    explanation:
      'En las preguntas con W- el orden es palabra interrogativa + verbo + sujeto. En las de sí/no el verbo se va directamente al principio.',
    variations: [
      {
        kind: 'order',
        sentence: 'Wann beginnt der Kurs',
        answer: 'Wann beginnt der Kurs',
        translation: '¿Cuándo empieza el curso?',
      },
      {
        kind: 'order',
        sentence: 'Woher kommst du',
        answer: 'Woher kommst du',
        translation: '¿De dónde vienes?',
      },
      {
        kind: 'order',
        sentence: 'Sprichst du Deutsch',
        answer: 'Sprichst du Deutsch',
        translation: '¿Hablas alemán?',
      },
      {
        kind: 'order',
        sentence: 'Wo wohnt deine Familie',
        answer: 'Wo wohnt deine Familie',
        translation: '¿Dónde vive tu familia?',
      },
      {
        kind: 'order',
        sentence: 'Hast du heute Zeit',
        answer: 'Hast du heute Zeit',
        translation: '¿Tienes tiempo hoy?',
      },
      {
        kind: 'order',
        sentence: 'Was machst du am Wochenende',
        answer: 'Was machst du am Wochenende',
        translation: '¿Qué haces el fin de semana?',
      },
    ],
  },
  {
    skillId: 'de.a1.verb.sein',
    explanation:
      'sein es irregular y hay que sabérselo de memoria: ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie/Sie sind.',
    variations: [
      { sentence: 'Ich ___ müde.', answer: 'bin', translation: 'Estoy cansado.' },
      { sentence: 'Du ___ sehr nett.', answer: 'bist', translation: 'Eres muy amable.' },
      { sentence: 'Er ___ mein Bruder.', answer: 'ist', translation: 'Él es mi hermano.' },
      { sentence: 'Wir ___ aus Spanien.', answer: 'sind', translation: 'Somos de España.' },
      { sentence: 'Ihr ___ pünktlich.', answer: 'seid', translation: 'Sois puntuales.' },
      { sentence: 'Das ___ meine Familie.', answer: 'ist', translation: 'Esta es mi familia.' },
      {
        sentence: 'Die Kinder ___ im Garten.',
        answer: 'sind',
        translation: 'Los niños están en el jardín.',
      },
      { sentence: '___ du Lehrerin?', answer: 'Bist', translation: '¿Eres profesora?' },
    ],
  },
  {
    skillId: 'de.a1.verb.haben',
    explanation:
      'haben también es irregular: ich habe, du hast, er/sie/es hat, wir haben, ihr habt, sie/Sie haben. Solo du y er/sie/es pierden la -b-.',
    variations: [
      { sentence: 'Ich ___ einen Bruder.', answer: 'habe', translation: 'Tengo un hermano.' },
      { sentence: 'Du ___ Zeit.', answer: 'hast', translation: 'Tienes tiempo.' },
      { sentence: 'Er ___ Hunger.', answer: 'hat', translation: 'Él tiene hambre.' },
      { sentence: 'Wir ___ eine Wohnung.', answer: 'haben', translation: 'Tenemos un piso.' },
      { sentence: 'Ihr ___ viele Bücher.', answer: 'habt', translation: 'Tenéis muchos libros.' },
      {
        sentence: 'Meine Schwester ___ einen Hund.',
        answer: 'hat',
        translation: 'Mi hermana tiene un perro.',
      },
      {
        sentence: 'Die Nachbarn ___ zwei Kinder.',
        answer: 'haben',
        translation: 'Los vecinos tienen dos hijos.',
      },
      { sentence: '___ du Durst?', answer: 'Hast', translation: '¿Tienes sed?' },
    ],
  },
  {
    skillId: 'de.a1.pronoun.personal',
    explanation:
      'El pronombre sigue al GÉNERO de la palabra, no a si es persona o cosa: der Tisch → er, die Zeitung → sie, das Kind → es.',
    variations: [
      {
        sentence: 'Anna ist müde. ___ schläft.',
        answer: 'Sie',
        translation: 'Anna está cansada. Ella duerme.',
      },
      {
        sentence: 'Der Tisch ist neu. ___ ist groß.',
        answer: 'Er',
        translation: 'La mesa es nueva. Es grande. (der → er, aunque sea una cosa)',
      },
      {
        sentence: 'Das Kind spielt. ___ ist glücklich.',
        answer: 'Es',
        translation: 'El niño juega. Está contento.',
      },
      {
        sentence: 'Mein Bruder und ich lernen. ___ lernen Deutsch.',
        answer: 'Wir',
        translation: 'Mi hermano y yo aprendemos alemán.',
      },
      {
        sentence: 'Die Kinder essen. ___ haben Hunger.',
        answer: 'Sie',
        translation: 'Los niños comen. Tienen hambre.',
      },
      {
        sentence: 'Die Zeitung ist alt. ___ liegt auf dem Tisch.',
        answer: 'Sie',
        translation: 'El periódico es viejo. Está sobre la mesa. (die → sie)',
      },
      { sentence: 'Peter, ___ bist spät.', answer: 'du', translation: 'Peter, llegas tarde.' },
      {
        sentence: 'Herr Müller, ___ sind sehr freundlich.',
        answer: 'Sie',
        translation: 'Señor Müller, es usted muy amable.',
      },
    ],
  },
  {
    skillId: 'de.a1.negation.nicht-kein',
    explanation:
      'kein niega sustantivos que llevan artículo indeterminado o ninguno (kein Auto, keine Zeit). nicht niega todo lo demás: verbos, adjetivos y sustantivos con artículo determinado o posesivo.',
    variations: [
      { sentence: 'Ich habe ___ Zeit.', answer: 'keine', translation: 'No tengo tiempo.' },
      { sentence: 'Das ist ___ mein Auto.', answer: 'nicht', translation: 'Ese no es mi coche.' },
      { sentence: 'Er hat ___ Hund.', answer: 'keinen', translation: 'Él no tiene perro.' },
      { sentence: 'Ich verstehe dich ___.', answer: 'nicht', translation: 'No te entiendo.' },
      { sentence: 'Wir trinken ___ Bier.', answer: 'kein', translation: 'No bebemos cerveza.' },
      {
        sentence: 'Die Suppe ist ___ warm.',
        answer: 'nicht',
        translation: 'La sopa no está caliente.',
      },
      {
        sentence: 'Sie hat ___ Geschwister.',
        answer: 'keine',
        translation: 'Ella no tiene hermanos.',
      },
      { sentence: 'Heute arbeite ich ___.', answer: 'nicht', translation: 'Hoy no trabajo.' },
    ],
  },
  {
    skillId: 'de.a1.noun.plural',
    explanation:
      'El plural alemán tiene cinco caminos (-e, -er, -(e)n, -s o sin cambio) y a veces Umlaut. Lo que nunca cambia es el artículo: en plural siempre die.',
    variations: [
      { sentence: 'der Tisch → die ___', answer: 'Tische', translation: 'la mesa → las mesas' },
      { sentence: 'das Kind → die ___', answer: 'Kinder', translation: 'el niño → los niños' },
      {
        sentence: 'die Zeitung → die ___',
        answer: 'Zeitungen',
        translation: 'el periódico → los periódicos',
      },
      { sentence: 'das Auto → die ___', answer: 'Autos', translation: 'el coche → los coches' },
      {
        sentence: 'das Mädchen → die ___',
        answer: 'Mädchen',
        translation: 'la niña → las niñas (sin cambio)',
      },
      {
        sentence: 'der Stuhl → die ___',
        answer: 'Stühle',
        translation: 'la silla → las sillas (con Umlaut)',
      },
      { sentence: 'die Frau → die ___', answer: 'Frauen', translation: 'la mujer → las mujeres' },
      {
        sentence: 'der Lehrer → die ___',
        answer: 'Lehrer',
        translation: 'el profesor → los profesores (sin cambio)',
      },
    ],
  },
  {
    skillId: 'de.a1.verb.imperative',
    explanation:
      'El imperativo de du va sin pronombre y sin la -st (du sprichst → Sprich!). El de ihr es igual que el presente (Sprecht!) y el de Sie es infinitivo + Sie (Sprechen Sie!).',
    variations: [
      {
        sentence: '___ langsam! (du, sprechen)',
        answer: 'Sprich',
        translation: '¡Habla despacio!',
      },
      {
        sentence: '___ mir bitte! (du, helfen)',
        answer: 'Hilf',
        translation: '¡Ayúdame, por favor!',
      },
      { sentence: '___ hier! (du, warten)', answer: 'Warte', translation: '¡Espera aquí!' },
      {
        sentence: '___ bitte lauter! (ihr, sprechen)',
        answer: 'Sprecht',
        translation: '¡Hablad más alto!',
      },
      {
        sentence: '___ Sie bitte Platz! (nehmen)',
        answer: 'Nehmen',
        translation: '¡Tome asiento, por favor!',
      },
      {
        sentence: '___ das Fenster auf! (du, machen)',
        answer: 'Mach',
        translation: '¡Abre la ventana!',
      },
      { sentence: '___ ruhig! (ihr, sein)', answer: 'Seid', translation: '¡Estad tranquilos!' },
      {
        sentence: '___ Sie mir bitte! (helfen)',
        answer: 'Helfen',
        translation: '¡Ayúdeme, por favor!',
      },
    ],
  },
  {
    skillId: 'de.a1.preposition.place-time',
    explanation:
      'Para el tiempo: um con la hora (um acht), am con el día (am Montag) e im con el mes o la estación (im Sommer). Para el lugar: in una ciudad o país, auf encima de algo, an junto a algo y zu/zum hacia alguien.',
    variations: [
      {
        sentence: '___ acht Uhr beginnt der Kurs.',
        answer: 'Um',
        translation: 'A las ocho empieza el curso.',
      },
      { sentence: '___ Montag habe ich frei.', answer: 'Am', translation: 'El lunes tengo libre.' },
      {
        sentence: '___ Sommer fahre ich nach Italien.',
        answer: 'Im',
        translation: 'En verano voy a Italia.',
      },
      { sentence: 'Ich wohne ___ Berlin.', answer: 'in', translation: 'Vivo en Berlín.' },
      {
        sentence: 'Das Buch liegt ___ dem Tisch.',
        answer: 'auf',
        translation: 'El libro está sobre la mesa.',
      },
      { sentence: 'Ich gehe ___ Arzt.', answer: 'zum', translation: 'Voy al médico.' },
      {
        sentence: 'Wir treffen uns ___ Bahnhof.',
        answer: 'am',
        translation: 'Nos vemos en la estación.',
      },
      {
        sentence: '___ Wochenende schlafe ich lange.',
        answer: 'Am',
        translation: 'El fin de semana duermo mucho.',
      },
    ],
  },

  // ══ A2 ═══════════════════════════════════════════════════════════════════

  {
    skillId: 'de.a2.verb.perfekt',
    explanation:
      'El Perfekt se arma con haben o sein + participio. Van con sein los verbos de movimiento (gehen, fahren, kommen) y de cambio de estado (aufstehen, bleiben, werden); todo lo demás, con haben.',
    variations: [
      {
        sentence: 'Ich ___ gestern Pizza gegessen.',
        answer: 'habe',
        translation: 'Ayer comí pizza.',
      },
      {
        sentence: 'Er ___ nach Berlin gefahren.',
        answer: 'ist',
        translation: 'Él fue a Berlín. (movimiento → sein)',
      },
      {
        sentence: 'Wir ___ einen Film gesehen.',
        answer: 'haben',
        translation: 'Vimos una película.',
      },
      {
        sentence: 'Sie ___ um acht aufgestanden.',
        answer: 'ist',
        translation: 'Ella se levantó a las ocho. (cambio de estado → sein)',
      },
      {
        sentence: 'Ich ___ zu Hause geblieben.',
        answer: 'bin',
        translation: 'Me quedé en casa. (bleiben va con sein aunque no haya movimiento)',
      },
      { sentence: 'Du ___ viel gearbeitet.', answer: 'hast', translation: 'Has trabajado mucho.' },
      {
        sentence: 'Die Kinder ___ ins Kino gegangen.',
        answer: 'sind',
        translation: 'Los niños fueron al cine.',
      },
      {
        sentence: 'Ihr ___ das Buch gelesen.',
        answer: 'habt',
        translation: 'Habéis leído el libro.',
      },
    ],
  },
  {
    skillId: 'de.a2.verb.participle',
    explanation:
      'El participio regular es ge- + raíz + -t (machen → gemacht) y el irregular ge- + raíz + -en (lesen → gelesen). Dos excepciones que se olvidan siempre: los verbos en -ieren no llevan ge- (studiert), y en los separables el ge- se mete en medio (eingekauft).',
    variations: [
      { sentence: 'machen → ich habe ___', answer: 'gemacht', translation: 'hacer → he hecho' },
      { sentence: 'lesen → ich habe ___', answer: 'gelesen', translation: 'leer → he leído' },
      {
        sentence: 'arbeiten → ich habe ___',
        answer: 'gearbeitet',
        translation: 'trabajar → he trabajado',
      },
      {
        sentence: 'fahren → ich bin ___',
        answer: 'gefahren',
        translation: 'ir en vehículo → he ido',
      },
      {
        sentence: 'studieren → ich habe ___',
        answer: 'studiert',
        translation: 'estudiar → he estudiado (los -ieren no llevan ge-)',
      },
      {
        sentence: 'einkaufen → ich habe ___',
        answer: 'eingekauft',
        translation: 'hacer la compra → he comprado (el ge- va en medio)',
      },
      { sentence: 'trinken → ich habe ___', answer: 'getrunken', translation: 'beber → he bebido' },
      {
        sentence: 'verstehen → ich habe ___',
        answer: 'verstanden',
        translation: 'entender → he entendido (prefijo inseparable: sin ge-)',
      },
    ],
  },
  {
    skillId: 'de.a2.verb.modal',
    explanation:
      'Los modales son irregulares en singular: ich y er/sie/es no llevan terminación y suelen cambiar la vocal (ich kann, ich muss, ich will). El plural es regular.',
    variations: [
      {
        sentence: 'Ich ___ gut schwimmen. (können)',
        answer: 'kann',
        translation: 'Sé nadar bien.',
      },
      {
        sentence: 'Du ___ heute arbeiten. (müssen)',
        answer: 'musst',
        translation: 'Tienes que trabajar hoy.',
      },
      {
        sentence: 'Er ___ ins Kino gehen. (wollen)',
        answer: 'will',
        translation: 'Él quiere ir al cine.',
      },
      {
        sentence: 'Wir ___ hier nicht rauchen. (dürfen)',
        answer: 'dürfen',
        translation: 'Aquí no podemos fumar.',
      },
      {
        sentence: 'Ihr ___ mehr lernen. (sollen)',
        answer: 'sollt',
        translation: 'Deberíais estudiar más.',
      },
      {
        sentence: 'Ich ___ einen Kaffee, bitte. (möchten)',
        answer: 'möchte',
        translation: 'Quisiera un café, por favor.',
      },
      {
        sentence: 'Das Kind ___ noch nicht lesen. (können)',
        answer: 'kann',
        translation: 'El niño todavía no sabe leer.',
      },
      {
        sentence: 'Die Studenten ___ viel lernen. (müssen)',
        answer: 'müssen',
        translation: 'Los estudiantes tienen que estudiar mucho.',
      },
    ],
  },
  {
    skillId: 'de.a2.wordorder.verb-final',
    explanation:
      'Cuando hay dos verbos, el conjugado se queda segundo y el otro —infinitivo o participio— se va al FINAL de la frase. Es el «sándwich» del alemán.',
    variations: [
      {
        kind: 'order',
        sentence: 'Ich kann heute nicht kommen',
        answer: 'Ich kann heute nicht kommen',
        translation: 'Hoy no puedo venir.',
      },
      {
        kind: 'order',
        sentence: 'Wir haben einen Film gesehen',
        answer: 'Wir haben einen Film gesehen',
        translation: 'Hemos visto una película.',
      },
      {
        kind: 'order',
        sentence: 'Er muss morgen früh aufstehen',
        answer: 'Er muss morgen früh aufstehen',
        translation: 'Mañana tiene que levantarse temprano.',
      },
      {
        kind: 'order',
        sentence: 'Ich habe gestern Pizza gegessen',
        answer: 'Ich habe gestern Pizza gegessen',
        translation: 'Ayer comí pizza.',
      },
      {
        kind: 'order',
        sentence: 'Sie will nach Berlin fahren',
        answer: 'Sie will nach Berlin fahren',
        translation: 'Ella quiere ir a Berlín.',
      },
      {
        kind: 'order',
        sentence: 'Ich möchte einen Kaffee trinken',
        answer: 'Ich möchte einen Kaffee trinken',
        translation: 'Quiero tomar un café.',
      },
    ],
  },
  {
    skillId: 'de.a2.verb.separable',
    explanation:
      'En presente el prefijo se despega del verbo y salta al final de la frase: aufstehen → ich stehe um sieben **auf**. Vuelve a pegarse en el infinitivo y en el participio.',
    variations: [
      {
        sentence: 'Ich stehe um sieben ___. (aufstehen)',
        answer: 'auf',
        translation: 'Me levanto a las siete.',
      },
      {
        sentence: 'Wir kaufen im Supermarkt ___. (einkaufen)',
        answer: 'ein',
        translation: 'Hacemos la compra en el supermercado.',
      },
      {
        sentence: 'Der Zug kommt um zehn ___. (ankommen)',
        answer: 'an',
        translation: 'El tren llega a las diez.',
      },
      {
        sentence: 'Ruf mich später ___! (anrufen)',
        answer: 'an',
        translation: '¡Llámame más tarde!',
      },
      {
        sentence: 'Machst du bitte das Fenster ___? (aufmachen)',
        answer: 'auf',
        translation: '¿Abres la ventana, por favor?',
      },
      {
        sentence: 'Sie sieht gern ___. (fernsehen)',
        answer: 'fern',
        translation: 'A ella le gusta ver la tele.',
      },
      {
        sentence: 'Wann fängt der Film ___? (anfangen)',
        answer: 'an',
        translation: '¿Cuándo empieza la película?',
      },
      {
        sentence: 'Ich ziehe morgen ___. (umziehen)',
        answer: 'um',
        translation: 'Mañana me mudo.',
      },
    ],
  },
  {
    skillId: 'de.a2.adjective.comparative',
    explanation:
      'Comparativo: adjetivo + -er (schnell → schneller). Superlativo: am + adjetivo + -sten (am schnellsten). Los cortos suelen añadir Umlaut (groß → größer) y hay cuatro irregulares: gut → besser, viel → mehr, gern → lieber, hoch → höher.',
    variations: [
      {
        sentence: 'Anna ist ___ als Peter. (schnell)',
        answer: 'schneller',
        translation: 'Anna es más rápida que Peter.',
      },
      {
        sentence: 'Berlin ist ___ als München. (groß)',
        answer: 'größer',
        translation: 'Berlín es más grande que Múnich.',
      },
      {
        sentence: 'Das ist der ___ Film. (gut)',
        answer: 'beste',
        translation: 'Esa es la mejor película.',
      },
      {
        sentence: 'Ich trinke ___ Kaffee als Tee. (gern)',
        answer: 'lieber',
        translation: 'Prefiero el café al té.',
      },
      {
        sentence: 'Er läuft am ___. (schnell)',
        answer: 'schnellsten',
        translation: 'Él es el que corre más rápido.',
      },
      {
        sentence: 'Heute ist es ___ als gestern. (warm)',
        answer: 'wärmer',
        translation: 'Hoy hace más calor que ayer.',
      },
      {
        sentence: 'Das Auto ist ___ als das Fahrrad. (teuer)',
        answer: 'teurer',
        translation: 'El coche es más caro que la bici.',
      },
      {
        sentence: 'Sie hat ___ Zeit als ich. (viel)',
        answer: 'mehr',
        translation: 'Ella tiene más tiempo que yo.',
      },
    ],
  },
  {
    skillId: 'de.a2.case.akkusativ',
    explanation:
      'En Akkusativ solo cambia el masculino: der → den, ein → einen. Femenino, neutro y plural se quedan igual. Es la mejor noticia del caso alemán.',
    variations: [
      { sentence: 'Ich sehe ___ Mann. (der)', answer: 'den', translation: 'Veo al hombre.' },
      {
        sentence: 'Sie kauft ___ Zeitung. (die)',
        answer: 'die',
        translation: 'Ella compra el periódico. (el femenino no cambia)',
      },
      { sentence: 'Wir haben ___ Auto. (das)', answer: 'das', translation: 'Tenemos el coche.' },
      {
        sentence: 'Er sucht ___ Schlüssel. (ein)',
        answer: 'einen',
        translation: 'Él busca una llave.',
      },
      {
        sentence: 'Ich brauche ___ Stuhl. (der)',
        answer: 'den',
        translation: 'Necesito la silla.',
      },
      {
        sentence: 'Trinkst du ___ Kaffee? (der)',
        answer: 'den',
        translation: '¿Te tomas el café?',
      },
      { sentence: 'Sie liest ___ Buch. (das)', answer: 'das', translation: 'Ella lee el libro.' },
      {
        sentence: 'Ich kenne ___ Lehrer. (der)',
        answer: 'den',
        translation: 'Conozco al profesor.',
      },
    ],
  },
  {
    skillId: 'de.a2.case.dativ',
    explanation:
      'En Dativ cambian los tres: der → dem, die → der, das → dem, y el plural die → den (además el sustantivo suma una -n). Lo pide el objeto indirecto y verbos como helfen, danken y gehören.',
    variations: [
      {
        sentence: 'Ich gebe ___ Mann das Buch. (der)',
        answer: 'dem',
        translation: 'Le doy el libro al hombre.',
      },
      {
        sentence: 'Sie hilft ___ Frau. (die)',
        answer: 'der',
        translation: 'Ella ayuda a la mujer.',
      },
      {
        sentence: 'Wir danken ___ Kind. (das)',
        answer: 'dem',
        translation: 'Le damos las gracias al niño.',
      },
      {
        sentence: 'Er spricht mit ___ Lehrerin. (die)',
        answer: 'der',
        translation: 'Él habla con la profesora.',
      },
      {
        sentence: 'Das Buch gehört ___ Studenten. (der)',
        answer: 'dem',
        translation: 'El libro es del estudiante.',
      },
      { sentence: 'Ich fahre mit ___ Bus. (der)', answer: 'dem', translation: 'Voy en autobús.' },
      {
        sentence: 'Sie schreibt ___ Kindern einen Brief. (die, plural)',
        answer: 'den',
        translation: 'Ella les escribe una carta a los niños.',
      },
      {
        sentence: 'Nach ___ Arbeit gehe ich nach Hause. (die)',
        answer: 'der',
        translation: 'Después del trabajo me voy a casa.',
      },
    ],
  },
  {
    skillId: 'de.a2.preposition.fixed',
    explanation:
      'No se piensan, se memorizan. Siempre Akkusativ: für, durch, gegen, ohne, um. Siempre Dativ: aus, bei, mit, nach, seit, von, zu.',
    variations: [
      {
        sentence: 'Das Geschenk ist für ___ Vater. (der)',
        answer: 'den',
        translation: 'El regalo es para el padre.',
      },
      { sentence: 'Ich fahre mit ___ Zug. (der)', answer: 'dem', translation: 'Viajo en tren.' },
      {
        sentence: 'Wir gehen ohne ___ Hund spazieren. (der)',
        answer: 'den',
        translation: 'Salimos a pasear sin el perro.',
      },
      {
        sentence: 'Sie kommt aus ___ Schweiz. (die)',
        answer: 'der',
        translation: 'Ella viene de Suiza.',
      },
      {
        sentence: 'Nach ___ Kurs trinken wir Kaffee. (der)',
        answer: 'dem',
        translation: 'Después del curso tomamos café.',
      },
      {
        sentence: 'Er arbeitet bei ___ Firma. (die)',
        answer: 'der',
        translation: 'Él trabaja en la empresa.',
      },
      {
        sentence: 'Das Buch ist von ___ Lehrer. (der)',
        answer: 'dem',
        translation: 'El libro es del profesor.',
      },
      {
        sentence: 'Ich gehe durch ___ Park. (der)',
        answer: 'den',
        translation: 'Paso por el parque.',
      },
    ],
  },
  {
    skillId: 'de.a2.preposition.wechsel',
    explanation:
      'Las nueve de doble régimen se deciden con una pregunta: ¿wohin? (hay movimiento hacia un sitio) pide Akkusativ; ¿wo? (algo está quieto en un sitio) pide Dativ.',
    variations: [
      {
        sentence: 'Ich gehe in ___ Park. (der, hay movimiento)',
        answer: 'den',
        translation: 'Voy al parque. → wohin, Akkusativ',
      },
      {
        sentence: 'Ich bin in ___ Park. (der, estoy quieto)',
        answer: 'dem',
        translation: 'Estoy en el parque. → wo, Dativ',
      },
      {
        sentence: 'Das Buch liegt auf ___ Tisch. (der, está quieto)',
        answer: 'dem',
        translation: 'El libro está sobre la mesa.',
      },
      {
        sentence: 'Ich lege das Buch auf ___ Tisch. (der, hay movimiento)',
        answer: 'den',
        translation: 'Pongo el libro sobre la mesa.',
      },
      {
        sentence: 'Wir hängen das Bild an ___ Wand. (die, hay movimiento)',
        answer: 'die',
        translation: 'Colgamos el cuadro en la pared.',
      },
      {
        sentence: 'Das Bild hängt an ___ Wand. (die, está quieto)',
        answer: 'der',
        translation: 'El cuadro está colgado en la pared.',
      },
      {
        sentence: 'Die Katze springt unter ___ Bett. (das, hay movimiento)',
        answer: 'das',
        translation: 'El gato salta debajo de la cama.',
      },
      {
        sentence: 'Die Katze schläft unter ___ Bett. (das, está quieto)',
        answer: 'dem',
        translation: 'El gato duerme debajo de la cama.',
      },
    ],
  },
  {
    skillId: 'de.a2.verb.reflexive',
    explanation:
      'El pronombre reflexivo cambia con la persona: mich, dich, sich, uns, euch, sich. Solo la tercera persona y el usted usan sich, que es el que se dice de memoria.',
    variations: [
      {
        sentence: 'Ich freue ___ auf das Wochenende.',
        answer: 'mich',
        translation: 'Tengo ganas de que llegue el fin de semana.',
      },
      {
        sentence: 'Er interessiert ___ für Musik.',
        answer: 'sich',
        translation: 'A él le interesa la música.',
      },
      { sentence: 'Wir treffen ___ um acht.', answer: 'uns', translation: 'Nos vemos a las ocho.' },
      {
        sentence: 'Ihr setzt ___ auf das Sofa.',
        answer: 'euch',
        translation: 'Os sentáis en el sofá.',
      },
      {
        sentence: 'Sie erinnern ___ an den Film.',
        answer: 'sich',
        translation: 'Ellos se acuerdan de la película.',
      },
      { sentence: 'Ich ziehe ___ schnell an.', answer: 'mich', translation: 'Me visto rápido.' },
      {
        sentence: 'Wie fühlst du ___ heute?',
        answer: 'dich',
        translation: '¿Cómo te sientes hoy?',
      },
      {
        sentence: 'Das Kind wäscht ___ allein.',
        answer: 'sich',
        translation: 'El niño se lava solo.',
      },
    ],
  },
  {
    skillId: 'de.a2.pronoun.akkusativ',
    explanation:
      'Los pronombres en Akkusativ son mich, dich, ihn, sie, es, uns, euch, sie/Sie. El que más cuesta es ihn: der Mann → ihn, porque el pronombre sigue al género de la palabra.',
    variations: [
      {
        sentence: 'Kennst du Peter? — Ja, ich kenne ___.',
        answer: 'ihn',
        translation: '¿Conoces a Peter? — Sí, lo conozco.',
      },
      {
        sentence: 'Siehst du Anna? — Ja, ich sehe ___.',
        answer: 'sie',
        translation: '¿Ves a Anna? — Sí, la veo.',
      },
      {
        sentence: 'Wo ist das Buch? Ich suche ___.',
        answer: 'es',
        translation: '¿Dónde está el libro? Lo estoy buscando.',
      },
      { sentence: 'Ruf ___ bitte an! (a mí)', answer: 'mich', translation: '¡Llámame, por favor!' },
      {
        sentence: 'Ich besuche ___ morgen. (a ti)',
        answer: 'dich',
        translation: 'Mañana te visito.',
      },
      {
        sentence: 'Der Lehrer fragt ___. (a nosotros)',
        answer: 'uns',
        translation: 'El profesor nos pregunta.',
      },
      {
        sentence: 'Ich verstehe ___ nicht. (a vosotros)',
        answer: 'euch',
        translation: 'No os entiendo.',
      },
      {
        sentence: 'Die Kinder? Ich hole ___ um drei ab.',
        answer: 'sie',
        translation: '¿Los niños? Los recojo a las tres.',
      },
    ],
  },
  {
    skillId: 'de.a2.pronoun.possessive',
    explanation:
      'El posesivo se comporta como ein: sin terminación en masculino y neutro nominativo (mein Bruder, mein Auto), con -e en femenino y plural (meine Schwester), y con -en en el masculino de Akkusativ (meinen Vater).',
    variations: [
      { sentence: 'Das ist ___ Bruder. (mi)', answer: 'mein', translation: 'Este es mi hermano.' },
      {
        sentence: 'Das ist ___ Schwester. (mi)',
        answer: 'meine',
        translation: 'Esta es mi hermana.',
      },
      {
        sentence: 'Ich sehe ___ Vater. (tu, Akkusativ)',
        answer: 'deinen',
        translation: 'Veo a tu padre.',
      },
      {
        sentence: 'Wo ist ___ Auto? (su, de él)',
        answer: 'sein',
        translation: '¿Dónde está su coche?',
      },
      {
        sentence: 'Ich fahre mit ___ Mutter. (mi, Dativ)',
        answer: 'meiner',
        translation: 'Voy con mi madre.',
      },
      {
        sentence: 'Das sind ___ Kinder. (nuestros)',
        answer: 'unsere',
        translation: 'Estos son nuestros hijos.',
      },
      {
        sentence: 'Sie liebt ___ Hund. (su, de ella, Akkusativ)',
        answer: 'ihren',
        translation: 'Ella quiere a su perro.',
      },
      {
        sentence: 'Wie heißt ___ Lehrerin? (vuestra)',
        answer: 'eure',
        translation: '¿Cómo se llama vuestra profesora?',
      },
    ],
  },
  {
    skillId: 'de.a2.time.past-future',
    explanation:
      'Con el Perfekt para el pasado y el presente para el futuro alcanza para el alemán del día a día: «Morgen fahre ich nach Berlin» es futuro aunque el verbo esté en presente. Lo que marca el tiempo es la expresión temporal.',
    variations: [
      {
        sentence: '___ habe ich Deutsch gelernt. (ayer)',
        answer: 'Gestern',
        translation: 'Ayer estudié alemán.',
      },
      {
        sentence: '___ fahre ich nach Berlin. (mañana)',
        answer: 'Morgen',
        translation: 'Mañana voy a Berlín.',
      },
      {
        sentence: 'Nächste Woche ___ ich meine Familie. (besuchen)',
        answer: 'besuche',
        translation: 'La semana que viene visito a mi familia.',
      },
      {
        sentence: 'Letzten Sommer ___ wir in Italien. (sein)',
        answer: 'waren',
        translation: 'El verano pasado estuvimos en Italia.',
      },
      {
        sentence: '___ Jahr habe ich Deutsch angefangen. (el año pasado)',
        answer: 'Letztes',
        translation: 'El año pasado empecé con el alemán.',
      },
      {
        sentence: '___ Woche war ich krank. (la semana pasada)',
        answer: 'Letzte',
        translation: 'La semana pasada estuve enfermo.',
      },
      {
        sentence: 'In zwei Tagen ___ der Kurs. (beginnen)',
        answer: 'beginnt',
        translation: 'El curso empieza en dos días.',
      },
      {
        sentence: 'Heute Abend ___ ich einen Film. (sehen)',
        answer: 'sehe',
        translation: 'Esta noche veo una película.',
      },
    ],
  },

  // ══ B1 ═══════════════════════════════════════════════════════════════════

  {
    skillId: 'de.b1.wordorder.subordinate',
    explanation:
      'Toda conjunción subordinante (weil, dass, obwohl, wenn) manda el verbo conjugado al FINAL de su parte de la frase. Si hay dos verbos, el conjugado va el último de todos: «…weil sie arbeiten muss».',
    variations: [
      {
        kind: 'order',
        sentence: 'Ich bleibe zu Hause, weil ich krank bin',
        answer: 'Ich bleibe zu Hause, weil ich krank bin',
        translation: 'Me quedo en casa porque estoy enfermo.',
      },
      {
        kind: 'order',
        sentence: 'Er sagt, dass er morgen kommt',
        answer: 'Er sagt, dass er morgen kommt',
        translation: 'Dice que viene mañana.',
      },
      {
        kind: 'order',
        sentence: 'Obwohl es regnet, gehen wir spazieren',
        answer: 'Obwohl es regnet, gehen wir spazieren',
        translation: 'Aunque llueve, salimos a pasear.',
      },
      {
        kind: 'order',
        sentence: 'Wenn ich Zeit habe, lese ich ein Buch',
        answer: 'Wenn ich Zeit habe, lese ich ein Buch',
        translation: 'Cuando tengo tiempo, leo un libro.',
      },
      {
        kind: 'order',
        sentence: 'Ich weiß, dass du Recht hast',
        answer: 'Ich weiß, dass du Recht hast',
        translation: 'Sé que tienes razón.',
      },
      {
        kind: 'order',
        sentence: 'Sie kommt nicht, weil sie arbeiten muss',
        answer: 'Sie kommt nicht, weil sie arbeiten muss',
        translation: 'No viene porque tiene que trabajar.',
      },
    ],
  },
  {
    skillId: 'de.b1.conjunction.subordinating',
    explanation:
      'weil = porque (la causa), dass = que (el contenido), obwohl = aunque (el contraste), wenn = cuando o si (la condición). Las cuatro mandan el verbo al final; ojo con denn, que también significa «porque» pero NO lo manda.',
    variations: [
      {
        sentence: 'Ich lerne Deutsch, ___ ich in Berlin arbeiten will.',
        answer: 'weil',
        translation: 'Aprendo alemán porque quiero trabajar en Berlín.',
      },
      {
        sentence: 'Ich glaube, ___ er Recht hat.',
        answer: 'dass',
        translation: 'Creo que tiene razón.',
      },
      {
        sentence: '___ es regnet, gehen wir spazieren.',
        answer: 'Obwohl',
        translation: 'Aunque llueve, salimos a pasear.',
      },
      {
        sentence: '___ ich Zeit habe, rufe ich dich an.',
        answer: 'Wenn',
        translation: 'Cuando tenga tiempo, te llamo.',
      },
      {
        sentence: 'Sie ist müde, ___ sie viel gearbeitet hat.',
        answer: 'weil',
        translation: 'Está cansada porque ha trabajado mucho.',
      },
      {
        sentence: 'Es ist schade, ___ du nicht kommen kannst.',
        answer: 'dass',
        translation: 'Es una pena que no puedas venir.',
      },
      {
        sentence: '___ er krank ist, geht er zur Arbeit.',
        answer: 'Obwohl',
        translation: 'Aunque está enfermo, va a trabajar.',
      },
      {
        sentence: '___ du fertig bist, sag mir Bescheid.',
        answer: 'Wenn',
        translation: 'Cuando termines, avísame.',
      },
    ],
  },
  {
    skillId: 'de.b1.verb.praeteritum',
    explanation:
      'El Präteritum es el pasado de los libros y las noticias, pero sein, haben y los modales lo usan también al hablar. Regulares: raíz + -te (machen → machte). Irregulares: cambian la vocal y no llevan -te (gehen → ging).',
    variations: [
      {
        sentence: 'Gestern ___ ich krank. (sein)',
        answer: 'war',
        translation: 'Ayer estuve enfermo.',
      },
      {
        sentence: 'Wir ___ keine Zeit. (haben)',
        answer: 'hatten',
        translation: 'No teníamos tiempo.',
      },
      { sentence: 'Er ___ nach Hause. (gehen)', answer: 'ging', translation: 'Él se fue a casa.' },
      {
        sentence: 'Sie ___ das ganze Buch. (lesen)',
        answer: 'las',
        translation: 'Ella leyó el libro entero.',
      },
      { sentence: 'Ich ___ das nicht. (können)', answer: 'konnte', translation: 'Yo no podía.' },
      {
        sentence: 'Das Kind ___ die Aufgabe. (machen)',
        answer: 'machte',
        translation: 'El niño hizo la tarea.',
      },
      {
        sentence: 'Wir ___ nach Berlin. (fahren)',
        answer: 'fuhren',
        translation: 'Fuimos a Berlín.',
      },
      {
        sentence: 'Er ___ mir einen Brief. (schreiben)',
        answer: 'schrieb',
        translation: 'Él me escribió una carta.',
      },
    ],
  },
  {
    skillId: 'de.b1.clause.relative',
    explanation:
      'El pronombre relativo toma el GÉNERO de la palabra a la que se refiere, pero el CASO de su función dentro de la subordinada: der Mann, **der** hier arbeitet (sujeto) frente a der Mann, **den** ich sehe (objeto).',
    variations: [
      {
        sentence: 'Das ist der Mann, ___ hier arbeitet.',
        answer: 'der',
        translation: 'Ese es el hombre que trabaja aquí. (sujeto)',
      },
      {
        sentence: 'Das ist der Mann, ___ ich gestern gesehen habe.',
        answer: 'den',
        translation: 'Ese es el hombre al que vi ayer. (objeto → Akkusativ)',
      },
      {
        sentence: 'Das ist die Frau, ___ mir geholfen hat.',
        answer: 'die',
        translation: 'Esa es la mujer que me ayudó.',
      },
      {
        sentence: 'Das ist das Buch, ___ ich gerade lese.',
        answer: 'das',
        translation: 'Ese es el libro que estoy leyendo.',
      },
      {
        sentence: 'Das ist der Freund, ___ ich das Buch gegeben habe.',
        answer: 'dem',
        translation: 'Ese es el amigo al que le di el libro. (Dativ)',
      },
      {
        sentence: 'Kennst du die Leute, ___ dort stehen?',
        answer: 'die',
        translation: '¿Conoces a la gente que está ahí?',
      },
      {
        sentence: 'Das ist die Stadt, in ___ ich wohne.',
        answer: 'der',
        translation: 'Esa es la ciudad en la que vivo.',
      },
      {
        sentence: 'Das ist das Auto, ___ meinem Bruder gehört.',
        answer: 'das',
        translation: 'Ese es el coche que es de mi hermano.',
      },
    ],
  },
  {
    skillId: 'de.b1.clause.indirect-question',
    explanation:
      'La pregunta indirecta pierde la inversión y manda el verbo al final. Si la directa era de sí o no, se introduce con ob; si tenía palabra W, esa misma palabra hace de conjunción.',
    variations: [
      {
        sentence: 'Weißt du, ___ er heute kommt? (sí/no)',
        answer: 'ob',
        translation: '¿Sabes si viene hoy?',
      },
      {
        sentence: 'Ich weiß nicht, ___ er wohnt. (dónde)',
        answer: 'wo',
        translation: 'No sé dónde vive.',
      },
      {
        sentence: 'Kannst du mir sagen, ___ der Zug fährt? (cuándo)',
        answer: 'wann',
        translation: '¿Puedes decirme cuándo sale el tren?',
      },
      {
        sentence: 'Sie fragt, ___ wir Zeit haben. (sí/no)',
        answer: 'ob',
        translation: 'Ella pregunta si tenemos tiempo.',
      },
      {
        sentence: 'Weißt du, ___ das Buch gehört? (a quién)',
        answer: 'wem',
        translation: '¿Sabes de quién es el libro?',
      },
      {
        sentence: 'Er will wissen, ___ du heißt. (cómo)',
        answer: 'wie',
        translation: 'Él quiere saber cómo te llamas.',
      },
      {
        sentence: 'Ich habe keine Ahnung, ___ er das gemacht hat. (por qué)',
        answer: 'warum',
        translation: 'No tengo ni idea de por qué lo hizo.',
      },
      {
        sentence: 'Sag mir bitte, ___ du am Wochenende machst. (qué)',
        answer: 'was',
        translation: 'Dime qué haces el fin de semana.',
      },
    ],
  },
  {
    skillId: 'de.b1.clause.final',
    explanation:
      'um…zu cuando el sujeto es el MISMO en las dos partes; damit cuando cambia. «Ich lerne, um zu arbeiten» (yo y yo) frente a «Ich spreche langsam, damit du mich verstehst» (yo y vos).',
    variations: [
      {
        sentence: 'Ich lerne Deutsch, ___ in Berlin zu arbeiten.',
        answer: 'um',
        translation: 'Aprendo alemán para trabajar en Berlín. (mismo sujeto)',
      },
      {
        sentence: 'Ich spreche langsam, ___ du mich verstehst.',
        answer: 'damit',
        translation: 'Hablo despacio para que me entiendas. (cambia el sujeto)',
      },
      {
        sentence: 'Sie geht früh los, ___ pünktlich zu sein.',
        answer: 'um',
        translation: 'Sale temprano para llegar puntual.',
      },
      {
        sentence: 'Er erklärt es noch einmal, ___ alle es verstehen.',
        answer: 'damit',
        translation: 'Lo explica otra vez para que todos lo entiendan.',
      },
      {
        sentence: 'Wir sparen Geld, ___ eine Reise zu machen.',
        answer: 'um',
        translation: 'Ahorramos dinero para hacer un viaje.',
      },
      {
        sentence: 'Ich schreibe es auf, ___ ich es nicht vergesse.',
        answer: 'damit',
        translation: 'Lo apunto para no olvidarlo.',
      },
      {
        sentence: 'Sie ruft an, ___ einen Termin zu vereinbaren.',
        answer: 'um',
        translation: 'Llama para concertar una cita.',
      },
      {
        sentence: 'Ich mache das Fenster auf, ___ es nicht so warm ist.',
        answer: 'damit',
        translation: 'Abro la ventana para que no haga tanto calor.',
      },
    ],
  },
  {
    skillId: 'de.b1.case.genitiv',
    explanation:
      'El Genitiv es la posesión formal. Masculino y neutro: des + una -(e)s en el sustantivo (des Mannes). Femenino y plural: der. Al hablar se sustituye casi siempre por von + Dativ.',
    variations: [
      {
        sentence: 'Das Auto ___ Mannes ist neu. (der Mann)',
        answer: 'des',
        translation: 'El coche del hombre es nuevo.',
      },
      {
        sentence: 'Die Farbe ___ Hauses gefällt mir. (das Haus)',
        answer: 'des',
        translation: 'Me gusta el color de la casa.',
      },
      {
        sentence: 'Das Ende ___ Geschichte war traurig. (die Geschichte)',
        answer: 'der',
        translation: 'El final de la historia fue triste.',
      },
      {
        sentence: 'Die Meinung ___ Leute ist wichtig. (die Leute)',
        answer: 'der',
        translation: 'La opinión de la gente es importante.',
      },
      {
        sentence: 'Trotz ___ Regens gehe ich spazieren. (der Regen)',
        answer: 'des',
        translation: 'A pesar de la lluvia salgo a pasear.',
      },
      {
        sentence: 'Während ___ Woche arbeite ich. (die Woche)',
        answer: 'der',
        translation: 'Durante la semana trabajo.',
      },
      {
        sentence: 'Wegen ___ Wetters bleiben wir zu Hause. (das Wetter)',
        answer: 'des',
        translation: 'Por el tiempo nos quedamos en casa.',
      },
      {
        sentence: 'Das ist das Büro ___ Chefin. (die Chefin)',
        answer: 'der',
        translation: 'Esa es la oficina de la jefa.',
      },
    ],
  },
  {
    skillId: 'de.b1.adjective.declension',
    explanation:
      'La terminación depende de si el artículo ya marca el género. Con der/die/das ya está marcado y el adjetivo se relaja (-e o -en); con ein/kein/mein el adjetivo tiene que marcarlo él: ein gut**er** Mann, ein gut**es** Kind.',
    variations: [
      {
        sentence: 'Der ___ Mann kommt. (gut)',
        answer: 'gute',
        translation: 'El hombre bueno viene.',
      },
      {
        sentence: 'Ein ___ Mann kommt. (gut)',
        answer: 'guter',
        translation: 'Un hombre bueno viene. (ein no marca el masculino: lo marca el adjetivo)',
      },
      {
        sentence: 'Das ___ Kind spielt. (klein)',
        answer: 'kleine',
        translation: 'El niño pequeño juega.',
      },
      {
        sentence: 'Ein ___ Kind spielt. (klein)',
        answer: 'kleines',
        translation: 'Un niño pequeño juega.',
      },
      {
        sentence: 'Ich sehe den ___ Hund. (groß)',
        answer: 'großen',
        translation: 'Veo al perro grande.',
      },
      {
        sentence: 'Sie hat eine ___ Wohnung. (schön)',
        answer: 'schöne',
        translation: 'Ella tiene un piso bonito.',
      },
      {
        sentence: 'Wir wohnen in einem ___ Haus. (alt)',
        answer: 'alten',
        translation: 'Vivimos en una casa vieja.',
      },
      {
        sentence: 'Die ___ Bücher sind teuer. (neu)',
        answer: 'neuen',
        translation: 'Los libros nuevos son caros.',
      },
    ],
  },
  {
    skillId: 'de.b1.verb.konjunktiv2',
    explanation:
      'wäre, hätte y könnte son la versión educada de sein, haben y können. No son pasado: sirven para pedir sin sonar brusco y para hablar de lo hipotético.',
    variations: [
      {
        sentence: '___ Sie so nett, mir zu helfen? (sein)',
        answer: 'Wären',
        translation: '¿Sería tan amable de ayudarme?',
      },
      {
        sentence: '___ ich bitte die Rechnung? (haben)',
        answer: 'Hätte',
        translation: '¿Me trae la cuenta, por favor?',
      },
      {
        sentence: '___ Sie mir bitte helfen? (können)',
        answer: 'Könnten',
        translation: '¿Podría ayudarme, por favor?',
      },
      {
        sentence: 'Das ___ sehr nett. (sein)',
        answer: 'wäre',
        translation: 'Eso sería muy amable.',
      },
      {
        sentence: 'Ich ___ gern ein Zimmer mit Blick. (haben)',
        answer: 'hätte',
        translation: 'Querría una habitación con vistas.',
      },
      {
        sentence: '___ du mir kurz helfen? (können)',
        answer: 'Könntest',
        translation: '¿Me echarías una mano un momento?',
      },
      {
        sentence: 'Es ___ schön, wenn du kommst. (sein)',
        answer: 'wäre',
        translation: 'Sería bonito que vinieras.',
      },
      {
        sentence: 'Wir ___ gern reserviert. (haben)',
        answer: 'hätten',
        translation: 'Nos gustaría haber reservado.',
      },
    ],
  },
  {
    skillId: 'de.b1.verb.konjunktiv2-wuerde',
    explanation:
      'Para casi todos los verbos el Konjunktiv II se arma con würde + infinitivo al final. Solo sein, haben y los modales tienen forma propia (wäre, hätte, könnte); con el resto, würde.',
    variations: [
      {
        sentence: 'Ich ___ mich über eine Lösung freuen.',
        answer: 'würde',
        translation: 'Me alegraría que hubiera una solución.',
      },
      {
        sentence: '___ Sie mir bitte eine Antwort geben?',
        answer: 'Würden',
        translation: '¿Me daría una respuesta, por favor?',
      },
      {
        sentence: 'Wir ___ gern ein anderes Zimmer bekommen.',
        answer: 'würden',
        translation: 'Nos gustaría que nos dieran otra habitación.',
      },
      {
        sentence: '___ du das für mich machen?',
        answer: 'Würdest',
        translation: '¿Harías eso por mí?',
      },
      {
        sentence: 'Er ___ nie so etwas sagen.',
        answer: 'würde',
        translation: 'Él nunca diría algo así.',
      },
      {
        sentence: 'Ich ___ lieber morgen kommen.',
        answer: 'würde',
        translation: 'Preferiría venir mañana.',
      },
      {
        sentence: 'Die Gäste ___ sich sehr freuen.',
        answer: 'würden',
        translation: 'Los huéspedes se alegrarían mucho.',
      },
      {
        sentence: '___ ihr mir bitte helfen?',
        answer: 'Würdet',
        translation: '¿Me ayudaríais, por favor?',
      },
    ],
  },
  {
    skillId: 'de.b1.verb.perfekt-zustand',
    explanation:
      'haben + participio cuenta la ACCIÓN: «ich habe das Fenster geöffnet». sein + participio describe el ESTADO que quedó: «das Fenster ist geöffnet». La forma es casi la misma; lo que cambia es de qué se está hablando.',
    variations: [
      {
        sentence: 'Ich ___ das Fenster geöffnet. (la acción)',
        answer: 'habe',
        translation: 'He abierto la ventana.',
      },
      {
        sentence: 'Das Fenster ___ geöffnet. (el estado)',
        answer: 'ist',
        translation: 'La ventana está abierta.',
      },
      {
        sentence: 'Wir ___ das Problem gelöst. (la acción)',
        answer: 'haben',
        translation: 'Hemos resuelto el problema.',
      },
      {
        sentence: 'Das Problem ___ gelöst. (el estado)',
        answer: 'ist',
        translation: 'El problema está resuelto.',
      },
      {
        sentence: 'Der Kellner ___ den Tisch reserviert. (la acción)',
        answer: 'hat',
        translation: 'El camarero ha reservado la mesa.',
      },
      {
        sentence: 'Der Tisch ___ reserviert. (el estado)',
        answer: 'ist',
        translation: 'La mesa está reservada.',
      },
      {
        sentence: 'Sie ___ die Tür geschlossen. (la acción)',
        answer: 'hat',
        translation: 'Ella ha cerrado la puerta.',
      },
      {
        sentence: 'Die Tür ___ geschlossen. (el estado)',
        answer: 'ist',
        translation: 'La puerta está cerrada.',
      },
    ],
  },
  {
    skillId: 'de.b1.adverb.direction',
    explanation:
      'hin = allá (el movimiento se aleja del que habla), her = acá (se acerca). Y da- + preposición sustituye a «preposición + eso»: dahinter es «detrás de eso». Si la preposición empieza por vocal, entre medio va una -r-: darüber, darunter.',
    variations: [
      {
        sentence: 'Komm ___! Hier ist es warm. (quien habla está adentro)',
        answer: 'herein',
        translation: '¡Entrá! Acá hace calor.',
      },
      {
        sentence: 'Geh ___! Ich warte draußen. (quien habla está afuera)',
        answer: 'hinein',
        translation: '¡Entrá! Yo espero afuera.',
      },
      {
        sentence: 'Ich gehe die Treppe ___. (subo alejándome)',
        answer: 'hinauf',
        translation: 'Subo la escalera.',
      },
      {
        sentence: 'Das Haus ist schön, der Garten liegt ___. (detrás de eso)',
        answer: 'dahinter',
        translation: 'La casa es bonita, el jardín está detrás.',
      },
      {
        sentence: 'Ein Bild hängt ___. (encima de eso)',
        answer: 'darüber',
        translation: 'Hay un cuadro colgado encima.',
      },
      {
        sentence: 'Die Schuhe sind ___. (debajo de eso)',
        answer: 'darunter',
        translation: 'Los zapatos están debajo.',
      },
      {
        sentence: 'Komm ___! Ich bin auf dieser Seite. (hacia este lado)',
        answer: 'herüber',
        translation: '¡Vení para acá! Estoy de este lado.',
      },
      {
        sentence: 'Stelle die Tasche ___. (al lado de eso)',
        answer: 'daneben',
        translation: 'Poné la bolsa al lado.',
      },
    ],
  },
  {
    skillId: 'de.b1.verb.with-preposition',
    explanation:
      'Cada verbo se casa con una preposición y hay que memorizar la pareja entera: warten auf, denken an, sich freuen über, sich interessieren für, Angst haben vor. La preposición no se deduce de la del español.',
    variations: [
      { sentence: 'Ich warte ___ den Bus.', answer: 'auf', translation: 'Espero el autobús.' },
      { sentence: 'Denkst du ___ mich?', answer: 'an', translation: '¿Piensas en mí?' },
      {
        sentence: 'Sie freut sich ___ das Geschenk.',
        answer: 'über',
        translation: 'Ella se alegra por el regalo.',
      },
      {
        sentence: 'Er interessiert sich ___ Musik.',
        answer: 'für',
        translation: 'A él le interesa la música.',
      },
      {
        sentence: 'Ich spreche ___ meinem Chef.',
        answer: 'mit',
        translation: 'Hablo con mi jefe.',
      },
      {
        sentence: 'Wir hoffen ___ gutes Wetter.',
        answer: 'auf',
        translation: 'Esperamos que haga buen tiempo.',
      },
      {
        sentence: 'Sie hat Angst ___ Hunden.',
        answer: 'vor',
        translation: 'Ella tiene miedo a los perros.',
      },
      {
        sentence: 'Ich bedanke mich ___ deine Hilfe.',
        answer: 'für',
        translation: 'Te doy las gracias por tu ayuda.',
      },
    ],
  },

  // ══ B2 ═══════════════════════════════════════════════════════════════════

  {
    skillId: 'de.b2.verb.futur',
    explanation:
      'Futur I: werden + infinitivo al final. Futur II: werden + participio + haben/sein, para suponer algo que ya pasó. En el día a día el futuro se dice con presente; el Futur I sirve sobre todo para promesas y pronósticos.',
    variations: [
      {
        sentence: 'Ich ___ dich morgen anrufen.',
        answer: 'werde',
        translation: 'Te llamaré mañana.',
      },
      { sentence: '___ du mir helfen?', answer: 'Wirst', translation: '¿Me ayudarás?' },
      { sentence: 'Es ___ morgen regnen.', answer: 'wird', translation: 'Mañana lloverá.' },
      {
        sentence: 'Wir ___ nächstes Jahr umziehen.',
        answer: 'werden',
        translation: 'El año que viene nos mudaremos.',
      },
      {
        sentence: 'Sie ___ das sicher schaffen.',
        answer: 'wird',
        translation: 'Seguro que lo consigue.',
      },
      {
        sentence: 'Ihr ___ euch bestimmt freuen.',
        answer: 'werdet',
        translation: 'Seguro que os alegraréis.',
      },
      {
        sentence: 'Er wird den Termin vergessen ___. (Futur II)',
        answer: 'haben',
        translation: 'Se habrá olvidado de la cita.',
      },
      {
        sentence: 'Sie wird schon nach Hause gegangen ___. (Futur II)',
        answer: 'sein',
        translation: 'Ya se habrá ido a casa.',
      },
    ],
  },
  {
    skillId: 'de.b2.clause.conditional-irreal',
    explanation:
      'El condicional irreal lleva Konjunktiv II en las DOS partes: «Wenn ich Zeit hätte, würde ich kommen». Para lo que ya no tiene arreglo se arma con hätte o wäre + participio: «Wenn ich Zeit gehabt hätte, wäre ich gekommen».',
    variations: [
      {
        sentence: 'Wenn ich Zeit ___, würde ich kommen. (haben)',
        answer: 'hätte',
        translation: 'Si tuviera tiempo, iría.',
      },
      {
        sentence: 'Wenn ich reich ___, würde ich viel reisen. (sein)',
        answer: 'wäre',
        translation: 'Si fuera rico, viajaría mucho.',
      },
      {
        sentence: 'Wenn du früher gekommen ___, hättest du ihn getroffen. (sein)',
        answer: 'wärst',
        translation: 'Si hubieras venido antes, lo habrías visto.',
      },
      {
        sentence: 'Wenn wir mehr Geld ___, würden wir ein Haus kaufen. (haben)',
        answer: 'hätten',
        translation: 'Si tuviéramos más dinero, compraríamos una casa.',
      },
      {
        sentence: 'Ich ___ dir helfen, wenn ich könnte. (werden)',
        answer: 'würde',
        translation: 'Te ayudaría si pudiera.',
      },
      {
        sentence: 'Wenn ich das gewusst ___, hätte ich nichts gesagt. (haben)',
        answer: 'hätte',
        translation: 'Si lo hubiera sabido, no habría dicho nada.',
      },
      {
        sentence: 'An deiner Stelle ___ ich das nicht machen. (werden)',
        answer: 'würde',
        translation: 'Yo en tu lugar no lo haría.',
      },
      {
        sentence: 'Wenn er nicht krank ___, wäre er gekommen. (sein)',
        answer: 'wäre',
        translation: 'Si no hubiera estado enfermo, habría venido.',
      },
    ],
  },
  {
    skillId: 'de.b2.voice.passive',
    explanation:
      'La pasiva se arma con werden + participio al final: «Das Haus wird gebaut». En pasado, wurde; en Perfekt, ist + participio + worden. Quien hace la acción, si aparece, va con von.',
    variations: [
      {
        sentence: 'Das Haus ___ gerade gebaut.',
        answer: 'wird',
        translation: 'La casa se está construyendo.',
      },
      {
        sentence: 'Die Briefe ___ jeden Tag geschrieben.',
        answer: 'werden',
        translation: 'Las cartas se escriben todos los días.',
      },
      {
        sentence: 'Das Auto ___ gestern repariert. (pasado)',
        answer: 'wurde',
        translation: 'El coche se reparó ayer.',
      },
      {
        sentence: 'Die Fenster ___ letzte Woche geputzt. (pasado)',
        answer: 'wurden',
        translation: 'Las ventanas se limpiaron la semana pasada.',
      },
      {
        sentence: 'Der Vertrag ist gestern unterschrieben ___. (Perfekt)',
        answer: 'worden',
        translation: 'El contrato se firmó ayer.',
      },
      { sentence: 'Hier ___ nicht geraucht.', answer: 'wird', translation: 'Aquí no se fuma.' },
      {
        sentence: 'Das Problem ___ von den Technikern gelöst.',
        answer: 'wird',
        translation: 'El problema lo resuelven los técnicos.',
      },
      {
        sentence: 'Die Rechnung ___ schon bezahlt. (pasado)',
        answer: 'wurde',
        translation: 'La factura ya se pagó.',
      },
    ],
  },
  {
    skillId: 'de.b2.voice.zustandspassiv',
    explanation:
      'werden + participio es el PROCESO (das Fenster wird geöffnet: lo están abriendo); sein + participio es el ESTADO que queda (das Fenster ist geöffnet: está abierto). La frase se parece; lo que cambia es de qué se habla.',
    variations: [
      {
        sentence: 'Das Geschäft ___ um acht geöffnet. (el proceso)',
        answer: 'wird',
        translation: 'La tienda se abre a las ocho.',
      },
      {
        sentence: 'Das Geschäft ___ jetzt geöffnet. (el estado)',
        answer: 'ist',
        translation: 'La tienda está abierta ahora.',
      },
      {
        sentence: 'Der Brief ___ gerade geschrieben. (el proceso)',
        answer: 'wird',
        translation: 'La carta se está escribiendo.',
      },
      {
        sentence: 'Der Brief ___ schon geschrieben. (el estado)',
        answer: 'ist',
        translation: 'La carta ya está escrita.',
      },
      {
        sentence: 'Die Tür ___ abgeschlossen. (el estado)',
        answer: 'ist',
        translation: 'La puerta está cerrada con llave.',
      },
      {
        sentence: 'Die Tür ___ jeden Abend abgeschlossen. (el proceso)',
        answer: 'wird',
        translation: 'La puerta se cierra con llave cada noche.',
      },
      {
        sentence: 'Das Essen ___ schon vorbereitet. (el estado)',
        answer: 'ist',
        translation: 'La comida ya está lista.',
      },
      {
        sentence: 'Das Essen ___ gerade vorbereitet. (el proceso)',
        answer: 'wird',
        translation: 'La comida se está preparando.',
      },
    ],
  },
  {
    skillId: 'de.b2.connector.discourse',
    explanation:
      'deshalb, deswegen, trotzdem y allerdings NO son subordinantes: van primeros y el verbo se queda segundo. «Es regnet. Deshalb bleibe ich zu Hause» — nunca «deshalb ich bleibe».',
    variations: [
      {
        sentence: 'Es regnet. ___ bleibe ich zu Hause. (por eso)',
        answer: 'Deshalb',
        translation: 'Llueve. Por eso me quedo en casa.',
      },
      {
        sentence: 'Er hat viel gelernt. ___ hat er bestanden. (por eso)',
        answer: 'Deswegen',
        translation: 'Estudió mucho. Por eso aprobó.',
      },
      {
        sentence: 'Es war kalt. ___ sind wir spazieren gegangen. (aun así)',
        answer: 'Trotzdem',
        translation: 'Hacía frío. Aun así salimos a pasear.',
      },
      {
        sentence: 'Das Hotel war gut. ___ war es zu teuer. (sin embargo)',
        answer: 'Allerdings',
        translation: 'El hotel estaba bien. Sin embargo, era caro.',
      },
      {
        sentence: 'Ich habe keine Zeit. ___ helfe ich dir. (aun así)',
        answer: 'Trotzdem',
        translation: 'No tengo tiempo. Aun así te ayudo.',
      },
      {
        sentence: 'Sie ist krank. ___ kommt sie nicht. (por eso)',
        answer: 'Deshalb',
        translation: 'Está enferma. Por eso no viene.',
      },
      {
        sentence: 'Zuerst essen wir. ___ gehen wir ins Kino. (después)',
        answer: 'Danach',
        translation: 'Primero comemos. Después vamos al cine.',
      },
      {
        sentence: 'Der Zug hatte Verspätung. ___ kam ich zu spät. (por eso)',
        answer: 'Deswegen',
        translation: 'El tren llegó tarde. Por eso llegué tarde.',
      },
    ],
  },
  {
    skillId: 'de.b2.conjunction.double',
    explanation:
      'Van en pareja y hay que poner las dos mitades: sowohl…als auch (tanto… como), entweder…oder (o… o), weder…noch (ni… ni), je…desto (cuanto más… más), nicht nur…sondern auch (no solo… sino también).',
    variations: [
      {
        sentence: '___ Anna als auch Peter kommen.',
        answer: 'Sowohl',
        translation: 'Vienen tanto Anna como Peter.',
      },
      {
        sentence: 'Sowohl Anna ___ auch Peter kommen.',
        answer: 'als',
        translation: 'Vienen tanto Anna como Peter.',
      },
      {
        sentence: 'Entweder gehen wir ins Kino ___ wir bleiben zu Hause.',
        answer: 'oder',
        translation: 'O vamos al cine o nos quedamos en casa.',
      },
      {
        sentence: 'Er spricht ___ Deutsch noch Englisch.',
        answer: 'weder',
        translation: 'No habla ni alemán ni inglés.',
      },
      {
        sentence: 'Je mehr ich lerne, ___ besser verstehe ich.',
        answer: 'desto',
        translation: 'Cuanto más estudio, mejor entiendo.',
      },
      {
        sentence: '___ mehr ich lerne, desto besser verstehe ich.',
        answer: 'Je',
        translation: 'Cuanto más estudio, mejor entiendo.',
      },
      {
        sentence: 'Sie ist nicht nur klug, ___ auch nett.',
        answer: 'sondern',
        translation: 'No solo es lista, sino también simpática.',
      },
      {
        sentence: 'Weder er ___ sie hat angerufen.',
        answer: 'noch',
        translation: 'Ni él ni ella han llamado.',
      },
    ],
  },
  {
    skillId: 'de.b2.preposition.genitiv',
    explanation:
      'trotz, wegen, während, aufgrund, statt e innerhalb rigen Genitiv: des en masculino y neutro, der en femenino y plural.',
    variations: [
      {
        sentence: 'Trotz ___ Regens gehen wir raus. (der Regen)',
        answer: 'des',
        translation: 'A pesar de la lluvia salimos.',
      },
      {
        sentence: 'Wegen ___ Wetters bleiben wir hier. (das Wetter)',
        answer: 'des',
        translation: 'Por el tiempo nos quedamos aquí.',
      },
      {
        sentence: 'Während ___ Woche arbeite ich viel. (die Woche)',
        answer: 'der',
        translation: 'Durante la semana trabajo mucho.',
      },
      {
        sentence: 'Aufgrund ___ Streiks fährt kein Zug. (der Streik)',
        answer: 'des',
        translation: 'A causa de la huelga no circula ningún tren.',
      },
      {
        sentence: 'Statt ___ Autos nehme ich das Fahrrad. (das Auto)',
        answer: 'des',
        translation: 'En vez del coche cojo la bici.',
      },
      {
        sentence: 'Innerhalb ___ Stadt gilt Tempo 50. (die Stadt)',
        answer: 'der',
        translation: 'Dentro de la ciudad el límite es 50.',
      },
      {
        sentence: 'Während ___ Ferien lese ich viel. (die Ferien, plural)',
        answer: 'der',
        translation: 'Durante las vacaciones leo mucho.',
      },
      {
        sentence: 'Trotz ___ Probleme war es schön. (die Probleme, plural)',
        answer: 'der',
        translation: 'A pesar de los problemas estuvo bien.',
      },
    ],
  },

  // ══ C1 ═══════════════════════════════════════════════════════════════════

  {
    skillId: 'de.c1.verb.konjunktiv1',
    explanation:
      'El Konjunktiv I marca que estás citando a alguien sin hacerte cargo de lo que dice: «Er sagt, er sei krank». Se forma con la raíz del infinitivo + -e (sei, habe, komme); cuando coincidiría con el indicativo se usa el Konjunktiv II (hätten en vez de haben).',
    variations: [
      {
        sentence: 'Er sagt, er ___ krank. (sein)',
        answer: 'sei',
        translation: 'Dice que está enfermo.',
      },
      {
        sentence: 'Sie behauptet, sie ___ keine Zeit. (haben)',
        answer: 'habe',
        translation: 'Afirma que no tiene tiempo.',
      },
      {
        sentence: 'Der Minister erklärt, er ___ nichts gewusst. (haben)',
        answer: 'habe',
        translation: 'El ministro declara que no sabía nada.',
      },
      {
        sentence: 'Man sagt, das Wetter ___ besser. (werden)',
        answer: 'werde',
        translation: 'Dicen que el tiempo va a mejorar.',
      },
      {
        sentence: 'Sie sagt, sie ___ morgen. (kommen)',
        answer: 'komme',
        translation: 'Dice que viene mañana.',
      },
      {
        sentence: 'Er meint, die Preise ___ gestiegen. (sein)',
        answer: 'seien',
        translation: 'Opina que los precios han subido.',
      },
      {
        sentence: 'Die Zeitung schreibt, die Firma ___ Verluste. (machen)',
        answer: 'mache',
        translation: 'El periódico escribe que la empresa tiene pérdidas.',
      },
      {
        sentence: 'Sie sagen, sie ___ keine Zeit. (haben, plural)',
        answer: 'hätten',
        translation:
          'Dicen que no tienen tiempo. (haben coincidiría con el indicativo → Konjunktiv II)',
      },
    ],
  },
  {
    skillId: 'de.c1.verb.modal-subjective',
    explanation:
      'Los modales también dicen cuánta seguridad tenés: müssen = casi seguro, dürfte = probable, können/könnte = posible, wollen = él lo afirma (y vos dudás), sollen = se dice por ahí.',
    variations: [
      {
        sentence: 'Er ___ krank sein, er sieht schlecht aus. (casi seguro)',
        answer: 'muss',
        translation: 'Tiene que estar enfermo, tiene mala cara.',
      },
      {
        sentence: 'Das ___ etwa 20 Euro kosten. (probable)',
        answer: 'dürfte',
        translation: 'Eso costará unos 20 euros.',
      },
      {
        sentence: 'Sie ___ recht haben, sicher bin ich nicht. (posible)',
        answer: 'könnte',
        translation: 'Podría tener razón, no estoy seguro.',
      },
      {
        sentence: 'Er ___ Millionär sein — das behauptet er. (él lo afirma)',
        answer: 'will',
        translation: 'Dice ser millonario.',
      },
      {
        sentence: 'Das Restaurant ___ sehr gut sein. (se dice)',
        answer: 'soll',
        translation: 'Dicen que el restaurante es muy bueno.',
      },
      {
        sentence: 'Sie ___ schon zu Hause sein, das Licht brennt. (casi seguro)',
        answer: 'muss',
        translation: 'Tiene que estar ya en casa, la luz está encendida.',
      },
      {
        sentence: 'Das ___ ein Fehler gewesen sein. (posible)',
        answer: 'kann',
        translation: 'Puede que haya sido un error.',
      },
      {
        sentence: 'Er ___ den Rekord gebrochen haben. (se dice)',
        answer: 'soll',
        translation: 'Dicen que batió el récord.',
      },
    ],
  },
  {
    skillId: 'de.c1.construction.participial',
    explanation:
      'El participio se coloca delante del sustantivo y se declina como un adjetivo: «die spielenden Kinder» (Partizip I, acción en curso), «das gelesene Buch» (Partizip II, acción terminada y sentido pasivo).',
    variations: [
      {
        sentence: 'die ___ Kinder (spielen, Partizip I)',
        answer: 'spielenden',
        translation: 'los niños que juegan',
      },
      {
        sentence: 'das ___ Buch (lesen, Partizip II)',
        answer: 'gelesene',
        translation: 'el libro leído',
      },
      {
        sentence: 'der ___ Zug (ankommen, Partizip I)',
        answer: 'ankommende',
        translation: 'el tren que llega',
      },
      {
        sentence: 'die ___ Tür (schließen, Partizip II)',
        answer: 'geschlossene',
        translation: 'la puerta cerrada',
      },
      {
        sentence: 'ein ___ Problem (wachsen, Partizip I)',
        answer: 'wachsendes',
        translation: 'un problema creciente',
      },
      {
        sentence: 'die ___ Ergebnisse (erwarten, Partizip II)',
        answer: 'erwarteten',
        translation: 'los resultados esperados',
      },
      {
        sentence: 'der ___ Mann (schlafen, Partizip I)',
        answer: 'schlafende',
        translation: 'el hombre que duerme',
      },
      {
        sentence: 'die ___ Frage (stellen, Partizip II)',
        answer: 'gestellte',
        translation: 'la pregunta planteada',
      },
    ],
  },
  {
    skillId: 'de.c1.construction.funktionsverb',
    explanation:
      'Son parejas fijas de verbo + sustantivo que sustituyen a un verbo simple: «in Frage stellen» (cuestionar), «zur Verfügung stehen» (estar a disposición). El verbo pierde su significado propio y lo aporta el sustantivo.',
    variations: [
      {
        sentence: 'Das stelle ich ___ Frage. (cuestionar)',
        answer: 'in',
        translation: 'Eso lo cuestiono.',
      },
      {
        sentence: 'Die Unterlagen stehen Ihnen ___ Verfügung. (estar a disposición)',
        answer: 'zur',
        translation: 'La documentación está a su disposición.',
      },
      {
        sentence: 'Wir nehmen Bezug ___ die Ergebnisse. (hacer referencia a)',
        answer: 'auf',
        translation: 'Nos remitimos a los resultados.',
      },
      {
        sentence: 'Er bringt den Vorschlag ___ Sprache. (sacar el tema)',
        answer: 'zur',
        translation: 'Él saca el tema de la propuesta.',
      },
      {
        sentence: 'Das Projekt kommt ___ Abschluss. (concluirse)',
        answer: 'zum',
        translation: 'El proyecto llega a su fin.',
      },
      {
        sentence: 'Sie zieht die Aussage ___ Zweifel. (poner en duda)',
        answer: 'in',
        translation: 'Ella pone en duda la declaración.',
      },
      {
        sentence: 'Wir setzen den Plan ___ die Tat um. (llevar a cabo)',
        answer: 'in',
        translation: 'Llevamos el plan a la práctica.',
      },
      {
        sentence: 'Die Sache gerät ___ Vergessenheit. (caer en el olvido)',
        answer: 'in',
        translation: 'El asunto cae en el olvido.',
      },
    ],
  },
  {
    skillId: 'de.c1.style.nominal',
    explanation:
      'El estilo nominal convierte el verbo en sustantivo y la conjunción en preposición: «Weil es regnete, blieben wir» → «Wegen des Regens blieben wir». Es el registro de los textos formales.',
    variations: [
      {
        sentence: 'Weil es regnete → ___ des Regens',
        answer: 'wegen',
        translation: 'porque llovía → a causa de la lluvia',
      },
      {
        sentence: 'Nachdem er angekommen war → ___ seiner Ankunft',
        answer: 'nach',
        translation: 'después de que llegara → tras su llegada',
      },
      {
        sentence: 'Bevor wir abfahren → ___ der Abfahrt',
        answer: 'vor',
        translation: 'antes de salir → antes de la salida',
      },
      {
        sentence: 'Während er studierte → ___ des Studiums',
        answer: 'während',
        translation: 'mientras estudiaba → durante la carrera',
      },
      {
        sentence: 'Obwohl es Probleme gab → ___ der Probleme',
        answer: 'trotz',
        translation: 'aunque hubo problemas → a pesar de los problemas',
      },
      {
        sentence: 'Wenn es nötig ist → ___ Bedarf',
        answer: 'bei',
        translation: 'si hace falta → en caso necesario',
      },
      {
        sentence: 'Weil sie krank war → ___ ihrer Krankheit',
        answer: 'wegen',
        translation: 'porque estaba enferma → a causa de su enfermedad',
      },
      {
        sentence: 'Seit er hier arbeitet → ___ seinem Arbeitsbeginn',
        answer: 'seit',
        translation: 'desde que trabaja aquí → desde que empezó a trabajar',
      },
    ],
  },
  {
    skillId: 'de.c1.connector.causal',
    explanation:
      'weil responde a la pregunta «¿por qué?» y manda el verbo al final; denn coordina y deja el verbo segundo; da presenta una causa que ya se conoce y suele ir delante; zumal añade una razón de peso.',
    variations: [
      {
        sentence: 'Ich bleibe zu Hause, ___ ich krank bin. (subordinada)',
        answer: 'weil',
        translation: 'Me quedo en casa porque estoy enfermo.',
      },
      {
        sentence: 'Ich bleibe zu Hause, ___ ich bin krank. (coordinante)',
        answer: 'denn',
        translation: 'Me quedo en casa, pues estoy enfermo.',
      },
      {
        sentence: '___ es schon spät ist, gehen wir nach Hause. (causa conocida)',
        answer: 'Da',
        translation: 'Como ya es tarde, nos vamos a casa.',
      },
      {
        sentence: 'Wir sollten fahren, ___ das Wetter schlecht wird. (razón de peso)',
        answer: 'zumal',
        translation: 'Deberíamos irnos, sobre todo porque el tiempo va a empeorar.',
      },
      {
        sentence: 'Er kam nicht, ___ er keine Zeit hatte.',
        answer: 'weil',
        translation: 'No vino porque no tenía tiempo.',
      },
      {
        sentence: '___ du krank bist, bleib im Bett.',
        answer: 'Da',
        translation: 'Como estás enfermo, quédate en cama.',
      },
      {
        sentence: 'Ich nehme das Fahrrad, ___ das Auto ist kaputt.',
        answer: 'denn',
        translation: 'Cojo la bici, pues el coche está roto.',
      },
      {
        sentence: 'Das Projekt lohnt sich, ___ die Kosten niedrig sind.',
        answer: 'zumal',
        translation: 'El proyecto vale la pena, sobre todo porque los costes son bajos.',
      },
    ],
  },
  {
    skillId: 'de.c1.wordformation.affixes',
    explanation:
      'Los afijos productivos multiplican el vocabulario sin memorizar palabras nuevas: un- niega, -bar hace adjetivos de posibilidad, -lich hace adjetivos, -ung y -heit hacen sustantivos, -los quita algo.',
    variations: [
      {
        sentence: 'möglich → ___möglich (imposible)',
        answer: 'un',
        translation: 'posible → imposible',
      },
      { sentence: 'lesen → les___ (legible)', answer: 'bar', translation: 'leer → legible' },
      { sentence: 'Kind → Kind___ (infancia)', answer: 'heit', translation: 'niño → infancia' },
      {
        sentence: 'Hoffnung → hoffnungs___ (desesperanzado)',
        answer: 'los',
        translation: 'esperanza → sin esperanza',
      },
      {
        sentence: 'bilden → Bild___ (formación)',
        answer: 'ung',
        translation: 'formar → formación',
      },
      { sentence: 'Freund → freund___ (amable)', answer: 'lich', translation: 'amigo → amable' },
      {
        sentence: 'zufrieden → ___zufrieden (insatisfecho)',
        answer: 'un',
        translation: 'satisfecho → insatisfecho',
      },
      { sentence: 'trinken → trink___ (potable)', answer: 'bar', translation: 'beber → potable' },
    ],
  },
  {
    skillId: 'de.c1.preposition.academic',
    explanation:
      'El registro académico tiene sus propias preposiciones: anhand (a partir de), hinsichtlich (respecto a), bezüglich (en cuanto a), gemäß (según), infolge (a consecuencia de), im Hinblick auf (con vistas a).',
    variations: [
      {
        sentence: '___ der Ergebnisse lässt sich sagen, dass… (a partir de)',
        answer: 'Anhand',
        translation: 'A partir de los resultados puede decirse que…',
      },
      {
        sentence: '___ der Kosten gibt es Bedenken. (respecto a)',
        answer: 'Hinsichtlich',
        translation: 'Respecto a los costes hay reparos.',
      },
      {
        sentence: '___ Ihrer Anfrage teilen wir mit… (en cuanto a)',
        answer: 'Bezüglich',
        translation: 'En cuanto a su consulta, le comunicamos…',
      },
      {
        sentence: '___ den Vorschriften ist das verboten. (según)',
        answer: 'Gemäß',
        translation: 'Según la normativa, eso está prohibido.',
      },
      {
        sentence: '___ des Streiks fiel der Unterricht aus. (a consecuencia de)',
        answer: 'Infolge',
        translation: 'A consecuencia de la huelga se suspendieron las clases.',
      },
      {
        sentence: 'Im ___ auf die Zukunft ist das wichtig. (con vistas a)',
        answer: 'Hinblick',
        translation: 'Con vistas al futuro, eso es importante.',
      },
      {
        sentence: '___ der Studie steigt die Zahl weiter. (según)',
        answer: 'Laut',
        translation: 'Según el estudio, la cifra sigue subiendo.',
      },
      {
        sentence: '___ dieser Daten argumentiert der Autor. (a partir de)',
        answer: 'Anhand',
        translation: 'A partir de estos datos argumenta el autor.',
      },
    ],
  },

  // ══ C2 ═══════════════════════════════════════════════════════════════════

  {
    skillId: 'de.c2.particle.modal',
    explanation:
      'Las partículas modales no se traducen, colorean: doch insiste o contradice, mal suaviza un pedido, ja da algo por sabido entre los dos, wohl marca suposición, denn muestra interés en una pregunta y halt suena a resignación.',
    variations: [
      { sentence: 'Komm ___ her! (insistencia)', answer: 'doch', translation: '¡Pero ven aquí!' },
      {
        sentence: 'Mach ___ das Fenster auf. (suaviza el pedido)',
        answer: 'mal',
        translation: 'Abre la ventana, anda.',
      },
      {
        sentence: 'Das ist ___ klar! (los dos lo sabemos)',
        answer: 'ja',
        translation: '¡Pero si está clarísimo!',
      },
      { sentence: 'Er ist ___ krank. (supongo)', answer: 'wohl', translation: 'Estará enfermo.' },
      {
        sentence: 'Was machst du ___ hier? (interés)',
        answer: 'denn',
        translation: '¿Y tú qué haces aquí?',
      },
      { sentence: 'Das ist ___ so. (resignación)', answer: 'halt', translation: 'Es lo que hay.' },
      {
        sentence: 'Sag ___ endlich die Wahrheit! (insistencia)',
        answer: 'doch',
        translation: '¡Di de una vez la verdad!',
      },
      {
        sentence: 'Wie heißt du ___? (interés)',
        answer: 'denn',
        translation: 'Y tú, ¿cómo te llamas?',
      },
    ],
  },
  {
    skillId: 'de.c2.idiom.prepositional',
    explanation:
      'Expresiones fijas en las que la preposición no se deduce de nada: auf Anhieb (a la primera), im Großen und Ganzen (en general), unter Umständen (según el caso), von Haus aus (de origen). Se memorizan enteras.',
    variations: [
      {
        sentence: '___ Anhieb hat es geklappt. (a la primera)',
        answer: 'Auf',
        translation: 'Salió a la primera.',
      },
      {
        sentence: '___ Großen und Ganzen war es gut. (en general)',
        answer: 'Im',
        translation: 'En general estuvo bien.',
      },
      {
        sentence: '___ Umständen komme ich später. (según el caso)',
        answer: 'Unter',
        translation: 'Según cómo, llego más tarde.',
      },
      {
        sentence: 'Er ist ___ Haus aus Musiker. (de origen)',
        answer: 'von',
        translation: 'Él es músico de formación.',
      },
      {
        sentence: '___ jeden Fall rufe ich an. (en todo caso)',
        answer: 'Auf',
        translation: 'En todo caso, llamo.',
      },
      {
        sentence: 'Das kommt nicht ___ Frage! (ni hablar)',
        answer: 'in',
        translation: '¡Ni hablar!',
      },
      {
        sentence: 'Die Lösung liegt ___ der Hand. (es evidente)',
        answer: 'auf',
        translation: 'La solución es evidente.',
      },
      {
        sentence: 'Er hat sich das ___ Herzen genommen. (tomárselo a pecho)',
        answer: 'zu',
        translation: 'Se lo tomó a pecho.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // INGLÉS · A1
  // ══════════════════════════════════════════════════════════════════════════

  {
    skillId: 'en.a1.verb.to-be',
    explanation:
      'to be tiene tres formas y no hay más: I am, he/she/it is, you/we/they are. Es el único verbo inglés con tres formas en presente, y por eso el que más se usa.',
    variations: [
      { sentence: 'I ___ from Spain.', answer: 'am', translation: 'Soy de España.' },
      { sentence: 'She ___ a teacher.', answer: 'is', translation: 'Ella es profesora.' },
      { sentence: 'They ___ my friends.', answer: 'are', translation: 'Son mis amigos.' },
      { sentence: 'It ___ very cold today.', answer: 'is', translation: 'Hoy hace mucho frío.' },
      { sentence: 'You ___ right.', answer: 'are', translation: 'Tienes razón.' },
      { sentence: 'We ___ ready.', answer: 'are', translation: 'Estamos listos.' },
      {
        sentence: 'My brother ___ twenty.',
        answer: 'is',
        translation: 'Mi hermano tiene veinte años.',
      },
      { sentence: '___ you tired?', answer: 'Are', translation: '¿Estás cansado?' },
    ],
  },
  {
    skillId: 'en.a1.verb.simple-present',
    explanation:
      'El presente simple es el infinitivo tal cual, salvo en he/she/it. Y detrás de do, does, don’t o doesn’t el verbo vuelve SIEMPRE a su forma base: la marca la lleva el auxiliar, no el verbo.',
    variations: [
      {
        sentence: 'I ___ coffee every morning. (drink)',
        answer: 'drink',
        translation: 'Tomo café cada mañana.',
      },
      { sentence: 'We ___ in Madrid. (live)', answer: 'live', translation: 'Vivimos en Madrid.' },
      {
        sentence: 'They ___ football on Sundays. (play)',
        answer: 'play',
        translation: 'Juegan al fútbol los domingos.',
      },
      {
        sentence: "I don't ___ meat. (eat)",
        answer: 'eat',
        translation: 'No como carne. (tras don’t, forma base)',
      },
      {
        sentence: "She doesn't ___ TV. (watch)",
        answer: 'watch',
        translation: 'Ella no ve la tele. (tras doesn’t, sin -s)',
      },
      { sentence: 'Do you ___ English? (speak)', answer: 'speak', translation: '¿Hablas inglés?' },
      {
        sentence: 'My parents ___ early. (get up)',
        answer: 'get up',
        translation: 'Mis padres se levantan temprano.',
      },
      {
        sentence: 'I ___ to work by bus. (go)',
        answer: 'go',
        translation: 'Voy al trabajo en autobús.',
      },
    ],
  },
  {
    skillId: 'en.a1.verb.third-person-s',
    explanation:
      'he, she e it suman -s (works), -es tras -ch, -sh, -s, -x u -o (watches, goes) y -ies si el verbo acaba en consonante + y (studies). Pero la -s desaparece detrás de does y doesn’t.',
    variations: [
      {
        sentence: 'He ___ in a bank. (work)',
        answer: 'works',
        translation: 'Él trabaja en un banco.',
      },
      {
        sentence: 'She ___ TV every night. (watch)',
        answer: 'watches',
        translation: 'Ella ve la tele cada noche.',
      },
      {
        sentence: 'My sister ___ medicine. (study)',
        answer: 'studies',
        translation: 'Mi hermana estudia medicina.',
      },
      {
        sentence: 'It ___ a lot in winter. (rain)',
        answer: 'rains',
        translation: 'Llueve mucho en invierno.',
      },
      {
        sentence: 'He ___ to school by bike. (go)',
        answer: 'goes',
        translation: 'Va al colegio en bici.',
      },
      {
        sentence: "She doesn't ___ coffee. (drink)",
        answer: 'drink',
        translation: 'Ella no toma café. (doesn’t ya lleva la marca)',
      },
      {
        sentence: 'Does he ___ here? (live)',
        answer: 'live',
        translation: '¿Vive aquí? (does ya lleva la marca)',
      },
      {
        sentence: 'My dog ___ the postman. (hate)',
        answer: 'hates',
        translation: 'Mi perro odia al cartero.',
      },
    ],
  },
  {
    skillId: 'en.a1.article.a-an-the',
    explanation:
      'a/an es «uno cualquiera», the es «ese que los dos sabemos». an va antes de SONIDO vocálico, no de letra vocal: an hour (la h es muda), pero a university (suena «yu»).',
    variations: [
      { sentence: 'I have ___ dog.', answer: 'a', translation: 'Tengo un perro.' },
      { sentence: 'She is ___ engineer.', answer: 'an', translation: 'Es ingeniera.' },
      {
        sentence: 'We waited ___ hour.',
        answer: 'an',
        translation: 'Esperamos una hora. (la h es muda: suena a vocal)',
      },
      {
        sentence: '___ sun is very bright today.',
        answer: 'The',
        translation: 'El sol brilla mucho hoy.',
      },
      {
        sentence: 'He is ___ university student.',
        answer: 'a',
        translation: 'Es estudiante universitario. (university suena «yu»)',
      },
      {
        sentence: 'Can you close ___ door, please?',
        answer: 'the',
        translation: '¿Puedes cerrar la puerta?',
      },
      {
        sentence: 'There is ___ apple on the table.',
        answer: 'an',
        translation: 'Hay una manzana en la mesa.',
      },
      {
        sentence: 'I bought a shirt. ___ shirt was expensive.',
        answer: 'The',
        translation: 'Compré una camisa. La camisa era cara.',
      },
    ],
  },
  {
    skillId: 'en.a1.noun.plural',
    explanation:
      'Casi siempre -s. Con -es tras -ch, -sh, -s o -x; con -ies si acaba en consonante + y; con -ves en varios acabados en -f. Y un puñado que no sigue nada: man/men, child/children, foot/feet.',
    variations: [
      { sentence: 'one book → two ___', answer: 'books', translation: 'un libro → dos libros' },
      { sentence: 'one box → two ___', answer: 'boxes', translation: 'una caja → dos cajas' },
      {
        sentence: 'one city → two ___',
        answer: 'cities',
        translation: 'una ciudad → dos ciudades',
      },
      {
        sentence: 'one knife → two ___',
        answer: 'knives',
        translation: 'un cuchillo → dos cuchillos',
      },
      {
        sentence: 'one man → two ___',
        answer: 'men',
        translation: 'un hombre → dos hombres (irregular)',
      },
      {
        sentence: 'one child → two ___',
        answer: 'children',
        translation: 'un niño → dos niños (irregular)',
      },
      {
        sentence: 'one foot → two ___',
        answer: 'feet',
        translation: 'un pie → dos pies (irregular)',
      },
      { sentence: 'one watch → two ___', answer: 'watches', translation: 'un reloj → dos relojes' },
    ],
  },
  {
    skillId: 'en.a1.possessive.forms',
    explanation:
      'El ’s se le pone al POSEEDOR (Ana’s car). Los adjetivos posesivos van delante del sustantivo y nunca cambian con el número: my books, no «mys». Y ojo: its es «de ello», it’s es «it is».',
    variations: [
      { sentence: 'This is ___ book. (de mí)', answer: 'my', translation: 'Este es mi libro.' },
      { sentence: "That's ___ car. (de él)", answer: 'his', translation: 'Ese es su coche.' },
      { sentence: '___ name is Ana. (de ella)', answer: 'Her', translation: 'Se llama Ana.' },
      { sentence: 'This is Ana___ bag.', answer: "'s", translation: 'Esta es la bolsa de Ana.' },
      {
        sentence: 'These are ___ friends. (de nosotros)',
        answer: 'our',
        translation: 'Estos son nuestros amigos.',
      },
      {
        sentence: 'The dog wagged ___ tail. (de ello)',
        answer: 'its',
        translation: 'El perro movió la cola. (its, sin apóstrofo)',
      },
      {
        sentence: 'Is this ___ jacket? (de ti)',
        answer: 'your',
        translation: '¿Es tuya esta chaqueta?',
      },
      {
        sentence: 'The ___ toys are here. (de los niños)',
        answer: "children's",
        translation: 'Los juguetes de los niños están aquí.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // INGLÉS · A2
  // ══════════════════════════════════════════════════════════════════════════

  {
    skillId: 'en.a2.verb.past-simple',
    explanation:
      'El pasado regular es -ed para todas las personas, sin excepción. Escritura: -d si ya acaba en e (liked), consonante doble si acaba en consonante + vocal + consonante (stopped) y -ied tras consonante + y (studied). Tras did o didn’t, el verbo vuelve a su forma base.',
    variations: [
      {
        sentence: 'I ___ to the cinema yesterday. (walk)',
        answer: 'walked',
        translation: 'Ayer fui andando al cine.',
      },
      {
        sentence: 'She ___ the film. (like)',
        answer: 'liked',
        translation: 'Le gustó la película.',
      },
      {
        sentence: 'The bus ___ suddenly. (stop)',
        answer: 'stopped',
        translation: 'El autobús frenó de golpe.',
      },
      {
        sentence: 'We ___ all night. (study)',
        answer: 'studied',
        translation: 'Estudiamos toda la noche.',
      },
      {
        sentence: 'They ___ in London last year. (live)',
        answer: 'lived',
        translation: 'Vivieron en Londres el año pasado.',
      },
      {
        sentence: "I didn't ___ him. (call)",
        answer: 'call',
        translation: 'No lo llamé. (didn’t ya lleva el pasado)',
      },
      {
        sentence: 'Did you ___ the door? (close)',
        answer: 'close',
        translation: '¿Cerraste la puerta? (did ya lleva el pasado)',
      },
      {
        sentence: 'He ___ football when he was young. (play)',
        answer: 'played',
        translation: 'Jugaba al fútbol de joven.',
      },
    ],
  },
  {
    skillId: 'en.a2.verb.past-irregular',
    explanation:
      'No siguen ninguna regla: se aprenden de a poco. La buena noticia es que los veinte más frecuentes cubren casi todo lo que vas a decir en el día a día.',
    variations: [
      { sentence: 'go → I ___ to Paris.', answer: 'went', translation: 'ir → Fui a París.' },
      {
        sentence: 'see → I ___ a good film.',
        answer: 'saw',
        translation: 'ver → Vi una buena película.',
      },
      {
        sentence: 'have → I ___ a great time.',
        answer: 'had',
        translation: 'tener → Lo pasé genial.',
      },
      {
        sentence: 'make → She ___ a cake.',
        answer: 'made',
        translation: 'hacer → Hizo un pastel.',
      },
      {
        sentence: 'take → We ___ the train.',
        answer: 'took',
        translation: 'tomar → Tomamos el tren.',
      },
      {
        sentence: 'buy → He ___ a new phone.',
        answer: 'bought',
        translation: 'comprar → Se compró un móvil nuevo.',
      },
      { sentence: 'think → I ___ about it.', answer: 'thought', translation: 'pensar → Lo pensé.' },
      { sentence: 'come → They ___ late.', answer: 'came', translation: 'venir → Llegaron tarde.' },
    ],
  },
  {
    skillId: 'en.a2.verb.modal',
    explanation:
      'Los modales no llevan -s en he/she/it y van seguidos del infinitivo SIN to: she can swim. La excepción es have to, que no es un modal de verdad y sí se conjuga: he has to.',
    variations: [
      {
        sentence: 'She ___ swim very well. (saber, poder)',
        answer: 'can',
        translation: 'Nada muy bien.',
      },
      {
        sentence: 'You ___ wear a helmet. (obligación)',
        answer: 'must',
        translation: 'Tienes que llevar casco.',
      },
      {
        sentence: "You ___ see that film, it's great. (consejo)",
        answer: 'should',
        translation: 'Deberías ver esa película.',
      },
      {
        sentence: 'I ___ work tomorrow. (obligación externa)',
        answer: 'have to',
        translation: 'Tengo que trabajar mañana.',
      },
      {
        sentence: 'He ___ work tomorrow. (obligación externa)',
        answer: 'has to',
        translation: 'Él tiene que trabajar mañana. (have to sí se conjuga)',
      },
      {
        sentence: 'We ___ not smoke here. (prohibición)',
        answer: 'must',
        translation: 'Aquí no se puede fumar.',
      },
      {
        sentence: '___ you help me, please? (petición)',
        answer: 'Can',
        translation: '¿Me ayudas, por favor?',
      },
      {
        sentence: 'She ___ speak three languages. (saber)',
        answer: 'can',
        translation: 'Habla tres idiomas.',
      },
    ],
  },
  {
    skillId: 'en.a2.existential.there-is',
    explanation:
      'there is con singular e incontable, there are con plural. Lo que manda es la palabra que viene DETRÁS, no la que hay delante.',
    variations: [
      {
        sentence: '___ a book on the table.',
        answer: 'There is',
        translation: 'Hay un libro en la mesa.',
      },
      {
        sentence: '___ two books on the table.',
        answer: 'There are',
        translation: 'Hay dos libros en la mesa.',
      },
      {
        sentence: '___ some milk in the fridge.',
        answer: 'There is',
        translation: 'Hay leche en la nevera. (incontable → is)',
      },
      {
        sentence: '___ many people here.',
        answer: 'There are',
        translation: 'Hay mucha gente aquí.',
      },
      { sentence: '___ a problem.', answer: 'There is', translation: 'Hay un problema.' },
      {
        sentence: '___ any chairs in the room?',
        answer: 'Are there',
        translation: '¿Hay sillas en la habitación?',
      },
      { sentence: '___ some water left.', answer: 'There is', translation: 'Queda algo de agua.' },
      {
        sentence: 'How many students ___ in the class?',
        answer: 'are there',
        translation: '¿Cuántos alumnos hay en clase?',
      },
    ],
  },
  {
    skillId: 'en.a2.quantifier.some-any',
    explanation:
      'some en afirmativas, any en negativas y preguntas. La excepción que hay que saberse: some vuelve en las preguntas que son un ofrecimiento o una petición — Would you like some tea?',
    variations: [
      {
        sentence: 'There are ___ apples in the kitchen.',
        answer: 'some',
        translation: 'Hay manzanas en la cocina.',
      },
      {
        sentence: "There aren't ___ apples left.",
        answer: 'any',
        translation: 'No queda ninguna manzana.',
      },
      {
        sentence: 'Do you have ___ questions?',
        answer: 'any',
        translation: '¿Tienes alguna pregunta?',
      },
      {
        sentence: 'Would you like ___ tea? (ofrecimiento)',
        answer: 'some',
        translation: '¿Quieres un té? (ofrecer → some, aunque sea pregunta)',
      },
      { sentence: "I don't have ___ money.", answer: 'any', translation: 'No tengo dinero.' },
      { sentence: 'I bought ___ bread.', answer: 'some', translation: 'Compré pan.' },
      { sentence: 'Is there ___ milk?', answer: 'any', translation: '¿Hay leche?' },
      {
        sentence: 'Can I have ___ water, please? (petición)',
        answer: 'some',
        translation: '¿Me das agua, por favor? (pedir → some)',
      },
    ],
  },
  {
    skillId: 'en.a2.adjective.comparative',
    explanation:
      'Adjetivos cortos: -er y the -est (taller, the tallest). Largos: more y the most (more expensive). Irregulares que hay que saberse: good → better → the best, bad → worse → the worst.',
    variations: [
      {
        sentence: 'My brother is ___ than me. (tall)',
        answer: 'taller',
        translation: 'Mi hermano es más alto que yo.',
      },
      {
        sentence: 'This book is ___ than that one. (interesting)',
        answer: 'more interesting',
        translation: 'Este libro es más interesante que ese.',
      },
      {
        sentence: 'She is the ___ student in the class. (good)',
        answer: 'best',
        translation: 'Es la mejor alumna de la clase.',
      },
      {
        sentence: 'Today is ___ than yesterday. (hot)',
        answer: 'hotter',
        translation: 'Hoy hace más calor que ayer.',
      },
      {
        sentence: "This is the ___ film I've seen. (bad)",
        answer: 'worst',
        translation: 'Es la peor película que he visto.',
      },
      {
        sentence: 'My car is ___ than yours. (expensive)',
        answer: 'more expensive',
        translation: 'Mi coche es más caro que el tuyo.',
      },
      {
        sentence: 'He runs ___ than me. (fast)',
        answer: 'faster',
        translation: 'Corre más rápido que yo.',
      },
      {
        sentence: "It's the ___ day of the year. (long)",
        answer: 'longest',
        translation: 'Es el día más largo del año.',
      },
    ],
  },
  {
    skillId: 'en.a2.noun.countable',
    explanation:
      'many y few con contables (many books), much y little con incontables (much water). a lot of vale para los dos, y por eso es la salida segura al hablar. Los incontables no tienen plural: information, nunca «informations».',
    variations: [
      {
        sentence: 'How ___ books do you have?',
        answer: 'many',
        translation: '¿Cuántos libros tienes?',
      },
      {
        sentence: 'How ___ water do you drink?',
        answer: 'much',
        translation: '¿Cuánta agua bebes?',
      },
      {
        sentence: "There isn't ___ time left.",
        answer: 'much',
        translation: 'No queda mucho tiempo.',
      },
      {
        sentence: "There aren't ___ people here.",
        answer: 'many',
        translation: 'No hay mucha gente aquí.',
      },
      {
        sentence: 'She gave me a lot of ___. (información)',
        answer: 'information',
        translation: 'Me dio mucha información. (incontable, sin -s)',
      },
      {
        sentence: 'I have too ___ work today.',
        answer: 'much',
        translation: 'Hoy tengo demasiado trabajo.',
      },
      {
        sentence: 'There are a ___ apples in the bowl. (unas pocas)',
        answer: 'few',
        translation: 'Hay unas pocas manzanas en el bol.',
      },
      {
        sentence: 'There is a ___ milk left. (un poco)',
        answer: 'little',
        translation: 'Queda un poco de leche.',
      },
    ],
  },
  {
    skillId: 'en.a2.wordorder.questions',
    explanation:
      'El orden es (palabra W) + auxiliar + sujeto + verbo base. El auxiliar —do, does, did— lleva el tiempo y la persona, así que el verbo principal se queda sin -s y sin -ed.',
    variations: [
      {
        kind: 'order',
        sentence: 'Where do you live',
        answer: 'Where do you live',
        translation: '¿Dónde vives?',
      },
      {
        kind: 'order',
        sentence: 'Does she speak English',
        answer: 'Does she speak English',
        translation: '¿Habla inglés?',
      },
      {
        kind: 'order',
        sentence: 'What did you do yesterday',
        answer: 'What did you do yesterday',
        translation: '¿Qué hiciste ayer?',
      },
      {
        kind: 'order',
        sentence: 'When does the film start',
        answer: 'When does the film start',
        translation: '¿Cuándo empieza la película?',
      },
      {
        kind: 'order',
        sentence: 'Do you like coffee',
        answer: 'Do you like coffee',
        translation: '¿Te gusta el café?',
      },
      {
        kind: 'order',
        sentence: 'Why did they leave early',
        answer: 'Why did they leave early',
        translation: '¿Por qué se fueron temprano?',
      },
    ],
  },
  {
    skillId: 'en.a2.preposition.time-place',
    explanation:
      'La regla del embudo: in para lo grande (in 2020, in Madrid), on para lo intermedio (on Monday, on the table) y at para el punto exacto (at 5 o’clock, at the door).',
    variations: [
      {
        sentence: 'The meeting is ___ Monday.',
        answer: 'on',
        translation: 'La reunión es el lunes.',
      },
      { sentence: 'I was born ___ 1995.', answer: 'in', translation: 'Nací en 1995.' },
      {
        sentence: "The film starts ___ eight o'clock.",
        answer: 'at',
        translation: 'La película empieza a las ocho.',
      },
      { sentence: 'She lives ___ London.', answer: 'in', translation: 'Vive en Londres.' },
      {
        sentence: 'The book is ___ the table.',
        answer: 'on',
        translation: 'El libro está sobre la mesa.',
      },
      {
        sentence: "I'll see you ___ the weekend.",
        answer: 'at',
        translation: 'Nos vemos el fin de semana.',
      },
      {
        sentence: 'We go on holiday ___ August.',
        answer: 'in',
        translation: 'Nos vamos de vacaciones en agosto.',
      },
      {
        sentence: 'Wait for me ___ the bus stop.',
        answer: 'at',
        translation: 'Espérame en la parada.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // INGLÉS · B1
  // ══════════════════════════════════════════════════════════════════════════

  {
    skillId: 'en.b1.verb.present-perfect',
    explanation:
      'Present perfect para lo que sigue conectado con el ahora (I’ve lost my keys — siguen perdidas); past simple para lo terminado y fechado (I lost them yesterday). La pista está en el tiempo: si aparece yesterday, last week o in 2010, es past simple.',
    variations: [
      {
        sentence: 'I ___ never been to Japan.',
        answer: 'have',
        translation: 'Nunca he estado en Japón.',
      },
      {
        sentence: 'She ___ just finished her homework.',
        answer: 'has',
        translation: 'Acaba de terminar los deberes.',
      },
      {
        sentence: 'I ___ my keys yesterday. (lose)',
        answer: 'lost',
        translation: 'Ayer perdí las llaves. (yesterday → past simple)',
      },
      {
        sentence: 'We ___ lived here since 2010.',
        answer: 'have',
        translation: 'Vivimos aquí desde 2010.',
      },
      {
        sentence: '___ you ever eaten sushi?',
        answer: 'Have',
        translation: '¿Has comido sushi alguna vez?',
      },
      {
        sentence: 'He ___ to Paris last summer. (go)',
        answer: 'went',
        translation: 'Fue a París el verano pasado. (fechado → past simple)',
      },
      { sentence: 'They ___ already left.', answer: 'have', translation: 'Ya se han ido.' },
      {
        sentence: 'I ___ known her for ten years.',
        answer: 'have',
        translation: 'La conozco desde hace diez años.',
      },
    ],
  },
  {
    skillId: 'en.b1.verb.past-continuous',
    explanation:
      'El past continuous pinta el fondo (was/were + -ing) y el past simple es lo que pasa encima e interrumpe: «I was cooking when she called».',
    variations: [
      {
        sentence: 'I ___ dinner when she called. (cook)',
        answer: 'was cooking',
        translation: 'Estaba cocinando cuando llamó.',
      },
      {
        sentence: 'While we ___, it started to rain. (walk)',
        answer: 'were walking',
        translation: 'Mientras caminábamos, empezó a llover.',
      },
      {
        sentence: 'She ___ TV when the phone rang. (watch)',
        answer: 'was watching',
        translation: 'Veía la tele cuando sonó el teléfono.',
      },
      {
        sentence: 'They ___ at 8 pm yesterday. (study)',
        answer: 'were studying',
        translation: 'Ayer a las 8 estaban estudiando.',
      },
      {
        sentence: 'I was reading when the lights ___. (go out)',
        answer: 'went out',
        translation: 'Leía cuando se fue la luz. (lo breve va en past simple)',
      },
      {
        sentence: 'What were you ___ at midnight? (do)',
        answer: 'doing',
        translation: '¿Qué hacías a medianoche?',
      },
      {
        sentence: 'The sun ___ when we left. (shine)',
        answer: 'was shining',
        translation: 'Brillaba el sol cuando salimos.',
      },
      {
        sentence: 'He ___ the door when I arrived. (open)',
        answer: 'was opening',
        translation: 'Estaba abriendo la puerta cuando llegué.',
      },
    ],
  },
  {
    skillId: 'en.b1.verb.future-forms',
    explanation:
      'will para decisiones del momento y predicciones sin pruebas; going to para planes ya decididos y predicciones con pruebas delante; present continuous para citas ya cerradas con alguien.',
    variations: [
      {
        sentence: 'Look at those clouds — it ___ rain.',
        answer: 'is going to',
        translation: 'Mira esas nubes: va a llover. (hay pruebas)',
      },
      {
        sentence: "The phone's ringing. I ___ get it.",
        answer: 'will',
        translation: 'Suena el teléfono. Lo cojo yo. (decisión del momento)',
      },
      {
        sentence: 'I ___ dinner with Ana tomorrow at 8. (have)',
        answer: 'am having',
        translation: 'Ceno con Ana mañana a las 8. (cita cerrada)',
      },
      {
        sentence: 'We ___ buy a house next year.',
        answer: 'are going to',
        translation: 'Vamos a comprar una casa el año que viene.',
      },
      {
        sentence: 'I think it ___ be a good year.',
        answer: 'will',
        translation: 'Creo que será un buen año.',
      },
      {
        sentence: 'She ___ the doctor on Monday. (see)',
        answer: 'is seeing',
        translation: 'Tiene médico el lunes.',
      },
      {
        sentence: "Don't worry, I ___ help you.",
        answer: 'will',
        translation: 'No te preocupes, te ayudo.',
      },
      {
        sentence: 'They ___ get married in June.',
        answer: 'are going to',
        translation: 'Se van a casar en junio.',
      },
    ],
  },
  {
    skillId: 'en.b1.verb.gerund-infinitive',
    explanation:
      'Unos verbos piden -ing (enjoy, avoid, finish, mind, suggest) y otros to + infinitivo (want, decide, hope, promise, need). No hay lógica: la lista se aprende. Lo que sí es regla: detrás de una preposición, siempre -ing.',
    variations: [
      {
        sentence: 'I enjoy ___ books. (read)',
        answer: 'reading',
        translation: 'Me gusta leer libros.',
      },
      {
        sentence: 'She wants ___ a doctor. (be)',
        answer: 'to be',
        translation: 'Quiere ser médica.',
      },
      {
        sentence: 'We decided ___ early. (leave)',
        answer: 'to leave',
        translation: 'Decidimos irnos temprano.',
      },
      {
        sentence: 'He avoided ___ the question. (answer)',
        answer: 'answering',
        translation: 'Evitó responder la pregunta.',
      },
      {
        sentence: "I'm interested in ___ Spanish. (learn)",
        answer: 'learning',
        translation: 'Me interesa aprender español. (tras preposición, -ing)',
      },
      {
        sentence: 'They finished ___ at six. (work)',
        answer: 'working',
        translation: 'Terminaron de trabajar a las seis.',
      },
      {
        sentence: 'I promised ___ her. (call)',
        answer: 'to call',
        translation: 'Prometí llamarla.',
      },
      {
        sentence: 'Do you mind ___ the window? (open)',
        answer: 'opening',
        translation: '¿Te importa abrir la ventana?',
      },
    ],
  },
  {
    skillId: 'en.b1.verb.used-to',
    explanation:
      'used to + infinitivo para hábitos del pasado que ya no existen. En negativa y pregunta pierde la -d: didn’t use to, did you use to. Y no confundir con be used to + -ing, que es «estar acostumbrado a».',
    variations: [
      {
        sentence: 'I ___ play football every weekend.',
        answer: 'used to',
        translation: 'Antes jugaba al fútbol todos los fines de semana.',
      },
      {
        sentence: 'She ___ live in London.',
        answer: 'used to',
        translation: 'Antes vivía en Londres.',
      },
      {
        sentence: "I didn't ___ like coffee.",
        answer: 'use to',
        translation: 'Antes no me gustaba el café. (en negativa pierde la -d)',
      },
      { sentence: '___ you use to smoke?', answer: 'Did', translation: '¿Antes fumabas?' },
      {
        sentence: 'We ___ have a dog when I was a child.',
        answer: 'used to',
        translation: 'Teníamos un perro cuando yo era niño.',
      },
      { sentence: 'He ___ be very shy.', answer: 'used to', translation: 'Antes era muy tímido.' },
      {
        sentence: "I'm used to ___ up early. (get)",
        answer: 'getting',
        translation: 'Estoy acostumbrado a levantarme temprano. (be used to + -ing)',
      },
      {
        sentence: "They didn't ___ travel much.",
        answer: 'use to',
        translation: 'Antes no viajaban mucho.',
      },
    ],
  },
  {
    skillId: 'en.b1.clause.relative',
    explanation:
      'who para personas, which para cosas, that para las dos, whose para «cuyo» y where para lugares. Y una que ahorra palabras: el relativo se puede omitir cuando es el OBJETO — «the film (that) I saw».',
    variations: [
      {
        sentence: 'The man ___ lives next door is a doctor.',
        answer: 'who',
        translation: 'El hombre que vive al lado es médico.',
      },
      {
        sentence: 'The book ___ I bought is great.',
        answer: 'that',
        translation: 'El libro que compré es genial.',
      },
      {
        sentence: "That's the house ___ we visited.",
        answer: 'which',
        translation: 'Esa es la casa que visitamos.',
      },
      {
        sentence: 'The woman ___ car was stolen called the police.',
        answer: 'whose',
        translation: 'La mujer cuyo coche robaron llamó a la policía.',
      },
      {
        sentence: 'I know a girl ___ speaks five languages.',
        answer: 'who',
        translation: 'Conozco a una chica que habla cinco idiomas.',
      },
      {
        sentence: 'The film ___ won the Oscar was Spanish.',
        answer: 'that',
        translation: 'La película que ganó el Óscar era española.',
      },
      {
        sentence: 'This is the restaurant ___ we met.',
        answer: 'where',
        translation: 'Este es el restaurante donde nos conocimos.',
      },
      {
        sentence: 'The people ___ I work with are nice.',
        answer: 'who',
        translation: 'La gente con la que trabajo es maja.',
      },
    ],
  },
  {
    skillId: 'en.b1.question.tags',
    explanation:
      'La coletilla va siempre al revés que la frase: afirmativa → tag negativa, y al revés. Repite el auxiliar de la frase; si no hay ninguno, usa do, does o did.',
    variations: [
      {
        sentence: "You're Spanish, ___?",
        answer: "aren't you",
        translation: 'Eres español, ¿verdad?',
      },
      { sentence: "She isn't coming, ___?", answer: 'is she', translation: 'No viene, ¿verdad?' },
      {
        sentence: 'You like coffee, ___?',
        answer: "don't you",
        translation: 'Te gusta el café, ¿no?',
      },
      { sentence: "He didn't call, ___?", answer: 'did he', translation: 'No llamó, ¿verdad?' },
      { sentence: 'They can swim, ___?', answer: "can't they", translation: 'Saben nadar, ¿no?' },
      {
        sentence: "It's cold today, ___?",
        answer: "isn't it",
        translation: 'Hace frío hoy, ¿verdad?',
      },
      { sentence: 'You went there, ___?', answer: "didn't you", translation: 'Fuiste allí, ¿no?' },
      {
        sentence: "We haven't met, ___?",
        answer: 'have we',
        translation: 'No nos conocemos, ¿verdad?',
      },
    ],
  },
  {
    skillId: 'en.b1.quantifier.few-little',
    explanation:
      'El artículo cambia el sentido entero: few y little son negativos («casi ninguno»), a few y a little son positivos («unos pocos, y alcanzan»). few va con contables, little con incontables.',
    variations: [
      {
        sentence: 'I have ___ friends here, so I feel lonely.',
        answer: 'few',
        translation: 'Tengo pocos amigos aquí, me siento solo. (sin artículo → negativo)',
      },
      {
        sentence: "I have ___ friends here, so I'm never bored.",
        answer: 'a few',
        translation: 'Tengo unos cuantos amigos aquí, nunca me aburro.',
      },
      {
        sentence: "There's ___ milk left — enough for coffee.",
        answer: 'a little',
        translation: 'Queda un poco de leche, suficiente para el café.',
      },
      { sentence: "There's ___ hope.", answer: 'little', translation: 'Hay pocas esperanzas.' },
      {
        sentence: "She speaks ___ words of English, we can't talk.",
        answer: 'few',
        translation: 'Dice pocas palabras en inglés, no podemos hablar.',
      },
      {
        sentence: 'Give me ___ time, please.',
        answer: 'a little',
        translation: 'Dame un poco de tiempo, por favor.',
      },
      {
        sentence: '___ people came to the party, it was empty.',
        answer: 'Few',
        translation: 'Vino poca gente a la fiesta, estaba vacía.',
      },
      { sentence: 'I need ___ minutes.', answer: 'a few', translation: 'Necesito unos minutos.' },
    ],
  },
  {
    skillId: 'en.b1.intensifier.so-such',
    explanation:
      'so va con adjetivo o adverbio solo (so nice); such va cuando detrás hay un sustantivo (such a nice day). La regla corta: si hay sustantivo, such.',
    variations: [
      {
        sentence: 'It was ___ a good film!',
        answer: 'such',
        translation: '¡Fue una película tan buena!',
      },
      { sentence: 'She is ___ kind.', answer: 'so', translation: 'Es tan amable.' },
      {
        sentence: 'They were ___ nice people.',
        answer: 'such',
        translation: 'Eran gente tan agradable.',
      },
      {
        sentence: 'The exam was ___ difficult.',
        answer: 'so',
        translation: 'El examen fue tan difícil.',
      },
      {
        sentence: "It's ___ a beautiful day.",
        answer: 'such',
        translation: 'Hace un día tan bonito.',
      },
      { sentence: 'He drives ___ fast.', answer: 'so', translation: 'Conduce tan rápido.' },
      { sentence: 'We had ___ a great time.', answer: 'such', translation: 'Lo pasamos tan bien.' },
      { sentence: "I'm ___ tired.", answer: 'so', translation: 'Estoy tan cansado.' },
    ],
  },
  {
    skillId: 'en.b1.conditional.second',
    explanation:
      'if + past simple, would + infinitivo. Habla de lo irreal o improbable. Con to be, el registro cuidado usa were para todas las personas: «If I were you».',
    variations: [
      {
        sentence: 'If I ___ rich, I would travel. (be)',
        answer: 'were',
        translation: 'Si fuera rico, viajaría.',
      },
      {
        sentence: 'If I had time, I ___ help you.',
        answer: 'would',
        translation: 'Si tuviera tiempo, te ayudaría.',
      },
      {
        sentence: 'If she ___ harder, she would pass. (study)',
        answer: 'studied',
        translation: 'Si estudiara más, aprobaría.',
      },
      {
        sentence: 'What would you do if you ___ me? (be)',
        answer: 'were',
        translation: '¿Qué harías en mi lugar?',
      },
      {
        sentence: 'If we ___ a car, we would drive. (have)',
        answer: 'had',
        translation: 'Si tuviéramos coche, iríamos conduciendo.',
      },
      {
        sentence: 'I would call him if I ___ his number. (know)',
        answer: 'knew',
        translation: 'Lo llamaría si supiera su número.',
      },
      {
        sentence: 'If it ___ raining, we would go out. (not be)',
        answer: "weren't",
        translation: 'Si no estuviera lloviendo, saldríamos.',
      },
      {
        sentence: 'They would come if you ___ them. (invite)',
        answer: 'invited',
        translation: 'Vendrían si los invitaras.',
      },
    ],
  },
  {
    skillId: 'en.b1.modal.would-polite',
    explanation:
      'would suaviza cualquier petición o queja: «I would like» en vez de «I want», «Would you mind…?» en vez de un imperativo. Es la diferencia entre sonar exigente y sonar razonable.',
    variations: [
      {
        sentence: 'I ___ like to speak to the manager.',
        answer: 'would',
        translation: 'Querría hablar con el encargado.',
      },
      {
        sentence: '___ you mind waiting a moment?',
        answer: 'Would',
        translation: '¿Le importaría esperar un momento?',
      },
      {
        sentence: 'I ___ appreciate a refund.',
        answer: 'would',
        translation: 'Agradecería un reembolso.',
      },
      {
        sentence: '___ it be possible to change rooms?',
        answer: 'Would',
        translation: '¿Sería posible cambiar de habitación?',
      },
      {
        sentence: 'We ___ prefer a quieter table.',
        answer: 'would',
        translation: 'Preferiríamos una mesa más tranquila.',
      },
      {
        sentence: 'I ___ expect a better service.',
        answer: 'would',
        translation: 'Esperaría un mejor servicio.',
      },
      {
        sentence: '___ you be able to help me?',
        answer: 'Would',
        translation: '¿Podría ayudarme?',
      },
      {
        sentence: 'That ___ be very kind of you.',
        answer: 'would',
        translation: 'Sería muy amable de su parte.',
      },
    ],
  },
  {
    skillId: 'en.b1.voice.perfect-vs-passive',
    explanation:
      'have + participio cuenta la ACCIÓN («we have fixed the problem»); be + participio describe el ESTADO que quedó («the problem is fixed»). La forma se parece; lo que cambia es de qué estás hablando.',
    variations: [
      {
        sentence: 'We ___ fixed the problem. (la acción)',
        answer: 'have',
        translation: 'Hemos arreglado el problema.',
      },
      {
        sentence: 'The problem ___ fixed. (el estado)',
        answer: 'is',
        translation: 'El problema está arreglado.',
      },
      {
        sentence: 'They ___ cleaned the room. (la acción)',
        answer: 'have',
        translation: 'Han limpiado la habitación.',
      },
      {
        sentence: 'The room ___ clean now. (el estado)',
        answer: 'is',
        translation: 'La habitación está limpia ahora.',
      },
      {
        sentence: 'I ___ booked a table. (la acción)',
        answer: 'have',
        translation: 'He reservado mesa.',
      },
      {
        sentence: 'The table ___ booked. (el estado)',
        answer: 'is',
        translation: 'La mesa está reservada.',
      },
      {
        sentence: 'She ___ closed the account. (la acción)',
        answer: 'has',
        translation: 'Ha cerrado la cuenta.',
      },
      {
        sentence: 'The account ___ closed. (el estado)',
        answer: 'is',
        translation: 'La cuenta está cerrada.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // INGLÉS · B2
  // ══════════════════════════════════════════════════════════════════════════

  {
    skillId: 'en.b2.voice.passive',
    explanation:
      'be + participio, y el tiempo lo lleva be: is made, was made, has been made, will be made. Quien hace la acción, si importa, va detrás con by.',
    variations: [
      {
        sentence: 'The house ___ built in 1990.',
        answer: 'was',
        translation: 'La casa se construyó en 1990.',
      },
      {
        sentence: 'These cars ___ made in Japan.',
        answer: 'are',
        translation: 'Estos coches se fabrican en Japón.',
      },
      {
        sentence: 'The letter has ___ sent.',
        answer: 'been',
        translation: 'La carta ha sido enviada.',
      },
      {
        sentence: 'The work will ___ finished tomorrow.',
        answer: 'be',
        translation: 'El trabajo estará terminado mañana.',
      },
      { sentence: 'English ___ spoken here.', answer: 'is', translation: 'Aquí se habla inglés.' },
      {
        sentence: 'The windows ___ cleaned last week.',
        answer: 'were',
        translation: 'Las ventanas se limpiaron la semana pasada.',
      },
      {
        sentence: 'This song ___ written by Lennon.',
        answer: 'was',
        translation: 'Esta canción la escribió Lennon.',
      },
      {
        sentence: 'The report is ___ reviewed right now.',
        answer: 'being',
        translation: 'El informe se está revisando ahora mismo.',
      },
    ],
  },
  {
    skillId: 'en.b2.conditional.first',
    explanation:
      'if + presente, will + infinitivo. Habla de lo probable. El fallo más repetido es meter will en la parte del if: ahí nunca va.',
    variations: [
      {
        sentence: "If it ___ tomorrow, we'll stay home. (rain)",
        answer: 'rains',
        translation: 'Si llueve mañana, nos quedamos en casa.',
      },
      {
        sentence: 'If you study, you ___ pass.',
        answer: 'will',
        translation: 'Si estudias, aprobarás.',
      },
      {
        sentence: "I'll call you if I ___ time. (have)",
        answer: 'have',
        translation: 'Te llamo si tengo tiempo.',
      },
      {
        sentence: "If she ___ late, we'll start without her. (be)",
        answer: 'is',
        translation: 'Si llega tarde, empezamos sin ella.',
      },
      {
        sentence: "We won't go if it ___ cold. (be)",
        answer: 'is',
        translation: 'No iremos si hace frío.',
      },
      {
        sentence: "If they ___ early, they'll get tickets. (arrive)",
        answer: 'arrive',
        translation: 'Si llegan temprano, conseguirán entradas.',
      },
      {
        sentence: "You'll be tired if you ___ to bed late. (go)",
        answer: 'go',
        translation: 'Estarás cansado si te acuestas tarde.',
      },
      {
        sentence: "If I ___ him, I'll tell him. (see)",
        answer: 'see',
        translation: 'Si lo veo, se lo digo.',
      },
    ],
  },
  {
    skillId: 'en.b2.conditional.third',
    explanation:
      'if + had + participio, would have + participio. Es el condicional del arrepentimiento: habla del pasado que ya no se puede cambiar.',
    variations: [
      {
        sentence: 'If I had known, I ___ have come.',
        answer: 'would',
        translation: 'Si lo hubiera sabido, habría venido.',
      },
      {
        sentence: 'If she ___ studied, she would have passed.',
        answer: 'had',
        translation: 'Si hubiera estudiado, habría aprobado.',
      },
      {
        sentence: 'We would have won if we ___ played better.',
        answer: 'had',
        translation: 'Habríamos ganado si hubiéramos jugado mejor.',
      },
      {
        sentence: 'If they had left earlier, they ___ have missed the train.',
        answer: "wouldn't",
        translation: 'Si hubieran salido antes, no habrían perdido el tren.',
      },
      {
        sentence: 'I would have called if I ___ had your number.',
        answer: 'had',
        translation: 'Habría llamado si hubiera tenido tu número.',
      },
      {
        sentence: "If it hadn't rained, we ___ have gone out.",
        answer: 'would',
        translation: 'Si no hubiera llovido, habríamos salido.',
      },
      {
        sentence: 'She ___ have got the job if she had applied.',
        answer: 'would',
        translation: 'Habría conseguido el trabajo si hubiera echado la solicitud.',
      },
      {
        sentence: 'If you had asked, I ___ have helped.',
        answer: 'would',
        translation: 'Si me lo hubieras pedido, te habría ayudado.',
      },
    ],
  },
  {
    skillId: 'en.b2.conditional.mixed',
    explanation:
      'Mezcla los tiempos porque la causa y la consecuencia están en momentos distintos. Pasado → presente: «If I had studied, I would be a doctor now». Presente → pasado: «If I were braver, I would have said something».',
    variations: [
      {
        sentence: 'If I had studied medicine, I ___ be a doctor now.',
        answer: 'would',
        translation: 'Si hubiera estudiado medicina, ahora sería médico.',
      },
      {
        sentence: "If she hadn't missed the train, she ___ be here.",
        answer: 'would',
        translation: 'Si no hubiera perdido el tren, estaría aquí.',
      },
      {
        sentence: "If I ___ more organised, I wouldn't have lost it. (be)",
        answer: 'were',
        translation: 'Si fuera más ordenado, no lo habría perdido.',
      },
      {
        sentence: "If he weren't so shy, he ___ have asked her out.",
        answer: 'would',
        translation: 'Si no fuera tan tímido, la habría invitado a salir.',
      },
      {
        sentence: 'If we had saved money, we ___ be worried now.',
        answer: "wouldn't",
        translation: 'Si hubiéramos ahorrado, ahora no estaríamos preocupados.',
      },
      {
        sentence: 'If I ___ afraid of flying, I would have visited you. (not be)',
        answer: "weren't",
        translation: 'Si no tuviera miedo a volar, te habría visitado.',
      },
      {
        sentence: 'If they had left earlier, they ___ be here already.',
        answer: 'would',
        translation: 'Si hubieran salido antes, ya estarían aquí.',
      },
      {
        sentence: 'If you were more careful, you ___ have broken it.',
        answer: "wouldn't",
        translation: 'Si fueras más cuidadoso, no lo habrías roto.',
      },
    ],
  },
  {
    skillId: 'en.b2.verb.causative',
    explanation:
      'have o get + objeto + participio significa que lo hizo otro por vos: «I had my car repaired» no dice que lo arreglaras vos. El participio va al final, detrás del objeto.',
    variations: [
      {
        sentence: 'I had my car ___. (repair)',
        answer: 'repaired',
        translation: 'Me arreglaron el coche.',
      },
      {
        sentence: 'She got her hair ___. (cut)',
        answer: 'cut',
        translation: 'Se cortó el pelo (se lo cortaron).',
      },
      {
        sentence: "We're having the kitchen ___. (paint)",
        answer: 'painted',
        translation: 'Nos están pintando la cocina.',
      },
      {
        sentence: 'He had his wallet ___. (steal)',
        answer: 'stolen',
        translation: 'Le robaron la cartera.',
      },
      {
        sentence: 'I need to get my eyes ___. (test)',
        answer: 'tested',
        translation: 'Necesito que me revisen la vista.',
      },
      {
        sentence: 'They had the documents ___. (translate)',
        answer: 'translated',
        translation: 'Les tradujeron los documentos.',
      },
      {
        sentence: 'We got the photos ___. (print)',
        answer: 'printed',
        translation: 'Nos revelaron las fotos.',
      },
      {
        sentence: "She's having a dress ___. (make)",
        answer: 'made',
        translation: 'Le están haciendo un vestido.',
      },
    ],
  },
  {
    skillId: 'en.b2.modal.deduction-present',
    explanation:
      'must para lo que das por seguro, might o could para lo posible, can’t para lo que descartás. Ojo con la negativa: lo contrario de «must be» aquí no es «mustn’t be», es «can’t be».',
    variations: [
      {
        sentence: 'He ___ be tired, he worked all night. (casi seguro)',
        answer: 'must',
        translation: 'Debe de estar cansado, trabajó toda la noche.',
      },
      {
        sentence: "She ___ be at home, her car isn't here. (descartado)",
        answer: "can't",
        translation: 'No puede estar en casa, su coche no está.',
      },
      {
        sentence: "It ___ rain later, I'm not sure. (posible)",
        answer: 'might',
        translation: 'Puede que llueva luego, no estoy seguro.',
      },
      {
        sentence: 'They ___ be rich, look at that house. (casi seguro)',
        answer: 'must',
        translation: 'Deben de ser ricos, mira esa casa.',
      },
      {
        sentence: "That ___ be true, it's impossible. (descartado)",
        answer: "can't",
        translation: 'Eso no puede ser verdad, es imposible.',
      },
      {
        sentence: 'He ___ be in the garden. (posible)',
        answer: 'could',
        translation: 'Podría estar en el jardín.',
      },
      {
        sentence: 'You ___ be hungry after that walk. (casi seguro)',
        answer: 'must',
        translation: 'Debes de tener hambre después de esa caminata.',
      },
      {
        sentence: 'She ___ know the answer, but I doubt it. (posible)',
        answer: 'might',
        translation: 'Puede que sepa la respuesta, pero lo dudo.',
      },
    ],
  },
  {
    skillId: 'en.b2.reported.questions',
    explanation:
      'La pregunta reportada pierde la inversión y el auxiliar: vuelve al orden de una frase normal. «Where do you live?» → «She asked where I lived». Y no lleva signo de interrogación.',
    variations: [
      {
        kind: 'order',
        sentence: 'She asked where I lived',
        answer: 'She asked where I lived',
        translation: 'Me preguntó dónde vivía.',
      },
      {
        kind: 'order',
        sentence: 'He wanted to know if I was ready',
        answer: 'He wanted to know if I was ready',
        translation: 'Quería saber si estaba listo.',
      },
      {
        kind: 'order',
        sentence: 'They asked what time the film started',
        answer: 'They asked what time the film started',
        translation: 'Preguntaron a qué hora empezaba la película.',
      },
      {
        kind: 'order',
        sentence: 'I asked her why she was late',
        answer: 'I asked her why she was late',
        translation: 'Le pregunté por qué llegaba tarde.',
      },
      {
        kind: 'order',
        sentence: 'She asked if I had seen the news',
        answer: 'She asked if I had seen the news',
        translation: 'Me preguntó si había visto las noticias.',
      },
      {
        kind: 'order',
        sentence: 'He asked me where I had been',
        answer: 'He asked me where I had been',
        translation: 'Me preguntó dónde había estado.',
      },
    ],
  },
  {
    skillId: 'en.b2.verb.wish',
    explanation:
      'wish + past simple para el presente que te gustaría distinto; wish + had + participio para el pasado que lamentás; wish + would para lo que te molesta de lo que hacen otros.',
    variations: [
      {
        sentence: 'I wish I ___ more time. (have)',
        answer: 'had',
        translation: 'Ojalá tuviera más tiempo.',
      },
      {
        sentence: 'I wish I ___ studied harder. (have)',
        answer: 'had',
        translation: 'Ojalá hubiera estudiado más.',
      },
      {
        sentence: 'I wish it ___ raining. (not be)',
        answer: "weren't",
        translation: 'Ojalá no estuviera lloviendo.',
      },
      {
        sentence: 'She wishes she ___ told him. (have)',
        answer: 'had',
        translation: 'Ojalá se lo hubiera dicho.',
      },
      {
        sentence: 'I wish you ___ stop shouting.',
        answer: 'would',
        translation: 'Ojalá dejaras de gritar.',
      },
      {
        sentence: 'If only I ___ speak French. (can)',
        answer: 'could',
        translation: 'Ojalá supiera hablar francés.',
      },
      {
        sentence: 'I wish I ___ taller. (be)',
        answer: 'were',
        translation: 'Ojalá fuera más alto.',
      },
      {
        sentence: 'He wishes he ___ bought the tickets. (have)',
        answer: 'had',
        translation: 'Ojalá hubiera comprado las entradas.',
      },
    ],
  },
  {
    skillId: 'en.b2.connector.discourse',
    explanation:
      'despite e in spite of van seguidos de sustantivo o de -ing, nunca de una frase con verbo conjugado — para eso está although. however y moreover conectan dos frases y llevan coma detrás.',
    variations: [
      {
        sentence: '___ the rain, we went out.',
        answer: 'Despite',
        translation: 'A pesar de la lluvia, salimos. (+ sustantivo)',
      },
      {
        sentence: '___ it was raining, we went out.',
        answer: 'Although',
        translation: 'Aunque llovía, salimos. (+ frase con verbo)',
      },
      {
        sentence: 'It was expensive. ___, it was worth it.',
        answer: 'However',
        translation: 'Era caro. Sin embargo, mereció la pena.',
      },
      {
        sentence: 'The plan is cheap. ___, it is fast.',
        answer: 'Moreover',
        translation: 'El plan es barato. Además, es rápido.',
      },
      {
        sentence: '___ being tired, she finished.',
        answer: 'Despite',
        translation: 'A pesar de estar cansada, terminó. (+ -ing)',
      },
      {
        sentence: 'He studied hard. ___, he failed.',
        answer: 'However',
        translation: 'Estudió mucho. Sin embargo, suspendió.',
      },
      {
        sentence: '___ the traffic, we arrived on time.',
        answer: 'Despite',
        translation: 'A pesar del tráfico, llegamos a tiempo.',
      },
      {
        sentence: "___ he tried hard, he didn't win.",
        answer: 'Although',
        translation: 'Aunque se esforzó, no ganó.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // INGLÉS · C1 y C2
  // ══════════════════════════════════════════════════════════════════════════

  {
    skillId: 'en.c1.reported.speech',
    explanation:
      'Al reportar, los tiempos retroceden un paso —present → past, past → past perfect, will → would— y con ellos cambian los pronombres y las marcas de tiempo: today → that day, tomorrow → the next day.',
    variations: [
      {
        sentence: '«I am tired» → He said he ___ tired.',
        answer: 'was',
        translation: 'Dijo que estaba cansado.',
      },
      {
        sentence: '«I live in Rome» → She said she ___ in Rome.',
        answer: 'lived',
        translation: 'Dijo que vivía en Roma.',
      },
      {
        sentence: '«I saw him» → He said he ___ seen him.',
        answer: 'had',
        translation: 'Dijo que lo había visto.',
      },
      {
        sentence: '«I will call» → She said she ___ call.',
        answer: 'would',
        translation: 'Dijo que llamaría.',
      },
      {
        sentence: '«I can swim» → He said he ___ swim.',
        answer: 'could',
        translation: 'Dijo que sabía nadar.',
      },
      {
        sentence: "«I'm working now» → She said she ___ working then.",
        answer: 'was',
        translation: 'Dijo que estaba trabajando en ese momento.',
      },
      {
        sentence: '«We have finished» → They said they ___ finished.',
        answer: 'had',
        translation: 'Dijeron que habían terminado.',
      },
      {
        sentence: "«I'll do it tomorrow» → He said he'd do it the ___ day.",
        answer: 'next',
        translation: 'Dijo que lo haría al día siguiente. (tomorrow → the next day)',
      },
    ],
  },
  {
    skillId: 'en.c1.modal.deduction-past',
    explanation:
      'Para deducir sobre el pasado el modal no cambia: lo que cambia es lo que va detrás. must have + participio (casi seguro), might o could have (posible), can’t have (descartado).',
    variations: [
      {
        sentence: "He ___ have missed the train, he's never late. (casi seguro)",
        answer: 'must',
        translation: 'Debe de haber perdido el tren.',
      },
      {
        sentence: 'She ___ have forgotten, she has a great memory. (descartado)',
        answer: "can't",
        translation: 'No puede habérsele olvidado.',
      },
      {
        sentence: "They ___ have left already, I'm not sure. (posible)",
        answer: 'might',
        translation: 'Puede que ya se hayan ido.',
      },
      {
        sentence: 'You ___ have seen him, he was abroad. (descartado)',
        answer: "can't",
        translation: 'No puedes haberlo visto, estaba fuera.',
      },
      {
        sentence: 'It ___ have been the wind. (posible)',
        answer: 'could',
        translation: 'Podría haber sido el viento.',
      },
      {
        sentence: 'The road is wet — it ___ have rained. (casi seguro)',
        answer: 'must',
        translation: 'La carretera está mojada: debe de haber llovido.',
      },
      {
        sentence: 'I ___ have left my keys at home. (posible)',
        answer: 'might',
        translation: 'Puede que me haya dejado las llaves en casa.',
      },
      {
        sentence: 'She ___ have known, nobody told her. (descartado)',
        answer: "can't",
        translation: 'No puede haberlo sabido, nadie se lo dijo.',
      },
    ],
  },
  {
    skillId: 'en.c1.clause.participle',
    explanation:
      'La cláusula de participio recorta una subordinada quitando el sujeto y el auxiliar: -ing para lo activo (Walking home, I saw…) y participio pasado para lo pasivo (Written in 1920, the book…).',
    variations: [
      {
        sentence: '___ home, I saw an accident. (walk)',
        answer: 'Walking',
        translation: 'Yendo a casa, vi un accidente.',
      },
      {
        sentence: '___ in 1920, the book is still popular. (write)',
        answer: 'Written',
        translation: 'Escrito en 1920, el libro sigue siendo popular.',
      },
      {
        sentence: '___ the news, she called me. (hear)',
        answer: 'Hearing',
        translation: 'Al oír la noticia, me llamó.',
      },
      {
        sentence: '___ by the noise, he woke up. (wake)',
        answer: 'Woken',
        translation: 'Despertado por el ruido, se levantó.',
      },
      {
        sentence: '___ tired, they went to bed early. (feel)',
        answer: 'Feeling',
        translation: 'Sintiéndose cansados, se acostaron temprano.',
      },
      {
        sentence: '___ in Spain, the wine is excellent. (produce)',
        answer: 'Produced',
        translation: 'Producido en España, el vino es excelente.',
      },
      {
        sentence: '___ the door, he went out. (open)',
        answer: 'Opening',
        translation: 'Abriendo la puerta, salió.',
      },
      {
        sentence: '___ properly, the machine lasts years. (use)',
        answer: 'Used',
        translation: 'Usada correctamente, la máquina dura años.',
      },
    ],
  },
  {
    skillId: 'en.c1.structure.cleft',
    explanation:
      'La cleft parte la frase en dos para poner el foco donde vos querés: «It was John who broke it» señala a John, «What I need is a holiday» señala lo que necesitás. Es énfasis hecho con orden, no con voz.',
    variations: [
      {
        kind: 'order',
        sentence: 'It was John who broke the window',
        answer: 'It was John who broke the window',
        translation: 'Fue John quien rompió la ventana.',
      },
      {
        kind: 'order',
        sentence: 'What I need is a holiday',
        answer: 'What I need is a holiday',
        translation: 'Lo que necesito son unas vacaciones.',
      },
      {
        kind: 'order',
        sentence: 'It is the price that worries me',
        answer: 'It is the price that worries me',
        translation: 'Es el precio lo que me preocupa.',
      },
      {
        kind: 'order',
        sentence: 'What she did was call the police',
        answer: 'What she did was call the police',
        translation: 'Lo que hizo fue llamar a la policía.',
      },
      {
        kind: 'order',
        sentence: 'It was in Paris that we met',
        answer: 'It was in Paris that we met',
        translation: 'Fue en París donde nos conocimos.',
      },
      {
        kind: 'order',
        sentence: 'All I want is the truth',
        answer: 'All I want is the truth',
        translation: 'Todo lo que quiero es la verdad.',
      },
    ],
  },
  {
    skillId: 'en.c1.structure.ellipsis',
    explanation:
      'so y neither evitan repetir la frase entera: «I’m tired» → «So am I». so responde a las afirmativas, neither a las negativas, y detrás va el auxiliar delante del sujeto, como en una pregunta.',
    variations: [
      {
        sentence: "«I'm tired.» «___ am I.»",
        answer: 'So',
        translation: '—Estoy cansado. —Yo también.',
      },
      {
        sentence: "«I don't like it.» «___ do I.»",
        answer: 'Neither',
        translation: '—No me gusta. —A mí tampoco.',
      },
      {
        sentence: '«She can swim.» «___ can he.»',
        answer: 'So',
        translation: '—Ella sabe nadar. —Él también.',
      },
      {
        sentence: "«I haven't seen it.» «___ have I.»",
        answer: 'Neither',
        translation: '—No lo he visto. —Yo tampoco.',
      },
      {
        sentence: '«They went home.» «___ did we.»',
        answer: 'So',
        translation: '—Se fueron a casa. —Nosotros también.',
      },
      {
        sentence: 'Do you want the red one or the blue ___?',
        answer: 'one',
        translation: '¿Quieres el rojo o el azul?',
      },
      {
        sentence: "«I've never been there.» «___ have I.»",
        answer: 'Neither',
        translation: '—Nunca he estado allí. —Yo tampoco.',
      },
      {
        sentence: 'I asked him to help and he agreed to do ___.',
        answer: 'so',
        translation: 'Le pedí que ayudara y accedió a hacerlo.',
      },
    ],
  },
  {
    skillId: 'en.c1.verb.subjunctive',
    explanation:
      'Tras suggest, recommend, insist, demand y en «it is essential that», el verbo va en forma BASE para todas las personas: he go, no he goes. Suena raro al oído y es exactamente lo correcto.',
    variations: [
      {
        sentence: 'I suggest that he ___ early. (leave)',
        answer: 'leave',
        translation: 'Sugiero que se vaya temprano.',
      },
      {
        sentence: 'They demanded that she ___ present. (be)',
        answer: 'be',
        translation: 'Exigieron que estuviera presente.',
      },
      {
        sentence: 'It is essential that everyone ___ on time. (be)',
        answer: 'be',
        translation: 'Es esencial que todos lleguen a tiempo.',
      },
      {
        sentence: 'The doctor recommended that he ___ smoking. (stop)',
        answer: 'stop',
        translation: 'El médico recomendó que dejara de fumar.',
      },
      {
        sentence: 'I insist that she ___ us. (join)',
        answer: 'join',
        translation: 'Insisto en que se una a nosotros.',
      },
      {
        sentence: 'We propose that the meeting ___ postponed. (be)',
        answer: 'be',
        translation: 'Proponemos que se posponga la reunión.',
      },
      {
        sentence: 'He asked that we ___ him informed. (keep)',
        answer: 'keep',
        translation: 'Pidió que lo mantuviéramos informado.',
      },
      {
        sentence: 'It is vital that the report ___ ready. (be)',
        answer: 'be',
        translation: 'Es vital que el informe esté listo.',
      },
    ],
  },
  {
    skillId: 'en.c1.connector.academic',
    explanation:
      'whereas contrasta dos cosas dentro de la misma frase; thus, hence y therefore introducen la consecuencia; thereby une la causa con su efecto y va seguido de -ing; nevertheless concede.',
    variations: [
      {
        sentence: 'Sales rose in Spain, ___ they fell in Italy. (contraste)',
        answer: 'whereas',
        translation: 'Las ventas subieron en España, mientras que cayeron en Italia.',
      },
      {
        sentence: 'The data was incomplete; ___, the study was repeated.',
        answer: 'thus',
        translation: 'Los datos estaban incompletos; así pues, se repitió el estudio.',
      },
      {
        sentence: 'He cut costs, ___ increasing profits. (con lo cual)',
        answer: 'thereby',
        translation: 'Recortó costes, aumentando así los beneficios.',
      },
      {
        sentence: 'The results were poor. ___, the project continued.',
        answer: 'Nevertheless',
        translation: 'Los resultados fueron malos. Aun así, el proyecto siguió.',
      },
      {
        sentence: 'The sample was small and ___ unreliable. (por tanto)',
        answer: 'hence',
        translation: 'La muestra era pequeña y, por tanto, poco fiable.',
      },
      {
        sentence: 'Some prefer speed, ___ others value accuracy.',
        answer: 'whereas',
        translation: 'Unos prefieren la rapidez, mientras que otros valoran la precisión.',
      },
      {
        sentence: 'The evidence is clear; ___, action is needed.',
        answer: 'therefore',
        translation: 'La evidencia es clara; por tanto, hace falta actuar.',
      },
      {
        sentence: 'It rained heavily; ___, the match went on.',
        answer: 'nevertheless',
        translation: 'Llovió mucho; aun así, el partido continuó.',
      },
    ],
  },
  {
    skillId: 'en.c1.collocation.make-do',
    explanation:
      'Son parejas fijas y no hay lógica que deducir: make a decision pero do homework, take a photo pero have a shower. Se aprenden en bloque, igual que los verbos con preposición.',
    variations: [
      { sentence: '___ a decision', answer: 'make', translation: 'tomar una decisión' },
      { sentence: '___ your homework', answer: 'do', translation: 'hacer los deberes' },
      { sentence: '___ a photo', answer: 'take', translation: 'sacar una foto' },
      { sentence: '___ a shower', answer: 'have', translation: 'ducharse' },
      { sentence: '___ a mistake', answer: 'make', translation: 'cometer un error' },
      {
        sentence: '___ business with someone',
        answer: 'do',
        translation: 'hacer negocios con alguien',
      },
      { sentence: '___ a break', answer: 'take', translation: 'tomarse un descanso' },
      { sentence: '___ a good time', answer: 'have', translation: 'pasarlo bien' },
    ],
  },
  {
    skillId: 'en.c2.structure.inversion',
    explanation:
      'Al poner delante una expresión negativa o restrictiva —never, rarely, not only, no sooner, only then— la frase invierte como si fuera una pregunta: «Never have I seen…».',
    variations: [
      {
        kind: 'order',
        sentence: 'Never have I seen such a mess',
        answer: 'Never have I seen such a mess',
        translation: 'Nunca había visto semejante desastre.',
      },
      {
        kind: 'order',
        sentence: 'Rarely does he complain',
        answer: 'Rarely does he complain',
        translation: 'Rara vez se queja.',
      },
      {
        kind: 'order',
        sentence: 'Not only did she win but she broke the record',
        answer: 'Not only did she win but she broke the record',
        translation: 'No solo ganó, sino que batió el récord.',
      },
      {
        kind: 'order',
        sentence: 'Only then did I understand',
        answer: 'Only then did I understand',
        translation: 'Solo entonces lo entendí.',
      },
      {
        kind: 'order',
        sentence: 'No sooner had we arrived than it started raining',
        answer: 'No sooner had we arrived than it started raining',
        translation: 'Nada más llegar, empezó a llover.',
      },
      {
        kind: 'order',
        sentence: 'Little did they know the truth',
        answer: 'Little did they know the truth',
        translation: 'Poco sabían de la verdad.',
      },
    ],
  },
  {
    skillId: 'en.c2.verb.phrasal',
    explanation:
      'El significado no sale de las partes: put off es aplazar y put up with es aguantar. Por eso no se traducen, se aprenden enteros, con su preposición pegada.',
    variations: [
      {
        sentence: 'We had to ___ off the meeting. (aplazar)',
        answer: 'put',
        translation: 'Tuvimos que aplazar la reunión.',
      },
      {
        sentence: "I can't ___ up with the noise. (aguantar)",
        answer: 'put',
        translation: 'No aguanto el ruido.',
      },
      {
        sentence: 'She ___ up smoking last year. (dejar)',
        answer: 'gave',
        translation: 'Dejó de fumar el año pasado.',
      },
      {
        sentence: 'The plane ___ off on time. (despegar)',
        answer: 'took',
        translation: 'El avión despegó a su hora.',
      },
      {
        sentence: 'Can you ___ out the light? (apagar)',
        answer: 'turn',
        translation: '¿Puedes apagar la luz?',
      },
      {
        sentence: 'He ___ across as arrogant. (dar la impresión)',
        answer: 'comes',
        translation: 'Da la impresión de ser arrogante.',
      },
      {
        sentence: 'They ___ down the old cinema. (derribar)',
        answer: 'pulled',
        translation: 'Derribaron el viejo cine.',
      },
      {
        sentence: 'I ___ into an old friend yesterday. (encontrarse por casualidad)',
        answer: 'ran',
        translation: 'Ayer me encontré con un viejo amigo.',
      },
    ],
  },
  {
    skillId: 'en.c2.style.nominalization',
    explanation:
      'El registro académico convierte los verbos en sustantivos: «they decided» → «their decision». La frase se vuelve más densa y más impersonal, que es justo lo que ese registro pide.',
    variations: [
      {
        sentence: 'they decided → their ___',
        answer: 'decision',
        translation: 'decidieron → su decisión',
      },
      {
        sentence: 'he analysed → his ___',
        answer: 'analysis',
        translation: 'analizó → su análisis',
      },
      {
        sentence: 'we assume → our ___',
        answer: 'assumption',
        translation: 'asumimos → nuestra suposición',
      },
      {
        sentence: 'they failed → their ___',
        answer: 'failure',
        translation: 'fracasaron → su fracaso',
      },
      {
        sentence: 'she argued → her ___',
        answer: 'argument',
        translation: 'argumentó → su argumento',
      },
      {
        sentence: 'we conclude → our ___',
        answer: 'conclusion',
        translation: 'concluimos → nuestra conclusión',
      },
      {
        sentence: 'they grew → their ___',
        answer: 'growth',
        translation: 'crecieron → su crecimiento',
      },
      {
        sentence: 'he described → his ___',
        answer: 'description',
        translation: 'describió → su descripción',
      },
    ],
  },
  // ══════════════════════════════════════════════════════════════════════════
  // FRANCÉS — A1 y A2
  // ══════════════════════════════════════════════════════════════════════════
  {
    skillId: 'fr.a1.article.gender',
    explanation:
      'En francés el artículo lleva el género pegado: **le/un** para masculino, **la/une** para femenino. No coincide con el español —*la table* es femenino, *le livre* masculino— así que el género se aprende CON la palabra, no después.',
    variations: [
      { sentence: 'Je cherche ___ gare.', answer: 'la', translation: 'Busco la estación.' },
      { sentence: 'Il lit ___ livre.', answer: 'le', translation: 'Él lee el libro.' },
      {
        sentence: "Je voudrais ___ café, s'il vous plaît.",
        answer: 'un',
        translation: 'Quisiera un café, por favor.',
      },
      {
        sentence: 'Elle achète ___ voiture rouge.',
        answer: 'une',
        translation: 'Ella compra un coche rojo.',
      },
      { sentence: 'Nous ouvrons ___ fenêtre.', answer: 'la', translation: 'Abrimos la ventana.' },
      {
        sentence: "C'est ___ problème difficile.",
        answer: 'un',
        translation: 'Es un problema difícil.',
      },
      {
        sentence: 'Tu prends ___ bus ou le métro ?',
        answer: 'le',
        translation: '¿Tomás el autobús o el metro?',
      },
    ],
  },
  {
    skillId: 'fr.a1.verb.present-er',
    explanation:
      'Los verbos en **-er** son el grupo más grande y el más regular: se quita la -er y se añade **-e, -es, -e, -ons, -ez, -ent**. Las tres primeras personas y la tercera del plural suenan igual, pero se escriben distinto.',
    variations: [
      {
        sentence: 'Je ___ le français. (parler)',
        answer: 'parle',
        translation: 'Yo hablo francés.',
      },
      {
        sentence: 'Tu ___ à Paris. (habiter)',
        answer: 'habites',
        translation: 'Vos vivís en París.',
      },
      {
        sentence: 'Elle ___ la musique. (aimer)',
        answer: 'aime',
        translation: 'A ella le gusta la música.',
      },
      {
        sentence: 'Nous ___ le bus. (chercher)',
        answer: 'cherchons',
        translation: 'Buscamos el autobús.',
      },
      {
        sentence: 'Vous ___ beaucoup. (travailler)',
        answer: 'travaillez',
        translation: 'Ustedes trabajan mucho.',
      },
      {
        sentence: 'Ils ___ la porte. (fermer)',
        answer: 'ferment',
        translation: 'Ellos cierran la puerta.',
      },
    ],
  },
  {
    skillId: 'fr.a1.verb.etre-avoir',
    explanation:
      '**être** y **avoir** son irregulares y hay que sabérselos de memoria, porque además sirven para construir el pasado. Ojo: la edad va con *avoir* (*j’ai vingt ans*), no con *ser*.',
    variations: [
      { sentence: 'Je ___ étudiant. (être)', answer: 'suis', translation: 'Soy estudiante.' },
      { sentence: 'Tu ___ vingt ans. (avoir)', answer: 'as', translation: 'Tenés veinte años.' },
      { sentence: 'Elle ___ française. (être)', answer: 'est', translation: 'Ella es francesa.' },
      {
        sentence: 'Nous ___ une voiture. (avoir)',
        answer: 'avons',
        translation: 'Tenemos un coche.',
      },
      {
        sentence: 'Vous ___ en retard. (être)',
        answer: 'êtes',
        translation: 'Ustedes llegan tarde.',
      },
      { sentence: 'Ils ___ faim. (avoir)', answer: 'ont', translation: 'Ellos tienen hambre.' },
    ],
  },
  {
    skillId: 'fr.a1.noun.plural',
    explanation:
      'El plural normal es una **-s** que no se pronuncia: lo que avisa de que hay plural es el artículo (*les*, *des*). Las terminaciones **-al** hacen **-aux** y **-eau** hace **-eaux**.',
    variations: [
      { sentence: 'Je vois deux ___. (chat)', answer: 'chats', translation: 'Veo dos gatos.' },
      {
        sentence: 'Il y a trois ___ sur la table. (livre)',
        answer: 'livres',
        translation: 'Hay tres libros sobre la mesa.',
      },
      {
        sentence: 'Elle achète des ___. (journal)',
        answer: 'journaux',
        translation: 'Ella compra periódicos.',
      },
      {
        sentence: 'Nous avons deux ___. (bureau)',
        answer: 'bureaux',
        translation: 'Tenemos dos escritorios.',
      },
      { sentence: 'Ce sont mes ___. (ami)', answer: 'amis', translation: 'Son mis amigos.' },
      {
        sentence: 'Les ___ sont ouverts. (hôpital)',
        answer: 'hôpitaux',
        translation: 'Los hospitales están abiertos.',
      },
    ],
  },
  {
    skillId: 'fr.a1.negation.ne-pas',
    explanation:
      'La negación francesa es un **sándwich**: *ne* delante del verbo y *pas* detrás. El verbo queda en medio. Delante de vocal, *ne* se convierte en **n’**.',
    variations: [
      {
        sentence: 'Je ne ___ pas le russe. (parler)',
        answer: 'parle',
        translation: 'No hablo ruso.',
      },
      {
        sentence: "Elle n'___ pas de voiture. (avoir)",
        answer: 'a',
        translation: 'Ella no tiene coche.',
      },
      {
        sentence: 'Nous ne ___ pas ce film. (aimer)',
        answer: 'aimons',
        translation: 'No nos gusta esta película.',
      },
      {
        sentence: "Tu n'___ pas à Madrid. (habiter)",
        answer: 'habites',
        translation: 'No vivís en Madrid.',
      },
      {
        sentence: 'Ils ne ___ pas le dimanche. (travailler)',
        answer: 'travaillent',
        translation: 'Ellos no trabajan el domingo.',
      },
      {
        sentence: "Vous n'___ pas français. (être)",
        answer: 'êtes',
        translation: 'Ustedes no son franceses.',
      },
    ],
  },
  {
    skillId: 'fr.a1.possessive.adjectives',
    explanation:
      'El posesivo concuerda con **lo poseído**, no con quien posee: *son frère* es «su hermano» sea de él o de ella. Y delante de vocal, *ma* se vuelve **mon**: *mon école*, aunque *école* sea femenino.',
    variations: [
      { sentence: "C'est ___ frère.", answer: 'mon', translation: 'Es mi hermano.' },
      { sentence: 'Voici ___ sœur.', answer: 'ma', translation: 'Esta es mi hermana.' },
      { sentence: 'Ce sont ___ parents.', answer: 'mes', translation: 'Son mis padres.' },
      { sentence: "J'aime ___ école.", answer: 'mon', translation: 'Me gusta mi escuela.' },
      { sentence: 'Il cherche ___ clés.', answer: 'ses', translation: 'Él busca sus llaves.' },
      {
        sentence: 'Nous invitons ___ amis.',
        answer: 'nos',
        translation: 'Invitamos a nuestros amigos.',
      },
      {
        sentence: "C'est ___ voiture, madame ?",
        answer: 'votre',
        translation: '¿Es su coche, señora?',
      },
    ],
  },
  {
    skillId: 'fr.a1.question.formation',
    explanation:
      'Con **est-ce que** no hay que tocar el orden de la frase: se pone delante y ya. La palabra interrogativa va antes: *Où est-ce que tu habites ?*',
    variations: [
      {
        sentence: '— ___ est-ce que tu habites ? — À Lyon.',
        answer: 'Où',
        translation: '—¿Dónde vivís? —En Lyon.',
      },
      {
        sentence: '— ___ est-ce que vous partez ? — Demain.',
        answer: 'Quand',
        translation: '—¿Cuándo se van? —Mañana.',
      },
      {
        sentence: "— ___ est-ce qu'elle s'appelle ? — Marie.",
        answer: 'Comment',
        translation: '—¿Cómo se llama? —Marie.',
      },
      {
        sentence: "— ___ est-ce qu'il pleure ? — Il est triste.",
        answer: 'Pourquoi',
        translation: '—¿Por qué llora? —Está triste.',
      },
      {
        sentence: '— ___ coûte ce livre ? — Douze euros.',
        answer: 'Combien',
        translation: '—¿Cuánto cuesta este libro? —Doce euros.',
      },
      {
        sentence: '— Avec ___ est-ce que tu viens ? — Avec Marie.',
        answer: 'qui',
        translation: '—¿Con quién venís? —Con Marie.',
      },
    ],
  },
  {
    skillId: 'fr.a1.pronoun.subject',
    explanation:
      'En francés el sujeto **no se puede omitir**: al revés que en español, *hablo* es siempre *je parle*. Y **on** es el comodín: significa «uno», «la gente» y, en la calle, «nosotros».',
    variations: [
      { sentence: '___ suis argentin.', answer: 'Je', translation: 'Soy argentino.' },
      { sentence: '___ es étudiante.', answer: 'Tu', translation: 'Vos sos estudiante.' },
      { sentence: '___ est professeur.', answer: 'Il', translation: 'Él es profesor.' },
      { sentence: '___ sommes à Paris.', answer: 'Nous', translation: 'Estamos en París.' },
      { sentence: '___ êtes en retard.', answer: 'Vous', translation: 'Ustedes llegan tarde.' },
      { sentence: '___ sont français.', answer: 'Ils', translation: 'Ellos son franceses.' },
      {
        sentence: 'En France, ___ dîne à vingt heures.',
        answer: 'on',
        translation: 'En Francia se cena a las ocho.',
      },
    ],
  },
  {
    skillId: 'fr.a1.verb.imperative',
    explanation:
      'El imperativo es el presente **sin el pronombre**. En los verbos en -er, la forma de *tu* pierde la -s: *tu parles* → **parle !** *être* y *avoir* son irregulares: *sois*, *soyez*, *aie*, *ayez*.',
    variations: [
      {
        sentence: "___ la porte, s'il te plaît ! (fermer)",
        answer: 'Ferme',
        translation: '¡Cerrá la puerta, por favor!',
      },
      {
        sentence: '___ plus lentement ! (parler)',
        answer: 'Parle',
        translation: '¡Hablá más despacio!',
      },
      {
        sentence: '___ vos livres à la page 10 ! (ouvrir)',
        answer: 'Ouvrez',
        translation: '¡Abran los libros en la página 10!',
      },
      {
        sentence: '___ ici, les enfants ! (venir)',
        answer: 'Venez',
        translation: '¡Vengan aquí, chicos!',
      },
      { sentence: '___ attention ! (faire)', answer: 'Fais', translation: '¡Prestá atención!' },
      { sentence: '___ patients ! (être)', answer: 'Soyez', translation: '¡Tengan paciencia!' },
      { sentence: "N'___ pas peur ! (avoir)", answer: 'aie', translation: '¡No tengas miedo!' },
    ],
  },
  {
    skillId: 'fr.a2.verb.passe-compose',
    explanation:
      'El passé composé se arma con **avoir o être** + participio. La mayoría va con *avoir*; los verbos de movimiento y cambio de estado (aller, venir, partir, arriver, rester, naître, mourir) van con **être**, y entonces el participio concuerda: *elle est allée*.',
    variations: [
      {
        sentence: "J'___ mangé une pomme. (avoir)",
        answer: 'ai',
        translation: 'Comí una manzana.',
      },
      {
        sentence: 'Elle ___ allée à Paris. (être)',
        answer: 'est',
        translation: 'Ella fue a París.',
      },
      {
        sentence: 'Nous ___ fini le travail. (avoir)',
        answer: 'avons',
        translation: 'Terminamos el trabajo.',
      },
      {
        sentence: 'Ils ___ partis hier. (être)',
        answer: 'sont',
        translation: 'Ellos se fueron ayer.',
      },
      {
        sentence: 'Tu ___ vu ce film ? (avoir)',
        answer: 'as',
        translation: '¿Viste esta película?',
      },
      {
        sentence: 'Vous ___ arrivés tard. (être)',
        answer: 'êtes',
        translation: 'Ustedes llegaron tarde.',
      },
    ],
  },
  {
    skillId: 'fr.a2.verb.semi-modals',
    explanation:
      '**vouloir** (querer), **pouvoir** (poder) y **devoir** (deber) van seguidos de **infinitivo**, sin preposición en medio: *je dois partir*, nunca «je dois à partir».',
    variations: [
      {
        sentence: 'Je ___ partir maintenant. (devoir)',
        answer: 'dois',
        translation: 'Tengo que irme ahora.',
      },
      {
        sentence: 'Tu ___ venir avec nous ? (pouvoir)',
        answer: 'peux',
        translation: '¿Podés venir con nosotros?',
      },
      {
        sentence: 'Elle ___ un café. (vouloir)',
        answer: 'veut',
        translation: 'Ella quiere un café.',
      },
      {
        sentence: 'Nous ___ étudier ce soir. (devoir)',
        answer: 'devons',
        translation: 'Tenemos que estudiar esta noche.',
      },
      {
        sentence: "Vous ___ m'aider ? (pouvoir)",
        answer: 'pouvez',
        translation: '¿Pueden ayudarme?',
      },
      {
        sentence: 'Ils ___ visiter le musée. (vouloir)',
        answer: 'veulent',
        translation: 'Ellos quieren visitar el museo.',
      },
    ],
  },
  {
    skillId: 'fr.a2.verb.futur-proche',
    explanation:
      'El futuro más usado al hablar es **aller + infinitivo**, igual que el «voy a…» español. Solo hay que conjugar *aller*: vais, vas, va, allons, allez, vont.',
    variations: [
      {
        sentence: 'Je ___ manger dans une heure. (aller)',
        answer: 'vais',
        translation: 'Voy a comer dentro de una hora.',
      },
      {
        sentence: 'Tu ___ partir demain. (aller)',
        answer: 'vas',
        translation: 'Vas a irte mañana.',
      },
      {
        sentence: 'Elle ___ appeler ce soir. (aller)',
        answer: 'va',
        translation: 'Ella va a llamar esta noche.',
      },
      {
        sentence: 'Nous ___ visiter Paris. (aller)',
        answer: 'allons',
        translation: 'Vamos a visitar París.',
      },
      {
        sentence: 'Vous ___ adorer ce film. (aller)',
        answer: 'allez',
        translation: 'Van a adorar esta película.',
      },
      {
        sentence: 'Ils ___ arriver bientôt. (aller)',
        answer: 'vont',
        translation: 'Van a llegar pronto.',
      },
    ],
  },
  {
    skillId: 'fr.a2.comparison',
    explanation:
      'Comparar es **plus / moins / aussi** + adjetivo + **que**. Las dos excepciones son las de siempre: *bon* hace **meilleur** y *bien* hace **mieux** — nunca «plus bon».',
    variations: [
      {
        sentence: 'Marie est ___ grande que Paul.',
        answer: 'plus',
        translation: 'Marie es más alta que Paul.',
      },
      {
        sentence: "Ce livre est ___ cher que l'autre.",
        answer: 'moins',
        translation: 'Este libro es menos caro que el otro.',
      },
      {
        sentence: 'Il court ___ vite que moi.',
        answer: 'aussi',
        translation: 'Él corre tan rápido como yo.',
      },
      {
        sentence: 'C’est le ___ grand musée de la ville.',
        answer: 'plus',
        translation: 'Es el museo más grande de la ciudad.',
      },
      {
        sentence: "Cette solution est ___ que l'autre. (bon)",
        answer: 'meilleure',
        translation: 'Esta solución es mejor que la otra.',
      },
      {
        sentence: 'Il chante ___ que son frère. (bien)',
        answer: 'mieux',
        translation: 'Él canta mejor que su hermano.',
      },
    ],
  },
  {
    skillId: 'fr.a2.pronoun.cod-coi',
    explanation:
      'La pregunta es si el verbo lleva **à** delante de la persona. Sin *à* es COD (**le, la, les**); con *à* es COI (**lui, leur**). *Voir quelqu’un* → *je la vois*. *Parler à quelqu’un* → *je lui parle*.',
    variations: [
      {
        sentence: 'Tu vois Marie ? — Oui, je ___ vois.',
        answer: 'la',
        translation: '¿Ves a Marie? —Sí, la veo.',
      },
      {
        sentence: 'Tu parles à Marie ? — Oui, je ___ parle.',
        answer: 'lui',
        translation: '¿Le hablás a Marie? —Sí, le hablo.',
      },
      {
        sentence: 'Vous achetez les livres ? — Oui, nous ___ achetons.',
        answer: 'les',
        translation: '¿Compran los libros? —Sí, los compramos.',
      },
      {
        sentence: 'Tu écris à tes parents ? — Oui, je ___ écris.',
        answer: 'leur',
        translation: '¿Les escribís a tus padres? —Sí, les escribo.',
      },
      {
        sentence: 'Il regarde le film ? — Oui, il ___ regarde.',
        answer: 'le',
        translation: '¿Él mira la película? —Sí, la mira.',
      },
      {
        sentence: 'Elle téléphone à Paul ? — Oui, elle ___ téléphone.',
        answer: 'lui',
        translation: '¿Ella llama a Paul? —Sí, lo llama.',
      },
    ],
  },
  {
    skillId: 'fr.a2.impersonal.il-faut',
    explanation:
      'Las dos se traducen con un impersonal español, pero no son intercambiables: **il y a** dice que algo EXISTE («hay»), **il faut** dice que algo es NECESARIO («hay que»). El *il* no es nadie: es de relleno, y no se puede quitar.',
    variations: [
      {
        sentence: 'Sur la table, ___ trois livres.',
        answer: 'il y a',
        translation: 'Sobre la mesa hay tres libros.',
      },
      {
        sentence: 'Pour entrer, ___ un billet.',
        answer: 'il faut',
        translation: 'Para entrar hace falta una entrada.',
      },
      {
        sentence: 'Dans ce quartier, ___ deux écoles.',
        answer: 'il y a',
        translation: 'En este barrio hay dos escuelas.',
      },
      {
        sentence: '___ partir tout de suite, on est en retard.',
        answer: 'Il faut',
        translation: 'Hay que salir enseguida, llegamos tarde.',
      },
      {
        sentence: 'Au frigo, ___ du lait.',
        answer: 'il y a',
        translation: 'En la heladera hay leche.',
      },
      {
        sentence: 'Pour conduire, ___ avoir dix-huit ans.',
        answer: 'il faut',
        translation: 'Para conducir hay que tener dieciocho años.',
      },
    ],
  },
  {
    skillId: 'fr.a2.preposition.place-time',
    explanation:
      'Con países femeninos va **en** (*en France*), con masculinos **au** (*au Portugal*), y con ciudades **à** (*à Paris*). En el tiempo, **depuis** mira hacia atrás («desde hace») y **dans** hacia adelante («dentro de»).',
    variations: [
      {
        sentence: 'Je vais ___ France cet été.',
        answer: 'en',
        translation: 'Voy a Francia este verano.',
      },
      { sentence: 'Il habite ___ Portugal.', answer: 'au', translation: 'Él vive en Portugal.' },
      {
        sentence: 'Nous partons ___ Paris demain.',
        answer: 'à',
        translation: 'Salimos hacia París mañana.',
      },
      {
        sentence: 'Le magasin ouvre ___ 9 heures.',
        answer: 'à',
        translation: 'La tienda abre a las 9.',
      },
      {
        sentence: 'Je travaille ici ___ trois ans.',
        answer: 'depuis',
        translation: 'Trabajo aquí desde hace tres años.',
      },
      {
        sentence: 'Ils reviennent ___ deux semaines.',
        answer: 'dans',
        translation: 'Vuelven dentro de dos semanas.',
      },
    ],
  },
  {
    skillId: 'fr.a2.adjective.position',
    explanation:
      'En francés el adjetivo va **detrás** del sustantivo casi siempre: *une voiture rouge*. Solo un grupo corto y muy frecuente va delante —**beau, joli, petit, grand, vieux, bon, nouveau**— y cuando hay dos, cada uno se queda en su sitio.',
    variations: [
      {
        kind: 'order',
        sentence: 'C’est une grande maison blanche.',
        translation: 'Es una casa grande y blanca.',
      },
      {
        kind: 'order',
        sentence: "J'ai acheté une jolie robe rouge.",
        translation: 'Compré un vestido bonito y rojo.',
      },
      {
        kind: 'order',
        sentence: 'Il porte un vieux pull noir.',
        translation: 'Él lleva un pulóver viejo y negro.',
      },
      {
        kind: 'order',
        sentence: 'Nous avons visité un petit village italien.',
        translation: 'Visitamos un pueblito italiano.',
      },
      {
        kind: 'order',
        sentence: 'C’est un bon restaurant japonais.',
        translation: 'Es un buen restaurante japonés.',
      },
      {
        kind: 'order',
        sentence: 'Ils habitent dans un bel appartement moderne.',
        translation: 'Viven en un departamento lindo y moderno.',
      },
    ],
  },
  // ══════════════════════════════════════════════════════════════════════════
  // FRANCÉS — B1 y B2
  // ══════════════════════════════════════════════════════════════════════════
  {
    skillId: 'fr.b1.verb.imparfait',
    explanation:
      'El imparfait se saca de la forma **nous** del presente: *nous parlons* → **parl-** + ais, ais, ait, ions, iez, aient. La única excepción es *être*, que hace **ét-**.',
    variations: [
      {
        sentence: 'Quand j’étais petit, je ___ au parc. (aller)',
        answer: 'allais',
        translation: 'De chico iba al parque.',
      },
      {
        sentence: 'Il ___ toujours en retard. (être)',
        answer: 'était',
        translation: 'Él siempre llegaba tarde.',
      },
      {
        sentence: 'Nous ___ la télé tous les soirs. (regarder)',
        answer: 'regardions',
        translation: 'Mirábamos la tele todas las noches.',
      },
      {
        sentence: 'Vous ___ beaucoup à cette époque. (voyager)',
        answer: 'voyagiez',
        translation: 'Ustedes viajaban mucho en esa época.',
      },
      {
        sentence: 'Elles ___ à Paris avant. (habiter)',
        answer: 'habitaient',
        translation: 'Ellas vivían en París antes.',
      },
      {
        sentence: 'Tu ___ faim tous les matins. (avoir)',
        answer: 'avais',
        translation: 'Tenías hambre todas las mañanas.',
      },
    ],
  },
  {
    skillId: 'fr.b1.aspect.imparfait-vs-pc',
    explanation:
      'No es cuestión de cuánto duró: es de **qué papel juega**. El imparfait pinta el decorado (cómo estaban las cosas, lo que se repetía); el passé composé cuenta lo que **pasó** y empujó la historia. En la misma frase suelen convivir: *je dormais quand le téléphone a sonné*.',
    variations: [
      {
        sentence: 'Je ___ quand le téléphone a sonné. (dormir)',
        answer: 'dormais',
        translation: 'Dormía cuando sonó el teléfono.',
      },
      {
        sentence: 'Hier, j’___ un très bon film. (voir)',
        answer: 'ai vu',
        translation: 'Ayer vi una película muy buena.',
      },
      {
        sentence: 'Il faisait beau, alors nous ___ à la plage. (aller)',
        answer: 'sommes allés',
        translation: 'Hacía buen tiempo, así que fuimos a la playa.',
      },
      {
        sentence: 'Tous les étés, on ___ chez ma grand-mère. (aller)',
        answer: 'allait',
        translation: 'Todos los veranos íbamos a casa de mi abuela.',
      },
      {
        sentence: 'Elle lisait tranquillement quand quelqu’un ___ à la porte. (frapper)',
        answer: 'a frappé',
        translation: 'Leía tranquila cuando alguien golpeó la puerta.',
      },
      {
        sentence: 'Avant, je ne ___ pas le café. (aimer)',
        answer: 'aimais',
        translation: 'Antes no me gustaba el café.',
      },
    ],
  },
  {
    skillId: 'fr.b1.verb.futur-simple',
    explanation:
      'El futur simple se arma sobre el **infinitivo entero** + ai, as, a, ons, ez, ont. Los -re pierden la e final: *prendre* → **prendr-**. Los irregulares son pocos y muy usados: *être* → ser-, *avoir* → aur-, *aller* → ir-, *faire* → fer-.',
    variations: [
      {
        sentence: 'Demain je ___ mes amis. (visiter)',
        answer: 'visiterai',
        translation: 'Mañana visitaré a mis amigos.',
      },
      {
        sentence: 'Tu ___ ce livre la semaine prochaine. (finir)',
        answer: 'finiras',
        translation: 'Terminarás este libro la semana que viene.',
      },
      {
        sentence: 'Il ___ médecin un jour. (être)',
        answer: 'sera',
        translation: 'Él será médico algún día.',
      },
      {
        sentence: 'Nous ___ le temps demain. (avoir)',
        answer: 'aurons',
        translation: 'Tendremos tiempo mañana.',
      },
      {
        sentence: 'Vous ___ en Italie cet été. (aller)',
        answer: 'irez',
        translation: 'Ustedes irán a Italia este verano.',
      },
      {
        sentence: 'Ils ___ le train de 8 heures. (prendre)',
        answer: 'prendront',
        translation: 'Tomarán el tren de las 8.',
      },
    ],
  },
  {
    skillId: 'fr.b1.verb.conditionnel',
    explanation:
      'El condicional es la **raíz del futuro** con las terminaciones del imparfait: *je ferai* (haré) → *je ferais* (haría). Una sola letra los separa al escribir, y en el habla la diferencia también es mínima: hay que fijarse.',
    variations: [
      {
        sentence: 'Je ___ un café, s’il vous plaît. (vouloir)',
        answer: 'voudrais',
        translation: 'Querría un café, por favor.',
      },
      {
        sentence: 'Tu ___ m’aider ? (pouvoir)',
        answer: 'pourrais',
        translation: '¿Podrías ayudarme?',
      },
      {
        sentence: 'À ta place, je ___ le train. (prendre)',
        answer: 'prendrais',
        translation: 'En tu lugar, tomaría el tren.',
      },
      {
        sentence: 'Nous ___ partir plus tôt. (devoir)',
        answer: 'devrions',
        translation: 'Deberíamos irnos más temprano.',
      },
      {
        sentence: 'Ce ___ une bonne idée. (être)',
        answer: 'serait',
        translation: 'Sería una buena idea.',
      },
      {
        sentence: 'Ils ___ venir avec nous. (aimer)',
        answer: 'aimeraient',
        translation: 'A ellos les gustaría venir con nosotros.',
      },
    ],
  },
  {
    skillId: 'fr.b1.clause.subordinate',
    explanation:
      'La subordinada va con **que** y el verbo se queda en su sitio: *je pense que tu as raison*. Al revés que en español, *que* **no se puede omitir** nunca: «je pense tu as raison» no existe.',
    variations: [
      {
        sentence: 'Je pense ___ tu as raison.',
        answer: 'que',
        translation: 'Creo que tenés razón.',
      },
      {
        sentence: 'Il est parti ___ il était fatigué.',
        answer: 'parce qu’',
        translation: 'Se fue porque estaba cansado.',
      },
      {
        sentence: 'Elle dit ___ elle viendra demain.',
        answer: 'qu’',
        translation: 'Dice que vendrá mañana.',
      },
      {
        sentence: 'Nous savons ___ le magasin est fermé.',
        answer: 'que',
        translation: 'Sabemos que la tienda está cerrada.',
      },
      {
        sentence: '___ il pleuvait, nous sommes sortis.',
        answer: 'Bien qu’',
        translation: 'Aunque llovía, salimos.',
      },
      {
        sentence: 'J’espère ___ tout ira bien.',
        answer: 'que',
        translation: 'Espero que todo vaya bien.',
      },
    ],
  },
  {
    skillId: 'fr.b1.subjunctive.intro',
    explanation:
      'El subjuntivo no lo decide el significado, lo decide **la palabra que lo introduce**. *Bien que*, *pour que*, *avant que* y *il faut que* lo piden siempre; *parce que*, *pendant que* y *je pense que* (afirmativo) piden indicativo. Hay que aprender la lista, no razonarla.',
    variations: [
      {
        sentence: 'Il faut que tu ___ tout de suite. (partir)',
        answer: 'partes',
        translation: 'Hace falta que te vayas enseguida.',
      },
      {
        sentence: 'Bien qu’il ___ fatigué, il continue. (être)',
        answer: 'soit',
        translation: 'Aunque esté cansado, sigue.',
      },
      {
        sentence: 'Je pense qu’elle ___ raison. (avoir)',
        answer: 'a',
        translation: 'Creo que ella tiene razón.',
      },
      {
        sentence: 'Pour que vous ___ comprendre, je répète. (pouvoir)',
        answer: 'puissiez',
        translation: 'Para que puedan entender, repito.',
      },
      {
        sentence: 'Il est parti parce qu’il ___ tard. (être)',
        answer: 'était',
        translation: 'Se fue porque era tarde.',
      },
      {
        sentence: 'Je veux que tu ___ avec moi. (venir)',
        answer: 'viennes',
        translation: 'Quiero que vengas conmigo.',
      },
    ],
  },
  {
    skillId: 'fr.b1.pronoun.y-en',
    explanation:
      'La pregunta no es qué significan, sino **qué preposición había**. Lo que iba con **à** o con un lugar se sustituye por **y**; lo que iba con **de** o con una cantidad, por **en**. *Je pense à Paris* → *j’y pense*. *Je parle de mon travail* → *j’en parle*.',
    variations: [
      {
        sentence: 'Tu vas à Paris ? — Oui, j’___ vais demain.',
        answer: 'y',
        translation: '¿Vas a París? —Sí, voy mañana.',
      },
      {
        sentence: 'Tu parles de ton travail ? — Oui, j’___ parle souvent.',
        answer: 'en',
        translation: '¿Hablás de tu trabajo? —Sí, hablo seguido de eso.',
      },
      {
        sentence: 'Tu as du pain ? — Oui, j’___ ai.',
        answer: 'en',
        translation: '¿Tenés pan? —Sí, tengo.',
      },
      {
        sentence: 'Vous pensez à ce problème ? — Oui, nous ___ pensons.',
        answer: 'y',
        translation: '¿Piensan en ese problema? —Sí, pensamos en eso.',
      },
      {
        sentence: 'Elle revient du marché ? — Oui, elle ___ revient.',
        answer: 'en',
        translation: '¿Vuelve del mercado? —Sí, vuelve de ahí.',
      },
      {
        sentence: 'Il joue au tennis ? — Oui, il ___ joue le samedi.',
        answer: 'y',
        translation: '¿Juega al tenis? —Sí, juega los sábados.',
      },
    ],
  },
  {
    skillId: 'fr.b1.conjunction.time',
    explanation:
      'Con **quand**, **lorsque** y **dès que**, el francés pone el **futuro** donde el español pone presente o subjuntivo: *quand tu **arriveras**, appelle-moi* («cuando llegues»). Es de los errores que más delatan al hispanohablante.',
    variations: [
      {
        sentence: 'Quand tu ___, appelle-moi. (arriver)',
        answer: 'arriveras',
        translation: 'Cuando llegues, llamame.',
      },
      {
        sentence: 'Dès que je ___ le temps, je t’écrirai. (avoir)',
        answer: 'aurai',
        translation: 'En cuanto tenga tiempo, te escribo.',
      },
      {
        sentence: 'Lorsqu’il ___ prêt, nous partirons. (être)',
        answer: 'sera',
        translation: 'Cuando esté listo, saldremos.',
      },
      {
        sentence: 'Quand nous ___ à Paris, il fera froid. (arriver)',
        answer: 'arriverons',
        translation: 'Cuando lleguemos a París, hará frío.',
      },
      {
        sentence: 'Pendant que tu ___, je préparerai le dîner. (travailler)',
        answer: 'travailleras',
        translation: 'Mientras trabajes, prepararé la cena.',
      },
      {
        sentence: 'Dès qu’elle ___, préviens-moi. (finir)',
        answer: 'finira',
        translation: 'En cuanto termine, avisame.',
      },
    ],
  },
  {
    skillId: 'fr.b1.negation.advanced',
    explanation:
      'El *pas* se cambia por otra palabra, pero el **ne se queda**: *ne… jamais* (nunca), *ne… rien* (nada), *ne… personne* (nadie), *ne… plus* (ya no). Nunca se ponen los dos: «ne pas jamais» no existe.',
    variations: [
      {
        sentence: 'Je ne mange ___ de viande.',
        answer: 'jamais',
        translation: 'Nunca como carne.',
      },
      {
        sentence: 'Il n’y a ___ dans le frigo.',
        answer: 'rien',
        translation: 'No hay nada en la heladera.',
      },
      {
        sentence: 'Je ne connais ___ ici.',
        answer: 'personne',
        translation: 'No conozco a nadie acá.',
      },
      {
        sentence: 'Elle ne fume ___ depuis un an.',
        answer: 'plus',
        translation: 'Ya no fuma desde hace un año.',
      },
      {
        sentence: 'Nous n’avons ___ vu ce film.',
        answer: 'jamais',
        translation: 'Nunca vimos esa película.',
      },
      {
        sentence: 'Il ne reste ___ à faire.',
        answer: 'rien',
        translation: 'No queda nada por hacer.',
      },
    ],
  },
  {
    skillId: 'fr.b1.pronoun.indefinite',
    explanation:
      '**quelqu’un** y **quelque chose** son los positivos; sus negativos son **personne** y **rien**, y arrastran el *ne* al verbo. En una respuesta corta van solos: *— Qui est là ? — Personne.*',
    variations: [
      {
        sentence: '___ a sonné à la porte.',
        answer: 'Quelqu’un',
        translation: 'Alguien tocó el timbre.',
      },
      {
        sentence: 'J’ai acheté ___ pour toi.',
        answer: 'quelque chose',
        translation: 'Compré algo para vos.',
      },
      {
        sentence: 'Il n’y a ___ dans la salle.',
        answer: 'personne',
        translation: 'No hay nadie en la sala.',
      },
      { sentence: 'Je ne veux ___ manger.', answer: 'rien', translation: 'No quiero comer nada.' },
      {
        sentence: 'Est-ce que ___ peut m’aider ?',
        answer: 'quelqu’un',
        translation: '¿Alguien puede ayudarme?',
      },
      {
        sentence: '___ ne comprend cette règle.',
        answer: 'Personne',
        translation: 'Nadie entiende esta regla.',
      },
    ],
  },
  {
    skillId: 'fr.b1.time.depuis-pendant',
    explanation:
      'En español casi todas son «hace», y ahí está la trampa. **depuis**: empezó antes y **sigue** (*depuis trois ans*). **il y a**: terminado, cuándo pasó (*il y a trois ans*). **pendant**: cuánto duró, cerrado. **dans**: cuánto falta para que empiece.',
    variations: [
      {
        sentence: 'Je travaille ici ___ trois ans.',
        answer: 'depuis',
        translation: 'Trabajo aquí desde hace tres años.',
      },
      {
        sentence: 'Il est parti ___ deux heures.',
        answer: 'il y a',
        translation: 'Se fue hace dos horas.',
      },
      {
        sentence: 'J’ai étudié ___ six mois, puis j’ai arrêté.',
        answer: 'pendant',
        translation: 'Estudié durante seis meses y después dejé.',
      },
      {
        sentence: 'Le train arrive ___ dix minutes.',
        answer: 'dans',
        translation: 'El tren llega dentro de diez minutos.',
      },
      {
        sentence: 'Elle habite à Lyon ___ 2019.',
        answer: 'depuis',
        translation: 'Vive en Lyon desde 2019.',
      },
      {
        sentence: 'Nous nous sommes rencontrés ___ un an.',
        answer: 'il y a',
        translation: 'Nos conocimos hace un año.',
      },
    ],
  },
  {
    skillId: 'fr.b1.conditional.si-imparfait',
    explanation:
      'Detrás de **si** nunca va condicional: va **imparfait**, y el condicional se queda en la otra mitad. *Si j’**avais** le temps, je **viendrais***. Sirve igual para hipótesis y para pedir algo con educación.',
    variations: [
      {
        sentence: 'Si j’___ le temps, je viendrais. (avoir)',
        answer: 'avais',
        translation: 'Si tuviera tiempo, iría.',
      },
      {
        sentence: 'Si tu ___ plus tôt, tu ne serais pas fatigué. (dormir)',
        answer: 'dormais',
        translation: 'Si durmieras más temprano, no estarías cansado.',
      },
      {
        sentence: 'Si nous ___ riches, nous voyagerions. (être)',
        answer: 'étions',
        translation: 'Si fuéramos ricos, viajaríamos.',
      },
      {
        sentence: 'Ce serait bien si vous ___ nous aider. (pouvoir)',
        answer: 'pouviez',
        translation: 'Estaría bien si pudieran ayudarnos.',
      },
      {
        sentence: 'Si elle ___ ici, elle comprendrait. (habiter)',
        answer: 'habitait',
        translation: 'Si viviera aquí, entendería.',
      },
      {
        sentence: 'Je serais content si tu ___. (venir)',
        answer: 'venais',
        translation: 'Estaría contento si vinieras.',
      },
    ],
  },
  {
    skillId: 'fr.b1.subjunctive.expectation',
    explanation:
      'Cuando reclamás o esperás algo de alguien, el francés formal pide **subjuntivo**: *j’aimerais que vous **fassiez** un geste*, *je m’attends à ce que ce **soit** réglé*. Es la fórmula de una reclamación educada.',
    variations: [
      {
        sentence: 'J’aimerais que vous ___ un geste commercial. (faire)',
        answer: 'fassiez',
        translation: 'Me gustaría que hicieran un gesto comercial.',
      },
      {
        sentence: 'Je voudrais que ce problème ___ réglé aujourd’hui. (être)',
        answer: 'soit',
        translation: 'Querría que este problema quede resuelto hoy.',
      },
      {
        sentence: 'Il faudrait que quelqu’un ___ vérifier. (venir)',
        answer: 'vienne',
        translation: 'Haría falta que alguien viniera a verificar.',
      },
      {
        sentence: 'J’attends que vous me ___ une réponse. (donner)',
        answer: 'donniez',
        translation: 'Espero que me den una respuesta.',
      },
      {
        sentence: 'Je souhaite que la chambre ___ changée. (être)',
        answer: 'soit',
        translation: 'Deseo que cambien la habitación.',
      },
      {
        sentence: 'Il est important que vous ___ la facture. (garder)',
        answer: 'gardiez',
        translation: 'Es importante que guarden la factura.',
      },
    ],
  },
  {
    skillId: 'fr.b1.aspect.action-vs-result',
    explanation:
      'El passé composé cuenta **lo que se hizo**; el presente describe **cómo está ahora**. *On a réparé la douche* (se arregló) vs. *la douche est réparée* (está arreglada). Confundirlos hace que una reclamación suene a que todavía no pasó nada.',
    variations: [
      {
        sentence: 'Le technicien ___ la douche ce matin. (réparer)',
        answer: 'a réparé',
        translation: 'El técnico arregló la ducha esta mañana.',
      },
      {
        sentence: 'La douche ___ maintenant. (être réparé)',
        answer: 'est réparée',
        translation: 'La ducha ya está arreglada.',
      },
      {
        sentence: 'Nous ___ votre dossier hier. (recevoir)',
        answer: 'avons reçu',
        translation: 'Recibimos su expediente ayer.',
      },
      {
        sentence: 'Le problème ___ depuis ce matin. (être résolu)',
        answer: 'est résolu',
        translation: 'El problema está resuelto desde esta mañana.',
      },
      {
        sentence: 'Ils ___ la chambre à midi. (changer)',
        answer: 'ont changé',
        translation: 'Cambiaron la habitación al mediodía.',
      },
      {
        sentence: 'La facture ___ hier soir. (être envoyé)',
        answer: 'est envoyée',
        translation: 'La factura está enviada desde anoche.',
      },
    ],
  },
  {
    skillId: 'fr.b2.voice.passive',
    explanation:
      'La pasiva es **être + participio**, y el participio concuerda con el sujeto: *la lettre **est écrite***, *les lettres **sont écrites***. El agente entra con **par**. Ojo: *être* marca el tiempo, así que el pasado es *a été*.',
    variations: [
      {
        sentence: 'La lettre ___ par le directeur. (être écrit)',
        answer: 'est écrite',
        translation: 'La carta la escribe el director.',
      },
      {
        sentence: 'Les documents ___ hier. (être envoyé)',
        answer: 'ont été envoyés',
        translation: 'Los documentos fueron enviados ayer.',
      },
      {
        sentence: 'Ce musée ___ en 1850. (être construit)',
        answer: 'a été construit',
        translation: 'Este museo fue construido en 1850.',
      },
      {
        sentence: 'La décision ___ demain. (être prise)',
        answer: 'sera prise',
        translation: 'La decisión se tomará mañana.',
      },
      {
        sentence: 'Les résultats ___ par le jury. (être annoncé)',
        answer: 'sont annoncés',
        translation: 'Los resultados los anuncia el jurado.',
      },
      {
        sentence: 'Cette chanson ___ par des millions de gens. (être écouté)',
        answer: 'est écoutée',
        translation: 'Esta canción la escuchan millones de personas.',
      },
    ],
  },
  {
    skillId: 'fr.b2.pronoun.relative',
    explanation:
      'El relativo lo elige **su función en la subordinada**, no lo que va antes. **qui** = sujeto, **que** = objeto directo, **dont** = lo que llevaba *de*, **où** = lugar o tiempo. Truco: si detrás viene un verbo, *qui*; si viene un sujeto, *que*.',
    variations: [
      {
        sentence: 'C’est le livre ___ m’a plu.',
        answer: 'qui',
        translation: 'Es el libro que me gustó.',
      },
      {
        sentence: 'C’est le livre ___ j’ai lu hier.',
        answer: 'que',
        translation: 'Es el libro que leí ayer.',
      },
      {
        sentence: 'Voici l’ami ___ je t’ai parlé.',
        answer: 'dont',
        translation: 'Este es el amigo del que te hablé.',
      },
      {
        sentence: 'C’est la ville ___ je suis né.',
        answer: 'où',
        translation: 'Es la ciudad donde nací.',
      },
      {
        sentence: 'La femme ___ travaille ici est ma sœur.',
        answer: 'qui',
        translation: 'La mujer que trabaja aquí es mi hermana.',
      },
      {
        sentence: 'Le film ___ tu as besoin est à la bibliothèque.',
        answer: 'dont',
        translation: 'La película que necesitás está en la biblioteca.',
      },
    ],
  },
  {
    skillId: 'fr.b2.verb.plus-que-parfait',
    explanation:
      'Es el pasado **anterior a otro pasado**: *quand je suis arrivé, il **était** déjà **parti***. Se arma con avoir/être en imparfait + participio, y elige auxiliar con las mismas reglas del passé composé.',
    variations: [
      {
        sentence: 'Quand je suis arrivé, il ___ déjà parti. (être)',
        answer: 'était',
        translation: 'Cuando llegué, él ya se había ido.',
      },
      {
        sentence: 'Elle ___ fini son travail avant midi. (avoir)',
        answer: 'avait',
        translation: 'Ella había terminado su trabajo antes del mediodía.',
      },
      {
        sentence: 'Nous ___ vu ce film deux fois. (avoir)',
        answer: 'avions',
        translation: 'Habíamos visto esa película dos veces.',
      },
      {
        sentence: 'Ils ___ sortis quand il a commencé à pleuvoir. (être)',
        answer: 'étaient',
        translation: 'Habían salido cuando empezó a llover.',
      },
      {
        sentence: 'Tu ___ oublié tes clés encore une fois. (avoir)',
        answer: 'avais',
        translation: 'Te habías olvidado las llaves otra vez.',
      },
      {
        sentence: 'Vous ___ arrivés avant nous. (être)',
        answer: 'étiez',
        translation: 'Ustedes habían llegado antes que nosotros.',
      },
    ],
  },
  {
    skillId: 'fr.b2.verb.conditionnel-passe',
    explanation:
      'Es el «habría»: **avoir/être en condicional + participio**. Sirve para el reproche y el arrepentimiento (*j’aurais dû*), y para lo que no pasó: *si j’avais su, je serais venu*.',
    variations: [
      {
        sentence: 'J’___ dû te prévenir. (avoir)',
        answer: 'aurais',
        translation: 'Debería haberte avisado.',
      },
      {
        sentence: 'Elle ___ venue si elle avait pu. (être)',
        answer: 'serait',
        translation: 'Habría venido si hubiera podido.',
      },
      {
        sentence: 'Nous ___ aimé rester plus longtemps. (avoir)',
        answer: 'aurions',
        translation: 'Nos habría gustado quedarnos más tiempo.',
      },
      {
        sentence: 'Tu ___ pu me le dire avant. (avoir)',
        answer: 'aurais',
        translation: 'Podrías habérmelo dicho antes.',
      },
      {
        sentence: 'Ils ___ partis plus tôt avec un peu d’organisation. (être)',
        answer: 'seraient',
        translation: 'Se habrían ido más temprano con un poco de organización.',
      },
      {
        sentence: 'Vous ___ préféré une autre chambre ? (avoir)',
        answer: 'auriez',
        translation: '¿Habrían preferido otra habitación?',
      },
    ],
  },
  {
    skillId: 'fr.b2.verb.gerondif',
    explanation:
      'El gérondif es **en + participio presente** y dice cómo o cuándo: *il travaille **en écoutant** de la musique*. Condición dura: el sujeto de las dos acciones tiene que ser **el mismo**, si no hay que usar otra construcción.',
    variations: [
      {
        sentence: 'Il travaille en ___ de la musique. (écouter)',
        answer: 'écoutant',
        translation: 'Trabaja escuchando música.',
      },
      {
        sentence: 'Elle est tombée en ___ dans l’escalier. (courir)',
        answer: 'courant',
        translation: 'Se cayó corriendo por la escalera.',
      },
      {
        sentence: 'On apprend en ___ des erreurs. (faire)',
        answer: 'faisant',
        translation: 'Se aprende cometiendo errores.',
      },
      {
        sentence: 'Je l’ai vu en ___ du bureau. (sortir)',
        answer: 'sortant',
        translation: 'Lo vi al salir de la oficina.',
      },
      {
        sentence: 'Ils discutent en ___. (manger)',
        answer: 'mangeant',
        translation: 'Charlan mientras comen.',
      },
      {
        sentence: 'En ___ ce chemin, tu arriveras plus vite. (prendre)',
        answer: 'prenant',
        translation: 'Tomando este camino llegarás más rápido.',
      },
    ],
  },
  {
    skillId: 'fr.b2.connector.cause-consequence',
    explanation:
      'La causa cambia de palabra según dónde va: **parce que** responde a un porqué, **car** encadena en registro escrito, **puisque** presenta la causa como sabida, **grâce à** es positiva y **à cause de** negativa. La consecuencia va con **donc**, **alors** o **c’est pourquoi**.',
    variations: [
      {
        sentence: 'Il est resté chez lui ___ il pleuvait.',
        answer: 'parce qu’',
        translation: 'Se quedó en casa porque llovía.',
      },
      {
        sentence: '___ tu le sais déjà, je ne répète pas.',
        answer: 'Puisque',
        translation: 'Ya que lo sabés, no repito.',
      },
      {
        sentence: 'Le train a du retard, ___ nous arriverons tard.',
        answer: 'donc',
        translation: 'El tren viene con retraso, así que llegaremos tarde.',
      },
      {
        sentence: 'J’ai réussi ___ ton aide.',
        answer: 'grâce à',
        translation: 'Lo logré gracias a tu ayuda.',
      },
      {
        sentence: 'Le vol est annulé ___ la tempête.',
        answer: 'à cause de',
        translation: 'El vuelo está cancelado a causa de la tormenta.',
      },
      {
        sentence: 'Il n’a pas étudié, ___ il a échoué.',
        answer: 'c’est pourquoi',
        translation: 'No estudió, por eso reprobó.',
      },
    ],
  },
  {
    skillId: 'fr.b2.connector.logical',
    explanation:
      'Los conectores de argumentación ordenan un texto: **d’abord / ensuite / enfin** para las etapas, **cependant** y **en revanche** para oponer, **en effet** para confirmar, **par ailleurs** para sumar otro punto. No son adorno: son lo que hace seguible un texto B2.',
    variations: [
      {
        sentence: '___, je voudrais présenter le contexte.',
        answer: 'D’abord',
        translation: 'En primer lugar, quisiera presentar el contexto.',
      },
      {
        sentence: 'Le plan est ambitieux ; ___, il reste réalisable.',
        answer: 'cependant',
        translation: 'El plan es ambicioso; sin embargo, sigue siendo realizable.',
      },
      {
        sentence: 'Les ventes ont chuté. ___, les coûts ont augmenté.',
        answer: 'Par ailleurs',
        translation: 'Las ventas cayeron. Además, los costos subieron.',
      },
      {
        sentence: 'Il a refusé. ___, il n’avait pas le choix.',
        answer: 'En effet',
        translation: 'Se negó. En efecto, no tenía opción.',
      },
      {
        sentence: 'Le premier projet a échoué ; ___, le second a réussi.',
        answer: 'en revanche',
        translation: 'El primer proyecto fracasó; en cambio, el segundo funcionó.',
      },
      {
        sentence: '___, je tiens à vous remercier.',
        answer: 'Enfin',
        translation: 'Por último, quiero agradecerles.',
      },
    ],
  },
  {
    skillId: 'fr.b2.pronoun.possessive',
    explanation:
      'El posesivo **sustituye** al sustantivo y se lleva el artículo pegado: *ma voiture* → **la mienne**. Concuerda con lo poseído, no con el dueño, así que «su coche» de una mujer sigue siendo *le sien*.',
    variations: [
      {
        sentence: 'Ma voiture est rouge ; ___ est bleue.',
        answer: 'la tienne',
        translation: 'Mi coche es rojo; el tuyo es azul.',
      },
      {
        sentence: 'Ton appartement est grand, ___ est petit.',
        answer: 'le mien',
        translation: 'Tu departamento es grande, el mío es chico.',
      },
      {
        sentence: 'Ce sont mes clés, pas ___.',
        answer: 'les tiennes',
        translation: 'Son mis llaves, no las tuyas.',
      },
      {
        sentence: 'Notre maison est ancienne ; ___ est moderne.',
        answer: 'la leur',
        translation: 'Nuestra casa es antigua; la de ellos es moderna.',
      },
      {
        sentence: 'J’ai perdu mon stylo, tu me prêtes ___ ?',
        answer: 'le tien',
        translation: 'Perdí mi lapicera, ¿me prestás la tuya?',
      },
      {
        sentence: 'Vos résultats sont bons, ___ aussi.',
        answer: 'les nôtres',
        translation: 'Sus resultados son buenos, los nuestros también.',
      },
    ],
  },
  {
    skillId: 'fr.b2.pronoun.demonstrative',
    explanation:
      '**celui / celle / ceux / celles** sustituyen al sustantivo y nunca van solos: piden **-ci**, **-là**, un **de** o una relativa. *Quel livre ? — **Celui que** j’ai lu hier.*',
    variations: [
      {
        sentence: 'Quel livre ? — ___ que j’ai lu hier.',
        answer: 'Celui',
        translation: '¿Qué libro? —El que leí ayer.',
      },
      {
        sentence: 'Ces photos sont belles, surtout ___ de Paris.',
        answer: 'celles',
        translation: 'Estas fotos son lindas, sobre todo las de París.',
      },
      {
        sentence: 'Je préfère cette veste à ___ -là.',
        answer: 'celle',
        translation: 'Prefiero esta campera a aquella.',
      },
      {
        sentence: 'Parmi les candidats, ___ qui parlent français sont prioritaires.',
        answer: 'ceux',
        translation: 'Entre los candidatos, los que hablan francés tienen prioridad.',
      },
      {
        sentence: 'Mon vélo est cassé, je prends ___ de mon frère.',
        answer: 'celui',
        translation: 'Mi bici está rota, tomo la de mi hermano.',
      },
      {
        sentence: 'De toutes ces solutions, ___ -ci est la meilleure.',
        answer: 'celle',
        translation: 'De todas estas soluciones, esta es la mejor.',
      },
    ],
  },
];

export function repairTemplateFor(skillId: string): RepairTemplate | null {
  return REPAIR_TEMPLATES.find((t) => t.skillId === skillId) ?? null;
}

/** Convierte una plantilla en ejercicios `fill-blank` listos para pintar. */
export function generateRepairSet(skill: Skill, count = 5): Exercise[] {
  const plantilla = repairTemplateFor(skill.id);
  if (!plantilla) return [];
  return plantilla.variations
    .slice(0, count)
    .map((v, i) => toRepairExercise(skill, plantilla, v, i));
}

/** Una variación de plantilla convertida en ejercicio pintable. */
export function toRepairExercise(
  skill: Skill,
  plantilla: RepairTemplate,
  v: RepairVariation,
  index: number,
): Exercise {
  const esOrden = v.kind === 'order';
  return {
    id: `repair::${skill.id}::${index}`,
    skillId: skill.id,
    level: skill.level,
    difficulty: skill.difficulty,
    type: esOrden ? ('reorder' as const) : ('fill_blank' as const),
    prompt: esOrden ? (v.translation ?? v.sentence) : v.sentence,
    expectedAnswer: esOrden ? v.sentence : v.answer,
    acceptedAnswers: [esOrden ? v.sentence : v.answer],
    explanation: plantilla.explanation,
    render: esOrden
      ? {
          kind: 'order',
          data: { type: 'order', sentence: v.sentence, translation: v.translation },
        }
      : {
          kind: 'fill-blank',
          data: {
            type: 'fill-blank',
            sentence: v.sentence,
            answer: v.answer,
            translation: v.translation,
          },
        },
  };
}
