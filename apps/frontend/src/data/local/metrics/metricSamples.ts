// Raw time-series samples for the trackable metrics. Every metric — body
// measurement or training stat — reduces to the same `{ t, value }` shape so the
// widgets can bucket, aggregate and chart any of them through one pipeline.
// Plain functions over the local database — consumed through useMetricSeries.

import { and, asc, eq, gte, isNotNull } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { db } from '@/data/local/database';
import {
  bodyFatEntries,
  bodyWeightEntries,
  performedSets,
  workoutSessions,
} from '@/data/local/schema';
import { resolveSetWeightReps } from '@/data/local/sets/setTypes';

export type MetricKey =
  | 'bodyweight'
  | 'bodyFat'
  | 'tonnage'
  | 'workouts'
  | 'sets'
  | 'trainingTime'
  | 'e1rm'
  | 'topWeight';

export type MetricParams = { exerciseId?: string | null };

/** One observation: a unix-ms timestamp and its value. */
export type MetricSample = { t: number; value: number };

const SESSION_TABLES = [workoutSessions, performedSets];

/** The tables each metric reads — drives the widget's reactivity. */
export const METRIC_TABLES: Record<MetricKey, SQLiteTable[]> = {
  bodyweight: [bodyWeightEntries],
  bodyFat: [bodyFatEntries],
  tonnage: SESSION_TABLES,
  workouts: [workoutSessions],
  sets: SESSION_TABLES,
  trainingTime: [workoutSessions],
  e1rm: SESSION_TABLES,
  topWeight: SESSION_TABLES,
};

type SessionRow = Pick<
  typeof workoutSessions.$inferSelect,
  'id' | 'startedAt' | 'endedAt'
>;

function finishedSessionsSince(since: number): SessionRow[] {
  return db
    .select({
      id: workoutSessions.id,
      startedAt: workoutSessions.startedAt,
      endedAt: workoutSessions.endedAt,
    })
    .from(workoutSessions)
    .where(
      and(
        isNotNull(workoutSessions.endedAt),
        gte(workoutSessions.startedAt, since),
      ),
    )
    .orderBy(asc(workoutSessions.startedAt))
    .all();
}

type SetRow = typeof performedSets.$inferSelect;

/** Sets of finished sessions started at or after `since` — one join, so a long
 *  history never hits SQLite's bound-parameter limit. */
function finishedSetsSince(
  since: number,
  exerciseId?: string | null,
): SetRow[] {
  const finished = and(
    isNotNull(workoutSessions.endedAt),
    gte(workoutSessions.startedAt, since),
  );
  return db
    .select({ set: performedSets })
    .from(performedSets)
    .innerJoin(
      workoutSessions,
      eq(performedSets.workoutSessionId, workoutSessions.id),
    )
    .where(
      exerciseId
        ? and(finished, eq(performedSets.exerciseId, exerciseId))
        : finished,
    )
    .all()
    .map(row => row.set);
}

/**
 * One sample per finished session, valued by reducing that session's sets.
 * Sessions without a qualifying value (reducer → null) are left out.
 */
function perSession(
  since: number,
  exerciseId: string | null | undefined,
  reduce: (sets: SetRow[]) => number | null,
): MetricSample[] {
  const bySession = new Map<string, SetRow[]>();
  finishedSetsSince(since, exerciseId).forEach(set => {
    const list = bySession.get(set.workoutSessionId) ?? [];
    list.push(set);
    bySession.set(set.workoutSessionId, list);
  });
  return finishedSessionsSince(since).flatMap(session => {
    const value = reduce(bySession.get(session.id) ?? []);
    return value == null ? [] : [{ t: session.startedAt, value }];
  });
}

function maxOf(values: number[]): number | null {
  return values.length > 0 ? Math.max(...values) : null;
}

/** Epley — the same estimate the exercise analytics use. */
function estimateOneRepMax(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

function bodyEntries(
  table: typeof bodyWeightEntries | typeof bodyFatEntries,
  since: number,
): MetricSample[] {
  return db
    .select({ t: table.recordedAt, value: table.value })
    .from(table)
    .where(gte(table.recordedAt, since))
    .orderBy(asc(table.recordedAt))
    .all();
}

/** All samples of a metric at or after `since`, oldest first. Weights in kg. */
export function loadMetricSamples(
  key: MetricKey,
  params: MetricParams,
  since: number,
): MetricSample[] {
  switch (key) {
    case 'bodyweight':
      return bodyEntries(bodyWeightEntries, since);
    case 'bodyFat':
      return bodyEntries(bodyFatEntries, since);
    case 'workouts':
      return finishedSessionsSince(since).map(session => ({
        t: session.startedAt,
        value: 1,
      }));
    case 'trainingTime':
      return finishedSessionsSince(since).map(session => ({
        t: session.startedAt,
        value: Math.max(
          0,
          Math.round(
            ((session.endedAt ?? session.startedAt) - session.startedAt) /
              60_000,
          ),
        ),
      }));
    case 'tonnage':
      return perSession(since, null, sets =>
        sets.reduce((total, set) => {
          const { weight, reps } = resolveSetWeightReps(set);
          return total + (weight ?? 0) * reps;
        }, 0),
      );
    case 'sets':
      return perSession(since, null, sets => sets.length);
    case 'e1rm':
      if (!params.exerciseId) return [];
      return perSession(since, params.exerciseId, sets =>
        maxOf(
          sets.flatMap(set => {
            const { weight, reps } = resolveSetWeightReps(set);
            return weight != null && weight > 0 && reps > 0
              ? [estimateOneRepMax(weight, reps)]
              : [];
          }),
        ),
      );
    case 'topWeight':
      if (!params.exerciseId) return [];
      return perSession(since, params.exerciseId, sets =>
        maxOf(
          sets.flatMap(set => {
            const { weight } = resolveSetWeightReps(set);
            return weight != null && weight > 0 ? [weight] : [];
          }),
        ),
      );
  }
}
