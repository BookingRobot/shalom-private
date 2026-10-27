/**
 * Partner airline Tel Aviv ⇄ Vilnius flies on Sundays, Tuesdays and Thursdays.
 * [ПРИМЕР ДАННЫХ — ПОДТВЕРДИТЬ РАСПИСАНИЕ]
 */
export const FLIGHT_WEEKDAYS = [0, 2, 4];

export const isFlightDay = (d: Date) => FLIGHT_WEEKDAYS.includes(d.getUTCDay());
