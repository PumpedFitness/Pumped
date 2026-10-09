import { and, desc, gte, isNotNull } from 'drizzle-orm';

import { db } from '../database';
import * as schema from '../schema';

/** Ein abgeschlossenes Workout, so weit der Herzfrequenz-Sync es braucht. */
export type WorkoutWindow = {
  /** Epoch-Millisekunden. */
  readonly startedAt: number;
  readonly endedAt: number;
};

/** Abgeschlossene Workouts der letzten `days` Tage, jüngste zuerst. */
export function recentWorkouts(days: number, now: Date): WorkoutWindow[] {
  const since = now.getTime() - days * 24 * 60 * 60 * 1000;
  return db
    .select({
      startedAt: schema.workoutSessions.startedAt,
      endedAt: schema.workoutSessions.endedAt,
    })
    .from(schema.workoutSessions)
    .where(
      and(
        isNotNull(schema.workoutSessions.endedAt),
        gte(schema.workoutSessions.startedAt, since),
      ),
    )
    .orderBy(desc(schema.workoutSessions.startedAt))
    .all()
    .flatMap(row =>
      row.endedAt === null
        ? []
        : [{ startedAt: row.startedAt, endedAt: row.endedAt }],
    );
}
