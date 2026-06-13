import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  buildReadOnlyWorkoutSetTableRows,
  buildWorkoutSetTableRows,
  type ExerciseSetTableProps,
} from './exerciseSetTableModel';
import { ExerciseSetTableContent } from './ExerciseSetTableContent';

export function ExerciseSetTable(props: ExerciseSetTableProps) {
  const { t } = useTranslation();
  const rows = props.readOnly
    ? buildReadOnlyWorkoutSetTableRows(t, props)
    : buildWorkoutSetTableRows(t, props);
  const weightColumn = props.readOnly
    ? t('setTable.columns.weightWithUnit', { unit: props.weightUnit })
    : t('setTable.columns.weight');

  return (
    <View className="overflow-hidden rounded-[18px] border border-border-soft">
      <ExerciseSetTableContent
        columns={[
          t('setTable.columns.type'),
          weightColumn,
          t('setTable.columns.reps'),
          t('setTable.columns.rpe'),
        ]}
        rows={rows}
        setTypeOptions={props.setTypeOptions}
        actionColumnLabel={
          props.readOnly ? undefined : t('setTable.columns.done')
        }
        addSetLabel={props.readOnly ? undefined : props.addSetLabel}
        onAddSet={props.readOnly ? undefined : props.onAddSet}
      />
    </View>
  );
}
