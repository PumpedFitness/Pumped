import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '@/components/clay/SegmentedControl';
import { ProfileField } from './ProfileField';

export type ProfileFields = {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  bodyFat: string;
};

type ProfileContentProps = {
  fields: ProfileFields;
  setField: <K extends keyof ProfileFields>(key: K, value: string) => void;
};

export function ProfileContent({ fields, setField }: ProfileContentProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      contentContainerClassName="grow px-6 pt-4 pb-6"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces
    >
      <Text className="text-[30px] font-bold text-foreground tracking-[-0.6px] mb-1">
        {t('onboarding.profile.title')}
      </Text>

      <Text className="text-[15px] text-muted mb-7">
        {t('onboarding.profile.subtitle')}
      </Text>

      <View className="gap-[18px]">
        <ProfileField
          label={t('onboarding.profile.nameLabel')}
          value={fields.name}
          onChangeText={v => setField('name', v)}
          placeholder={t('onboarding.profile.namePlaceholder')}
        />
        <View className="gap-1.5">
          <Text className="text-[12.5px] font-semibold text-muted">
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
        <ProfileField
          label={t('onboarding.profile.heightLabel')}
          value={fields.height}
          onChangeText={v => setField('height', v)}
          placeholder={t('onboarding.profile.heightPlaceholder')}
          keyboardType="decimal-pad"
        />
        <ProfileField
          label={t('onboarding.profile.weightLabel')}
          value={fields.weight}
          onChangeText={v => setField('weight', v)}
          placeholder={t('onboarding.profile.weightPlaceholder')}
          keyboardType="decimal-pad"
        />
        <ProfileField
          label={t('onboarding.profile.bodyFatLabel')}
          value={fields.bodyFat}
          onChangeText={v => setField('bodyFat', v)}
          placeholder={t('onboarding.profile.bodyFatPlaceholder')}
          keyboardType="decimal-pad"
        />
      </View>
    </ScrollView>
  );
}
