import type { SetTypeFieldDef } from '@/types/setType';
import type { SetFieldRange, SetFieldValue } from '@/types/workout';
import { displayWeight } from '@/utils/units';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import {
  getFieldValue,
  getNumberValue,
  isFieldValueValid,
  setNumberValue,
} from '@/data/local/sets/fieldValues';

export type SuggestedFieldValue = {
  fieldId?: string;
  value: number | string;
  displayValue: string;
};

export type SuggestedSetValues = {
  weightKg?: number;
  reps?: number;
  durationSeconds?: number;
  fieldSuggestions?: SuggestedFieldValue[];
  displayText?: string;
  lastPerformedText?: string;
  isLastPerformanceOnly?: boolean;
};

function fieldSuggestionValue(
  field: SetTypeFieldDef,
  suggestion?: SuggestedSetValues,
  weightUnit?: WeightUnit,
): number | undefined {
  const matched = suggestion?.fieldSuggestions?.find(
    value => value.fieldId === field.id,
  );
  if (typeof matched?.value !== 'number') {
    return undefined;
  }
  return field.unit === 'amount' && weightUnit
    ? displayWeight(matched.value, weightUnit)
    : matched.value;
}

export function suggestedNumberValue(
  field: SetTypeFieldDef,
  suggestion?: SuggestedSetValues,
  weightUnit?: WeightUnit,
): number | undefined {
  return fieldSuggestionValue(field, suggestion, weightUnit);
}

export function suggestedRangeValue(
  field: SetTypeFieldDef,
  suggestion?: SuggestedSetValues,
  weightUnit?: WeightUnit,
): SetFieldRange | undefined {
  const value = fieldSuggestionValue(field, suggestion, weightUnit);
  return value === undefined ? undefined : { min: value, max: value };
}

/**
 * Writes the suggestion into every number field still left empty.
 *
 * A suggested value already sits in the field as its placeholder, so finishing
 * the set has to mean "log what I can see" — otherwise the commonest case of
 * all, doing exactly what was proposed, fails validation on a number that is
 * on screen. The value written is the displayed one, identical to what typing
 * the placeholder by hand would have stored.
 *
 * Returns `values` unchanged when there is nothing to fill, so the caller can
 * skip the write. A suggestion that would not survive the field's own bounds is
 * left out rather than written in: a stale suggestion should still surface as
 * an error the user can see, not become logged data.
 */
export function fillEmptyFieldsFromSuggestion(
  fields: SetTypeFieldDef[],
  values: SetFieldValue[],
  suggestion: SuggestedSetValues | undefined,
  weightUnit: WeightUnit,
): SetFieldValue[] {
  if (!suggestion) {
    return values;
  }
  // A range field logs a single number in a session, so it fills like a number.
  return fields.reduce((next, field) => {
    if (field.dataType !== 'number' && field.dataType !== 'range') {
      return next;
    }
    if (getNumberValue(next, field.id) !== null) {
      return next;
    }
    const suggested = suggestedNumberValue(field, suggestion, weightUnit);
    if (suggested === undefined) {
      return next;
    }
    const filled = setNumberValue(next, field.id, suggested);
    return isFieldValueValid(field, getFieldValue(filled, field.id), 'actual')
      ? filled
      : next;
  }, values);
}
