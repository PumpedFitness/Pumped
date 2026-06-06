// Schema barrel — re-exports every table so existing imports keep working.
// Adding a new table: create a file in this folder and re-export it here.

import type { InferSelectModel } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';

/**
 * Simple type alias of getting the type of a schema definition
 */
export type TypeOfSchema<T extends SQLiteTable> = InferSelectModel<T>;

export { exercises } from './exercise';
export {
  workoutTemplates,
  workoutTemplateExercises,
  workoutTemplateSets,
  workoutTemplateScheduleWeekdays,
} from './workoutTemplate';
export { workoutSessions, performedSets } from './workoutSession';
