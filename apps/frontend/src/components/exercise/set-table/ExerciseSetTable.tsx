import { View } from 'react-native';
import {
  buildWorkoutSetTableRows,
  type ExerciseSetTableProps,
} from './exerciseSetTableModel';
import { ExerciseSetTableContent } from './ExerciseSetTableContent';

export function ExerciseSetTable({
  sets,
  setTypeOptions,
  addSetLabel,
  onAddSet,
  onChangeSet,
  onToggleSetDone,
  onRemoveSet,
}: ExerciseSetTableProps) {
  const rows = buildWorkoutSetTableRows({
    sets,
    setTypeOptions,
    addSetLabel,
    onAddSet,
    onChangeSet,
    onToggleSetDone,
    onRemoveSet,
  });

  return (
    <View className="overflow-hidden rounded-[18px] border border-border-soft">
      <ExerciseSetTableContent
        columns={['Type', 'Weight', 'Reps', 'RPE']}
        rows={rows}
        setTypeOptions={setTypeOptions}
        addSetLabel={addSetLabel}
        onAddSet={onAddSet}
      />
    </View>
  );
}
