/**
 * La URL pública del sitio, en UN solo lugar.
 *
 * Antes esta cadena estaba escrita a mano en `astro.config.mjs`. Sigue siendo
 * de ahí de donde sale todo lo importante —canonical, Open Graph y sitemap se
 * derivan de `Astro.site`—, pero ahora también la necesita el Worker de
 * redirección (`worker/redirect.ts`), que se ejecuta fuera de Astro y no puede
 * leer `Astro.site`. Con dos sitios distintos leyendo el mismo dato, tenerlo
 * escrito dos veces es una fuente de fallo silencioso: se cambia uno, se
 * olvida el otro, y el Worker manda el tráfico a un dominio que ya no es.
 *
 * Cuando se compre el dominio propio, esta línea es LA línea que se cambia.
 * `docs/MIGRACION-DOMINIO.md` lista lo poco que queda fuera de acá, y
 * `tests/dominio.test.ts` falla si aparece una URL nueva escrita a mano en un
 * archivo que no esté en esa lista.
 */
export const SITE_URL = 'https://polylingua.thyronemiguelvegasantana-c6e.workers.dev';

/** Solo el host, que es con lo que compara el Worker. Derivado, nunca escrito. */
export const SITE_HOST = new URL(SITE_URL).hostname;
