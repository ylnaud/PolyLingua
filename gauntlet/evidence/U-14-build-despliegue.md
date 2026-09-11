# Evidencia — U-14 (build y despliegue)

## Corrida exitosa

```
$ npx vitest run tests/deploy.test.ts
Test Files  1 passed (1)
     Tests  14 passed (14)
```

## Inversión 1 — `main` agregado a `wrangler.jsonc` (`src/` de nivel raíz, versionado)

```
$ git diff --stat wrangler.jsonc
(vacío — confirmado limpio antes de tocar)
$ cp wrangler.jsonc /tmp/wrangler-backup-u14.jsonc
```

Cambio: se agregó `"main": "worker/redirect.ts"` (el mismo Worker que
`tests/dominio.test.ts` ya prueba como candidato real, citado también en
`docs/MIGRACION-DOMINIO.md`).

```
$ npx vitest run tests/deploy.test.ts
FAIL ... > wrangler.jsonc ... > tiene exactamente estas cuatro claves de primer nivel
FAIL ... > wrangler.jsonc ... > NO lleva "main": Cloudflare sirve dist/ como assets, sin ejecutar código
AssertionError: expected true to be false
Tests  2 failed | 12 passed (14)
```

Revertido:

```
$ cp /tmp/wrangler-backup-u14.jsonc wrangler.jsonc
$ diff /tmp/wrangler-backup-u14.jsonc wrangler.jsonc
IDÉNTICO tras revertir
$ npx vitest run tests/deploy.test.ts
Test Files  1 passed (1)
     Tests  14 passed (14)
```

## Inversión 2 — cabecera de seguridad borrada (`public/_headers`, versionado)

```
$ git diff --stat public/_headers
(vacío — confirmado limpio antes de tocar)
$ cp public/_headers /tmp/headers-backup-u14.txt
```

Cambio: se quitó la línea `X-Frame-Options: DENY`.

```
$ npx vitest run tests/deploy.test.ts
FAIL tests/deploy.test.ts > public/_headers — la config de seguridad activa > lleva la cabecera X-Frame-Options
Tests  1 failed | 13 passed (14)
```

Revertido:

```
$ cp /tmp/headers-backup-u14.txt public/_headers
$ diff /tmp/headers-backup-u14.txt public/_headers
IDÉNTICO tras revertir
$ npx vitest run tests/deploy.test.ts
Test Files  1 passed (1)
     Tests  14 passed (14)
```

## Verificación completa (comandos separados)

```
$ npm run check
Result (172 files):
- 0 errors
- 0 warnings
- 126 hints

$ npm run build
[build] 1042 page(s) built in 9.16s

$ npm test
Test Files  25 passed (25)
     Tests  588 passed (588)
```

## Commit exacto identificado

`check`/`build`/`test` confirmados en verde, en ese orden, sobre HEAD =
`fb0b6a97b7c0ba8a9e70b39f3e2ad8f76425e799` (commit del piloto de Liquid
Glass, el último antes de esta unidad). El commit que cierra U-14 se
construye sobre ese estado ya verificado, sin ningún cambio intermedio
sin verificar entre uno y otro.
