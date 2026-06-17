// Schema barrel — re-exports every table so existing imports keep working.
// Adding a new table: create a file in this folder and re-export it here.

export { exercises } from './exercise';
export { exerciseTypes } from './exerciseType';
export { importBatches } from './importBatch';
export { muscleGroups } from './muscleGroup';
export {
  workoutTemplates,
  workoutTemplateExercises,
  workoutTemplateSets,
  workoutTemplateScheduleWeekdays,
} from './workoutTemplate';
export { workoutSessions, performedSets } from './workoutSession';
export { bodyWeightEntries, bodyFatEntries } from './bodyMetrics';
export { userProfile, type Gender, type WeightUnit } from './userProfile';
