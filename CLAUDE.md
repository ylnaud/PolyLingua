# PolyLingua — Instrucciones para Claude Code

> **Regla principal:** no asumas. Inspecciona, entiende, cambia lo mínimo necesario y verifica el resultado real.
>
> Estas instrucciones combinan las reglas específicas de PolyLingua con un protocolo de ingeniería orientado a evitar cambios innecesarios, regresiones y falsos positivos de "todo está bien".

---

# 1. Comportamiento obligatorio antes de programar

## 1.1 Piensa antes de tocar código

No empieces a editar archivos inmediatamente.

Antes de implementar:

1. Inspecciona el código relevante.
2. Identifica dónde está realmente la lógica.
3. Comprueba qué comportamiento existe actualmente.
4. Identifica las restricciones del proyecto que afectan al cambio.
5. Formula una hipótesis sobre la causa si estás corrigiendo un bug.
6. Define cómo comprobarás que el cambio funciona.

No inventes arquitectura, APIs, funciones, archivos, datos ni relaciones que no hayas comprobado.

Si no sabes algo:

* dilo;
* busca la evidencia en el repositorio;
* o pregunta si la decisión requiere información del usuario.

Nunca conviertas una suposición en un hecho.

## 1.2 Si existen varias interpretaciones

Si una petición puede significar varias cosas:

* enumera brevemente las interpretaciones;
* indica cuál parece compatible con el código existente;
* pregunta si la elección cambia materialmente el resultado.

No elijas silenciosamente una interpretación que pueda provocar una modificación incorrecta.

## 1.3 Si existe una solución más sencilla

Antes de implementar una solución compleja, comprueba si puede resolverse:

* modificando una función existente;
* reutilizando una utilidad existente;
* modificando datos existentes;
* añadiendo un test;
* cambiando una única plantilla;
* o corrigiendo el origen del problema.

No introduzcas abstracciones, configuraciones o capas nuevas sin necesidad.

---

# 2. Objetivo de cada tarea

Toda tarea debe convertirse en un objetivo verificable.

Ejemplos:

```text
"Corrige este bug"
→ reproducir el bug
→ crear o localizar una prueba que lo demuestre
→ corregirlo
→ ejecutar la prueba
→ verificar que el comportamiento real ha cambiado
```

```text
"Añade una funcionalidad"
→ identificar el comportamiento esperado
→ localizar el punto correcto de integración
→ implementar el mínimo código necesario
→ comprobar casos relevantes
→ ejecutar check/build/tests
→ verificar el resultado generado
```

```text
"Refactoriza X"
→ comprobar comportamiento actual
→ refactorizar sin cambiar comportamiento
→ ejecutar tests
→ comprobar build
→ comprobar que las rutas/salidas afectadas siguen siendo iguales
```

No consideres terminada una tarea porque el código "parece correcto".

---

# 3. Plan de ejecución

Para tareas que impliquen varios pasos, presenta primero un plan breve:

```text
1. [Acción] → verificar: [comprobación]
2. [Acción] → verificar: [comprobación]
3. [Acción] → verificar: [comprobación]
```

El plan debe ser proporcional a la tarea.

No escribas planes enormes para cambios triviales.

---

# 4. Cambios quirúrgicos

## 4.1 Toca únicamente lo necesario

Cada línea modificada debe poder relacionarse directamente con la petición.

No:

* refactorices código cercano "porque podría mejorarse";
* reformatees archivos completos;
* cambies nombres sin necesidad;
* reorganices carpetas sin necesidad;
* actualices dependencias porque sí;
* elimines código antiguo que no esté relacionado;
* cambies contenido no solicitado.

Si encuentras código muerto o mejorable que no pertenece a la tarea:

**menciónalo, pero no lo elimines.**

## 4.2 Limpieza permitida

Si tu propio cambio deja:

* imports sin usar;
* variables sin usar;
* funciones creadas por tu cambio que ya no se utilizan;
* referencias huérfanas;

elimínalos.

No aproveches para limpiar código preexistente.

---

# 5. No sobreingeniería

La solución debe ser la mínima que resuelva el problema.

No crees:

* nuevas abstracciones para un único uso;
* configuraciones que nadie ha pedido;
* sistemas genéricos "por si algún día";
* capas adicionales;
* nuevos servicios;
* nuevos managers;
* nuevas dependencias;

