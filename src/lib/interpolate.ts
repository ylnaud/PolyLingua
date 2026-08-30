// Reemplaza marcadores {clave} por su valor. Los strings del diccionario los
// usan (ej. 'Wortschatz auf {lang}') en vez de concatenar, porque el orden de
// las palabras cambia entre idiomas: "Vocabulario de alemán" es
// "Wortschatz auf Deutsch", con el nombre del idioma en otro lugar de la frase.
export function fill(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}
