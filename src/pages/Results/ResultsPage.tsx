import { useEffect } from 'react';
// the page's base rules first: the block styles that follow build on them
import './ResultsPage.css';
import { HeaderBar, Brand, MainNav, PhoneLink } from '../../components/layout/SiteHeader';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { ChooseWizard } from '../../components/ChooseWizard';
import { Compare, useCompareLimit } from '../../components/Compare';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageLogic } from '../../lib/pageLogic';
import { usePageTitle } from '../../lib/usePageTitle';
import { ResultsLogic } from './ResultsLogic';
import { ResultsHeader } from './ResultsHeader';
import { ActiveFilters, FiltersPanel, ListHead } from './FiltersPanel';
import { HotelCard } from './HotelCard';
import { SoldOutList } from './SoldOutList';
import { PriceCalendar } from './PriceCalendar';
import { SearchCalendar } from './SearchCalendar';

const HELP_CTX: HelpContextInfo = { dest: 'druskininkai', in: '2026-11-09', out: '2026-11-18' };

/** Search results of a resort: the sanatoriums for the dates, their rooms, filters and compare. */
export default function ResultsPage() {
  usePageTitle('Санатории Друскининкая');
  const [v, logic] = usePageLogic(ResultsLogic);
  logic.cmpLimit = useCompareLimit();
  useEffect(() => {
    const hq = new URLSearchParams(window.location.search).get('h');
    if (!hq) return;
    const t = setTimeout(() => {
      const el = document.getElementById('h-' + hq) || document.getElementById('sold');
      el?.scrollIntoView({ block: 'start' });
    }, 80);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="page pg-results">
      <div className="res-page">
        <HeaderBar>
          <Brand />
          <MainNav active="resorts" />
          <PhoneLink />
        </HeaderBar>
        <ResultsHeader v={v} />
        <div className="res-main">
          {/* Filters open under the header from the "Фильтры" button; closed, they take no room */}
          {v.fClosed ? <span hidden className="f-slot" data-canvas="results-filters-slot" /> : null}
          {v.fOpen ? <FiltersPanel v={v} /> : null}
          <ActiveFilters v={v} />
          <ListHead v={v} />
          <div className="res-list">
            {v.none ? (
              <div className="card res-none">
                <div className="res-none-t">По этим условиям ничего не нашлось</div>
                <p>Снимите одно из условий — или позвоните, подберём вручную.</p>
                <button type="button" className="btn btn-secondary" onClick={v.reset}>
                  Сбросить фильтры
                </button>
              </div>
            ) : null}
            {v.hotels.map((h) => (
              <HotelCard key={h.id} h={h} nightsLabel={v.nightsLabel} cmpLimit={v.cmpLimit} onTipClose={v.rmTipClose} />
            ))}
          </div>
          <SoldOutList v={v} />
          <ChooseWizard open={!!v.wzOpen} onClose={v.wzClose} onShow={v.wzShow} />
          <Compare hotels={v.cmpHotels} ids={v.cmpIds} onRemove={v.cmpRemove} onClear={v.cmpClear} />
        </div>
        <SiteFooter help={{ title: 'Поможем выбрать', sub: 'Подскажем, какой санаторий подойдёт именно вам' }} />
      </div>
      {v.calOpen ? <PriceCalendar v={v} /> : null}
      {v.sCalOpen ? <SearchCalendar v={v} /> : null}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
