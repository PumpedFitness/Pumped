import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import type { SetFieldDataType, SetFieldUnit } from '@/data/local/enums';
import type { SetTypeFieldConfig } from '@/types/setType';
import { enumText, jsonObject } from './columns';
import { setTypes } from './setType';

// The fields a set type tracks. One row per field; a set stores values keyed by
// these ids in its `field_values` JSON. `config` holds numeric bounds / required
// flag (see SetTypeFieldConfig). Cascades when the owning set type is deleted.
export const setTypeFields = sqliteTable(
  'set_type_field',
  {
    id: text('id').primaryKey().notNull(),
    setTypeId: text('set_type_id')
      .notNull()
      .references(() => setTypes.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    dataType: enumText<SetFieldDataType>()('data_type').notNull(),
    unit: enumText<SetFieldUnit>()('unit'),
    position: integer('position').notNull().default(0),
    config: jsonObject<SetTypeFieldConfig>()('config').notNull().default({}),
    createdAt: integer('created_at').notNull(),
  },
  table => [
    index('idx_set_type_field_type_position').on(
      table.setTypeId,
      table.position,
    ),
  ],
);
