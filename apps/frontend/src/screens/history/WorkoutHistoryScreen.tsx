import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Input } from 'heroui-native';
import { AppShell } from '../../components/AppShell';
import { ClayIcon } from '../../components/icons/ClayIcon';
import { WorkoutHistoryList } from '../../components/workout/history/WorkoutHistoryList';
import { WorkoutHistorySummary } from '../../components/workout/history/workout-history-summary';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useWorkoutHistory } from '../../hooks/useWorkoutHistory';
import { colors } from '../../theme/tokens';

export function WorkoutHistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { profile } = useUserProfile();
  const { workouts, refresh } = useWorkoutHistory();

  useFocusEffect(useCallback(() => refresh(), [refresh]));

  const filteredWorkouts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return workouts;

    return workouts.filter(workout =>
      [
        workout.name,
        workout.notes ?? '',
        ...workout.exerciseNames,
        ...workout.muscleGroupNames,
      ]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [searchQuery, workouts]);

  return (
    <AppShell showTabBar>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-8 pt-7"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text className="t-display">Workout history</Text>
          <Text className="t-caption mt-1">
            Every session, set, and milestone in one place.
          </Text>
        </View>

        <WorkoutHistorySummary
          workouts={workouts}
          weightUnit={profile.weightUnit}
        />

        <View className="relative">
          <Input
            accessibilityLabel="Search workout history"
            className="h-[52px] rounded-full border-border-hairline bg-surface-card pl-12 pr-4 text-foreground"
            placeholder="Search workouts, exercises, or muscles"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View
            className="absolute left-4 top-0 h-[52px] items-center justify-center"
            pointerEvents="none"
          >
            <ClayIcon name="search" size={19} color={colors.muted} />
          </View>
        </View>

        <WorkoutHistoryList
          workouts={filteredWorkouts}
          weightUnit={profile.weightUnit}
          hasSearchQuery={searchQuery.trim().length > 0}
        />
      </ScrollView>
    </AppShell>
  );
}
