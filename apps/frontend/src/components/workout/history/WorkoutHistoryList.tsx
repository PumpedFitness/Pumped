import { Text, View } from 'react-native';
import type { WeightUnit } from '../../../data/local/schema/userProfile';
import type { WorkoutHistoryItem } from '../../../hooks/useWorkoutHistory';
import { colors } from '../../../theme/tokens';
import { ClayIcon } from '../../icons/ClayIcon';
import { WorkoutHistoryItemCard } from './workout-history-item';

type WorkoutHistoryListProps = {
  workouts: WorkoutHistoryItem[];
  weightUnit: WeightUnit;
  hasSearchQuery: boolean;
};

type WorkoutGroup = {
  label: string;
  workouts: WorkoutHistoryItem[];
};

function groupWorkouts(workouts: WorkoutHistoryItem[]): WorkoutGroup[] {
  const groups = new Map<string, WorkoutHistoryItem[]>();

  workouts.forEach(workout => {
    const label = new Date(workout.startedAt).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
    const group = groups.get(label) ?? [];
    group.push(workout);
    groups.set(label, group);
  });

  return [...groups].map(([label, groupedWorkouts]) => ({
    label,
    workouts: groupedWorkouts,
  }));
}

export function WorkoutHistoryList({
  workouts,
  weightUnit,
  hasSearchQuery,
}: WorkoutHistoryListProps) {
  const groups = groupWorkouts(workouts);

  if (workouts.length === 0) {
    return (
      <View className="items-center gap-3 rounded-[24px] border border-dashed border-border-hairline px-6 py-10">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-sunk">
          <ClayIcon
            name={hasSearchQuery ? 'search' : 'history'}
            size={23}
            color={colors.muted}
          />
        </View>
        <Text className="t-heading">
          {hasSearchQuery ? 'No workouts found' : 'No workout history yet'}
        </Text>
        <Text className="t-caption max-w-[280px] text-center">
          {hasSearchQuery
            ? 'Try searching for another workout, exercise, or muscle group.'
            : 'Completed workouts will show up here with volume, duration, and exercise details.'}
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-6">
      {groups.map(group => (
        <View key={group.label} className="gap-3">
          <Text className="t-eyebrow px-1">{group.label}</Text>
          {group.workouts.map(workout => (
            <WorkoutHistoryItemCard
              key={workout.id}
              workout={workout}
              weightUnit={weightUnit}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
