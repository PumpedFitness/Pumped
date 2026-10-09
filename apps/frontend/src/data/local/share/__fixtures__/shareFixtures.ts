// Shared fixtures for the share planner tests.

import type { SharedExercise, SharedSetType } from '@/lib/share/shareTypes';
import type { LocalLibrary } from '../shareResolve';

export function library(overrides: Partial<LocalLibrary> = {}): LocalLibrary {
  return {
    exercises: [{ id: 'local-bench', name: 'Bench Press' }],
    exerciseTypes: [{ id: 'default-et-machine', name: 'Machine' }],
    muscleGroupIds: ['default-mg-chest'],
    setTypes: [
      {
        id: 'NORMAL',
        name: 'Working',
        displayName: 'Arbeitssatz',
        isBuiltIn: true,
        fields: [
          {
            id: 'NORMAL-weight',
            name: 'Weight',
            dataType: 'number',
            unit: 'amount',
          },
          { id: 'NORMAL-reps', name: 'Reps', dataType: 'number', unit: null },
        ],
      },
      {
        id: 'local-tempo',
        name: 'Tempo',
        isBuiltIn: false,
        fields: [
          {
            id: 'local-tempo-reps',
            name: 'Reps',
            dataType: 'number',
            unit: null,
          },
          {
            id: 'local-tempo-secs',
            name: 'Seconds',
            dataType: 'number',
            unit: 'seconds',
          },
        ],
      },
    ],
    workoutExerciseTypeIds: [],
    templateNames: [],
    ...overrides,
  };
}

export function sharedExercise(
  overrides: Partial<SharedExercise> = {},
): SharedExercise {
  return {
    id: 'sender-ex',
    name: 'Cable Fly',
    description: 'Chest isolation',
    howTo: null,
    typeId: null,
    typeName: null,
    muscleGroupIds: [],
    ...overrides,
  };
}

export const builtInNormal: SharedSetType = {
  id: 'NORMAL',
  name: 'Working',
  icon: null,
  isBuiltIn: true,
  progressionGoal: { kind: 'none' },
  fields: [
    {
      id: 'NORMAL-weight',
      name: 'Weight',
      dataType: 'number',
      unit: 'amount',
      position: 0,
      config: {},
    },
    {
      id: 'NORMAL-reps',
      name: 'Reps',
      dataType: 'number',
      unit: null,
      position: 1,
      config: {},
    },
  ],
};

export function customTempo(
  overrides: Partial<SharedSetType> = {},
): SharedSetType {
  return {
    id: 'sender-tempo',
    name: 'tempo ',
    icon: 'timer',
    isBuiltIn: false,
    progressionGoal: {
      kind: 'linear',
      fieldId: 'sender-tempo-reps',
      increment: 1,
    },
    fields: [
      // Out of order on purpose — position decides.
      {
        id: 'sender-tempo-secs',
        name: 'Seconds',
        dataType: 'number',
        unit: 'seconds',
        position: 1,
        config: {},
      },
      {
        id: 'sender-tempo-reps',
        name: 'reps',
        dataType: 'number',
        unit: null,
        position: 0,
        config: { min: 1 },
      },
    ],
    ...overrides,
  };
}
