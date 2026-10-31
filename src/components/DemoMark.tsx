import type { ReactNode } from 'react';
import { DEMO } from '../data/demo';

/**
 * A mark that only the demo shows: «[ПРИМЕР ДАННЫХ]», «Фото для примера», «[ПОДТВЕРДИТЬ …]».
 * With VITE_DEMO=0 every mark disappears at once, so none is forgotten at launch
 * (docs/launch-checklist.md lists what each one is waiting for).
 */
export function DemoMark({ children, className = 'demo-mark' }: { children: ReactNode; className?: string }) {
  return DEMO ? <span className={className}>{children}</span> : null;
}
