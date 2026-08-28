import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { NOINDEX_LAST_SEGMENTS } from './src/data/noindex-routes.ts';

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

export default defineConfig({
  site: 'https://polylingua.thyronemiguelvegasantana-c6e.workers.dev',
  integrations: [sitemap({ filter: (page) => !isNoindexPage(page) })],
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
  vite: {
    plugins: [tailwindcss()],
  },
});
