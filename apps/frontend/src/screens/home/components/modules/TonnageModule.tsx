import { Text, View } from 'react-native';
import { Badge, BarGroup, colors } from '@pumped/ui';
import { ModuleLabelRow } from '../ModuleShell';

type TonnageModuleProps = {
  label: string;
  bars: number[];
  value: number;
  unit: string;
};

/** Tonnage module — label + ƒx badge, big value, 7-bar mini chart. README §1. */
export function TonnageModule({ label, bars, value, unit }: TonnageModuleProps) {
  const heights = bars.length > 0 ? bars : [0.34, 0.52, 0.44, 0.68, 0.6, 0.82, 1];
  return (
    <View className="gap-[12px]">
      <ModuleLabelRow label={label} right={<Badge tone="accent">ƒx</Badge>} />
      <View className="flex-row items-baseline">
        <Text className="text-[30px] font-[800] tracking-[-0.9px] text-foreground">
          {value.toFixed(1)}
        </Text>
        <Text className="ml-[3px] text-[13px] font-[600] text-muted">{unit}</Text>
      </View>
      <BarGroup heights={heights} height={34} gap={4} colors={barColors(heights.length)} />
    </View>
  );
}

// bar-idle for all but the last two bars (ink, accent) per the v2 spec.
function barColors(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    if (i === n - 1) return colors.accent;
    if (i === n - 2) return colors.ink;
    return colors.barIdle;
  });
}
