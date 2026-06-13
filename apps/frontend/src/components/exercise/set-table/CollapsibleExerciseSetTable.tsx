import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
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
  const { t } = useTranslation();
  const rows = buildTemplateSetTableRows(t, {
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
            {t('common.set', { count: sets.length })}
          </Text>
          <Text className="t-caption mt-0.5">
            {expanded ? t('setTable.hidePrescriptions') : summary}
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
            columns={[
              t('setTable.columns.type'),
              t('setTable.columns.reps'),
              t('setTable.columns.percent'),
              t('setTable.columns.rpe'),
            ]}
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
