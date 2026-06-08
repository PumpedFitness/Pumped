import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppView } from '../../components/AppView';
import { ExerciseForm } from '../../components/exercise/ExerciseForm';
import { useRepository } from '../../data/local/useRepository';
import { exercises } from '../../data/local/schema';
import type { RootStackParamList } from '../../navigation/AppNavigator';

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

  if (!exercise) {
    navigation.goBack();
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
