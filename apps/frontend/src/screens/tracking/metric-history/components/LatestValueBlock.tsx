import { View, Text } from 'react-native';

type LatestValueBlockProps = {
  value: string;
  date: string;
};

export function LatestValueBlock({ value, date }: LatestValueBlockProps) {
  return (
    <View className="items-center mb-4 mt-2">
      <Text className="text-[36px] font-bold text-foreground tabular-nums">
        {value}
      </Text>
      <Text className="text-[12.5px] text-muted mt-0.5">{date}</Text>
    </View>
  );
}
