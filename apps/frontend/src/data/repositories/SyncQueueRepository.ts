import {eq, asc, count} from 'drizzle-orm';
import {db} from '../local/database';
import {syncQueue} from '../local/schema';
import type {SyncAction, SyncEntity, SyncQueueEntry} from '../../types/sync';

export function enqueue(
  entity: SyncEntity,
  entityId: string,
  action: SyncAction,
  payload: unknown,
): void {
  db.insert(syncQueue)
    .values({
      entity,
      entityId,
      action,
      payload: JSON.stringify(payload),
      createdAt: Date.now(),
    })
    .run();
}

export function getPending(limit = 50): SyncQueueEntry[] {
  const rows = db
    .select()
    .from(syncQueue)
    .orderBy(asc(syncQueue.id))
    .limit(limit)
    .all();
  return rows.map(rowToEntry);
}

export function getPendingCount(): number {
  const result = db.select({count: count()}).from(syncQueue).get();
  return result?.count ?? 0;
}

export function markRetry(id: number, error: string): void {
  const row = db.select().from(syncQueue).where(eq(syncQueue.id, id)).get();
  if (row) {
    db.update(syncQueue)
      .set({retries: row.retries + 1, lastError: error})
      .where(eq(syncQueue.id, id))
      .run();
  }
}

export function remove(id: number): void {
  db.delete(syncQueue).where(eq(syncQueue.id, id)).run();
}

export function clearAll(): void {
  db.delete(syncQueue).run();
}

function rowToEntry(row: typeof syncQueue.$inferSelect): SyncQueueEntry {
  return {
    id: row.id,
    entity: row.entity as SyncEntity,
    entityId: row.entityId,
    action: row.action as SyncAction,
    payload: row.payload,
    createdAt: row.createdAt,
    retries: row.retries,
    lastError: row.lastError ?? null,
  };
}
