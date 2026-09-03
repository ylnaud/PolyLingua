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
