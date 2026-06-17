import type { TFunction } from 'i18next';
import type { WorkoutSetType } from '@/data/local/enums';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import {
  isCurrentWorkoutSetFieldValid,
  type CurrentWorkoutSet,
  type UpdateCurrentWorkoutSetInput,
} from '@/stores/currentWorkoutModel';
import type { EditableExerciseSet } from '@/types/exercise';
import type { PerformedSet } from '@/types/workout';
import { displayWeight } from '@/utils/units';
import type { OptionalWheelPickerConfig } from '@/components/forms/OptionalWheelPickerSheet';
import type {
  DeleteHandler,
  DeleteResult,
} from '@/components/clay/SwipeToDelete';

export type SetTypeOption = {
  value: WorkoutSetType;
  labelKey: `setTable.setTypes.${
    | 'warmup'
    | 'working'
    | 'backoff'
    | 'drop'
    | 'amrap'}`;
};

type BaseExerciseSetTableProps = {
  setTypeOptions: SetTypeOption[];
  addSetLabel?: string;
  onAddSet: () => void;
};

export type CollapsibleExerciseSetTableProps = BaseExerciseSetTableProps & {
  sets: EditableExerciseSet[];
  summary: string;
  expanded: boolean;
  onToggle: () => void;
  onChangeSet: (index: number, set: EditableExerciseSet) => void;
  onRemoveSet: (index: number) => void;
};

type EditableExerciseSetTableProps = BaseExerciseSetTableProps & {
  readOnly?: false;
  sets: CurrentWorkoutSet[];
  onChangeSet: (setId: string, values: UpdateCurrentWorkoutSetInput) => void;
  onToggleSetDone: (setId: string) => boolean;
  onRemoveSet: (set: CurrentWorkoutSet) => DeleteResult;
};

type ReadOnlyExerciseSet = Pick<
  PerformedSet,
  'id' | 'setType' | 'weight' | 'reps' | 'rpe'
>;

type ReadOnlyExerciseSetTableProps = {
  readOnly: true;
  sets: ReadOnlyExerciseSet[];
  setTypeOptions: SetTypeOption[];
  weightUnit: WeightUnit;
};

export type ExerciseSetTableProps =
  | EditableExerciseSetTableProps
  | ReadOnlyExerciseSetTableProps;

type BaseSetField = {
  id: string;
  accessibilityLabel: string;
  value: number | null;
  isValid?: boolean;
};

export type SetField =
  | (BaseSetField & {
      inputMethod: 'keyboard';
      allowDecimal: boolean;
    })
  | (BaseSetField & {
      inputMethod: 'wheel';
      wheelConfig: OptionalWheelPickerConfig;
    });

export type SetTableRow = {
  key: string;
  index: number;
  setType: WorkoutSetType;
  fields: [SetField, SetField, SetField];
  readOnly?: boolean;
  tone?: 'default' | 'completed';
  isDone?: boolean;
  canRemove: boolean;
  onSetTypeChange: (setType: WorkoutSetType) => void;
  onFieldChange: (fieldId: string, value: number | null) => void;
  onToggleDone?: () => boolean;
  onRemove: DeleteHandler;
};

export function buildTargetRepsWheelConfig(
  t: TFunction,
): OptionalWheelPickerConfig {
  return {
    title: t('setTable.sliders.targetReps.title'),
    description: t('setTable.sliders.targetReps.description'),
    minValue: 1,
    maxValue: 30,
    step: 1,
    defaultValue: 8,
    formatValue: value => t('setTable.sliders.repsValue', { count: value }),
  };
}

export function buildPercentageWheelConfig(
  t: TFunction,
): OptionalWheelPickerConfig {
  return {
    title: t('setTable.sliders.percentage.title'),
    description: t('setTable.sliders.percentage.description'),
    minValue: 5,
    maxValue: 100,
    step: 2.5,
    defaultValue: 70,
    formatValue: value => t('setTable.sliders.percentValue', { value }),
  };
}

export function buildTargetRpeWheelConfig(
  t: TFunction,
): OptionalWheelPickerConfig {
  return {
    title: t('setTable.sliders.targetRpe.title'),
    description: t('setTable.sliders.targetRpe.description'),
    minValue: 1,
    maxValue: 10,
    step: 0.5,
    defaultValue: 8,
    formatValue: value => t('setTable.sliders.rpeValue', { value }),
  };
}

export function buildRepsWheelConfig(t: TFunction): OptionalWheelPickerConfig {
  return {
    title: t('setTable.sliders.reps.title'),
    description: t('setTable.sliders.reps.description'),
    minValue: 0,
    maxValue: 30,
    step: 1,
    defaultValue: 8,
    formatValue: value => t('setTable.sliders.repsValue', { count: value }),
  };
}

export function buildRpeWheelConfig(t: TFunction): OptionalWheelPickerConfig {
  return {
    title: t('setTable.sliders.rpe.title'),
    description: t('setTable.sliders.rpe.description'),
    minValue: 6,
    maxValue: 10,
    step: 0.5,
    defaultValue: 8,
    formatValue: value => t('setTable.sliders.rpeValue', { value }),
  };
}

function parseOptionalNumber(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  return normalized ? Number(normalized) : null;
}

