import {View, Text} from 'react-native';

interface StatProps {
  label: string;
  value: string;
  large?: boolean;
}

export function Stat({label, value, large}: StatProps) {
  return (
    <View className="gap-0.5">
      <Text className="font-mono text-[11px] font-semibold text-muted uppercase tracking-widest">
        {label}
      </Text>
      <Text className={`font-mono font-semibold text-foreground tracking-tight ${large ? 'text-[32px]' : 'text-[22px]'}`}>
        {value}
      </Text>
    </View>
  );
}
