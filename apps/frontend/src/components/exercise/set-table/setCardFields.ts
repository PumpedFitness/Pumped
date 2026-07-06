import type { TFunction } from 'i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type { SetFieldRange, SetFieldValue } from '@/types/workout';
import type { SetTypeFieldDef } from '@/types/setType';
import { displayWeight } from '@/utils/units';
import {
  getBoolValue,
  getFieldValue,
  getNumberValue,
  getRangeValue,
  getTextValue,
  isFieldValueValid,
  setBoolValue,
  setNumberValue,
  setRangeValue,
  setTextValue,
  type FieldValueMode,
} from '@/data/local/sets/fieldValues';
import type { OptionalWheelPickerConfig } from '@/components/forms/OptionalWheelPickerSheet';
import {
  suggestedNumberValue,
  suggestedRangeValue,
  type SuggestedSetValues,
} from './exerciseSetSuggestion';

type SetCardFieldLayout = 'inline' | 'fullWidth';

type SetFieldComparisonHint = {
  label: string;
  positive: boolean;
  neutral: boolean;
};

type BaseCardField = {
  id: string;
  label: string;
  layout: SetCardFieldLayout;
  /** Unit suffix to display (e.g. "kg", "%", "s"); empty for unit-less. */
  unit: string;
  isValid?: boolean;
  /** Whether a value is required to complete the set (drives the marker). */
  required: boolean;
  readOnly: boolean;
  /** Delta vs. the previous session's same set, shown below the value in read-only mode. */
  comparisonHint?: SetFieldComparisonHint;
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

function displayNumberValue(
  field: SetTypeFieldDef,
  values: SetFieldValue[],
  options: FieldBuildOptions,
): number | null {
  const value = getNumberValue(values, field.id);
  // History shows logged weights (stored in kg) in the user's unit. Template
  // targets are stored as-typed, so only convert in actual mode.
  if (
    options.readOnly &&
    options.mode === 'actual' &&
    field.unit === 'amount' &&
    value != null
  ) {
    return displayWeight(value, options.weightUnit);
  }
  return value;
}

function displayedDelta(
  field: SetTypeFieldDef,
  currentValue: number,
  previousValue: number,
  weightUnit: WeightUnit,
): number {
  const delta =
    field.unit === 'amount'
      ? displayWeight(currentValue, weightUnit) -
        displayWeight(previousValue, weightUnit)
      : currentValue - previousValue;
  return Math.round(delta * 10) / 10;
}

function deltaLabel(
  delta: number,
  field: SetTypeFieldDef,
  weightUnit: WeightUnit,
): string {
  const sign = delta >= 0 ? '+' : '';
  const value = formatSetNumber(delta);
  if (field.unit === 'amount') {
    return `${sign}${value} ${weightUnit}`;
  }
  if (field.unit === 'percentage') {
    return `${sign}${value}%`;
  }
  if (field.unit === 'seconds') {
    return `${sign}${value}s`;
  }
  return `${sign}${value}`;
}

function comparisonHint(
  field: SetTypeFieldDef,
  values: SetFieldValue[],
  options: FieldBuildOptions,
): SetFieldComparisonHint | undefined {
  if (
    !options.readOnly ||
    options.mode !== 'actual' ||
    options.previousValues == null
  ) {
    return undefined;
  }

  const currentValue = getNumberValue(values, field.id);
  const previousValue = getNumberValue(options.previousValues, field.id);
  if (currentValue == null || previousValue == null) {
    return undefined;
  }

  const delta = displayedDelta(
    field,
    currentValue,
    previousValue,
    options.weightUnit,
  );
  return {
    label: deltaLabel(delta, field, options.weightUnit),
    positive: delta > 0,
    neutral: delta === 0,
  };
}

function baseCardField(
  field: SetTypeFieldDef,
  values: SetFieldValue[],
  options: FieldBuildOptions,
  unit: string,
): BaseCardField {
  return {
    id: field.id,
    label: field.name,
    layout: field.dataType === 'text' ? 'fullWidth' : 'inline',
    unit,
    isValid: isFieldValueValid(
      field,
      getFieldValue(values, field.id),
      options.mode,
    ),
    required: field.config.required ?? false,
    readOnly: options.readOnly,
  };
}

function buildNumberCardField(
  field: SetTypeFieldDef,
  values: SetFieldValue[],
  options: FieldBuildOptions,
  base: BaseCardField,
  unit: string,
): SetCardNumberField {
  const bounded = isBoundedNumber(field.config);
  return {
    ...base,
    kind: 'number',
    value: displayNumberValue(field, values, options),
    comparisonHint: comparisonHint(field, values, options),
    suggestedValue: suggestedNumberValue(
      field,
      options.suggestion,
      options.weightUnit,
    ),
    input: bounded ? 'wheel' : 'keyboard',
    allowDecimal: (field.config.decimals ?? 0) > 0,
    wheelConfig: bounded ? buildWheelConfig(options.t, field, unit) : undefined,
    onChange: next => options.onChange(setNumberValue(values, field.id, next)),
  };
}

export function buildCardField(
  field: SetTypeFieldDef,
  values: SetFieldValue[],
  options: FieldBuildOptions,
): SetCardField {
  const unit = unitSuffix(field.unit, options.weightUnit);
  const base = baseCardField(field, values, options, unit);

  switch (field.dataType) {
    case 'number':
      return buildNumberCardField(field, values, options, base, unit);
    case 'boolean':
      return {
        ...base,
        kind: 'boolean',
        value: getBoolValue(values, field.id),
        onChange: next =>
          options.onChange(setBoolValue(values, field.id, next)),
      };
    case 'text':
      return {
        ...base,
        kind: 'text',
        value: getTextValue(values, field.id),
        onChange: next =>
          options.onChange(setTextValue(values, field.id, next)),
      };
    case 'range':
      // A session logs a single number against the planned range.
      if (options.mode === 'actual') {
        return buildNumberCardField(field, values, options, base, unit);
      }
      return {
        ...base,
        kind: 'range',
        range: getRangeValue(values, field.id),
        suggestedRange: suggestedRangeValue(
          field,
          options.suggestion,
          options.weightUnit,
        ),
        wheelConfig: buildWheelConfig(options.t, field, unit),
        onChange: next =>
          options.onChange(setRangeValue(values, field.id, next)),
      };
  }
}
