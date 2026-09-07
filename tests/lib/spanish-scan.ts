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
 * Quitar los `<script>` es EL paso decisivo: el JS de este proyecto está escrito
 * en español —identificadores, comentarios, los `data-*` con JSON de
 * pageStrings— y encima el JSON-LD viaja dentro de un `<script>`. Sin este paso
 * el detector sería inservible por ruido y acabaría desactivado.
 *
 * AQUÍ NO VA NINGÚN NÚMERO, y eso es deliberado. Este comentario llegó a decir
 * «270 coincidencias», luego «1586», y las dos veces era falso: la magnitud
 * depende de la lista de palabras, del build y de la variante exacta del
 * pipeline, así que se queda vieja en cuanto se toca cualquiera de los tres. Tres
 * mediciones independientes de lo mismo dieron 1586, 1819 y 1934. La comprobación
 * vive ahora en `tests/lang-purity.test.ts`, que la CALCULA sobre el build del
 * momento y exige que sin quitar los `<script>` haya cientos de coincidencias y
 * quitándolos cero. Un número que se verifica solo no puede mentir; uno copiado a
 * mano, sí — y lo hizo dos veces.
 *
 * Quitar las etiquetas descarta de paso todos los valores de atributo, y eso
 * tiene una cara y una cruz. La cara: las rutas (`/en/de/vocabulario`) no se
 * confunden con cadenas de interfaz. La cruz, que la primera versión de este
 * archivo presentó como si solo hubiera cara: **hay atributos que SÍ son texto
 * de interfaz**. El Critic de U-01 lo demostró con dos defectos reales que este
 * detector daba por buenos — `aria-label="Volver arriba"` en las 115 páginas
 * inglesas, con `volver` ya en la lista de palabras. Un `aria-label` es lo
 * único que un lector de pantalla anuncia: que no se vea no lo hace menos
 * interfaz.
 *
 * Por eso `textoVisible()` conserva el texto del cuerpo y `escanear()` añade
 * aparte los atributos legibles (ver ATRIBUTOS_DE_TEXTO). La distinción no es
 * «atributo sí / atributo no», es «esto lo lee una persona / esto lo lee el
 * navegador».
 */
export function textoVisible(html: string): string {
  let h = html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ');
  h = h.replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  h = h.replace(/<!--[\s\S]*?-->/g, ' ');
  return h.replace(/<[^>]*>/g, ' ');
}

/**
 * Atributos cuyo valor lee una persona, no el navegador.
 *
 * `href`, `src`, `class`, `id` y los `data-*` quedan fuera a propósito: llevan
 * rutas, identificadores y el JSON que el cliente consume, todo escrito en
 * español por convención del proyecto. Meterlos aquí ahogaría el detector en
 * ruido, igual que no quitar los `<script>`.
 *
 * Ese límite es real y hoy tapa contenido: `/en/de/practicar` publica el
 * catálogo entero de habilidades en español dentro de `data-skill-catalog`, y
 * el JSON-LD de `/en/` lleva «Curso de Alemán». Está declarado en la ficha de
 * U-01 como límite, no vendido como si no existiera.
 */
export const ATRIBUTOS_DE_TEXTO = ['aria-label', 'alt', 'title', 'placeholder'] as const;

/**
 * `(?<![\w-])` y no `\b` delante del nombre: con `\b`, `data-title=` casaba
 * —el guion es frontera de palabra— y el detector leía atributos de máquina
 * mientras el test afirmaba lo contrario. Lo señaló el Critic en la ronda 2.
 * Acepta comilla doble y simple: Astro emite dobles, pero el detector no debería
 * depender de eso para ver un `aria-label`.
 */
const RE_ATRIBUTOS = new RegExp(
  `(?<![\\w-])(?:${ATRIBUTOS_DE_TEXTO.join('|')})\\s*=\\s*("([^"]*)"|'([^']*)')`,
  'gi',
);

/**
 * El `content` de <meta name="description">, que CLAUDE.md exige por página.
 * Los atributos pueden venir en cualquier orden, así que se localiza la etiqueta
 * y se leen sus atributos por separado en vez de exigir `name` antes de
 * `content`.
 */
const RE_META = /<meta\b[^>]*>/gi;

