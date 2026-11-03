import { InfoTitle } from '../../components/InfoTip';
import { BackFlight, Chevron, PaidStamp, Radio } from './parts';
import type { TransferVals } from './transferLogic';

/** 4. «Обратно: нужен трансфер?» — its own question, then where to */
export function BackQuestion({ v }: { v: TransferVals }) {
  return (
    <div className="tr-block ios-in" data-canvas="transfer-back">
      <div className="tr-stack-4">
        <InfoTitle
          tag="h2"
          title={'Обратно ' + v.outDay + ', ' + v.outWeekday + ': нужен трансфер?'}
          info={
            'Заберём из санатория ' +
            v.hotelShort +
            ' так, чтобы вы были в аэропорту за 3 часа до вылета. Точное время сообщим за день.'
          }
        />
      </div>
      <div id="trBack" className="tr-q" role="radiogroup" aria-label="Нужен ли трансфер обратно">
        <button
          type="button"
          role="radio"
          aria-checked={v.backOn}
          className={`choice ${v.backYesCls}`}
          onClick={v.pickBackYes}
        >
          <Radio cls={v.backYesCls} />
          <InfoTitle
            title="Да, отвезите обратно"
            info={v.backSub}
            extra={v.backPaid ? <PaidStamp>{v.backPaid}</PaidStamp> : null}
          />
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={v.backNoCls === 'on'}
          className={`choice tr-no ${v.backNoCls}`}
          onClick={v.pickBackNo}
        >
          <Radio cls={v.backNoCls} />
          <strong>Нет, обратно доберёмся сами</strong>
        </button>
      </div>
      {v.backOn ? <BackWhere v={v} /> : null}
    </div>
  );
}

/** «Куда отвезти?» — the same spot or another city and place */
function BackWhere({ v }: { v: TransferVals }) {
  return (
    <div id="trBackWhere" className="tr-sub ios-in">
      <div className="lbl tr-lbl-q">Куда отвезти {v.outDay}?</div>
      <div className="tr-q" role="radiogroup" aria-label="Куда отвезти">
        <button
          type="button"
          role="radio"
          aria-checked={v.backSame}
          className={`choice ${v.sameCls}`}
          onClick={v.pickSame}
        >
          <Radio cls={v.sameCls} />
          <span className="tr-stack-2">
            <strong className="tr-t18">Туда же, откуда забрали</strong>
            <span className="tr-p-2 tr-t16">{v.sameInfo}</span>
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={v.backOther}
          className={`choice ${v.otherCls}`}
          onClick={v.pickOther}
        >
          <Radio cls={v.otherCls} />
          <InfoTitle title="В другое место" info="Другой город, аэропорт, вокзал или отель — выберете ниже." />
        </button>
      </div>
      {v.backOther ? (
        <div className="ios-in tr-stack-14">
          <div id="trBackCities" className="rowlist" role="radiogroup" aria-label="Куда отвезти">
            {v.backCities.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={c.cls === 'on'}
                className={`rowpick ${c.cls}`}
                onClick={c.pick}
              >
                <Radio cls={c.cls} />
                <span className="rowpick-name">
                  {c.to}
                  {c.paid ? <span className="rowpick-badge">{c.paid}</span> : null}
                </span>
              </button>
            ))}
          </div>
          {v.backCityChosen ? (
            <div className="ios-in tr-grid-260">
              <div className="tr-field">
                <label className="lbl" htmlFor="backplace">
                  Куда именно отвезти?
                </label>
                <div className="tr-select">
                  <select
                    id="backplace"
                    className={'input' + (v.backSpot ? '' : ' input-empty')}
                    value={v.backSpot}
                    onChange={v.pickBackSpot}
                  >
                    <option value="" disabled>
                      Выберите: аэропорт, вокзал или отель
                    </option>
                    {v.backPlaces.map((p) => (
                      <option key={p.t} value={p.t}>
                        {p.t}
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              </div>
              <BackFlight v={v} id="backflight" />
            </div>
          ) : null}
        </div>
      ) : null}
      {v.backSame ? (
        <div className="ios-in tr-w-420">
          <BackFlight v={v} id="backflight2" />
          <span className="tr-note tr-note-top">
            Заберём из санатория так, чтобы вы были в аэропорту за 3 часа до вылета. Точное время сообщим за день.
          </span>
        </div>
      ) : null}
    </div>
  );
}
