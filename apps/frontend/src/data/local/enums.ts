// Domain enums — frontend-owned, single source of truth.
// NOTE: ExerciseCategory, ExerciseEquipment, and MuscleGroup have been
// moved to their own DB tables (exercise_types, muscle_groups).

// A Schedule's recurrence. WEEKLY: a rotation of N weeks, slots placed on
// weekdays. CYCLE: a rotation of N days, weekday-independent (day1 = A,
// day2 = B, day3 = rest, repeat).
export type ScheduleRecurrenceType = 'WEEKLY' | 'CYCLE';

export type WorkoutTemplateColor =
  | 'TERRACOTTA'
  | 'HONEY'
  | 'SAGE'
  | 'ROSE'
  | 'MOSS'
  | 'SLATE';

// The ids of the seeded built-in set types. Set types are a user-configurable
// library (`set_type` table) that OWN their field schema (`set_type_field`).
// These three are seeded on every launch; users can add/edit their own. A set's
// `setType` holds a type id — built-in ids equal these strings, custom ids are
// random UUIDs.
export type WorkoutSetType = 'WARMUP' | 'NORMAL' | 'MAX_EFFORT';

/** A set-type id: a built-in id (WorkoutSetType) or a user-created uuid. */
export type SetTypeId = string;

/** The kind of value a set-type field tracks. */
export type SetFieldDataType = 'number' | 'boolean' | 'text' | 'range';

/** Unit/semantics for a numeric set-type field. `amount` = a weight/load value
 *  shown in the user's weight unit; `percentage` = %; `seconds` = a duration. */
export type SetFieldUnit = 'amount' | 'percentage' | 'seconds';
