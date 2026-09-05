# Mudanza al dominio propio

Hoy el sitio se sirve desde el subdominio gratuito de Cloudflare:

```
https://polylingua.thyronemiguelvegasantana-c6e.workers.dev
```

Este documento es la lista de todo lo que hay que tocar cuando se compre un
dominio, y el porqué de cada cosa. Está escrito por adelantado a propósito: el
día de la mudanza no es momento de investigar cómo funcionan las
redirecciones de Cloudflare.

---

## Por qué NO hay un fichero `_redirects`

Es lo primero que uno intenta, y **no funciona**. La tabla de compatibilidad de
la documentación de Cloudflare lo dice explícitamente:

| Feature                    | Support |
| -------------------------- | ------- |
| **Domain-level redirects** | ❌      |

`_redirects` sabe mirar la **ruta**, no el **host**. Y ese es justo el dato que
hace falta, porque tras la mudanza el mismo Worker sirve los dos nombres: el
`*.workers.dev` viejo y el dominio nuevo. Una regla como

```txt
/*  https://dominio-nuevo.com/:splat  301
```

se aplicaría a los dos hosts por igual, así que el dominio nuevo se
redirigiría **a sí mismo**. Bucle infinito, sitio entero caído. No es un riesgo
teórico: es exactamente lo que hace esa regla.

Por eso la redirección se resuelve con código que sí puede mirar el host:
`src/lib/dominio.ts`, montado en `worker/redirect.ts`.

---

## Los tres cambios

### 1. La URL del sitio — una línea

`src/data/site.ts`:

```ts
export const SITE_URL = 'https://el-dominio-nuevo.com';
```

De ahí salen solos el `site:` de `astro.config.mjs`, y con él **todos** los
canonical, los Open Graph y el sitemap, porque se derivan de `Astro.site`
(`BaseLayout.astro:52`). También el host que muestra `/privacidad` y el que
compara el Worker de redirección.

### 2. Encender el Worker de redirección

`worker/redirect.ts` ya está escrito y probado, pero **inerte**: hoy
`wrangler.jsonc` no lo referencia. Para encenderlo:

```jsonc
{
  "name": "polylingua",
  "compatibility_date": "2026-08-26",
  "main": "./worker/redirect.ts",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "run_worker_first": true,
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page",
  },
}
```

Los dos campos nuevos dentro de `assets` son obligatorios **los dos**:

- **`"binding": "ASSETS"`** — sin él, `env.ASSETS` llega `undefined` y el Worker
  revienta en cada petición que no sea una redirección. O sea, en todas las del
  dominio bueno.
- **`"run_worker_first": true`** — esta es la trampa fina. Por defecto
  Cloudflare sirve el asset que coincida **sin invocar el Worker**, y solo lo
  llama cuando no encuentra ninguno. Como todas las páginas viejas sí existen
  en `dist/`, sin este flag el Worker no vería nunca las peticiones que hay que
  redirigir —que son justo todas—, y quedaría un Worker desplegado sin efecto
  ninguno.

**El precio, dicho claro:** con `run_worker_first` el Worker se invoca en cada
petición. Servir assets estáticos sin Worker no consume cuota; una invocación
sí. Por eso hoy no está puesto, y por eso conviene **quitarlo cuando Google
haya terminado de mover el dominio** (Google recomienda mantener las 301 al
menos un año). Quitarlo es volver a este mismo fichero y borrar `main` y los
dos campos.

### 3. Los archivos con la URL escrita a mano

Estos no pueden importar la constante, así que se editan a mano. **La lista
está bajo test**: `tests/dominio.test.ts` recorre el repo y falla si aparece la
URL en cualquier archivo que no esté acá.

| Archivo                 | Cuántas veces | Qué es                                                     |
| ----------------------- | ------------- | ---------------------------------------------------------- |
| `public/llms.txt`       | 10            | URLs absolutas de los cursos                               |
| `public/robots.txt`     | 1             | la línea `Sitemap:`                                        |
| `public/og-image.svg`   | 1             | el dominio dibujado dentro de la imagen social             |
| `src/styles/global.css` | 1             | hoja de impresión: escribe el dominio al lado de cada link |
| `CLAUDE.md`             | 2             | documentación del proyecto                                 |
| este documento          | varias        | documentación                                              |

Todo lo demás ya sale solo de `src/data/site.ts`.

> Si algún día molesta editar `robots.txt` y `llms.txt` a mano, los dos pueden
> convertirse en endpoints de Astro y derivar la URL de `Astro.site`, igual que
> ya se hizo con el Service Worker en `src/pages/sw.js.ts`. Hoy no se ha hecho
> porque son dos ficheros y el test ya avisa si se olvidan.

---

## El orden importa

Esta es la parte donde se pierde el SEO si se hace al revés.

1. **Comprar el dominio y añadirlo al Worker** como Custom Domain, desde el
   panel de Cloudflare. En este punto el sitio responde por los dos nombres.
2. **Hacer los tres cambios de arriba y desplegar.** El push a `main` construye
   y publica solo. A partir de aquí el `*.workers.dev` devuelve 301 hacia el
   dominio nuevo, y el dominio nuevo sirve el sitio.
3. **Comprobar la redirección antes de tocar nada más**, con la URL vieja:

   ```bash
   curl -sSI https://polylingua.thyronemiguelvegasantana-c6e.workers.dev/es/de/a1/articulos-der-die-das/ \
     | grep -iE '^(HTTP|location)'
   ```

   Tiene que salir `301` y un `location:` al dominio nuevo **conservando la
   ruta**. Y la del dominio nuevo tiene que dar `200`, no otro 301: si también
   redirige, es el bucle y hay que parar ahí.

4. **Search Console**: dar de alta la propiedad nueva y usar la herramienta de
   **Cambio de dirección** desde la vieja. Solo funciona si las 301 ya están
   puestas — de ahí que sea el paso 4 y no el 1.
5. **Reenviar el sitemap** nuevo.

### Lo que NUNCA hay que hacer

**No desactivar el subdominio `workers.dev`** (`"workers_dev": false`) mientras
las URLs viejas sigan indexadas. Sin subdominio no hay quien sirva la
redirección: cada una de las páginas indexadas pasa a dar 404 de golpe y se
tira a la basura toda la autoridad acumulada. El subdominio es lo que sostiene
la mudanza; se apaga al final, cuando Search Console ya no reporte tráfico
hacia él.

---

## Detalle que conviene saber

El Worker redirige **cualquier** host que no sea el canónico. Eso es
deliberado: arregla de paso el `www.` (si se dan de alta `dominio.com` y
`www.dominio.com`, el segundo redirige al primero y no hay contenido
duplicado). Pero implica que, si algún día se activan las _preview URLs_ de
Cloudflare, también redirigirían al dominio de producción y dejarían de servir
para previsualizar. Hoy `wrangler.jsonc` no las tiene activadas.
