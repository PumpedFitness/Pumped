import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppView } from '@/components/layout/AppView';
import { CreateExerciseForm } from './components/CreateExerciseForm';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type CreateExerciseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CreateExercise'
>;

export function CreateExerciseScreen({
  navigation,
}: CreateExerciseScreenProps) {
  return (
    <AppView edges={['top']}>
      <CreateExerciseForm
        onCancel={() => navigation.goBack()}
        onSave={() => navigation.goBack()}
      />
    </AppView>
  );
}
