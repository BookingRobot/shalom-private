import { CalendarDialog, RangeSummary } from '../../components/calendar/CalendarDialog';
import { CalLegend } from '../../components/calendar/CalLegend';
import { CalNotice } from '../../components/calendar/CalNotice';
import { MonthsCalendar } from '../../components/calendar/MonthsCalendar';
import { DateModeTabs, FlexDates } from '../../components/FlexDates';
import type { HotelCalendarVals } from './hotelTypes';

/**
 * «Когда дешевле?» — a two-month range calendar with this sanatorium's prices; applying the
 * dates re-renders the page. Opened for one room, its busy days are hatched.
 */
export function HotelCalendarModal({ v, guestsWho }: { v: HotelCalendarVals; guestsWho: string }) {
  return (
    <CalendarDialog
      canvas="hotel-calendar"
      className="hc"
      title="Выберите даты поездки"
      hint={
        v.flexMode
          ? 'Выберите месяц и сколько ночей — подберём лучшие даты с рейсами'
          : v.calHint + ' · цены — за человека в сутки'
      }
      note={
        v.calRoomOn ? (
          <>
            Даты для номера <strong>«{v.calRoomName}»</strong> — заштрихованные дни заняты
          </>
        ) : null
      }
      tabs={v.calRoomOn ? null : <DateModeTabs flex={v.flexMode} onChange={v.setFlex} />}
      onClose={v.closeCal}
      selection={
        v.flexMode ? null : (
          <>
            {v.calNote ? <CalNotice text={v.calNote} onClose={v.calNoteClose} onAsk={v.calNoteAsk} /> : null}
            <RangeSummary
              from={v.selIn}
              to={v.selOut}
              total={v.selNights}
              extra={
                <div className="cal-price cd-col">
                  <span className="lbl">«Миди», {guestsWho}</span>
                  <strong>
                    {v.newTotal} <small style={{ color: v.diffColor }}>{v.diffText}</small>
                  </strong>
                </div>
              }
            />
          </>
        )
      }
      actions={
        v.flexMode ? null : (
          <>
            <button type="button" className="btn btn-secondary" onClick={v.closeCal}>
              Отмена
            </button>
            <button type="button" className="btn btn-primary hc-apply" onClick={v.applyCal} disabled={v.applyOff}>
              Подтвердить даты
            </button>
          </>
        )
      }
    >
      {v.flexMode ? (
        <FlexDates onPick={v.flexPick} />
      ) : (
        <div className="cal-body">
          <MonthsCalendar months={v.months} onPrev={v.calPrev} onNext={v.calNext} planeTitle="Рейс из Израиля" />
          <CalLegend />
        </div>
      )}
    </CalendarDialog>
  );
}
