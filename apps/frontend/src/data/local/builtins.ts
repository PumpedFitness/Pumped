// Built-in set-type definitions — the single source of truth shared by the
// seeder (which inserts the rows with these fixed ids) and the UI (which
// resolves a built-in row's display labels via i18n at render time instead of
// trusting the stored English `name`). User-created types/fields carry an
// arbitrary uuid + their own stored name and are not listed here.

import type { SetFieldDataType, SetFieldUnit, WorkoutSetType } from './enums';
import type { SetTypeColorName, SetTypeFieldConfig } from '@/types/setType';
import type { SetFieldValue } from '@/types/workout';

type SetTypeLabelKey = `setTable.setTypes.${
  | 'warmup'
  | 'working'
  | 'maxEffort'}`;

type SetFieldLabelKey = `setField.builtin.${'weight' | 'reps' | 'rpe'}`;

export type BuiltInSetType = {
  id: WorkoutSetType;
  /** Stable English fallback persisted in the row; UI prefers `labelKey`. */
  name: string;
  labelKey: SetTypeLabelKey;
  /** ClayIcon name. */
  icon: string;
  color: SetTypeColorName;
};

export type BuiltInSetTypeField = {
  id: string;
  setTypeId: WorkoutSetType;
  /** Stable English fallback persisted in the row; UI prefers `labelKey`. */
  name: string;
  labelKey: SetFieldLabelKey;
  dataType: SetFieldDataType;
  unit: SetFieldUnit | null;
  config: SetTypeFieldConfig;
};

export const BUILT_IN_SET_TYPES: readonly BuiltInSetType[] = [
  {
    id: 'WARMUP',
    name: 'Warm-up',
    labelKey: 'setTable.setTypes.warmup',
    icon: 'flame',
    color: 'honey',
  },
  {
    id: 'NORMAL',
    name: 'Working',
    labelKey: 'setTable.setTypes.working',
    icon: 'dumbbell',
    color: 'rose',
  },
  {
    id: 'MAX_EFFORT',
    name: 'Max Effort',
    labelKey: 'setTable.setTypes.maxEffort',
    icon: 'bolt',
    color: 'terracotta',
  },
];

const BUILT_IN_SET_TYPE_COLORS = new Map<string, SetTypeColorName>(
  BUILT_IN_SET_TYPES.map(type => [type.id, type.color]),
);

/** Palette colour for a built-in set type, or null for a custom type id. */
export function builtInSetTypeColor(id: string): SetTypeColorName | null {
  return BUILT_IN_SET_TYPE_COLORS.get(id) ?? null;
}

// Field-config presets. `weight` has no max → keyboard entry; bounded numbers
// (reps, rpe) render as wheel pickers.
const WEIGHT_CONFIG: SetTypeFieldConfig = {
  min: 0,
  decimals: 2,
  required: true,
};
const REPS_CONFIG: SetTypeFieldConfig = {
  min: 0,
  max: 30,
  step: 1,
  defaultValue: 8,
  decimals: 0,
  required: true,
};
const RPE_CONFIG: SetTypeFieldConfig = {
  min: 6,
  max: 10,
  step: 0.5,
  defaultValue: 8,
  decimals: 1,
  required: false,
};

/** Stable id for a built-in field, e.g. `NORMAL:weight`. */
export function builtInSetFieldId(
  setTypeId: WorkoutSetType,
  kind: 'weight' | 'reps' | 'rpe',
): string {
  return `${setTypeId}:${kind}`;
}

/** Builds the field-values array for a built-in set type from scalar inputs.
 *  Shared by seeds and the CSV importer. RPE is only kept for Max Effort. */
export function buildBuiltInFieldValues(
  setType: WorkoutSetType,
  values: { weight?: number | null; reps: number; rpe?: number | null },
): SetFieldValue[] {
  const fields: SetFieldValue[] = [];
  if (values.weight != null) {
    fields.push({
      fieldId: builtInSetFieldId(setType, 'weight'),
      number: values.weight,
    });
  }
  fields.push({
    fieldId: builtInSetFieldId(setType, 'reps'),
    number: values.reps,
  });
  if (values.rpe != null && setType === 'MAX_EFFORT') {
    fields.push({
      fieldId: builtInSetFieldId('MAX_EFFORT', 'rpe'),
      number: values.rpe,
    });
  }
  return fields;
}

function weightField(setTypeId: WorkoutSetType): BuiltInSetTypeField {
  return {
    id: builtInSetFieldId(setTypeId, 'weight'),
    setTypeId,
    name: 'Weight',
    labelKey: 'setField.builtin.weight',
    dataType: 'number',
    unit: 'amount',
    config: WEIGHT_CONFIG,
  };
}

function repsField(setTypeId: WorkoutSetType): BuiltInSetTypeField {
  return {
    id: builtInSetFieldId(setTypeId, 'reps'),
    setTypeId,
    name: 'Reps',
    labelKey: 'setField.builtin.reps',
    dataType: 'number',
    unit: null,
    config: REPS_CONFIG,
  };
}

function rpeField(setTypeId: WorkoutSetType): BuiltInSetTypeField {
  return {
    id: builtInSetFieldId(setTypeId, 'rpe'),
    setTypeId,
    name: 'RPE',
    labelKey: 'setField.builtin.rpe',
    dataType: 'number',
    unit: null,
    config: RPE_CONFIG,
  };
}

// Ordered fields per built-in type. Warmup/Working track weight + reps; Max
// Effort adds RPE.
export const BUILT_IN_SET_TYPE_FIELDS: readonly BuiltInSetTypeField[] = [
  weightField('WARMUP'),
  repsField('WARMUP'),
  weightField('NORMAL'),
  repsField('NORMAL'),
  weightField('MAX_EFFORT'),
  repsField('MAX_EFFORT'),
  rpeField('MAX_EFFORT'),
];

const BUILT_IN_SET_TYPE_LABEL_KEYS = new Map<string, SetTypeLabelKey>(
  BUILT_IN_SET_TYPES.map(type => [type.id, type.labelKey]),
);

const BUILT_IN_SET_FIELD_LABEL_KEYS = new Map<string, SetFieldLabelKey>(
  BUILT_IN_SET_TYPE_FIELDS.map(field => [field.id, field.labelKey]),
);

/** i18n key for a built-in set type, or null for a custom type id. */
export function builtInSetTypeLabelKey(id: string): SetTypeLabelKey | null {
  return BUILT_IN_SET_TYPE_LABEL_KEYS.get(id) ?? null;
}

/** i18n key for a built-in set field, or null for a custom field id. */
export function builtInSetFieldLabelKey(id: string): SetFieldLabelKey | null {
  return BUILT_IN_SET_FIELD_LABEL_KEYS.get(id) ?? null;
}
