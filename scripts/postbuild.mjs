// GitHub Pages has no server-side rewrites: serve the SPA for unknown paths
// (e.g. https://shalom.bookingrobot.eu/rooms) by copying index.html to 404.html.
import { copyFileSync, existsSync } from 'node:fs';

copyFileSync('dist/index.html', 'dist/404.html');
if (!existsSync('dist/CNAME')) throw new Error('dist/CNAME missing (public/CNAME)');
console.log('postbuild: dist/404.html written, CNAME present');
