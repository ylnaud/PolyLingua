# Gauntlet Loop — PolyLingua

Un contrato de trabajo, no una plataforma. Existe por una sola regla:

> **Quien implementa no puede ser el único que decida que su trabajo está bien.**

No es una precaución teórica. En la sesión donde se diseñó esto, quien
implementaba (yo) dio por buena una barrida de idioma que se le escapó un
literal; afirmó que el aviso de refuerzo saltaba «tras fallar repetido» cuando
salta al primer fallo; y escribió un test de correspondencia por índice que **no
detectaba** el intercambio que decía detectar, hasta que lo probó saboteándolo.
Los tres se cazaron tarde y por casualidad.

## El bucle

```
Builder  → implementa UNA unidad. Ejecuta build/test/check. NO declara PASS.
   ↓        Entrega: diff, comandos ejecutados y su salida cruda.
Critic   → NO usa el resumen del Builder como evidencia. Reejecuta los comandos
   ↓        él mismo, lee el diff, intenta romper el candado → PASS/FAIL/BLOCKED
Repair   → corrige solo la causa. Vuelve a Critic.
   ↓
PLATEAU  → dos rondas con el MISMO defecto ⇒ se para y se escribe qué se intentó,
   ↓        por qué la estrategia no funciona y qué decisión humana hace falta.
Integration Critic → cuando varias unidades pasan, revisa el sistema completo.
   ↓
Commit pequeño · árbol limpio · PR · checks verdes · merge (= producción)
```

## Estados

| Estado        | Significado                                                    |
| ------------- | -------------------------------------------------------------- |
| `TODO`        | Definida, sin empezar                                          |
| `IN-PROGRESS` | El Builder está dentro                                         |
| `CRITIC`      | Esperando veredicto                                            |
| `FAIL`        | El Critic la rechazó; hay defecto concreto que reparar         |
| `BLOCKED`     | No se puede verificar con evidencia, o depende de una decisión |
| `PLATEAU`     | Dos rondas con el mismo defecto; requiere intervención humana  |
| `NEEDS-HUMAN` | La barra incluye juicio que ninguna máquina dictamina          |
| `PASS`        | Criterio cumplido, con evidencia, y el Critic lo confirmó      |

## Reglas duras

1. **«No pude comprobarlo» es `BLOCKED`, nunca `PASS`.**
2. **Un candado que no se ha visto fallar no es un candado.** Cada check se
   entrega probado al revés: se inyecta el defecto, se comprueba que falla
   nombrándolo, se revierte, se comprueba que vuelve a verde. La salida cruda de
   las tres ejecuciones se guarda en `evidence/`.
3. **No se borra una detección por incómoda.** Primero se demuestra que es un
   falso positivo, se documenta por qué, y la exclusión se acota a la ocurrencia
   conocida para que una nueva siga saltando.
4. **Una unidad a la vez.** El estado vive en su ficha, no en la conversación.
5. **`FAIL` exige evidencia reproducible**: archivo, línea y salida. «Parece
   incorrecto» no es un veredicto.

## Comandos reales del proyecto

No hay otros. No inventar ninguno.

```bash
npm run build   # astro build — 1042 páginas
npm test        # vitest run
npm run check   # astro check
npx vitest run tests/<archivo>.test.ts    # una unidad concreta
npx prettier --check <archivos>
```

**Por separado, nunca encadenados.** `tests/build.test.ts` reconstruye `dist/`
dentro de la propia suite, así que `npm run build && npm test` provoca una
carrera con los 13 archivos de test que leen `dist/`.

Los checks de navegador no están en CI: no hay Chromium en el runner de GitHub
Actions y meterlo pediría dependencias nuevas. Se ejecutan en local con
`.claude/skills/run-polylingua/driver.mjs`.

## Dónde vive cada cosa

- **Verificadores automáticos** → `tests/`. El proyecto ya tiene 13 de 18
  archivos de test afirmando contra el HTML publicado; eso ya es la «evidencia
  real» que pide el bucle. Se extiende, no se duplica con un runner paralelo.
- **Fichas de unidad** → `gauntlet/units/`.
- **Salidas crudas que prueban una afirmación** → `gauntlet/evidence/`.
- **El Critic** → `.claude/agents/gauntlet-critic.md`.
