import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';
import { ApiError } from './types';

/** The three states every page block that waits for the server goes through. */
export interface AsyncState<T> {
  data: T | null;
  error: ApiError | null;
  /** a request is on its way (the first one or a retry) */
  loading: boolean;
  /** run the same request again (the «Повторить» button) */
  retry: () => void;
}

/**
 * Runs an API call when its inputs change and keeps the answer, the error and the loading
 * flag. An answer that arrives after the inputs changed again is dropped. `enabled: false`
 * waits (e.g. until the guest has chosen dates).
 *
 *   const san = useApi(() => client.getSanatorium(id), [id]);
 *   <AsyncBlock state={san} empty="…">{(data) => …}</AsyncBlock>
 */
export function useApi<T>(fn: () => Promise<T>, deps: DependencyList, enabled = true): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [tick, setTick] = useState(0);
  const run = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const id = ++run.current;
    setLoading(true);
    setError(null);
    fnRef
      .current()
      .then((d) => {
        if (id !== run.current) return;
        setData(d);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (id !== run.current) return;
        setError(e instanceof ApiError ? e : new ApiError('server', 'Что-то пошло не так'));
        setLoading(false);
      });
    return () => {
      // a newer run owns the state now
      if (id === run.current) run.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, tick]);

  const retry = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, retry };
}
