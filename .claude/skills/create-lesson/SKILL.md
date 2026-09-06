---
name: create-lesson
description: Genera el archivo Markdown de una nueva lección de PolyLingua (alemán, inglés, francés, italiano o portugués) con el frontmatter correcto según el esquema Zod y contenido pedagógico gamificado.
when_to_use: "Usa esta skill automáticamente cuando el usuario te pida crear, generar o escribir una nueva lección, tema o nivel de cualquiera de los cinco idiomas (ej: 'crea una lección de A1 sobre acusativos', 'añade una lección de francés B1')."
argument-hint: '[curso/nivel/nombre-archivo.md]'
allowed-tools: ['Bash', 'Read', 'Write']
---

# Crear una lección en PolyLingua

Generas lecciones que respetan el esquema Zod de Astro. Si el frontmatter no cumple,
el build falla — así que la validación es tu red de seguridad, no un trámite.

## 1. La ruta: el error cuyo mensaje no te dice dónde está

La lección va en:

```
src/content/lessons/<userLang>-<targetLang>/<nivel>/<slug>.md
```

**Los dos idiomas, siempre.** `userLang` es el idioma en que está escrita la
explicación; `targetLang` es el que se enseña. Ejemplo real:
`src/content/lessons/es-de/a1/articulos-der-die-das.md` — interfaz en español,
enseña alemán.

Los seis cursos que existen, y no hay más:

| Carpeta | Interfaz | Enseña    | Lecciones                        |
| ------- | -------- | --------- | -------------------------------- |
| `es-de` | Español  | Alemán    | 91                               |
| `es-fr` | Español  | Francés   | 78                               |
| `es-en` | Español  | Inglés    | 77                               |
| `es-it` | Español  | Italiano  | 77                               |
| `es-pt` | Español  | Portugués | 77                               |
| `en-de` | Inglés   | Alemán    | 84 (curso oculto, `en` inactivo) |

> **No escribas nunca en `src/content/lessons/de/`.** Esa carpeta no existe. Si la
> creas, el build falla —bien— pero con un mensaje que **no nombra tu archivo**:
>
> ```
> generating static routes
> Missing parameter: targetLang
>   Location: node_modules/astro/dist/core/routing/generator.js:18:13
> ```
>
> (Comprobado creando una de verdad, no deducido.) El glob recoge el archivo,
> `parseLessonId('de/a1/x')` devuelve `targetLang: undefined` y el generador de rutas
> de Astro rechaza el parámetro. Si te topas con ese error y nada de lo que tocaste
> parece relacionado, busca una lección en una carpeta de un solo idioma:
> `ls src/content/lessons/` debe mostrar solo los seis cursos `xx-yy`.

El slug debe ser descriptivo y con keywords (`articulos-der-die-das`), nunca
`leccion-01`.

## 2. El frontmatter

**Lee `src/content.config.ts` antes de escribir**: es la fuente de verdad y puede
haber cambiado. Lo que sigue es la forma, no el sustituto de esa lectura.

```yaml
---
language: 'de' # el idioma que se ENSEÑA (targetLang). Nunca el de la interfaz
level: 'a1' # a1 | a2 | b1 | b2 | c1 | c2
title: 'Título con keyword, sin genéricos'
description: 'Entre 130 y 160 caracteres, con la keyword. Es la meta description.'
order: 3 # posición dentro del nivel
unit: 2 # ver abajo — ponlo siempre
grammarTopic: 'Artículos determinados (der/die/das)'
funFact: 'El truco mnemotécnico. Es el callout "💡 Truco para no aburrirte"'
skills: # opcional, ver abajo
  - de.a1.article.der-die-das
minutes: 5
quiz:
  - question: '¿Pregunta?'
    options:
      - 'Opción A'
      - 'Opción B'
      - 'Opción C'
    answerIndex: 0
    explanation: 'Por qué es la correcta'
exercises:
  - type: 'fill-blank'
    sentence: 'Ich ___ Deutsch.' # DEBE contener el literal ___
    answer: 'lerne'
    hint: 'Explica la REGLA, no repitas la respuesta'
    translation: 'Aprendo alemán.'
vocabulary:
  - term: 'der Tisch'
    translation: 'la mesa'
---
```

**Obligatorios para Zod**: `language`, `level`, `title`, `description`, `order`,
`grammarTopic`, `funFact`.

**Opcionales para Zod pero que debes rellenar igual**:

- **`unit`** — la página de nivel agrupa las lecciones por unidad
  (`src/data/units.ts`, con clave `<targetLang>-<nivel>`). Una lección sin `unit`, o
  con un `unit` que no esté en esa lista, no pertenece a ningún grupo: llegó a haber
  15 invisibles en su propio nivel aunque seguían en el sitemap.
  `tests/data-integrity.test.ts` falla si aparece alguna. Si el tema no encaja en
  ninguna unidad, añade una a `units.ts` en vez de dejarlo vacío.
- **`skills`** — alimenta el motor adaptativo (`src/lib/engine/`, documentado en
  `docs/LEARNING_ENGINE.md`). Los ids salen del catálogo de `src/data/skills.ts`; no
  te los inventes, los tests fallan si referencias uno inexistente. Puedes omitirlo:
  la lección simplemente no alimenta al motor.

Tipos de `exercises`: `fill-blank` (necesita `___`), `match` (mínimo 3 `pairs`),
`write`, `order`.

## 3. Estilo

- La explicación va **en español** (es el idioma de la interfaz); los ejemplos,
  el quiz y los ejercicios van **en el idioma que se enseña**.
- Tono cercano y gamificado, no manual de instrucciones.
- Los ejercicios deben reutilizar vocabulario que ya aparece en el cuerpo de la
  lección: refuerzan lo enseñado, no examinan algo nuevo.
- `hint` explica la regla («terminación -ig: masculina casi siempre»), no repite la
  respuesta.
- YAML en bloque para los arrays, nunca flow-style con coma final: es un error de
  parseo, no un detalle de estilo.

## 4. Antes de terminar

Los tres comandos existen de verdad en `package.json` — no inventes otros, no hay
`npm run lint`:

```bash
npm run check   # lee la línea "- N errors": el output acaba en ~125 hints y un
                # `| tail -3` esconde el recuento de errores
npm test        # los tests de unidades, skills y SEO
npm run build   # lo único que ejecuta el esquema Zod
```

Formatea **solo el archivo que creaste**, nunca el repo entero:
`npx prettier --write <ruta-del-archivo>`. Un `prettier --write .` reformatea decenas
de lecciones ajenas y entierra tu cambio en el diff.

## 5. Reporte

No vuelques la lección entera en el chat. Responde con la ruta creada, el nivel, la
unidad y si lleva `skills`.
