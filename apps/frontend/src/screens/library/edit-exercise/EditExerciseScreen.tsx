import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { AppView } from '@/components/layout/AppView';
import { SegmentedControl } from '@/components/clay/SegmentedControl';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';
import { useRepository } from '@/data/local/useRepository';
import { exercises } from '@/data/local/schema';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useExerciseAnalytics } from '@/hooks/useExerciseAnalytics';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useExerciseOptions } from '@/hooks/useExerciseOptions';
import { ExerciseForm } from '@/components/exercise/ExerciseForm.tsx';
import { DashboardTab } from './components/DashboardTab';
import { SummaryTab } from './components/SummaryTab';
import { HistoryTab } from './components/HistoryTab';

type EditExerciseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditExercise'
>;

type ExerciseTab = 'dashboard' | 'summary' | 'history';

export function EditExerciseScreen({
  navigation,
  route,
}: EditExerciseScreenProps) {
  const { t } = useTranslation();
  const repo = useRepository(exercises);
  const exercise = repo.getById(route.params.exerciseId);
  const [isEditing, setIsEditing] = useState(false);
  const [tab, setTab] = useState<ExerciseTab>('dashboard');
  const { profile } = useUserProfile();
  const analytics = useExerciseAnalytics(route.params.exerciseId);
  const exerciseOption = useExerciseOptions().find(
    option => option.id === route.params.exerciseId,
  );
  const muscleGroupNames = exerciseOption?.muscleGroupNames ?? [];

  // When the exercise disappears (e.g. it was deleted), leave the screen —
  // outside of render, and only once.
  const didGoBack = useRef(false);
  useEffect(() => {
    if (!exercise && !didGoBack.current) {
      didGoBack.current = true;
      navigation.goBack();
    }
  }, [exercise, navigation]);

  if (!exercise) {
    return null;
  }

  if (isEditing) {
    return (
      <AppView edges={['top']}>
        <ExerciseForm
          exercise={exercise}
          onCancel={() => setIsEditing(false)}
          onSaved={() => setIsEditing(false)}
        />
      </AppView>
    );
  }

  return (
    <AppView edges={['top']}>
      <ScreenHeader
        title={exercise.name}
        onBack={() => navigation.goBack()}
        backAccessibilityLabel={t('exerciseOverview.backA11y')}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('exerciseOverview.editA11y')}
            onPress={() => setIsEditing(true)}
            className="h-9 w-9 items-center justify-center rounded-full bg-accent-soft active:opacity-70"
          >
            <ClayIcon name="edit" size={17} color={colors.accent} />
          </Pressable>
        }
      />

      <View className="px-4 pb-3 pt-3">
        <SegmentedControl
          value={tab}
          onChange={value => setTab(value as ExerciseTab)}
          options={[
            { value: 'dashboard', label: t('exerciseOverview.tabs.dashboard') },
            { value: 'summary', label: t('exerciseOverview.tabs.summary') },
            { value: 'history', label: t('exerciseOverview.tabs.history') },
          ]}
        />
      </View>

      {tab === 'dashboard' ? (
        <DashboardTab analytics={analytics} weightUnit={profile.weightUnit} />
      ) : null}
      {tab === 'summary' ? (
        <SummaryTab
          picture={exercise.picture}
          description={exercise.description}
          howTo={exercise.howTo}
          createdAt={exercise.createdAt}
          typeName={exerciseOption?.typeName ?? null}
          muscleGroupNames={muscleGroupNames}
        />
      ) : null}
      {tab === 'history' ? (
        <HistoryTab
          exerciseName={exercise.name}
          history={analytics.history}
          weightUnit={profile.weightUnit}
          onOpenWorkout={workoutId =>
            navigation.navigate('CompletedWorkout', { workoutId })
          }
        />
      ) : null}
    </AppView>
  );
}
