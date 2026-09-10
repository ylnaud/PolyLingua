# Unidades del Gauntlet

Una fila por pieza. Solo U-01 a U-07 tienen ficha desarrollada: fijar
criterios de aceptación sobre código que no se ha auditado a fondo produce
barras genéricas, que es justo lo que este sistema existe para evitar.

| #    | Unidad                                | Tipo             | Estado | Ficha                                       |
| ---- | ------------------------------------- | ---------------- | ------ | ------------------------------------------- |
| U-01 | Pureza de idioma del silo inglés      | auto             | `PASS` | [ficha](U-01-pureza-idioma-en.md)           |
| U-02 | Glosas de refuerzo A2–C2 para `en-de` | auto + contenido | `PASS` | [ficha](U-02-glosas-refuerzo-en-de.md)      |
| U-03 | Cifras base y rutas críticas          | auto             | `PASS` | [ficha](U-03-cifras-base-rutas-criticas.md) |
| U-04 | A1 `es→de` sin regresión              | auto             | `PASS` | [ficha](U-04-a1-es-de-sin-regresion.md)     |
| U-05 | A1 `en→de` de punta a punta           | auto + browser   | `PASS` | [ficha](U-05-a1-en-de-punta-a-punta.md)     |
| U-06 | A2 `en→de`                            | auto + browser   | `PASS` | [ficha](U-06-a2-en-de.md)                   |
| U-07 | B1 `en→de`                            | auto + browser   | `PASS` | [ficha](U-07-b1-en-de.md)                   |
| U-08 | Interfaz de idiomas                   | auto             | `TODO` | —                                           |
| U-09 | Sistema de skills                     | auto             | `TODO` | —                                           |
| U-10 | Ejercicios (los 5 `kind`)             | auto + browser   | `TODO` | —                                           |
| U-11 | Repair engine                         | auto             | `TODO` | —                                           |
| U-12 | Navegación y enlaces                  | auto             | `TODO` | —                                           |
| U-13 | Responsive y accesibilidad            | auto + browser   | `TODO` | —                                           |
| U-14 | Build y despliegue                    | auto             | `TODO` | —                                           |
| U-15 | Marcado **Beta** de A2–C2             | auto + producto  | `TODO` | —                                           |

## Barras en una línea, para las que aún no tienen ficha

- **U-08** — Selector con tres filas; hreflang solo hacia páginas que existen.
- **U-09** — Cero habilidades huérfanas, cero referencias a ids inexistentes,
  484/484 lecciones etiquetadas.
- **U-10** — Los cinco `kind` responden y puntúan; `fill-blank` lleva su `___`.
- **U-11** — Sin caída de idioma entre glosas, por los dos caminos (DrillTutor y
  reparación intensiva de `practicar`).
- **U-12** — Cero enlaces internos rotos; miga de pan coherente entre silos.
- **U-13** — Sin desbordamiento horizontal en 360 / 768 / 1280, más los candados
  estáticos de a11y sobre `dist/`.
- **U-14** — `build`, `test` y `check` verdes, y el commit exacto identificado.

## U-15 — nota de producto

**Decidido, no bloqueado.** La instrucción vigente es: A1 estable, A2–C2 y el
inglés todavía incompleto marcados como **Beta**, y el español sin regresiones.

Queda registrado que expuse dos veces la reserva contraria —marcar como
provisionales 55 lecciones completas y ya indexadas, por una función (el bucle de
refuerzo A2–C2) que está apagada en silencio y que nunca se le anunció al
alumno— y que la decisión se confirmó después de eso. Se ejecuta cuando le toque
el turno; hoy no, porque la tanda era solo U-01.

Hecho a tener en cuenta al implementarla: **hoy no existe ningún marcado Beta en
el repositorio.** Buscado en `src/`, `src/i18n/dictionary.ts`, `src/data/levels.ts`
y la página de curso. U-15 es construirlo, no reactivarlo.
