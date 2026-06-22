import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import {
  defaultLanguage,
  supportedLanguages,
  type SupportedLanguage,
} from '@/i18n/resources';
import type { WeightUnit } from '@/data/local/schema/userProfile';

const storage = createMMKV({ id: 'settings-storage' });

const LANGUAGE_KEY = 'language';
const WEIGHT_UNIT_KEY = 'weight_unit';
const FIRST_DAY_OF_WEEK_KEY = 'first_day_of_week';
const REST_TIMER_FULLSCREEN_KEY = 'rest_timer_fullscreen';

export type FirstDayOfWeek = 'sunday' | 'monday';

function isSupportedLanguage(language: string): language is SupportedLanguage {
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

export function readLanguagePreference(): SupportedLanguage {
  return resolveSupportedLanguage(
    storage.getString(LANGUAGE_KEY) ?? getDeviceLanguage(),
  );
}

export function writeLanguagePreference(language: SupportedLanguage): void {
  storage.set(LANGUAGE_KEY, language);
}

function readWeightUnit(): WeightUnit {
  return storage.getString(WEIGHT_UNIT_KEY) === 'lbs' ? 'lbs' : 'kg';
}

export function hasWeightUnitPreference(): boolean {
  return storage.getString(WEIGHT_UNIT_KEY) !== undefined;
}

function writeWeightUnit(weightUnit: WeightUnit): void {
  storage.set(WEIGHT_UNIT_KEY, weightUnit);
}

function readFirstDayOfWeek(): FirstDayOfWeek {
  return storage.getString(FIRST_DAY_OF_WEEK_KEY) === 'monday'
    ? 'monday'
    : 'sunday';
}

function writeFirstDayOfWeek(firstDayOfWeek: FirstDayOfWeek): void {
  storage.set(FIRST_DAY_OF_WEEK_KEY, firstDayOfWeek);
}

export function firstDayOfWeekToIndex(firstDayOfWeek: FirstDayOfWeek): number {
  return firstDayOfWeek === 'monday' ? 1 : 0;
}

// Whether a new rest opens the full-screen timer. When off ("Never show
// again"), rests go straight to the minimized bottom bar. Defaults to on.
function readRestTimerFullscreen(): boolean {
  return storage.getBoolean(REST_TIMER_FULLSCREEN_KEY) ?? true;
}

function writeRestTimerFullscreen(enabled: boolean): void {
  storage.set(REST_TIMER_FULLSCREEN_KEY, enabled);
}

type AppSettingsState = {
  language: SupportedLanguage;
  weightUnit: WeightUnit;
  firstDayOfWeek: FirstDayOfWeek;
  restTimerFullscreen: boolean;
  setLanguage: (language: SupportedLanguage) => void;
  setWeightUnit: (weightUnit: WeightUnit) => void;
  setFirstDayOfWeek: (firstDayOfWeek: FirstDayOfWeek) => void;
  setRestTimerFullscreen: (enabled: boolean) => void;
};

export const useAppSettingsStore = create<AppSettingsState>(set => ({
  language: readLanguagePreference(),
  weightUnit: readWeightUnit(),
  firstDayOfWeek: readFirstDayOfWeek(),
  restTimerFullscreen: readRestTimerFullscreen(),
  setLanguage: language => {
    writeLanguagePreference(language);
    set({ language });
  },
  setWeightUnit: weightUnit => {
    writeWeightUnit(weightUnit);
    set({ weightUnit });
  },
  setFirstDayOfWeek: firstDayOfWeek => {
    writeFirstDayOfWeek(firstDayOfWeek);
    set({ firstDayOfWeek });
  },
  setRestTimerFullscreen: enabled => {
    writeRestTimerFullscreen(enabled);
    set({ restTimerFullscreen: enabled });
  },
}));
