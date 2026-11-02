import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { HelpProvider } from './context/HelpContext';
import { BookingProvider } from './context/BookingContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { PageTransition } from './components/layout/PageTransition';
import { StepGuard } from './components/StepGuard';
import { startAnalytics, trackPage } from './lib/analytics';
import { allSeoPages } from './lib/seo';
import { applyDefaultMeta } from './lib/usePageMeta';

const MainPage = lazy(() => import('./pages/Main/MainPage'));
const ResultsPage = lazy(() => import('./pages/Results/ResultsPage'));
const HotelPage = lazy(() => import('./pages/Hotel/HotelPage'));
const RoomsPage = lazy(() => import('./pages/Rooms/RoomsPage'));
const TransferPage = lazy(() => import('./pages/Transfer/TransferPage'));
const GuestsPage = lazy(() => import('./pages/Guests/GuestsPage'));
const PaymentPage = lazy(() => import('./pages/Payment/PaymentPage'));
const DonePage = lazy(() => import('./pages/Done/DonePage'));
const RulesPage = lazy(() => import('./pages/Rules/RulesPage'));
const TicketsPage = lazy(() => import('./pages/Tickets/TicketsPage'));
const ScreensPage = lazy(() => import('./pages/Screens/ScreensPage'));
const PrivacyPage = lazy(() => import('./pages/Privacy/PrivacyPage'));
const ResortPage = lazy(() => import('./pages/Resort/ResortPage'));
const OrderPage = lazy(() => import('./pages/Order/OrderPage').then((m) => ({ default: m.OrderPage })));

/** /sanatoriy/<id>: a new page for every sanatorium (the page reads its id once, when it starts) */
function HotelByPath() {
  const { id } = useParams();
  return <HotelPage key={id} />;
}

/** New page → scroll to top; link with #hash → scroll to that section. Counts the page view. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    startAnalytics();
    trackPage(pathname);
    const pages = allSeoPages();
    applyDefaultMeta(
      pathname,
      pages.find((p) => p.path === pathname),
      pages[0],
    );
  }, [pathname]);
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

/** the other pages' code is fetched quietly after the first page: going on is then instant (only the short soft loading) */
function usePrefetchPages() {
  useEffect(() => {
    const t = window.setTimeout(() => {
      void import('./pages/Main/MainPage');
      void import('./pages/Results/ResultsPage');
      void import('./pages/Hotel/HotelPage');
      void import('./pages/Rooms/RoomsPage');
      void import('./pages/Transfer/TransferPage');
      void import('./pages/Guests/GuestsPage');
      void import('./pages/Payment/PaymentPage');
      void import('./pages/Done/DonePage');
      void import('./pages/Rules/RulesPage');
      void import('./pages/Tickets/TicketsPage');
    }, 1500);
    return () => window.clearTimeout(t);
  }, []);
}

export default function App() {
  const { search } = useLocation();
  usePrefetchPages();
  const helpInitiallyOpen = new URLSearchParams(search).has('help');
  return (
    <LanguageProvider>
      <BookingProvider>
        <HelpProvider initial={helpInitiallyOpen ? 'form' : 'closed'}>
          <ScrollManager />
          <PageTransition />
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/hotel" element={<HotelPage />} />
              <Route
                path="/rooms"
                element={
                  <StepGuard>
                    <RoomsPage />
                  </StepGuard>
                }
              />
              <Route
                path="/transfer"
                element={
                  <StepGuard>
                    <TransferPage />
                  </StepGuard>
                }
              />
              <Route
                path="/guests"
                element={
                  <StepGuard>
                    <GuestsPage />
                  </StepGuard>
                }
              />
              <Route path="/flights" element={<Navigate to="/transfer" replace />} />
              <Route
                path="/payment"
                element={
                  <StepGuard>
                    <PaymentPage />
                  </StepGuard>
                }
              />
              <Route
                path="/done"
                element={
                  <StepGuard>
                    <DonePage />
                  </StepGuard>
                }
              />
              <Route path="/rules" element={<RulesPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/kurort/:id" element={<ResortPage />} />
              <Route path="/sanatoriy/:id" element={<HotelByPath />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/screens" element={<ScreensPage />} />
              <Route path="/order/:code" element={<OrderPage />} />
              <Route path="*" element={<MainPage />} />
            </Routes>
          </Suspense>
        </HelpProvider>
      </BookingProvider>
    </LanguageProvider>
  );
}
