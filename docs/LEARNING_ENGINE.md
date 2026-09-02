# Motor de aprendizaje adaptativo

Cómo PolyLingua decide qué te toca practicar.

La app pasó de «lección → quiz → siguiente lección» a un motor que observa qué
sabés, detecta qué fallás, lo refuerza y comprueba si lo dominás. Este
documento explica cómo está montado y cómo se amplía.

## Lo primero: qué NO es nuevo

Media infraestructura ya existía y se reutiliza tal cual. Conviene saberlo
antes de tocar nada, para no construir en paralelo algo que ya está:

| Pieza | Dónde | Papel |
| --- | --- | --- |
| Evento `practice-complete` | lo emite `src/components/Practice.astro` | La frontera UI → motor. Trae `results[]` con `id`, `correct`, `userAnswer`, `correctAnswer` |
| `ProgressTracker.astro` | escucha ese evento | Racha, logros, pool SRS **por ítem**, vocabulario aprendido |
| `src/lib/srs.ts` + `polylingua-srs-pool` | cajas Leitner en días | Repaso de preguntas concretas: «volvé a ver esta» |
| `src/lib/practiceItemMarkup.ts` | `buildItemFieldset()` | Monta un ejercicio en el DOM desde datos, con el mismo markup que genera el build |
| Banco de ejercicios | frontmatter de 478 lecciones | **4301 ítems ya escritos** (1844 quiz + 2457 ejercicios) |

El motor **no reemplaza nada de eso**. Se engancha al mismo evento y lleva un
modelo distinto, en paralelo.

## Arquitectura

```
UI (Practice.astro, practicar.astro)
        ↓  evento practice-complete
Controlador (EngineTracker.astro)
        ↓
Motor (src/lib/engine/*.ts — lógica pura, sin DOM)
        ↓
Store (learnerStore.ts → localStorage)
```

La UI no decide qué ejercicio toca. Le pregunta al motor. Y el motor no sabe
nada de Astro ni del navegador: son funciones puras que reciben datos y
devuelven datos, testeadas con vitest en `tests/engine.test.ts`.

## Los conceptos

### Skill

Una habilidad concreta y comprobable, **independiente de las lecciones**:
`de.a1.wordorder.time-verb-subject` es «empezar la frase por el tiempo y dejar
el verbo segundo».

El id lleva el idioma meta delante porque el repo enseña cinco idiomas desde
español: sin el prefijo, el `a1.verb.sein` alemán y su equivalente inglés
compartirían espacio de nombres en el mismo localStorage.

La relación con las lecciones es **N:N**, y eso es lo que le da valor: fallar
el orden de palabras en la lección de saludos cuenta para lo mismo que
fallarlo en la de la hora.

Catálogo: `src/data/skills.ts`.

### SkillProgress

Lo que sabemos de vos en esa habilidad: intentos, aciertos, racha, `mastery`
(0-100), cuándo toca repasar y en qué estado está
(`new → learning → weak → strong → mastered`).

El campo que hace el trabajo pesado es `streakExerciseIds`: los ids de los
ejercicios acertados en la racha actual. Sin él no se podría distinguir a
quien acertó cinco veces la misma frase de quien lo demostró en cinco
contextos distintos.

### LearnerError

Un fallo con tipo: `word_order`, `article`, `case`, `preposition`,
`conjugation`, `spelling`, `vocabulary`, `verb`.

El tipo se deduce comparando lo esperado con lo respondido
(`errors.ts → classifyError`). Es heurístico: sin análisis sintáctico no hay
certeza, pero para decidir qué practicar después alcanza. Distingue cosas que
importan de verdad — `der`/`die` es equivocarse de **artículo**, `der`/`den`
es equivocarse de **caso**, y se practican distinto.

La identidad de un error es `skillId::tipo`, no el texto. Por eso el mismo
patrón en frases distintas cuenta como el mismo error y puede escalar.

## Mastery: por qué acertar no es dominar

`mastery` mezcla tres cosas, no solo el porcentaje de aciertos:

- **tasa de acierto** (lo que sabés),
- **confianza** según cuántos intentos hay detrás (cuánta evidencia hay),
- **racha actual** (si lo sabés *ahora*).

Ponderado por dificultad: dominar algo de dificultad 5 vale más que algo de
dificultad 1.

Para llegar a `mastered` hacen falta **cinco aciertos seguidos en ejercicios
distintos**. Fallar borra la evidencia de variedad y hay que reconstruirla: si
no, bastaría con acumular aciertos sueltos entre fallos.

