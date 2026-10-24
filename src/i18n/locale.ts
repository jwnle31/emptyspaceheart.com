import { createContext, useContext } from 'react';

export type Locale = 'en' | 'ko';

export type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLanguage() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLanguage must be used within LocaleProvider');
  }
  return context;
}

export function useLocale(): Locale {
  return useLanguage().locale;
}
