import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { createMMKV } from 'react-native-mmkv';
import {
  defaultLanguage,
  languageLabels,
  resources,
  supportedLanguages,
  type SupportedLanguage,
} from './resources';

const LANGUAGE_STORAGE_KEY = 'language';
const storage = createMMKV({ id: 'settings-storage' });

export function isSupportedLanguage(
  language: string,
): language is SupportedLanguage {
  return supportedLanguages.some(
    supportedLanguage => supportedLanguage === language,
  );
}

export function resolveSupportedLanguage(
  language?: string | null,
): SupportedLanguage {
  if (!language) {
    return defaultLanguage;
  }

  const normalizedLanguage = language.toLowerCase();
  if (isSupportedLanguage(normalizedLanguage)) {
    return normalizedLanguage;
  }

  const [baseLanguage] = normalizedLanguage.split('-');
  return isSupportedLanguage(baseLanguage) ? baseLanguage : defaultLanguage;
}

function getDeviceLanguage(): SupportedLanguage {
  try {
    return resolveSupportedLanguage(
      Intl.DateTimeFormat().resolvedOptions().locale,
    );
  } catch {
    return defaultLanguage;
  }
}

function getInitialLanguage(): SupportedLanguage {
  const savedLanguage = storage.getString(LANGUAGE_STORAGE_KEY);
  return savedLanguage
    ? resolveSupportedLanguage(savedLanguage)
    : getDeviceLanguage();
}

void i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
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
  storage.set(LANGUAGE_STORAGE_KEY, language);
  await i18n.changeLanguage(language);
}

export {
  i18n,
  languageLabels,
  supportedLanguages,
  type SupportedLanguage,
};
