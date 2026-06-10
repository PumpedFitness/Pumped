import { useState } from 'react';
import { Input } from 'heroui-native';
import type { WorkoutSetType } from '../../data/local/enums';
import type {
  EditableExercise,
  EditableExerciseSet,
} from '../../types/exercise';
import { ExerciseCard } from './ExerciseCard';
import { CollapsibleExerciseSetTable } from './set-table';

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
    <ExerciseCard name={name} description={description} onRemove={onRemove}>
      <Input
        className="h-[50px] rounded-[16px] border-border-hairline bg-surface-sunk px-4 text-foreground"
        placeholder={goalPlaceholder}
        value={exercise.goal}
        onChangeText={onGoalChange}
      />

      <CollapsibleExerciseSetTable
        sets={exercise.sets}
        setTypeOptions={setTypeOptions}
        summary={setSummary}
        expanded={setsExpanded}
        addSetLabel={addSetLabel}
        onToggle={() => setSetsExpanded(current => !current)}
        onAddSet={onAddSet}
        onChangeSet={onSetChange}
        onRemoveSet={onRemoveSet}
      />
    </ExerciseCard>
  );
}
