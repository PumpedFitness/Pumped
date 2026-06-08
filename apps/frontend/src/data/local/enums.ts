// Domain enums — frontend-owned, single source of truth.
// Add new enums here as type + values array.
// NOTE: ExerciseCategory, ExerciseEquipment, and MuscleGroup have been
// moved to their own DB tables (exercise_types, muscle_groups).

export type WorkoutScheduleType = 'DAYS' | 'WEEKS';

export const workoutScheduleTypeValues = ['DAYS', 'WEEKS'] as const;

export type WorkoutTemplateStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export const workoutTemplateStatusValues = [
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED',
] as const;

export type WorkoutTemplateColor =
  | 'TERRACOTTA'
  | 'HONEY'
  | 'SAGE'
  | 'ROSE'
  | 'MOSS'
  | 'SLATE';

export const workoutTemplateColorValues = [
  'TERRACOTTA',
  'HONEY',
  'SAGE',
  'ROSE',
  'MOSS',
  'SLATE',
] as const;

export type WorkoutWeekday =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export const workoutWeekdayValues = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export type WorkoutSetType = 'WARMUP' | 'NORMAL' | 'BACKOFF' | 'DROP' | 'AMRAP';

export const workoutSetTypeValues = [
  'WARMUP',
  'NORMAL',
  'BACKOFF',
  'DROP',
  'AMRAP',
] as const;
