import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { ClayIcon } from '../icons/ClayIcon';

type ExerciseSetTableProps = {
  columns: [string, string, string, string];
  children: ReactNode;
  addSetLabel?: string;
  onAddSet: () => void;
};

type CollapsibleExerciseSetTableProps = ExerciseSetTableProps & {
  setCount: number;
  summary: string;
  expanded: boolean;
  onToggle: () => void;
};

type ExerciseSetValueCellProps = {
  accessibilityLabel: string;
  value: string;
  align?: 'left' | 'center';
  onPress: () => void;
};

export function ExerciseSetValueCell({
  accessibilityLabel,
  value,
  align = 'center',
  onPress,
}: ExerciseSetValueCellProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${accessibilityLabel}: ${value || '-'}`}
      className="h-10 flex-1 justify-center rounded-[10px] px-1 active:bg-surface-card"
      onPress={onPress}
    >
      <Text
        className={`text-[12px] font-bold tabular-nums ${
          align === 'left' ? 'text-left' : 'text-center'
        } ${value ? 'text-foreground' : 'text-muted'}`}
        numberOfLines={1}
      >
        {value || '-'}
      </Text>
    </Pressable>
  );
}

function ExerciseSetTableContent({
  columns,
  children,
  addSetLabel = 'Add set',
  onAddSet,
}: ExerciseSetTableProps) {
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

      {children}

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

export function ExerciseSetTable(props: ExerciseSetTableProps) {
  return (
    <View className="overflow-hidden rounded-[18px] border border-border-soft">
      <ExerciseSetTableContent {...props} />
    </View>
  );
}

export function CollapsibleExerciseSetTable({
  setCount,
  summary,
  expanded,
  onToggle,
  ...tableProps
}: CollapsibleExerciseSetTableProps) {
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
            {setCount} {setCount === 1 ? 'set' : 'sets'}
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
          <ExerciseSetTableContent {...tableProps} />
        </View>
      )}
    </View>
  );
}
