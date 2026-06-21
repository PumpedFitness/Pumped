import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage, languageLabels, supportedLanguages } from '@/i18n';
import { useAppSettingsStore } from '@/stores/appSettingsStore';

type LanguageSwitcherProps = {
  compact?: boolean;
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const activeLanguage = useAppSettingsStore(state => state.language);

  const handleLanguagePress = (language: typeof activeLanguage) => {
    void changeAppLanguage(language);
  };

  return (
    <View
      accessibilityLabel={t('settings.language')}
      className={`flex-row items-center ${compact ? 'gap-1' : 'gap-2'}`}
    >
      {supportedLanguages.map(language => {
        const selected = activeLanguage === language;
        const label = compact
          ? language.toUpperCase()
          : languageLabels[language];

        return (
          <Pressable
            key={language}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => handleLanguagePress(language)}
            className={`h-9 min-w-12 items-center justify-center rounded-md border px-3 ${
              selected
                ? 'border-accent bg-accent-soft'
                : 'border-border bg-field-background'
            }`}
          >
            <Text
              className={`text-xs font-semibold uppercase ${
                selected ? 'text-accent' : 'text-text-muted'
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
