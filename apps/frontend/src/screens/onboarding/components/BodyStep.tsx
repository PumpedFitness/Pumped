import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OnboardingFields } from '../useOnboardingDraft';
import { StepHeader } from './StepHeader';
import { ProfileField } from './ProfileField';
import { SegmentedControl } from '@pumped/ui/clay/SegmentedControl';

type BodyStepProps = {
  fields: OnboardingFields;
  setField: <K extends keyof OnboardingFields>(key: K, value: string) => void;
  weightUnit: string;
  setWeightUnit: (v: string) => void;
};

export function BodyStep({
  fields,
  setField,
  weightUnit,
  setWeightUnit,
}: BodyStepProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      contentContainerClassName="grow px-7 pt-4 pb-6"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <StepHeader
        eyebrow={t('onboarding.body.eyebrow')}
        title={t('onboarding.body.title')}
        subtitle={t('onboarding.body.subtitle')}
      />

      <View className="gap-[22px]">
        <View className="gap-2">
          <Text className="text-[11px] font-bold uppercase tracking-[1.2px] text-muted">
            {t('onboarding.body.weightUnitLabel')}
          </Text>
          <SegmentedControl
            options={[
              { value: 'kg', label: t('onboarding.body.kilograms') },
              { value: 'lbs', label: t('onboarding.body.pounds') },
            ]}
            value={weightUnit}
            onChange={setWeightUnit}
          />
        </View>
        <ProfileField
          label={t('onboarding.body.heightLabel')}
          value={fields.height}
          onChangeText={v => setField('height', v)}
          placeholder={t('onboarding.body.heightPlaceholder')}
          keyboardType="decimal-pad"
        />
        <ProfileField
          label={t('onboarding.body.weightLabel')}
          value={fields.weight}
          onChangeText={v => setField('weight', v)}
          placeholder={t(
            weightUnit === 'kg'
              ? 'onboarding.body.weightPlaceholderKg'
              : 'onboarding.body.weightPlaceholderLbs',
          )}
          keyboardType="decimal-pad"
        />
        <ProfileField
          label={t('onboarding.body.bodyFatLabel')}
          value={fields.bodyFat}
          onChangeText={v => setField('bodyFat', v)}
          placeholder={t('onboarding.body.bodyFatPlaceholder')}
          keyboardType="decimal-pad"
        />
      </View>
    </ScrollView>
  );
}
