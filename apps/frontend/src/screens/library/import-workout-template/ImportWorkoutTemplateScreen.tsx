import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { SearchInput } from '@/components/forms/SearchInput';
import { AppView } from '@/components/layout/AppView';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { WorkoutHistoryList } from '@/screens/history/components/WorkoutHistoryList';

type ImportWorkoutTemplateScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ImportWorkoutTemplate'
>;

export function ImportWorkoutTemplateScreen({
  navigation,
}: ImportWorkoutTemplateScreenProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const { profile } = useUserProfile();
  const { workouts } = useWorkoutHistory();

  const filteredWorkouts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    if (!query) {
      return workouts;
    }

    return workouts.filter(workout => {
      const name = workout.name.toLocaleLowerCase();
      const notes = workout.notes?.toLocaleLowerCase() ?? '';

      return name.includes(query) || notes.includes(query);
    });
  }, [searchQuery, workouts]);

  return (
    <AppView edges={['top', 'bottom']}>
      <ScreenHeader
        title={t('templateImport.title')}
        onBack={() => navigation.goBack()}
      />
      <View className="mx-5 mt-2">
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('templateImport.searchPlaceholder')}
          accessibilityLabel={t('templateImport.searchA11y')}
        />
      </View>
      <View className="flex-1">
        <WorkoutHistoryList
          workouts={filteredWorkouts}
          weightUnit={profile.weightUnit}
          onWorkoutPress={workoutId =>
            navigation.popTo('WorkoutTemplateEditor', {
              importWorkoutId: workoutId,
            })
          }
          hasSearchQuery={searchQuery.trim().length > 0}
        />
      </View>
    </AppView>
  );
}
