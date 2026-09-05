/**
 * A dónde hay que mandar una petición para que el sitio viva en un solo
 * dominio.
 *
 * Esto NO se puede resolver con un fichero `_redirects`, y conviene dejar
 * escrito por qué para que nadie lo intente otra vez. La documentación de
 * Cloudflare lo dice en su tabla de compatibilidad: **«Domain-level redirects
 * ❌»**. `_redirects` sabe mirar la ruta, no el host.
 *
 * Y eso importa porque el MISMO Worker sirve el subdominio `*.workers.dev` y
 * el dominio propio. Una regla `/* https://dominio-nuevo/:splat 301` se
 * aplicaría a los dos hosts, así que el dominio nuevo se redirigiría a sí
 * mismo: bucle infinito y el sitio entero caído. No es una hipótesis, es lo
 * que hace esa regla.
 *
 * Por eso la decisión se toma acá, mirando el host, que es justo lo que el
 * fichero de reglas no puede ver.
 */

/**
 * Devuelve la URL canónica a la que redirigir, o `null` si la petición YA
 * está en el dominio bueno.
 *
 * Ese `null` es lo que rompe el bucle, y es el caso que más vale la pena
 * tener cubierto por un test: si alguna vez devolviera una URL aquí, el
 * dominio propio se redirigiría a sí mismo para siempre.
 *
 * Todo lo demás —el `*.workers.dev` viejo, un `www.` que sobre, o http en
 * vez de https— se manda al canónico conservando ruta y query. El fragmento
 * (`#...`) no viaja al servidor, así que no hay nada que conservar ahí.
 */
export function destinoCanonico(urlEntrante: string, hostCanonico: string): string | null {
  const url = new URL(urlEntrante);
  if (url.hostname === hostCanonico) return null;
  url.hostname = hostCanonico;
  url.protocol = 'https:';
  url.port = '';
  return url.toString();
}