si el problema puede resolverse de forma más sencilla.

Pregunta internamente:

> ¿Un senior engineer consideraría esto innecesariamente complejo?

Si la respuesta es sí, simplifica.

---

# 6. Verificación: build verde NO significa tarea correcta

Esta regla es especialmente importante en PolyLingua.

Un build correcto demuestra que el código puede compilarse.

**No demuestra que la aplicación muestre el contenido correcto.**

Por tanto:

```text
BUILD VERDE
≠
FUNCIONALIDAD CORRECTA
```

Para cambios que afecten al usuario:

1. verifica el código;
2. ejecuta los tests relevantes;
3. ejecuta `npm run check`;
4. ejecuta `npm run build`;
5. inspecciona el output generado cuando corresponda;
6. verifica la URL, contenido, estructura o comportamiento afectado;
7. comprueba que no se ha roto una ruta relacionada.

Si el problema es de contenido, no basta con comprobar que el Markdown es válido.

Si el problema es de routing, no basta con comprobar TypeScript.

Si el problema es SEO, no basta con comprobar que Astro compila.

Si el problema es visual o de HTML generado, inspecciona el resultado generado.

---

# 7. Gauntlet Loop

Para bugs importantes, cambios de arquitectura, cambios de routing, contenido masivo, motor de aprendizaje, SEO, Service Worker o cambios que puedan afectar muchas páginas, utiliza este ciclo:

```text
┌─────────────┐
│   INSPECT   │
└──────┬──────┘
       ↓
┌─────────────┐
│    PLAN     │
└──────┬──────┘
       ↓
┌─────────────┐
│ IMPLEMENT   │
└──────┬──────┘
       ↓
┌─────────────┐
│    TEST     │
└──────┬──────┘
       ↓
┌─────────────┐
│    CHECK    │
└──────┬──────┘
       ↓
┌─────────────┐
│    BUILD    │
└──────┬──────┘
       ↓
┌─────────────┐
│   VERIFY    │
└──────┬──────┘
       ↓
┌─────────────┐
│    CRITIC   │
└──────┬──────┘
       ↓
   ¿Correcto?
    /      \
  NO        SÍ
  ↓          ↓
FIX       FINISH
  │
  └────────→ VERIFY
```

## 7.1 INSPECT

Antes de editar:

* lee los archivos relevantes;
* busca referencias;
* sigue las funciones hasta su origen;
* identifica tests existentes;
* comprueba datos reales;
* comprueba cómo se genera la salida.

## 7.2 PLAN

Define:

* causa;
* archivos que deben cambiar;
* archivos que NO deben cambiar;
* método de verificación.

## 7.3 IMPLEMENT

Haz el cambio mínimo.

## 7.4 TEST

Ejecuta los tests relevantes.

Si existe un bug reproducible y no existe una prueba adecuada, considera crear primero una prueba que reproduzca el fallo.

## 7.5 CHECK

```bash
npm run check
```

## 7.6 BUILD

```bash
npm run build
```

## 7.7 VERIFY

Comprueba el resultado real.

## 7.8 CRITIC

Actúa como un revisor independiente:

* ¿se solucionó realmente el problema?
* ¿se modificó algo fuera del alcance?
* ¿hay una regresión?
* ¿el build verde está ocultando un fallo funcional?
* ¿el contenido mostrado es correcto?
* ¿las rutas generadas son correctas?
* ¿se respetaron las reglas de PolyLingua?

Si existe un fallo, vuelve a `FIX`.

---

# 8. Regla de evidencia

No digas:

> "Esto debería funcionar."

cuando no lo hayas comprobado.

Usa:

> "No lo he verificado todavía."

o:

> "Lo he verificado ejecutando X."

Distingue siempre entre:

* **observado**;
* **inferido**;
* **comprobado**.

No presentes una inferencia como evidencia.

---

# 9. PolyLingua — Contexto del proyecto

PolyLingua es un sitio estático de aprendizaje de idiomas con niveles MCER A1–C2.

Idiomas meta actuales:

* alemán (`de`)
* inglés (`en`)
* español (`es`)
* francés (`fr`)
* italiano (`it`)
* portugués (`pt`)

