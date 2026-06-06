import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';
import type { WorkoutSetType } from '../data/local/enums';
import { workoutService } from '../data/local/services';
import type { WorkoutSessionDetails } from '../types/workout';

export type CurrentWorkoutSet = {
  id: string;
  exerciseId: string;
  exercisePosition: number;
  setPosition: number;
  setType: WorkoutSetType;
  reps: number;
  weight: number | null;
  rpe: number | null;
  performedAt: number;
};

export type CurrentWorkout = {
  id: string;
  workoutTemplateId: string | null;
  name: string;
  startedAt: number;
  notes: string | null;
  sets: CurrentWorkoutSet[];
};

export type StartCurrentWorkoutInput = {
  workoutTemplateId?: string | null;
  name?: string;
  notes?: string | null;
  startedAt?: number;
};

export type SaveCurrentWorkoutSetInput = Omit<
  CurrentWorkoutSet,
  'id' | 'performedAt'
> & {
  id?: string;
  performedAt?: number;
};

type CurrentWorkoutState = {
  currentWorkout: CurrentWorkout | null;
  startWorkout: (input?: StartCurrentWorkoutInput) => CurrentWorkout;
  updateWorkout: (
    values: Partial<Pick<CurrentWorkout, 'name' | 'notes'>>,
  ) => void;
  saveSet: (input: SaveCurrentWorkoutSetInput) => CurrentWorkoutSet;
  deleteSet: (setId: string) => void;
  discardWorkout: () => void;
  finishWorkout: (endedAt?: number) => WorkoutSessionDetails;
};

function sortSets(sets: CurrentWorkoutSet[]): CurrentWorkoutSet[] {
  return [...sets].sort(
    (left, right) =>
      left.exercisePosition - right.exercisePosition ||
      left.setPosition - right.setPosition,
  );
}

export const useCurrentWorkoutStore = create<CurrentWorkoutState>(
  (setState, getState) => ({
    currentWorkout: null,

    startWorkout: input => {
      if (getState().currentWorkout) {
        throw new Error('A workout is already in progress');
      }

      const template = input?.workoutTemplateId
        ? workoutService.getWorkoutTemplate(input.workoutTemplateId)
        : null;

      if (input?.workoutTemplateId && !template) {
        throw new Error('Workout template not found');
      }

      const currentWorkout: CurrentWorkout = {
        id: randomUUID(),
        workoutTemplateId: input?.workoutTemplateId ?? null,
        name: input?.name?.trim() || template?.name || 'Workout',
        startedAt: input?.startedAt ?? Date.now(),
        notes: input?.notes ?? null,
        sets: [],
      };

      setState({ currentWorkout });
      return currentWorkout;
    },

    updateWorkout: values => {
      const currentWorkout = getState().currentWorkout;
      if (!currentWorkout) {
        throw new Error('No workout is in progress');
      }

      setState({
        currentWorkout: {
          ...currentWorkout,
          name:
            values.name === undefined
              ? currentWorkout.name
              : values.name.trim(),
          notes:
            values.notes === undefined ? currentWorkout.notes : values.notes,
        },
      });
    },

    saveSet: input => {
      const currentWorkout = getState().currentWorkout;
      if (!currentWorkout) {
        throw new Error('No workout is in progress');
      }

      const existing = input.id
        ? currentWorkout.sets.find(set => set.id === input.id)
        : undefined;
      const workoutSet: CurrentWorkoutSet = {
        ...input,
        id: input.id ?? randomUUID(),
        weight: input.weight ?? null,
        rpe: input.rpe ?? null,
        performedAt: input.performedAt ?? existing?.performedAt ?? Date.now(),
      };
      const sets = existing
        ? currentWorkout.sets.map(set =>
            set.id === workoutSet.id ? workoutSet : set,
          )
        : [...currentWorkout.sets, workoutSet];

      setState({
        currentWorkout: {
          ...currentWorkout,
          sets: sortSets(sets),
        },
      });
      return workoutSet;
    },

    deleteSet: setId => {
      const currentWorkout = getState().currentWorkout;
      if (!currentWorkout) {
        throw new Error('No workout is in progress');
      }

      setState({
        currentWorkout: {
          ...currentWorkout,
          sets: currentWorkout.sets.filter(set => set.id !== setId),
        },
      });
    },

    discardWorkout: () => {
      setState({ currentWorkout: null });
    },

    finishWorkout: endedAt => {
      const currentWorkout = getState().currentWorkout;
      if (!currentWorkout) {
        throw new Error('No workout is in progress');
      }

      const session = workoutService.saveCompletedWorkout({
        id: currentWorkout.id,
        workoutTemplateId: currentWorkout.workoutTemplateId,
        name: currentWorkout.name,
        startedAt: currentWorkout.startedAt,
        endedAt: endedAt ?? Date.now(),
        notes: currentWorkout.notes,
        sets: currentWorkout.sets,
      });

      setState({ currentWorkout: null });
      return session;
    },
  }),
);
