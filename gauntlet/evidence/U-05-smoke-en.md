# U-05 · Salida cruda del flujo de punta a punta

```bash
npm run build
npx astro preview --port 4321 &
node .claude/skills/run-polylingua/driver.mjs smoke-en --port 4321 --out /tmp/polylingua-smoke-en.png
```

=== SALIDA REAL ===

```
OK — You got 14 / 20
Ítems respondidos (incluido el de refuerzo insertado): 20
Texto del bucle de refuerzo: "Regular present: drop the -en from the infinitive and add the ending for the person — ich -e, du -st, er/sie/es -t, wir -en, ihr -t, sie/Sie -en."
Captura guardada en /tmp/polylingua-smoke-en.png
```

## Inversión

Se quitaron temporalmente `de.a1.verb.present-regular` y `de.a1.wordorder.basic`
de `REPAIR_GLOSSES.en` (las dos habilidades de esta lección), se reconstruyó,
y se corrió `smoke-en` esperando que fallara:

```
$ node .claude/skills/run-polylingua/driver.mjs smoke-en --port 4321
FALLÓ: El bucle de refuerzo no insertó ningún aviso (.drill-tip) tras la respuesta incorrecta.
exit code: 1
```

Revertido con `git checkout -- src/lib/engine/exerciseGenerator.ts` (diff vacío
confirmado), reconstruido, y `smoke-en` vuelve a dar el mismo resultado exacto
de antes:

```
OK — You got 14 / 20
Ítems respondidos (incluido el de refuerzo insertado): 20
Texto del bucle de refuerzo: "Regular present: drop the -en from the infinitive and add the ending for the person — ich -e, du -st, er/sie/es -t, wir -en, ihr -t, sie/Sie -en."
```

`smoke` (el flujo es-de original) se corrió también tras el revert, sin
cambios: `OK — Acertaste 7 / 10`.
