import { getNumberValue } from '@/data/local/sets/fieldValues';
import {
  formatNumber,
  rangeRolloverRangeField,
  rangeRolloverTargetField,
} from '@/data/local/sets/progressionGoals';
import type { ProgressionGoal, SetTypeFieldDef } from '@/types/setType';
import type { PerformedSet } from '@/types/workout';
import { formatWeight } from '@/utils/units';

import type {
  ProgressionFieldSuggestion,
  ProgressionSuggestedSet,
} from './progressionSuggestionTypes';

type WeightUnit = 'kg' | 'lbs';

function durationText(seconds: number): string {
  return `${formatNumber(seconds)} s`;
}

function displayValueForField(
  field: SetTypeFieldDef,
  value: number,
  weightUnit: WeightUnit,
): string {
  if (field.unit === 'amount') {
    return formatWeight(value, weightUnit);
  }
  if (field.unit === 'seconds') {
    return durationText(value);
  }
  return formatNumber(value);
}

function fieldSuggestionsText(
  fieldSuggestions: ProgressionFieldSuggestion[],
): string | null {
  const text = fieldSuggestions
    .map(suggestion => suggestion.displayValue)
    .filter(Boolean)
    .join(' x ');
  return text || null;
}

export function lastCompatibleSetForFields(
  setTypeId: string,
  fieldIds: string[],
  sets: PerformedSet[],
  setOrder: number,
): PerformedSet | null {
  const candidates = sets.filter(
    set =>
      set.setType === setTypeId &&
      fieldIds.every(
        fieldId => getNumberValue(set.fieldValues, fieldId) != null,
      ),
  );
  return candidates[setOrder] ?? candidates[candidates.length - 1] ?? null;
}

export function autoTargetForRangeRolloverGoal(
  goal: Extract<ProgressionGoal, { kind: 'rangeRollover' }>,
  currentFields: SetTypeFieldDef[],
  previous: PerformedSet,
  weightUnit: WeightUnit,
): ProgressionSuggestedSet | null {
  const rangeField = rangeRolloverRangeField(currentFields, goal);
  const targetField = rangeRolloverTargetField(currentFields, goal);
  if (!rangeField || !targetField) {
    return null;
  }

  const previousRangeValue = getNumberValue(
    previous.fieldValues,
    rangeField.id,
  );
  const previousTargetValue = getNumberValue(
    previous.fieldValues,
    targetField.id,
  );
  if (previousRangeValue == null || previousTargetValue == null) {
    return null;
  }

  const nextRangeValue = previousRangeValue + goal.rangeIncrement;
  const shouldRollover = nextRangeValue > goal.rangeMax;
  const rangeValue = shouldRollover ? goal.rangeMin : nextRangeValue;
  const targetValue = shouldRollover
    ? previousTargetValue + goal.targetIncrement
    : previousTargetValue;
  const fieldSuggestions = currentFields.reduce<ProgressionFieldSuggestion[]>(
    (suggestions, currentField) => {
      const lastValue = getNumberValue(previous.fieldValues, currentField.id);
      if (lastValue == null) {
        return suggestions;
      }
      const value =
        currentField.id === rangeField.id
          ? rangeValue
          : currentField.id === targetField.id
            ? targetValue
            : lastValue;
      suggestions.push({
        fieldId: currentField.id,
        value,
        displayValue: displayValueForField(currentField, value, weightUnit),
      });
      return suggestions;
    },
    [],
  );
  const displayText = fieldSuggestionsText(fieldSuggestions);
  return {
    weightKg: targetField.unit === 'amount' ? targetValue : undefined,
    reps: rangeField.unit == null ? rangeValue : undefined,
    durationSeconds:
      rangeField.unit === 'seconds'
        ? rangeValue
        : targetField.unit === 'seconds'
          ? targetValue
          : undefined,
    fieldSuggestions,
    displayText: displayText ?? undefined,
  };
}
