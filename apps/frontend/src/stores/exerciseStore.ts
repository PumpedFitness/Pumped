import {create} from 'zustand';
import type {Exercise} from '../types/domain';
import * as ExerciseRepo from '../data/repositories/ExerciseRepository';

type ExerciseState = {
  exercises: Exercise[];
  isLoaded: boolean;

  loadExercises: () => void;
  searchExercises: (query: string) => Exercise[];
};

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  isLoaded: false,

  loadExercises: () => {
    const exercises = ExerciseRepo.getAllExercises();
    set({exercises, isLoaded: true});
  },

  searchExercises: (query: string) => {
    if (!query.trim()) {
      return get().exercises;
    }
    return ExerciseRepo.searchExercises(query);
  },
}));
