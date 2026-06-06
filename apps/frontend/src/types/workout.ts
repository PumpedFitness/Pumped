import type {
  WorkoutScheduleType,
  WorkoutSetType,
  WorkoutWeekday,
} from '../data/local/enums';

export type WorkoutTemplateSet = {
  id: string;
  position: number;
  setType: WorkoutSetType;
};

export type WorkoutTemplateExercise = {
  id: string;
  exerciseId: string;
  position: number;
  goal: string | null;
  notes: string | null;
  sets: WorkoutTemplateSet[];
};

export type WorkoutTemplateSchedule = {
  type: WorkoutScheduleType;
  interval: number;
  weekdays: WorkoutWeekday[];
};

export type WorkoutTemplate = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  schedule: WorkoutTemplateSchedule | null;
  exercises: WorkoutTemplateExercise[];
  createdAt: number;
  updatedAt: number;
};

export type WorkoutSession = {
  id: string;
  userId: string;
  workoutTemplateId: string | null;
  name: string;
  startedAt: number;
  endedAt: number | null;
  notes: string | null;
};

export type PerformedSet = {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  exercisePosition: number;
  setPosition: number;
  setType: WorkoutSetType;
  reps: number;
  weight: number | null;
  rpe: number | null;
  performedAt: number;
};
