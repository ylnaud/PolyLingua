/**
 * Detector de español en el HTML publicado. Unidad U-01 del Gauntlet.
 *
 * No es un test: es la pieza que el test usa, separada a propósito para poder
 * probarla contra fixtures. Un candado que solo se ejecuta sobre `dist/` no
 * demuestra nada cuando `dist/` está limpio — puede estar roto y verse verde.
 * Con funciones puras se le pueden dar entradas con defecto y comprobar que
 * salta. Vitest no recoge este archivo: su `include` es `tests/**\/*.test.ts`.
 *
 * POR QUÉ EXISTE. El silo inglés se activó con el #164 y desde entonces el
 * español se le ha colado tres veces: la prosa SEO de tsa.ts, los widgets
 * globales, y —encontrado a mano el día que se escribió esto— dos literales en
 * /en/de/pronunciacion. Las tres veces lo encontró un barrido manual que se
 * escribía, se ejecutaba y se tiraba. Esto lo hace permanente.
 */

/**
 * El texto que un lector ve, sin nada de lo que hay alrededor.
 *
 * Quitar los `<script>` es EL paso decisivo, y no es una precaución teórica:
 * medido sobre las 115 páginas del silo inglés, un barrido que no los quita da
 * 270 coincidencias y quitándolos da 0. El JS de este proyecto está escrito en
 * español —identificadores, comentarios, los `data-*` con JSON de
 * pageStrings— y encima el JSON-LD viaja dentro de un `<script>`. Sin este
 * paso el detector sería inservible por ruido y acabaría desactivado.
 *
 * Quitar las etiquetas después tiene un efecto secundario útil: ningún valor de
 * atributo llega al texto, así que las rutas (`/en/de/vocabulario`) no pueden
 * confundirse con una cadena de interfaz. Comprobado sobre el build.
 */
export function textoVisible(html: string): string {
  let h = html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ');
  h = h.replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  h = h.replace(/<!--[\s\S]*?-->/g, ' ');
  return h.replace(/<[^>]*>/g, ' ');
}

/**
 * Palabras que solo pueden ser españolas en una página de este sitio.
 *
 * El criterio no es «palabra española frecuente» sino «palabra que no puede ser
 * inglesa NI alemana», porque estas páginas enseñan alemán escribiendo en
 * inglés: las tres lenguas conviven en el mismo texto.
 *
 * QUÉ SE DEJÓ FUERA, Y POR QUÉ. Esto no es documentación de cortesía: son los
 * falsos positivos que ya se pagaron, y sin la lista alguien los reintroduce.
 *
 * - También inglesas: `general`, `plural`, `no`, `total`, `final`, `personal`,
 *   `capital`, `error`, `similar`, `familiar`, `animal`, `hotel`, `son`, `sin`,
 *   `van`, `he`. Marcar `general` y después `plural` como español fueron dos
 *   fallos reales durante el desarrollo de este curso.
 * - También alemanas: `los`, `die`, `der`, `das`, `in`, `an`, `man`, `so`,
 *   `was`, `ist`, `wie`, `leer`. El caso de `los` está medido: sus 19
 *   apariciones en el silo inglés son el morfema alemán que enseña B2 —
 *   «Arbeit (work) + los (-less) + igkeit» — no el artículo español.
 * - Demasiado cortas o ambiguas para arriesgarse: `de`, `en`, `el`, `la`, `y`,
 *   `a`, `un`. `de` y `en` son además los códigos de idioma del propio sitio.
 */
