import type { SetTypeFieldDef } from '@/types/setType';

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
): number | undefined {
  const matched = suggestion?.fieldSuggestions?.find(
    value => value.fieldId === field.id,
  );
  return typeof matched?.value === 'number' ? matched.value : undefined;
}

export function suggestedNumberValue(
  field: SetTypeFieldDef,
  suggestion?: SuggestedSetValues,
): number | undefined {
  return fieldSuggestionValue(field, suggestion);
}