export function formatSetNumber(value: number | null): string {
  if (value === null) {
    return '';
  }
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function updateTemplateField(
  set: EditableExerciseSet,
  fieldId: string,
  value: number | null,
): EditableExerciseSet {
  const formattedValue = formatSetNumber(value);
  if (fieldId === 'reps') {
    return { ...set, targetReps: formattedValue };
  }
  if (fieldId === 'percentage') {
    return { ...set, targetPercentage1Rm: formattedValue };
  }
  return { ...set, targetRpe: formattedValue };
}

export function buildTemplateSetTableRows(
  t: TFunction,
  props: CollapsibleExerciseSetTableProps,
): SetTableRow[] {
  const targetRepsConfig = buildTargetRepsWheelConfig(t);
  const percentageConfig = buildPercentageWheelConfig(t);
  const targetRpeConfig = buildTargetRpeWheelConfig(t);

  return props.sets.map((set, index) => ({
    key: set.id,
    index,
    setType: set.setType,
    fields: [
      {
        id: 'reps',
        accessibilityLabel: t('setTable.a11y.setTargetReps', {
          number: index + 1,
        }),
        value: parseOptionalNumber(set.targetReps),
        inputMethod: 'wheel',
        wheelConfig: targetRepsConfig,
      },
      {
        id: 'percentage',
        accessibilityLabel: t('setTable.a11y.setPercentage', {
          number: index + 1,
        }),
        value: parseOptionalNumber(set.targetPercentage1Rm),
        inputMethod: 'wheel',
        wheelConfig: percentageConfig,
      },
      {
        id: 'rpe',
        accessibilityLabel: t('setTable.a11y.setTargetRpe', {
          number: index + 1,
        }),
        value: parseOptionalNumber(set.targetRpe),
        inputMethod: 'wheel',
        wheelConfig: targetRpeConfig,
      },
    ],
    canRemove: props.sets.length > 1,
    onSetTypeChange: setType => props.onChangeSet(index, { ...set, setType }),
    onFieldChange: (fieldId, value) =>
      props.onChangeSet(index, updateTemplateField(set, fieldId, value)),
    onRemove: () => props.onRemoveSet(index),
  }));
}

export function buildWorkoutSetTableRows(
  t: TFunction,
  props: EditableExerciseSetTableProps,
): SetTableRow[] {
  const repsConfig = buildRepsWheelConfig(t);
  const rpeConfig = buildRpeWheelConfig(t);

  return props.sets.map((set, index) => ({
    key: set.id,
    index,
    setType: set.setType,
    fields: [
      {
        id: 'weight',
        accessibilityLabel: t('setTable.a11y.setWeight', { number: index + 1 }),
        value: set.weight,
        isValid: isCurrentWorkoutSetFieldValid(set, 'weight'),
        inputMethod: 'keyboard',
        allowDecimal: true,
      },
      {
        id: 'reps',
        accessibilityLabel: t('setTable.a11y.setReps', { number: index + 1 }),
        value: set.reps,
        isValid: isCurrentWorkoutSetFieldValid(set, 'reps'),
        inputMethod: 'wheel',
        wheelConfig: repsConfig,
      },
      {
        id: 'rpe',
        accessibilityLabel: t('setTable.a11y.setRpe', { number: index + 1 }),
        value: set.rpe,
        isValid: isCurrentWorkoutSetFieldValid(set, 'rpe'),
        inputMethod: 'wheel',
        wheelConfig: rpeConfig,
      },
    ],
    tone: set.isDone ? 'completed' : 'default',
    isDone: set.isDone,
    canRemove: props.sets.length > 1,
    onSetTypeChange: setType => props.onChangeSet(set.id, { setType }),
    onFieldChange: (fieldId, value) =>
      props.onChangeSet(set.id, { [fieldId]: value }),
    onToggleDone: () => props.onToggleSetDone(set.id),
    onRemove: () => props.onRemoveSet(set),
  }));
}

export function buildReadOnlyWorkoutSetTableRows(
  t: TFunction,
  props: ReadOnlyExerciseSetTableProps,
): SetTableRow[] {
  const repsConfig = buildRepsWheelConfig(t);
  const rpeConfig = buildRpeWheelConfig(t);

  return props.sets.map((set, index) => ({
    key: set.id,
    index,
    setType: set.setType,
    fields: [
      {
        id: 'weight',
        accessibilityLabel: t('setTable.a11y.setWeight', { number: index + 1 }),
        value:
          set.weight === null
            ? null
            : displayWeight(set.weight, props.weightUnit),
        inputMethod: 'keyboard',
        allowDecimal: true,
      },
      {
        id: 'reps',
        accessibilityLabel: t('setTable.a11y.setReps', { number: index + 1 }),
        value: set.reps,
        inputMethod: 'wheel',
        wheelConfig: repsConfig,
      },
      {
        id: 'rpe',
        accessibilityLabel: t('setTable.a11y.setRpe', { number: index + 1 }),
        value: set.rpe,
        inputMethod: 'wheel',
        wheelConfig: rpeConfig,
      },
    ],
    readOnly: true,
    canRemove: false,
    onSetTypeChange: () => undefined,
    onFieldChange: () => undefined,
    onRemove: () => undefined,
  }));
}
