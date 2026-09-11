# U-13 · Responsive y accesibilidad

- **Estado**: `PASS` — cerrada en ronda 1, con evidencia de ejecución real
- **Tipo**: `automático + navegador`
- **Depende de**: —

## Objetivo

Tres candados: sin desbordamiento horizontal en 360 (móvil), 768
(tablet) y 1280 (escritorio) sobre una muestra real de páginas en
navegador; cada página de contenido real tiene exactamente un `<h1>`;
el `<html lang>` coincide con el silo de interfaz de la página.

## Por qué hacía falta

Ninguno de los dos ejes tenía cobertura. No existía ningún test de
`scrollWidth`/`clientWidth` en ningún ancho de viewport, y los únicos
usos de `aria-`/`alt` en tests existentes (`tests/lang-purity.test.ts`,
`tests/links-integrity.test.ts`) comprueban pureza de idioma o
coherencia de silo, no estructura de accesibilidad — nada verificaba
`h1` único ni `html lang` correcto en el sitio completo.

## Archivos afectados

- `tests/a11y-static.test.ts` (nuevo) — los dos candados estáticos.
- `.claude/skills/run-polylingua/driver.mjs` — `runCheckOverflow`
  (nuevo) y comando CLI `check-overflow`, sobre 5 páginas reales de los
  dos silos activos × 3 anchos.

Ningún archivo de `src/` quedó tocado de forma permanente.

## Criterio de aceptación

1. En 5 páginas reales (portada de curso, lección, herramienta ×
   es/en), a 360/768/1280px, `scrollWidth <= clientWidth` — sin
   desbordamiento horizontal forzado.
2. Cada una de las 774 páginas de contenido real (excluidas las 268
   redirecciones legacy) tiene exactamente un `<h1>`.
3. El `<html lang>` de cada página real coincide con su silo (`es-ES`
   fuera de `/en/`, `en-US` dentro).
4. `npm run check`, `npm run build`, `npm test` en verde.

## Cómo se prueba

```bash
npx vitest run tests/a11y-static.test.ts
npm run build
nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
node .claude/skills/run-polylingua/driver.mjs check-overflow --port 4321
npx astro preview stop
```

## Resultado real

Salida cruda completa en
[`../evidence/U-13-responsive-a11y.md`](../evidence/U-13-responsive-a11y.md):

```
Test Files  1 passed (1)
     Tests  2 passed (2)

OK — 5 páginas × 3 anchos, sin desbordamiento horizontal
```

## Inversión

Tres inversiones distintas, salida cruda en el archivo de evidencia:

| Defecto inyectado                                               | Dónde                             | Candado que lo cazó                                        |
| --------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------- |
| `<html lang>` incorrecto en una página ya construida            | `dist/` (gitignorado, sin riesgo) | test de `html lang`, con la página nombrada                |
| Segundo `<h1>` en la portada de curso (componente compartido)   | `src/` (versionado)               | test de `h1` único — cazó las 6 portadas a la vez          |
| `min-width: 2000px` en `.silo-layout` (`src/styles/global.css`) | `src/` (versionado)               | `check-overflow` — 6 fallos exactos (2 páginas × 3 anchos) |

Los tres, revertidos (`cp`/`diff` para `dist/`, `cp`/`diff` para
`src/`), confirmados idénticos, vuelven a verde.

## Falsos positivos

Ninguno encontrado. Una decisión de diseño: los candados estáticos
excluyen las 268 páginas de redirección 301 a rutas nuevas — tanto las
del namespace `src/pages/idiomas/[lang]/...` como las de nivel superior
sin userLang (`ahorcado.astro`, `diario.astro`, `dialogos.astro`, etc.).
El filtro es por contenido (`http-equiv="refresh"`), no por ruta, así
que cubre las dos familias sin enumerar carpetas — son meta-refresh
`noindex` sin `<html>` ni contenido, y exigirles `h1`/`lang` sería un
criterio más estricto del que su propio diseño cumple.

## Límites declarados

