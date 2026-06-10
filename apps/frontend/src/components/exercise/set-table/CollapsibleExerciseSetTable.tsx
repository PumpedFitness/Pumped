import { Pressable, Text, View } from 'react-native';
import { colors } from '../../../theme/tokens';
import { ClayIcon } from '../../icons/ClayIcon';
import {
  buildTemplateSetTableRows,
  type CollapsibleExerciseSetTableProps,
} from './exerciseSetTableModel';
import { ExerciseSetTableContent } from './ExerciseSetTableContent';

export function CollapsibleExerciseSetTable({
  sets,
  setTypeOptions,
  addSetLabel,
  summary,
  expanded,
  onToggle,
  onAddSet,
  onChangeSet,
  onRemoveSet,
}: CollapsibleExerciseSetTableProps) {
  const rows = buildTemplateSetTableRows({
    sets,
    setTypeOptions,
    addSetLabel,
    summary,
    expanded,
    onToggle,
    onAddSet,
    onChangeSet,
    onRemoveSet,
  });

  return (
    <View className="overflow-hidden rounded-[18px] border border-border-soft">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        className="min-h-14 flex-row items-center gap-3 bg-surface-sunk px-4 py-3 active:bg-surface-card"
        onPress={onToggle}
      >
        <View className="h-9 w-9 items-center justify-center rounded-[12px] bg-surface-card">
          <ClayIcon name="target" size={18} color={colors.ink2} />
        </View>
        <View className="flex-1">
          <Text className="t-label">
            {sets.length} {sets.length === 1 ? 'set' : 'sets'}
          </Text>
          <Text className="t-caption mt-0.5">
            {expanded ? 'Hide prescriptions' : summary}
          </Text>
        </View>
        <ClayIcon
          name={expanded ? 'chevronDown' : 'chevron'}
          size={18}
          color={colors.muted}
        />
      </Pressable>

      {expanded && (
        <View className="border-t border-border-soft">
          <ExerciseSetTableContent
            columns={['Type', 'Reps', '%', 'RPE']}
            rows={rows}
            setTypeOptions={setTypeOptions}
            addSetLabel={addSetLabel}
            onAddSet={onAddSet}
          />
        </View>
      )}
    </View>
  );
}
