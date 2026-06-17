import { ExerciseForm } from '@/components/exercise/ExerciseForm';

type CreateExerciseFormProps = {
  onCancel: () => void;
  onSave: (exerciseId: string) => void;
};

export function CreateExerciseForm({
  onCancel,
  onSave,
}: CreateExerciseFormProps) {
  return <ExerciseForm onCancel={onCancel} onSaved={onSave} />;
}
