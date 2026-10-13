import type { WorkoutTemplate } from './workout';

export type PeriodizationWorkout = {
  id: string;
  sourceTemplateId: string | null;
  week: number;
  weekday: number;
  template: WorkoutTemplate;
};

export type PeriodizationPhase = {
  id: string;
  name: string;
  workouts: PeriodizationWorkout[];
};

export type PeriodizationDraft = {
  id: string;
  name: string;
  phases: PeriodizationPhase[];
};

export type Periodization = PeriodizationDraft & {
  userId: string;
  anchorDay: number | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
};

export type SavePeriodizationInput = PeriodizationDraft;