Interfaces activas:

* español (`es`)
* inglés (`en`)

Cursos actualmente existentes:

| Curso   | Interfaz | Idioma meta |
| ------- | -------- | ----------- |
| `es-de` | Español  | Alemán      |
| `es-en` | Español  | Inglés      |
| `es-fr` | Español  | Francés     |
| `es-it` | Español  | Italiano    |
| `es-pt` | Español  | Portugués   |
| `en-de` | Inglés   | Alemán      |

No confundas:

* `userLang` = idioma de interfaz;
* `targetLang` = idioma que se enseña.

---

# 10. Stack — respetarlo SIEMPRE

* Astro 7 en modo SSG.
* HTML estático.
* CSS puro.
* JavaScript vanilla mínimo.
* TypeScript estricto.
* Content Collections con Zod.
* `@astrojs/sitemap`.

## NO introducir

* React.
* Vue.
* Svelte.
* Tailwind.
* Bootstrap.
* frameworks CSS.
* librerías JS pesadas.

No añadas dependencias sin necesidad y sin consultar.

El principio del proyecto es:

> **cero JavaScript extra siempre que sea posible.**

---

# 11. Estructura de carpetas clave

```text
src/pages/[userLang]/[targetLang]/[level]/[slug].astro
→ silo principal de lecciones

src/pages/[userLang]/[targetLang]/<herramienta>.astro
→ herramientas dentro del silo

src/pages/[userLang]/<herramienta>.astro
→ selector de idioma

src/pages/idiomas/[lang]/...
→ SOLO redirecciones 301 legacy

src/layouts/
→ layouts reutilizables, head, meta, header/footer

src/components/
→ componentes Astro

src/content/lessons/<userLang>-<targetLang>/<nivel>/<slug>.md
→ contenido de las lecciones

src/content.config.ts
→ schema Zod de lessons

src/lib/lessonPath.ts
→ parseLessonId(): único lugar que conoce el formato del ID

src/lib/courses.ts
→ único lugar que determina qué cursos existen

src/data/userLanguages.ts
→ idiomas de interfaz

src/data/languages.ts
→ idiomas meta

src/data/units.ts
→ unidades de cada nivel

src/data/skills.ts
→ catálogo de habilidades

src/lib/engine/
→ motor adaptativo

src/i18n/dictionary.ts
→ textos de interfaz

src/lib/pageStrings.ts
→ strings entregados al JavaScript cliente

src/lib/storage.ts
→ acceso a localStorage

src/styles/
→ CSS global

public/
→ assets estáticos

astro.config.mjs
→ configuración Astro y sitemap

tests/
→ tests Vitest

worker/
→ Worker relacionado con redirecciones

docs/
→ documentación larga del proyecto
```

---

# 12. Dos ejes de idioma

Este es uno de los puntos donde más fácilmente se puede introducir un bug.

## `userLang`

Idioma de la interfaz.

Actualmente:

```text
es
en
```

Existe también `de` en la configuración, pero está inactivo.

## `targetLang`

Idioma que se enseña:

```text
de
en
es
fr
it
pt
```

## URL

La estructura es:

```text
/<userLang>/<targetLang>/<level>/<slug>
```

Ejemplo:

```text
/es/de/a1/articulos-der-die-das
```

significa:

```text
userLang = es
targetLang = de
level = a1
slug = articulos-der-die-das
```

El campo:

```yaml
language: de
```

es siempre el idioma meta.

Nunca interpretes `language` como `userLang`.

---

# 13. Cursos: fuente de verdad

`src/lib/courses.ts` es el único lugar que conoce qué cursos existen.

Utiliza:

```text
getCourseStaticPaths()
getTargetLangsFor()
getCourseLessons()
```

No recorras `LANGUAGES` directamente para descubrir cursos.

No asumas que todos los idiomas pueden combinarse.

Por ejemplo:

```text
es-es
de-de
```

no son cursos simplemente porque esos idiomas existan.

El sistema deriva los cursos de las carpetas reales de:

```text
src/content/lessons/
```

---

# 14. Herramientas dentro del silo

Las herramientas de curso viven dentro del eje:

```text
/<userLang>/<targetLang>/<herramienta>
```

Ejemplos conceptuales:

```text
/es/de/vocabulario
/en/de/vocabulario
```

