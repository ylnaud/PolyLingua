# U-04 · Salida cruda de la inversión

=== BASELINE VERDE ===

RUN v4.1.11 /home/user/PolyLingua

Test Files 1 passed (1)
Tests 5 passed (5)
Start at 21:31:00
Duration 270ms (transform 22ms, setup 0ms, import 38ms, tests 13ms, environment 0ms)

=== DEFECTO 1 INYECTADO: se borró src/content/lessons/es-de/a1/zahlen.md (32 -> 31 lecciones) ===

RUN v4.1.11 /home/user/PolyLingua

❯ tests/a1-es-de-regression.test.ts (5 tests | 2 failed) 24ms
× hay exactamente 32 lecciones, con estos 32 nombres 9ms
× exactamente 106 items de quiz y 170 de exercises, sumados 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

FAIL tests/a1-es-de-regression.test.ts > U-04 — A1 es→de sin regresión > hay exactamente 32 lecciones, con estos 32 nombres
AssertionError: expected [ 'arbeit-alltag', …(30) ] to have a length of 32 but got 31

- Expected

* Received

- 32

* 31

❯ tests/a1-es-de-regression.test.ts:72:25
70| .map((f) => f.replace(/\.md$/, ''))
71| .sort();
72| expect(slugsReales).toHaveLength(32);
| ^
73| expect(slugsReales).toEqual([...SLUGS_ESPERADOS].sort());
74| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

FAIL tests/a1-es-de-regression.test.ts > U-04 — A1 es→de sin regresión > exactamente 106 items de quiz y 170 de exercises, sumados
AssertionError: total quiz: expected 103 to be 106 // Object.is equality

- Expected

* Received

- 106

* 103

❯ tests/a1-es-de-regression.test.ts:94:32
92| exercises += countList(raw, 'type');
93| }
94| expect(quiz, 'total quiz').toBe(106);
| ^
95| expect(exercises, 'total exercises').toBe(170);
96| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯

Test Files 1 failed (1)
Tests 2 failed | 3 passed (5)
Start at 21:31:05
Duration 289ms (transform 15ms, setup 0ms, import 30ms, tests 24ms, environment 0ms)

=== DEFECTO 1 REVERTIDO (restaurado byte a byte) ===

RUN v4.1.11 /home/user/PolyLingua

Test Files 1 passed (1)
Tests 5 passed (5)
Start at 21:31:11
Duration 275ms (transform 28ms, setup 0ms, import 44ms, tests 16ms, environment 0ms)

=== DEFECTO 2 INYECTADO: quiz y exercises de tiere.md vaciados a mano (queda con 0 y 0) ===

RUN v4.1.11 /home/user/PolyLingua

❯ tests/a1-es-de-regression.test.ts (5 tests | 2 failed) 23ms
× exactamente 106 items de quiz y 170 de exercises, sumados 9ms
× ninguna de las 32 lecciones tiene quiz Y exercises vacíos a la vez 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

FAIL tests/a1-es-de-regression.test.ts > U-04 — A1 es→de sin regresión > exactamente 106 items de quiz y 170 de exercises, sumados
AssertionError: total quiz: expected 103 to be 106 // Object.is equality

- Expected

* Received

- 106

* 103

❯ tests/a1-es-de-regression.test.ts:94:32
92| exercises += countList(raw, 'type');
93| }
94| expect(quiz, 'total quiz').toBe(106);
| ^
95| expect(exercises, 'total exercises').toBe(170);
96| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

FAIL tests/a1-es-de-regression.test.ts > U-04 — A1 es→de sin regresión > ninguna de las 32 lecciones tiene quiz Y exercises vacíos a la vez
AssertionError: lecciones sin quiz ni exercises: tiere.md: expected [ 'tiere.md' ] to deeply equal []

- Expected

* Received

- []

* [
* "tiere.md",
* ]

❯ tests/a1-es-de-regression.test.ts:106:77
104| if (quiz === 0 && exercises === 0) vacias.push(f);
105| }
106| expect(vacias, `lecciones sin quiz ni exercises: ${vacias.join(', …
| ^
107| });
108|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯

Test Files 1 failed (1)
Tests 2 failed | 3 passed (5)
Start at 21:31:23
Duration 299ms (transform 25ms, setup 0ms, import 39ms, tests 23ms, environment 0ms)

=== DEFECTO 2 REVERTIDO ===

RUN v4.1.11 /home/user/PolyLingua

Test Files 1 passed (1)
Tests 5 passed (5)
Start at 21:31:30
Duration 258ms (transform 15ms, setup 0ms, import 29ms, tests 13ms, environment 0ms)

=== git diff --check y git status tras ambas reparaciones ===
?? .claude/agents/planner.md
?? gauntlet/evidence/U-04-inversion.md
?? tests/a1-es-de-regression.test.ts
