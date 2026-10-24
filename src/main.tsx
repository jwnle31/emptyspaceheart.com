import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocaleProvider } from './i18n/LocaleProvider';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <LocaleProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LocaleProvider>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>,
);
