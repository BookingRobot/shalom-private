import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { client } from '../../api';
import { useApi } from '../../api/useApi';
import { AsyncBlock } from '../../components/AsyncBlock';
import { Brand, HeaderBar, MainNav, PhoneLink } from '../../components/layout/SiteHeader';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { useBooking } from '../../context/BookingContext';
import { normalizeOrderCode } from '../../lib/orderCode';
import { bookingFromUrl } from '../../lib/share';
import { usePageTitle } from '../../lib/usePageTitle';
import { useT } from '../../i18n/t';
import './OrderPage.css';

/**
 * /order/K7F2M — the order by its code: the same draft on any device, for the family and
 * for the consultant. The draft is loaded into the order and the guest lands on the step
 * where they stopped. A link that also carries the choices (?offer=…) still works when the
 * draft is not on this server (see lib/share).
 */
export function OrderPage() {
  const t = useT();
  usePageTitle(t('order.title'));
  const { code: raw = '' } = useParams();
  const code = normalizeOrderCode(raw);
  const navigate = useNavigate();
  const { loadDraft, update } = useBooking();
  const draft = useApi(() => client.getDraft(code || ''), [code], !!code);

  useEffect(() => {
    if (!draft.data) return;
    loadDraft(draft.data);
    const to = { rooms: '/rooms', transfer: '/transfer', guests: '/guests', payment: '/payment', done: '/done' }[
      draft.data.step
    ];
    navigate(to, { replace: true });
  }, [draft.data, loadDraft, navigate]);

  // not on this server, but the link carries the choices: open them the old way
  useEffect(() => {
    if (!draft.error) return;
    const shared = bookingFromUrl(window.location.search);
    if (shared) {
      update(shared);
      navigate('/rooms', { replace: true });
    }
  }, [draft.error, update, navigate]);

  return (
    <div className="page order-page">
      <HeaderBar>
        <Brand />
        <MainNav />
        <PhoneLink />
      </HeaderBar>
      <main className="order-main">
        {code ? (
          <AsyncBlock state={draft} loadingText={t('order.opening')}>
            {() => <p className="order-note">{t('order.openingCode', { code })}</p>}
          </AsyncBlock>
        ) : (
          <div className="async-err" role="alert">
            <strong>{t('order.badCode')}</strong>
            <p>{t('order.badCodeHelp')}</p>
            <Link className="btn btn-secondary" to="/">
              {t('order.home')}
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
