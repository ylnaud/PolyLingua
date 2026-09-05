/**
 * Etiquetas de los enlaces que apuntan a páginas generadas, no a contenido.
 *
 * Una lección o un diálogo tienen `grammarTopic` y `title` escritos a mano, así
 * que su ancla sale de ahí. Una página de nivel no: la genera una ruta
 * dinámica y no hay ningún campo de contenido del que sacar el texto.
 *
 * Vive en su propio archivo, sin imports, porque lo cargan los DOS
 * adaptadores —`fromContent.ts` desde Astro y `scripts/links-dryrun.ts` desde
 * Node— y si cada uno construyera la etiqueta por su cuenta, el DRY RUN
 * aprobaría un texto y se publicaría otro.
 */

/**
 * El ancla de una página de nivel.
 *
 * Antes era el propio título de la página, «Alemán A1», repetido en los 100
 * enlaces que van de un diálogo a su nivel. Como texto de enlace no dice qué
 * hay al otro lado, y encima los 100 se concentraban en 10 destinos.
 *
 * El idioma va en minúscula porque va dentro de una frase, no encabezándola.
 */
export function anclaDeNivel(nombreIdioma: string, level: string): string {
  return `Todas las lecciones de ${nombreIdioma.toLocaleLowerCase('es')} ${level.toUpperCase()}`;
}
