import { Pressable, Text, View } from 'react-native';
import { colors } from '../../../theme/tokens';
import { ClayIcon } from '../../icons/ClayIcon';
import type { SetTableRow, SetTypeOption } from './exerciseSetTableModel';
import { ExerciseSetTableRow } from './ExerciseSetTableRow';

type ExerciseSetTableContentProps = {
  columns: readonly [string, string, string, string];
  rows: SetTableRow[];
  setTypeOptions: SetTypeOption[];
  addSetLabel?: string;
  onAddSet: () => void;
};

export function ExerciseSetTableContent({
  columns,
  rows,
  setTypeOptions,
  addSetLabel = 'Add set',
  onAddSet,
}: ExerciseSetTableContentProps) {
  return (
    <View className="px-1 pb-2">
      <View className="flex-row items-center gap-1.5 px-1 py-2">
        <Text className="w-6 text-center text-[9px] font-semibold uppercase tracking-[0.5px] text-muted">
          Set
        </Text>
        {columns.map((column, index) => (
          <Text
            key={column}
            className={`flex-1 text-[9px] font-semibold uppercase tracking-[0.5px] text-muted ${
              index === 0 ? 'text-left' : 'text-center'
            }`}
          >
            {column}
          </Text>
        ))}
        <View className="w-8" />
      </View>

      {rows.map(row => (
        <ExerciseSetTableRow
          key={row.key}
          row={row}
          setTypeOptions={setTypeOptions}
        />
      ))}

      <Pressable
        accessibilityRole="button"
        className="mx-1 mt-2 min-h-10 flex-row items-center justify-center gap-2 rounded-full bg-accent-soft px-3"
        onPress={onAddSet}
      >
        <ClayIcon name="plus" size={16} color={colors.accent} />
        <Text className="t-label text-accent">{addSetLabel}</Text>
      </Pressable>
    </View>
  );
}
