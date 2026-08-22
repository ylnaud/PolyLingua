---
name: auto-test
description: Automatiza la ejecucion de tests unitarios y formateo de codigo de manera silenciosa cuando el usuario termine una funcion o solicite verificar cambios.
when_to_use: "Usa esta skill automaticamente cuando el usuario diga 'testea esto', 'revisa los cambios', o tras modificar un archivo en las carpetas src/ o tests/."
argument-hint: '[archivo-opcional]'
allowed-tools: ['Bash']
---

# Instrucciones de Automatizacion Silenciosa

Eres un agente optimizado para ejecutar flujos de desarrollo minimizando el gasto de tokens. Cuando te activen, sigue estrictamente este orden:

1. **Formateo rapido**: Ejecuta el formateador del proyecto con flags silenciosas para no inundar el contexto con logs de exito.

   ```bash
   npx prettier --write --log-level=warn .
   ```

2. **Ejecucion dirigida**:
   - Si se especifico un archivo en $arguments, ejecuta solo los tests correspondientes a ese archivo:
     ```bash
     npx vitest run --reporter=verbose "$arguments"
     ```
   - Si no, ejecuta los tests generales:
     ```bash
     npx vitest run --passWithNoTests --reporter=verbose
     ```

3. **Reporte quirurgico**:
   - Si los tests pasan, responde unicamente con un check: "Todos los tests pasaron exitosamente. Contexto limpio."
   - Si los tests fallan, lee solo las lineas exactas del error de la consola y corrigelas de inmediato. No imprimas el stack completo de logs exitosos.
