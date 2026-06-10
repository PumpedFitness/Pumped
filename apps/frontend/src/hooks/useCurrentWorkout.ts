import { useMemo } from 'react';
import {
  hasWorkoutStructureChanged,
  isCurrentWorkoutComplete,
  type StartCurrentWorkoutInput,
} from '../stores/currentWorkoutModel';
import { useCurrentWorkoutStore } from '../stores/currentWorkoutStore';
import { useExerciseOptions } from './useExerciseOptions';

export function useCurrentWorkout() {
  const currentWorkout = useCurrentWorkoutStore(state => state.currentWorkout);
  const startWorkout = useCurrentWorkoutStore(state => state.startWorkout);
  const discardWorkout = useCurrentWorkoutStore(state => state.discardWorkout);
  const finishWorkout = useCurrentWorkoutStore(state => state.finishWorkout);
  const updateSet = useCurrentWorkoutStore(state => state.updateSet);
  const toggleSetDone = useCurrentWorkoutStore(state => state.toggleSetDone);
  const addSet = useCurrentWorkoutStore(state => state.addSet);
  const removeSet = useCurrentWorkoutStore(state => state.removeSet);
  const updateExercises = useCurrentWorkoutStore(
    state => state.updateExercises,
  );
  const removeExercise = useCurrentWorkoutStore(state => state.removeExercise);
  const updateWorkout = useCurrentWorkoutStore(state => state.updateWorkout);
  const exerciseOptions = useExerciseOptions();
  const canFinish = useMemo(
    () => (currentWorkout ? isCurrentWorkoutComplete(currentWorkout) : false),
    [currentWorkout],
  );
  const structureChanged = useMemo(
    () => (currentWorkout ? hasWorkoutStructureChanged(currentWorkout) : false),
    [currentWorkout],
  );

  const startTemplateWorkout = (templateId: string) =>
    startWorkout({ workoutTemplateId: templateId });

  const startEmptyWorkout = (
    input?: Omit<StartCurrentWorkoutInput, 'workoutTemplateId'>,
  ) => startWorkout(input);

  return {
    currentWorkout,
    exerciseOptions,
    startTemplateWorkout,
    startEmptyWorkout,
    discardWorkout,
    finishWorkout,
    updateSet,
    toggleSetDone,
    addSet,
    removeSet,
    updateExercises,
    removeExercise,
    updateWorkout,
    canFinish,
    structureChanged,
  };
}
