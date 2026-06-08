import type { WorkoutSetType } from '../data/local/enums';

export type ExerciseOption = {
  id: string;
  name: string;
  description: string | null;
  typeId: string | null;
  typeName: string | null;
  picture: string | null;
  muscleGroupIds: string[];
  muscleGroupNames: string[];
};

export type ExerciseSelectionResult = {
  id: string;
  exerciseIds: string[];
};

export type EditableExerciseSet = {
  setType: WorkoutSetType;
  targetReps: string;
  targetPercentage1Rm: string;
  targetRpe: string;
};

export type EditableExercise = {
  exerciseId: string;
  goal: string;
  notes: string | null;
  sets: EditableExerciseSet[];
};
