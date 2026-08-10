import { like } from 'drizzle-orm';
import type { db } from './database';
import { buildWorkoutHistory } from './seed/history';
import { seedWorkoutTemplates } from './seed/templates';
import { performedSets, workoutSessions } from './schema';

type LocalDatabase = typeof db;

// Sample templates + history only — the exercise catalog is production seed
// data and runs unconditionally in initDatabase.
export function seedDevelopmentData(database: LocalDatabase): void {
  const now = Date.now();

  seedWorkoutTemplates(database, now);

  // Keep development history near "today" so every history widget has data.
  database
    .delete(workoutSessions)
    .where(like(workoutSessions.id, 'sample:session-%'))
    .run();

  const history = buildWorkoutHistory(now);
  database.insert(workoutSessions).values(history.sessions).run();
  database.insert(performedSets).values(history.sets).run();
}
