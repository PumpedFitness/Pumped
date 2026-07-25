import { Text, View } from 'react-native';
import { colors } from '@pumped/ui';
import { ModuleLabelRow } from '../ModuleShell';
import type { AdherenceDay } from '../../useHomeDashboardData';

type AdherenceModuleProps = {
  label: string;
  percent: number;
  days: AdherenceDay[];
};

const DOT_COLORS: Record<AdherenceDay, string> = {
  done: colors.ink,
  missed: colors.barIdle,
  future: 'rgba(27,26,24,0.22)',
};

const COLS = 7;

// Chunk the flat day list into rows of 7 so the grid lays out predictably
// regardless of the module's measured width.
function chunkRows(days: AdherenceDay[]): AdherenceDay[][] {
  const rows: AdherenceDay[][] = [];
  for (let i = 0; i < days.length; i += COLS) {
    rows.push(days.slice(i, i + COLS));
  }
  return rows;
}

/** Adherence module — value + 28-dot completion grid (7 columns). README §1. */
export function AdherenceModule({ label, percent, days }: AdherenceModuleProps) {
  const rows = chunkRows(days.slice(-28));
  return (
    <View className="gap-[12px]">
      <ModuleLabelRow label={label} />
      <View className="flex-row items-baseline">
        <Text className="text-[30px] font-[800] tracking-[-0.9px] text-foreground">
          {percent}
        </Text>
        <Text className="ml-[3px] text-[13px] font-[600] text-muted">%</Text>
      </View>
      <View className="gap-[5px]">
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-[5px]">
            {row.map((day, colIndex) => (
              <View
                key={colIndex}
                className="h-[13px] flex-1 rounded-full"
                style={{ backgroundColor: DOT_COLORS[day] }}
              />
            ))}
            {/* Pad the last row so trailing dots keep column alignment. */}
            {Array.from({ length: COLS - row.length }).map((_, padIndex) => (
              <View key={`pad-${padIndex}`} className="flex-1" />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
