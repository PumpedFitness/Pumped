import type { SetTypeId, WorkoutTemplateColor } from '@/data/local/enums';
import type { ProgressionMode, SetFieldValue } from '@/types/workout';

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

/** Result returned by the ExerciseSetEditor screen — a fully edited exercise. */
export type ExerciseEditResult = {
  id: string;
  exercise: EditableExercise;
};

export type EditableExerciseSet = {
  /** Local-only identity for stable React keys; never persisted. */
  id: string;
  setType: SetTypeId;
  restSeconds: number | null;
  /** Target values for the set type's fields, keyed by set_type_field id. */
  fieldValues: SetFieldValue[];
};

export type EditableExercise = {
  exerciseId: string;
  typeId: string | null;
  /** Per-placement accent color; null inherits the template color. */
  color: WorkoutTemplateColor | null;
  goal: string;
  notes: string | null;
  progressionMode?: ProgressionMode;
  sets: EditableExerciseSet[];
};
