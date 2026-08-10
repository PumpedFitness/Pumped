import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { SettingsSection } from '@pumped/ui/clay/SettingsSection';
import { ListRow } from '@pumped/ui/clay/ListRow';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { OptionSelectorSheet } from '@pumped/ui/forms/OptionSelectorSheet';
import { IndexRowChevron } from './IndexRowChevron';
import { useUserProfile } from '@/hooks/useUserProfile';
import type {
  ExperienceLevel,
  TrainingGoal,
} from '@/data/local/schema/userProfile';
import { colors } from '@pumped/ui/theme/tokens';

function buildGoalOptions(
  t: TFunction,
): { value: TrainingGoal; label: string }[] {
  return [
    { value: 'STRENGTH', label: t('onboarding.goal.options.strength.title') },
    { value: 'MUSCLE', label: t('onboarding.goal.options.muscle.title') },
    { value: 'LEAN', label: t('onboarding.goal.options.lean.title') },
    { value: 'HEALTH', label: t('onboarding.goal.options.health.title') },
  ];
}

function buildExperienceOptions(
  t: TFunction,
): { value: ExperienceLevel; label: string }[] {
  return [
    {
      value: 'BEGINNER',
      label: t('onboarding.experience.options.beginner.title'),
    },
    {
      value: 'INTERMEDIATE',
      label: t('onboarding.experience.options.intermediate.title'),
    },
    {
      value: 'ADVANCED',
      label: t('onboarding.experience.options.advanced.title'),
    },
  ];
}

function labelFor<T extends string>(
  options: { value: T; label: string }[],
  value: T | null,
  fallback: string,
): string {
  return options.find(option => option.value === value)?.label ?? fallback;
}

const chevron = <IndexRowChevron />;

export function TrainingSettings() {
  const { t } = useTranslation();
  const { profile, set } = useUserProfile();

  const [goalSheet, setGoalSheet] = useState(false);
  const [experienceSheet, setExperienceSheet] = useState(false);

  const goalOptions = buildGoalOptions(t);
  const experienceOptions = buildExperienceOptions(t);

  return (
    <>
      <SettingsSection label={t('profile.sections.training')}>
        <ListRow
          icon={<ClayIcon name="target" size={18} color={colors.accent} />}
          label={t('profile.trainingGoal')}
          detail={labelFor(goalOptions, profile.goal, t('common.notSet'))}
          trailing={chevron}
          onPress={() => setGoalSheet(true)}
        />
        <ListRow
          icon={<ClayIcon name="trend" size={18} color={colors.accent} />}
          label={t('profile.experienceLevel')}
          detail={labelFor(
            experienceOptions,
            profile.experienceLevel,
            t('common.notSet'),
          )}
          trailing={chevron}
          divider
          onPress={() => setExperienceSheet(true)}
        />
      </SettingsSection>

      <OptionSelectorSheet
        visible={goalSheet}
        title={t('profile.trainingGoal')}
        value={profile.goal ?? ''}
        options={goalOptions}
        onClose={() => setGoalSheet(false)}
        onChange={v => set({ goal: v as TrainingGoal })}
      />
      <OptionSelectorSheet
        visible={experienceSheet}
        title={t('profile.experienceLevel')}
        value={profile.experienceLevel ?? ''}
        options={experienceOptions}
        onClose={() => setExperienceSheet(false)}
        onChange={v => set({ experienceLevel: v as ExperienceLevel })}
      />
    </>
  );
}
