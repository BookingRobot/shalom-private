import { InfoTitle } from '../../components/InfoTip';
import { PaidStamp, Radio } from './parts';
import type { TransferVals } from './transferLogic';

/** 1. «Нужен ли трансфер?» — two answers, nothing chosen for the guest */
export function NeedQuestion({ v }: { v: TransferVals }) {
  return (
    <>
      <div className="road-h road-h-out">
        <span className="road-num">2</span>
        <div>
          <InfoTitle tag="h2" title="Трансфер до санатория" info={v.transferLead} />
        </div>
      </div>
      <div id="trNeed" className="tr-q" role="radiogroup" aria-label="Нужен ли трансфер" data-canvas="transfer-need">
        <button type="button" role="radio" aria-checked={v.need} className={`choice ${v.yesCls}`} onClick={v.sayYes}>
          <Radio cls={v.yesCls} />
          <InfoTitle
            title={v.yesTitle}
            info={v.yesInfo}
            extra={v.paidBy ? <PaidStamp>{v.paidBy}</PaidStamp> : <span className="tr-reco">Рекомендуем</span>}
          />
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={v.noNeed}
          className={`choice tr-no ${v.noCls}`}
          onClick={v.sayNo}
        >
          <Radio cls={v.noCls} />
          <InfoTitle title="Нет, доберусь сам" info={v.noSub} />
        </button>
      </div>
      {v.askNo ? <NoTransferDialog v={v} /> : null}
      {v.noNeed ? (
        <div className="card ios-in tr-none">
          <div className="tr-none-t">Хорошо, трансфер не добавляем</div>
          <p className="tr-p">
            Адрес санатория и как доехать на машине или автобусе пришлём в подтверждении. Трансфер можно добавить позже
            — просто позвоните.
          </p>
        </div>
      ) : null}
    </>
  );
}

/** «Вы уверены?» — the window after «Нет, доберусь сам»: how far it is without a transfer */
function NoTransferDialog({ v }: { v: TransferVals }) {
  return (
    <div className="tr-dim">
      <div role="dialog" aria-modal="true" aria-labelledby="noTitle" className="card tr-dialog">
        <div className="tr-dialog-h">
          <svg
            className="tr-dialog-ico"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </svg>
          <h2 id="noTitle" className="tr-h2">
            Вы уверены, что доберётесь сами?
          </h2>
        </div>
        <p className="tr-p">
          От аэропорта Вильнюса до санатория — 130 км. Прямого автобуса из аэропорта нет: нужно доехать до автовокзала,
          купить билет, затем 2 часа в пути и такси до санатория — с чемоданами.
        </p>
        <div className="tr-dialog-note">
          <strong>С трансфером:</strong> водитель встречает с табличкой, помогает с багажом и довозит до стойки
          санатория. {v.withNote}
        </div>
        <div className="tr-dialog-btns">
          <button type="button" className="btn btn-secondary" onClick={v.confirmNo}>
            Да, доберусь сам
          </button>
          <button type="button" className="btn btn-primary tr-dialog-main" onClick={v.keepTransfer}>
            Нет, добавить трансфер
          </button>
        </div>
      </div>
    </div>
  );
}
