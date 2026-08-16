import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenHeader } from '@pumped/ui/clay/ScreenHeader';
import { ProfileAvatarButton } from '@/components/layout/ProfileAvatarButton';
import { AppShell } from '@/components/layout/AppShell';
import { TabBarInsetSpacer } from '@/components/layout/TabBarInsetSpacer';
import { SearchInput } from '@pumped/ui/forms/SearchInput';
import { WorkoutHistoryList } from './components/WorkoutHistoryList';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import type { MainTabParamList } from '@/navigation/mainTabsShared';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type HistoryScreenProps = CompositeScreenProps<
  NativeBottomTabScreenProps<MainTabParamList, 'History'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HistoryScreen({ navigation }: HistoryScreenProps) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const { profile } = useUserProfile();
  const { workouts, deleteWorkout } = useWorkoutHistory();
  const earliest = useMemo(() => {
    const oldest = workouts[workouts.length - 1];
    return oldest === undefined
      ? ''
      : new Date(oldest.startedAt).toLocaleDateString(i18n.language, {
          month: 'long',
          year: 'numeric',
        });
  }, [i18n.language, workouts]);

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
        <ScreenHeader
          title={t('history.title')}
          subtitle={
            workouts.length === 0
              ? t('history.headerEmpty')
              : t('history.headerState', {
                  count: workouts.length,
                  since: earliest,
                })
          }
          trailing={<ProfileAvatarButton />}
        />

        <SearchInput
          accessibilityLabel={t('history.searchA11y')}
          placeholder={t('history.searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <WorkoutHistoryList
          deletable
          workouts={filteredWorkouts}
          weightUnit={profile.weightUnit}
          hasSearchQuery={searchQuery.trim().length > 0}
          onWorkoutPress={workoutId =>
            navigation.navigate('CompletedWorkout', { workoutId })
          }
          onWorkoutDelete={deleteWorkout}
        />

        <TabBarInsetSpacer />
      </ScrollView>
    </AppShell>
  );
}
