import { Text, View } from 'react-native';
import { DeltaChip } from '@pumped/ui';
import { formatDelta, formatMetricValue } from '../trendsModel';

type TrendsMetricSummaryProps = {
  title: string;
  value: number | null;
  unit: string;
  delta: number | null;
  deltaSuffix: string;
  emptyLabel: string;
};

export function TrendsMetricSummary({
  title,
  value,
  unit,
  delta,
  deltaSuffix,
  emptyLabel,
}: TrendsMetricSummaryProps) {
  return (
    <View className="gap-[10px]">
      <Text className="text-[27px] font-[800] leading-[1.15] tracking-[-0.54px] text-foreground">
        {title}
      </Text>

      <View className="flex-row items-end justify-between">
        {value === null ? (
          <Text className="text-[15px] font-[600] text-muted">
            {emptyLabel}
          </Text>
        ) : (
          <View className="flex-row items-baseline gap-[6px]">
            <Text className="text-[46px] font-[800] leading-none tracking-[-1.6px] text-foreground">
              {formatMetricValue(value)}
            </Text>
            <Text className="text-[15px] font-[600] text-muted">{unit}</Text>
          </View>
        )}

        {delta !== null ? (
          <DeltaChip value={formatDelta(delta)} suffix={deltaSuffix} />
        ) : null}
      </View>
    </View>
  );
}
