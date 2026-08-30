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

// /niveles/* y /idiomas/* son rutas legacy: cada una es una redirección 301 a
// su equivalente en el silo, no una página de contenido. Las primeras son
// anteriores a la arquitectura SILO; las segundas, anteriores a que las
// herramientas (vocabulario, repasar, diálogos...) entraran al silo.
// Astro ya les pone <meta name="robots" content="noindex"> automáticamente, así
// que anunciarlas en el sitemap era pedirle a Google que indexe 176 URLs que
// ellas mismas se declaran no indexables — la misma contradicción que
// isNoindexPage() evita para el resto del sitio.
//
// Las redirecciones se mantienen: cualquier link viejo que apunte a /niveles/*
// sigue funcionando y transfiere su valor al destino. Simplemente se dejan de
// ofrecer como si fueran destinos finales.
const LEGACY_REDIRECT_PREFIXES = ['niveles', 'idiomas'];

function isLegacyRedirectPage(pageUrl) {
  const firstSegment = new URL(pageUrl).pathname.split('/').filter(Boolean)[0];
  return LEGACY_REDIRECT_PREFIXES.includes(firstSegment);
}

export default defineConfig({
  site: 'https://polylingua.thyronemiguelvegasantana-c6e.workers.dev',
  integrations: [
    sitemap({
      filter: (page) =>
        !isNoindexPage(page) && !isInactiveUserLangPage(page) && !isLegacyRedirectPage(page),
    }),
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
