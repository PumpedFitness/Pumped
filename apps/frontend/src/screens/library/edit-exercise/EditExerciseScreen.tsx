import { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { AppView } from '@/components/layout/AppView';
import { useRepository } from '@/data/local/useRepository';
import { exercises } from '@/data/local/schema';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useExerciseAnalytics } from '@/hooks/useExerciseAnalytics';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ExerciseAnalyticsSection } from './components/ExerciseAnalyticsSection';
import { ExerciseDetailsSection } from './components/ExerciseDetailsSection';
import { ExerciseHistorySection } from './components/ExerciseHistorySection';
import { ExerciseOverviewHeader } from './components/ExerciseOverviewHeader';
import { ExercisePrSection } from './components/ExercisePrSection';
import { ExerciseForm } from '@/components/exercise/ExerciseForm.tsx';

type EditExerciseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditExercise'
>;

export function EditExerciseScreen({
  navigation,
  route,
}: EditExerciseScreenProps) {
  const { t } = useTranslation();
  const repo = useRepository(exercises);
  const exercise = repo.getById(route.params.exerciseId);
  const [isEditing, setIsEditing] = useState(false);
  const { profile } = useUserProfile();
  const analytics = useExerciseAnalytics(route.params.exerciseId);

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
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-8 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <ExerciseOverviewHeader
          exercise={exercise}
          onEdit={() => setIsEditing(true)}
        />
        <ExerciseDetailsSection
          exercise={exercise}
          historyCount={analytics.history.length}
        />
        <ExerciseAnalyticsSection
          chartData={analytics.chartData}
          weightUnit={profile.weightUnit}
        />
        <ExercisePrSection
          prs={analytics.prs}
          weightUnit={profile.weightUnit}
        />
        <ExerciseHistorySection
          history={analytics.history}
          weightUnit={profile.weightUnit}
          onOpenWorkout={workoutId =>
            navigation.navigate('CompletedWorkout', { workoutId })
          }
        />
      </ScrollView>
    </AppView>
  );
}