/** El texto legible que vive dentro de atributos, no en el cuerpo. */
export function textoDeAtributos(html: string): string {
  const sinScripts = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  const trozos: string[] = [];
  for (const m of sinScripts.matchAll(RE_ATRIBUTOS)) trozos.push(m[2] ?? m[3] ?? '');
  for (const m of sinScripts.matchAll(RE_META)) {
    const etiqueta = m[0];
    if (!/\bname\s*=\s*["']description["']/i.test(etiqueta)) continue;
    const c = /\bcontent\s*=\s*("([^"]*)"|'([^']*)')/i.exec(etiqueta);
    if (c) trozos.push(c[2] ?? c[3] ?? '');
  }
  return trozos.join(' · ');
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
  // Voseo rioplatense: el proyecto escribe así, y la primera versión de esta
  // lista solo traía las formas peninsulares. Por eso dejó pasar el <h2>
  // «Seguí por acá» que se publicaba en 58 páginas inglesas: tenía `aquí` pero
  // no `acá`, y `sigue` pero no `seguí`. Frecuencias medidas en el silo
  // español: acá 376, seguí 334, tenés 119, podés 61, querés 57.
  'acá',
  'allá',
  'vos',
  'seguí',
  'elegí',
  'completá',
  'escribí',
  'poné',
  'volvé',
  'agregá',
  'mirá',
  'probá',
  'tenés',
  'querés',
  'podés',
  'sabés',
  'hacés',
  'andá',
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
  let texto = `${textoVisible(html)} · ${textoDeAtributos(html)}`;
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

/**
 * SEGUNDO DETECTOR · cadenas españolas reales, no palabras adivinadas.
 *
 * La lista de arriba falló dos rondas seguidas por el mismo motivo estructural:
 * una lista cerrada de palabras siempre tiene huecos. La ronda 1 se le escapó
 * «Seguí por acá» (no tenía `acá`); la ronda 2, «A1 · Principiante» (no tenía
 * `Principiante`). Ampliar la lista después de cada fallo es perseguir el
 * síntoma.
 *
 * Este detector ataca la causa: en vez de adivinar qué palabras son españolas,
 * toma las cadenas españolas que el proyecto REALMENTE tiene —el diccionario
 * `es` y los datos que guardan una sola versión, como `LEVELS[].name`— y
 * comprueba que ninguna se publica literalmente en una página inglesa.
 *
 * Se mantiene solo: cualquier cadena nueva en el diccionario español entra al
 * candado el día que se escribe, sin tocar este archivo. Y habría cazado los dos
 * fallos anteriores sin saber una palabra de español.
 *
 * Lo que NO cubre, y por eso el primer detector sigue haciendo falta: el español
 * que no viene del diccionario —una lección mal escrita, una cadena a mano en
 * un componente— no está en ningún catálogo con el que comparar.
 */

/** Aplana un diccionario a las cadenas hoja que puede ver un usuario. */
export function cadenasDe(obj: unknown, salida: string[] = []): string[] {
  if (typeof obj === 'string') {
    salida.push(obj);
  } else if (Array.isArray(obj)) {
    for (const v of obj) cadenasDe(v, salida);
  } else if (obj && typeof obj === 'object') {
    for (const v of Object.values(obj)) cadenasDe(v, salida);
  }
  return salida;
}

/**
 * Las cadenas españolas que serían un defecto si aparecieran en una página
 * inglesa. Se descartan tres clases, cada una por un motivo comprobable:
 *
 * - Las **cortas** (< 12 caracteres): «Sí», «Ver», «A1» coinciden por azar con
 *   fragmentos de cualquier texto y no distinguen idioma.
 * - Las **idénticas a su versión inglesa**: si el diccionario dice lo mismo en
 *   los dos idiomas —«Funktionsverbgefüge», «sch, ch, ck, st, sp»— encontrarla
 *   en una página inglesa es correcto, no una fuga.
 * - Las que llevan **marcador** (`{lang}`, `{n}`): nunca se publican literales.
 */
export function cadenasEspanolasVigiladas(dictEs: unknown, dictEn: unknown): string[] {
  const enSet = new Set(cadenasDe(dictEn));
  return [...new Set(cadenasDe(dictEs))]
    .filter((s) => s.length >= 12)
    .filter((s) => !enSet.has(s))
    .filter((s) => !s.includes('{'));
}

/** Las cadenas vigiladas que aparecen de verdad en este HTML. */
export function fugasDeDiccionario(html: string, vigiladas: readonly string[]): string[] {
  const texto = `${textoVisible(html)} · ${textoDeAtributos(html)}`;
  return vigiladas.filter((s) => texto.includes(s));
}
