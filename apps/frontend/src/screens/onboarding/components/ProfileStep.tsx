import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OnboardingFields } from '../useOnboardingDraft';
import { StepHeader } from './StepHeader';
import { ProfileField } from './ProfileField';
import { SegmentedControl } from '@pumped/ui/clay/SegmentedControl';

type ProfileStepProps = {
  fields: OnboardingFields;
  setField: <K extends keyof OnboardingFields>(key: K, value: string) => void;
};

export function ProfileStep({ fields, setField }: ProfileStepProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      contentContainerClassName="grow px-7 pt-4 pb-6"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <StepHeader
        eyebrow={t('onboarding.profile.eyebrow')}
        title={t('onboarding.profile.title')}
        subtitle={t('onboarding.profile.subtitle')}
      />

      <View className="gap-[22px]">
        <ProfileField
          label={t('onboarding.profile.nameLabel')}
          value={fields.name}
          onChangeText={v => setField('name', v)}
          placeholder={t('onboarding.profile.namePlaceholder')}
        />
        <View className="gap-2">
          <Text className="text-[11px] font-bold uppercase tracking-[1.2px] text-muted">
            {t('onboarding.profile.genderLabel')}
          </Text>
          <SegmentedControl
            options={[
              { value: 'MALE', label: t('onboarding.gender.male') },
              { value: 'FEMALE', label: t('onboarding.gender.female') },
              { value: 'OTHER', label: t('onboarding.gender.other') },
            ]}
            value={fields.gender}
            onChange={v => setField('gender', v)}
          />
        </View>
        <ProfileField
          label={t('onboarding.profile.ageLabel')}
          value={fields.age}
          onChangeText={v => setField('age', v)}
          placeholder={t('onboarding.profile.agePlaceholder')}
          keyboardType="numeric"
        />
      </View>
    </ScrollView>
  );
}
