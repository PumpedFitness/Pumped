import { useCallback, useMemo } from 'react';
import { i18n } from '@/i18n';
import {
  getWorkoutTemplate,
  saveWorkoutTemplate,
} from '@/data/local/workouts/templates';
import { saveCompletedWorkout } from '@/data/local/workouts/sessions';
import { getSetTypeFieldDefs } from '@/data/local/sets/setTypes';
import { useTableQuery } from '@/data/local/tableVersions';
import {
  workoutTemplateExercises,
  workoutTemplateSets,
  workoutTemplates,
} from '@/data/local/schema';
import {
  buildTemplateSyncInput,
  hasWorkoutStructureChanged,
  isCurrentWorkoutComplete,
  requireCurrentWorkout,
} from '@/stores/currentWorkoutModel';
import { useCurrentWorkoutStore } from '@/stores/currentWorkoutStore';
import { useExerciseOptions } from './useExerciseOptions';

type FinishCurrentWorkoutInput = {
  updateTemplate?: boolean;
};

export function useCurrentWorkout() {
  const currentWorkout = useCurrentWorkoutStore(state => state.currentWorkout);
  const startWorkout = useCurrentWorkoutStore(state => state.startWorkout);
  const discardWorkout = useCurrentWorkoutStore(state => state.discardWorkout);
  const updateSet = useCurrentWorkoutStore(state => state.updateSet);
  const toggleSetDoneAction = useCurrentWorkoutStore(
    state => state.toggleSetDone,
  );
  const addSet = useCurrentWorkoutStore(state => state.addSet);
  const removeSet = useCurrentWorkoutStore(state => state.removeSet);
  const updateExercises = useCurrentWorkoutStore(
    state => state.updateExercises,
  );
  const removeExercise = useCurrentWorkoutStore(state => state.removeExercise);
  const exerciseOptions = useExerciseOptions();
  const sourceTemplate = useTableQuery(
    [workoutTemplates, workoutTemplateExercises, workoutTemplateSets],
    () =>
      currentWorkout
        ? getWorkoutTemplate(currentWorkout.workoutTemplateId)
        : null,
    [currentWorkout],
  );

  // Resolve the set's type fields (built-in or custom) before delegating to the
  // store, which gates completion on them. Keeps DB reads out of the store.
  const toggleSetDone = useCallback(
    (exerciseId: string, setId: string) => {
      const workout = useCurrentWorkoutStore.getState().currentWorkout;
      const set = workout?.exercises
        .find(exercise => exercise.id === exerciseId)
        ?.sets.find(item => item.id === setId);
      const fields = set ? getSetTypeFieldDefs(set.setType) : [];
      return toggleSetDoneAction(exerciseId, setId, fields);
    },
    [toggleSetDoneAction],
  );

  const startTemplateWorkout = useCallback(
    (workoutTemplateId: string) => {
      if (useCurrentWorkoutStore.getState().currentWorkout) {
        throw new Error(i18n.t('errors.workoutAlreadyInProgress'));
      }
      const template = getWorkoutTemplate(workoutTemplateId);
      if (!template) {
        throw new Error(i18n.t('errors.templateNotFound'));
      }
      startWorkout(template);
    },
    [startWorkout],
  );

  const finishWorkout = useCallback(
    (input?: FinishCurrentWorkoutInput) => {
      const workout = requireCurrentWorkout(
        useCurrentWorkoutStore.getState().currentWorkout,
      );
      if (!isCurrentWorkoutComplete(workout, getSetTypeFieldDefs)) {
        throw new Error(i18n.t('errors.completeEverySet'));
      }
      if (input?.updateTemplate) {
        const template = getWorkoutTemplate(workout.workoutTemplateId);
        if (!template) {
          throw new Error(i18n.t('errors.templateNotFound'));
        }
        saveWorkoutTemplate(buildTemplateSyncInput(workout, template));
      }
      saveCompletedWorkout({
        id: workout.id,
        workoutTemplateId: workout.workoutTemplateId,
        name: workout.name,
        startedAt: workout.startedAt,
        endedAt: Date.now(),
        notes: null,
        sets: workout.exercises.flatMap(exercise =>
          exercise.sets.map(set => ({
            exerciseId: exercise.exerciseId,
            exercisePosition: exercise.position,
            setPosition: set.position,
            setType: set.setType,
            restSeconds: set.restSeconds,
            fieldValues: set.fieldValues,
            performedAt: set.performedAt ?? Date.now(),
          })),
        ),
      });
      discardWorkout();
    },
    [discardWorkout],
  );

  const canFinish = useMemo(
    () =>
      currentWorkout
        ? isCurrentWorkoutComplete(currentWorkout, getSetTypeFieldDefs)
        : false,
    [currentWorkout],
  );
  const structureChanged = useMemo(
    () =>
      currentWorkout
        ? hasWorkoutStructureChanged(currentWorkout, sourceTemplate)
        : false,
    [currentWorkout, sourceTemplate],
  );

  return {
    currentWorkout,
    exerciseOptions,
    startTemplateWorkout,
    discardWorkout,
    finishWorkout,
    updateSet,
    toggleSetDone,
    addSet,
    removeSet,
    updateExercises,
    removeExercise,
    canFinish,
    structureChanged,
  };
}
