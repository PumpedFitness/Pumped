import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { getNumberValue, getRangeValue } from '@/data/local/sets/fieldValues';
import { resolveSetWeightReps } from '@/data/local/sets/setTypes';
import { performedSets, workoutSessions } from '@/data/local/schema';
import { useTableQuery } from '@/data/local/tableVersions';
import {
  getWorkoutSession,
  listWorkoutSessions,
} from '@/data/local/workouts/sessions';
import type { SetTypeFieldDef } from '@/types/setType';
import type {
  ProgressionMode,
  SetFieldRange,
  WorkoutTemplateExercise,
  WorkoutTemplateSet,
} from '@/types/workout';
import { formatWeight } from '@/utils/units';
import { useSetTypeLibrary } from './useSetTypeLibrary';
import { useUserProfile } from './useUserProfile';

export const DEFAULT_WEIGHT_INCREMENT_KG = 2.5;

export type ProgressionSuggestionResult = {
  mode: ProgressionMode;
  suggestedWeightKg?: number;
  suggestedReps?: number;
  suggestedSets: ProgressionSuggestedSet[];
  displayText?: string;
  lastPerformedText?: string;
  reason?: string;
  hasSuggestion: boolean;
  isLastPerformanceOnly: boolean;
  missingRequirement?: 'last_performance' | 'manual_target';
};

type LastPerformedSet = {
  weightKg?: number;
  reps?: number;
};

export type ProgressionSuggestedSet = LastPerformedSet;

type ProgressionSuggestionParams = {
  exerciseId: string;
  templateExercise: WorkoutTemplateExercise;
};

type TargetValues = {
  weightKg?: number;
  reps?: number;
  repRange?: SetFieldRange;
};
type WeightUnit = 'kg' | 'lbs';

function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function repsText(reps: number): string {
  return `${formatNumber(reps)} reps`;
}

function targetText(
  weightKg: number | undefined,
  reps: number | undefined,
  weightUnit: WeightUnit,
): string | null {
  if (weightKg != null && reps != null) {
    return `${formatWeight(weightKg, weightUnit)} x ${formatNumber(reps)}`;
  }
  if (weightKg != null) {
    return formatWeight(weightKg, weightUnit);
  }
  if (reps != null) {
    return repsText(reps);
  }
  return null;
}

function setText(set: LastPerformedSet, weightUnit: WeightUnit): string | null {
  return targetText(set.weightKg, set.reps, weightUnit);
}

function isRepsField(field: SetTypeFieldDef): boolean {
  const name = field.name.toLowerCase();
  const id = field.id.toLowerCase();
  if (name.includes('rep') || id.includes('rep')) {
    return true;
  }
  return (
    field.unit === null &&
    (field.dataType === 'number' || field.dataType === 'range') &&
    (field.config.max == null || field.config.max > 10)
  );
}

function fieldsForSet(
  set: WorkoutTemplateSet,
  fieldsBySetType: Map<string, SetTypeFieldDef[]>,
): { weightField?: SetTypeFieldDef; repsField?: SetTypeFieldDef } {
  const fields = fieldsBySetType.get(set.setType) ?? [];
  return {
    weightField: fields.find(
      field => field.unit === 'amount' && field.dataType === 'number',
    ),
    repsField: fields.find(isRepsField),
  };
}

function targetValuesForSet(
  set: WorkoutTemplateSet,
  fieldsBySetType: Map<string, SetTypeFieldDef[]>,
): TargetValues {
  const { weightField, repsField } = fieldsForSet(set, fieldsBySetType);
  return {
    weightKg: weightField
      ? getNumberValue(set.fieldValues, weightField.id) ?? undefined
      : undefined,
    reps:
      repsField && repsField.dataType === 'number'
        ? getNumberValue(set.fieldValues, repsField.id) ?? undefined
        : undefined,
    repRange:
      repsField && repsField.dataType === 'range'
        ? getRangeValue(set.fieldValues, repsField.id) ?? undefined
        : undefined,
  };
}

function firstManualTarget(
  templateExercise: WorkoutTemplateExercise,
  fieldsBySetType: Map<string, SetTypeFieldDef[]>,
): TargetValues | null {
  for (const set of templateExercise.sets) {
    const values = targetValuesForSet(set, fieldsBySetType);
    const reps = values.reps ?? values.repRange?.min ?? undefined;
    if (values.weightKg != null || reps != null) {
      return { ...values, reps };
    }
  }
  return null;
}

function firstRepRange(
  templateExercise: WorkoutTemplateExercise,
  fieldsBySetType: Map<string, SetTypeFieldDef[]>,
): SetFieldRange | null {
  for (const set of templateExercise.sets) {
    const range = targetValuesForSet(set, fieldsBySetType).repRange;
    if (range && range.min != null && range.max != null) {
      return range;
    }
  }
  return null;
}

function lastValidSet(sets: LastPerformedSet[]): LastPerformedSet | null {
  for (let index = sets.length - 1; index >= 0; index -= 1) {
    const set = sets[index];
    if (set.weightKg != null || set.reps != null) {
      return set;
    }
  }
  return null;
}

function emptyResult(
  mode: ProgressionMode,
  missingRequirement: ProgressionSuggestionResult['missingRequirement'],
): ProgressionSuggestionResult {
  return {
    mode,
    suggestedSets: [],
    hasSuggestion: false,
    isLastPerformanceOnly: false,
    missingRequirement,
  };
}

