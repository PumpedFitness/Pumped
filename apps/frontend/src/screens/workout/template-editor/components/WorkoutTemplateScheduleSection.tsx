import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WorkoutWeekday } from '@/data/local/enums';
import { colors } from '@/theme/tokens';
import { FormSection } from './FormSection';
import { OptionPill } from '@/components/forms/OptionPill';
import { ClayIcon } from '@/components/icons/ClayIcon';
import type { ScheduleMode } from '@/screens/workout/template-editor/useWorkoutTemplateEditorDraft';

type WorkoutTemplateScheduleSectionProps = {
  mode: ScheduleMode;
  interval: number;
  weekdays: WorkoutWeekday[];
  onModeChange: (mode: ScheduleMode) => void;
  onIntervalChange: (interval: number) => void;
  onToggleWeekday: (weekday: WorkoutWeekday) => void;
  onOpenAdvancedSchedule: () => void;
};

const WEEKDAY_VALUES: WorkoutWeekday[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export function WorkoutTemplateScheduleSection({
  mode,
  interval,
  weekdays,
  onModeChange,
  onIntervalChange,
  onToggleWeekday,
  onOpenAdvancedSchedule,
}: WorkoutTemplateScheduleSectionProps) {
  const { t, i18n } = useTranslation();

  const weekdayOptions = useMemo(
    () =>
      WEEKDAY_VALUES.map((value, index) => {
        // 2024-01-01 was a Monday; offsets walk Monday through Sunday.
        const date = new Date(Date.UTC(2024, 0, 1 + index));
        return {
          value,
          initial: date.toLocaleDateString(i18n.language, {
            weekday: 'narrow',
            timeZone: 'UTC',
          }),
          name: date.toLocaleDateString(i18n.language, {
            weekday: 'long',
            timeZone: 'UTC',
          }),
        };
      }),
    [i18n.language],
  );

  const intervalLabel =
    mode === 'DAYS'
      ? t('plan.schedule.everyNDays', { count: interval })
      : t('plan.schedule.everyNWeeks', { count: interval });

  return (
    <FormSection title={t('templateEditor.schedule.title')}>
      <View className="flex-row flex-wrap gap-2">
        <OptionPill
          label={t('templateEditor.schedule.flexible')}
          selected={mode === 'NONE'}
          onPress={() => onModeChange('NONE')}
        />
        <OptionPill
          label={t('templateEditor.schedule.everyFewDays')}
          selected={mode === 'DAYS'}
          onPress={() => onModeChange('DAYS')}
        />
        <OptionPill
          label={t('templateEditor.schedule.weekly')}
          selected={mode === 'WEEKS'}
          onPress={() => onModeChange('WEEKS')}
        />
      </View>

      {mode !== 'NONE' && (
        <View className="gap-4 rounded-[22px] bg-moss p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="t-label text-cream">
                {t('templateEditor.schedule.repeatInterval')}
              </Text>
              <Text className="t-caption mt-0.5 text-cream-dim">
                {intervalLabel}
              </Text>
            </View>
            <View className="flex-row items-center rounded-full bg-moss-deep p-1">
              <Pressable
                accessibilityRole="button"
                className="h-10 w-10 items-center justify-center rounded-full"
                onPress={() => onIntervalChange(Math.max(1, interval - 1))}
              >
                <ClayIcon name="minus" size={17} color={colors.cream} />
              </Pressable>
              <Text className="min-w-9 text-center text-[17px] font-bold tabular-nums text-cream">
                {interval}
              </Text>
              <Pressable
                accessibilityRole="button"
                className="h-10 w-10 items-center justify-center rounded-full"
                onPress={() => onIntervalChange(interval + 1)}
              >
                <ClayIcon name="plus" size={17} color={colors.cream} />
              </Pressable>
            </View>
          </View>

          {mode === 'WEEKS' && (
            <View className="flex-row justify-between">
              {weekdayOptions.map(day => {
                const selected = weekdays.includes(day.value);
                return (
                  <Pressable
                    key={day.value}
                    accessibilityRole="button"
                    accessibilityLabel={day.name}
                    className={`h-10 w-10 items-center justify-center rounded-full ${
                      selected ? 'bg-accent' : 'bg-moss-deep'
                    }`}
                    onPress={() => onToggleWeekday(day.value)}
                  >
                    <Text
                      className={`text-[13px] font-bold ${
                        selected ? 'text-accent-ink' : 'text-cream'
                      }`}
                    >
                      {day.initial}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        className="mt-1 flex-row items-center justify-between rounded-[18px] border border-border-hairline bg-surface-card px-4 py-3 active:bg-surface-sunk"
        onPress={onOpenAdvancedSchedule}
      >
        <View className="flex-1 flex-row items-center gap-3">
          <ClayIcon name="calendar" size={18} color={colors.accent} />
          <View className="flex-1">
            <Text className="t-label text-foreground">
              {t('templateEditor.schedule.advancedCta')}
            </Text>
            <Text className="t-caption text-muted">
              {t('templateEditor.schedule.advancedHint')}
            </Text>
          </View>
        </View>
        <ClayIcon name="chevron" size={18} color={colors.muted} />
      </Pressable>
    </FormSection>
  );
}
