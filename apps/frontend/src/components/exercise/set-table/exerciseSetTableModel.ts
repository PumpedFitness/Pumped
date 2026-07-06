import type { TFunction } from 'i18next';
import type { SetTypeId } from '@/data/local/enums';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type {
  CurrentWorkoutSet,
  UpdateCurrentWorkoutSetInput,
} from '@/stores/currentWorkoutModel';
import type { EditableExerciseSet } from '@/types/exercise';
import type {
  PerformedSet,
  SetFieldRange,
  SetFieldValue,
} from '@/types/workout';
import type {
  SetTypeColorName,
  SetTypeFieldDef,
  SetTypeWithFields,
} from '@/types/setType';
import { displayWeight } from '@/utils/units';
import {
  getBoolValue,
  getFieldValue,
  getNumberValue,
  getRangeValue,
  getTextValue,
  isFieldValueValid,
  reconcileValuesForType,
  setBoolValue,
  setNumberValue,
  setRangeValue,
  setTextValue,
  type FieldValueMode,
} from '@/data/local/sets/fieldValues';
import type { OptionalWheelPickerConfig } from '@/components/forms/OptionalWheelPickerSheet';
import type {
  DeleteHandler,
  DeleteResult,
} from '@/components/clay/SwipeToDelete';
import {
  suggestedNumberValue,
  suggestedRangeValue,
  type SuggestedSetValues,
} from './exerciseSetSuggestion';
import {
  buildSetCardProgression,
  type SetCardProgression,
} from './setCardProgression';

export type SetTypeOption = { value: SetTypeId; label: string };

type SetTypeContext = {
  setTypeOptions: SetTypeOption[];
  setTypesById: Map<string, SetTypeWithFields>;
  weightUnit: WeightUnit;
};

type BaseTableProps = SetTypeContext & {
  addSetLabel?: string;
  onAddSet: () => void;
  // Whether set cards animate their layout (slide) when sets are added/removed.
  // Off in the active workout, where activation re-renders during the snap
  // scroll make the cards fly in oddly. Defaults to on. */
  animateLayout?: boolean;
};

export type TemplateSetTableProps = BaseTableProps & {
  sets: EditableExerciseSet[];
  onChangeSet: (index: number, set: EditableExerciseSet) => void;
  onRemoveSet: (index: number) => void;
  onDuplicateSet: () => void;
  onCreateSetType?: (name: string) => string;
};

type EditableExerciseSetTableProps = BaseTableProps & {
  readOnly?: false;
  sets: CurrentWorkoutSet[];
  suggestedSets?: SuggestedSetValues[];
  onChangeSet: (setId: string, values: UpdateCurrentWorkoutSetInput) => void;
  onToggleSetDone: (setId: string) => boolean;
  onRemoveSet: (set: CurrentWorkoutSet) => DeleteResult;
  onCreateSetType: (name: string) => string;
};

export type ReadOnlyExerciseSet = Pick<
  PerformedSet,
  'id' | 'setType' | 'restSeconds' | 'fieldValues'
> & {
  // Snapshot of the set type's fields as they were when the set was performed.
  // Present for history ('actual' mode); template previews ('target') have none
  // and fall back to the set type's current fields.
  fieldDefinitions?: PerformedSet['fieldDefinitions'];
};

export type ReadOnlyExerciseSetTableProps = SetTypeContext & {
  readOnly: true;
  sets: ReadOnlyExerciseSet[];
  // Sets from a previous session to diff against. Matched by position. When
  // provided, each card shows a comparison hint like "+1 reps, +2.5 kg".
  previousSets?: ReadOnlyExerciseSet[];
  // Which value slot to display: 'actual' (logged history, weights stored in kg
  // and converted to the user's unit) or 'target' (template plan, shown as-is,
  // ranges intact). Defaults to 'actual'.
  mode?: FieldValueMode;
};

export type ExerciseSetTableProps =
  EditableExerciseSetTableProps | ReadOnlyExerciseSetTableProps;

type BaseCardField = {
  id: string;
  label: string;
  /** Unit suffix to display (e.g. "kg", "%", "s"); empty for unit-less. */
  unit: string;
  isValid?: boolean;
  /** Whether a value is required to complete the set (drives the marker). */
  required: boolean;
  readOnly: boolean;
  /** Delta vs. the previous session's same set, shown below the value in read-only mode. */
  comparisonHint?: { label: string; positive: boolean; neutral: boolean };
};

export type SetCardField =
  | (BaseCardField & {
      kind: 'number';
      value: number | null;
      suggestedValue?: number;
      input: 'keyboard' | 'wheel';
      allowDecimal: boolean;
      wheelConfig?: OptionalWheelPickerConfig;
      onChange: (value: number | null) => void;
    })
  | (BaseCardField & {
      kind: 'boolean';
      value: boolean;
      onChange: (value: boolean) => void;
    })
  | (BaseCardField & {
      kind: 'text';
      value: string;
      onChange: (value: string) => void;
    })
  | (BaseCardField & {
      kind: 'range';
      range: SetFieldRange | null;
      suggestedRange?: SetFieldRange;
      wheelConfig: OptionalWheelPickerConfig;
      onChange: (value: SetFieldRange | null) => void;
    });

