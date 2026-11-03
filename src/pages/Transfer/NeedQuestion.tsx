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
          <InfoTitle title="Нет, трансфер не нужен" info={v.noSub} />
        </button>
      </div>
      {/* a calm note under the answer, no «are you sure?» window: the two facts that matter */}
      {v.noNeed ? (
        <div className="card ios-in tr-none" role="status">
          <div className="tr-none-t">Хорошо, трансфер не добавляем</div>
          <p className="tr-p">
            Учтите: от аэропорта Вильнюса до санатория 130 км, прямого автобуса нет. Адрес и как доехать пришлём в
            подтверждении. Передумаете — трансфер можно добавить позже, просто позвоните.
          </p>
        </div>
      ) : null}
    </>
  );
}
