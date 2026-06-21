import type { TFunction } from 'i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type { EditableExerciseSet } from '@/types/exercise';
import type { SetFieldValue } from '@/types/workout';
import type { SetTypeFieldDef } from '@/types/setType';
import { getFieldValue } from '@/data/local/sets/fieldValues';
import { displayWeight } from '@/utils/units';
import { formatSetNumber, type SetTypeOption } from './exerciseSetTableModel';

// Summarises an exercise's sets grouped by set type, in first-seen order, using
// the resolved set-type labels (built-in i18n names or custom tag names).
export function formatExerciseSetSummary(
  t: TFunction,
  sets: EditableExerciseSet[],
  setTypeOptions: SetTypeOption[],
): string {
  const labelById = new Map(
    setTypeOptions.map(option => [option.value, option.label] as const),
  );
  const counts = new Map<string, number>();
  const order: string[] = [];
  sets.forEach(set => {
    if (!counts.has(set.setType)) {
      order.push(set.setType);
    }
    counts.set(set.setType, (counts.get(set.setType) ?? 0) + 1);
  });

  return order
    .map(id => ({
      count: counts.get(id) ?? 0,
      label: labelById.get(id) ?? id,
    }))
    .filter(item => item.count > 0)
    .map(item =>
      t('setTable.summaryItem', { count: item.count, type: item.label }),
    )
    .join(' · ');
}

function fieldUnit(field: SetTypeFieldDef, weightUnit: WeightUnit): string {
  if (field.unit === 'amount') {
    return weightUnit;
  }
  if (field.unit === 'percentage') {
    return '%';
  }
  return field.unit === 'seconds' ? 's' : '';
}

function withUnit(value: string, unit: string): string {
  return unit ? `${value} ${unit}` : value;
}

function formatRangeDetail(
  field: SetTypeFieldDef,
  value: SetFieldValue,
  unit: string,
): string | null {
  const range = value.range;
  if (!range || (range.min === null && range.max === null)) {
    return null;
  }
  const low = range.min !== null ? formatSetNumber(range.min) : '?';
  const high = range.max !== null ? formatSetNumber(range.max) : '?';
  return `${field.name} ${withUnit(`${low}–${high}`, unit)}`;
}

/** A short "Label value" detail for one of a set's fields, or null when empty. */
export function formatSetFieldDetail(
  field: SetTypeFieldDef,
  values: SetFieldValue[],
  weightUnit: WeightUnit,
): string | null {
  const value = getFieldValue(values, field.id);
  if (!value) {
    return null;
  }
  if (field.dataType === 'boolean') {
    return value.bool ? field.name : null;
  }
  if (field.dataType === 'text') {
    return value.text ? `${field.name} ${value.text}` : null;
  }
  const unit = fieldUnit(field, weightUnit);
  if (field.dataType === 'range') {
    return formatRangeDetail(field, value, unit);
  }
  if (value.number != null) {
    const shown =
      field.unit === 'amount'
        ? displayWeight(value.number, weightUnit)
        : value.number;
    return `${field.name} ${withUnit(formatSetNumber(shown), unit)}`;
  }
  return null;
}
