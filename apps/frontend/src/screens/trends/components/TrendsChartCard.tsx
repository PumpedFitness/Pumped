import { Text, View } from 'react-native';
import { LineChart, shadows } from '@pumped/ui';
import { TREND_AXIS_LABELS } from '../trendsModel';

type TrendsChartCardProps = {
  values: number[];
  emptyLabel: string;
};

export function TrendsChartCard({ values, emptyLabel }: TrendsChartCardProps) {
  return (
    <View
      className="overflow-hidden rounded-[28px] border border-border-hairline bg-surface-card px-[16px] pb-[14px] pt-[20px]"
      style={shadows.hero}
    >
      {values.length >= 2 ? (
        <LineChart data={values} labels={[...TREND_AXIS_LABELS]} height={170} />
      ) : (
        <View className="h-[170px] items-center justify-center">
          <Text className="text-[13px] font-[500] leading-[1.6] text-muted">
            {emptyLabel}
          </Text>
        </View>
      )}
    </View>
  );
}
