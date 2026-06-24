import type { TFunction } from 'i18next';
import { getNumberValue } from '@/data/local/sets/fieldValues';
import {
  formatNumber,
  isProgressionGoalCompatible,
  progressionField,
} from '@/data/local/sets/progressionGoals';
import type {
  ProgressionGoal,
  SetTypeFieldDef,
  SetTypeWithFields,
} from '@/types/setType';
import type {
  PerformedSet,
  WorkoutTemplateExercise,
  WorkoutTemplateSet,
} from '@/types/workout';
import { formatWeight } from '@/utils/units';
import type {
  ProgressionFieldSuggestion,
  ProgressionSuggestedSet,
  ProgressionSuggestionResult,
} from './progressionSuggestionTypes';

type WeightUnit = 'kg' | 'lbs';

function durationText(seconds: number): string {
  return `${formatNumber(seconds)} s`;
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

function fieldsForSet(
  set: WorkoutTemplateSet,
  fieldsBySetType: Map<string, SetTypeFieldDef[]>,
): SetTypeFieldDef[] {
  return fieldsBySetType.get(set.setType) ?? [];
}

function progressionGoalForSet(
  set: WorkoutTemplateSet,
  setTypesById: Map<string, SetTypeWithFields>,
): ProgressionGoal {
  return (
    set.progressionGoal ??
    setTypesById.get(set.setType)?.progressionGoal ?? { kind: 'none' }
  );
}

function lastCompatibleSet(
  setTypeId: string,
  fieldId: string,
  sets: PerformedSet[],
): PerformedSet | null {
  for (let index = sets.length - 1; index >= 0; index -= 1) {
    const set = sets[index];
    if (
      set.setType === setTypeId &&
      getNumberValue(set.fieldValues, fieldId) != null
    ) {
      return set;
    }
  }
  return null;
}

function lastOnlySuggestion(
  t: TFunction,
  lastText: string | null,
  fieldSuggestions: ProgressionFieldSuggestion[] = [],
): ProgressionSuggestedSet {
  return {
    fieldSuggestions,
    displayText: lastText
      ? t('progression.suggestion.lastTime', { target: lastText })
      : t('progression.suggestion.noPreviousSets'),
    lastPerformedText: lastText ?? undefined,
    isLastPerformanceOnly: true,
  };
}

function performedSuggestionForSet(
  set: WorkoutTemplateSet,
  performed: PerformedSet[],
  fieldsBySetType: Map<string, SetTypeFieldDef[]>,
  weightUnit: WeightUnit,
): ProgressionSuggestedSet {
  const fields = fieldsForSet(set, fieldsBySetType);
  const previous = performed
    .slice()
    .reverse()
    .find(candidate =>
      fields.some(
        field => getNumberValue(candidate.fieldValues, field.id) != null,
      ),
    );
  const fieldSuggestions = previous
    ? fields.reduce<ProgressionFieldSuggestion[]>((suggestions, field) => {
        const value = getNumberValue(previous.fieldValues, field.id);
        if (value == null) return suggestions;
        suggestions.push({
          fieldId: field.id,
          value,
          displayValue:
            field.unit === 'amount'
              ? formatWeight(value, weightUnit)
              : field.unit === 'seconds'
                ? durationText(value)
                : formatNumber(value),
        });
        return suggestions;
      }, [])
    : [];
  const text = fieldSuggestionsText(fieldSuggestions);
  return {
    fieldSuggestions,
    displayText: text ?? undefined,
    lastPerformedText: text ?? undefined,
    isLastPerformanceOnly: true,
  };
}

export function buildNoneResult(
  t: TFunction,
  templateExercise: WorkoutTemplateExercise,
  performed: PerformedSet[],
  setTypesById: Map<string, SetTypeWithFields>,
  fieldsBySetType: Map<string, SetTypeFieldDef[]>,
  weightUnit: WeightUnit,
): ProgressionSuggestionResult {
  const suggestedSets = templateExercise.sets.map(set => {
    const suggestion = performedSuggestionForSet(
      set,
      performed,
      fieldsBySetType,
      weightUnit,
    );
    return {
      ...suggestion,
      displayText: suggestion.displayText
        ? t('progression.suggestion.lastTime', {
            target: suggestion.displayText,
          })
        : t('progression.suggestion.noPreviousSets'),
    };
  });
  const firstSuggestion = suggestedSets.find(set => set.lastPerformedText);
  const text = firstSuggestion?.lastPerformedText ?? null;
  return {
    kind: text ? 'last_performed' : 'none',
    fieldSuggestions: firstSuggestion?.fieldSuggestions ?? [],
    suggestedSets,
    displayText: text
      ? t('progression.suggestion.lastTime', { target: text })
      : t('progression.suggestion.noPreviousSets'),
    lastPerformedText: text ?? undefined,
    hasSuggestion: text != null,
    isLastPerformanceOnly: true,
    missingRequirement: text ? undefined : 'last_performance',
  };
}

function autoTargetForGoal(
  goal: Extract<ProgressionGoal, { kind: 'linear' }>,
  currentFields: SetTypeFieldDef[],
  previous: PerformedSet,
  weightUnit: WeightUnit,
): ProgressionSuggestedSet | null {
  const field = progressionField(currentFields, goal);
  if (!field) {
    return null;
  }
  const previousValue = getNumberValue(previous.fieldValues, field.id);
  if (previousValue == null) {
    return null;
  }
  const progressedValue = previousValue + goal.increment;
  const fieldSuggestions = currentFields.reduce<ProgressionFieldSuggestion[]>(
    (suggestions, currentField) => {
      const lastValue = getNumberValue(previous.fieldValues, currentField.id);
      if (lastValue == null) {
        return suggestions;
      }
      const value = currentField.id === field.id ? progressedValue : lastValue;
      const displayValue =
        currentField.unit === 'amount'
          ? formatWeight(value, weightUnit)
          : currentField.unit === 'seconds'
            ? durationText(value)
            : formatNumber(value);
      suggestions.push({
        fieldId: currentField.id,
        value,
        displayValue,
      });
      return suggestions;
    },
    [],
  );
  const displayText = fieldSuggestionsText(fieldSuggestions);
  const displayValue =
    field.unit === 'amount'
      ? formatWeight(progressedValue, weightUnit)
      : field.unit === 'seconds'
        ? durationText(progressedValue)
        : formatNumber(progressedValue);
  return {
    weightKg: field.unit === 'amount' ? progressedValue : undefined,
    reps: undefined,
    durationSeconds: field.unit === 'seconds' ? progressedValue : undefined,
    fieldSuggestions,
    displayText: displayText ?? displayValue,
  };
}

function buildAutoSetSuggestion(
  t: TFunction,
  set: WorkoutTemplateSet,
  setTypesById: Map<string, SetTypeWithFields>,
  fieldsBySetType: Map<string, SetTypeFieldDef[]>,
  performed: PerformedSet[],
  weightUnit: WeightUnit,
): ProgressionSuggestedSet {
  const goal = progressionGoalForSet(set, setTypesById);
  const currentFields = fieldsForSet(set, fieldsBySetType);
  if (
    goal.kind === 'none' ||
    !isProgressionGoalCompatible(goal, currentFields)
  ) {
    const performedSuggestion = performedSuggestionForSet(
      set,
      performed,
      fieldsBySetType,
      weightUnit,
    );
    return lastOnlySuggestion(
      t,
      performedSuggestion.lastPerformedText ?? null,
      performedSuggestion.fieldSuggestions,
    );
  }
  const field = progressionField(currentFields, goal);
  const previous = field
    ? lastCompatibleSet(set.setType, field.id, performed)
    : null;
  const suggestion = previous
    ? autoTargetForGoal(goal, currentFields, previous, weightUnit)
    : null;
  if (!suggestion) {
    const performedSuggestion = performedSuggestionForSet(
      set,
      performed,
      fieldsBySetType,
      weightUnit,
    );
    return lastOnlySuggestion(
      t,
      performedSuggestion.lastPerformedText ?? null,
      performedSuggestion.fieldSuggestions,
    );
  }
  return {
    ...suggestion,
    displayText: suggestion.displayText
      ? t('progression.suggestion.suggested', {
          target: suggestion.displayText,
        })
      : undefined,
    isLastPerformanceOnly: false,
  };
}

export function buildLinearResult(
  t: TFunction,
  templateExercise: WorkoutTemplateExercise,
  setTypesById: Map<string, SetTypeWithFields>,
  fieldsBySetType: Map<string, SetTypeFieldDef[]>,
  performed: PerformedSet[],
  weightUnit: WeightUnit,
): ProgressionSuggestionResult {
  const suggestedSets = templateExercise.sets.map(set =>
    buildAutoSetSuggestion(
      t,
      set,
      setTypesById,
      fieldsBySetType,
      performed,
      weightUnit,
    ),
  );
  const firstSuggestion = suggestedSets.find(
    set => !set.isLastPerformanceOnly && set.fieldSuggestions?.length,
  );
  const fallback = suggestedSets[0];
  const hasSuggestion = firstSuggestion != null;
  return {
    kind: hasSuggestion
      ? 'suggestion'
      : fallback?.lastPerformedText
        ? 'last_performed'
        : 'none',
    fieldSuggestions: firstSuggestion?.fieldSuggestions ?? [],
    suggestedWeightKg: firstSuggestion?.weightKg,
    suggestedReps: firstSuggestion?.reps,
    suggestedSets,
    displayText: firstSuggestion?.displayText ?? fallback?.displayText,
    lastPerformedText: fallback?.lastPerformedText,
    hasSuggestion,
    isLastPerformanceOnly: !hasSuggestion,
    missingRequirement: hasSuggestion ? undefined : 'last_performance',
  };
}
