import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppShell } from '@/components/layout/AppShell';
import { TabBarInsetSpacer } from '@/components/layout/TabBarInsetSpacer';
import { SearchInput } from '@/components/forms/SearchInput';
import { WorkoutHistoryList } from './components/WorkoutHistoryList';
import { WorkoutHistorySummary } from './components/workout-history-summary';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import type { MainTabParamList } from '@/navigation/MainTabs';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type HistoryScreenProps = CompositeScreenProps<
  NativeBottomTabScreenProps<MainTabParamList, 'History'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HistoryScreen({ navigation }: HistoryScreenProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const { profile } = useUserProfile();
  const { workouts } = useWorkoutHistory();

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
          <Text className="t-display">{t('history.title')}</Text>
          <Text className="t-caption mt-1">{t('history.subtitle')}</Text>
        </View>

        <WorkoutHistorySummary
          workouts={workouts}
          weightUnit={profile.weightUnit}
        />

        <SearchInput
          accessibilityLabel={t('history.searchA11y')}
          placeholder={t('history.searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <WorkoutHistoryList
          workouts={filteredWorkouts}
          weightUnit={profile.weightUnit}
          hasSearchQuery={searchQuery.trim().length > 0}
          onWorkoutPress={workoutId =>
            navigation.navigate('CompletedWorkout', { workoutId })
          }
        />

        <TabBarInsetSpacer />
      </ScrollView>
    </AppShell>
  );
}
