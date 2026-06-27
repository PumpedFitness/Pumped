import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import { useProgressionSuggestion } from '@/hooks/useProgressionSuggestion';
import type {
  CurrentWorkoutExercise,
  CurrentWorkoutSet,
  UpdateCurrentWorkoutSetInput,
} from '@/stores/currentWorkoutModel';
import type { SetTypeWithFields } from '@/types/setType';
import type { WorkoutTemplateExercise } from '@/types/workout';
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

function fallbackTemplateExercise(
  exercise: CurrentWorkoutExercise,
): WorkoutTemplateExercise {
  return {
    id: exercise.sourceTemplateExerciseId ?? exercise.id,
    exerciseId: exercise.exerciseId,
    position: exercise.position,
    typeId: null,
    color: exercise.color,
    goal: exercise.goal,
    notes: exercise.notes,
    sets: exercise.sets.map(set => ({
      id: set.sourceTemplateSetId ?? set.id,
      position: set.position,
      setType: set.setType,
      restSeconds: set.restSeconds,
      progressionGoal: set.progressionGoal,
      fieldValues: [],
    })),
  };
}

function effectiveTemplateExercise(
  exercise: CurrentWorkoutExercise,
): WorkoutTemplateExercise {
  const source = exercise.sourceTemplateExercise;
  if (!source) {
    return fallbackTemplateExercise(exercise);
  }
  const sourceSets = new Map(source.sets.map(set => [set.id, set] as const));
  return {
    ...source,
    sets: exercise.sets.map(set => {
      const sourceSet = set.sourceTemplateSetId
        ? sourceSets.get(set.sourceTemplateSetId)
        : null;
      return {
        id: sourceSet?.id ?? set.sourceTemplateSetId ?? set.id,
        position: set.position,
        setType: set.setType,
        restSeconds: sourceSet?.restSeconds ?? set.restSeconds,
        progressionGoal: set.progressionGoal ?? sourceSet?.progressionGoal,
        fieldValues: sourceSet?.fieldValues ?? [],
      };
    }),
  };
}

function repeatSuggestedSets<T>(sets: T[], count: number): T[] {
  if (sets.length >= count) {
    return sets.slice(0, count);
  }
  const lastSet = sets[sets.length - 1];
  if (!lastSet) {
    return [];
  }
  return Array.from({ length: count }, (_, index) => sets[index] ?? lastSet);
}

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
  const progression = useProgressionSuggestion({
    exerciseId: exercise.exerciseId,
    templateExercise: effectiveTemplateExercise(exercise),
  });
  const suggestedSets = useMemo(
    () => repeatSuggestedSets(progression.suggestedSets, exercise.sets.length),
    [exercise.sets.length, progression.suggestedSets],
  );

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
    <>
      <ExerciseSetTable
        sets={exercise.sets}
        suggestedSets={suggestedSets}
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
    </>
  );
});
