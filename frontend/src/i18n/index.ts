import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import ko from './locales/ko.json';
import vi from './locales/vi.json';
import en from './locales/en.json';

const resources = {
  ko: { translation: ko },
  vi: { translation: vi },
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;