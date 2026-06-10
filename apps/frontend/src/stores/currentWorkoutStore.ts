import { randomUUID } from 'expo-crypto';
import { create, type StateCreator } from 'zustand';
import { workoutService } from '../data/local/services';
import { uniqueStrings } from '../utils/dedupe';
import {
  createCurrentWorkoutExercise,
  createCurrentWorkoutSet,
  createTemplateSnapshot,
  isCurrentWorkoutComplete,
  isCurrentWorkoutSetValid,
  normalizeCurrentWorkoutExercises,
  requireCurrentWorkout,
  syncCurrentWorkoutTemplateStructure,
  updateCurrentWorkoutExercise,
  type CurrentWorkout,
  type UpdateCurrentWorkoutSetInput,
} from './currentWorkoutModel';

type FinishCurrentWorkoutInput = {
  updateTemplate?: boolean;
};

type CurrentWorkoutState = {
  currentWorkout: CurrentWorkout | null;
  startWorkout: (workoutTemplateId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    values: UpdateCurrentWorkoutSetInput,
  ) => void;
  toggleSetDone: (exerciseId: string, setId: string) => boolean;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateExercises: (exerciseIds: string[]) => void;
  removeExercise: (exerciseId: string) => void;
  discardWorkout: () => void;
  finishWorkout: (input?: FinishCurrentWorkoutInput) => void;
};

type StoreSet = Parameters<StateCreator<CurrentWorkoutState>>[0];
type StoreGet = Parameters<StateCreator<CurrentWorkoutState>>[1];

function startWorkout(
  setState: StoreSet,
  getState: StoreGet,
  workoutTemplateId: string,
) {
  if (getState().currentWorkout) {
    throw new Error('A workout is already in progress');
  }
  const template = workoutService.getWorkoutTemplate(workoutTemplateId);
  if (!template) {
    throw new Error('Workout template not found');
  }
  const currentWorkout: CurrentWorkout = {
    id: randomUUID(),
    workoutTemplateId,
    name: template.name,
    startedAt: Date.now(),
    exercises: createTemplateSnapshot(template),
  };
  setState({ currentWorkout });
}

function updateWorkoutSet(
  setState: StoreSet,
  getState: StoreGet,
  exerciseId: string,
  setId: string,
  values: UpdateCurrentWorkoutSetInput,
) {
  const workout = requireCurrentWorkout(getState().currentWorkout);
  setState({
    currentWorkout: updateCurrentWorkoutExercise(
      workout,
      exerciseId,
      exercise => ({
        ...exercise,
        sets: exercise.sets.map(set =>
          set.id === setId ? { ...set, ...values } : set,
        ),
      }),
    ),
  });
}

function toggleWorkoutSetDone(
  setState: StoreSet,
  getState: StoreGet,
  exerciseId: string,
  setId: string,
): boolean {
  const workout = requireCurrentWorkout(getState().currentWorkout);
  const exercise = workout.exercises.find(item => item.id === exerciseId);
  const workoutSet = exercise?.sets.find(set => set.id === setId);
  if (!workoutSet) {
    return false;
  }
  if (!workoutSet.isDone && !isCurrentWorkoutSetValid(workoutSet)) {
    return false;
  }
  setState({
    currentWorkout: updateCurrentWorkoutExercise(
      workout,
      exerciseId,
      current => ({
        ...current,
        sets: current.sets.map(set =>
          set.id === setId
            ? {
                ...set,
                isDone: !set.isDone,
                performedAt: set.isDone ? null : Date.now(),
              }
            : set,
        ),
      }),
    ),
  });
  return true;
}

function addWorkoutSet(
  setState: StoreSet,
  getState: StoreGet,
  exerciseId: string,
) {
  const workout = requireCurrentWorkout(getState().currentWorkout);
  setState({
    currentWorkout: updateCurrentWorkoutExercise(
      workout,
      exerciseId,
      exercise => ({
        ...exercise,
        sets: [...exercise.sets, createCurrentWorkoutSet(exercise.sets.length)],
      }),
    ),
  });
}

