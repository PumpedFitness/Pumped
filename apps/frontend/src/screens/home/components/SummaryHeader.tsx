import { Text, View } from 'react-native';

type SummaryHeaderProps = {
  title: string;
};

/**
 * "Summary" section title. README §1.5.
 *
 * The Daily/Weekly/Monthly segmented control was removed: no widget consumed
 * the selected range, so it was a control that looked live but changed nothing.
 */
export function SummaryHeader({ title }: SummaryHeaderProps) {
  return (
    <View className="flex-row items-center justify-between gap-[12px]">
      <Text className="text-[20px] font-[800] tracking-[-0.2px] text-foreground">
        {title}
      </Text>
    </View>
  );
}
