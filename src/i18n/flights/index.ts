import type { Lang } from '../LanguageContext';
import { flightsEn } from './en';
import { flightsHe } from './he';
import { flightsRu, type FlightsDict } from './ru';

/** Texts of the flights step in all three languages. */
export const FLIGHTS_TEXTS: Record<Lang, FlightsDict> = { ru: flightsRu, en: flightsEn, he: flightsHe };
export type { FlightsDict };
