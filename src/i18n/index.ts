import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { Language, SUPPORTED_LANGUAGES, translations } from './translations';

const resources = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((lang) => [lang, { translation: translations[lang] }])
);

function detectLanguage(): Language {
  const locales = Localization.getLocales?.() ?? [];
  for (const loc of locales) {
    const tag = (loc.languageTag || '').toLowerCase();
    const hit = SUPPORTED_LANGUAGES.find((l) => tag === l || tag.startsWith(`${l}-`));
    if (hit) return hit;
  }
  return 'de';
}

export const defaultLanguage = detectLanguage();

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: 'de',
  interpolation: { escapeValue: false },
});

export default i18n;
