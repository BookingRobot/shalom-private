import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { HelpProvider } from './context/HelpContext';
import { BookingProvider } from './context/BookingContext';
import { LanguageProvider } from './i18n/LanguageContext';

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

/** New page → scroll to top; link with #hash → scroll to that section. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
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

export default function App() {
  const { search } = useLocation();
  const helpInitiallyOpen = new URLSearchParams(search).has('help');
  return (
    <LanguageProvider>
      <BookingProvider>
        <HelpProvider initial={helpInitiallyOpen ? 'form' : 'closed'}>
          <ScrollManager />
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/hotel" element={<HotelPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/transfer" element={<TransferPage />} />
              <Route path="/guests" element={<GuestsPage />} />
              <Route path="/flights" element={<Navigate to="/transfer" replace />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/done" element={<DonePage />} />
              <Route path="/rules" element={<RulesPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/screens" element={<ScreensPage />} />
              <Route path="*" element={<MainPage />} />
            </Routes>
          </Suspense>
        </HelpProvider>
      </BookingProvider>
    </LanguageProvider>
  );
}