- **El candado de navegador prueba 5 páginas**, no las 1042. Los
  componentes de layout (`BaseLayout`, `.silo-layout`, `Practice.astro`)
  son compartidos por todas, así que el riesgo real está en el CSS
  compartido — confirmado por la inversión 3, que rompió 2 páginas de
  silos distintos con un solo cambio.
- **No cubre otros criterios de accesibilidad** (contraste de color,
  navegación por teclado, lectores de pantalla más allá de
  `aria-label`/`lang`/`h1`) — el alcance de esta unidad es exactamente
  lo que `INDEX.md` pedía: desbordamiento horizontal y candados
  estáticos, no una auditoría WCAG completa.
- **`scrollWidth`/`clientWidth` detecta desbordamiento forzado**, no
  cada posible problema visual de layout (superposición de elementos,
  texto cortado dentro de una caja que no desborda). Es la señal
  correcta para "algo obliga a hacer scroll horizontal", no un
  sustituto de revisión visual.

## Veredicto del Critic

Sin bloqueo, en el primer intento. Pegado literal (la observación de
redacción sobre qué rutas componen la exclusión ya está corregida
arriba, en esta misma ficha y en el comentario del test):

---

# U-13 CRITIC — RONDA 1

## VEREDICTO

PASS

## EVIDENCIA

**Comandos base**: `npm run check` → `0 errors`. `npm run build` →
`1042 páginas`. `npm test` → `574 passed (574)`.

**Conteo independiente de redirecciones vs. contenido real** (script
propio, no el test del Builder): `total index.html: 1042`,
`redirecciones (refresh): 268`, `contenido real: 774`. Coincide
exactamente. Inspeccionadas 3 páginas de redirección al azar,
confirmado que ninguna tiene `<html>` ni `<h1>` — el filtro es
legítimo.

**Candado de navegador**, servidor real: `check-overflow` → `OK — 5
páginas × 3 anchos, sin desbordamiento horizontal`.

**Regresión**, mismo servidor: `smoke` 7/10, `smoke-en` 14/20,
`smoke-en-a2` 14/20, `smoke-en-b1` 12/17, `smoke-kinds` 8/10 — todos
idénticos a los valores de referencia. `check-overflow` es aditivo, no
rompió nada.

**Inversión propia A — cero `<h1>` (no duplicado)**: quitó el único
`<h1>` de `src/layouts/LessonLayout.astro` (afecta a todas las
lecciones reales). El test falló listando decenas de lecciones sin
`h1` — confirma que el candado caza tanto "cero" como "más de uno", no
solo el caso que ya había probado el Builder. Revertido, `diff`
idéntico, retest → `2/2`.

**Inversión propia B — overflow en página de lección, no en
portada**: agregó `min-width: 2500px` a `.practice` en
`Practice.astro` (usado por lecciones, no por la portada). Falló
exactamente en las 3 páginas de la muestra que usan `Practice` × 3
anchos = 9 fallos, sin marcar las portadas — confirma que el candado
detecta a nivel de página específica, no solo el caso ya probado
(`.silo-layout`, que afecta portadas). Revertido, `diff` idéntico,
retest → `OK`.

**Estado final**: limpio salvo los archivos declarados. Sin proceso de
preview ni puerto abierto.

## DEFECTOS ENCONTRADOS

Ninguno funcional. Una imprecisión menor de documentación (corregida):
la exclusión de redirecciones cubre también páginas top-level fuera de
`src/pages/idiomas/[lang]/...` (`ahorcado.astro`, `diario.astro`,
`dialogos.astro`, etc.) — el filtro real es por contenido, no por
ruta, así que la corrección no cambia ningún comportamiento.

## REGRESIONES

Ninguna. Los cinco flujos Playwright preexistentes dan exactamente los
mismos resultados de siempre.

## CONCLUSIÓN

U-13 cumple su criterio con evidencia propia y de primera mano. El
conteo 268/774 se reprodujo de forma independiente, el candado de
navegador funciona contra un servidor real sin romper ningún smoke
existente, y dos inversiones propias — distintas a las tres del
Builder — confirman que ambos candados detectan tanto el caso ya
probado como un caso hermano no probado. No se encontró ningún defecto
funcional.

---
