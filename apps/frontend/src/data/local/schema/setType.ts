import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// User-configurable set-type library. Each type OWNS its field schema (see
// set_type_field). Seeded with built-ins (is_built_in = 1) whose ids equal the
// WorkoutSetType strings, plus user-created types. A set's `set_type` column
// holds an id from here. `icon` is a ClayIcon name; `position` orders the list.
export const setTypes = sqliteTable('set_type', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  icon: text('icon'),
  isBuiltIn: integer('is_built_in', { mode: 'boolean' })
    .notNull()
    .default(false),
  position: integer('position').notNull().default(0),
  createdAt: integer('created_at').notNull(),
});
