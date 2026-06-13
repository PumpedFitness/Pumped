// Generic typed repository hook — derive CRUD from any Drizzle table.
//
// Usage:
//   const sessions = useRepository(schema.workoutSessions);
//   const data = sessions.query({ where: eq(schema.workoutSessions.userId, id) });
//   const session = sessions.getById(sessionId);
//   sessions.create({ id: uuid(), name: 'Push Day', ... });
//   sessions.deleteById(sessionId);
//
// Writes notify every mounted component reading the same table (see
// tableVersions.ts). The returned object changes identity whenever the
// table changes, so it is safe to use as a useMemo/useCallback dependency.

import { useMemo } from 'react';
import {
  eq,
  type SQL,
  type InferSelectModel,
  type InferInsertModel,
  getTableColumns,
} from 'drizzle-orm';
import type { SQLiteTable, SQLiteColumn } from 'drizzle-orm/sqlite-core';
import { db } from './database';
import { notifyTableChanged, useTableVersion } from './tableVersions';

type QueryOptions = {
  where?: SQL;
  orderBy?: SQL | SQL[];
  limit?: number;
  offset?: number;
};

type Repository<T extends SQLiteTable> = {
  /** Synchronous query — call in the render path. SQLite is fast. */
  query: (options?: QueryOptions) => InferSelectModel<T>[];
  /** Lookup a single row by primary key. */
  getById: (id: string) => InferSelectModel<T> | null;
  /** Insert a row. Re-renders every component reading this table. */
  create: (values: InferInsertModel<T>) => void;
  /** Update a row by primary key. Re-renders every reader. */
  update: (id: string, values: Partial<InferInsertModel<T>>) => void;
  /** Delete a row by primary key. Re-renders every reader. */
  deleteById: (id: string) => void;
  /** Notify all readers of this table (e.g. after external writes). */
  refresh: () => void;
  /** Monotonic change counter for this table — usable as a memo dep. */
  version: number;
};

function findPrimaryKey(table: SQLiteTable): SQLiteColumn {
  const columns = getTableColumns(table);
  for (const col of Object.values(columns)) {
    if ((col as any).primary) return col;
  }
  throw new Error(`No primary key found on table`);
}

export function useRepository<T extends SQLiteTable>(table: T): Repository<T> {
  const version = useTableVersion(table);
  const pk = useMemo(() => findPrimaryKey(table), [table]);

  return useMemo(
    () => ({
      query: (options?: QueryOptions): InferSelectModel<T>[] => {
        let q = db.select().from(table) as any;
        if (options?.where) q = q.where(options.where);
        if (options?.orderBy) {
          const ob = Array.isArray(options.orderBy)
            ? options.orderBy
            : [options.orderBy];
          q = q.orderBy(...ob);
        }
        if (options?.limit) q = q.limit(options.limit);
        if (options?.offset) q = q.offset(options.offset);
        return q.all();
      },
      getById: (id: string): InferSelectModel<T> | null => {
        const row = db
          .select()
          .from(table)
          .where(eq(pk, id as any))
          .get();
        return (row as InferSelectModel<T>) ?? null;
      },
      create: (values: InferInsertModel<T>): void => {
        db.insert(table)
          .values(values as any)
          .run();
        notifyTableChanged(table);
      },
      update: (id: string, values: Partial<InferInsertModel<T>>): void => {
        db.update(table)
          .set(values as any)
          .where(eq(pk, id as any))
          .run();
        notifyTableChanged(table);
      },
      deleteById: (id: string): void => {
        db.delete(table)
          .where(eq(pk, id as any))
          .run();
        notifyTableChanged(table);
      },
      refresh: () => notifyTableChanged(table),
      version,
    }),
    [table, pk, version],
  );
}
