// Domain enums — frontend-owned, single source of truth.
// Add new enums here as type + values array.

export type ExerciseCategory =
  | 'STRENGTH'
  | 'CARDIO'
  | 'FLEXIBILITY'
  | 'BALANCE'
  | 'OTHER';

export const exerciseCategoryValues = [
  'STRENGTH',
  'CARDIO',
  'FLEXIBILITY',
  'BALANCE',
  'OTHER',
] as const;

export type ExerciseEquipment =
  | 'DUMBBELL'
  | 'BARBELL'
  | 'KETTLEBELL'
  | 'MACHINE'
  | 'BODYWEIGHT'
  | 'CABLE'
  | 'BAND'
  | 'OTHER';

export const exerciseEquipmentValues = [
  'DUMBBELL',
  'BARBELL',
  'KETTLEBELL',
  'MACHINE',
  'BODYWEIGHT',
  'CABLE',
  'BAND',
  'OTHER',
] as const;

export type MuscleGroup =
  | 'CHEST'
  | 'BACK'
  | 'LEGS'
  | 'SHOULDERS'
  | 'ARMS'
  | 'CORE';

export const muscleGroupValues = [
  'CHEST',
  'BACK',
  'LEGS',
  'SHOULDERS',
  'ARMS',
  'CORE',
] as const;

export type WorkoutScheduleType = 'DAYS' | 'WEEKS';

export const workoutScheduleTypeValues = ['DAYS', 'WEEKS'] as const;

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
