import type { db } from '@/data/local/database';
import { setTypeFields, setTypes } from '@/data/local/schema';
import {
  BUILT_IN_SET_TYPE_FIELDS,
  BUILT_IN_SET_TYPES,
} from '@/data/local/builtins';

type LocalDatabase = typeof db;

// Built-in set types and their fields are APP CONSTANTS, not sample data — they
// back every set's `set_type` and field values. They must exist in production
// too, so this runs unconditionally on init (NOT behind the __DEV__ seed).
// onConflictDoNothing keeps it idempotent and preserves any user edits.
export function seedBuiltInTags(database: LocalDatabase, now: number): void {
  database
    .insert(setTypes)
    .values(
      BUILT_IN_SET_TYPES.map((type, index) => ({
        id: type.id,
        name: type.name,
        icon: type.icon,
        isBuiltIn: true,
        position: index,
        createdAt: now,
      })),
    )
    .onConflictDoNothing()
    .run();

  database
    .insert(setTypeFields)
    .values(
      BUILT_IN_SET_TYPE_FIELDS.map((field, index) => ({
        id: field.id,
        setTypeId: field.setTypeId,
        name: field.name,
        dataType: field.dataType,
        unit: field.unit,
        position: index,
        config: field.config,
        createdAt: now,
      })),
    )
    .onConflictDoNothing()
    .run();
}
