import { IconPath, VanIcon } from '../../components/icons';
import { CAR_ICON } from '../../data/filters';
import { FILTER_ICON } from './ResultsHeader';
import './FiltersPanel.css';
import type { FilterItem, OneOfItem, ResultsVals } from './resultsTypes';

const UP = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
);

/** a filter's icon: the van, or a path on the 24px grid */
function FIcon({ d, size }: { d?: string; size: number }) {
  if (d === CAR_ICON) return <VanIcon height={size} />;
  return (
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
      className="fp-ico"
    >
      <IconPath d={d || ''} />
    </svg>
  );
}

/** a checkbox row of the «Дополнительные фильтры» columns */
const Checks = ({ items, icon }: { items: FilterItem[]; icon?: boolean }) => (
  <>
    {items.map((f) => (
      <label className="fchk" key={f.k}>
        <input type="checkbox" checked={!!f.on} onChange={f.toggle} />
        {icon ? <FIcon d={f.d} size={20} /> : null}
        {f.t}
        <span className="n">{f.n}</span>
      </label>
    ))}
  </>
);

/** one-of chips: meals, procedures per day, room features */
const Chips = ({ items, label, tick }: { items: OneOfItem[]; label: string; tick?: boolean }) => (
  <div className="qf-row">
    <span className="qf-lbl">{label}</span>
    <div className="qf-opts" role="group" aria-label={label}>
      {items.map((o) => (
        <button
          type="button"
          key={o.k}
          className={'qf-chip' + (o.on ? ' on' : '')}
          aria-pressed={o.on}
          onClick={o.pick}
        >
          {tick && o.on ? '✓ ' : ''}
          {o.t}
        </button>
      ))}
    </div>
  </div>
);

/** «Уточните выбор»: the filter panel under the title, open from the «Фильтры» button. */
export function FiltersPanel({ v }: { v: ResultsVals }) {
  return (
    <section className="card fp" data-canvas="results-filters">
      <div className="fp-head">
        <div className="fp-title">
          <h2>Уточните выбор</h2>
          <span>Отметьте, что для вас важно</span>
        </div>
        <button type="button" className="acc fp-close" onClick={v.closeF}>
          Свернуть
          {UP}
        </button>
      </div>
      <div className="fp-tiles">
        {v.fTop.map((f) => (
          <label className={'tile ' + (f.cls ?? '')} key={f.k}>
            <input type="checkbox" checked={!!f.on} onChange={f.toggle} />
            <FIcon d={f.d} size={22} />
            <span>{f.t}</span>
          </label>
        ))}
      </div>
      {/* Meals, procedures per day, room — what guests ask about most */}
      <div className="qf" aria-label="Питание, процедуры, номер">
        <Chips items={v.fMeals} label="Питание" />
        <Chips items={v.fProcs} label="Процедуры" />
        <Chips items={v.fRoom} label="Номер" tick />
      </div>
      {v.moreOpen ? (
        <div className="fp-more">
          <button type="button" className="acc fp-more-t" onClick={v.toggleMore}>
            <span>Дополнительные фильтры</span>
            {UP}
            <span className="fp-more-x">Свернуть</span>
          </button>
          <div className="fp-cols">
            <div className="fp-col">
              <div>
                <div className="ftitle">Цена на человека за заезд</div>
                <div className="fp-price">
                  <label>
                    <span className="lbl">От, €</span>
                    <input className="input" type="number" placeholder="Любая" value={v.pMin} onChange={v.setMin} />
                  </label>
                  <label>
                    <span className="lbl">До, €</span>
                    <input className="input" type="number" placeholder="Любая" value={v.pMax} onChange={v.setMax} />
                  </label>
                </div>
              </div>
              <div>
                <div className="ftitle">Категория</div>
                <Checks items={v.fStars} />
              </div>
            </div>
            <div className="fp-col fp-col-mid">
              <div className="ftitle">Профиль лечения</div>
              <Checks items={v.fProfile} icon />
            </div>
            <div className="fp-col">
              <div>
                <div className="ftitle">Комфорт</div>
                <Checks items={v.fComfort} icon />
              </div>
              <div>
                <div className="ftitle">Кровати</div>
                <Checks items={v.fBeds} icon />
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="fp-foot">
        {v.moreClosed ? (
          <button type="button" className="morebtn" onClick={v.toggleMore}>
            {FILTER_ICON}
            Ещё фильтры: цена, лечение, комфорт
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        ) : (
          <>
            <button type="button" className="linkbtn fp-clear" onClick={v.clearPending}>
              Сбросить выбор
            </button>
            <span className="fp-count">{v.pendCount}</span>
          </>
        )}
        <button type="button" className="btn btn-primary fp-apply" onClick={v.apply}>
          {v.applyLabel}
        </button>
      </div>
    </section>
  );
}

/** the applied filters as chips over the list */
export function ActiveFilters({ v }: { v: ResultsVals }) {
  if (!v.hasActive) return null;
  return (
    <div className="af" data-canvas="results-active">
      <span className="af-lbl">Выбрано:</span>
      {v.active.map((a) => (
        <button type="button" key={a.t} onClick={a.off} className="af-chip">
          {a.t}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--green)"
            strokeWidth="3"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ))}
      <button type="button" className="linkbtn af-reset" onClick={v.reset}>
        Сбросить всё
      </button>
    </div>
  );
}

/** the heading over the list and the sort select */
export function ListHead({ v }: { v: ResultsVals }) {
  return (
    <div id="resList" className="lh" data-canvas="results-list-head">
      <h2>{v.foundLabel}</h2>
      <label className="lh-sort">
        Сортировка:
        <select className="input lh-select" value={v.sort} onChange={v.setSort}>
          <option value="pop">Сначала популярные</option>
          <option value="cheap">Сначала дешевле</option>
          <option value="exp">Сначала дороже</option>
        </select>
      </label>
    </div>
  );
}
