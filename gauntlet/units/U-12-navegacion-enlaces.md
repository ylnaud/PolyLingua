# U-12 · Navegación y enlaces

- **Estado**: `PASS` — cerrada en ronda 1, con evidencia de ejecución real
- **Tipo**: `automático`
- **Depende de**: —

## Objetivo

Dos candados sobre el sitio construido: cero enlaces internos rotos, y
la miga de pan (`Breadcrumbs.astro`) nunca cruza de silo de idioma de
interfaz.

## Por qué hacía falta

`tests/links.test.ts` ya validaba el MOTOR de enlaces relacionados (que
no invente destinos fuera de su propio índice) y que los enlaces
curados de `tsa.ts` apunten a páginas reales — pero nada barría el HTML
ya construido buscando un `<a href>` normal de navegación que apuntara a
una página que no existe. Es el mismo tipo de bug que U-08 encontró para
`hreflang` (645/1350 rotos, documentado en `BaseSEO.astro`), nunca
comprobado para los enlaces de uso diario. Tampoco existía ningún test
de miga de pan.

## Archivos afectados

- `tests/links-integrity.test.ts` (nuevo) — los dos candados.

Ningún archivo de `src/` quedó tocado de forma permanente.

## Criterio de aceptación

1. Cada `<a href>` interno del sitio construido (excluidos externos,
   `mailto:`, `tel:`, anclas puras) resuelve a una página que existe de
   verdad en `dist/`.
2. En una muestra de páginas representativas de los dos silos activos
   (es, en) — portada de curso, lección, herramienta —, la miga de pan
   (`<nav class="breadcrumbs">`) existe y ningún `href` suyo cruza al
   prefijo del otro silo.
3. El `aria-label` de la miga coincide con el idioma de interfaz de la
   página.
4. `npm run check`, `npm run build`, `npm test` en verde.

## Cómo se prueba

```bash
npm run build
npx vitest run tests/links-integrity.test.ts
```

## Resultado real

Salida cruda completa en
[`../evidence/U-12-navegacion-enlaces.md`](../evidence/U-12-navegacion-enlaces.md):

```
Test Files  1 passed (1)
     Tests  8 passed (8)
```

Total de enlaces internos barridos: **43617**, cero rotos.

## Aviso propio, encontrado por infraestructura ya existente

El primer borrador de esta unidad escribía la URL de producción a mano
(`SITE_ORIGIN = 'https://polylingua...'`) en vez de importarla de
`src/data/site.ts`. `tests/dominio.test.ts` —candado preexistente del proyecto, anterior a
todo el Gauntlet, para la futura mudanza de dominio (`docs/MIGRACION-
DOMINIO.md`) — lo cazó en la primera corrida de la suite completa,
nombrando el archivo exacto. Corregido importando `SITE_URL` de
`src/data/site.ts` en vez de escribir la URL a mano, sin tocar la lista
de archivos esperados de `dominio.test.ts`. No es un defecto de esta
unidad tanto como una confirmación de que ese candado funciona de
verdad — probablemente relevante para cuando le toque el turno a U-14.

## Inversión

Dos inversiones distintas, salida cruda en el archivo de evidencia:

| Defecto inyectado                                                | Dónde                             | Candado que lo cazó                                  |
| ---------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------- |
| Se corrompió un `href` de navegación en un HTML ya construido    | `dist/` (gitignorado, sin riesgo) | barrido completo, con el archivo y el href nombrados |
| Se fijó el primer tramo de la miga de pan a `/es` para todo silo | `src/` (versionado)               | test de coherencia — detectó el cruce en `en/de`     |

Los dos, revertidos (`cp`/`diff` para `dist/`, `git checkout --` para
`src/`), confirmados idénticos, vuelven a verde.

## Falsos positivos

Ninguno encontrado. Una decisión de diseño: el barrido excluye enlaces
externos, `mailto:`/`tel:` y anclas puras (`#foo`) — no son enlaces de
navegación interna y no tiene sentido comprobar que resuelven a una
página de `dist/`.

