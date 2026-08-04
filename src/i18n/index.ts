import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN';
import zhTW from './locales/zh-TW';
import enUS from './locales/en-US';
import jaJP from './locales/ja-JP';
import koKR from './locales/ko-KR';
import frFR from './locales/fr-FR';
import deDE from './locales/de-DE';

const STORAGE_KEY = 'ao-admin-pro.locale';
const resources = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'fr-FR': frFR,
  'de-DE': deDE,
};

function readSavedLanguage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

const savedLanguage = readSavedLanguage();
const supportedLanguage = savedLanguage && Object.hasOwn(resources, savedLanguage)
  ? savedLanguage as keyof typeof resources
  : 'zh-CN';

void i18n.use(initReactI18next).init({
  resources,
  lng: supportedLanguage,
  fallbackLng: 'en-US',
  interpolation: { escapeValue: false },
  returnNull: false,
});

i18n.on('languageChanged', (language) => {
  if (typeof document !== 'undefined') document.documentElement.lang = language;
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Storage is optional in restricted browser contexts.
  }
});

if (typeof document !== 'undefined') document.documentElement.lang = supportedLanguage;

export default i18n;
