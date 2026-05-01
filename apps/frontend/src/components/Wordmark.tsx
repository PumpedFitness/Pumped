import {View, Text} from 'react-native';

export function Wordmark() {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="w-2.5 h-2.5 bg-accent rounded-[1px]" />
      <Text className="text-lg font-bold text-foreground tracking-tight">
        PUMPED
      </Text>
    </View>
  );
}
