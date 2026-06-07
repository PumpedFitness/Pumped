import type {
  ExerciseCategory,
  ExerciseEquipment,
  MuscleGroup,
  WorkoutSetType,
} from '../data/local/enums';

export type ExerciseOption = {
  id: string;
  name: string;
  description: string | null;
  exerciseCategory: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: ExerciseEquipment[];
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
