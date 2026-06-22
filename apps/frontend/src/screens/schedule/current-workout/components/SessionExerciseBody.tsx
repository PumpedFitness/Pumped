import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type {
  CurrentWorkoutExercise,
  CurrentWorkoutSet,
  UpdateCurrentWorkoutSetInput,
} from '@/stores/currentWorkoutModel';
import type { SetTypeWithFields } from '@/types/setType';
import {
  ExerciseSetTable,
  type SetTypeOption,
} from '@/components/exercise/set-table';
import { requestRemoveSet } from './currentWorkoutConfirm';

type SessionExerciseBodyProps = {
  exercise: CurrentWorkoutExercise;
  weightUnit: WeightUnit;
  setTypeOptions: SetTypeOption[];
  setTypesById: Map<string, SetTypeWithFields>;
  onCreateSetType: (name: string) => string;
  // Stable top-level actions. Binding the per-exercise/per-set callbacks here
  // (rather than inline in the list) is what lets this component memoize: an
  // edit to one exercise re-renders only its body, not the whole session.
  updateSet: (
    exerciseId: string,
    setId: string,
    values: UpdateCurrentWorkoutSetInput,
  ) => void;
  toggleSetDone: (exerciseId: string, setId: string) => boolean;
  restStart: (seconds: number) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  addSet: (exerciseId: string) => void;
};

export const SessionExerciseBody = memo(function SessionExerciseBody({
  exercise,
  weightUnit,
  setTypeOptions,
  setTypesById,
  onCreateSetType,
  updateSet,
  toggleSetDone,
  restStart,
  removeSet,
  addSet,
}: SessionExerciseBodyProps) {
  const { t } = useTranslation();

  const handleChangeSet = useCallback(
    (setId: string, values: UpdateCurrentWorkoutSetInput) =>
      updateSet(exercise.id, setId, values),
    [updateSet, exercise.id],
  );
  const handleAddSet = useCallback(
    () => addSet(exercise.id),
    [addSet, exercise.id],
  );
  // Capture the set's pre-toggle state so we know it became done (not undone)
  // and what rest to seed — the toggle itself only returns a success boolean.
  const handleToggleSetDone = useCallback(
    (setId: string) => {
      const set = exercise.sets.find(item => item.id === setId);
      const wasDone = set?.isDone ?? false;
      const ok = toggleSetDone(exercise.id, setId);
      if (ok && !wasDone && set?.restSeconds && set.restSeconds > 0) {
        restStart(set.restSeconds);
      }
      return ok;
    },
    [exercise, toggleSetDone, restStart],
  );
  const handleRemoveSet = useCallback(
    (set: CurrentWorkoutSet) => requestRemoveSet(t, exercise, set, removeSet),
    [t, exercise, removeSet],
  );

  return (
    <ExerciseSetTable
      sets={exercise.sets}
      setTypeOptions={setTypeOptions}
      setTypesById={setTypesById}
      weightUnit={weightUnit}
      onCreateSetType={onCreateSetType}
      onAddSet={handleAddSet}
      onChangeSet={handleChangeSet}
      onToggleSetDone={handleToggleSetDone}
      onRemoveSet={handleRemoveSet}
      animateLayout={false}
    />
  );
});
