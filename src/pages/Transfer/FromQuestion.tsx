import { Fragment } from 'react';
import { InfoTitle } from '../../components/InfoTip';
import { Chevron, FlightField, Radio } from './parts';
import type { TransferVals } from './transferLogic';

/** 3. «Откуда вас забрать?» — the city, then the exact spot and the arrival flight */
export function FromQuestion({ v }: { v: TransferVals }) {
  return (
    <div id="trFrom" className="tr-block ios-in" data-canvas="transfer-from">
      <div className="tr-stack-6">
        <InfoTitle tag="h2" title={'Откуда вас забрать ' + v.inDay + '?'} info={v.fromInfo} />
        {v.fromNote ? <p className="tr-p tr-p-2">{v.fromNote}</p> : null}
      </div>
      <div className="rowlist" role="radiogroup" aria-label="Откуда забрать">
        {v.cities.map((c) => (
          <Fragment key={c.id}>
            <button type="button" role="radio" aria-checked={c.on} className={`rowpick ${c.cls}`} onClick={c.pick}>
              <Radio cls={c.cls} />
              <span className="rowpick-name">
                {c.from}
                {c.paid ? <span className="rowpick-badge">{c.paid}</span> : null}
              </span>
            </button>
            {c.on ? (
              <div className="rowpick-detail">
                <span className="rowpick-info rowpick-info-in">{c.info}</span>
                <div className="tr-grid-240">
                  <div className="tr-field">
                    <label className="lbl" htmlFor="place">
                      Где именно вас встретить?
                    </label>
                    <div className="tr-select">
                      <select
                        id="place"
                        className={'input' + (v.spot ? '' : ' input-empty')}
                        value={v.spot}
                        onChange={v.pickSpot}
                      >
                        <option value="" disabled>
                          Выберите: аэропорт, вокзал или отель
                        </option>
                        {v.places.map((p) => (
                          <option key={p.t} value={p.t}>
                            {p.t}
                          </option>
                        ))}
                      </select>
                      <Chevron />
                    </div>
                  </div>
                  <FlightField
                    id="flight"
                    label={v.ourFlight ? 'Ваш рейс и время прибытия' : 'Уже есть билеты? Рейс и время прибытия'}
                    value={v.flightIn}
                    onChange={v.setFlightIn}
                    placeholder="Например: LO 771, 14:35"
                    ourFlight={v.ourFlight}
                  />
                </div>
              </div>
            ) : null}
          </Fragment>
        ))}
      </div>
      {v.fromHotel ? <HotelFields /> : null}
    </div>
  );
}

/** pick-up from a hotel: its name and address, a map link if the guest has one */
function HotelFields() {
  return (
    <div className="tr-sub ios-in">
      <div className="tr-field">
        <label className="lbl" htmlFor="hotelname">
          Из какого отеля вас забрать? <span className="tr-req">*</span>
        </label>
        <input
          id="hotelname"
          className="input"
          type="text"
          placeholder="Название отеля и адрес, например: Artis Centrum Hotels, Liejyklos g. 3"
        />
        <span className="tr-note">
          Водитель будет ждать у главного входа. Если выезжаете из квартиры — укажите адрес и подъезд.
        </span>
      </div>
      <div className="tr-field">
        <label className="lbl" htmlFor="maplink">
          Ссылка на Google Maps <span className="tr-lbl-opt">(не обязательно)</span>
        </label>
        <input id="maplink" className="input" type="url" placeholder="https://maps.app.goo.gl/…" />
        <span className="tr-note">
          Откройте отель в Google Maps → «Поделиться» → скопируйте ссылку. Так водитель точно не ошибётся.
        </span>
      </div>
    </div>
  );
}

/** «Какая машина нужна?» — for a car of your own, once the city is known */
export function CarsQuestion({ v }: { v: TransferVals }) {
  return (
    <div
      id="trCars"
      className="tr-block ios-in"
      role="radiogroup"
      aria-label="Какая машина"
      data-canvas="transfer-cars"
    >
      <h2 className="tr-h2">Какая машина нужна?</h2>
      {v.vehicles.map((k) => (
        <button
          key={k.id}
          type="button"
          role="radio"
          aria-checked={k.cls === 'on'}
          className={`choice tr-car ${k.cls}`}
          onClick={k.pick}
        >
          <span className="tr-car-l">
            <Radio cls={k.cls} />
            <span className="tr-car-pic">
              <img src={k.img} alt="" />
            </span>
            <span className="tr-stack-2">
              <strong className="tr-t18">{k.name}</strong>
              <span className="tr-p-2 tr-t16">{k.info}</span>
            </span>
          </span>
          <strong className="tr-car-price">{k.price}&nbsp;€</strong>
        </button>
      ))}
      <span className="tr-note">
        Цена за автомобиль, сколько бы вас ни было в пределах мест. Ночная подача (23:00–06:00) +20&nbsp;%.
      </span>
    </div>
  );
}
