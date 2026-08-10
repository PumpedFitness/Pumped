import { View, Text, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ClayIcon, type IconName } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import type { OnboardingFields } from '../useOnboardingDraft';

type ReadyStepProps = {
  fields: OnboardingFields;
  weightUnit: string;
};

type RecapRowProps = {
  icon: IconName;
  label: string;
  value: string;
  delay: number;
};

function RecapRow({ icon, label, value, delay }: RecapRowProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(320).delay(delay)}
      className="flex-row items-center gap-4 rounded-[22px] border border-border-hairline bg-surface-card p-4"
    >
      <View className="w-11 h-11 rounded-[15px] bg-accent-soft items-center justify-center">
        <ClayIcon name={icon} size={21} color={colors.accent} />
      </View>
      <View className="flex-1">
        <Text className="text-[11px] font-bold uppercase tracking-[1.3px] text-muted">
          {label}
        </Text>
        <Text className="text-[16px] font-semibold text-foreground mt-[2px]">
          {value}
        </Text>
      </View>
      <ClayIcon name="check" size={18} color={colors.accent} />
    </Animated.View>
  );
}

// The daylight finale: setup is done and the app opens up. No hand-holding —
// Library and Schedule are yours.
export function ReadyStep({ fields, weightUnit }: ReadyStepProps) {
  const { t } = useTranslation();
  const userName = fields.name.trim();

  const recap: Omit<RecapRowProps, 'delay'>[] = [
    {
      icon: 'scale' as IconName,
      label: t('onboarding.body.weightUnitLabel'),
      value: t(
        weightUnit === 'kg'
          ? 'onboarding.body.kilograms'
          : 'onboarding.body.pounds',
      ),
    },
  ];
  if (fields.weight) {
    recap.push({
      icon: 'trend',
      label: t('onboarding.body.weightLabel'),
      value: `${fields.weight} ${weightUnit}`,
    });
  }
  if (fields.height) {
    recap.push({
      icon: 'ruler',
      label: t('onboarding.body.heightLabel'),
      value: `${fields.height} cm`,
    });
  }

  return (
    <ScrollView
      contentContainerClassName="grow px-7 pt-4 pb-6"
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(320)}>
        <Text className="text-[11px] font-bold uppercase tracking-[2.2px] text-accent mb-3">
          {t('onboarding.ready.eyebrow')}
        </Text>
        <Text className="text-[40px] font-[800] text-foreground tracking-[-0.8px] leading-[44px]">
          {userName
            ? t('onboarding.ready.titleNamed', { name: userName })
            : t('onboarding.ready.title')}
        </Text>
        <Text className="text-[15px] text-muted mt-3 leading-[22px]">
          {t('onboarding.ready.subtitle')}
        </Text>
      </Animated.View>

      <View className="mt-8 gap-2.5">
        {recap.map((row, index) => (
          <RecapRow key={row.label} {...row} delay={160 + index * 100} />
        ))}
      </View>

      <Animated.View
        entering={FadeIn.duration(400).delay(500)}
        className="flex-row items-center gap-2.5 mt-6 px-1"
      >
        <ClayIcon name="edit" size={15} color={colors.muted} />
        <Text className="flex-1 text-[12.5px] text-muted leading-[18px]">
          {t('onboarding.ready.note')}
        </Text>
      </Animated.View>
    </ScrollView>
  );
}
