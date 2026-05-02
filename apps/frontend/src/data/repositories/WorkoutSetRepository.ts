import {eq, desc, asc, and, isNotNull} from 'drizzle-orm';
import {db} from '../local/database';
import {workoutSessionSets} from '../local/schema';
import {enqueue} from './SyncQueueRepository';
import type {WorkoutSessionSet} from '../../types/domain';

function rowToSet(row: typeof workoutSessionSets.$inferSelect): WorkoutSessionSet {
  return {
    id: row.id,
    workoutSessionId: row.workoutSessionId,
    exerciseId: row.exerciseId,
    setIndex: row.setIndex,
    reps: row.reps,
    weight: row.weight ?? null,
    restSeconds: row.restSeconds ?? null,
    durationSeconds: row.durationSeconds ?? null,
    notes: row.notes ?? null,
    performedAt: row.performedAt,
  };
}

export function logSet(set: WorkoutSessionSet): void {
  db.transaction((tx) => {
    tx.insert(workoutSessionSets)
      .values({
        id: set.id,
        workoutSessionId: set.workoutSessionId,
        exerciseId: set.exerciseId,
        setIndex: set.setIndex,
        reps: set.reps,
        weight: set.weight,
        restSeconds: set.restSeconds,
        durationSeconds: set.durationSeconds,
        notes: set.notes,
        performedAt: set.performedAt,
      })
      .run();
    enqueue('workout_session_set', set.id, 'create', set);
  });
}

export function deleteSet(id: string): void {
  db.transaction((tx) => {
    tx.delete(workoutSessionSets)
      .where(eq(workoutSessionSets.id, id))
      .run();
    enqueue('workout_session_set', id, 'delete', {id});
  });
}

export function getSetsForSession(workoutSessionId: string): WorkoutSessionSet[] {
  const rows = db
    .select()
    .from(workoutSessionSets)
    .where(eq(workoutSessionSets.workoutSessionId, workoutSessionId))
    .orderBy(asc(workoutSessionSets.setIndex))
    .all();
  return rows.map(rowToSet);
}

export function getExerciseHistory(
  exerciseId: string,
  limit = 20,
): WorkoutSessionSet[] {
  const rows = db
    .select()
    .from(workoutSessionSets)
    .where(eq(workoutSessionSets.exerciseId, exerciseId))
    .orderBy(desc(workoutSessionSets.performedAt))
    .limit(limit)
    .all();
  return rows.map(rowToSet);
}

export function getPersonalRecord(
  exerciseId: string,
): WorkoutSessionSet | null {
  const row = db
    .select()
    .from(workoutSessionSets)
    .where(
      and(
        eq(workoutSessionSets.exerciseId, exerciseId),
        isNotNull(workoutSessionSets.weight),
      ),
    )
    .orderBy(
      desc(workoutSessionSets.weight),
      desc(workoutSessionSets.reps),
    )
    .limit(1)
    .get();
  return row ? rowToSet(row) : null;
}

export function upsertSetFromRemote(set: WorkoutSessionSet): void {
  db.insert(workoutSessionSets)
    .values({
      id: set.id,
      workoutSessionId: set.workoutSessionId,
      exerciseId: set.exerciseId,
      setIndex: set.setIndex,
      reps: set.reps,
      weight: set.weight,
      restSeconds: set.restSeconds,
      durationSeconds: set.durationSeconds,
      notes: set.notes,
      performedAt: set.performedAt,
    })
    .onConflictDoUpdate({
      target: workoutSessionSets.id,
      set: {
        workoutSessionId: set.workoutSessionId,
        exerciseId: set.exerciseId,
        setIndex: set.setIndex,
        reps: set.reps,
        weight: set.weight,
        restSeconds: set.restSeconds,
        durationSeconds: set.durationSeconds,
        notes: set.notes,
        performedAt: set.performedAt,
      },
    })
    .run();
}
