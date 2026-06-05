// Generic typed repository hook — derive CRUD from any Drizzle table.
//
// Usage:
//   const sessions = useRepository(schema.workoutSessions);
//   const data = sessions.query({ where: eq(schema.workoutSessions.userId, id) });
//   const session = sessions.getById(sessionId);
//   sessions.create({ id: uuid(), name: 'Push Day', ... });
//   sessions.deleteById(sessionId);

import { useState, useMemo, useCallback } from 'react';
import {
  eq,
  type SQL,
  type InferSelectModel,
  type InferInsertModel,
  getTableColumns,
} from 'drizzle-orm';
import type { SQLiteTable, SQLiteColumn } from 'drizzle-orm/sqlite-core';
import { db } from './database';

type QueryOptions = {
  where?: SQL;
  orderBy?: SQL | SQL[];
  limit?: number;
  offset?: number;
};

type Repository<T extends SQLiteTable> = {
  /** Synchronous query — call in the render path. Re-runs on each render, SQLite is fast. */
  query: (options?: QueryOptions) => InferSelectModel<T>[];
  /** Lookup a single row by primary key. */
  getById: (id: string) => InferSelectModel<T> | null;
  /** Insert a row. Triggers a re-render so query() picks up the change. */
  create: (values: InferInsertModel<T>) => void;
  /** Update a row by primary key. Triggers a re-render. */
  update: (id: string, values: Partial<InferInsertModel<T>>) => void;
  /** Delete a row by primary key. Triggers a re-render. */
  deleteById: (id: string) => void;
  /** Force a re-render (e.g. after external writes). */
  refresh: () => void;
};

function findPrimaryKey(table: SQLiteTable): SQLiteColumn {
  const columns = getTableColumns(table);
  for (const col of Object.values(columns)) {
    if ((col as any).primary) return col;
  }
  throw new Error(`No primary key found on table`);
}

export function useRepository<T extends SQLiteTable>(table: T): Repository<T> {
  const [, setVersion] = useState(0);
  const bump = useCallback(() => setVersion(v => v + 1), []);

  const pk = useMemo(() => findPrimaryKey(table), [table]);

  const query = useCallback(
    (options?: QueryOptions): InferSelectModel<T>[] => {
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
    [table],
  );

  const getById = useCallback(
    (id: string): InferSelectModel<T> | null => {
      const row = db
        .select()
        .from(table)
        .where(eq(pk, id as any))
        .get();
      return (row as InferSelectModel<T>) ?? null;
    },
    [table, pk],
  );

  const create = useCallback(
    (values: InferInsertModel<T>): void => {
      db.insert(table)
        .values(values as any)
        .run();
      bump();
    },
    [table, bump],
  );

  const update = useCallback(
    (id: string, values: Partial<InferInsertModel<T>>): void => {
      db.update(table)
        .set(values as any)
        .where(eq(pk, id as any))
        .run();
      bump();
    },
    [table, pk, bump],
  );

  const deleteById = useCallback(
    (id: string): void => {
      db.delete(table)
        .where(eq(pk, id as any))
        .run();
      bump();
    },
    [table, pk, bump],
  );

  return { query, getById, create, update, deleteById, refresh: bump };
}
