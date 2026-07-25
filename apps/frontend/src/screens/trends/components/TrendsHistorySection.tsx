import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';
import { WorkoutHistoryList } from '@/screens/history/components/WorkoutHistoryList';

type TrendsHistorySectionProps = {
  workouts: WorkoutHistoryItem[];
  weightUnit: WeightUnit;
  onWorkoutPress: (workoutId: string) => void;
  onWorkoutDelete: (workoutId: string) => void;
};

export function TrendsHistorySection({
  workouts,
  weightUnit,
  onWorkoutPress,
  onWorkoutDelete,
}: TrendsHistorySectionProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-[14px]">
      <Text className="text-[20px] font-[800] leading-none tracking-[-0.2px] text-foreground">
        {t('trends.history.title')}
      </Text>

      <WorkoutHistoryList
        workouts={workouts}
        weightUnit={weightUnit}
        hasSearchQuery={false}
        onWorkoutPress={onWorkoutPress}
        onWorkoutDelete={onWorkoutDelete}
      />
    </View>
  );
}
