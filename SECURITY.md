# Política de seguridad

PolyLingua es un sitio estático (Astro SSG, sin backend ni servidor propio,
sin cuentas de usuario ni base de datos). El progreso del usuario vive
solo en `localStorage`, en su propio navegador — no se envía a ningún
servidor. El alcance de una vulnerabilidad realista acá es principalmente
XSS, problemas de configuración de headers/CSP, o supply-chain en las
dependencias del build.

## Cómo reportar una vulnerabilidad

Si encontrás un problema de seguridad, reportalo de forma privada a
través de
[GitHub Security Advisories](https://github.com/ylnaud/PolyLingua/security/advisories/new)
en vez de abrir un issue público. Incluí:

- Una descripción del problema y su impacto potencial.
- Pasos para reproducirlo (URL, payload, navegador si aplica).

No hay un programa de recompensas (bug bounty). Se agradece el reporte
responsable y se intentará responder y corregir en un plazo razonable.

## Alcance

- **En alcance**: el código fuente de este repositorio (`src/`, config de
  build, headers de seguridad, workflows de CI).
- **Fuera de alcance**: la infraestructura de hosting de terceros
  (Cloudflare) en sí misma — reportá eso directamente al proveedor.
