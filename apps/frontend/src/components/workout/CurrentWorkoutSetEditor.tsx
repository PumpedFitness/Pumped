import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import type { WorkoutSetType } from '../../data/local/enums';
import type {
  CurrentWorkoutSet,
  UpdateCurrentWorkoutSetInput,
} from '../../stores/currentWorkoutModel';
import { colors } from '../../theme/tokens';
import { ExerciseSetValueCell } from '../exercise/ExerciseSetTable';
import { OptionSelectorSheet } from '../forms/OptionSelectorSheet';
import {
  OptionalSliderSheet,
  type OptionalSliderConfig,
} from '../forms/OptionalSliderSheet';
import { ClayIcon } from '../icons/ClayIcon';

type CurrentWorkoutSetEditorProps = {
  index: number;
  set: CurrentWorkoutSet;
  canRemove: boolean;
  setTypeOptions: { value: WorkoutSetType; label: string }[];
  onChange: (values: UpdateCurrentWorkoutSetInput) => void;
  onToggleDone: () => boolean;
  onRemove: () => void;
};

type WorkoutField = 'WEIGHT' | 'REPS' | 'RPE';

const WORKOUT_FIELD_CONFIG: Record<WorkoutField, OptionalSliderConfig> = {
  WEIGHT: {
    title: 'Weight',
    description: 'Choose the weight performed for this set.',
    minValue: 0,
    maxValue: 500,
    step: 0.5,
    defaultValue: 20,
    formatValue: value => `${value}`,
  },
  REPS: {
    title: 'Reps',
    description: 'Choose the repetitions performed for this set.',
    minValue: 1,
    maxValue: 30,
    step: 1,
    defaultValue: 8,
    formatValue: value => `${value} reps`,
  },
  RPE: {
    title: 'RPE',
    description: 'Choose the effort for this set.',
    minValue: 1,
    maxValue: 10,
    step: 0.5,
    defaultValue: 8,
    formatValue: value => `RPE ${value}`,
  },
};

function formatNumber(value: number | null): string {
  if (value === null) {
    return '';
  }
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export function CurrentWorkoutSetEditor({
  index,
  set,
  canRemove,
  setTypeOptions,
  onChange,
  onToggleDone,
  onRemove,
}: CurrentWorkoutSetEditorProps) {
  const [activeField, setActiveField] = useState<WorkoutField | null>(null);
  const [isSetTypeSelectorOpen, setIsSetTypeSelectorOpen] = useState(false);
  const setTypeLabel =
    setTypeOptions.find(option => option.value === set.setType)?.label ??
    'Working';
  const activeValue =
    activeField === 'WEIGHT'
      ? set.weight
      : activeField === 'REPS'
      ? set.reps
      : activeField === 'RPE'
      ? set.rpe
      : null;

  const toggleDone = () => {
    if (!onToggleDone()) {
      Alert.alert(
        'Complete the set details',
        'Reps must be a positive whole number. Weight cannot be negative, and RPE must be between 1 and 10.',
      );
    }
  };

  const updateField = (field: WorkoutField, value: number | null) => {
    const key =
      field === 'WEIGHT' ? 'weight' : field === 'REPS' ? 'reps' : 'rpe';
    onChange({ [key]: value });
  };

  return (
    <>
      <View
        className={`flex-row items-center gap-1.5 border-t border-border-soft px-1 py-1 ${
          set.isDone ? 'bg-moss/10' : ''
        }`}
      >
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={`Mark set ${index + 1} complete`}
          accessibilityState={{ checked: set.isDone }}
          className="h-10 w-6 items-center justify-center rounded-[10px] active:bg-surface-card"
          onPress={toggleDone}
        >
          {set.isDone ? (
            <View className="h-6 w-6 items-center justify-center rounded-full bg-moss">
              <ClayIcon name="check" size={14} color={colors.cream} />
            </View>
          ) : (
            <Text className="text-[12px] font-bold tabular-nums text-muted">
              {index + 1}
            </Text>
          )}
        </Pressable>
        <ExerciseSetValueCell
          accessibilityLabel={`Set ${index + 1} type`}
          value={setTypeLabel}
          align="left"
          onPress={() => setIsSetTypeSelectorOpen(true)}
        />
        <ExerciseSetValueCell
          accessibilityLabel={`Set ${index + 1} weight`}
          value={formatNumber(set.weight)}
          onPress={() => setActiveField('WEIGHT')}
        />
        <ExerciseSetValueCell
          accessibilityLabel={`Set ${index + 1} reps`}
          value={formatNumber(set.reps)}
          onPress={() => setActiveField('REPS')}
        />
        <ExerciseSetValueCell
          accessibilityLabel={`Set ${index + 1} RPE`}
          value={formatNumber(set.rpe)}
          onPress={() => setActiveField('RPE')}
        />
        {canRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove set ${index + 1}`}
            className="h-10 w-8 items-center justify-center rounded-full active:bg-surface-card"
            onPress={onRemove}
          >
            <ClayIcon name="trash" size={15} color={colors.danger} />
          </Pressable>
        ) : (
          <View className="w-8" />
        )}
      </View>

      <OptionSelectorSheet
        visible={isSetTypeSelectorOpen}
        title={`Set ${index + 1} type`}
        value={set.setType}
        options={setTypeOptions}
        onClose={() => setIsSetTypeSelectorOpen(false)}
        onChange={setType => onChange({ setType })}
      />
      <OptionalSliderSheet
        visible={activeField !== null}
        value={activeValue}
        config={WORKOUT_FIELD_CONFIG[activeField ?? 'REPS']}
        onClose={() => setActiveField(null)}
        onChange={value => {
          if (activeField) {
            updateField(activeField, value);
          }
        }}
      />
    </>
  );
}
