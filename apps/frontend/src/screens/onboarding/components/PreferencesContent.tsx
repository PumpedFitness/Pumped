import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '@/components/clay/SegmentedControl';

type PreferencesContentProps = {
  weightUnit: string;
  setWeightUnit: (v: string) => void;
};

export function PreferencesContent({
  weightUnit,
  setWeightUnit,
}: PreferencesContentProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 justify-center px-8">
      <Text className="text-[30px] font-bold text-foreground tracking-[-0.6px] text-center mb-2">
        {t('onboarding.preferences.title')}
      </Text>

      <Text className="text-[15px] text-muted text-center mb-10">
        {t('onboarding.preferences.subtitle')}
      </Text>

      <View className="gap-1.5">
        <Text className="text-[12.5px] font-semibold text-muted">
          {t('onboarding.preferences.weightUnitLabel')}
        </Text>
        <SegmentedControl
          options={[
            { value: 'kg', label: t('onboarding.preferences.kilograms') },
            { value: 'lbs', label: t('onboarding.preferences.pounds') },
          ]}
          value={weightUnit}
          onChange={setWeightUnit}
        />
      </View>
    </View>
  );
}
