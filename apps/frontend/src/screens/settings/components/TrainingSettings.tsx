import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { SettingsSection } from '@pumped/ui/clay/SettingsSection';
import { ListRow } from '@pumped/ui/clay/ListRow';
import { SegmentedControl } from '@pumped/ui/clay/SegmentedControl';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { OptionSelectorSheet } from '@pumped/ui/forms/OptionSelectorSheet';
import { colors } from '@pumped/ui/theme/tokens';
import { useUserProfile } from '@/hooks/useUserProfile';
import type {
  ExperienceLevel,
  TrainingGoal,
} from '@/data/local/schema/userProfile';
import {
  type FirstDayOfWeek,
  useAppSettingsStore,
} from '@/stores/appSettingsStore';
import { IndexRowChevron } from './IndexRowChevron';

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

function FirstDayOfWeekSetting() {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const firstDayOfWeek = useAppSettingsStore(state => state.firstDayOfWeek);
  const setFirstDayOfWeek = useAppSettingsStore(
    state => state.setFirstDayOfWeek,
  );

  const options: { value: FirstDayOfWeek; label: string }[] = [
    { value: 'sunday', label: t('settings.weekStartsOn.sunday') },
    { value: 'monday', label: t('settings.weekStartsOn.monday') },
  ];
  const selectedLabel =
    options.find(option => option.value === firstDayOfWeek)?.label ??
    options[0].label;

  return (
    <>
      <ListRow
        icon={<ClayIcon name="calendar" size={18} color={colors.accent} />}
        label={t('settings.weekStartsOn.label')}
        detail={selectedLabel}
        trailing={chevron}
        divider
        onPress={() => setSheetOpen(true)}
      />
      <OptionSelectorSheet
        visible={sheetOpen}
        title={t('settings.weekStartsOn.label')}
        value={firstDayOfWeek}
        options={options}
        onClose={() => setSheetOpen(false)}
        onChange={setFirstDayOfWeek}
      />
    </>
  );
}

function RestTimerSettings() {
  const { t } = useTranslation();
  const restTimerFullscreen = useAppSettingsStore(
    state => state.restTimerFullscreen,
  );
  const setRestTimerFullscreen = useAppSettingsStore(
    state => state.setRestTimerFullscreen,
  );
  const autoRestTimer = useAppSettingsStore(state => state.autoRestTimer);
  const setAutoRestTimer = useAppSettingsStore(state => state.setAutoRestTimer);

  return (
    <>
      <ListRow
        icon={<ClayIcon name="clock" size={18} color={colors.accent} />}
        label={t('settings.autoRestTimer.label')}
        paddingVertical={10}
        divider
        trailing={
          <View className="w-32">
            <SegmentedControl
              options={[
                { value: 'on', label: t('settings.autoRestTimer.on') },
                { value: 'off', label: t('settings.autoRestTimer.off') },
              ]}
              value={autoRestTimer ? 'on' : 'off'}
              onChange={value => setAutoRestTimer(value === 'on')}
            />
          </View>
        }
      />
      <ListRow
        icon={<ClayIcon name="clock" size={18} color={colors.accent} />}
        label={t('settings.restTimerFullscreen.label')}
        paddingVertical={10}
        divider
        trailing={
          <View className="w-32">
            <SegmentedControl
              options={[
                { value: 'on', label: t('settings.restTimerFullscreen.on') },
                { value: 'off', label: t('settings.restTimerFullscreen.off') },
              ]}
              value={restTimerFullscreen ? 'on' : 'off'}
              onChange={value => setRestTimerFullscreen(value === 'on')}
            />
          </View>
        }
      />
    </>
  );
}

/**
 * How the user trains: what they are training for, and the two conventions
 * that shape a session — when the week turns over and how the rest timer
 * behaves. Both used to sit under app preferences, between language and
 * units, where nothing connected them to training.
 */
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
        <FirstDayOfWeekSetting />
      </SettingsSection>

      <SettingsSection label={t('profile.sections.restTimer')}>
        <RestTimerSettings />
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
