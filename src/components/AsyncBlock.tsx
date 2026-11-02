import { useEffect, useState, type ReactNode } from 'react';
import type { AsyncState } from '../api/useApi';
import { useT } from '../i18n/t';
import { PHONE_DISPLAY, PHONE_TEL } from '../data/contacts';
import './AsyncBlock.css';

/** «Загружаем…» shows only when the wait is long enough to notice (a flash is worse than nothing). */
const SHOW_AFTER_MS = 200;

/**
 * A block of the page that waits for the server: loading, error (with «Повторить» and the
 * phone), empty, or the content. Data already on screen stays while a retry is running.
 *
 *   <AsyncBlock state={san} isEmpty={(d) => d.rooms.length === 0} empty={<p>Номеров нет</p>}>
 *     {(d) => <Rooms rooms={d.rooms} />}
 *   </AsyncBlock>
 */
export function AsyncBlock<T>({
  state,
  children,
  empty,
  isEmpty,
  loadingText,
  minHeight = 160,
}: {
  state: AsyncState<T>;
  children: (data: T) => ReactNode;
  empty?: ReactNode;
  isEmpty?: (data: T) => boolean;
  loadingText?: string;
  minHeight?: number;
}) {
  const { data, error, loading, retry } = state;
  const t = useT();
  const [showSpinner, setShowSpinner] = useState(false);
  useEffect(() => {
    if (!loading || data) {
      setShowSpinner(false);
      return;
    }
    const timer = window.setTimeout(() => setShowSpinner(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [loading, data]);

  if (data && !(isEmpty && isEmpty(data))) return <>{children(data)}</>;
  if (error && !loading)
    return (
      <div className="async-err" role="alert">
        <strong>{error.kind === 'network' ? t('async.noNetwork') : t('async.failed')}</strong>
        <p>{error.kind === 'not-found' ? t('async.gone') : t('async.tryAgain')}</p>
        <div className="async-err-actions">
          {error.kind !== 'not-found' ? (
            <button type="button" className="btn btn-primary" onClick={retry}>
              {t('async.retry')}
            </button>
          ) : null}
          <a className="btn btn-secondary" href={PHONE_TEL} dir="ltr">
            {PHONE_DISPLAY}
          </a>
        </div>
      </div>
    );
  if (data) return <>{empty ?? <p className="async-empty">{t('async.empty')}</p>}</>;
  return (
    <div className={'async-load' + (showSpinner ? ' on' : '')} style={{ minHeight }} role="status" aria-live="polite">
      {showSpinner ? (
        <>
          <span className="async-spin" aria-hidden="true" />
          <span>{loadingText ?? t('async.loading')}</span>
        </>
      ) : null}
    </div>
  );
}
