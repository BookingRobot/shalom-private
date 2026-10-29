import { WEEKDAYS_SHORT, shortDate } from '../lib/dates';

/**
 * Partner airline Tel Aviv ⇄ Vilnius flies on Sundays, Tuesdays and Thursdays.
 * [ПРИМЕР ДАННЫХ — ПОДТВЕРДИТЬ РАСПИСАНИЕ]
 */
export const FLIGHT_WEEKDAYS = [0, 2, 4];

export const isFlightDay = (d: Date) => FLIGHT_WEEKDAYS.includes(d.getUTCDay());

/** Partner flights Tel Aviv ⇄ Vilnius. [ПРИМЕР ДАННЫХ — ИЗ СИСТЕМЫ БРОНИРОВАНИЯ РЕЙСОВ] */
export const FLIGHT_THERE = { no: 'IZ 2549', from: 'Тель-Авив', to: 'Вильнюс', dep: '13:05', arr: '17:20' };
export const FLIGHT_BACK = { no: 'IZ 2550', from: 'Вильнюс', to: 'Тель-Авив', dep: '18:40', arr: '22:40' };

/** «IZ 2549 · пн, 9 ноября · прилёт 17:20» — our flight as the transfer needs it. */
export function flightLine(leg: typeof FLIGHT_THERE, date: Date, arrival: boolean) {
  return (
    leg.no +
    ' · ' +
    WEEKDAYS_SHORT[date.getUTCDay()].toLowerCase() +
    ', ' +
    shortDate(date) +
    ' · ' +
    (arrival ? 'прилёт ' + leg.arr : 'вылет ' + leg.dep)
  );
}
