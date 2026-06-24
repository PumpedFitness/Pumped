import type { SetTypeFieldDef } from '@/types/setType';
import { displayWeight } from '@/utils/units';
import type { WeightUnit } from '@/data/local/schema/userProfile';

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
