import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { ScheduleKind, ScheduleRecurrenceType } from '@/data/local/enums';
import { enumText } from './columns';
import { workoutTemplates } from './workoutTemplate';

// A Schedule arranges N workouts over a repeating timeline. Both recurrence
// modes reduce to a single integer `dayOffset` per slot:
//   WEEKLY → dayOffset = weekIndex * 7 + weekday (Mon=0 … Sun=6)
//   CYCLE  → dayOffset ∈ [0, periodLength)
// `anchorDay` is a local-midnight day index (days since the 1970 epoch computed
// from the device's local calendar date) pinning rotation index 0 to the
// calendar. Local time — never UTC — is the source of truth for day boundaries.
export const schedules = sqliteTable(
  'schedule',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    kind: enumText<ScheduleKind>()('kind').notNull(),
    recurrenceType:
      enumText<ScheduleRecurrenceType>()('recurrence_type').notNull(),
    periodLength: integer('period_length').notNull(),
    anchorDay: integer('anchor_day').notNull(),
    isActive: integer('is_active', { mode: 'boolean' })
      .notNull()
      .default(false),
    // Set for BASIC schedules — the single template they belong to.
    ownerTemplateId: text('owner_template_id').references(
      () => workoutTemplates.id,
      { onDelete: 'cascade' },
    ),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  table => [index('idx_schedule_owner').on(table.ownerTemplateId)],
);

export const scheduleSlots = sqliteTable(
  'schedule_slot',
  {
    id: text('id').primaryKey().notNull(),
    scheduleId: text('schedule_id')
      .notNull()
      .references(() => schedules.id, { onDelete: 'cascade' }),
    dayOffset: integer('day_offset').notNull(),
    position: integer('position').notNull().default(0),
    workoutTemplateId: text('workout_template_id')
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: 'cascade' }),
  },
  table => [
    index('idx_schedule_slot_schedule_day').on(
      table.scheduleId,
      table.dayOffset,
      table.position,
    ),
  ],
);
