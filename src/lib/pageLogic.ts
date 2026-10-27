import { useReducer, useRef } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import type { Booking } from '../data/booking';
import { useHelp } from '../context/HelpContext';
import { usePageLanguage, type Lang } from '../i18n/LanguageContext';

/** App services every page logic can use (shared order, support pop-up, navigation). */
export interface PageServices {
  booking: ReturnType<typeof useBooking>;
  help: ReturnType<typeof useHelp>;
  navigate: NavigateFunction;
  /** interface language of this page (see PageLogic.languages) */
  lang: ReturnType<typeof usePageLanguage>;
}

/**
 * Screen logic container.
 *
 * Each page keeps its view-model in a small class: `state` holds UI state,
 * `renderVals()` derives everything the JSX needs (labels, lists, handlers).
 * Calculations (prices, calendars, availability) stay in one readable place,
 * separate from markup. `this.props` gives access to the shared services.
 */
export abstract class PageLogic<S extends Record<string, any> = Record<string, any>> {
  /** languages this page is translated into; the first one is the fallback */
  static languages: readonly Lang[] = ['ru'];

  props: PageServices;
  state: S = {} as S;
  /** set by usePageLogic: re-renders the owning component */
  _notify?: () => void;

  constructor(props: PageServices) {
    this.props = props;
  }

  setState(patch: Partial<S> | ((s: S) => Partial<S>)) {
    const next = typeof patch === 'function' ? patch(this.state) : patch;
    this.state = { ...this.state, ...next };
    const orderPatch = this.syncBooking?.(this.state);
    if (orderPatch) this.props.booking.update(orderPatch);
    this._notify?.();
  }

  /** Optional: which part of the page state belongs to the shared order (saved on every change). */
  syncBooking?(state: S): Partial<Booking> | null;

  abstract renderVals(): any;
}

/** Creates the page's logic object once and re-renders whenever it calls setState. */
export function usePageLogic<T extends PageLogic>(
  Cls: (new (props: PageServices) => T) & { languages: readonly Lang[] },
): [ReturnType<T['renderVals']>, T] {
  const services: PageServices = {
    booking: useBooking(),
    help: useHelp(),
    navigate: useNavigate(),
    lang: usePageLanguage(Cls.languages),
  };
  const ref = useRef<T | null>(null);
  const [, force] = useReducer((x: number) => x + 1, 0);
  if (!ref.current) ref.current = new Cls(services);
  const logic = ref.current;
  logic.props = services;
  logic._notify = force;
  return [logic.renderVals(), logic];
}
