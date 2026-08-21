// Reference lookups behind the delete-safety warnings: what a workout
// template, an exercise or a set type is still used by. Deleting any of them
// cascades silently — a template vanishes from every schedule that plans it,
// an exercise from every template that contains it — so the UI asks first.
//
// Plain functions over the local database, consumed through the `useUsage` hook.

import { eq } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { db } from '@/data/local/database';
import {
  schedules,
  scheduleSlots,
  workoutTemplateExercises,
  workoutTemplateSets,
  workoutTemplates,
} from '@/data/local/schema';
import {
  buildUsageMap,
  type UsageKind,
  type UsageMap,
  type UsageRow,
} from './usageModel';

// The tables each lookup reads — handed to useTableQuery so a write anywhere
// along the chain refreshes the badges.
const SCHEDULE_TABLES = [schedules, scheduleSlots];
const TEMPLATE_TABLES = [
  ...SCHEDULE_TABLES,
  workoutTemplates,
  workoutTemplateExercises,
];

export const USAGE_TABLES: Record<UsageKind, SQLiteTable[]> = {
  template: SCHEDULE_TABLES,
  exercise: TEMPLATE_TABLES,
  setType: [...TEMPLATE_TABLES, workoutTemplateSets],
};

// Template id → the schedules planning it. `activeScheduleName` is set only for
// the one active schedule, which is what makes a deletion worth warning about.
function scheduledTemplates(): UsageMap {
  const rows = db
    .select({
      itemId: scheduleSlots.workoutTemplateId,
      refName: schedules.name,
      isActive: schedules.isActive,
    })
    .from(scheduleSlots)
    .innerJoin(schedules, eq(schedules.id, scheduleSlots.scheduleId))
    .all();

  return buildUsageMap(
    rows.map(row => ({
      itemId: row.itemId,
      refName: row.refName,
      activeScheduleName: row.isActive ? row.refName : null,
    })),
  );
}

// Anything reached through a template inherits that template's schedule: an
// exercise inside a planned workout is itself part of the active plan.
function throughTemplates(
  rows: { itemId: string; templateId: string; refName: string }[],
): UsageMap {
  const scheduled = scheduledTemplates();
  return buildUsageMap(
    rows.map(
      (row): UsageRow => ({
        itemId: row.itemId,
        refName: row.refName,
        activeScheduleName:
          scheduled.get(row.templateId)?.activeScheduleName ?? null,
      }),
    ),
  );
}

function exerciseUsage(): UsageMap {
  return throughTemplates(
    db
      .select({
        itemId: workoutTemplateExercises.exerciseId,
        templateId: workoutTemplates.id,
        refName: workoutTemplates.name,
      })
      .from(workoutTemplateExercises)
      .innerJoin(
        workoutTemplates,
        eq(workoutTemplates.id, workoutTemplateExercises.workoutTemplateId),
      )
      .all(),
  );
}

function setTypeUsage(): UsageMap {
  return throughTemplates(
    db
      .select({
        itemId: workoutTemplateSets.setType,
        templateId: workoutTemplates.id,
        refName: workoutTemplates.name,
      })
      .from(workoutTemplateSets)
      .innerJoin(
        workoutTemplateExercises,
        eq(
          workoutTemplateExercises.id,
          workoutTemplateSets.workoutTemplateExerciseId,
        ),
      )
      .innerJoin(
        workoutTemplates,
        eq(workoutTemplates.id, workoutTemplateExercises.workoutTemplateId),
      )
      .all(),
  );
}

/** Everything currently referencing any item of `kind`, keyed by item id. */
export function listUsage(kind: UsageKind): UsageMap {
  switch (kind) {
    case 'template':
      return scheduledTemplates();
    case 'exercise':
      return exerciseUsage();
    case 'setType':
      return setTypeUsage();
  }
}
