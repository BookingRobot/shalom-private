import { CalendarDialog, RangeSummary } from '../../components/calendar/CalendarDialog';
import { CalLegend } from '../../components/calendar/CalLegend';
import { CalNotice } from '../../components/calendar/CalNotice';
import { MonthsCalendar } from '../../components/calendar/MonthsCalendar';
import { DateModeTabs, FlexDates } from '../../components/FlexDates';
import type { ResultsVals } from './resultsTypes';

/** The dates pop-up of the search band: two months with prices, or the flexible-dates picker; also a room's free dates. */
export function SearchCalendar({ v }: { v: ResultsVals }) {
  const flex = v.sFlex && !v.sRoomLine;
  return (
    <CalendarDialog
      canvas="results-calendar"
      className="sc"
      title={v.sCalTitle}
      hint={v.sCalHint}
      note={v.sRoomLine || null}
      tabs={v.sRoomLine ? null : <DateModeTabs flex={!!v.sFlex} onChange={v.setSFlex} />}
      onClose={v.sCloseCal}
      // a flexible-dates option goes straight to results: no foot then
      selection={
        flex ? null : (
          <>
            {v.sCalNote ? <CalNotice text={v.sCalNote} onClose={v.sCalNoteClose} onAsk={v.sCalNoteAsk} /> : null}
            <RangeSummary from={v.sSelIn} to={v.sSelOut} total={v.sSelNights} />
          </>
        )
      }
      actions={
        flex ? null : (
          <>
            <button type="button" className="btn btn-secondary" onClick={v.sCloseCal}>
              Отмена
            </button>
            <button type="button" className="btn btn-primary sc-apply" onClick={v.sApplyCal} disabled={!!v.sApplyOff}>
              Подтвердить даты
            </button>
          </>
        )
      }
    >
      {flex ? (
        <FlexDates onPick={v.sFlexPick} />
      ) : (
        <div className="cal-body">
          <MonthsCalendar months={v.sMonths} onPrev={v.sCalPrev} onNext={v.sCalNext} planeTitle="Рейс из Израиля" />
          <CalLegend />
        </div>
      )}
    </CalendarDialog>
  );
}
