// Wipes every user-owned table. The only sanctioned full-database write
// outside useRepository and the workout data functions.

import { db } from './database';
import { notifyTableChanged } from './tableVersions';
import {
  bodyFatEntries,
  bodyWeightEntries,
  exercises,
  importBatches,
  performedSets,
  scheduleSlots,
  schedules,
  userProfile,
  workoutSessions,
  workoutTemplateExercises,
  workoutTemplateSets,
  workoutTemplates,
} from './schema';

export function resetAllData(): void {
  // FK-safe order: children before parents.
  db.delete(performedSets).run();
  db.delete(workoutSessions).run();
  db.delete(scheduleSlots).run();
  db.delete(schedules).run();
  db.delete(workoutTemplateSets).run();
  db.delete(workoutTemplateExercises).run();
  db.delete(workoutTemplates).run();
  db.delete(exercises).run();
  db.delete(bodyWeightEntries).run();
  db.delete(bodyFatEntries).run();
  db.delete(userProfile).run();
  db.delete(importBatches).run();

  notifyTableChanged(
    performedSets,
    workoutSessions,
    scheduleSlots,
    schedules,
    workoutTemplateSets,
    workoutTemplateExercises,
    workoutTemplates,
    exercises,
    bodyWeightEntries,
    bodyFatEntries,
    userProfile,
    importBatches,
  );
}
