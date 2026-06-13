// Domain enums — frontend-owned, single source of truth.
// NOTE: ExerciseCategory, ExerciseEquipment, and MuscleGroup have been
// moved to their own DB tables (exercise_types, muscle_groups).

export type WorkoutScheduleType = 'DAYS' | 'WEEKS';

export type WorkoutTemplateStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type WorkoutTemplateColor =
  | 'TERRACOTTA'
  | 'HONEY'
  | 'SAGE'
  | 'ROSE'
  | 'MOSS'
  | 'SLATE';

export type WorkoutWeekday =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export type WorkoutSetType = 'WARMUP' | 'NORMAL' | 'BACKOFF' | 'DROP' | 'AMRAP';
