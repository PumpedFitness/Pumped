import { randomUUID } from 'expo-crypto';
import type { WorkoutSetType } from '../data/local/enums';
import { workoutService } from '../data/local/services';
import type { WorkoutTemplate } from '../types/workout';
import { uniqueBy } from '../utils/dedupe';

export type CurrentWorkoutSet = {
  id: string;
  sourceTemplateSetId: string | null;
  position: number;
  setType: WorkoutSetType;
  targetReps: number | null;
  targetPercentage1Rm: number | null;
  targetRpe: number | null;
  reps: number | null;
  weight: number | null;
  rpe: number | null;
  isDone: boolean;
  performedAt: number | null;
};

export type CurrentWorkoutExercise = {
  id: string;
  sourceTemplateExerciseId: string | null;
  exerciseId: string;
  position: number;
  goal: string | null;
  notes: string | null;
  sets: CurrentWorkoutSet[];
};

export type CurrentWorkout = {
  id: string;
  workoutTemplateId: string | null;
  name: string;
  startedAt: number;
  notes: string | null;
  exercises: CurrentWorkoutExercise[];
};

export type StartCurrentWorkoutInput = {
  workoutTemplateId?: string | null;
  name?: string;
  notes?: string | null;
  startedAt?: number;
};

export type UpdateCurrentWorkoutSetInput = Partial<
  Pick<CurrentWorkoutSet, 'weight' | 'reps' | 'rpe' | 'setType'>
>;

export function createCurrentWorkoutSet(
  position: number,
  setType: WorkoutSetType = 'NORMAL',
): CurrentWorkoutSet {
  return {
    id: randomUUID(),
    sourceTemplateSetId: null,
    position,
    setType,
    targetReps: null,
    targetPercentage1Rm: null,
    targetRpe: null,
    reps: null,
    weight: null,
    rpe: null,
    isDone: false,
    performedAt: null,
  };
}

export function createCurrentWorkoutExercise(
  exerciseId: string,
  position: number,
): CurrentWorkoutExercise {
  return {
    id: randomUUID(),
    sourceTemplateExerciseId: null,
    exerciseId,
    position,
    goal: null,
    notes: null,
    sets: [
      createCurrentWorkoutSet(0),
      createCurrentWorkoutSet(1),
      createCurrentWorkoutSet(2),
    ],
  };
}

export function createTemplateSnapshot(
  template: WorkoutTemplate | null,
): CurrentWorkoutExercise[] {
  return uniqueBy(
    template?.exercises ?? [],
    exercise => exercise.exerciseId,
  ).map(exercise => ({
    id: randomUUID(),
    sourceTemplateExerciseId: exercise.id,
    exerciseId: exercise.exerciseId,
    position: exercise.position,
    goal: exercise.goal,
    notes: exercise.notes,
    sets: exercise.sets.map(set => ({
      id: randomUUID(),
      sourceTemplateSetId: set.id,
      position: set.position,
      setType: set.setType,
      targetReps: set.targetReps,
      targetPercentage1Rm: set.targetPercentage1Rm,
      targetRpe: set.targetRpe,
      reps: set.targetReps,
      weight: null,
      rpe: null,
      isDone: false,
      performedAt: null,
    })),
  }));
}

export function normalizeCurrentWorkoutExercises(
  exercises: CurrentWorkoutExercise[],
): CurrentWorkoutExercise[] {
  return exercises.map((exercise, exercisePosition) => ({
    ...exercise,
    position: exercisePosition,
    sets: exercise.sets.map((set, setPosition) => ({
      ...set,
      position: setPosition,
    })),
  }));
}

export function requireCurrentWorkout(
  currentWorkout: CurrentWorkout | null,
): CurrentWorkout {
  if (!currentWorkout) {
    throw new Error('No workout is in progress');
  }
  return currentWorkout;
}

export function updateCurrentWorkoutExercise(
  workout: CurrentWorkout,
  exerciseId: string,
  update: (exercise: CurrentWorkoutExercise) => CurrentWorkoutExercise,
): CurrentWorkout {
  return {
    ...workout,
    exercises: workout.exercises.map(exercise =>
      exercise.id === exerciseId ? update(exercise) : exercise,
    ),
  };
}

export function syncCurrentWorkoutTemplateStructure(
  workout: CurrentWorkout,
): void {
  if (!workout.workoutTemplateId) {
    return;
  }
  const template = workoutService.getWorkoutTemplate(workout.workoutTemplateId);
  if (!template) {
    throw new Error('Workout template not found');
  }
  const sourceSets = new Map(
    template.exercises.flatMap(exercise =>
      exercise.sets.map(set => [set.id, set] as const),
    ),
  );
  workoutService.saveWorkoutTemplate({
    id: template.id,
    name: template.name,
    description: template.description,
    status: template.status,
    color: template.color,
    schedule: template.schedule,
    exercises: workout.exercises.map(exercise => ({
      exerciseId: exercise.exerciseId,
      goal: exercise.goal,
      notes: exercise.notes,
      sets: exercise.sets.map(set => {
        const source = set.sourceTemplateSetId
          ? sourceSets.get(set.sourceTemplateSetId)
          : null;
        return {
          setType: set.setType,
          targetReps: source?.targetReps ?? null,
          targetPercentage1Rm: source?.targetPercentage1Rm ?? null,
          targetRpe: source?.targetRpe ?? null,
        };
      }),
    })),
  });
}

export function hasWorkoutStructureChanged(workout: CurrentWorkout): boolean {
  if (!workout.workoutTemplateId) {
    return false;
  }
  const template = workoutService.getWorkoutTemplate(workout.workoutTemplateId);
  if (!template || template.exercises.length !== workout.exercises.length) {
    return true;
  }
  return workout.exercises.some((exercise, exerciseIndex) => {
    const sourceExercise = template.exercises[exerciseIndex];
    return (
      !sourceExercise ||
      exercise.sourceTemplateExerciseId !== sourceExercise.id ||
      exercise.exerciseId !== sourceExercise.exerciseId ||
      exercise.sets.length !== sourceExercise.sets.length ||
      exercise.sets.some((set, setIndex) => {
        const sourceSet = sourceExercise.sets[setIndex];
        return (
          !sourceSet ||
          set.sourceTemplateSetId !== sourceSet.id ||
          set.setType !== sourceSet.setType
        );
      })
    );
  });
}

export function isCurrentWorkoutSetValid(set: CurrentWorkoutSet): boolean {
  return (
    set.reps !== null &&
    Number.isInteger(set.reps) &&
    set.reps >= 1 &&
    (set.weight === null || set.weight >= 0) &&
    (set.rpe === null || (set.rpe >= 1 && set.rpe <= 10))
  );
}

export function isCurrentWorkoutComplete(workout: CurrentWorkout): boolean {
  const sets = workout.exercises.flatMap(exercise => exercise.sets);
  return (
    sets.length > 0 &&
    sets.every(set => set.isDone && isCurrentWorkoutSetValid(set))
  );
}
