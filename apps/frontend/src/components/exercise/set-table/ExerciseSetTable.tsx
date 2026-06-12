import { View } from 'react-native';
import {
  buildReadOnlyWorkoutSetTableRows,
  buildWorkoutSetTableRows,
  type ExerciseSetTableProps,
} from './exerciseSetTableModel';
import { ExerciseSetTableContent } from './ExerciseSetTableContent';

export function ExerciseSetTable(props: ExerciseSetTableProps) {
  const rows = props.readOnly
    ? buildReadOnlyWorkoutSetTableRows(props)
    : buildWorkoutSetTableRows(props);
  const weightColumn = props.readOnly
    ? `Weight (${props.weightUnit})`
    : 'Weight';

  return (
    <View className="overflow-hidden rounded-[18px] border border-border-soft">
      <ExerciseSetTableContent
        columns={['Type', weightColumn, 'Reps', 'RPE']}
        rows={rows}
        setTypeOptions={props.setTypeOptions}
        actionColumnLabel={props.readOnly ? undefined : 'Done'}
        addSetLabel={props.readOnly ? undefined : props.addSetLabel}
        onAddSet={props.readOnly ? undefined : props.onAddSet}
      />
    </View>
  );
}
