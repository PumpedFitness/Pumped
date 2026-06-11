import type { WorkoutSetType } from '../../../data/local/enums';
import {
  isCurrentWorkoutSetFieldValid,
  type CurrentWorkoutSet,
  type UpdateCurrentWorkoutSetInput,
} from '../../../stores/currentWorkoutModel';
import type { EditableExerciseSet } from '../../../types/exercise';
import type { OptionalSliderConfig } from '../../forms/OptionalSliderSheet';

export type SetTypeOption = {
  value: WorkoutSetType;
  label: string;
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

export type ExerciseSetTableProps = BaseExerciseSetTableProps & {
  sets: CurrentWorkoutSet[];
  onChangeSet: (setId: string, values: UpdateCurrentWorkoutSetInput) => void;
  onToggleSetDone: (setId: string) => boolean;
  onRemoveSet: (set: CurrentWorkoutSet) => void;
};

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
      inputMethod: 'slider';
      sliderConfig: OptionalSliderConfig;
    });

export type SetTableRow = {
  key: string;
  index: number;
  setType: WorkoutSetType;
  fields: [SetField, SetField, SetField];
  tone?: 'default' | 'completed';
  isDone?: boolean;
  canRemove: boolean;
  onSetTypeChange: (setType: WorkoutSetType) => void;
  onFieldChange: (fieldId: string, value: number | null) => void;
  onToggleDone?: () => boolean;
  onRemove: () => void;
};

const TARGET_REPS_CONFIG: OptionalSliderConfig = {
  title: 'Target reps',
  description: 'Choose the planned repetitions for this set.',
  minValue: 1,
  maxValue: 30,
  step: 1,
  defaultValue: 8,
  formatValue: value => `${value} reps`,
};

const PERCENTAGE_CONFIG: OptionalSliderConfig = {
  title: 'Percentage',
  description: 'Choose the planned load percentage for this set.',
  minValue: 5,
  maxValue: 100,
  step: 2.5,
  defaultValue: 70,
  formatValue: value => `${value}%`,
};

const TARGET_RPE_CONFIG: OptionalSliderConfig = {
  title: 'Target RPE',
  description: 'Choose the planned effort from 1 to 10.',
  minValue: 1,
  maxValue: 10,
  step: 0.5,
  defaultValue: 8,
  formatValue: value => `RPE ${value}`,
};

const REPS_CONFIG: OptionalSliderConfig = {
  title: 'Reps',
  description: 'Choose the repetitions performed for this set.',
  minValue: 1,
  maxValue: 30,
  step: 1,
  defaultValue: 8,
  formatValue: value => `${value} reps`,
};

const RPE_CONFIG: OptionalSliderConfig = {
  title: 'RPE',
  description: 'Choose the effort for this set.',
  minValue: 6,
  maxValue: 10,
  step: 0.5,
  defaultValue: 8,
  formatValue: value => `RPE ${value}`,
};

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
  props: CollapsibleExerciseSetTableProps,
): SetTableRow[] {
  return props.sets.map((set, index) => ({
    key: `template-${index}`,
    index,
    setType: set.setType,
    fields: [
      {
        id: 'reps',
        accessibilityLabel: `Set ${index + 1} target reps`,
        value: parseOptionalNumber(set.targetReps),
        inputMethod: 'slider',
        sliderConfig: TARGET_REPS_CONFIG,
      },
      {
        id: 'percentage',
        accessibilityLabel: `Set ${index + 1} percentage`,
        value: parseOptionalNumber(set.targetPercentage1Rm),
        inputMethod: 'slider',
        sliderConfig: PERCENTAGE_CONFIG,
      },
      {
        id: 'rpe',
        accessibilityLabel: `Set ${index + 1} target RPE`,
        value: parseOptionalNumber(set.targetRpe),
        inputMethod: 'slider',
        sliderConfig: TARGET_RPE_CONFIG,
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
  props: ExerciseSetTableProps,
): SetTableRow[] {
  return props.sets.map((set, index) => ({
    key: set.id,
    index,
    setType: set.setType,
    fields: [
      {
        id: 'weight',
        accessibilityLabel: `Set ${index + 1} weight`,
        value: set.weight,
        isValid: isCurrentWorkoutSetFieldValid(set, 'weight'),
        inputMethod: 'keyboard',
        allowDecimal: true,
      },
      {
        id: 'reps',
        accessibilityLabel: `Set ${index + 1} reps`,
        value: set.reps,
        isValid: isCurrentWorkoutSetFieldValid(set, 'reps'),
        inputMethod: 'slider',
        sliderConfig: REPS_CONFIG,
      },
      {
        id: 'rpe',
        accessibilityLabel: `Set ${index + 1} RPE`,
        value: set.rpe,
        isValid: isCurrentWorkoutSetFieldValid(set, 'rpe'),
        inputMethod: 'slider',
        sliderConfig: RPE_CONFIG,
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
