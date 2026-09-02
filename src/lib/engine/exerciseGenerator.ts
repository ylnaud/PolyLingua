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
export interface RepairTemplate {
  skillId: string;
  /** Explicación corta que se muestra antes, no una clase. */
  explanation: string;
  /** Cada variación: la frase con ___ y la respuesta que va en el hueco. */
  variations: { sentence: string; answer: string; translation?: string }[];
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
  return plantilla.variations.slice(0, count).map((v, i) => ({
    id: `repair::${skill.id}::${i}`,
    skillId: skill.id,
    level: skill.level,
    difficulty: skill.difficulty,
    type: 'fill_blank' as const,
    prompt: v.sentence,
    expectedAnswer: v.answer,
    acceptedAnswers: [v.answer],
    explanation: plantilla.explanation,
    render: {
      kind: 'fill-blank',
      data: {
        type: 'fill-blank',
        sentence: v.sentence.replace('___', '___'),
        answer: v.answer,
        translation: v.translation,
      },
    },
  }));
}
