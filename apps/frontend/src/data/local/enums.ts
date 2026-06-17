// Domain enums — frontend-owned, single source of truth.
// NOTE: ExerciseCategory, ExerciseEquipment, and MuscleGroup have been
// moved to their own DB tables (exercise_types, muscle_groups).

// A Schedule's recurrence. WEEKLY: a rotation of N weeks, slots placed on
// weekdays. CYCLE: a rotation of N days, weekday-independent (day1 = A,
// day2 = B, day3 = rest, repeat).
export type ScheduleRecurrenceType = 'WEEKLY' | 'CYCLE';

export type WorkoutTemplateStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type WorkoutTemplateColor =
  | 'TERRACOTTA'
  | 'HONEY'
  | 'SAGE'
  | 'ROSE'
  | 'MOSS'
  | 'SLATE';

export type WorkoutSetType = 'WARMUP' | 'NORMAL' | 'BACKOFF' | 'DROP' | 'AMRAP';
