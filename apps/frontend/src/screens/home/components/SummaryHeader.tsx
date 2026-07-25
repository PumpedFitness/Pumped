import { Text, View } from 'react-native';
import { SegmentedControl } from '@pumped/ui';

export type SummaryRange = 'daily' | 'weekly' | 'monthly';

type SummaryHeaderProps = {
  title: string;
  range: SummaryRange;
  onChange: (range: SummaryRange) => void;
  options: { value: SummaryRange; label: string }[];
};

/** "Summary" title + Daily/Weekly/Monthly segmented control. README §1.5. */
export function SummaryHeader({
  title,
  range,
  onChange,
  options,
}: SummaryHeaderProps) {
  return (
    <View className="flex-row items-center justify-between gap-[12px]">
      <Text className="text-[20px] font-[800] tracking-[-0.2px] text-foreground">
        {title}
      </Text>
      <View className="w-[200px]">
        <SegmentedControl
          options={options}
          value={range}
          onChange={value => onChange(value as SummaryRange)}
          testID="home-summary-range"
        />
      </View>
    </View>
  );
}
