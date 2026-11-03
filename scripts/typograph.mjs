/**
 * Russian typography at build time (a Vite plugin, vite.config.ts): short words stay with the
 * word after them, a dash never starts a line, a number stays with its unit.
 *   «в санатории» → «в санатории», «слово — слово» → «слово — слово», «70 €» → «70 €»
 * Only Cyrillic text is touched (code is Latin), so identifiers and logic never change. Text built
 * at run time from parts (`${n} ночей`) is joined with nbsp where it is made (lib/format, lib/dates).
 */

// prepositions, conjunctions and «не/ни»: bound to the next word
const SHORT = 'в|во|к|ко|с|со|о|об|обо|у|и|а|но|на|по|до|за|от|из|не|ни|для|при|без|под|над|про|или';
const SHORT_RE = new RegExp(`(^|[\\s>«„"'\`(\\[{/—])(${SHORT})[ ](?=[«„"(]?[А-Яа-яЁёA-Za-z0-9])`, 'gi');
// particles bound to the word before them
const PARTICLE_RE = /([А-Яа-яЁё0-9»"])[ ](же|ли|бы|ведь)(?=[\s.,!?:;»"<)]|$)/g;
// a dash keeps to the word before it
const DASH_RE = /([А-Яа-яЁё0-9»".,)!?])[ ]([—–])(?=[ ])/g;
// a number keeps to its unit / the next word, and «№ 5»
const NUM_RE = /(\d)[ ](?=(?:€|%|°|м²|км|мин|ч\b|[А-Яа-яЁё]))/g;
const NO_RE = /(№)[ ](?=\d)/g;

export function typograph(text) {
  let s = text;
  // twice: «и в санатории» has two short words in a row
  for (let i = 0; i < 2; i++) s = s.replace(SHORT_RE, (m, pre, w) => `${pre}${w} `);
  return s.replace(PARTICLE_RE, '$1 $2').replace(DASH_RE, '$1 $2').replace(NUM_RE, '$1 ').replace(NO_RE, '$1 ');
}

/** Vite plugin: applies typograph() to the string and JSX text of our own source files. */
export function typographPlugin() {
  const CYR = /[А-Яа-яЁё]/;
  return {
    name: 'ru-typograph',
    enforce: 'pre',
    transform(code, id) {
      if (!/\/src\/.*\.(tsx|ts)$/.test(id) || id.includes('node_modules') || !CYR.test(code)) return null;
      // only the parts of a line that hold Cyrillic: string literals, template text and JSX text
      const out = code.replace(/[^\n]*[А-Яа-яЁё][^\n]*/g, (line) => {
        const t = line.trimStart();
        // leave comments alone (they do not reach the page) — and regular expressions in code
        if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return line;
        return typograph(line);
      });
      return out === code ? null : { code: out, map: null };
    },
  };
}
