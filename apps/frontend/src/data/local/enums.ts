// Domain enums — frontend-owned, single source of truth.
// NOTE: ExerciseCategory, ExerciseEquipment, and MuscleGroup have been
// moved to their own DB tables (exercise_types, muscle_groups).

export type WorkoutScheduleType = 'DAYS' | 'WEEKS';

// Advanced schedules — the first-class "Schedule" entity. A BASIC schedule is
// owned by a single template (the inline schedule in the template editor); an
// ADVANCED schedule is user-named and arranges multiple workouts.
export type ScheduleKind = 'BASIC' | 'ADVANCED';

// WEEKLY: a rotation of N weeks, slots placed on weekdays. CYCLE: a rotation of
// N days, weekday-independent (day1 = A, day2 = B, day3 = rest, repeat).
export type ScheduleRecurrenceType = 'WEEKLY' | 'CYCLE';

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
