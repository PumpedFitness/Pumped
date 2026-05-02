import {eq, desc} from 'drizzle-orm';
import {db} from '../local/database';
import {workoutSessions} from '../local/schema';
import {enqueue} from './SyncQueueRepository';
import type {WorkoutSession} from '../../types/domain';

function rowToSession(row: typeof workoutSessions.$inferSelect): WorkoutSession {
  return {
    id: row.id,
    userId: row.userId,
    workoutTemplateId: row.workoutTemplateId ?? null,
    name: row.name,
    startedAt: row.startedAt,
    endedAt: row.endedAt ?? null,
    notes: row.notes ?? null,
  };
}

export function createSession(session: WorkoutSession): void {
  db.transaction((tx) => {
    tx.insert(workoutSessions)
      .values({
        id: session.id,
        userId: session.userId,
        workoutTemplateId: session.workoutTemplateId,
        name: session.name,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        notes: session.notes,
      })
      .run();
    enqueue('workout_session', session.id, 'create', session);
  });
}

export function finishSession(
  id: string,
  endedAt: number,
  notes: string | null,
): void {
  db.transaction((tx) => {
    tx.update(workoutSessions)
      .set({endedAt, notes})
      .where(eq(workoutSessions.id, id))
      .run();
    enqueue('workout_session', id, 'update', {id, endedAt, notes});
  });
}

export function deleteSession(id: string): void {
  db.transaction((tx) => {
    tx.delete(workoutSessions).where(eq(workoutSessions.id, id)).run();
    enqueue('workout_session', id, 'delete', {id});
  });
}

export function getSessionById(id: string): WorkoutSession | null {
  const row = db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.id, id))
    .get();
  return row ? rowToSession(row) : null;
}

export function getSessionsByUser(
  userId: string,
  limit = 50,
  offset = 0,
): WorkoutSession[] {
  const rows = db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.userId, userId))
    .orderBy(desc(workoutSessions.startedAt))
    .limit(limit)
    .offset(offset)
    .all();
  return rows.map(rowToSession);
}

export function getAllSessions(): WorkoutSession[] {
  const rows = db
    .select()
    .from(workoutSessions)
    .orderBy(desc(workoutSessions.startedAt))
    .all();
  return rows.map(rowToSession);
}

export function upsertSessionFromRemote(session: WorkoutSession): void {
  db.insert(workoutSessions)
    .values({
      id: session.id,
      userId: session.userId,
      workoutTemplateId: session.workoutTemplateId,
      name: session.name,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      notes: session.notes,
    })
    .onConflictDoUpdate({
      target: workoutSessions.id,
      set: {
        userId: session.userId,
        workoutTemplateId: session.workoutTemplateId,
        name: session.name,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        notes: session.notes,
      },
    })
    .run();
}
