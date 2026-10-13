import { and, avg, eq, isNotNull, sql } from 'drizzle-orm';
import { db } from '@/data/local/database';
import { healthRawSample, workoutSessions } from '@/data/local/schema';
import { FieldId, MetricId } from '@/lib/health/ids';

/** Local samples inside the actual session, excluding pre/post-workout heart rate. */
export function loadWorkoutHeartRateAverages(): Map<string, number> {
  const rows = db
    .select({
      workoutId: workoutSessions.id,
      average: avg(healthRawSample.value),
    })
    .from(workoutSessions)
    .innerJoin(
      healthRawSample,
      and(
        eq(healthRawSample.metric, MetricId.heartRate),
        eq(healthRawSample.field, FieldId.value),
        sql`${healthRawSample.ts} >= ${workoutSessions.startedAt} / 1000.0`,
        sql`${healthRawSample.ts} <= ${workoutSessions.endedAt} / 1000.0`,
      ),
    )
    .where(isNotNull(workoutSessions.endedAt))
    .groupBy(workoutSessions.id)
    .all();
  return new Map(
    rows.flatMap(row =>
      row.average === null
        ? []
        : [[row.workoutId, Number(row.average)] as const],
    ),
  );
}
