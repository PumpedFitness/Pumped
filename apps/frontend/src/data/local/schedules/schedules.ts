// Schedule reads/writes. Plain functions over the local database — always
// consumed through the useSchedules domain hook. Writes notify table
// subscribers so every mounted reader re-renders.

import { randomUUID } from 'expo-crypto';
import { asc, eq, ne } from 'drizzle-orm';
import { db } from '@/data/local/database';
import { notifyTableChanged } from '@/data/local/tableVersions';
import { schedules, scheduleSlots } from '@/data/local/schema';
import type { Schedule, SaveScheduleInput } from '@/types/schedule';
import {
  LOCAL_USER_ID,
  validateScheduleInput,
} from '@/data/local/workouts/validation';
import { localDayIndex } from './scheduleResolution';

export function getSchedule(scheduleId: string): Schedule | null {
  const row = db
    .select()
    .from(schedules)
    .where(eq(schedules.id, scheduleId))
    .get();
  if (!row) {
    return null;
  }

  const slots = db
    .select()
    .from(scheduleSlots)
    .where(eq(scheduleSlots.scheduleId, row.id))
    .orderBy(asc(scheduleSlots.dayOffset), asc(scheduleSlots.position))
    .all()
    .map(slot => ({
      id: slot.id,
      dayOffset: slot.dayOffset,
      position: slot.position,
      workoutTemplateId: slot.workoutTemplateId,
    }));

  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    recurrenceType: row.recurrenceType,
    periodLength: row.periodLength,
    anchorDay: row.anchorDay,
    isActive: row.isActive,
    slots,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function listSchedules(): Schedule[] {
  return db
    .select({ id: schedules.id })
    .from(schedules)
    .orderBy(asc(schedules.name))
    .all()
    .map(row => getSchedule(row.id))
    .filter((schedule): schedule is Schedule => schedule !== null);
}

type Tx = Parameters<Parameters<(typeof db)['transaction']>[0]>[0];

function replaceSlots(
  tx: Tx,
  scheduleId: string,
  input: SaveScheduleInput,
): void {
  tx.delete(scheduleSlots)
    .where(eq(scheduleSlots.scheduleId, scheduleId))
    .run();
  if (input.slots.length > 0) {
    tx.insert(scheduleSlots)
      .values(
        input.slots.map(slot => ({
          id: randomUUID(),
          scheduleId,
          dayOffset: slot.dayOffset,
          position: slot.position ?? 0,
          workoutTemplateId: slot.workoutTemplateId,
        })),
      )
      .run();
  }
}

export function saveSchedule(input: SaveScheduleInput): Schedule {
  validateScheduleInput(input);
  const scheduleId = input.id ?? randomUUID();
  const now = Date.now();
  const anchorDay = input.anchorDay ?? localDayIndex();
  const isActive = input.isActive ?? false;

  db.transaction(tx => {
    const existing = tx
      .select()
      .from(schedules)
      .where(eq(schedules.id, scheduleId))
      .get();

    const shared = {
      name: input.name,
      recurrenceType: input.recurrenceType,
      periodLength: input.periodLength,
      anchorDay,
      isActive,
      updatedAt: now,
    };

    if (existing) {
      tx.update(schedules)
        .set(shared)
        .where(eq(schedules.id, scheduleId))
        .run();
    } else {
      tx.insert(schedules)
        .values({
          ...shared,
          id: scheduleId,
          userId: LOCAL_USER_ID,
          createdAt: now,
        })
        .run();
    }

    // At most one schedule is active at a time.
    if (isActive) {
      tx.update(schedules)
        .set({ isActive: false })
        .where(ne(schedules.id, scheduleId))
        .run();
    }

    replaceSlots(tx, scheduleId, input);
  });

  notifyTableChanged(schedules, scheduleSlots);
  return getSchedule(scheduleId)!;
}

export function setActiveSchedule(scheduleId: string, active: boolean): void {
  db.transaction(tx => {
    if (active) {
      tx.update(schedules).set({ isActive: false }).run();
    }
    tx.update(schedules)
      .set({ isActive: active })
      .where(eq(schedules.id, scheduleId))
      .run();
  });
  notifyTableChanged(schedules);
}

export function deleteSchedule(scheduleId: string): void {
  db.delete(schedules).where(eq(schedules.id, scheduleId)).run();
  // Slots cascade via FK.
  notifyTableChanged(schedules, scheduleSlots);
}
