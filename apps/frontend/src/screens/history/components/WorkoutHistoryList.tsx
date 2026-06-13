import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';
import { colors } from '@/theme/tokens';
import { EmptyState } from '@/components/clay/EmptyState';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { WorkoutHistoryItemCard } from './workout-history-item';

type WorkoutHistoryListProps = {
  workouts: WorkoutHistoryItem[];
  weightUnit: WeightUnit;
  hasSearchQuery: boolean;
  onWorkoutPress: (workoutId: string) => void;
};

type WorkoutGroup = {
  label: string;
  workouts: WorkoutHistoryItem[];
};

function groupWorkouts(
  workouts: WorkoutHistoryItem[],
  language: string,
): WorkoutGroup[] {
  const groups = new Map<string, WorkoutHistoryItem[]>();

  workouts.forEach(workout => {
    const label = new Date(workout.startedAt).toLocaleDateString(language, {
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
  onWorkoutPress,
}: WorkoutHistoryListProps) {
  const { t, i18n } = useTranslation();
  const groups = groupWorkouts(workouts, i18n.language);

  if (workouts.length === 0) {
    return (
      <EmptyState
        icon={
          <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-sunk">
            <ClayIcon
              name={hasSearchQuery ? 'search' : 'history'}
              size={23}
              color={colors.muted}
            />
          </View>
        }
        title={
          hasSearchQuery
            ? t('history.empty.searchTitle')
            : t('history.empty.noneTitle')
        }
        bodyClassName="max-w-[280px]"
        body={
          hasSearchQuery
            ? t('history.empty.searchBody')
            : t('history.empty.noneBody')
        }
      />
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
              onPress={() => onWorkoutPress(workout.id)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