Son páginas diferentes porque la interfaz es diferente.

Los textos de las herramientas salen de:

```text
src/i18n/dictionary.ts
```

El JavaScript cliente recibe strings mediante:

```text
[data-page-strings]
```

No uses `define:vars` si el script necesita imports.

---

# 15. Herramientas exclusivas del silo español

Diálogos, generador de frases y recursos se generan actualmente solo para el silo español.

Su contenido tiene fuentes específicas:

```text
src/content/dialogos
src/data/matrices.ts
src/data/resources.ts
```

El filtro correspondiente es:

```text
SPANISH_GLOSS_USER_LANG
```

No generalices estas herramientas a otros `userLang` sin una decisión explícita de producto y sin implementar los datos necesarios.

---

# 16. Frontmatter de las lecciones

Una lección utiliza un frontmatter validado por Zod.

Ejemplo:

```yaml
---
language: 'de'
level: 'a1'
title: 'Título SEO con keyword'
description: 'Meta description de 130 a 160 caracteres con keyword'
order: 1
grammarTopic: 'Tema gramatical'
funFact: 'Truco mnemotécnico'
minutes: 7
unit: 1
quiz:
  - question: '¿Pregunta?'
    options:
      - 'Opción A'
      - 'Opción B'
      - 'Opción C'
    answerIndex: 0
    explanation: 'Por qué es correcta'
exercises:
  - type: 'fill-blank'
    sentence: 'Ich ___ Deutsch.'
    answer: 'lerne'
vocabulary:
  - term: 'lernen'
    translation: 'aprender'
skills:
  - 'de.a1.wordorder.basic'
---
```

---

# 17. Reglas de frontmatter

## `language`

Obligatorio.

Es el idioma que se enseña.

Valores válidos:

```text
de | en | es | fr | it | pt
```

Nunca representa `userLang`.

## `level`

Debe ser:

```text
a1 | a2 | b1 | b2 | c1 | c2
```

## `title`

Debe ser descriptivo y adecuado para SEO.

## `description`

Debe ser aproximadamente de 130–160 caracteres y contener la keyword relevante.

## `order`

Determina el orden dentro del nivel.

## `unit`

Aunque Zod pueda permitirlo opcionalmente, las páginas de nivel necesitan una unidad válida cuando el nivel está organizado por unidades.

Utiliza siempre una unidad existente en:

```text
src/data/units.ts
```

Si el tema realmente requiere una unidad nueva, añade la unidad correctamente en `units.ts`.

No dejes una lección sin unidad simplemente para evitar decidir.

## `skills`

Las lecciones nuevas deben etiquetarse con sus habilidades.

Los IDs deben existir en:

```text
src/data/skills.ts
```

No inventes skill IDs.

---

# 18. Skills y motor adaptativo

El campo `skills` alimenta el motor de aprendizaje adaptativo.

Documentación:

```text
docs/LEARNING_ENGINE.md
```

Catálogo:

```text
src/data/skills.ts
```

Motor:

```text
src/lib/engine/
```

La relación es N:N:

```text
una lección → varias skills
una skill → varias lecciones
```

No confundas:

```text
"la lección enseña esta skill"
```

con:

```text
"la skill tiene suficiente cobertura"
```

Una skill puede estar etiquetada en lecciones y no tener todavía plantilla de refuerzo.

No inventes `REPAIR_TEMPLATES` ni `REPAIR_GLOSSES`.

Si modificas el motor, lee primero:

```text
docs/LEARNING_ENGINE.md
```

y los tests correspondientes.

---

# 19. Exercises

Tipos admitidos:

```text
fill-blank
match
write
order
```

Para `fill-blank`:

```text
sentence
```

debe contener literalmente:

```text
___
```

Para `match`:

* mínimo 3 pares.

No inventes tipos de ejercicios sin modificar primero el schema y las partes que los consumen.

---

# 20. Contenido educativo

El contenido educativo es parte de la funcionalidad de PolyLingua.

No modifiques contenido no solicitado.

No inventes:

* reglas gramaticales;
* traducciones;
* ejemplos;
* niveles CEFR;
* skills;
* unidades;
* respuestas de quizzes;
* explicaciones;
* relaciones entre habilidades;

