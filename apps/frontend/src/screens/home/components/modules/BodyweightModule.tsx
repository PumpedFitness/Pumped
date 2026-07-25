import { Text, View } from 'react-native';
import { Sparkline, colors } from '@pumped/ui';
import { ModuleLabelRow } from '../ModuleShell';

type BodyweightModuleProps = {
  label: string;
  value: number | null;
  unit: string;
  trendLine: string;
  spark: number[];
  emptyLabel: string;
};

/**
 * Bodyweight module — INVERTED charcoal card: value + trend caption + accent
 * sparkline. README §1 (inverted).
 */
export function BodyweightModule({
  label,
  value,
  unit,
  trendLine,
  spark,
  emptyLabel,
}: BodyweightModuleProps) {
  return (
    <View className="gap-[10px]">
      <ModuleLabelRow label={label} inverted />
      {value == null ? (
        <Text className="text-[13px] font-[500] leading-[1.4] text-[rgba(244,242,239,0.6)]">
          {emptyLabel}
        </Text>
      ) : (
        <>
          <View className="flex-row items-baseline">
            <Text className="text-[30px] font-[800] tracking-[-0.9px] text-on-ink">
              {value.toFixed(1)}
            </Text>
            <Text className="ml-[3px] text-[13px] font-[600] text-[rgba(244,242,239,0.6)]">
              {unit}
            </Text>
          </View>
          <Text className="text-[12px] font-[500] text-[rgba(244,242,239,0.6)]">
            {trendLine}
          </Text>
          {spark.length > 1 ? (
            <Sparkline
              data={spark}
              color={colors.accent}
              width={120}
              height={30}
            />
          ) : null}
        </>
      )}
    </View>
  );
}