function removeWorkoutSet(
  setState: StoreSet,
  getState: StoreGet,
  exerciseId: string,
  setId: string,
) {
  const workout = requireCurrentWorkout(getState().currentWorkout);
  const exercise = workout.exercises.find(item => item.id === exerciseId);
  if (!exercise?.sets.some(set => set.id === setId)) {
    return;
  }
  if (exercise.sets.length === 1) {
    setState({
      currentWorkout: {
        ...workout,
        exercises: normalizeCurrentWorkoutExercises(
          workout.exercises.filter(item => item.id !== exerciseId),
        ),
      },
    });
    return;
  }

  setState({
    currentWorkout: updateCurrentWorkoutExercise(
      workout,
      exerciseId,
      current => ({
        ...current,
        sets: current.sets
          .filter(set => set.id !== setId)
          .map((set, position) => ({ ...set, position })),
      }),
    ),
  });
}

function selectWorkoutExercises(
  setState: StoreSet,
  getState: StoreGet,
  exerciseIds: string[],
) {
  const workout = requireCurrentWorkout(getState().currentWorkout);
  const uniqueExerciseIds = uniqueStrings(exerciseIds);
  const currentByExerciseId = new Map(
    workout.exercises.map(exercise => [exercise.exerciseId, exercise]),
  );
  setState({
    currentWorkout: {
      ...workout,
      exercises: normalizeCurrentWorkoutExercises(
        uniqueExerciseIds.map(
          (exerciseId, position) =>
            currentByExerciseId.get(exerciseId) ??
            createCurrentWorkoutExercise(exerciseId, position),
        ),
      ),
    },
  });
}

function removeWorkoutExercise(
  setState: StoreSet,
  getState: StoreGet,
  exerciseId: string,
) {
  const workout = requireCurrentWorkout(getState().currentWorkout);
  setState({
    currentWorkout: {
      ...workout,
      exercises: normalizeCurrentWorkoutExercises(
        workout.exercises.filter(exercise => exercise.id !== exerciseId),
      ),
    },
  });
}

function finishCurrentWorkout(
  setState: StoreSet,
  getState: StoreGet,
  input?: FinishCurrentWorkoutInput,
) {
  const workout = requireCurrentWorkout(getState().currentWorkout);
  if (!isCurrentWorkoutComplete(workout)) {
    throw new Error('Complete every set before finishing the workout');
  }
  if (input?.updateTemplate) {
    syncCurrentWorkoutTemplateStructure(workout);
  }
  workoutService.saveCompletedWorkout({
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
        reps: set.reps!,
        weight: set.weight,
        rpe: set.rpe,
        performedAt: set.performedAt ?? Date.now(),
      })),
    ),
  });
  setState({ currentWorkout: null });
}

export const useCurrentWorkoutStore = create<CurrentWorkoutState>(
  (setState, getState) => ({
    currentWorkout: null,
    startWorkout: workoutTemplateId =>
      startWorkout(setState, getState, workoutTemplateId),
    updateSet: (exerciseId, setId, values) =>
      updateWorkoutSet(setState, getState, exerciseId, setId, values),
    toggleSetDone: (exerciseId, setId) =>
      toggleWorkoutSetDone(setState, getState, exerciseId, setId),
    addSet: exerciseId => addWorkoutSet(setState, getState, exerciseId),
    removeSet: (exerciseId, setId) =>
      removeWorkoutSet(setState, getState, exerciseId, setId),
    updateExercises: exerciseIds =>
      selectWorkoutExercises(setState, getState, exerciseIds),
    removeExercise: exerciseId =>
      removeWorkoutExercise(setState, getState, exerciseId),
    discardWorkout: () => setState({ currentWorkout: null }),
    finishWorkout: input => finishCurrentWorkout(setState, getState, input),
  }),
);
