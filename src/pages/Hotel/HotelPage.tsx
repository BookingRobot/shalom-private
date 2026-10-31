import { useEffect } from 'react';
import { HeaderBar, Brand, MainNav, PhoneLink } from '../../components/layout/SiteHeader';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { HOTEL_TABS, HotelTabContent } from '../../components/hotel/HotelTabs';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageLogic } from '../../lib/pageLogic';
import { usePageTitle } from '../../lib/usePageTitle';
import { HotelLogic } from './hotelLogic';
import { HotelFactsStrip, HotelHeader } from './HotelHeader';
import { HotelGallery, HotelLightbox } from './HotelGallery';
import { HotelRoomsTab } from './HotelRoomsTab';
import { HotelCalendarModal } from './HotelCalendarModal';
import type { HotelVals } from './hotelTypes';
import { sanatoriumSeo } from '../../lib/seo';
import { usePageMeta } from '../../lib/usePageMeta';
import './HotelPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
};

/** The tab bar; the chosen tab stays visible on a phone (see the effect in the page). */
function Tabs({ v }: { v: HotelVals }) {
  return (
    <nav className="ht-tabs" id="hotel-tabs" aria-label="Разделы санатория" data-canvas="hotel-tabs">
      {HOTEL_TABS.map(([k, t]) => (
        <button
          key={k}
          type="button"
          className={v.tab === k ? 'on' : ''}
          aria-current={v.tab === k ? 'page' : undefined}
          onClick={() => v.setTab(k)}
        >
          {t}
          {k === 'reviews' ? <small>{v.info.reviewsN}</small> : null}
        </button>
      ))}
    </nav>
  );
}

/** The sanatorium page: header, photos, facts, tabs; rooms with programmes on the first tab. */
export default function HotelPage() {
  const [v, logic] = usePageLogic(HotelLogic);
  usePageTitle(v.info.name);
  // opening a sanatorium makes it the sanatorium of the order
  const { booking, update } = logic.props.booking;
  // links like /hotel#reviews (and the browser's back button) switch the tab
  useEffect(() => {
    const onHash = () => {
      const k = window.location.hash.replace('#', '');
      const tab = HOTEL_TABS.find(([t]) => t === k);
      if (tab) logic.setState({ tab: tab[0] });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [logic]);
  // the chosen tab stays visible in the tab bar on a phone
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('.ht-tabs');
    const btn = nav?.querySelector<HTMLElement>('button.on');
    if (nav && btn) nav.scrollLeft = btn.offsetLeft - nav.offsetLeft - (nav.clientWidth - btn.offsetWidth) / 2;
  }, [v.tab]);
  // a photo opened from the "О санатории" tab: the gallery starts at that photo
  useEffect(() => {
    if (v.lightbox && logic.state.i) document.getElementById('lbp-' + logic.state.i)?.scrollIntoView();
  }, [v.lightbox, logic.state.i]);
  usePageMeta(sanatoriumSeo(v.info.id));
  useEffect(() => {
    if (booking.hotelId !== v.info.id) update({ hotelId: v.info.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.info.id]);
  return (
    <div className="page pg-hotel">
      <div className="hp-col">
        <HeaderBar>
          <Brand />
          <MainNav />
          <PhoneLink />
        </HeaderBar>
        <div className="hp-main">
          <HotelHeader info={v.info} onReviews={() => v.setTab('reviews')} />
          <HotelGallery
            tiles={v.tiles}
            photoCount={v.photoCount}
            pick0={v.pick0}
            pick1={v.pick1}
            pick2={v.pick2}
            pickAll={v.pickAll}
          />
          {v.lightbox ? <HotelLightbox name={v.info.name} photos={v.allPhotos} onClose={v.closeLb} /> : null}
          <HotelFactsStrip strip={v.strip} />
          <Tabs v={v} />
          <div className="ht-body" data-canvas="hotel-tab-panel">
            {v.tab === 'rooms' ? (
              <HotelRoomsTab v={v} />
            ) : (
              <div className="ht-tab-box">
                <HotelTabContent tab={v.tab} info={v.info} onRooms={v.toRooms} onPhoto={v.openPhoto} />
              </div>
            )}
          </div>
        </div>
        <SiteFooter
          help={{ title: 'Поможем выбрать программу', sub: 'Объясним условия, ответим на вопросы — на русском языке' }}
        />
      </div>
      {v.calOpen ? <HotelCalendarModal v={v} guestsWho={v.guestsWho} /> : null}
      <HelpWidget ctx={{ ...HELP_CTX, hotel: v.info.name + ', ' + v.info.resort }} pageState={logic.state} />
    </div>
  );
}
