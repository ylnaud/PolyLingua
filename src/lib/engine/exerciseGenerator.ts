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
