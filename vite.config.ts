import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { SITE_ORIGIN, allSeoPages, headTags } from './src/lib/seo';
import { typographPlugin } from './scripts/typograph.mjs';

/**
 * Static pages for search engines and link previews: every page in lib/seo gets its own
 * index.html with its title, description and picture already in <head> (GitHub Pages serves
 * dist/kurort/druskininkai/index.html for /kurort/druskininkai), plus sitemap.xml and robots.txt.
 * The page itself still renders in the browser; the tags are what Google and WhatsApp read first.
 */
function seoPages(): Plugin {
  let outDir = 'dist';
  return {
    name: 'seo-pages',
    apply: 'build',
    configResolved(c) {
      outDir = c.build.outDir;
    },
    closeBundle() {
      const shell = readFileSync(join(outDir, 'index.html'), 'utf8');
      // the template's own head tags are replaced by each page's
      const bare = shell
        .replace(/\s*<title>[\s\S]*?<\/title>/, '')
        .replace(/\s*<meta name="description"[^>]*>/, '')
        .replace(/\s*<link rel="canonical"[^>]*>/, '')
        .replace(/\s*<meta property="og:[^"]+"[^>]*>/g, '');
      const pages = allSeoPages();
      for (const p of pages) {
        const html = bare.replace('<meta name="viewport"', headTags(p) + '\n    <meta name="viewport"');
        const file = p.path === '/' ? join(outDir, 'index.html') : join(outDir, p.path.slice(1), 'index.html');
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, html);
      }
      const urls = pages.map((p) => `  <url><loc>${SITE_ORIGIN}${p.path}</loc></url>`).join('\n');
      writeFileSync(
        join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );
      writeFileSync(
        join(outDir, 'robots.txt'),
        `User-agent: *\nDisallow: /order/\nDisallow: /screens\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`,
      );
      console.log(`seo-pages: ${pages.length} pages, sitemap.xml, robots.txt`);
    },
  };
}

/**
 * Favicons follow the brand switch (src/data/contacts.ts): the invented demo brand keeps its icons
 * in public/brand/demo/, Atlantis uses the ones in public/.
 */
function brandIcons(brand: string): Plugin {
  let outDir = 'dist';
  return {
    name: 'brand-icons',
    transformIndexHtml(html) {
      if (brand === 'atlantis') return html; // (empty = the default demo brand)
      return html.replace(
        /href="\/(favicon-32\.png|favicon-192\.png|apple-touch-icon\.png|favicon\.ico)"/g,
        'href="/brand/demo/$1"',
      );
    },
    // the demo build also replaces the root icons (browsers ask for /favicon.ico by themselves)
    // and leaves the Atlantis logo files out of the site
    configResolved(c) {
      outDir = c.build.outDir;
    },
    closeBundle() {
      if (brand === 'atlantis' || !existsSync(join(outDir, 'index.html'))) return;
      for (const f of ['favicon.ico', 'favicon-32.png', 'favicon-192.png', 'apple-touch-icon.png'])
        copyFileSync(join('public/brand/demo', f), join(outDir, f));
      for (const f of ATLANTIS_FILES) rmSync(join(outDir, 'img', f), { force: true });
    },
  };
}
/** the Atlantis logos in public/img (data/contacts → ATLANTIS_BRAND) */
const ATLANTIS_FILES = ['5df2efd7b5bab4d4a08d500848a30611.png', '9149f20f562e42cf5db1520edc7ab6e8.png'];

// Site is served from its own domain (https://shalom.bookingrobot.eu), so base is '/'.
export default defineConfig(({ mode }) => {
  const brand = (loadEnv(mode, process.cwd(), 'VITE_').VITE_BRAND || '').trim();
  return {
    base: '/',
    define: { __BRAND__: JSON.stringify(brand) },
    plugins: [typographPlugin(), react(), brandIcons(brand), seoPages()],
  };
});
