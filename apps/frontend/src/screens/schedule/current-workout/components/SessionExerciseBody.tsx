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
import {
  ExerciseSetTable,
  type SetTypeOption,
} from '@/components/exercise/set-table';
import { requestRemoveSet } from './currentWorkoutConfirm';
import { effectiveTemplateExercise } from './sessionTemplateExercise';

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
  onSetLogged: (restSeconds: number, sourceSetId?: string) => void;
  activeRestSetId: string | null;
  removeSet: (exerciseId: string, setId: string) => void;
  addSet: (exerciseId: string) => void;
  // Set for a superset member. `currentSetId` is decided by the block, which is
  // the only place that knows the round-major order; `addSetLabel` reads
  // "Add round" because a set here is one round for the whole group.
  currentSetId?: string | null;
  addSetLabel?: string;
  /** Hidden on every superset member but the last: one button adds a round to
   *  the whole group, so repeating it under each exercise reads as a choice
   *  that isn't there. */
  hideAddSet?: boolean;
  /** How many exercises share this member's superset; drives the round-removal
   *  confirmation. Passed as a number, not a resolver, so memo still holds. */
  supersetMemberCount?: number;
};

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
  onSetLogged,
  activeRestSetId,
  removeSet,
  addSet,
  currentSetId,
  addSetLabel,
  hideAddSet,
  supersetMemberCount,
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
  // and what rest it carries — the toggle itself only returns a success
  // boolean. Whether that rest actually starts is decided upstream.
  const handleToggleSetDone = useCallback(
    (setId: string) => {
      const set = exercise.sets.find(item => item.id === setId);
      const wasDone = set?.isDone ?? false;
      const ok = toggleSetDone(exercise.id, setId);
      if (ok && !wasDone && set?.restSeconds && set.restSeconds > 0) {
        onSetLogged(set.restSeconds, set.id);
      }
      return ok;
    },
    [exercise, toggleSetDone, onSetLogged],
  );
  const handleRemoveSet = useCallback(
    (set: CurrentWorkoutSet) =>
      requestRemoveSet(t, exercise, set, removeSet, supersetMemberCount),
    [t, exercise, removeSet, supersetMemberCount],
  );

  return (
    <>
      <ExerciseSetTable
        sets={exercise.sets}
        suggestedSets={suggestedSets}
        setTypeOptions={setTypeOptions}
        setTypesById={setTypesById}
        weightUnit={weightUnit}
        currentSetId={currentSetId}
        addSetLabel={addSetLabel}
        onCreateSetType={onCreateSetType}
        onAddSet={hideAddSet ? undefined : handleAddSet}
        onChangeSet={handleChangeSet}
        onToggleSetDone={handleToggleSetDone}
        onRemoveSet={handleRemoveSet}
        activeRestSetId={activeRestSetId}
        animateLayout={false}
        iconOnlySetType
      />
    </>
  );
});
