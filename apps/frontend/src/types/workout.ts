export type SetState = 'pending' | 'active' | 'done';

export interface SetLog {
  id: string;
  exerciseId: string;
  index: number;
  weight: number;
  reps: number;
  rpe?: number;
  state: SetState;
  completedAt?: string;
  prevWeight?: number;
  prevReps?: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'push' | 'pull' | 'legs' | 'core';
  equipment: string;
  sets: SetLog[];
}

export interface Workout {
  id: string;
  name: string;
  weekIndex?: number;
  startedAt: string;
  finishedAt?: string;
  exercises: Exercise[];
}
