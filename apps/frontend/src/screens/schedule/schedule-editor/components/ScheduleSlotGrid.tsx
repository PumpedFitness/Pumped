import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ScheduleRecurrenceType } from '@/data/local/enums';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';

type ScheduleSlotGridProps = {
  recurrenceType: ScheduleRecurrenceType;
  periodLength: number;
  slots: Record<number, string>;
  templateNames: Map<string, string>;
  onPressSlot: (dayOffset: number) => void;
};

type SlotRowProps = {
  label: string;
  workoutName: string | null;
  onPress: () => void;
};

function SlotRow({ label, workoutName, onPress }: SlotRowProps) {
  const { t } = useTranslation();
  const isRest = workoutName === null;

  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-14 flex-row items-center justify-between gap-3 px-4 active:bg-surface-sunk"
      onPress={onPress}
    >
      <Text className="t-label text-foreground">{label}</Text>
      <View className="flex-1 flex-row items-center justify-end gap-2">
        <Text
          className={`t-body flex-shrink ${
            isRest ? 'text-muted' : 'text-accent'
          }`}
          numberOfLines={1}
        >
          {isRest ? t('schedule.restDay') : workoutName}
        </Text>
        <ClayIcon name="chevron" size={16} color={colors.muted} />
      </View>
    </Pressable>
  );
}

function useWeekdayNames(): string[] {
  const { i18n } = useTranslation();
  return useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        // 2024-01-01 was a Monday; offsets walk Monday through Sunday.
        new Date(Date.UTC(2024, 0, 1 + index)).toLocaleDateString(
          i18n.language,
          { weekday: 'long', timeZone: 'UTC' },
        ),
      ),
    [i18n.language],
  );
}

export function ScheduleSlotGrid({
  recurrenceType,
  periodLength,
  slots,
  templateNames,
  onPressSlot,
}: ScheduleSlotGridProps) {
  const { t } = useTranslation();
  const weekdayNames = useWeekdayNames();

  const workoutName = (dayOffset: number): string | null => {
    const templateId = slots[dayOffset];
    if (!templateId) {
      return null;
    }
    return templateNames.get(templateId) ?? t('plan.card.fallbackExercise');
  };

  if (recurrenceType === 'CYCLE') {
    return (
      <View className="overflow-hidden rounded-[18px] border border-border-soft bg-surface-card">
        {Array.from({ length: periodLength }, (_, day) => (
          <View
            key={day}
            className={day > 0 ? 'border-t border-border-soft' : ''}
          >
            <SlotRow
              label={t('schedule.dayLabel', { number: day + 1 })}
              workoutName={workoutName(day)}
              onPress={() => onPressSlot(day)}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="gap-4">
      {Array.from({ length: periodLength }, (_, week) => (
        <View key={week} className="gap-2">
          {periodLength > 1 && (
            <Text className="t-eyebrow text-muted">
              {t('schedule.weekLabel', { number: week + 1 })}
            </Text>
          )}
          <View className="overflow-hidden rounded-[18px] border border-border-soft bg-surface-card">
            {weekdayNames.map((name, weekday) => {
              const dayOffset = week * 7 + weekday;
              return (
                <View
                  key={weekday}
                  className={weekday > 0 ? 'border-t border-border-soft' : ''}
                >
                  <SlotRow
                    label={name}
                    workoutName={workoutName(dayOffset)}
                    onPress={() => onPressSlot(dayOffset)}
                  />
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
