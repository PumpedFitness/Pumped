// Minimal store — only holds cross-screen state that can't live in useRepository.
// All data reads/writes go through useRepository in the hooks.

import { create } from 'zustand';

type WorkoutState = {
  activeSessionId: string | null;
  selectedExerciseIds: string[];

  setActiveSession: (id: string | null) => void;
  addExerciseId: (id: string) => void;
  reset: () => void;
};

export const useWorkoutStore = create<WorkoutState>(set => ({
  activeSessionId: null,
  selectedExerciseIds: [],

  setActiveSession: id => set({ activeSessionId: id }),

  addExerciseId: id =>
    set(s =>
      s.selectedExerciseIds.includes(id)
        ? s
        : { selectedExerciseIds: [...s.selectedExerciseIds, id] },
    ),

  reset: () => set({ activeSessionId: null, selectedExerciseIds: [] }),
}));
