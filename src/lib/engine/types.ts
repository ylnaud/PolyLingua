/**
 * Tipos del motor de aprendizaje adaptativo.
 *
 * El motor razona sobre HABILIDADES (`de.a1.verb.sein`), no sobre ítems de
 * lección. Esa es la diferencia con lo que ya había: el pool SRS
 * (`polylingua-srs-pool`) indexa por id de ítem (`es-de/a1/slug#3`), que sirve
 * para "volvé a ver esta pregunta" pero no para "todavía no dominás el orden
 * de palabras". Las dos cosas conviven: el pool sigue siendo el repaso de
 * ítems concretos, y esto es el modelo de lo que el alumno sabe.
 *
 * Nada de este archivo toca el DOM ni Astro: es lógica pura, testeable con
 * vitest como el resto de src/lib.
 */

export type CEFRLevel = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';

export type SkillCategory =
  | 'vocabulary'
  | 'grammar'
  | 'word_order'
  | 'reading'
  | 'listening'
  | 'writing'
  | 'speaking'
  | 'pronunciation';

/**
 * Una habilidad concreta y comprobable, independiente de cualquier lección.
 *
 * El id lleva el idioma meta delante (`de.a1.verb.sein`) porque este repo
 * enseña cinco idiomas desde el español: sin el prefijo, el `a1.verb.sein`
 * alemán y el `a1.verb.to-be` inglés compartirían espacio de nombres en el
 * mismo localStorage.
 */
export interface Skill {
  id: string;
  /** Idioma meta: 'de', 'en', 'fr', 'it', 'pt'. Redundante con el id, pero
   *  evita tener que parsearlo en cada filtro. */
  lang: string;
  level: CEFRLevel;
  category: SkillCategory;
  /** Nombre corto para el dashboard ("Orden de palabras"). */
  name: string;
  /** Habilidades que conviene tener antes. El scheduler no las impone como
   *  muro: las usa para no proponer algo demasiado pronto. */
  prerequisites: string[];
  /** 1 (más fácil) a 5 (más difícil). Entra en el cálculo de mastery: acertar
   *  algo difícil vale más que acertar algo fácil. */
  difficulty: number;
}

export type SkillStatus = 'new' | 'learning' | 'weak' | 'strong' | 'mastered';

export interface SkillProgress {
  skillId: string;

  attempts: number;
  correct: number;
  incorrect: number;

  currentStreak: number;
  bestStreak: number;

  /** 0-100. Lo calcula mastery.ts; no se escribe a mano. */
  mastery: number;

  /** Marcas de tiempo en milisegundos (Date.now()), no fechas 'YYYY-MM-DD':
   *  los dos primeros intervalos de repaso son de 10 minutos y 1 hora, y con
   *  granularidad de día no se pueden representar. */
  lastAttempt: number;
  nextReview: number;

  status: SkillStatus;

  /**
   * Ids de los ejercicios acertados en la racha actual.
   *
   * Es lo que impide dominar una habilidad repitiendo la misma frase: para
   * llegar a `mastered` hacen falta cinco aciertos seguidos en ejercicios
   * DISTINTOS, así que hay que contar cuáles fueron, no solo cuántos.
   */
  streakExerciseIds: string[];
}

export type ErrorType =
  | 'word_order'
  | 'article'
  | 'verb'
  | 'preposition'
  | 'case'
  | 'vocabulary'
  | 'spelling'
  | 'conjugation';

export type ErrorSeverity = 'low' | 'medium' | 'high';

export interface LearnerError {
  id: string;
  skillId: string;
  type: ErrorType;

  /** Lo que se esperaba y lo que escribió, tal cual, para poder mostrarle la
   *  comparación y para agrupar errores del mismo patrón. */
  expected: string;
  actual: string;

  occurrences: number;
  /** Cuántas veces lo resolvió bien DESPUÉS de fallarlo. */
  fixedCount: number;

  /** Un error deja de estar activo cuando se repara; vuelve si reaparece. */
  active: boolean;
  severity: ErrorSeverity;

  firstSeen: number;
  lastSeen: number;
}

export type ExerciseType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'reorder'
  | 'match'
  | 'complete_sentence'
  | 'write'
  | 'translate'
  | 'listen'
  | 'speak';

/**
 * Un ejercicio listo para presentar. Puede venir del banco de las lecciones
 * (4301 ítems ya escritos) o generado por plantilla en el modo reparación.
 */
export interface Exercise {
  id: string;
  skillId: string;
  level: CEFRLevel;
  difficulty: number;
  type: ExerciseType;

  prompt: string;
  expectedAnswer: string;
  acceptedAnswers: string[];
  explanation: string;

  /** Opciones de multiple_choice; vacío en los demás tipos. */
  options?: string[];
  /** `kind` + `data` con la forma que entiende practiceItemMarkup.ts, para
   *  poder pintarlo con el mismo markup que Practice.astro genera en build. */
  render?: { kind: string; data: unknown };
}

export interface LevelProgress {
  level: CEFRLevel;
  overallMastery: number;
  vocabulary: number;
  grammar: number;
  reading: number;
  listening: number;
  writing: number;
  speaking: number;
}
