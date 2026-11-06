/**
 * Hebrew build (vite build --mode he): every Russian text in our sources — string literals, the
 * text parts of template strings and JSX text — is swapped for its translation from
 * src/i18n/he.texts.json ({ "<Russian>": "<Hebrew>" }) before the code is compiled. Code, ids and
 * logic stay the same; a text without a translation stays Russian (listed in dist/he/missing-texts.json).
 * Keys: string literals as written (escapes decoded), JSX text with its spaces collapsed and trimmed —
 * scripts/i18n-extract.mjs lists them the same way.
 */
import ts from 'typescript';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const CYR = /[А-Яа-яЁё]/;
// a text that is only an arrow («→», « ›») points the other way on a right-to-left page
const ARROWS = /^[\s→←›‹]+$/;
const flip = (s) => s.replace(/[→←›‹]/g, (c) => ({ '→': '←', '←': '→', '›': '‹', '‹': '›' })[c]);
const escTpl = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
const escJsx = (s) => s.replace(/[{}<>]/g, (c) => `{'${c}'}`);

/** the Russian texts of one source file, keyed the way translations are stored */
export function russianTexts(code, id, onText) {
  const sf = ts.createSourceFile(
    id,
    code,
    ts.ScriptTarget.Latest,
    true,
    id.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const visit = (n) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      if (CYR.test(n.text)) onText(n.text, n, 'str');
      else if (ARROWS.test(n.text)) onText(n.text, n, 'str');
    } else if (ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) {
      if (CYR.test(n.text)) onText(n.text, n, 'tpl');
    } else if (ts.isJsxText(n)) {
      const key = n.text.replace(/\s+/g, ' ').trim();
      if (CYR.test(key) || ARROWS.test(key)) onText(key, n, 'jsx');
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return sf;
}

export function translatePlugin(dictPath, missingPath) {
  const dict = existsSync(dictPath) ? JSON.parse(readFileSync(dictPath, 'utf8')) : {};
  const missing = new Set();
  return {
    name: 'he-translate',
    enforce: 'pre',
    transform(code, id) {
      if (!/\/src\/.*\.(tsx|ts)$/.test(id) || id.includes('node_modules') || !CYR.test(code)) return null;
      const edits = [];
      russianTexts(code, id, (key, n, kind) => {
        const he = ARROWS.test(key) ? flip(key) : dict[key];
        if (typeof he !== 'string') {
          missing.add(key);
          return;
        }
        const start = n.getStart();
        if (kind === 'jsx') {
          const raw = code.slice(n.pos, n.end);
          const lead = raw.match(/^\s*/)[0];
          const trail = raw.match(/\s*$/)[0];
          edits.push([n.pos, n.end, lead + escJsx(he) + trail]);
        } else if (kind === 'str') {
          if (ts.isStringLiteral(n) && n.parent && ts.isJsxAttribute(n.parent))
            edits.push([start, n.end, `{${JSON.stringify(he)}}`]);
          else if (ts.isStringLiteral(n)) edits.push([start, n.end, JSON.stringify(he)]);
          else edits.push([start, n.end, '`' + escTpl(he) + '`']);
        } else {
          const raw = code.slice(start, n.end);
          const open = raw.startsWith('`') ? '`' : '}';
          const close = raw.endsWith('${') ? '${' : '`';
          edits.push([start, n.end, open + escTpl(he) + close]);
        }
      });
      if (!edits.length) return null;
      edits.sort((a, b) => b[0] - a[0]);
      let out = code;
      for (const [s, e, r] of edits) out = out.slice(0, s) + r + out.slice(e);
      return { code: out, map: null };
    },
    closeBundle() {
      if (!missingPath) return;
      mkdirSync(dirname(missingPath), { recursive: true });
      writeFileSync(missingPath, JSON.stringify([...missing], null, 1));
      if (missing.size)
        console.warn(`he-translate: ${missing.size} texts without a translation stay Russian (${missingPath})`);
    },
  };
}