solo para hacer que una prueba pase.

Si detectas que un contenido es incorrecto pero no forma parte de la tarea:

1. no lo cambies automáticamente;
2. informa del problema.

---

# 21. CEFR / A1 → C2

Los niveles representan:

```text
A1
A2
B1
B2
C1
C2
```

No cambies el nivel de una lección únicamente porque "parece más apropiado".

Los cambios de clasificación afectan:

* navegación;
* URLs;
* unidades;
* orden;
* SEO;
* motor adaptativo;
* cobertura de skills.

Si una reclasificación es necesaria, analiza primero todas las consecuencias.

---

# 22. Astro

Prioriza páginas `.astro` estáticas.

No conviertas una página estática en una aplicación cliente sin una razón clara.

JavaScript cliente debe existir únicamente cuando sea necesario para una interacción real.

Antes de añadir JS pregunta:

> ¿Esto puede resolverse con HTML/CSS/Astro?

Si sí, utiliza la solución más sencilla.

---

# 23. `define:vars`

En Astro, un script con `define:vars` se trata como `is:inline` y no debe utilizarse como sustituto de un módulo cuando se necesitan imports.

Si necesitas:

```ts
import { read, write } from '../lib/storage'
```

utiliza un `<script>` normal y pasa la información necesaria mediante:

* `data-*`;
* atributos;
* URL;
* o el mecanismo ya utilizado por el proyecto.

No inventes otra arquitectura.

---

# 24. Progreso y localStorage

Todo el progreso client-side utiliza:

```text
src/lib/storage.ts
```

Funciones:

```text
read()
write()
```

No llames directamente a:

```text
localStorage
```

para nuevas funcionalidades.

Las claves utilizan el prefijo:

```text
polylingua-
```

Esto incluye progreso, SRS, logros, racha, vocabulario, tema y sonido.

Si añades una funcionalidad de progreso:

1. utiliza `storage.ts`;
2. utiliza una key con prefijo `polylingua-`;
3. no inventes otro sistema de almacenamiento.

El contenido indexable y SEO-relevante sigue siendo contenido estático.

---

# 25. SEO

Toda página relevante debe conservar:

* `<title>`;
* meta description;
* canonical;
* Open Graph cuando corresponda;
* JSON-LD cuando corresponda.

Las lecciones deben tener JSON-LD de:

```text
LearningResource
```

Los títulos deben contener la keyword relevante cuando corresponda.

Las meta descriptions deben mantenerse alrededor de:

```text
130–160 caracteres
```

Los slugs deben ser descriptivos.

Correcto:

```text
articulos-der-die-das
```

Incorrecto:

```text
leccion-01
page-1
test
```

No cambies URLs existentes sin analizar:

* enlaces internos;
* canonical;
* sitemap;
* redirecciones;
* SEO;
* posibles URLs legacy.

---

# 26. Sitemap

El sitemap utiliza:

```text
@astrojs/sitemap
```

No generes otro sistema de sitemap.

Los filtros dependen de la configuración existente.

Si modificas idiomas activos, revisa:

```text
astro.config.mjs
src/data/userLanguages.ts
src/i18n/dictionary.ts
```

y los tests relacionados.

---

# 27. Activación de una interfaz

Añadir un idioma de interfaz NO consiste simplemente en:

```text
active: true
```

Primero debe existir el diccionario completo en:

```text
src/i18n/dictionary.ts
```

El tipo `Dictionary` debe cumplirse completamente.

Después se puede activar el idioma.

No actives una interfaz que no tenga todas las traducciones necesarias.

---

# 28. Service Worker

El Service Worker es una zona de alto riesgo.

Antes de modificarlo, lee:

```text
src/lib/swPrecache.ts
tests/sw.test.ts
src/pages/sw.js.ts
```

La clasificación de documentos se realiza mediante:

```text
esDocumentoSW()
```

No vuelvas a decidir si una petición es documento basándote únicamente en:

```text
request.mode
```

El motivo es que `ClientRouter` y el prefetch de Astro realizan navegación mediante fetch que no necesariamente presenta las características de una navegación documental tradicional.

Las páginas deben seguir la estrategia de:

```text
red primero
```

Los assets pueden seguir su estrategia correspondiente.

El precache utiliza:

```text
Promise.allSettled
```

