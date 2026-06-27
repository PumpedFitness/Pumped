// Skipped-day reads/writes. A skip is a single row keyed by local-midnight day
// index; presence means that day is skipped. Plain functions over the local
// database — consumed through useTodayWorkout. Writes notify table subscribers.

import { randomUUID } from 'expo-crypto';
import { and, eq } from 'drizzle-orm';
import { db } from '@/data/local/database';
import { notifyTableChanged } from '@/data/local/tableVersions';
import { skippedDays } from '@/data/local/schema';
import { LOCAL_USER_ID } from '../workouts/validation';

export function listSkippedDayIndexes(): number[] {
  return db
    .select({ dayIndex: skippedDays.dayIndex })
    .from(skippedDays)
    .where(eq(skippedDays.userId, LOCAL_USER_ID))
    .all()
    .map(row => row.dayIndex);
}

export function skipDay(dayIndex: number): void {
  const existing = db
    .select({ id: skippedDays.id })
    .from(skippedDays)
    .where(
      and(
        eq(skippedDays.userId, LOCAL_USER_ID),
        eq(skippedDays.dayIndex, dayIndex),
      ),
    )
    .get();

  if (existing) {
    return;
  }

  db.insert(skippedDays)
    .values({
      id: randomUUID(),
      userId: LOCAL_USER_ID,
      dayIndex,
      createdAt: Date.now(),
    })
    .run();

  notifyTableChanged(skippedDays);
}

export function unskipDay(dayIndex: number): void {
  db.delete(skippedDays)
    .where(
      and(
        eq(skippedDays.userId, LOCAL_USER_ID),
        eq(skippedDays.dayIndex, dayIndex),
      ),
    )
    .run();

  notifyTableChanged(skippedDays);
}