export const PALABRAS_ES: readonly string[] = [
  // Con tilde o ñ: imposibles en inglés y en alemán.
  'qué',
  'cómo',
  'dónde',
  'cuándo',
  'quién',
  'cuál',
  'más',
  'aquí',
  'también',
  'según',
  'después',
  'está',
  'están',
  'será',
  'día',
  'días',
  'año',
  'años',
  'número',
  'práctica',
  'gramática',
  'lección',
  'lecciones',
  'página',
  'páginas',
  'título',
  'además',
  'así',
  'aún',
  'información',
  'traducción',
  'pronunciación',
  'explicación',
  'versión',
  'sesión',
  'botón',
  'español',
  'inglés',
  'alemán',
  'francés',
  'portugués',
  'añade',
  'pequeño',
  'mañana',
  'señal',
  'enseña',
  'niño',
  'todavía',
  // Sin tilde, pero inequívocas: ni inglesas ni alemanas.
  'para',
  'pero',
  'porque',
  'cuando',
  'donde',
  'desde',
  'hasta',
  'entre',
  'sobre',
  'todos',
  'todas',
  'tiene',
  'tienes',
  'tienen',
  'puede',
  'puedes',
  'pueden',
  'hacer',
  'hace',
  'siempre',
  'nunca',
  'mismo',
  'misma',
  'otro',
  'otra',
  'otros',
  'otras',
  'primero',
  'segunda',
  'siguiente',
  'anterior',
  'empezar',
  'aprender',
  'palabra',
  'palabras',
  'frase',
  'frases',
  'pregunta',
  'respuesta',
  'ejercicio',
  'ejercicios',
  'nivel',
  'niveles',
  'vocabulario',
  'practicar',
  'repasar',
  'escuchar',
  'escribir',
  'hablar',
  'estudiar',
  'completa',
  'elige',
  'escribe',
  'vuelve',
  'sigue',
  'correcto',
  'incorrecto',
  'acierto',
  'fallo',
  'racha',
  'tema',
  'temas',
  'inicio',
  'volver',
  'idioma',
  'idiomas',
  'ahora',
  'antes',
  'cada',
  'muy',
  'este',
  'esta',
  'estos',
  'estas',
  'usted',
  'nuestro',
  'ellos',
  'ellas',
  'nosotros',
];

/**
 * El endónimo del selector de idioma.
 *
 * «Español» aparece en las 115 páginas inglesas y es CORRECTO: un selector de
 * idioma nombra cada opción en su propio idioma, igual que «Deutsch» o
 * «English». Pero no se saca `español` de la lista —eso apagaría la detección
 * en cualquier otro contexto—: se retira esta ocurrencia concreta y se cuenta
 * cuántas se retiraron, para que el test pueda exigir exactamente una por
 * página. Una segunda aparición ya no es el selector y vuelve a saltar.
 */
export const ENDONIMO = 'Español';

export interface Hallazgo {
  palabra: string;
  /** Unos 140 caracteres alrededor, para que el fallo se lea sin abrir nada. */
  contexto: string;
}

export interface Resultado {
  hallazgos: Hallazgo[];
  /** Cuántas veces se retiró el endónimo. El test afirma sobre esto. */
  endonimos: number;
}

/**
 * `\p{L}` en vez de `\b` para la frontera de palabra.
 *
 * `\b` solo conoce `[A-Za-z0-9_]`, así que una letra acentuada le parece una
 * frontera y una palabra de la lista pegada a una casa igual. Comprobado:
 * `\b(nivel|tema)\b` encuentra «nivel» dentro de «nivelé» y «tema» dentro de
 * «ítema»; con `\p{L}` ninguno de los dos casa.
 *
 * Honestamente: sobre el build de hoy las dos formas dan EXACTAMENTE el mismo
 * resultado (medido, 0 diferencias en las 115 páginas inglesas). No corrige un
 * fallo observado; es correcto por construcción para una lista con tildes, que
 * es cuando importa que lo sea.
 */
const RE = new RegExp(`(?<!\\p{L})(${PALABRAS_ES.join('|')})(?!\\p{L})`, 'giu');

export function escanear(html: string): Resultado {
  let texto = textoVisible(html);
  let endonimos = 0;
  texto = texto.replaceAll(ENDONIMO, () => {
    endonimos++;
    return ' ';
  });

  const hallazgos: Hallazgo[] = [];
  for (const m of texto.matchAll(RE)) {
    const i = m.index ?? 0;
    hallazgos.push({
      palabra: m[0],
      contexto: texto
        .slice(Math.max(0, i - 70), i + 70)
        .replace(/\s+/g, ' ')
        .trim(),
    });
  }
  return { hallazgos, endonimos };
}
