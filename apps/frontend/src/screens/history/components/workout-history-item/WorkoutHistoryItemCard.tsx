import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';
import { colors } from '@/theme/tokens';
import { displayWeight } from '@/utils/units';
import { ClayIcon, type IconName } from '@/components/icons/ClayIcon';
import { WorkoutAvatar } from '@/components/workout/WorkoutAvatar';

type WorkoutHistoryItemCardProps = {
  workout: WorkoutHistoryItem;
  weightUnit: WeightUnit;
  onPress: () => void;
};

type StatPillProps = {
  icon: IconName;
  label: string;
};

function StatPill({ icon, label }: StatPillProps) {
  return (
    <View className="min-w-0 flex-1 flex-row items-center gap-2 rounded-[16px] border border-border-soft bg-surface-sunk px-3 py-2.5">
      <ClayIcon name={icon} size={15} color={colors.muted} />
      <Text className="t-label flex-1" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function formatWorkoutDate(timestamp: number, language: string): string {
  return new Date(timestamp).toLocaleDateString(language, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatVolume(
  t: TFunction,
  volumeKg: number,
  weightUnit: WeightUnit,
): string {
  const value = displayWeight(volumeKg, weightUnit);
  if (value >= 1_000) {
    return t('history.item.volumeK', {
      value: (value / 1_000).toFixed(1),
      unit: weightUnit,
    });
  }
  return `${Math.round(value).toLocaleString()} ${weightUnit}`;
}

export function WorkoutHistoryItemCard({
  workout,
  weightUnit,
  onPress,
}: WorkoutHistoryItemCardProps) {
  const { t, i18n } = useTranslation();
  const exerciseSummary =
    workout.exerciseNames.length > 0
      ? workout.exerciseNames.slice(0, 3).join(' · ')
      : t('history.item.noExerciseDetails');
  const muscleSummary = workout.muscleGroupNames.slice(0, 3).join(' + ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('history.item.viewA11y', { name: workout.name })}
      className="gap-4 rounded-[24px] border border-border-soft bg-surface-card p-4 active:bg-surface-sunk"
      onPress={onPress}
    >
      <View className="flex-row items-start gap-3">
        <WorkoutAvatar
          picture={workout.picture}
          icon={workout.icon}
          color={workout.color}
          size={52}
          radius={17}
        />
        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-3">
            <Text className="t-heading flex-1" numberOfLines={1}>
              {workout.name}
            </Text>
            <View className="rounded-full bg-surface-sunk px-2.5 py-1">
              <Text className="t-caption">
                {formatWorkoutDate(workout.startedAt, i18n.language)}
              </Text>
            </View>
          </View>
          <Text className="t-caption mt-1" numberOfLines={2}>
            {exerciseSummary}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <StatPill
          icon="clock"
          label={t('common.minutesShort', { count: workout.durationMinutes })}
        />
        <StatPill
          icon="bolt"
          label={t('common.set', { count: workout.sets.length })}
        />
        <StatPill
          icon="trend"
          label={formatVolume(t, workout.totalVolumeKg, weightUnit)}
        />
      </View>

      {muscleSummary ? (
        <View className="rounded-[16px] bg-surface-sunk px-3 py-2">
          <Text className="t-caption flex-1" numberOfLines={1}>
            {t('history.item.focus', { muscles: muscleSummary })}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
