import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { enumText } from './columns';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type WeightUnit = 'kg' | 'lbs';

export const userProfile = sqliteTable('user_profile', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull().default(''),
  gender: enumText<Gender>()('gender'),
  birthdate: text('birthdate'),
  heightCm: real('height_cm'),
  weightUnit: enumText<WeightUnit>()('weight_unit').notNull().default('kg'),
});
