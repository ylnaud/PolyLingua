# U-03 · Salida cruda de la inversión

=== BASELINE VERDE ===

RUN v4.1.11 /home/user/PolyLingua

Test Files 1 passed (1)
Tests 4 passed (4)
Start at 12:56:12
Duration 256ms (transform 21ms, setup 0ms, import 35ms, tests 27ms, environment 0ms)

=== DEFECTO 1 INYECTADO: se borró dist/en/de/index.html (ruta crítica) ===

RUN v4.1.11 /home/user/PolyLingua

❯ tests/baseline.test.ts (4 tests | 2 failed) 34ms
× el build genera exactamente 1043 páginas HTML 26ms
× las rutas críticas existen en el build 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

FAIL tests/baseline.test.ts > U-03 — baseline de páginas, sitemap y rutas críticas > el build genera exactamente 1043 páginas HTML
AssertionError: expected 1042 to be 1043 // Object.is equality

- Expected

* Received

- 1043

* 1042

❯ tests/baseline.test.ts:49:34
47| // 1042 rutas de Astro + 404.html, que Astro genera aparte y no cu…
48| // su propio «page(s) built» (es un archivo de error, no una ruta).
49| expect(countHtmlFiles(DIST)).toBe(1043);
| ^
50| });
51|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

FAIL tests/baseline.test.ts > U-03 — baseline de páginas, sitemap y rutas críticas > las rutas críticas existen en el build
AssertionError: en/de/index.html: expected false to be true // Object.is equality

- Expected

* Received

- true

* false

❯ tests/baseline.test.ts:89:44
87| ];
88| for (const r of rutas) {
89| expect(existsSync(join(DIST, r)), r).toBe(true);
| ^
90| }
91| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯

Test Files 1 failed (1)
Tests 2 failed | 2 passed (4)
Start at 12:56:17
Duration 288ms (transform 28ms, setup 0ms, import 42ms, tests 34ms, environment 0ms)

=== DEFECTO 1 REVERTIDO (rebuild completo) ===

RUN v4.1.11 /home/user/PolyLingua

Test Files 1 passed (1)
Tests 4 passed (4)
Start at 12:56:34
Duration 251ms (transform 11ms, setup 0ms, import 23ms, tests 26ms, environment 0ms)

=== DEFECTO 2 INYECTADO: se quitó una URL /es/de/ del sitemap-0.xml a mano (436 -> 435 en silo es, 544 -> 543 total) ===

RUN v4.1.11 /home/user/PolyLingua

❯ tests/baseline.test.ts (4 tests | 2 failed) 30ms
× el sitemap tiene exactamente 544 URLs 7ms
× el sitemap por silo: es 436, en 92 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

FAIL tests/baseline.test.ts > U-03 — baseline de páginas, sitemap y rutas críticas > el sitemap tiene exactamente 544 URLs
AssertionError: expected [ …(543) ] to have a length of 544 but got 543

- Expected

* Received

- 544

* 543

❯ tests/baseline.test.ts:53:27
51|
52| it('el sitemap tiene exactamente 544 URLs', () => {
53| expect(sitemapUrls()).toHaveLength(544);
| ^
54| });
55|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

FAIL tests/baseline.test.ts > U-03 — baseline de páginas, sitemap y rutas críticas > el sitemap por silo: es 436, en 92
AssertionError: silo es: expected 435 to be 436 // Object.is equality

- Expected

* Received

- 436

* 435

❯ tests/baseline.test.ts:62:42
60| porSilo.set(s, (porSilo.get(s) ?? 0) + 1);
61| }
62| expect(porSilo.get('es'), 'silo es').toBe(436);
| ^
63| expect(porSilo.get('en'), 'silo en').toBe(92);
64| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯

Test Files 1 failed (1)
Tests 2 failed | 2 passed (4)
Start at 12:56:41
Duration 266ms (transform 23ms, setup 0ms, import 35ms, tests 30ms, environment 0ms)

=== DEFECTO 2 REVERTIDO ===

RUN v4.1.11 /home/user/PolyLingua

Test Files 1 passed (1)
Tests 4 passed (4)
Start at 12:56:48
Duration 240ms (transform 12ms, setup 0ms, import 25ms, tests 25ms, environment 0ms)

=== git diff --check y git status tras ambas reparaciones ===
M tests/build.test.ts
?? .claude/agents/planner.md
?? gauntlet/evidence/U-03-inversion.md
?? tests/baseline.test.ts
