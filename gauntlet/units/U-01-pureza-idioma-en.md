# U-01 · Pureza de idioma del silo inglés

- **Estado**: `CRITIC` — implementada y verde; esperando veredicto independiente
- **Tipo**: `automático`
- **Depende de**: —

## Objetivo

Ninguna página de `/en/**` sirve texto español visible.

## Archivos afectados

- `tests/lib/spanish-scan.ts` — el detector (funciones puras)
- `tests/lang-purity.test.ts` — el candado
- `src/pages/[userLang]/[targetLang]/[level]/examen.astro` — el defecto que el
  candado encontró en su primera ejecución

## Por qué existe

El silo inglés se activó con el #164 y desde entonces el español se le ha colado
tres veces: la prosa SEO de `tsa.ts`, los widgets globales del header, y dos
literales en `/en/de/pronunciacion` encontrados a mano el mismo día que se
escribió esta unidad. Las tres veces lo encontró un barrido manual que se
escribía, se ejecutaba y se tiraba.

## Criterio de aceptación

1. Cero coincidencias de español visible en las páginas de `dist/en/`.
2. **Control de población**: el barrido ha leído más de 100 páginas. Sin esto,
   borrar `dist/en/` daría verde.
3. **Control invertido permanente**: la misma lista marca ≥ 400 páginas de
   `dist/es/`. Si la lista pierde capacidad de detección, este test se pone rojo
   aunque el silo inglés esté impecable.
4. **Sensibilidad contra fixtures**: 9 casos que no dependen del build.
5. El mensaje de fallo nombra archivo, palabra y contexto.

## Cómo se prueba

```bash
npm run build
npx vitest run tests/lang-purity.test.ts
```

Resultado: **14 pasando**.

## Inversión — hecha, no prometida

Salida cruda en [`../evidence/U-01-inversion.md`](../evidence/U-01-inversion.md).

| Paso                                                                                               | Resultado                                                       |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Verde de partida (tras arreglar `examen.astro`)                                                    | 14 pasando                                                      |
| Se añade una frase española al cuerpo de `en-de/a1/present-tense-regular-verbs.md`, se reconstruye | **ROJO**, nombrando el archivo y las 6 palabras con su contexto |
| `git checkout --` sobre esa lección, se reconstruye                                                | 14 pasando otra vez                                             |

Y antes de todo eso, el candado ya se estrenó en rojo por su cuenta: en su primera
ejecución encontró **«Alemán» en las 6 páginas de examen del silo inglés**.
`examen.astro` calculaba `languageName` desde el diccionario y lo usaba bien en
el JSON-LD, pero la miga de pan visible tiraba de `LANGUAGE_MAP.name`, que guarda
una sola versión y es la española. La misma página decía «German» en sus datos
estructurados y «Alemán» en pantalla.

## Falsos positivos

| Caso                                   | Evidencia                                                                                                                                                   | Cómo se trata                                                                                                           |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Español` (endónimo del selector)      | En **115/115** páginas inglesas. Un selector nombra cada opción en su propio idioma, igual que «Deutsch»                                                    | Se retira esa ocurrencia **y se cuenta**: el test exige exactamente una por página, así que una segunda vuelve a saltar |
| `los` como morfema alemán              | 19 apariciones, todas en B2 enseñando compuestos: «Arbeit (work) + los (-less) + igkeit»                                                                    | Fuera de la lista, con el motivo escrito en `spanish-scan.ts`                                                           |
| Palabras inglesas y españolas a la vez | `general` y `plural` se marcaron como español por error durante el desarrollo del curso                                                                     | Fuera de la lista, y un test comprueba que no vuelvan                                                                   |
| Slugs de URL                           | **No es un falso positivo real**: los slugs viven en atributos y no sobreviven al quitado de etiquetas. Comprobado                                          | No se excluye nada. Añadir esa exclusión debilitaría el detector frente a una amenaza inexistente                       |
| Español dentro de `<script>`           | Sin quitar los `<script>`: **270** coincidencias. Quitándolos: **0**. El JS del proyecto está escrito en español y el JSON-LD viaja dentro de un `<script>` | `textoVisible()` los elimina; hay dos fixtures que lo fijan                                                             |

## Límites declarados

- **Detecta palabras de una lista, no «español» en abstracto.** Una cadena
  española corta y sin ninguna de esas palabras («Hola», «Sí», «Vale») pasaría.
- **Solo mira el HTML servido.** El texto que el JS de cliente inserta en
  ejecución —los ítems de `practiceItemMarkup.ts`, por ejemplo— no está en
  `dist/` y esta unidad no lo cubre. Eso es trabajo de U-10 y de los checks de
  navegador.
- **No juzga calidad.** Que una página no tenga español no dice que su inglés sea
  bueno; eso es revisión de contenido.

## Veredicto del Critic

Pendiente. Se pega aquí literal —`PASS` / `FAIL` / `BLOCKED` con su evidencia—
cuando la revisión independiente termine. Hasta entonces esta unidad **no está
cerrada**, por muy verde que esté el candado: que quien implementa vea verde es
exactamente lo que el bucle no acepta como prueba.

Nota sobre la primera ronda: `.claude/agents/gauntlet-critic.md` se creó en esta
misma sesión, y la lista de agentes se carga al arrancar, así que el harness
todavía no lo reconocía. La revisión se lanzó con un agente genérico llevándole
ese mismo contrato. Es decir: en esta ronda la prohibición de `Edit`/`Write` fue
**instruida, no impuesta**. A partir de la próxima sesión el agente existe y la
restricción la aplica la propia definición.
