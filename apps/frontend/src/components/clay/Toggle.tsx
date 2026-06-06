import { Pressable, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, radii, motion } from '../../theme/tokens';

type ToggleProps = {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  style?: ViewStyle;
};

export function Toggle({ checked = false, onChange, style }: ToggleProps) {
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      checked ? colors.accent : 'rgba(52, 54, 44, 0.16)',
      { duration: motion.base },
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(checked ? 18 : 0, {
          duration: motion.base,
          easing: Easing.bezier(0.22, 0.61, 0.36, 1),
        }),
      },
    ],
  }));

  return (
    <Pressable onPress={() => onChange?.(!checked)}>
      <Animated.View
        style={[
          {
            width: 46,
            height: 28,
            borderRadius: radii.pill,
            justifyContent: 'center',
            paddingHorizontal: 3,
          },
          trackStyle,
          style,
        ]}
      >
        <Animated.View
          style={[
            {
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 2,
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
