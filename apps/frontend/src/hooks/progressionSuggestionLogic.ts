import type { TFunction } from 'i18next';
import { getNumberValue } from '@/data/local/sets/fieldValues';
import {
  formatNumber,
  isProgressionGoalCompatible,
  normalizeProgressionGoal,
  progressionField,
  rangeRolloverRangeField,
  rangeRolloverTargetField,
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
import {
  autoTargetForRangeRolloverGoal,
  lastCompatibleSetForFields,
} from './progressionRangeRollover';

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
  setOrder: number,
): PerformedSet | null {
  const candidates = sets.filter(
    set =>
      set.setType === setTypeId &&
      getNumberValue(set.fieldValues, fieldId) != null,
  );
  return candidates[setOrder] ?? candidates[candidates.length - 1] ?? null;
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
  setOrder: number,
  performed: PerformedSet[],
  fieldsBySetType: Map<string, SetTypeFieldDef[]>,
  weightUnit: WeightUnit,
): ProgressionSuggestedSet {
  const fields = fieldsForSet(set, fieldsBySetType);
  const matchingSets = performed.filter(
    candidate =>
      candidate.setType === set.setType &&
      fields.some(
        field => getNumberValue(candidate.fieldValues, field.id) != null,
      ),
  );
  const previous =
    matchingSets[setOrder] ?? matchingSets[matchingSets.length - 1];
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

function previousSetForGoal(
  goal: Exclude<ProgressionGoal, { kind: 'none' }>,
  set: WorkoutTemplateSet,
  currentFields: SetTypeFieldDef[],
  performed: PerformedSet[],
  setOrder: number,
): PerformedSet | null {
  if (goal.kind === 'linear') {
    const field = progressionField(currentFields, goal);
    return field
      ? lastCompatibleSet(set.setType, field.id, performed, setOrder)
      : null;
  }

  const rangeField = rangeRolloverRangeField(currentFields, goal);
  const targetField = rangeRolloverTargetField(currentFields, goal);
  return rangeField && targetField
    ? lastCompatibleSetForFields(
        set.setType,
        [rangeField.id, targetField.id],
        performed,
        setOrder,
      )
    : null;
}

function autoTargetForNormalizedGoal(
  goal: Exclude<ProgressionGoal, { kind: 'none' }>,
  currentFields: SetTypeFieldDef[],
  previous: PerformedSet,
  weightUnit: WeightUnit,
): ProgressionSuggestedSet | null {
  if (goal.kind === 'linear') {
    return autoTargetForGoal(goal, currentFields, previous, weightUnit);
  }
  return autoTargetForRangeRolloverGoal(
    goal,
    currentFields,
    previous,
    weightUnit,
  );
}

function buildAutoSetSuggestion(
  t: TFunction,
  set: WorkoutTemplateSet,
  setOrder: number,
  setTypesById: Map<string, SetTypeWithFields>,
  fieldsBySetType: Map<string, SetTypeFieldDef[]>,
  performed: PerformedSet[],
  weightUnit: WeightUnit,
): ProgressionSuggestedSet {
  const currentFields = fieldsForSet(set, fieldsBySetType);
  const goal = normalizeProgressionGoal(
    progressionGoalForSet(set, setTypesById),
    currentFields,
  );
  if (
    goal.kind === 'none' ||
    !isProgressionGoalCompatible(goal, currentFields)
  ) {
    const performedSuggestion = performedSuggestionForSet(
      set,
      setOrder,
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
  const previous = previousSetForGoal(
    goal,
    set,
    currentFields,
    performed,
    setOrder,
  );
  const suggestion = previous
    ? autoTargetForNormalizedGoal(goal, currentFields, previous, weightUnit)
    : null;
  if (!suggestion) {
    const performedSuggestion = performedSuggestionForSet(
      set,
      setOrder,
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

type ProgressionSuggestionContext = {
  t: TFunction;
  templateExercise: WorkoutTemplateExercise;
  setTypesById: Map<string, SetTypeWithFields>;
  fieldsBySetType: Map<string, SetTypeFieldDef[]>;
  performed: PerformedSet[];
  weightUnit: WeightUnit;
};

type SetProgressionSuggestionContext = Omit<
  ProgressionSuggestionContext,
  'templateExercise'
> & {
  set: WorkoutTemplateSet;
  setOrder: number;
};

type SetProgressionSuggestionStrategy = (
  context: SetProgressionSuggestionContext,
) => ProgressionSuggestedSet;

const setProgressionSuggestionStrategies: Record<
  ProgressionGoal['kind'],
  SetProgressionSuggestionStrategy
> = {
  none: ({ t, set, setOrder, fieldsBySetType, performed, weightUnit }) => {
    const performedSuggestion = performedSuggestionForSet(
      set,
      setOrder,
      performed,
      fieldsBySetType,
      weightUnit,
    );
    return lastOnlySuggestion(
      t,
      performedSuggestion.lastPerformedText ?? null,
      performedSuggestion.fieldSuggestions,
    );
  },
  linear: context =>
    buildAutoSetSuggestion(
      context.t,
      context.set,
      context.setOrder,
      context.setTypesById,
      context.fieldsBySetType,
      context.performed,
      context.weightUnit,
    ),
  rangeRollover: context =>
    buildAutoSetSuggestion(
      context.t,
      context.set,
      context.setOrder,
      context.setTypesById,
      context.fieldsBySetType,
      context.performed,
      context.weightUnit,
    ),
};

function normalizedProgressionGoalForSet({
  set,
  setTypesById,
  fieldsBySetType,
}: Pick<
  SetProgressionSuggestionContext,
  'set' | 'setTypesById' | 'fieldsBySetType'
>): ProgressionGoal {
  return normalizeProgressionGoal(
    progressionGoalForSet(set, setTypesById),
    fieldsForSet(set, fieldsBySetType),
  );
}

function buildSetProgressionSuggestion(
  context: SetProgressionSuggestionContext,
): ProgressionSuggestedSet {
  const goal = normalizedProgressionGoalForSet(context);
  return setProgressionSuggestionStrategies[goal.kind](context);
}

export function buildProgressionSuggestionResult(
  context: ProgressionSuggestionContext,
): ProgressionSuggestionResult {
  const seenBySetType = new Map<string, number>();
  const suggestedSets = context.templateExercise.sets.map(set => {
    const setOrder = seenBySetType.get(set.setType) ?? 0;
    seenBySetType.set(set.setType, setOrder + 1);
    return buildSetProgressionSuggestion({ ...context, set, setOrder });
  });
  const firstSuggestion = suggestedSets.find(
    set => !set.isLastPerformanceOnly && set.fieldSuggestions?.length,
  );
  const fallback =
    suggestedSets.find(set => set.lastPerformedText) ?? suggestedSets[0];
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
