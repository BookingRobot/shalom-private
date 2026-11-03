import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchCard } from '../../components/SearchCard';
import type { ResultsVals } from './resultsTypes';
import { StepNotice } from '../../components/StepGuard';

/** the filter sliders icon */
export const FILTER_ICON = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h12M20 17h0" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="17" r="2" />
  </svg>
);

/**
 * Search band (the same card as on the home page), breadcrumbs, the title and the two tools.
 * Below 1081 px the band is one line «what was searched» with «Изменить», which opens the
 * full form in place, so the first sanatorium shows on the first screen (CSS hides the parts).
 */
export function ResultsHeader({ v }: { v: ResultsVals }) {
  const [edit, setEdit] = useState(false);
  return (
    <>
      <section className={'res-band' + (edit ? ' res-band-edit' : '')} data-canvas="results-search">
        <div className="res-band-in">
          <div className="res-sum">
            <div className="res-sum-t">
              <strong>Друскининкай</strong>
              <span>
                {v.dateRange} · {v.nightsLabel} · {v.guestsLine}
              </span>
            </div>
            <button
              type="button"
              className="res-sum-btn"
              onClick={() => setEdit(!edit)}
              aria-expanded={edit}
              aria-controls="res-form"
            >
              {edit ? 'Свернуть' : 'Изменить'}
            </button>
          </div>
          {/* a new search goes to this same list, so the form folds back to the line */}
          <div className="res-form" id="res-form" onSubmit={() => setEdit(false)}>
            <SearchCard inLabel={v.sInLabel} outLabel={v.sOutLabel} onOpenCal={v.sOpenCal} />
          </div>
        </div>
      </section>
      <div className="res-crumbs">
        <Link to="/">Главная</Link> › Друскининкай
      </div>
      {/* sent back here from a booking step that needs a sanatorium first */}
      <div className="res-notice">
        <StepNotice />
      </div>
      <div className="res-head" data-canvas="results-head">
        <div className="res-title">
          <h1>Санатории Друскининкая</h1>
          <div className="res-sub">
            {v.dateRange} · {v.nightsLabel} · {v.guestsLine}
          </div>
        </div>
        <div className="res-tools">
          <button
            type="button"
            className={'btn btn-secondary f-btn' + (v.fOpen ? ' on' : '')}
            onClick={v.fOpen ? v.closeF : v.openF}
            aria-expanded={!!v.fOpen}
            title={v.appliedSummary}
          >
            {FILTER_ICON}
            Фильтры
            <span className="f-badge">{v.fBadge}</span>
          </button>
          <button type="button" className="btn btn-secondary" onClick={v.wzOpenFn}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
            Помогите выбрать санаторий
          </button>
        </div>
      </div>
    </>
  );
}
