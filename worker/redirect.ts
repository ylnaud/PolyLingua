/**
 * El Worker que redirige el subdominio viejo al dominio propio.
 *
 * ⚠️ HOY ESTE ARCHIVO ESTÁ INERTE Y NO SE DESPLIEGA. `wrangler.jsonc` no tiene
 * `main`, así que Cloudflare sirve `dist/` como assets estáticos y este código
 * no se ejecuta nunca. Está escrito y probado por adelantado para que el día
 * de la mudanza sea encender un interruptor y no escribir código con prisa.
 *
 * Para encenderlo hace falta tocar `wrangler.jsonc`, y los tres campos son
 * obligatorios los tres — con dos no funciona:
 *
 *     "main": "./worker/redirect.ts",
 *     "assets": {
 *       "directory": "./dist",
 *       "binding": "ASSETS",          ← sin esto, env.ASSETS es undefined
 *       "run_worker_first": true,     ← sin esto, el Worker NO se ejecuta
 *       ...
 *     }
 *
 * Lo de `run_worker_first` es la trampa: por defecto Cloudflare sirve el
 * asset que coincida SIN invocar el Worker, y solo lo llama cuando no hay
 * asset. Como todas las páginas viejas sí existen en `dist/`, sin ese flag el
 * Worker jamás vería las peticiones que hay que redirigir, que son justo
 * todas. Quedaría un Worker desplegado que no redirige nada.
 *
 * El precio de ese flag, dicho claro: pasa a invocarse el Worker en CADA
 * petición, y servir assets estáticos sin Worker no cuenta para la cuota
 * mientras que una invocación sí. Por eso `wrangler.jsonc` no lo tiene hoy, y
 * por eso conviene quitarlo cuando Google haya terminado de mover el dominio.
 *
 * Ver `docs/MIGRACION-DOMINIO.md`.
 */
import { SITE_HOST } from '../src/data/site';
import { destinoCanonico } from '../src/lib/dominio';

/**
 * El binding de assets. Se declara a mano en vez de instalar
 * `@cloudflare/workers-types`: es un método y una firma, y el proyecto tiene
 * por norma no añadir dependencias sin consultar.
 */
interface Entorno {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Entorno): Promise<Response> {
    const destino = destinoCanonico(request.url, SITE_HOST);
    // 301 y no 302: es una mudanza permanente, y es lo que hace que Google
    // transfiera la autoridad de la URL vieja a la nueva en vez de tratarla
    // como un desvío temporal.
    if (destino !== null) return Response.redirect(destino, 301);
    return env.ASSETS.fetch(request);
  },
};
