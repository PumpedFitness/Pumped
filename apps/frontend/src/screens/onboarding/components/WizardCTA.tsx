import { Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { shadows } from '@pumped/ui/theme/tokens';

type WizardCTAProps = {
  label: string;
  onPress: () => void;
  enabled?: boolean;
  testID?: string;
};

// Terracotta hero button for the dark onboarding canvas — springs down on
// press, glows with the accent shadow. Wizard-local: the clay CTAButton is
// tuned for light surfaces.
export function WizardCTA({
  label,
  onPress,
  enabled = true,
  testID,
}: WizardCTAProps) {
  const pressed = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.04 }],
  }));

  return (
    <Animated.View style={[style, enabled ? shadows.accent : undefined]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !enabled }}
        testID={testID}
        onPressIn={() => {
          pressed.value = withSpring(1, { damping: 20, stiffness: 400 });
        }}
        onPressOut={() => {
          pressed.value = withSpring(0, { damping: 16, stiffness: 300 });
        }}
        onPress={enabled ? onPress : undefined}
        className={
          'h-[58px] rounded-full items-center justify-center bg-accent ' +
          (enabled ? '' : 'opacity-40')
        }
      >
        <Text className="text-[17px] font-bold text-accent-foreground tracking-[0.2px]">
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
