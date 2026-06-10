import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { WorkoutSetType } from '../../data/local/enums';
import { colors } from '../../theme/tokens';
import type { EditableExerciseSet } from '../../types/exercise';
import { OptionSelectorSheet } from '../forms/OptionSelectorSheet';
import {
  OptionalSliderSheet,
  type OptionalSliderConfig,
} from '../forms/OptionalSliderSheet';
import { ClayIcon } from '../icons/ClayIcon';
import { ExerciseSetValueCell } from './ExerciseSetTable';

type ExerciseSetEditorProps = {
  index: number;
  set: EditableExerciseSet;
  canRemove: boolean;
  setTypeOptions: { value: WorkoutSetType; label: string }[];
  onChange: (set: EditableExerciseSet) => void;
  onRemove: () => void;
};

type PrescriptionField = 'REPS' | 'PERCENTAGE_1RM' | 'RPE';

const PRESCRIPTION_CONFIG: Record<PrescriptionField, OptionalSliderConfig> = {
  REPS: {
    title: 'Target reps',
    description: 'Choose the planned repetitions for this set.',
    minValue: 1,
    maxValue: 30,
    step: 1,
    defaultValue: 8,
    formatValue: value => `${value} reps`,
  },
  PERCENTAGE_1RM: {
    title: 'Percentage',
    description: 'Choose the planned load percentage for this set.',
    minValue: 5,
    maxValue: 100,
    step: 2.5,
    defaultValue: 70,
    formatValue: value => `${value}%`,
  },
  RPE: {
    title: 'Target RPE',
    description: 'Choose the planned effort from 1 to 10.',
    minValue: 1,
    maxValue: 10,
    step: 0.5,
    defaultValue: 8,
    formatValue: value => `RPE ${value}`,
  },
};

function parseOptionalNumber(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  return normalized ? Number(normalized) : null;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export function ExerciseSetEditor({
  index,
  set,
  canRemove,
  setTypeOptions,
  onChange,
  onRemove,
}: ExerciseSetEditorProps) {
  const [activePrescription, setActivePrescription] =
    useState<PrescriptionField | null>(null);
  const [isSetTypeSelectorOpen, setIsSetTypeSelectorOpen] = useState(false);
  const activeValue =
    activePrescription === 'REPS'
      ? set.targetReps
      : activePrescription === 'PERCENTAGE_1RM'
      ? set.targetPercentage1Rm
      : activePrescription === 'RPE'
      ? set.targetRpe
      : '';
  const setTypeLabel =
    setTypeOptions.find(option => option.value === set.setType)?.label ??
    'Working';

  const updatePrescription = (
    field: PrescriptionField,
    value: number | null,
  ) => {
    const formattedValue = value === null ? '' : formatNumber(value);
    const key =
      field === 'REPS'
        ? 'targetReps'
        : field === 'PERCENTAGE_1RM'
        ? 'targetPercentage1Rm'
        : 'targetRpe';
    onChange({ ...set, [key]: formattedValue });
  };

  return (
    <>
      <View className="flex-row items-center gap-1.5 border-t border-border-soft px-1 py-1">
        <Text className="w-6 text-center text-[12px] font-bold tabular-nums text-muted">
          {index + 1}
        </Text>
        <ExerciseSetValueCell
          accessibilityLabel={`Set ${index + 1} type`}
          value={setTypeLabel}
          align="left"
          onPress={() => setIsSetTypeSelectorOpen(true)}
        />
        <ExerciseSetValueCell
          accessibilityLabel={`Set ${index + 1} target reps`}
          value={set.targetReps}
          onPress={() => setActivePrescription('REPS')}
        />
        <ExerciseSetValueCell
          accessibilityLabel={`Set ${index + 1} percentage`}
          value={set.targetPercentage1Rm}
          onPress={() => setActivePrescription('PERCENTAGE_1RM')}
        />
        <ExerciseSetValueCell
          accessibilityLabel={`Set ${index + 1} target RPE`}
          value={set.targetRpe}
          onPress={() => setActivePrescription('RPE')}
        />
        {canRemove && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove set ${index + 1}`}
            className="h-10 w-8 items-center justify-center rounded-full active:bg-surface-card"
            onPress={onRemove}
          >
            <ClayIcon name="trash" size={15} color={colors.danger} />
          </Pressable>
        )}
        {!canRemove && <View className="w-8" />}
      </View>

      <OptionSelectorSheet
        visible={isSetTypeSelectorOpen}
        title={`Set ${index + 1} type`}
        value={set.setType}
        options={setTypeOptions}
        onClose={() => setIsSetTypeSelectorOpen(false)}
        onChange={setType => onChange({ ...set, setType })}
      />
      <OptionalSliderSheet
        visible={activePrescription !== null}
        value={parseOptionalNumber(activeValue)}
        config={PRESCRIPTION_CONFIG[activePrescription ?? 'REPS']}
        onClose={() => setActivePrescription(null)}
        onChange={value => {
          if (activePrescription) {
            updatePrescription(activePrescription, value);
          }
        }}
      />
    </>
  );
}
