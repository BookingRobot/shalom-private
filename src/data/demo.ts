import { toD } from '../lib/dates';

/**
 * Demo mode: the site shows the sample order, sample marks («[ПРИМЕР]», «Фото для примера»)
 * and lets every step open by its address. Off for the launch (VITE_DEMO=0 at build time):
 * the order starts empty, every step needs the one before it, no marks are shown.
 * docs/launch-checklist.md lists what must be real before the switch is turned off.
 */
export const DEMO: boolean = (import.meta.env.VITE_DEMO as string | undefined) !== '0';

/**
 * "Today" for the demo data. Sample prices, availability and flights are generated
 * relative to this date; off demo it is the real date.
 */
export const TODAY = DEMO ? toD('2026-10-27') : toD(new Date().toISOString().slice(0, 10));
