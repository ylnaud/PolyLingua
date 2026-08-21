import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Páginas con <meta name="robots" content="noindex"> en su BaseLayout (buscar
// `noindex` en src/pages para la lista viva). @astrojs/sitemap no lee ese meta
// tag — solo enumera rutas del build — así que hay que excluirlas a mano acá
// o terminan en el sitemap contradiciendo su propio noindex.
const NOINDEX_LAST_SEGMENTS = ['repasar', 'practica-libre', 'vocabulario', 'examen', 'logros', 'ahorcado', 'diario', 'pronunciacion', 'recursos', 'situaciones', 'gramatica', 'mis-errores', 'offline'];

function isNoindexPage(pageUrl) {
  const path = new URL(pageUrl).pathname.replace(/\/$/, '');
  return NOINDEX_LAST_SEGMENTS.includes(path.split('/').pop());
}

export default defineConfig({
  site: 'https://poly-lingua.vercel.app',
  integrations: [sitemap({ filter: (page) => !isNoindexPage(page) })],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  redirects: {
    '/niveles': '/idiomas/de',
  },
  prefetch: {
    prefetchAll: true,
  },
});
