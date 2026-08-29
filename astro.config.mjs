import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { NOINDEX_LAST_SEGMENTS } from './src/data/noindex-routes.ts';
import { USER_LANGUAGES } from './src/data/userLanguages.ts';

// Páginas con <meta name="robots" content="noindex"> en su BaseLayout.
// @astrojs/sitemap no lee ese meta tag — solo enumera rutas del build — así
// que hay que excluirlas a mano acá o terminan en el sitemap contradiciendo
// su propio noindex. La lista vive en src/data/noindex-routes.ts (única
// fuente de verdad) y tests/noindex-sitemap.test.ts verifica que siga
// sincronizada con las páginas reales.
function isNoindexPage(pageUrl) {
  const path = new URL(pageUrl).pathname.replace(/\/$/, '');
  return NOINDEX_LAST_SEGMENTS.includes(path.split('/').pop());
}

// Los silos de un idioma de interfaz inactivo (hoy /de/*, /en/*) se generan y
// se publican, pero NO se anuncian en el sitemap. Motivo: mientras el idioma
// esté inactivo, LanguageSelector lo muestra como "Próximamente" y ninguna
// página enlaza a ese silo — quedan huérfanas. Encima el <html lang> lo
// setea BaseLayout según la interfaz (español), así que serían páginas con
// contenido en alemán declaradas como españolas. Ofrecerle eso a Google
// diluye el presupuesto de rastreo del sitio en español (el que tiene tráfico
// real) y manda señales de idioma contradictorias.
//
// Se deriva de USER_LANGUAGES en vez de hardcodear los prefijos: el día que
// se marque un idioma como `active: true` (con la interfaz ya traducida y los
// links puestos), sus páginas vuelven al sitemap solas, sin tocar este
// archivo.
const INACTIVE_USER_LANG_IDS = USER_LANGUAGES.filter((l) => !l.active).map((l) => l.id);

function isInactiveUserLangPage(pageUrl) {
  const firstSegment = new URL(pageUrl).pathname.split('/').filter(Boolean)[0];
  return INACTIVE_USER_LANG_IDS.includes(firstSegment);
}

export default defineConfig({
  site: 'https://polylingua.thyronemiguelvegasantana-c6e.workers.dev',
  integrations: [
    sitemap({ filter: (page) => !isNoindexPage(page) && !isInactiveUserLangPage(page) }),
  ],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  redirects: {
    '/niveles': '/es/de',
  },
  prefetch: {
    prefetchAll: true,
  },
});
