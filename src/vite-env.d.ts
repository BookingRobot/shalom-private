/// <reference types="vite/client" />

/** VITE_BRAND as a build-time constant (vite.config.ts `define`), so the other brand is left out */
declare const __BRAND__: string;
/** the build's language: 'ru' (site root) or 'he' (/he/) — vite.config.ts `define` */
declare const __LANG__: string;

interface ImportMetaEnv {
  /** Endpoint of the feedback worker (feedback-worker/). Empty: notes open a prefilled GitHub issue. */
  readonly VITE_FEEDBACK_URL?: string;
  /** Which agency the site shows: `demo` (invented «Shalom Spa», default) or `atlantis`. */
  readonly VITE_BRAND?: string;
}
