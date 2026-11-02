/**
 * What search engines and link previews see for each page: title, description, picture.
 * Used twice: in the browser (usePageMeta keeps <head> right while the guest moves around)
 * and at build time (vite.config.ts writes a static index.html per page with these tags,
 * plus sitemap.xml), so Google and WhatsApp previews get the right text without running JS.
 * Pure data only — no React, no browser APIs.
 */
import { RESORT_STORIES } from '../data/resorts';
import { HOTEL_IDS, hotelInfo } from '../data/hotelInfo';

export const SITE_ORIGIN = 'https://shalom.bookingrobot.eu';
export const SITE_TITLE = 'Санатории Литвы';

export interface PageSeo {
  path: string;
  title: string;
  description: string;
  image?: string;
}

const clip = (s: string, n = 158) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');

export const resortPath = (id: string) => '/kurort/' + id;
export const sanatoriumPath = (id: string) => '/sanatoriy/' + id;

const RESORT_IN: Record<string, string> = {
  druskininkai: 'Друскининкае',
  palanga: 'Паланге',
  birstonas: 'Бирштонасе',
  anyksciai: 'Аникщяе',
};

export function resortSeo(id: string): PageSeo | null {
  const r = RESORT_STORIES.find((x) => x.id === id);
  if (!r) return null;
  return {
    path: resortPath(r.id),
    title: `Санатории в ${RESORT_IN[r.id] || r.name}: лечение, отдых, что посмотреть`,
    description: clip(`${r.tagline}. ${r.story[0]}`),
    image: r.hero,
  };
}

export function sanatoriumSeo(id: string): PageSeo | null {
  if (!HOTEL_IDS.includes(id)) return null;
  const h = hotelInfo(id);
  return {
    path: sanatoriumPath(h.id),
    title: `${h.name}, ${h.resort} — номера, программы лечения, цены`,
    description: clip(h.text.about.lead + ' ' + h.text.treatment.lead),
    image: h.photos[0]?.src,
  };
}

/** Pages that stand on their own (the booking steps are not for search engines). */
export function allSeoPages(): PageSeo[] {
  const base: PageSeo[] = [
    {
      path: '/',
      title: SITE_TITLE,
      description:
        'Бронирование санаториев Литвы: Друскининкай, Бирштонас, Паланга. Программы лечения, прямой перелёт из Тель-Авива, трансфер, консультация на русском.',
    },
    {
      path: '/tickets',
      title: 'Прямые перелёты Тель-Авив — Вильнюс',
      description: 'Прямой рейс Тель-Авив ⇄ Вильнюс под заезд в санаторий: дни вылета, цены, покупка билетов онлайн.',
    },
    {
      path: '/rules',
      title: 'Условия бронирования, оплаты и отмены',
      description:
        'Как проходит заказ санатория, сколько и когда платить, бесплатная отмена и перенос — простыми словами.',
    },
    {
      path: '/privacy',
      title: 'Политика конфиденциальности',
      description: 'Какие данные гостей мы получаем при заказе, зачем, кому передаём и как их получить или удалить.',
    },
  ];
  const resorts = RESORT_STORIES.map((r) => resortSeo(r.id)).filter((x): x is PageSeo => !!x);
  const sans = HOTEL_IDS.map((id) => sanatoriumSeo(id)).filter((x): x is PageSeo => !!x);
  return [...base, ...resorts, ...sans];
}

/** The <head> tags of one page, as HTML (build time) — the browser sets the same via usePageMeta. */
export function headTags(p: PageSeo): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const url = SITE_ORIGIN + p.path;
  const title = p.path === '/' ? SITE_TITLE : `${p.title} · ${SITE_TITLE}`;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(p.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" hreflang="ru" href="${url}" />`,
    `<link rel="alternate" hreflang="x-default" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="ru_RU" />`,
    `<meta property="og:title" content="${esc(p.title)}" />`,
    `<meta property="og:description" content="${esc(p.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    p.image ? `<meta property="og:image" content="${SITE_ORIGIN + p.image}" />` : '',
  ]
    .filter(Boolean)
    .join('\n    ');
}
