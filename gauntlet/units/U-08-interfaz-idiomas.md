# U-08 · Interfaz de idiomas

- **Estado**: `PASS` — cerrada en ronda 1, con evidencia de ejecución real
- **Tipo**: `automático`
- **Depende de**: —

## Objetivo

Dos candados sobre el sitio construido, no solo lectura de código:

1. El selector de idioma de interfaz (`LanguageSelector.astro`) siempre
   tiene exactamente tres filas — `es`, `de`, `en` — con `de` marcado
   como deshabilitado ("Próximamente").
2. Cada `hreflang` que el sitio declara apunta a una página que existe de
   verdad. Nunca a un 404.

## Por qué hacía falta

El segundo punto no es hipotético: el propio comentario de
`src/components/BaseSEO.astro` documenta que, antes de la comprobación de
existencia que tiene hoy, activar el inglés produjo **645 de 1350**
hreflang apuntando a un 404 — medido sobre el build, no estimado. "Y un
hreflang roto no es un aviso menor: Google descarta el grupo entero,"
dice el mismo comentario. Sin un candado, nada impide que ese bug vuelva
la próxima vez que se toque `alternateExists()` o se agregue un curso.

## Archivos afectados

- `tests/hreflang-integrity.test.ts` (nuevo) — los tres candados.

Ningún archivo de `src/` se tocó de forma permanente — esta unidad es
puramente de verificación, igual que U-03 y U-04.

## Criterio de aceptación

1. Barrido completo de `dist/**/index.html`: cada `hreflang` declarado
   resuelve a un archivo `index.html` que existe de verdad.
2. `USER_LANGUAGES` sigue siendo exactamente 3 entradas, en el orden
   `es, de, en`, con `active` exactamente `[true, false, true]`.
3. `es` es el primer idioma activo (varias páginas usan
   `ACTIVE_USER_LANGUAGES[0]` como default).
4. En una muestra de páginas siloadas reales (portada de curso, una
   lección, una herramienta solo-español, el silo inglés), el HTML
   construido tiene exactamente 3 `.lang-option` — 2 habilitados + 1
   deshabilitado.
5. `npm run check`, `npm run build`, `npm test` en verde.

## Cómo se prueba

```bash
npm run build
npx vitest run tests/hreflang-integrity.test.ts
```

## Resultado real

Salida cruda completa en
[`../evidence/U-08-hreflang-integrity.md`](../evidence/U-08-hreflang-integrity.md):

```
Test Files  1 passed (1)
     Tests  8 passed (8)
```

Total de hreflang barridos en el build real: **1380**, cero rotos.

## Inversión

Dos inversiones distintas, salida cruda en el archivo de evidencia:

| Defecto inyectado                                                        | Dónde                                    | Tests que lo cazaron                                       |
| ------------------------------------------------------------------------ | ---------------------------------------- | ---------------------------------------------------------- |
| Se corrompió un `href` de hreflang en un HTML ya construido              | `dist/` (gitignorado, sin riesgo)        | barrido completo, con el archivo y el href rotos nombrados |
| Se activó `de` (`active: false → true`) sin haber escrito su diccionario | `src/data/userLanguages.ts` (versionado) | forma fija de `active` y de `ACTIVE_USER_LANGUAGES`        |

Los dos, revertidos (`cp` desde backup para `dist/`, `git checkout --`
para `src/`), confirmados idénticos con `diff`, vuelven a verde.

## Falsos positivos

Ninguno encontrado. Una decisión de diseño: el candado de hreflang exige
`totalHreflang > 1000` además de la lista vacía de rotos — así un regex
que dejara de encontrar nada (por ejemplo, si `BaseSEO.astro` cambiara el
formato del atributo) falla de forma visible en vez de dar un falso
"cero rotos" por no haber revisado nada.

## Límites declarados

- **No cubre el click real del selector en un navegador.** Confirma que
  el HTML construido tiene la forma correcta (3 `.lang-option`, con la
  clase `disabled` en el lugar correcto), no que `initLangSelector()` — el
  `<script>` cliente que abre/cierra el `<details>` — funcione en un DOM
  real. Eso es alcance de U-13 (responsive y accesibilidad, `+ browser`).
