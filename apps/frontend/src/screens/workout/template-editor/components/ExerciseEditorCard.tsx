import { useState, type ComponentProps } from 'react';
import { Input } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import type { EditableExercise, EditableExerciseSet } from '@/types/exercise';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { CollapsibleExerciseSetTable } from '@/components/exercise/set-table';

type SetTypeOptions = ComponentProps<
  typeof CollapsibleExerciseSetTable
>['setTypeOptions'];

type ExerciseEditorCardProps = {
  exercise: EditableExercise;
  name: string;
  description?: string;
  goalPlaceholder?: string;
  addSetLabel?: string;
  setTypeOptions: SetTypeOptions;
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
  description,
  goalPlaceholder,
  addSetLabel,
  setTypeOptions,
  setSummary,
  onGoalChange,
  onSetChange,
  onAddSet,
  onRemoveSet,
  onRemove,
}: ExerciseEditorCardProps) {
  const { t } = useTranslation();
  const [setsExpanded, setSetsExpanded] = useState(false);

  return (
    <ExerciseCard
      name={name}
      description={description ?? t('templateEditor.exercises.cardDescription')}
      onRemove={onRemove}
    >
      <Input
        className="h-[50px] rounded-[16px] border-border-hairline bg-surface-sunk px-4 text-foreground"
        placeholder={
          goalPlaceholder ?? t('templateEditor.exercises.goalPlaceholder')
        }
        value={exercise.goal}
        onChangeText={onGoalChange}
      />

      <CollapsibleExerciseSetTable
        sets={exercise.sets}
        setTypeOptions={setTypeOptions}
        summary={setSummary}
        expanded={setsExpanded}
        addSetLabel={addSetLabel ?? t('setTable.addSet')}
        onToggle={() => setSetsExpanded(current => !current)}
        onAddSet={onAddSet}
        onChangeSet={onSetChange}
        onRemoveSet={onRemoveSet}
      />
    </ExerciseCard>
  );
}
