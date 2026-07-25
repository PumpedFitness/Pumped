import { Text, View } from 'react-native';
import { DeltaChip, Sparkline, colors } from '@pumped/ui';
import { ModuleLabelRow } from '../ModuleShell';

type E1rmModuleProps = {
  label: string;
  value: number | null;
  unit: string;
  delta: number | null;
  deltaSuffix: string;
  spark: number[];
  emptyLabel: string;
};

/** Squat e1RM module — value + delta chip + smooth sparkline. README §1. */
export function E1rmModule({
  label,
  value,
  unit,
  delta,
  deltaSuffix,
  spark,
  emptyLabel,
}: E1rmModuleProps) {
  return (
    <View className="gap-[12px]">
      <ModuleLabelRow label={label} />
      {value == null ? (
        <Text className="text-[13px] font-[500] leading-[1.4] text-muted">
          {emptyLabel}
        </Text>
      ) : (
        <>
          <View className="flex-row items-baseline">
            <Text className="text-[30px] font-[800] tracking-[-0.9px] text-foreground">
              {value.toFixed(1)}
            </Text>
            <Text className="ml-[3px] text-[13px] font-[600] text-muted">
              {unit}
            </Text>
          </View>
          {delta != null ? (
            <DeltaChip
              value={`${delta >= 0 ? '+' : ''}${delta.toFixed(1)}`}
              suffix={deltaSuffix}
            />
          ) : null}
          {spark.length > 1 ? (
            <Sparkline data={spark} color={colors.ink} width={120} height={30} />
          ) : null}
        </>
      )}
    </View>
  );
}
