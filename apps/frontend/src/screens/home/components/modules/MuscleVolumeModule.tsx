import { Text, View } from 'react-native';
import { BarRow, colors } from '@pumped/ui';
import { ModuleLabelRow } from '../ModuleShell';
import type { MuscleVolumeRow } from '../../useHomeDashboardData';

type MuscleVolumeModuleProps = {
  label: string;
  rows: MuscleVolumeRow[];
  emptyLabel: string;
};

// Ink for the top rows, ink-2 for the middle, accent for the lightest — matches
// the README palette walk (ink, ink, ink-2, ink-2, accent).
function rowColor(index: number, total: number): string {
  if (index === total - 1) return colors.accent;
  if (index >= total - 3) return colors.ink2;
  return colors.ink;
}

/** Weekly-sets-by-muscle module — labelled meter rows. README §1. */
export function MuscleVolumeModule({
  label,
  rows,
  emptyLabel,
}: MuscleVolumeModuleProps) {
  return (
    <View className="gap-[12px]">
      <ModuleLabelRow label={label} />
      {rows.length === 0 ? (
        <Text className="text-[13px] font-[500] leading-[1.4] text-muted">
          {emptyLabel}
        </Text>
      ) : (
        <View className="gap-[11px]">
          {rows.map((row, index) => (
            <BarRow
              key={row.name}
              label={row.name}
              value={row.sets}
              fill={row.fill}
              color={rowColor(index, rows.length)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
