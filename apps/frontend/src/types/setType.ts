import type { SetFieldDataType, SetFieldUnit } from '@/data/local/enums';

export type SetFieldRole =
  | 'weight'
  | 'reps'
  | 'duration'
  | 'distance'
  | 'rpe'
  | 'rir'
  | 'notes'
  | 'other';

export type ProgressionGoal =
  | {
      kind: 'linear';
      fieldId?: string;
      increment: number;
    }
  | {
      kind: 'none';
    };

/** Palette colour for a set type's pill/badge (matches the app's accent set). */
export type SetTypeColorName =
  | 'terracotta'
  | 'honey'
  | 'rose'
  | 'moss'
  | 'sage'
  | 'slate';

/** Per-field configuration. Numeric bounds drive wheel pickers + validation;
 *  `required` gates set completion (a set can't be marked done until every
 *  required field is filled). */
export type SetTypeFieldConfig = {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  /** Decimal places allowed for `number`/`range` entry. 0 = integers only. */
  decimals?: number;
  required?: boolean;
};

/** A resolved field definition belonging to a set type. */
export type SetTypeFieldDef = {
  id: string;
  setTypeId: string;
  name: string;
  dataType: SetFieldDataType;
  unit: SetFieldUnit | null;
  position: number;
  config: SetTypeFieldConfig;
};

/** A set type plus its ordered fields. `name`/`fields[].name` are display-ready
 *  (built-in labels resolved via i18n upstream). */
export type SetTypeWithFields = {
  id: string;
  name: string;
  icon: string | null;
  color: SetTypeColorName;
  isBuiltIn: boolean;
  position: number;
  progressionGoal: ProgressionGoal;
  fields: SetTypeFieldDef[];
};
