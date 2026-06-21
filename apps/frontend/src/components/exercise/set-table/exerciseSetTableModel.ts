import type { TFunction } from 'i18next';
import type { SetTypeId } from '@/data/local/enums';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type {
  CurrentWorkoutSet,
  UpdateCurrentWorkoutSetInput,
} from '@/stores/currentWorkoutModel';
import type { EditableExerciseSet } from '@/types/exercise';
import type { PerformedSet, SetFieldRange, SetFieldValue } from '@/types/workout';
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

/** A selectable set type — label resolved upstream (i18n or custom name). */
export type SetTypeOption = {
  value: SetTypeId;
  label: string;
};

/** Everything the set tables need to resolve a set's type into fields/labels. */
type SetTypeContext = {
  setTypeOptions: SetTypeOption[];
  setTypesById: Map<string, SetTypeWithFields>;
  weightUnit: WeightUnit;
};

type BaseTableProps = SetTypeContext & {
  addSetLabel?: string;
  onAddSet: () => void;
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
  onChangeSet: (setId: string, values: UpdateCurrentWorkoutSetInput) => void;
  onToggleSetDone: (setId: string) => boolean;
  onRemoveSet: (set: CurrentWorkoutSet) => DeleteResult;
  onCreateSetType: (name: string) => string;
};

type ReadOnlyExerciseSet = Pick<
  PerformedSet,
  'id' | 'setType' | 'restSeconds' | 'fieldValues'
>;

type ReadOnlyExerciseSetTableProps = SetTypeContext & {
  readOnly: true;
  sets: ReadOnlyExerciseSet[];
};

export type ExerciseSetTableProps =
  | EditableExerciseSetTableProps
  | ReadOnlyExerciseSetTableProps;

type BaseCardField = {
  id: string;
  label: string;
  /** Unit suffix to display (e.g. "kg", "%", "s"); empty for unit-less. */
  unit: string;
  isValid?: boolean;
  /** Whether a value is required to complete the set (drives the marker). */
  required: boolean;
  readOnly: boolean;
};

/** A single editable/displayable value on a set card, by data type. */
export type SetCardField =
  | (BaseCardField & {
      kind: 'number';
      value: number | null;
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
      wheelConfig: OptionalWheelPickerConfig;
      onChange: (value: SetFieldRange | null) => void;
    });

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
  /** Universal per-set rest chip; null only when read-only with no rest. */
  rest: SetCardRest | null;
  tone: 'default' | 'completed';
  isDone?: boolean;
  /** The active set to log next (first not-done) — shows the "NOW" badge. */
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
};

function buildCardField(
  field: SetTypeFieldDef,
  values: SetFieldValue[],
  options: FieldBuildOptions,
): SetCardField {
  const { mode, readOnly, weightUnit, t, onChange } = options;
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
    // History shows logged weights in the user's unit.
    if (readOnly && field.unit === 'amount' && value != null) {
      value = displayWeight(value, weightUnit);
    }
    return {
      ...base,
      kind: 'number',
      value,
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
      tone: 'default',
      isCurrent: false,
      canRemove: props.sets.length > 1,
      readOnly: false,
      onSetTypeChange: setType =>
        props.onChangeSet(index, {
          ...set,
          setType,
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
          onChange: next => props.onChangeSet(set.id, { fieldValues: next }),
        }),
      ),
      rest: {
        value: set.restSeconds,
        readOnly: false,
        onChange: value => props.onChangeSet(set.id, { restSeconds: value }),
      },
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

export function buildReadOnlySetCards(
  t: TFunction,
  props: ReadOnlyExerciseSetTableProps,
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
          mode: 'actual',
          readOnly: true,
          weightUnit: props.weightUnit,
          t,
          onChange: () => undefined,
        }),
      ),
      rest:
        set.restSeconds != null
          ? { value: set.restSeconds, readOnly: true, onChange: () => undefined }
          : null,
      tone: 'default',
      isCurrent: false,
      canRemove: false,
      readOnly: true,
      onSetTypeChange: () => undefined,
      onRemove: () => undefined,
    };
  });
}
