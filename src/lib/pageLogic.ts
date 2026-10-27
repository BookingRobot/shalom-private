import { useReducer, useRef } from 'react';

/**
 * Screen logic container.
 *
 * Each page keeps its view-model in a small class: `state` holds UI state,
 * `renderVals()` derives everything the JSX needs (labels, lists, handlers).
 * This keeps the calculations (prices, calendars, availability) in one
 * readable place, separate from markup.
 */
export abstract class PageLogic<S extends Record<string, any> = Record<string, any>, P = any> {
  props: P;
  state: S = {} as S;
  /** set by usePageLogic: re-renders the owning component */
  _notify?: () => void;

  constructor(props?: P) {
    this.props = (props ?? {}) as P;
  }

  setState(patch: Partial<S> | ((s: S) => Partial<S>)) {
    const next = typeof patch === 'function' ? patch(this.state) : patch;
    this.state = { ...this.state, ...next };
    this.onStateChange?.(this.state);
    this._notify?.();
  }

  /** optional hook, e.g. to persist part of the state into the booking context */
  onStateChange?(state: S): void;

  abstract renderVals(): any;
}

/** Creates the page's logic object once and re-renders whenever it calls setState. */
export function usePageLogic<T extends PageLogic>(
  Cls: new (props?: any) => T,
  props?: ConstructorParameters<new (props?: any) => T>[0],
): [ReturnType<T['renderVals']>, T] {
  const ref = useRef<T | null>(null);
  const [, force] = useReducer((x: number) => x + 1, 0);
  if (!ref.current) ref.current = new Cls(props);
  const logic = ref.current;
  if (props !== undefined) logic.props = props;
  logic._notify = force;
  return [logic.renderVals(), logic];
}
