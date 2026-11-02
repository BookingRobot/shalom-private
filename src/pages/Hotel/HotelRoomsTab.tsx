import { GuestsPicker } from '../../components/GuestsPicker';
import { HeadsetIcon } from '../../components/icons';
import { RoomCard } from '../../components/RoomCard';
import { PHONE_DISPLAY, PHONE_TEL } from '../../data/contacts';
import { CALENDAR_D, HotelIcon, PLUS_D } from './hotelIcons';
import { HotelSpecsRow, HotelTimesRow, HotelTransferRow } from './HotelRows';
import type { HotelVals } from './hotelTypes';
import './HotelRooms.css';
import './HotelNoPlaces.css';

/** «Ваши даты» bar: the stay, the guests and the way to the price calendar. */
function DatesBar({ v }: { v: HotelVals }) {
  return (
    <div className="hb" id="cheaper" data-canvas="hotel-dates">
      <div className="hb-main">
        <HotelIcon d={CALENDAR_D} size={30} className="hb-ico" />
        <div className="hb-when">
          <span className="hb-k">Ваши даты</span>
          <strong className="hb-range">{v.dateRange}</strong>
        </div>
        <span className="hb-nights">{v.nightsLabel}</span>
        {/* the guest may land here straight from the home page: guests can be changed right here */}
        <span className="hb-guests">
          <GuestsPicker inline />
        </span>
      </div>
      <button type="button" className="btn btn-secondary hb-btn" onClick={v.openCal}>
        <HotelIcon d={CALENDAR_D} stroke="currentColor" width={2} />
        Изменить даты · когда дешевле?
      </button>
    </div>
  );
}

/** No places on these dates: the nearest dates with places, and a person to help. */
function NoPlaces({ v }: { v: HotelVals }) {
  return (
    <section id="rooms" className="ht-na" aria-labelledby="ht-na-t" data-canvas="hotel-no-places">
      <div className="ht-na-head">
        <span className="ht-na-ico" aria-hidden="true">
          <HotelIcon
            d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18M9.5 14.5l5 4M14.5 14.5l-5 4"
            size={22}
            stroke="currentColor"
            width={2}
          />
        </span>
        <div>
          <h2 id="ht-na-t">{v.naTitle}</h2>
          <p>{v.naText}</p>
        </div>
      </div>
      {v.naDates.length ? (
        <div className="ht-na-dates" role="group" aria-label="Ближайшие свободные даты">
          {v.naDates.map((a) => (
            <button key={a.label} type="button" className="ht-na-date" onClick={a.pick}>
              <strong>{a.label}</strong>
              <span>{a.sub}</span>
              <em>Выбрать эти даты →</em>
            </button>
          ))}
        </div>
      ) : null}
      <button type="button" className="linkbtn ht-na-cal" onClick={v.openCal}>
        Посмотреть другие даты в календаре
      </button>
      <div className="ht-na-help">
        <div>
          <strong>Не хотите искать сами?</strong>
          <span>
            Оставьте телефон — консультант подберёт свободные даты и цену и перезвонит вам в течение 2 часов
            (9:00–20:00).
          </span>
        </div>
        <button type="button" className="btn btn-primary ht-na-call" onClick={v.helpOpen}>
          <HeadsetIcon size={22} />
          Свяжитесь со мной
        </button>
      </div>
    </section>
  );
}

/** The «Номера и программы» tab: dates, rooms with programmes, and the fold-out rows under them. */
export function HotelRoomsTab({ v }: { v: HotelVals }) {
  return (
    <div className="ht-rooms" data-canvas="hotel-rooms">
      <DatesBar v={v} />
      {v.naOn ? (
        <NoPlaces v={v} />
      ) : (
        <>
          <div id="rooms" className="hr-head">
            <h2>Выберите номер</h2>
            <div className="hr-sub">
              Цена за весь заезд ({v.guestsWho}) — с самой доступной программой. Программу можно улучшить внутри
              карточки номера.
            </div>
          </div>
          {v.noRooms ? (
            <div className="ht-cta">
              <span>
                Цены и свободные номера в {v.info.short} на ваши даты подскажет консультант — ответим в течение 2 часов
                (9:00–20:00).
              </span>
              <span className="ht-cta-btns">
                <button type="button" className="btn btn-primary" onClick={v.helpOpen}>
                  <HeadsetIcon size={22} />
                  Свяжитесь со мной
                </button>
                <a className="btn btn-secondary" href={PHONE_TEL} dir="ltr">
                  {PHONE_DISPLAY}
                </a>
              </span>
            </div>
          ) : null}
        </>
      )}
      {(v.naOn ? [] : v.offers).map((o) => (
        <RoomCard key={o.n} o={o} nightsLabel={v.nightsLabel} />
      ))}
      <div className="hr-note">
        <HotelIcon d={PLUS_D} />
        Процедуры назначает врач после консультации.
      </div>
      {/* the fold-out rows: each is a button followed by its content as siblings (the canvas relies on it) */}
      <HotelTransferRow title={v.trTitle} open={v.trOpen} toggle={v.toggleTr} freeTr={v.freeTr} />
      <HotelTimesRow open={v.timeOpen} toggle={v.toggleTime} times={v.times} />
      <HotelSpecsRow open={v.specOpen} toggle={v.toggleSpec} specs={v.specs} />
    </div>
  );
}