No sustituyas esto por `cache.addAll` sin comprender las consecuencias.

Si modificas el Service Worker:

```text
test → build → comprobar precache → verificar comportamiento
```

---

# 29. Cloudflare

El hosting real es Cloudflare Workers con assets estáticos.

Configuración:

```text
wrangler.jsonc
```

Build:

```text
dist/
```

Producción se publica desde `main`.

No introduzcas configuración de Vercel como si fuera el hosting actual.

Antes de modificar despliegue:

```text
wrangler.jsonc
docs/MIGRACION-DOMINIO.md
```

---

# 30. Cambio de dominio

Si la tarea implica cambiar el dominio, lee primero:

```text
docs/MIGRACION-DOMINIO.md
```

La URL principal vive en:

```text
src/data/site.ts
```

Desde ahí se relaciona con:

* `astro.config.mjs`;
* canonical;
* Open Graph;
* sitemap;
* Worker de redirección.

También existen archivos estáticos que no pueden importar módulos:

```text
public/robots.txt
public/llms.txt
public/og-image.svg
src/styles/global.css
```

No uses `_redirects` como sustituto de la redirección por dominio en Cloudflare.

---

# 31. Comandos

Instalación:

```bash
npm install
```

Desarrollo:

```bash
npm run dev
```

Check:

```bash
npm run check
```

Tests:

```bash
npm test
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

Formato:

```bash
npm run format
```

No existe actualmente:

```text
npm run lint
```

No inventes un comando de lint.

---

# 32. Verificación mínima antes de terminar

Para cualquier cambio de código relevante:

```bash
npm run check
npm run build
```

Si el cambio afecta tests:

```bash
npm test
```

Si afecta una funcionalidad concreta, ejecuta además los tests específicos.

Pero recuerda:

```text
check + build + tests
```

no sustituyen la comprobación del resultado real cuando el cambio es user-facing.

---

# 33. Cuando un test falla

No hagas esto:

```text
test falla
→ modificar el test hasta que pase
```

Haz esto:

```text
test falla
→ entender qué comportamiento está protegiendo
→ determinar si el código o el test está equivocado
→ corregir la causa
→ ejecutar de nuevo
```

Los tests existentes son parte del contrato del proyecto salvo que exista una razón demostrable para cambiar ese contrato.

---

# 34. Cuando el build falla

Primero clasifica el fallo:

```text
schema/content
TypeScript
Astro
routing
import
SEO
test
Service Worker
```

Corrige la causa raíz.

No ocultes el error relajando tipos, eliminando validaciones o cambiando schemas únicamente para conseguir un build verde.

---

# 35. Regla especial para contenido masivo

Si una tarea modifica muchas lecciones:

1. no edites cientos de archivos inmediatamente;
2. prueba primero con un pequeño subconjunto;
3. verifica el resultado;
4. comprueba que el patrón es correcto;
5. después amplía el cambio;
6. ejecuta las comprobaciones de integridad.

Nunca hagas una transformación masiva basándote únicamente en una suposición sobre la estructura de los archivos.

---

# 36. Regla especial para URLs y routing

Antes de cambiar una ruta:

1. busca quién genera la ruta;
2. busca enlaces internos;
3. busca canonical;
4. busca sitemap;
5. busca redirects;
6. busca tests;
7. comprueba rutas relacionadas.

No soluciones un problema de routing creando una segunda fuente de verdad.

`parseLessonId()` debe seguir siendo el único lugar que conoce el formato del ID de lección.

---

# 37. Regla especial para datos

Si un dato ya existe en:

```text
src/data/
src/content/
src/lib/
```

reutilízalo.

No dupliques el mismo dato en otro archivo.

Si necesitas cambiar la fuente de verdad, explica primero por qué.

---

# 38. Regla especial para interfaces

Cuando cambies un componente compartido:

1. identifica todas las páginas que lo utilizan;
2. comprueba si `userLang` cambia su contenido;
3. comprueba desktop y móvil si el cambio es visual;
4. conserva accesibilidad;
5. conserva SEO.

No arregles un componente compartido para una página creando una excepción específica si el problema está realmente en los datos que recibe.

---

# 39. Accesibilidad

No elimines:

* skip links;
* `aria-*`;
* `aria-live` de quizzes;
* labels;
* estados de foco;
* contraste;
* navegación por teclado.

Si cambias una interacción, conserva o mejora la accesibilidad existente.

No sacrifiques accesibilidad por ahorrar unas líneas de código.

---

# 40. Formato y estilo

Respeta el estilo existente.

No reformatees archivos completos salvo que la tarea sea específicamente de formato.

Utiliza Prettier cuando corresponda:

```bash
npm run format
```

No introduzcas un nuevo estilo de código arbitrariamente.

---

# 41. Dependencias

Antes de añadir una dependencia:

1. comprueba si el proyecto ya resuelve el problema;
2. comprueba si Astro o TypeScript lo pueden resolver;
3. comprueba si existe una utilidad propia;
4. explica por qué hace falta.

El valor por defecto es:

> **No añadir dependencia.**

---

# 42. No inventar APIs

Nunca inventes una API, endpoint, función o paquete.

Antes de utilizar algo:

* busca si existe;
* lee su implementación;
* comprueba sus imports;
* revisa su uso existente.

Si una API externa es necesaria, indícalo antes de introducirla.

No hagas fetch a APIs externas durante el build sin avisar y sin comprobar el impacto sobre:

* reproducibilidad;
* SEO;
* tiempos de build;
* disponibilidad;
* secretos;
* despliegue.

---

# 43. No introducir IA sin petición explícita

PolyLingua no debe incorporar IA, APIs de IA, generación automática mediante modelos ni servicios externos de IA salvo que la tarea lo solicite explícitamente.

No "mejores" una funcionalidad introduciendo IA.

---

# 44. No introducir autenticación sin petición explícita

No añadas:

* login;
* cuentas;
* OAuth;
* registro;
* backend de usuarios;

como parte de una mejora no solicitada.

El progreso actual es client-side.

---

# 45. No convertir PolyLingua en una aplicación pesada

El objetivo arquitectónico es:

```text
HTML estático
+
Astro
+
CSS puro
+
JS mínimo cuando sea necesario
```

No transformes PolyLingua en una SPA por comodidad del desarrollo.

---

# 46. Comunicación

Explica los cambios en lenguaje sencillo.

El usuario puede estar aprendiendo Astro.

Antes de mostrar código, indica el archivo:

```text
Archivo: src/lib/example.ts
```

Después explica brevemente:

* qué estaba mal;
* qué se cambió;
* por qué;
* cómo se verificó.

No utilices jerga innecesaria.

---

# 47. Qué debe incluir una tarea terminada

Al terminar una tarea relevante, informa:

```text
## Hecho

