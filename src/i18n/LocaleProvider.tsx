import { useState, type ReactNode } from 'react';
import { LocaleContext, type Locale } from './locale';

const LOCALE_STORAGE_KEY = 'site-locale';

function savedLocale(): Locale {
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY) === 'ko' ? 'ko' : 'en';
  } catch {
    return 'en';
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, updateLocale] = useState<Locale>(savedLocale);

  const setLocale = (nextLocale: Locale) => {
    updateLocale(nextLocale);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    } catch {
      // Keep the selection for this visit if storage is unavailable.
    }
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
