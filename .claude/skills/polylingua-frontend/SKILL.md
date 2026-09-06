---
name: polylingua-frontend
description: Reglas del frontend de PolyLingua — CSS puro sin framework, JavaScript vainilla mínimo, por qué `define:vars` no admite `import`, el patrón `data-*` para pasar datos al cliente, y el progreso en localStorage vía `src/lib/storage.ts`. Úsala antes de escribir cualquier `<script>`, `<style>` o funcionalidad que guarde progreso.
when_to_use: 'Cuando toque escribir o modificar JavaScript de cliente, CSS, un componente .astro interactivo, o cualquier cosa que lea o escriba el progreso del usuario. También si te tienta añadir una librería.'
---

# Frontend de PolyLingua

Dos dependencias de producción en todo el proyecto: `astro` y `@astrojs/sitemap`. El
principio es «cero JS extra», y se cumple.

**Nunca añadas una dependencia sin consultar.** Nada de React, Vue, Svelte, Tailwind,
Bootstrap ni librerías de UI. Si algo parece necesitar una, casi siempre hay un patrón
ya resuelto en el repo — búscalo antes de proponerla.

## CSS

- Un único `src/styles/global.css` (894 líneas) más `<style>` scoped en 28 componentes.
  Astro los aísla por componente solo.
- `astro.config.mjs` tiene `inlineStylesheets: 'auto'` y `compressHTML: true`.

**La regla `[hidden]` de `global.css:117` no se toca:**

```css
[hidden] {
  display: none !important;
}
```

Existe porque `.btn` / `.install-btn` ponen `display: inline-flex`, que sin ese
override gana la cascada frente al estilo por defecto del navegador (el CSS de autor
gana al del user-agent a igual especificidad) y deja botones supuestamente ocultos a la
vista. Si añades elementos que se ocultan con el atributo `hidden`, ya están cubiertos.

## JavaScript de cliente

42 archivos `.astro` con `<script>`, 49 bloques en total. La mayoría son módulos
normales; 5 usan `define:vars` y 2 `is:inline`.

### `define:vars` NO soporta `import`

Astro trata un `<script define:vars>` como `is:inline`, y un script inline no pasa por
el bundler. Si tu script necesita `import { read, write } from '../lib/storage'`, tienes
dos opciones:

1. Usar un `<script>` normal y leer los datos que necesites **del DOM**, por atributos
   `data-*` o de la URL.
2. Si son strings del diccionario, usar el puente ya hecho: la página renderiza un
   `<div hidden data-page-strings={JSON.stringify(...)}>` y el script lo lee con
   `readPageStrings()` de `src/lib/pageStrings.ts`.

Este es el patrón del proyecto. No inventes otro mecanismo.

## Progreso del usuario: localStorage

Todo el progreso —SRS de repaso, logros, racha diaria, lecciones completadas,
vocabulario aprendido, tema, sonido, objetivo diario, sprint semanal, diario, errores—
se persiste client-side. Hay unas 37 keys, todas con prefijo `polylingua-`.

El wrapper es **`src/lib/storage.ts`**: `read`/`write` con try/catch, más `exportAll` /
`importAll` para la copia de seguridad de `/logros`. Úsalo en vez de llamar a
`localStorage` directo.

**La excepción real, dicha con precisión.** Hay 9 llamadas directas en el repo, y no
todas son deuda:

- Justificadas y no se tocan: `BaseLayout.astro:118` (script `is:inline` que evita el
  flash de tema **antes** de pintar; no puede importar nada) y `logros.astro:199`
  (`define:vars`).
- Podrían usar el wrapper y no lo hacen: `ThemeToggle.astro`, `repasar.astro` y
  `src/lib/sound.ts`. Todas llevan su propio try/catch, así que no son un bug — pero si
  editas una de esas líneas, pásala por `storage.ts`.

Para código nuevo la regla es simple: **pasa por `storage.ts`**, con key prefijada
`polylingua-`. Si estás en un `define:vars` o en un script pre-pintado y no puedes
importar, envuelve la llamada en try/catch tú mismo y deja un comentario diciendo por
qué.

localStorage **no sirve** para nada que deba ser indexable o relevante para SEO: para
eso el contenido va estático en el `.md`.

## Dos módulos compartidos que son excepciones deliberadas

El proyecto evita módulos JS compartidos entre componentes, pero hay dos, y los dos
están documentados en su cabecera:

- **`src/lib/sound.ts`** — efectos de sonido sintetizados con Web Audio API (sin
  archivos de audio, sin librerías) y pronunciación con `speechSynthesis`. Lo usan
  `Practice.astro`, `SoundEffects.astro` y `SoundToggle.astro`, y no puede divergir.
- **`src/lib/practiceItemMarkup.ts`** — construye en runtime el mismo markup que
  `Practice.astro` genera en build. Existe solo para la página de repaso/SRS, que es el
  único sitio que arma el DOM de Practice desde datos de localStorage en vez de desde
  frontmatter. **Si cambias el markup de `Practice.astro` para un `kind`, tienes que
  actualizar este archivo también** — el script de Practice consulta por selectores.

## Los ejercicios se pintan en el servidor

`src/components/Practice.astro` (1361 líneas) une `quiz[]` y `exercises[]` en una sola
lista de ítems con cinco tipos: `choice`, `fill-blank`, `write`, `match`, `order`. El
HTML de los cinco es **estático**; el script de cliente solo corrige, puntúa y baraja.
Mantén esa división: no muevas la generación de markup al cliente.

Selectores reales, por si tienes que dirigir la página desde un test:
`[data-practice-item]`, `[data-option]`, `[data-check]`, `[data-next]`,
`[data-answer-input]`.

## Accesibilidad

Lo que ya hay y no debe perderse: skip link, `aria-live` en los quizzes, `aria-labelledby`
en las secciones, y contraste cuidado. Si añades un control interactivo, dale nombre
accesible y estado; si añades una zona que cambia sola, decide si necesita `aria-live`.

## Dos trampas al probar en el navegador

- `DailyGoal.astro` muestra un `<dialog>` ~400 ms después de cargar si no hay objetivo
  guardado, y **bloquea los clics de toda la página**. `CookieNotice.astro` hace lo
  mismo la primera visita. El driver de `run-polylingua` los pre-siembra en
  localStorage con `seedLocalStorage(page)`; llámalo antes de cada `goto`.
- Playwright **no intercepta** las peticiones que salen de un Service Worker. Un test
  que use `route()` para simular fallos de red interceptará cero y pasará sin probar
  nada. Ya produjo un falso positivo aquí.
