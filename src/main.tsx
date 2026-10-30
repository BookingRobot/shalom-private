import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import './styles/global.css';
import './styles/ui.css';
import './styles/soft.css';
import App from './App';

/*
 * A new version was published while the page was open: the old page asks for files that are
 * gone, and a step could show without its styles. Load the new version once instead
 * (not more often than every 20 seconds, so it can never loop).
 */
window.addEventListener('vite:preloadError', (e) => {
  try {
    const last = Number(sessionStorage.getItem('br-shalom:reloaded') || 0);
    if (Date.now() - last < 20000) return;
    sessionStorage.setItem('br-shalom:reloaded', String(Date.now()));
  } catch {
    /* storage unavailable: reload anyway */
  }
  e.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
