// Local domain types for SQLite storage layer.
// API types are auto-generated in src/data/api/generated.ts — these types
// represent the local SQLite row shape (e.g., JSON arrays stored as TEXT).

// Enum types are auto-generated from the backend OpenAPI spec
import type {MuscleGroup, ExerciseCategory, ExerciseEquipment} from '../data/local/schema.enums.generated';

export type {MuscleGroup, ExerciseCategory, ExerciseEquipment};

export type Exercise = {
  id: string;
  name: string;
  description: string | null;
  exerciseCategory: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: ExerciseEquipment[];
  createdAt: number;
};

export type WorkoutTemplate = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
};

export type WorkoutTemplateExercise = {
  id: string;
  workoutTemplateId: string;
  exerciseId: string;
  orderIndex: number;
  sets: number;
  targetReps: string;
  targetWeight: number | null;
  restSeconds: number | null;
  notes: string | null;
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

export type WorkoutSessionSet = {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  setIndex: number;
  reps: number;
  weight: number | null;
  restSeconds: number | null;
  durationSeconds: number | null;
  notes: string | null;
  performedAt: number;
};