export type SetCardNumberField = Extract<SetCardField, { kind: 'number' }>;
export type SetCardRangeField = Extract<SetCardField, { kind: 'range' }>;

export type SetCardRest = {
  value: number | null;
  readOnly: boolean;
  onChange: (value: number | null) => void;
};

export type SetCardModel = {
  key: string;
  index: number;
  setType: SetTypeId;
  setTypeLabel: string;
  setTypeIcon: string | null;
  setTypeColor: SetTypeColorName;
  fields: SetCardField[];
  rest: SetCardRest | null;
  progression?: SetCardProgression;
  progressionBadgeText?: string;
  progressionBadgeVariant?: 'default' | 'positive';
  tone: 'default' | 'completed';
  isDone?: boolean;
  isCurrent: boolean;
  canRemove: boolean;
  readOnly: boolean;
  onSetTypeChange: (setType: SetTypeId) => void;
  onToggleDone?: () => boolean;
  onRemove: DeleteHandler;
};

export function formatSetNumber(value: number | null): string {
  if (value === null) {
    return '';
  }
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function unitSuffix(
  unit: SetTypeFieldDef['unit'],
  weightUnit: WeightUnit,
): string {
  if (unit === 'amount') {
    return weightUnit;
  }
  if (unit === 'percentage') {
    return '%';
  }
  if (unit === 'seconds') {
    return 's';
  }
  return '';
}

function progressionModeLabelKey(
  setGoal: { kind?: string } | null | undefined,
  typeGoal: { kind?: string } | null | undefined,
): 'progression.modes.rangeRollover' | 'progression.modes.linear' {
  return (setGoal ?? typeGoal)?.kind === 'rangeRollover'
    ? 'progression.modes.rangeRollover'
    : 'progression.modes.linear';
}

function isBoundedNumber(config: SetTypeFieldDef['config']): boolean {
  return config.min != null && config.max != null && config.step != null;
}

function buildWheelConfig(
  t: TFunction,
  field: SetTypeFieldDef,
  unit: string,
): OptionalWheelPickerConfig {
  const { config } = field;
  const formatValue = (value: number) =>
    unit
      ? t('setTable.wheel.valueWithUnit', {
          value: formatSetNumber(value),
          unit,
        })
      : formatSetNumber(value);
  return {
    title: field.name,
    description: t('setTable.wheel.description'),
    minValue: config.min ?? 0,
    maxValue: config.max ?? 100,
    step: config.step ?? 1,
    defaultValue: config.defaultValue ?? config.min ?? 0,
    formatValue,
  };
}

type FieldBuildOptions = {
  mode: FieldValueMode;
  readOnly: boolean;
  weightUnit: WeightUnit;
  t: TFunction;
  onChange: (next: SetFieldValue[]) => void;
  suggestion?: SuggestedSetValues;
  /** Field values from the previous session's matching set, used to compute deltas. */
  previousValues?: SetFieldValue[];
};

export function buildCardField(
  field: SetTypeFieldDef,
  values: SetFieldValue[],
  options: FieldBuildOptions,
): SetCardField {
  const { mode, readOnly, weightUnit, t, onChange, suggestion, previousValues } =
    options;
  const unit = unitSuffix(field.unit, weightUnit);
  const base = {
    id: field.id,
    label: field.name,
    unit,
    isValid: isFieldValueValid(field, getFieldValue(values, field.id), mode),
    required: field.config.required ?? false,
    readOnly,
  };

  const numberField = (): SetCardField => {
    let value = getNumberValue(values, field.id);
    // History shows logged weights (stored in kg) in the user's unit. Template
    // targets are stored as-typed, so only convert in actual mode.
    if (
      readOnly &&
      mode === 'actual' &&
      field.unit === 'amount' &&
      value != null
    ) {
      value = displayWeight(value, weightUnit);
    }

    let comparisonHint:
      | { label: string; positive: boolean; neutral: boolean }
      | undefined;
    if (readOnly && mode === 'actual' && previousValues != null) {
      const currRaw = getNumberValue(values, field.id);
      const prevRaw = getNumberValue(previousValues, field.id);
      if (currRaw != null && prevRaw != null) {
        let delta: number;
        if (field.unit === 'amount') {
          delta =
            displayWeight(currRaw, weightUnit) -
            displayWeight(prevRaw, weightUnit);
        } else {
          delta = currRaw - prevRaw;
        }
        delta = Math.round(delta * 10) / 10;
        const sign = delta >= 0 ? '+' : '';
        let label: string;
        if (field.unit === 'amount') {
          label = `${sign}${formatSetNumber(delta)} ${weightUnit}`;
        } else if (field.unit === 'percentage') {
          label = `${sign}${formatSetNumber(delta)}%`;
        } else if (field.unit === 'seconds') {
          label = `${sign}${formatSetNumber(delta)}s`;
        } else {
          label = `${sign}${formatSetNumber(delta)}`;
        }
        comparisonHint = { label, positive: delta > 0, neutral: delta === 0 };
      }
    }

    return {
      ...base,
      kind: 'number',
      value,
      comparisonHint,
      suggestedValue: suggestedNumberValue(field, suggestion, weightUnit),
      input: isBoundedNumber(field.config) ? 'wheel' : 'keyboard',
      allowDecimal: (field.config.decimals ?? 0) > 0,
      wheelConfig: isBoundedNumber(field.config)
        ? buildWheelConfig(t, field, unit)
        : undefined,
      onChange: next => onChange(setNumberValue(values, field.id, next)),
    };
  };

  switch (field.dataType) {
    case 'number':
      return numberField();
    case 'boolean':
      return {
        ...base,
        kind: 'boolean',
        value: getBoolValue(values, field.id),
        onChange: next => onChange(setBoolValue(values, field.id, next)),
      };
    case 'text':
      return {
        ...base,
        kind: 'text',
        value: getTextValue(values, field.id),
        onChange: next => onChange(setTextValue(values, field.id, next)),
      };
    case 'range':
      // A session logs a single number against the planned range.
      if (mode === 'actual') {
        return numberField();
      }
      return {
        ...base,
        kind: 'range',
        range: getRangeValue(values, field.id),
        suggestedRange: suggestedRangeValue(field, suggestion, weightUnit),
        wheelConfig: buildWheelConfig(t, field, unit),
        onChange: next => onChange(setRangeValue(values, field.id, next)),
      };
  }
}

function fieldsForType(
  context: SetTypeContext,
  setType: SetTypeId,
): SetTypeFieldDef[] {
  return context.setTypesById.get(setType)?.fields ?? [];
}

export function buildTemplateSetCards(
  t: TFunction,
  props: TemplateSetTableProps,
): SetCardModel[] {
  return props.sets.map((set, index) => {
    const type = props.setTypesById.get(set.setType);
    return {
      key: set.id,
      index,
      setType: set.setType,
      setTypeLabel: type?.name ?? set.setType,
      setTypeIcon: type?.icon ?? null,
      setTypeColor: type?.color ?? 'terracotta',
      fields: (type?.fields ?? []).map(field =>
        buildCardField(field, set.fieldValues, {
          mode: 'target',
          readOnly: false,
          weightUnit: props.weightUnit,
          t,
          onChange: next =>
            props.onChangeSet(index, { ...set, fieldValues: next }),
        }),
      ),
      rest: {
        value: set.restSeconds,
        readOnly: false,
        onChange: value =>
          props.onChangeSet(index, { ...set, restSeconds: value }),
      },
      progression: buildSetCardProgression(set, type, progressionGoal =>
        props.onChangeSet(index, { ...set, progressionGoal }),
      ),
      tone: 'default',
      isCurrent: false,
      canRemove: props.sets.length > 1,
      readOnly: false,
      onSetTypeChange: setType =>
        props.onChangeSet(index, {
          ...set,
          setType,
          progressionGoal: undefined,
          fieldValues: reconcileValuesForType(
            set.fieldValues,
            fieldsForType(props, setType),
          ),
        }),
      onRemove: () => props.onRemoveSet(index),
    };
  });
}

export function buildWorkoutSetCards(
  t: TFunction,
  props: EditableExerciseSetTableProps,
): SetCardModel[] {
  // The set to log next: the first one not yet marked done.
  const currentIndex = props.sets.findIndex(set => !set.isDone);
  return props.sets.map((set, index) => {
    const type = props.setTypesById.get(set.setType);
    const suggestion = props.suggestedSets?.[index];
    return {
      key: set.id,
      index,
      setType: set.setType,
      setTypeLabel: type?.name ?? set.setType,
      setTypeIcon: type?.icon ?? null,
      setTypeColor: type?.color ?? 'terracotta',
      fields: (type?.fields ?? []).map(field =>
        buildCardField(field, set.fieldValues, {
          mode: 'actual',
          readOnly: false,
          weightUnit: props.weightUnit,
          t,
          suggestion,
          onChange: next => props.onChangeSet(set.id, { fieldValues: next }),
        }),
      ),
      rest: {
        value: set.restSeconds,
        readOnly: false,
        onChange: value => props.onChangeSet(set.id, { restSeconds: value }),
      },
      progression: buildSetCardProgression(set, type, progressionGoal =>
        props.onChangeSet(set.id, { progressionGoal }),
      ),
      progressionBadgeText: suggestion
        ? t(
            suggestion.isLastPerformanceOnly
              ? 'progression.modes.none'
              : progressionModeLabelKey(
                  set.progressionGoal,
                  type?.progressionGoal,
                ),
          )
        : undefined,
      tone: set.isDone ? 'completed' : 'default',
      isDone: set.isDone,
      isCurrent: index === currentIndex,
      canRemove: props.sets.length > 1,
      readOnly: false,
      onSetTypeChange: setType =>
        props.onChangeSet(set.id, {
          setType,
          fieldValues: reconcileValuesForType(
            set.fieldValues,
            fieldsForType(props, setType),
          ),
        }),
      onToggleDone: () => props.onToggleSetDone(set.id),
      onRemove: () => props.onRemoveSet(set),
    };
  });
}
