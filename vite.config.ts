import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { SITE_ORIGIN, allSeoPages, headTags } from './src/lib/seo';
import { typographPlugin } from './scripts/typograph.mjs';
import { translatePlugin } from './scripts/translate.mjs';
// rtlcss ships no types: a PostCSS plugin that mirrors left ↔ right
// @ts-expect-error -- untyped package
import rtlcss from 'rtlcss';

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
      if (brand === 'atlantis' || /dist\/(he|en)$/.test(outDir) || !existsSync(join(outDir, 'index.html'))) return;
      for (const f of ['favicon.ico', 'favicon-32.png', 'favicon-192.png', 'apple-touch-icon.png'])
        copyFileSync(join('public/brand/demo', f), join(outDir, f));
      for (const f of ATLANTIS_FILES) rmSync(join(outDir, 'img', f), { force: true });
    },
  };
}
/** the Atlantis logos in public/img (data/contacts → ATLANTIS_BRAND) */
const ATLANTIS_FILES = ['5df2efd7b5bab4d4a08d500848a30611.png', '9149f20f562e42cf5db1520edc7ab6e8.png'];

/**
 * Translated builds (`vite build --mode he` → dist/he at /he/, `--mode en` → dist/en at /en/): the
 * page shell in that language (Hebrew: right-to-left with a Hebrew font), and a copy of the shell at
 * every route so that a link straight to /he/rooms works on GitHub Pages (no rewrites). Images and
 * icons come from the Russian build at the root.
 */
const LANG_ROUTES = [
  '/results',
  '/hotel',
  '/rooms',
  '/transfer',
  '/guests',
  '/payment',
  '/done',
  '/rules',
  '/privacy',
  '/tickets',
  '/flights',
];
const SHELL: Record<string, { html: string; title: string; description: string; font?: string }> = {
  he: {
    html: '<html lang="he" dir="rtl">',
    title: 'סנטוריומים בליטא',
    description:
      'הזמנת סנטוריומים בליטא: דרוסקינינקאי, בירשטונאס, פלנגה. תוכניות טיפולים, הסעה משדה התעופה וליווי אישי.',
    font: 'Rubik:wght@400;500;600;700;800',
  },
  en: {
    html: '<html lang="en" dir="ltr">',
    title: 'Lithuanian Sanatoriums',
    description:
      'Book a sanatorium in Lithuania: Druskininkai, Birštonas, Palanga. Treatment programs, airport transfer and personal help.',
  },
};
function langShell(lang: string): Plugin {
  let outDir = 'dist/' + lang;
  const t = SHELL[lang];
  return {
    name: 'lang-shell',
    configResolved(c) {
      outDir = c.build.outDir;
    },
    transformIndexHtml(html) {
      const font = t.font
        ? `  <link rel="preconnect" href="https://fonts.googleapis.com" />\n    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${t.font}&display=swap" />\n  </head>`
        : '</head>';
      return html
        .replace('<html lang="ru" dir="ltr">', t.html)
        .replace(/<script id="lang-redirect">[\s\S]*?<\/script>\s*/, '')
        .replace('<title>Санатории Литвы</title>', `<title>${t.title}</title>`)
        .replace(
          /<meta name="description" content="[^"]*" \/>/,
          `<meta name="description" content="${t.description}" />`,
        )
        .replace('href="https://shalom.bookingrobot.eu/" />', `href="https://shalom.bookingrobot.eu/${lang}/" />`)
        .replace(
          '<meta property="og:title" content="Санатории Литвы" />',
          `<meta property="og:title" content="${t.title}" />`,
        )
        .replace('content="https://shalom.bookingrobot.eu/" />', `content="https://shalom.bookingrobot.eu/${lang}/" />`)
        .replace('</head>', font);
    },
    closeBundle() {
      const shell = join(outDir, 'index.html');
      if (!existsSync(shell)) return;
      const html = readFileSync(shell, 'utf8');
      const paths = new Set([...LANG_ROUTES, ...allSeoPages().map((p) => p.path)]);
      paths.delete('/');
      for (const p of paths) {
        const file = join(outDir, p.slice(1), 'index.html');
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, html);
      }
      writeFileSync(join(outDir, '404.html'), html);
      console.log(`lang-shell (${lang}): ${paths.size} routes`);
    },
  };
}

// Site is served from its own domain (https://shalom.bookingrobot.eu): Russian at '/', Hebrew at
// '/he/', English at '/en/'.
export default defineConfig(({ mode }) => {
  const brand = (loadEnv(mode, process.cwd(), 'VITE_').VITE_BRAND || '').trim();
  const lang = mode === 'he' || mode === 'en' ? mode : 'ru';
  const define = { __BRAND__: JSON.stringify(brand), __LANG__: JSON.stringify(lang) };
  if (lang !== 'ru')
    return {
      base: `/${lang}/`,
      define,
      publicDir: false,
      build: { outDir: `dist/${lang}`, emptyOutDir: true },
      css: lang === 'he' ? { postcss: { plugins: [rtlcss()] } } : undefined,
      plugins: [
        translatePlugin(`src/i18n/${lang}.texts.json`, `node_modules/.cache/${lang}-missing-texts.json`, lang === 'he'),
        react(),
        brandIcons(brand),
        langShell(lang),
      ],
    };
  return {
    base: '/',
    define,
    plugins: [typographPlugin(), react(), brandIcons(brand), seoPages()],
  };
});
