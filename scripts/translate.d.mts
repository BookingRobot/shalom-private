import type { Plugin } from 'vite';
export function translatePlugin(dictPath: string, missingPath?: string, rtl?: boolean): Plugin;
export function russianTexts(
  code: string,
  id: string,
  onText: (key: string, node: unknown, kind: 'str' | 'tpl' | 'jsx') => void,
): unknown;
