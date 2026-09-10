# U-02 · Salida cruda de la inversión

=== BASELINE VERDE (antes de inyectar nada) ===

RUN v4.1.11 /home/user/PolyLingua

Test Files 1 passed (1)
Tests 2 passed | 49 skipped (51)
Start at 12:25:22
Duration 890ms (transform 609ms, setup 0ms, import 670ms, tests 21ms, environment 0ms)

=== DEFECTO 1 INYECTADO: se borró la entrada de.c2.idiom.prepositional (61 → 60) ===

RUN v4.1.11 /home/user/PolyLingua

❯ tests/engine.test.ts (51 tests | 1 failed | 50 skipped) 12ms
× el mapa lleva de.* completo (A1-C2) y nada de otro idioma meta 10ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

FAIL tests/engine.test.ts > glosa de las plantillas por idioma de usuario > el mapa lleva de.* completo (A1-C2) y nada de otro idioma meta
AssertionError: expected [ …(60) ] to have a length of 61 but got 60

- Expected

* Received

- 61

* 60

❯ tests/engine.test.ts:645:17
643| // medias sin que nadie lo note.
644| const ids = Object.keys(REPAIR_GLOSSES.en);
645| expect(ids).toHaveLength(61);
| ^
646| expect(ids.every((id) => id.startsWith('de.'))).toBe(true);
647| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

Test Files 1 failed (1)
Tests 1 failed | 50 skipped (51)
Start at 12:25:34
Duration 904ms (transform 616ms, setup 0ms, import 678ms, tests 12ms, environment 0ms)

=== DEFECTO 1 REVERTIDO ===

RUN v4.1.11 /home/user/PolyLingua

Test Files 1 passed (1)
Tests 1 passed | 50 skipped (51)
Start at 12:25:45
Duration 1.05s (transform 743ms, setup 0ms, import 815ms, tests 5ms, environment 0ms)

=== DEFECTO 2 INYECTADO: se quita la última translation de de.a2.verb.perfekt (8 → 7, variations sigue en 8) ===

RUN v4.1.11 /home/user/PolyLingua

❯ tests/engine.test.ts (51 tests | 1 failed | 50 skipped) 18ms
× cada translations[] de las 61 tiene el mismo largo que su variations[] 16ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

FAIL tests/engine.test.ts > glosa de las plantillas por idioma de usuario > cada translations[] de las 61 tiene el mismo largo que su variations[]
AssertionError: de.a2.verb.perfekt: 7 translations para 8 variations: expected 7 to be 8 // Object.is equality

- Expected

* Received

- 8

* 7

❯ tests/engine.test.ts:664:9
662| gloss.translations.length,
663| `${id}: ${gloss.translations.length} translations para ${base.…
    664|       ).toBe(base.variations.length);
       |         ^
    665|       gloss.translations.forEach((t, i) => {
    666|         expect(typeof t, `${id}[${i}]`).toBe('string');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

Test Files 1 failed (1)
Tests 1 failed | 50 skipped (51)
Start at 12:25:58
Duration 896ms (transform 625ms, setup 0ms, import 689ms, tests 18ms, environment 0ms)

=== DEFECTO 2 REVERTIDO ===

RUN v4.1.11 /home/user/PolyLingua

Test Files 1 passed (1)
Tests 2 passed | 49 skipped (51)
Start at 12:26:12
Duration 909ms (transform 618ms, setup 0ms, import 683ms, tests 26ms, environment 0ms)

=== git diff --check y git status tras revertir ambos defectos ===
M src/lib/engine/exerciseGenerator.ts
M tests/aislamiento-idioma.test.ts
M tests/engine.test.ts
?? .claude/agents/planner.md
