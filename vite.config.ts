import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
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

// Site is served from its own domain (https://shalom.bookingrobot.eu), so base is '/'.
export default defineConfig({
  base: '/',
  plugins: [typographPlugin(), react(), seoPages()],
});
