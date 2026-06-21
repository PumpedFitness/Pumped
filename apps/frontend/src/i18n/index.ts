import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
  defaultLanguage,
  languageLabels,
  resources,
  supportedLanguages,
  type SupportedLanguage,
} from './resources';
import {
  readLanguagePreference,
  resolveSupportedLanguage,
  useAppSettingsStore,
} from '@/stores/appSettingsStore';

void i18n.use(initReactI18next).init({
  resources,
  lng: readLanguagePreference(),
  fallbackLng: defaultLanguage,
  supportedLngs: [...supportedLanguages],
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export async function changeAppLanguage(
  language: SupportedLanguage,
): Promise<void> {
  useAppSettingsStore.getState().setLanguage(language);
  await i18n.changeLanguage(language);
}

export {
  i18n,
  languageLabels,
  resolveSupportedLanguage,
  supportedLanguages,
  type SupportedLanguage,
};
