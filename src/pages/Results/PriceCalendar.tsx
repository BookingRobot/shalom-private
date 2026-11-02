import { CalNotice } from '../../components/calendar/CalNotice';
import './PriceCalendar.css';
import type { ResultsVals } from './resultsTypes';
import { DemoMark } from '../../components/DemoMark';

const CAL_ICON = 'M3 5h18v16H3zM16 3v4M8 3v4M3 10h18';
const PLANE = 'M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z';

const Plane = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--green)"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={PLANE} />
  </svg>
);

/** «Когда дешевле?»: one month of per-person prices; a picked day moves the whole stay. */
export function PriceCalendar({ v }: { v: ResultsVals }) {
  const c = v.cal;
  return (
    <div className="pc-overlay" data-canvas="results-pricecal">
      <div className="cal-dlg pc" role="dialog" aria-modal="true" aria-labelledby="calTitle">
        <div className="pc-head">
          <div className="pc-title">
            <h2 id="calTitle">Выберите дату заезда</h2>
            <div>{c.hotelName}</div>
          </div>
          <button type="button" onClick={v.calClose} aria-label="Закрыть" className="pc-x">
            ✕
          </button>
        </div>
        <div className="pc-now">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--green)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={CAL_ICON} />
          </svg>
          Ваши даты: {v.curRange} · ≈ {c.curPpn}&nbsp;€ / чел. в сутки
          <span className="pc-now-sub">
            · 2 взрослых · {v.nightsLabel} · {c.room} · {c.prog}
          </span>
        </div>
        <div className="pc-cols">
          {/* Calendar */}
          <div className="pc-main">
            <div className="pc-cap">Средняя цена за 1 человека в сутки</div>
            <div className="pc-cap-sub">
              При заезде в выбранный день на {v.nightsLabel}. Точная сумма за весь отдых — в блоке «Новые даты».
            </div>
            <div className="pc-box">
              <div className="pc-nav">
                <button type="button" onClick={v.calPrev} aria-label="Предыдущий месяц">
                  ‹
                </button>
                <div className="pc-month">{c.monthTitle}</div>
                <button type="button" onClick={v.calNext} aria-label="Следующий месяц">
                  ›
                </button>
              </div>
              <div className="pc-week">
                {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="pc-grid">
                {c.cells.map((cell, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={cell.pick}
                    disabled={!!cell.off}
                    aria-label={cell.aria}
                    className="pc-cell"
                    style={{
                      ['--pc-border' as string]: cell.border,
                      ['--pc-bg' as string]: cell.bg,
                      ['--pc-color' as string]: cell.color,
                      cursor: cell.cursor,
                    }}
                  >
                    <span className="pc-day">{cell.day}</span>
                    <span className="pc-price">{cell.text}</span>
                    <span className="pc-sub">{cell.sub}</span>
                    {cell.fly ? (
                      <span className="pc-fly" title="Рейс из Израиля">
                        <Plane size={16} />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* New dates panel */}
          <aside className="pc-new">
            <div className="pc-new-t">Новые даты</div>
            <div className="pc-new-box">
              <div className="pc-dates">
                <div>
                  <span>Заезд</span>
                  <strong>{c.newIn}</strong>
                </div>
                <div>
                  <span>Выезд</span>
                  <strong>{c.newOut}</strong>
                </div>
              </div>
              <div className="pc-party">2 взрослых · {v.nightsLabel}</div>
              <div className="pc-ppn">
                <span>{c.newPpn}&nbsp;€</span>
                <span>/ чел. в сутки</span>
              </div>
              <div className="pc-total">
                <span>За весь отдых</span>
                <strong>{c.newTotal}&nbsp;€</strong>
              </div>
              <div className="pc-cur">
                На ваши даты — <strong>{c.curTotal}&nbsp;€</strong>
              </div>
              <div className="pc-diff" style={{ background: c.diffBg, color: c.diffColor }}>
                {c.diffText}
              </div>
            </div>
            <div className="pc-legend">
              <span>
                <i className="pc-lg-cheap" />
                Дешевле
              </span>
              <span>
                <i className="pc-lg-avg" />
                Средняя цена
              </span>
              <span>
                <i className="pc-lg-exp" />
                Дороже
              </span>
              <details className="pc-flights">
                <summary>
                  <Plane size={18} />
                  <span>
                    <strong>Рейсы из Израиля</strong> — вт, чт, вс
                  </span>
                  <span className="pc-i">i</span>
                </summary>
                <div>
                  Прямые рейсы Тель-Авив ⇄ Вильнюс выполняют <strong>Israir</strong> и <strong>Arkia</strong> (с осени —
                  также Wizz Air). В отмеченные дни удобнее всего заезжать и уезжать: трансфер встретит прямо в
                  аэропорту. Расписание рейсов уточняйте у авиакомпании<DemoMark> [ПОДТВЕРДИТЬ ДНИ]</DemoMark>.
                </div>
              </details>
              <span>
                <i className="pc-lg-full" />
                Нет мест
              </span>
            </div>
          </aside>
        </div>
        <div className="pc-foot">
          {c.note ? <CalNotice text={c.note} onClose={v.calNoteClose} onAsk={v.calNoteAsk} /> : null}
          <button type="button" className="acc" onClick={v.calClose}>
            Оставить {v.curRange}
          </button>
          <button type="button" className="btn btn-primary pc-apply" onClick={v.calApply} disabled={!!c.applyOff}>
            Применить {c.newRange}
          </button>
        </div>
      </div>
    </div>
  );
}
