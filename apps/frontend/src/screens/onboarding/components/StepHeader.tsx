import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type StepHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

// Editorial header for the dark canvas: terracotta eyebrow, oversized cream
// display title, dim supporting line. Elements cascade in.
export function StepHeader({ eyebrow, title, subtitle }: StepHeaderProps) {
  return (
    <View className="mb-8">
      <Animated.View entering={FadeInDown.duration(300)}>
        <Text className="text-[11px] font-bold uppercase tracking-[2.2px] text-accent mb-3">
          {eyebrow}
        </Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(340).delay(60)}>
        <Text className="text-[34px] font-[800] text-foreground tracking-[-0.68px] leading-[38px]">
          {title}
        </Text>
      </Animated.View>
      {subtitle ? (
        <Animated.View entering={FadeInDown.duration(340).delay(140)}>
          <Text className="text-[15px] text-muted mt-3 leading-[22px]">
            {subtitle}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}
