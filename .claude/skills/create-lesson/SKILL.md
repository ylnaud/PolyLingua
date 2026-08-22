---
name: create-lesson
description: Genera automáticamente el archivo Markdown de una nueva lección de alemán con el frontmatter correcto (Zod schema) y contenido pedagógico gamificado.
when_to_use: "Usa esta skill automáticamente cuando el usuario te pida crear, generar o escribir una nueva lección, tema o nivel de alemán (ej: 'crea una lección de A1 sobre acusativos')."
argument-hint: "[nivel/nombre-archivo.md]"
allowed-tools: ["Bash", "Write"]
---

# Flujo de Creación de Lecciones para PolyLingua

Eres un creador de contenido experto para PolyLingua. Tu objetivo es generar lecciones de alemán de alta calidad que respeten estrictamente el esquema de datos de Astro.

1. **Estructura Obligatoria**:
   Crea el archivo en `src/content/lessons/de/[nivel]/[nombre-archivo].md`. El archivo DEBE empezar con este frontmatter exacto:
   ```yaml
   ---
   language: 'de'
   level: '[a1|a2|b1|b2|c1|c2]'
   title: 'Título divertido de la lección'
   description: 'Resumen corto y atractivo para SEO (menos de 160 caracteres)'
   order: [número correlativo]
   grammarTopic: 'Tema gramatical formal'
   funFact: 'Un truco visual o regla mnemotécnica divertida'
   minutes: [tiempo estimado de lectura, ej: 5]
   quiz:
     - question: '¿Pregunta en alemán?'
       options:
         - 'Opción A'
         - 'Opción B'
         - 'Opción C'
       answerIndex: [0, 1 o 2]
       explanation: 'Explicación sencilla de por qué es la correcta'
   exercises:
     - type: 'fill-blank'
       sentence: 'Oración con ___ hueco'
       answer: 'respuesta'
       hint: 'Pista sobre la regla gramatical'
       translation: 'Traducción al español'
     - type: 'match'
       pairs:
         - left: 'Alemán 1'
           right: 'Español 1'
         - left: 'Alemán 2'
           right: 'Español 2'
         - left: 'Alemán 3'
           right: 'Español 3'
     - type: 'order'
       sentence: 'Oración completa en alemán con palabras en orden correcto'
       translation: 'Traducción al español'
   ---
   ```

   **Campos obligatorios**: `language`, `level`, `title`, `description`, `order`, `grammarTopic`, `funFact`, `minutes`, `quiz`.
   **Campos opcionales con default vacío**: `exercises`, `vocabulary`, `situation`, `phrases`.

2. **Estilo del Contenido**:
   - Redacta la lección debajo del frontmatter usando Markdown limpio.
   - Usa un tono divertido, gamificado y cercano (evita explicaciones aburridas de libros tradicionales).
   - Incluye ejemplos claros en alemán con su traducción al español en cursiva.
   - Los ejercicios `fill-blank` deben contener el literal `___` en `sentence`.
   - Los ejercicios `match` necesitan mínimo 3 pares.
   - Usa block-style YAML para arrays (nunca trailing commas en flow-style).

3. **Antes de terminar**:
   - Ejecuta `npx astro build` para validar que el frontmatter pasa el esquema Zod.
   - Si el build falla, corrige el frontmatter y vuelve a intentar.

4. **Reporte Ultra-Compacto (Ahorro de Tokens)**:
   - Una vez creado y validado el archivo, no imprimas todo el contenido en el chat.
   - Responde con un resumen breve indicando la ruta del archivo creado.