function buildManualResult(
  t: TFunction,
  templateExercise: WorkoutTemplateExercise,
  fieldsBySetType: Map<string, SetTypeFieldDef[]>,
  weightUnit: WeightUnit,
): ProgressionSuggestionResult {
  const mode: ProgressionMode = 'manual';
  const manualTarget = firstManualTarget(templateExercise, fieldsBySetType);
  const suggestedSets = templateExercise.sets
    .map(set => {
      const values = targetValuesForSet(set, fieldsBySetType);
      return {
        weightKg: values.weightKg,
        reps: values.reps ?? values.repRange?.min ?? undefined,
      };
    })
    .filter(set => set.weightKg != null || set.reps != null);
  const text = manualTarget
    ? targetText(manualTarget.weightKg, manualTarget.reps, weightUnit)
    : null;
  if (!text) {
    return {
      ...emptyResult(mode, 'manual_target'),
      displayText: t('progression.suggestion.noManualTarget'),
    };
  }
  return {
    mode,
    suggestedWeightKg: manualTarget?.weightKg,
    suggestedReps: manualTarget?.reps,
    suggestedSets,
    displayText: t('progression.suggestion.suggested', { target: text }),
    hasSuggestion: true,
    isLastPerformanceOnly: false,
  };
}

function buildNoneResult(
  t: TFunction,
  performedSets: LastPerformedSet[],
  weightUnit: WeightUnit,
): ProgressionSuggestionResult {
  const lastText = performedSets
    .map(set => setText(set, weightUnit))
    .filter((value): value is string => value != null)
    .join(', ');
  return {
    mode: 'none',
    suggestedSets: performedSets,
    displayText: lastText
      ? t('progression.suggestion.lastTime', { target: lastText })
      : t('progression.suggestion.noPreviousSets'),
    lastPerformedText: lastText || undefined,
    hasSuggestion: lastText.length > 0,
    isLastPerformanceOnly: true,
    missingRequirement: lastText ? undefined : 'last_performance',
  };
}

function nextAutoTarget(
  base: LastPerformedSet,
  range: SetFieldRange | null,
): LastPerformedSet {
  if (range?.min == null || range.max == null || base.reps == null) {
    return base;
  }
  if (base.reps >= range.max) {
    return {
      weightKg:
        base.weightKg == null
          ? undefined
          : base.weightKg + DEFAULT_WEIGHT_INCREMENT_KG,
      reps: range.min,
    };
  }
  return { ...base, reps: Math.min(base.reps + 1, range.max) };
}

function buildAutoResult(
  t: TFunction,
  templateExercise: WorkoutTemplateExercise,
  fieldsBySetType: Map<string, SetTypeFieldDef[]>,
  performedSets: LastPerformedSet[],
  weightUnit: WeightUnit,
): ProgressionSuggestionResult {
  const mode: ProgressionMode = 'auto';
  const base = lastValidSet(performedSets);
  if (!base) {
    return emptyResult(mode, 'last_performance');
  }

  const suggested = nextAutoTarget(
    base,
    firstRepRange(templateExercise, fieldsBySetType),
  );
  const text = targetText(suggested.weightKg, suggested.reps, weightUnit);
  if (!text) {
    return emptyResult(mode, 'last_performance');
  }
  return {
    mode,
    suggestedWeightKg: suggested.weightKg,
    suggestedReps: suggested.reps,
    suggestedSets: [suggested],
    displayText: t('progression.suggestion.suggested', { target: text }),
    hasSuggestion: true,
    isLastPerformanceOnly: false,
  };
}

export function useProgressionSuggestion({
  exerciseId,
  templateExercise,
}: ProgressionSuggestionParams): ProgressionSuggestionResult {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const { byId: setTypesById } = useSetTypeLibrary();
  const lastPerformedSets = useTableQuery(
    [workoutSessions, performedSets],
    () => {
      const session = listWorkoutSessions()
        .filter(candidate => candidate.endedAt !== null)
        .map(candidate => getWorkoutSession(candidate.id))
        .find(
          candidate =>
            candidate?.sets.some(set => set.exerciseId === exerciseId) ?? false,
        );

      if (!session) {
        return [];
      }

      return session.sets
        .filter(set => set.exerciseId === exerciseId)
        .map(set => {
          const { weight, reps } = resolveSetWeightReps(set);
          return {
            weightKg: weight ?? undefined,
            reps: reps || undefined,
          };
        });
    },
    [exerciseId],
  );

  return useMemo(() => {
    const mode = templateExercise.progressionMode ?? 'auto';
    const weightUnit = profile.weightUnit;
    const fieldsBySetType = new Map(
      [...setTypesById.entries()].map(([setType, value]) => [
        setType,
        value.fields,
      ]),
    );
    const previousSets = lastPerformedSets;

    if (mode === 'manual') {
      return buildManualResult(
        t,
        templateExercise,
        fieldsBySetType,
        weightUnit,
      );
    }

    if (mode === 'none') {
      return buildNoneResult(t, previousSets, weightUnit);
    }

    return buildAutoResult(
      t,
      templateExercise,
      fieldsBySetType,
      previousSets,
      weightUnit,
    );
  }, [
    lastPerformedSets,
    profile.weightUnit,
    setTypesById,
    t,
    templateExercise,
  ]);
}
