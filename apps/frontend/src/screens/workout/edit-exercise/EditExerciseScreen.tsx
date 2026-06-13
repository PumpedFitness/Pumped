import { useEffect, useRef } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppView } from '@/components/layout/AppView';
import { ExerciseForm } from '@/components/exercise/ExerciseForm';
import { useRepository } from '@/data/local/useRepository';
import { exercises } from '@/data/local/schema';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type EditExerciseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditExercise'
>;

export function EditExerciseScreen({
  navigation,
  route,
}: EditExerciseScreenProps) {
  const repo = useRepository(exercises);
  const exercise = repo.getById(route.params.exerciseId);

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

  return (
    <AppView edges={['top']}>
      <ExerciseForm
        exercise={exercise}
        onCancel={() => navigation.goBack()}
        onSaved={() => navigation.goBack()}
      />
    </AppView>
  );
}