- [cambio realizado]
- [otro cambio]

## Verificación

- npm run check → OK
- npm test → OK / no ejecutado porque...
- npm run build → OK

## Verificación funcional

- [qué comportamiento real se comprobó]

## Archivos modificados

- archivo 1
- archivo 2
```

Si algo no pudo verificarse, dilo explícitamente.

Nunca marques como "verificado" algo que no comprobaste.

---

# 48. Si descubres un problema ajeno a la tarea

No lo arregles automáticamente.

Informa:

```text
He encontrado además X, pero no lo he modificado porque está fuera del alcance de esta tarea.
```

Solo corrígelo si:

* el usuario lo pide;
* o el problema fue creado directamente por tu propio cambio.

---

# 49. Regla final contra regresiones

Antes de terminar pregunta:

```text
¿Qué podía romper este cambio?
```

Comprueba las áreas directamente afectadas.

Especialmente:

```text
userLang
targetLang
routing
SEO
content collections
skills
units
engine
localStorage
Service Worker
sitemap
mobile layout
```

No des por supuesto que una modificación local es local si toca código compartido.

---

# 50. Regla de oro

Cuando tengas dudas:

```text
NO ASUMIR
↓
INSPECCIONAR
↓
ENTENDER
↓
PLANIFICAR
↓
CAMBIAR LO MÍNIMO
↓
PROBAR
↓
BUILD
↓
VERIFICAR EL RESULTADO REAL
↓
CRITICAR
↓
CORREGIR SI ES NECESARIO
```

**El objetivo no es producir mucho código.**

**El objetivo es producir el cambio correcto, con la menor superficie de riesgo posible, y demostrar que funciona.**
