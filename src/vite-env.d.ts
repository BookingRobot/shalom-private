/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Endpoint of the feedback worker (feedback-worker/). Empty: notes open a prefilled GitHub issue. */
  readonly VITE_FEEDBACK_URL?: string;
}
