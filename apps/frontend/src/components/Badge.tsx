import {View, Text} from 'react-native';

interface BadgeProps {
  children: string;
  variant?: 'default' | 'accent';
}

export function Badge({children, variant = 'default'}: BadgeProps) {
  const isAccent = variant === 'accent';
  return (
    <View
      className={`h-[22px] px-2 rounded-sm items-center justify-center border ${
        isAccent ? 'border-accent bg-accent-soft' : 'border-border bg-background'
      }`}>
      <Text
        className={`font-mono text-[11px] font-semibold uppercase tracking-wide ${
          isAccent ? 'text-accent' : 'text-foreground-secondary'
        }`}>
        {children}
      </Text>
    </View>
  );
}
