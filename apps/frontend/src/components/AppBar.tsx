import {View, Text} from 'react-native';

interface AppBarProps {
  title: string;
  eyebrow?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function AppBar({title, eyebrow, leading, trailing}: AppBarProps) {
  return (
    <View className="flex-row items-center justify-between h-14 px-2 bg-surface border-b border-border">
      <View className="flex-row items-center gap-1 shrink-0">{leading}</View>
      <View className="flex-1 items-center justify-center px-2 min-w-0">
        {eyebrow && <Text className="eyebrow text-[10px]">{eyebrow}</Text>}
        <Text numberOfLines={1} className="text-[17px] font-semibold text-foreground tracking-tight">{title}</Text>
      </View>
      <View className="flex-row items-center gap-1 shrink-0">{trailing}</View>
    </View>
  );
}
