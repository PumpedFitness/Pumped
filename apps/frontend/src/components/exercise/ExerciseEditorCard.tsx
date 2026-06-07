import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Input } from 'heroui-native';
import type { WorkoutSetType } from '../../data/local/enums';
import { colors } from '../../theme/tokens';
import type {
  EditableExercise,
  EditableExerciseSet,
} from '../../types/exercise';
import { ClayIcon } from '../icons/ClayIcon';
import { ExerciseSetEditor } from './ExerciseSetEditor';

type ExerciseEditorCardProps = {
  exercise: EditableExercise;
  name: string;
  description?: string;
  goalPlaceholder?: string;
  addSetLabel?: string;
  setTypeOptions: { value: WorkoutSetType; label: string }[];
  setSummary: string;
  onGoalChange: (goal: string) => void;
  onSetChange: (setIndex: number, set: EditableExerciseSet) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onRemove: () => void;
};

export function ExerciseEditorCard({
  exercise,
  name,
  description = 'Working sets and a simple goal',
  goalPlaceholder = 'Goal, for example 3 × 8 at RPE 8',
  addSetLabel = 'Add set',
  setTypeOptions,
  setSummary,
  onGoalChange,
  onSetChange,
  onAddSet,
  onRemoveSet,
  onRemove,
}: ExerciseEditorCardProps) {
  const [setsExpanded, setSetsExpanded] = useState(false);

  return (
    <View className="gap-4 rounded-[22px] border border-border-hairline bg-surface-card p-4">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-accent-soft">
          <ClayIcon name="dumbbell" size={20} color={colors.accent} />
        </View>
        <View className="flex-1">
          <Text className="t-heading">{name}</Text>
          <Text className="t-caption mt-0.5">{description}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${name}`}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-sunk"
          onPress={onRemove}
        >
          <ClayIcon name="x" size={18} color={colors.danger} />
        </Pressable>
      </View>

      <Input
        className="h-[50px] rounded-[16px] border-border-hairline bg-surface-sunk px-4 text-foreground"
        placeholder={goalPlaceholder}
        value={exercise.goal}
        onChangeText={onGoalChange}
      />

      <View className="overflow-hidden rounded-[18px] border border-border-soft">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: setsExpanded }}
          className="min-h-14 flex-row items-center gap-3 bg-surface-sunk px-4 py-3 active:bg-surface-card"
          onPress={() => setSetsExpanded(current => !current)}
        >
          <View className="h-9 w-9 items-center justify-center rounded-[12px] bg-surface-card">
            <ClayIcon name="target" size={18} color={colors.ink2} />
          </View>
          <View className="flex-1">
            <Text className="t-label">
              {exercise.sets.length}{' '}
              {exercise.sets.length === 1 ? 'set' : 'sets'}
            </Text>
            <Text className="t-caption mt-0.5">
              {setsExpanded ? 'Hide prescriptions' : setSummary}
            </Text>
          </View>
          <ClayIcon
            name={setsExpanded ? 'chevronDown' : 'chevron'}
            size={18}
            color={colors.muted}
          />
        </Pressable>

        {setsExpanded && (
          <View className="gap-3 border-t border-border-soft p-3">
            {exercise.sets.map((set, index) => (
              <ExerciseSetEditor
                key={index}
                index={index}
                set={set}
                canRemove={exercise.sets.length > 1}
                setTypeOptions={setTypeOptions}
                onChange={nextSet => onSetChange(index, nextSet)}
                onRemove={() => onRemoveSet(index)}
              />
            ))}
            <Pressable
              accessibilityRole="button"
              className="min-h-11 flex-row items-center justify-center gap-2 rounded-full bg-accent-soft px-4"
              onPress={onAddSet}
            >
              <ClayIcon name="plus" size={16} color={colors.accent} />
              <Text className="t-label text-accent">{addSetLabel}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
