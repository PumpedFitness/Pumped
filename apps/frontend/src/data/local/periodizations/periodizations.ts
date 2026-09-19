import { asc, eq } from 'drizzle-orm';
import { db } from '@/data/local/database';
import { periodizations, schedules } from '@/data/local/schema';
import { notifyTableChanged } from '@/data/local/tableVersions';
import { LOCAL_USER_ID } from '@/data/local/workouts/validation';
import type {
  Periodization,
  SavePeriodizationInput,
} from '@/types/periodization';
import { localDayIndex } from '@/data/local/schedules/scheduleResolution';
import { i18n } from '@/i18n';

export function listPeriodizations(): Periodization[] {
  return db
    .select()
    .from(periodizations)
    .orderBy(asc(periodizations.name))
    .all();
}

export function savePeriodization(
  input: SavePeriodizationInput,
): Periodization {
  const name = input.name.trim();
  if (!name) {
    throw new Error(i18n.t('schedule.periodization.nameRequired'));
  }
  const now = Date.now();
  const existing = db
    .select()
    .from(periodizations)
    .where(eq(periodizations.id, input.id))
    .get();

  if (existing) {
    db.update(periodizations)
      .set({ name, phases: input.phases, updatedAt: now })
      .where(eq(periodizations.id, input.id))
      .run();
  } else {
    db.insert(periodizations)
      .values({
        id: input.id,
        userId: LOCAL_USER_ID,
        name,
        phases: input.phases,
        anchorDay: null,
        isActive: false,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }

  notifyTableChanged(periodizations);
  return db
    .select()
    .from(periodizations)
    .where(eq(periodizations.id, input.id))
    .get()!;
}

export function setActivePeriodization(
  periodizationId: string,
  active: boolean,
): void {
  db.transaction(tx => {
    if (active) {
      tx.update(periodizations).set({ isActive: false }).run();
      tx.update(schedules).set({ isActive: false }).run();
    }
    tx.update(periodizations)
      .set({
        isActive: active,
        anchorDay: active ? localDayIndex() : null,
        updatedAt: Date.now(),
      })
      .where(eq(periodizations.id, periodizationId))
      .run();
  });
  notifyTableChanged(periodizations, schedules);
}

export function deletePeriodization(periodizationId: string): void {
  db.delete(periodizations).where(eq(periodizations.id, periodizationId)).run();
  notifyTableChanged(periodizations);
}
