import { View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, radii } from '../../theme/tokens';

type ProgressBarProps = {
  value?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
};

export function ProgressBar({
  value = 0,
  height = 6,
  color = colors.accent,
  style,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${clamped}%` as `${number}%`, {
      duration: 400,
      easing: Easing.bezier(0.22, 0.61, 0.36, 1),
    }),
  }));

  return (
    <View
      style={[
        {
          height,
          borderRadius: radii.pill,
          backgroundColor: 'rgba(52, 54, 44, 0.08)',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: color,
            borderRadius: radii.pill,
          },
          fillStyle,
        ]}
      />
    </View>
  );
}
