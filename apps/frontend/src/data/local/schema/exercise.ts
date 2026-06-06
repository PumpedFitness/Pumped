import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import type { ExerciseCategory, ExerciseEquipment, MuscleGroup } from '../enums';
import { enumText, jsonArray } from './columns';

export const exercises = sqliteTable('exercise', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  exerciseCategory: enumText<ExerciseCategory>()('exercise_category').notNull(),
  muscleGroups: jsonArray<MuscleGroup>()('muscle_groups').notNull(),
  equipment: jsonArray<ExerciseEquipment>()('equipment').notNull(),
  createdAt: integer('created_at').notNull(),
});
