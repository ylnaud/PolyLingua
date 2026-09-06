---
name: auto-test
description: Formatea los archivos tocados y ejecuta los tests de PolyLingua de forma silenciosa, sin inundar el contexto con logs de exito.
when_to_use: "Usa esta skill automaticamente cuando el usuario diga 'testea esto', 'revisa los cambios', o tras modificar un archivo en las carpetas src/ o tests/."
argument-hint: '[archivo-opcional]'
allowed-tools: ['Bash']
---

# Verificacion silenciosa

Flujo optimizado para gastar pocos tokens. Sigue este orden.

## 1. Formatea SOLO los archivos tocados

```bash
git diff --name-only HEAD | grep -E '\.(ts|astro|md|mjs|json|css)$' | xargs -r npx prettier --write --log-level=warn
```

**Nunca `npx prettier --write .`**. Este repo tiene 484 lecciones en Markdown y
Prettier reformatea las que le apetezca: un `--write .` ha metido 120 archivos ajenos
en un commit dos veces, enterrando el cambio real en el diff. Si al terminar aparece
en `git status` un archivo que no querias tocar, `git restore` sobre el antes de
seguir.

## 2. Ejecuta los tests

- Con un archivo en `$arguments`, solo los suyos:
  ```bash
  npx vitest run --reporter=verbose "$arguments"
  ```
- Sin argumentos, la suite entera:
  ```bash
  npx vitest run --passWithNoTests --reporter=verbose
  ```

Linea base actual: **451 tests en 17 archivos**. Si el total baja sin que hayas
borrado tests, algo dejo de ejecutarse.

## 3. Si tocaste `src/`, comprueba tipos y build

Los tests de Vitest no ejecutan el esquema Zod del contenido ni compilan las paginas.
Los tres comandos que existen de verdad en `package.json` — no hay `npm run lint`:

```bash
npm run check   # LEE LA LINEA "- N errors"
npm run build   # linea base: 1042 paginas
```

Sobre `npm run check`: el output termina con ~125 hints, asi que un `| tail -3` deja
fuera el recuento de errores y un build con 6 errores reales parece verde. Filtra por
la linea que importa:

```bash
npm run check 2>&1 | grep -E '^- [0-9]+ errors'
```

## 4. Reporte quirurgico

- Si pasa todo: una linea. "451 tests OK, 0 errores de tipos, 1042 paginas."
- Si falla: lee solo las lineas del error y corrigelas. No vuelques el stack ni los
  logs de los tests que pasaron.