## Escalado de errores

```
1 fallo   → se registra
2 fallos  → se sigue observando
3 fallos  → refuerzo (severity: medium)
4 fallos  → prioridad alta (severity: high)
5+ fallos → reparación intensiva
```

En reparación intensiva la sesión deja de ser ejercicios sueltos: pasa a cinco
variaciones dirigidas al patrón, con una explicación corta delante. El orden
es **explicación corta → producción → repetición**, no una clase.

Un error se cierra tras **dos** aciertos, no uno: acertar una vez después de
fallar cuatro puede ser suerte.

## Repetición espaciada

Ocho escalones: 10 min, 1 h, 1 día, 3, 7, 14, 30, 60 días.

Los dos primeros son de minutos y horas a propósito. Cuando alguien acaba de
fallar el orden de palabras, esperar un día entero desperdicia el momento en
que está receptivo. (El `srs.ts` viejo, que sigue en uso para ítems, empieza
en 1 día; son sistemas distintos y conviven.)

Acertar sube un escalón. Fallar baja **dos**: algo que estaba en el escalón de
30 días y falla no estaba consolidado, y devolverlo a 14 lo daría por sabido
otra vez demasiado pronto.

## Scheduler: qué toca ahora

Prioridad, de más a menos urgente:

1. error grave reciente
2. error persistente
3. habilidad débil
4. repaso vencido
5. habilidad nueva (solo si sus prerrequisitos están encaminados)
6. repaso aleatorio

Una habilidad **dominada y sin repaso pendiente desaparece** de la rotación.
Es lo que hace que dominar algo se note.

`chooseNextSkill()` da la siguiente; `buildSession(n)` arma una tanda sin
repetir habilidad.

## Generación de ejercicios

Dos fuentes, en este orden:

1. **El banco de las lecciones.** Etiquetadas con `skills`, los 4301 ítems
   escritos a mano son un banco con contextos distintos entre sí, que es justo
   lo que hace falta para que dominar no sea repetir una frase.
2. **Plantillas** (`REPAIR_TEMPLATES`), solo para reparación, donde hacen
   falta variaciones dirigidas a un patrón concreto.

## Almacenamiento

Todo en `localStorage`, clave `polylingua-engine`, con `version: 1` y
`migrate()` desde el primer día.

Es una clave **nueva**: las 25 que ya usa la app (racha, logros, pool SRS,
vocabulario, lecciones completadas, diario…) quedan intactas. Migrarlas habría
obligado a reescribir todas las funciones existentes a la vez, con el riesgo
de borrar progreso real. La copia de seguridad de `/logros` exporta todo lo
que empieza por `polylingua-`, así que el estado del motor entra sola.

Nada sale del navegador: sin cuentas, sin servidor, sin analítica.

## Cómo se amplía

### Añadir una habilidad

1. Entrada nueva en `src/data/skills.ts` con id `<lang>.<nivel>.<tema>.<detalle>`,
   sus `prerequisites` y su `difficulty` (1-5).
2. Añadir su id al `skills:` del frontmatter de las lecciones que la enseñan.
3. `npx vitest run` — hay un test que comprueba que no queden prerrequisitos
   rotos ni habilidades sin lección.

### Añadir un tipo de ejercicio

El motor ya conoce los nueve tipos del documento en `ExerciseType`. Para que
uno nuevo se pueda **presentar** hacen falta dos cosas, ninguna en el motor:

1. Que `Practice.astro` sepa pintarlo y corregirlo.
2. Que `practiceItemMarkup.ts` sepa montarlo desde datos.

Después, mapearlo en `KIND_TO_TYPE` de `exerciseGenerator.ts`.

### Añadir A2, B1… u otro idioma

Solo datos: habilidades nuevas en `skills.ts` y el `skills:` en el frontmatter
de esas lecciones. La página `/practicar` se genera sola para cualquier curso
que tenga habilidades definidas (`getStaticPaths` las filtra por eso), así que
un idioma nuevo aparece sin tocar código.

## Qué falta

- Habilidades de A2 a C2 y de los otros cuatro idiomas.
- `listening`, `speaking` y `pronunciation` como tipos de ejercicio.
- `LevelProgress` está tipado pero todavía no se usa para desbloquear niveles:
  hoy eso sigue dependiendo del examen de nivel, que no se ha tocado.
