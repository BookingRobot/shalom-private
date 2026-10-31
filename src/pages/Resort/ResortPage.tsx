import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { RESORT_STORIES } from '../../data/resorts';
import { ResortStory } from '../../components/ResortModal';
import { Brand, HeaderBar, MainNav, PhoneLink } from '../../components/layout/SiteHeader';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { useBooking } from '../../context/BookingContext';
import { resortPath, resortSeo } from '../../lib/seo';
import { usePageMeta } from '../../lib/usePageMeta';
import './ResortPage.css';

/**
 * /kurort/<id> — the resort's story as a page of its own: the same text as the «Выберите курорт»
 * window, with an address Google can find and a guest can send to the family. «Хочу в …» puts
 * the resort into the search and opens the list of its sanatoriums.
 */
export default function ResortPage() {
  const { id = '' } = useParams();
  const r = RESORT_STORIES.find((x) => x.id === id);
  const seo = resortSeo(id);
  usePageMeta(seo);
  const navigate = useNavigate();
  const { update } = useBooking();
  if (!r) return <Navigate to="/" replace />;
  const choose = () => {
    update({ dest: r.id, chosenPlace: 'resort:' + r.id });
    navigate('/results');
  };
  return (
    <div className="page pg-resort">
      <HeaderBar>
        <Brand />
        <MainNav active="resorts" />
        <PhoneLink />
      </HeaderBar>
      <main className="rp-main">
        <div className="rp-crumbs">
          <Link to="/">Главная</Link> › Курорты › {r.name}
        </div>
        <article className="rp-card" data-canvas="resort-page">
          <div className="rs-hero" style={{ backgroundImage: `url(${r.hero})` }}>
            <div className="rs-hero-text">
              <h1>{r.name}</h1>
              <span>{r.tagline}</span>
            </div>
          </div>
          <nav className="rs-tabs rp-tabs" aria-label="Курорты">
            {RESORT_STORIES.map((x) => (
              <Link
                key={x.id}
                to={resortPath(x.id)}
                className={x.id === r.id ? 'on' : ''}
                aria-current={x.id === r.id ? 'page' : undefined}
              >
                {x.name}
              </Link>
            ))}
          </nav>
          <ResortStory r={r} />
          <div className="rp-foot">
            <button type="button" className="btn btn-primary" onClick={choose}>
              Хочу в {r.nameTo} — подобрать санаторий
            </button>
            <span>Курорт подставим в поиск — останется выбрать даты.</span>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