- **La muestra de páginas para el conteo de `.lang-option` es de 4
  páginas**, no las 1042. Es una muestra representativa de las formas
  reales de ruta (portada, lección, herramienta solo-español, silo
  inglés), no un barrido exhaustivo — el propio componente es el mismo
  `.astro` en las 1042, así que el riesgo real está en la lógica
  compartida, no en una página puntual.
- **El barrido de hreflang sí es exhaustivo** (las 1042 páginas de
  `dist/`), a diferencia del punto anterior — es la parte de esta unidad
  con más historial real de haberse roto.

## Veredicto del Critic

Sin bloqueo, en el primer intento. Pegado literal:

---

# U-08 CRITIC — RONDA 1

## VEREDICTO

PASS

## EVIDENCIA

Todos los comandos corridos por separado, de primera mano, sin
encadenar.

**`npm run check`** → `0 errors, 0 warnings, 126 hints`. **`npm run
build`** → `1042 page(s) built`. **`npm test`** (suite completa) →
`Test Files 22 passed (22)` / `Tests 558 passed (558)`. **`npx vitest
run tests/hreflang-integrity.test.ts`** aislado → `8 passed (8)`.

**Conteo independiente de hreflang** (script propio, no copiado del
test): `index.html files: 1042`, `total hreflang: 1380`, `rotos: 0` —
coincide exactamente con la cifra del Builder.

**Lectura del test completo**: confirma que barre recursivamente todo
`dist/**/index.html`, resuelve cada `href` a la ruta esperada (con
`x-default` cayendo a `dist/index.html`), y exige lista vacía de rotos +
`totalHreflang > 1000` como salvaguarda contra un regex que deje de
encontrar nada.

**Verificación cruzada manual** de las 4 páginas muestra con `grep`
directo (sin pasar por el test): las 4 dan exactamente 2 `.lang-option`
habilitados + 1 deshabilitado.

**Inversión propia #1, distinta a la del Builder**: corrompió el href
del hreflang en `dist/en/de/b1/relative-clauses/index.html` (una lección
real del silo inglés, no la portada de curso que usó el Builder):

```
AssertionError: hreflang rotos:
/en/de/b1/relative-clauses/index.html → hreflang="en-US" href="…-ROTO-CRITIC"
Tests 1 failed | 7 passed (8)
```

Revertido con `cp` desde backup, `diff` idéntico, retest → `8/8`.

**Inversión propia #2, distinta a la del Builder**: en vez de tocar
`active`, reordenó `USER_LANGUAGES` (movió `en` antes que `es`) para
confirmar que el candado de ORDEN también caza el defecto, no solo el de
`active`:

```
AssertionError: expected [ 'en','de','es' ] to deeply equal [ 'es','de','en' ]
AssertionError: expected 'en' to be 'es'
Tests 3 failed | 5 passed (8)
```

Revertido con `git checkout --`, `diff` idéntico contra backup, `git
status --short` vacío, retest → `8/8`.

**Estado final**: `git status`/`git diff --stat` solo muestran
`INDEX.md` y los tres archivos nuevos declarados. `dist/` confirmado
gitignorado.

## DEFECTOS ENCONTRADOS

NINGUNO.

## REGRESIONES

Ninguna. La suite completa sigue en 558/558 tras las dos inversiones y
reversiones del Critic.

## CONCLUSIÓN

El barrido de hreflang es real y exhaustivo, verificado con script
independiente del Critic (mismo resultado: 1380/1380 sin rotos). El
candado de forma de `USER_LANGUAGES` detecta tanto cambios de `active`
como de ORDEN — probado con una mutación que el Builder no había hecho.
La corrupción sobre una lección real del silo inglés (distinta a la
portada usada por el Builder) confirma que el candado no depende de la
forma particular de una sola página. Repositorio limpio tras toda la
inversión.

---
