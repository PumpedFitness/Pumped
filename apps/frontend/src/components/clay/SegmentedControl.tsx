import { useState } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, radii, motion } from '../../theme/tokens';

type Option = string | { value: string; label: string };

type SegmentedControlProps = {
  options: Option[];
  value: string;
  onChange?: (value: string) => void;
};

export function SegmentedControl({
  options = [],
  value,
  onChange,
}: SegmentedControlProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const n = options.length || 1;
  const opts = options.map(o =>
    typeof o === 'object' ? o : { value: o, label: o },
  );
  const idx = Math.max(
    0,
    opts.findIndex(o => o.value === value),
  );

  const padding = 3;
  const segmentWidth = (containerWidth - padding * 2) / n;

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(padding + idx * segmentWidth, {
          duration: motion.base,
          easing: Easing.bezier(0.22, 0.61, 0.36, 1),
        }),
      },
    ],
    width: segmentWidth,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={onLayout}
      style={{
        flexDirection: 'row',
        padding,
        backgroundColor: colors.cardSunk,
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: colors.lineSoft,
      }}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: padding,
              bottom: padding,
              backgroundColor: colors.accent,
              borderRadius: radii.pill,
            },
            thumbStyle,
          ]}
        />
      )}
      {opts.map(o => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange?.(o.value)}
            style={{
              flex: 1,
              height: 38,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radii.pill,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: on ? colors.accentInk : colors.ink2,
                textTransform: 'capitalize',
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