## Límites declarados

- **La miga de pan se prueba con una muestra de 6 páginas** (3 tipos ×
  2 silos), no las 1042. El componente es el mismo `.astro` en todas,
  así que el riesgo real está en la lógica compartida (ya probado), no
  en una página puntual.
- **El barrido de enlaces internos sí es exhaustivo** (las 1042 páginas
  de `dist/`) — es la parte de esta unidad con más historial real de
  haberse roto (precedente directo: U-08 y su hreflang).
- **No verifica que el enlace sea semánticamente correcto**, solo que
  la página de destino exista. Un enlace que apunte al lugar equivocado
  pero real no lo detecta este candado.

## Veredicto del Critic

Sin bloqueo, en el primer intento. Pegado literal:

---

# U-12 CRITIC — RONDA 1

## VEREDICTO

PASS

## EVIDENCIA

**Verificación base** (comandos por separado): `npm run check` → `0
errors`. `npm run build` → `1042 páginas`. `npm test` → `572 passed
(572)`.

**`tests/dominio.test.ts` en verde de forma aislada** (no solo dentro
de la suite completa): `10 passed (10)` — confirma que la corrección de
`SITE_URL` fue real, no que la suite lo tape.

**`tests/links-integrity.test.ts` aislado**: `8 passed (8)`. Conteo
real de enlaces internos calculado de forma independiente con un
script de `node` propio, leyendo `dist/` directamente (no reusó el
número del test ni el de la ficha): `43617` — coincide exactamente.

**Revisión de `distFileFor()` línea por línea**, sometida a los casos
límite reales presentes en `dist/` (no hipotéticos): 484 hrefs
internos con query string real en producción, todo el `%`-encoding
vive dentro de la query (0 casos antes del `?`), 0 hrefs con más de un
`?`, fragmentos combinados con ruta resueltos correctamente. El límite
documentado por el Builder (no decodifica `%XX`) no es hoy un defecto
activo — razonado y medido, no asumido.

**Inversión propia #1**, archivo distinto al del Builder (un post de
blog en vez de una lección):

```
FAIL ... enlaces internos rotos:
/blog/der-die-das-trucos/index.html → href="/es/de/a1/articulos-der-die-das-NO-EXISTE"
Tests 1 failed | 7 passed (8)
```

Revertido, `diff` idéntico, retest → `8/8`.

**Inversión propia #2**, archivo distinto al del Builder
(`LessonLayout.astro`, que construye su propia miga con datos
dinámicos, en vez de la portada de curso):

```
FAIL ... una lección real (en/de/a1) tiene <nav class="breadcrumbs"> con hrefs del mismo silo
AssertionError: href de otro silo en la miga de pan: «/es/de» (esperado bajo /en)
Tests 1 failed | 7 passed (8)
```

Revertido, `diff` idéntico, `git status` vacío, rebuild, retest →
`8/8`.

**Regresión final**: `572/572` tras ambas inversiones y reversiones.

**`aria-label` revisado en el diccionario fuente**
(`src/i18n/dictionary.ts`), no solo en el HTML: `es` → `'Ruta de
navegación'`, `en` → `'Breadcrumb'`. Correctos, sin mezcla de idiomas.

**Estado final**: `git status`/`git diff --stat` coinciden exactamente
con lo declarado.

## DEFECTOS ENCONTRADOS

NINGUNO.

## REGRESIONES

Ninguna. Suite completa en verde antes y después de las dos
inversiones propias. `tests/dominio.test.ts` confirmado en verde de
forma aislada.

## CONCLUSIÓN

Repliqué de primera mano toda la cadena de verificación, con un
recuento independiente de enlaces internos que coincide exactamente
(43617), y sometí `distFileFor()` a los casos límite reales de
`dist/` sin encontrar ningún caso mal resuelto. Las dos inversiones
propias, en archivos distintos a los del Builder, fueron detectadas
correctamente y revertidas limpio. El criterio de aceptación se cumple
con evidencia de primera mano.

---
