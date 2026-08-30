// Puente para pasarle strings del diccionario al JS de cliente de una página.
//
// Los scripts de las herramientas usan `import` (storage, sound, srs...), y un
// <script define:vars> en Astro es is:inline, así que NO soporta imports — el
// patrón documentado en CLAUDE.md es leer los datos del DOM. Cada página
// traducida renderiza un <div hidden data-page-strings={JSON.stringify(...)}>
// y su script lo lee con readPageStrings().
export function readPageStrings<T extends Record<string, unknown>>(fallback: T): T {
  const el = document.querySelector<HTMLElement>('[data-page-strings]');
  if (!el) return fallback;
  try {
    return { ...fallback, ...JSON.parse(el.dataset.pageStrings ?? '{}') };
  } catch {
    return fallback;
  }
}

// Misma interpolación que src/lib/interpolate.ts, duplicada acá para que el
// bundle de cliente no arrastre nada más que esta función.
export function fill(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}
