import { Pressable, Text, View } from 'react-native';
import type { WeightUnit } from '../../../../data/local/schema/userProfile';
import type { WorkoutHistoryItem } from '../../../../hooks/useWorkoutHistory';
import { colors } from '../../../../theme/tokens';
import { displayWeight } from '../../../../utils/units';
import { ClayIcon } from '../../../icons/ClayIcon';

type WorkoutHistoryItemCardProps = {
  workout: WorkoutHistoryItem;
  weightUnit: WeightUnit;
  onPress: () => void;
};

function formatWorkoutDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatVolume(volumeKg: number, weightUnit: WeightUnit): string {
  const value = displayWeight(volumeKg, weightUnit);
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k ${weightUnit}`;
  }
  return `${Math.round(value).toLocaleString()} ${weightUnit}`;
}

export function WorkoutHistoryItemCard({
  workout,
  weightUnit,
  onPress,
}: WorkoutHistoryItemCardProps) {
  const exerciseSummary =
    workout.exerciseNames.length > 0
      ? workout.exerciseNames.slice(0, 3).join(' · ')
      : 'No exercise details';
  const muscleSummary = workout.muscleGroupNames.slice(0, 3).join(' + ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${workout.name} workout`}
      className="gap-4 rounded-[22px] border border-border-hairline bg-surface-card p-4 active:bg-surface-sunk"
      onPress={onPress}
    >
      <View className="flex-row items-start gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-accent-soft">
          <ClayIcon name="dumbbell" size={22} color={colors.accent} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-3">
            <Text className="t-heading flex-1" numberOfLines={1}>
              {workout.name}
            </Text>
            <Text className="t-caption">
              {formatWorkoutDate(workout.startedAt)}
            </Text>
          </View>
          <Text className="t-caption mt-1" numberOfLines={2}>
            {exerciseSummary}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1 flex-row items-center gap-2 rounded-[14px] bg-surface-sunk px-3 py-2.5">
          <ClayIcon name="clock" size={15} color={colors.muted} />
          <Text className="t-label">{workout.durationMinutes} min</Text>
        </View>
        <View className="flex-1 flex-row items-center gap-2 rounded-[14px] bg-surface-sunk px-3 py-2.5">
          <ClayIcon name="bolt" size={15} color={colors.muted} />
          <Text className="t-label">
            {workout.sets.length} {workout.sets.length === 1 ? 'set' : 'sets'}
          </Text>
        </View>
        <View className="flex-1 flex-row items-center gap-2 rounded-[14px] bg-surface-sunk px-3 py-2.5">
          <ClayIcon name="trend" size={15} color={colors.muted} />
          <Text className="t-label">
            {formatVolume(workout.totalVolumeKg, weightUnit)}
          </Text>
        </View>
      </View>

      {muscleSummary ? (
        <View className="flex-row items-center gap-2 border-t border-border-soft pt-3">
          <View className="h-2 w-2 rounded-full bg-sage" />
          <Text className="t-caption flex-1" numberOfLines={1}>
            Focus: {muscleSummary}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
