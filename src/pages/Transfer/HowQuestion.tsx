import { VanIcon } from '../../components/icons';
import { InfoTitle } from '../../components/InfoTip';
import { PaidStamp, Radio } from './parts';
import type { TransferVals } from './transferLogic';

/** the four pictures of the mini film «От встречи до санатория»: picture, alt, long and short captions */
const FILM: [string, string, string, string][] = [
  ['/img/39ad8fe2bfcea92423d717bc9dac8f37.png', 'Водитель встречает с табличкой', 'Встретим с табличкой', 'Встреча'],
  ['/img/838118fe86e78736560c2ece8886b813.png', 'Водитель укладывает чемодан в багажник', 'Поможем с багажом', 'Багаж'],
  ['/img/565b4c9fbca5b96b414361547b3a452f.png', 'Микроавтобус едет к санаторию', 'Довезём до санатория', 'Дорога'],
  ['/img/05b41fccbf0a437d88db58e3ce3a1a91.png', 'Гость у стойки регистрации санатория', 'Проводим до стойки', 'Стойка'],
];

/** 2. «Как поедете?» — a seat in the group van or a car of your own; nothing chosen */
export function HowQuestion({ v }: { v: TransferVals }) {
  return (
    <div id="trHow" className="tr-block" data-canvas="transfer-how">
      <div className="tr-stack-4">
        <h2 className="tr-h2">Как поедете?</h2>
        <p className="tr-p tr-p-2">{v.howNote}</p>
      </div>
      <div className="tr-how" role="radiogroup" aria-label="Как поедете">
        <button
          type="button"
          role="radio"
          aria-checked={v.isGroup}
          className={`choice tr-how-opt ${v.groupCls}`}
          onClick={v.pickGroupHow}
        >
          <Radio cls={v.groupCls} />
          <span className="tr-how-pic">
            <img src="/img/165765111b3ce679a969db85fe7d023f.png" alt="" />
          </span>
          <span className="tr-how-txt">
            <InfoTitle
              title="Групповой трансфер"
              extra={<span className="tr-best">Самый выгодный</span>}
              info="Микроавтобус Mercedes Sprinter или Vito вместе с другими гостями санаториев. Встретим с табличкой и поможем с багажом."
            />
          </span>
          <span className="tr-how-price">
            {v.seatPaid ? <PaidStamp>{v.seatPaid}</PaidStamp> : <strong className="tr-price">{v.seatPrice}</strong>}
            <span>{v.seatNote}</span>
            {v.seatTotal ? (
              <span>
                за {v.guestsLabel}: <strong className="tr-ink">{v.seatTotal}</strong>
              </span>
            ) : null}
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={v.isInd}
          className={`choice tr-how-opt ${v.indCls}`}
          onClick={v.pickIndHow}
        >
          <Radio cls={v.indCls} />
          <span className="tr-how-pic">
            <VanIcon height={40} />
          </span>
          <span className="tr-how-txt">
            <InfoTitle
              title="Отдельная машина — только вы"
              info="Без ожидания других рейсов и попутчиков: водитель встречает вас и едет сразу в санаторий. Машину выберете ниже."
            />
          </span>
          <span className="tr-how-price">
            <strong className="tr-price">от {v.indFrom}</strong>
            <span>за машину</span>
          </span>
        </button>
      </div>
      {v.isGroup ? (
        <div className="tr-warn ios-in">
          <svg
            className="tr-warn-ico"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--warn-ink)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          <InfoTitle
            tag="span"
            title="Возможно ожидание других рейсов до 1 часа"
            info="Вы едете вместе с другими гостями: по дороге — остановки у других санаториев, дорога длиннее на 30–40 минут. Точное время встречи сообщим за день до приезда."
          />
        </div>
      ) : null}
    </div>
  );
}

/** the illustrated strip «От встречи до санатория» with «Подробнее» under it */
export function HowItGoes({ v }: { v: TransferVals }) {
  return (
    <div className="tr-strip" data-canvas="transfer-film">
      <div className="tr-strip-t">От встречи до санатория</div>
      {/* a mini film: four pictures in a row; on a phone smaller, with one-word captions */}
      <ol className="tr-film">
        {FILM.map(([src, alt, long, short]) => (
          <li key={src}>
            <span className="tr-film-pic">
              <img src={src} alt={alt} />
            </span>
            <span className="tr-film-l">{long}</span>
            <span className="tr-film-s" aria-hidden="true">
              {short}
            </span>
          </li>
        ))}
      </ol>
      <button type="button" className="acc tr-more" onClick={v.toggleMore}>
        {v.moreLabel}
      </button>
      {v.moreOpen ? (
        <div className="tr-more-list">
          <span>
            • <strong>Если рейс задерживается</strong> — следим за ним по номеру и ждём без доплаты.
          </span>
          <span>
            • <strong>Остановки по пути</strong> — по вашей просьбе: туалет, кафе, аптека.
          </span>
          <span>
            • <strong>Обратно</strong> — так же: заберём из санатория за 3 часа до вылета, время подтвердим за день.
          </span>
          <span>
            • <strong>Время в пути</strong> зависит от маршрута — указано рядом с городом ниже.
          </span>
        </div>
      ) : null}
    </div>
  );
}
