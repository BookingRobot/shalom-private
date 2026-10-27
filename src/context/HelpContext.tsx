import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type HelpStatus = 'closed' | 'form' | 'sent';

interface HelpApi {
  status: HelpStatus;
  open: () => void;
  close: () => void;
  send: () => void;
}

const HelpCtx = createContext<HelpApi | null>(null);

/** Open/closed state of the "Свяжитесь со мной" pop-up, shared by all pages (any button can open it). */
export function HelpProvider({ children, initial = 'closed' }: { children: ReactNode; initial?: HelpStatus }) {
  const [status, setStatus] = useState<HelpStatus>(initial);
  const open = useCallback(() => setStatus('form'), []);
  const close = useCallback(() => setStatus('closed'), []);
  const send = useCallback(() => setStatus('sent'), []);
  const api = useMemo(() => ({ status, open, close, send }), [status, open, close, send]);
  return <HelpCtx.Provider value={api}>{children}</HelpCtx.Provider>;
}

export function useHelp(): HelpApi {
  const ctx = useContext(HelpCtx);
  if (!ctx) throw new Error('useHelp must be used inside <HelpProvider>');
  return ctx;
}
