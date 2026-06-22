import { useEffect, useState } from 'react';
import { View, Text, Pressable, type LayoutChangeEvent } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { motion } from '@/theme/tokens';
import { AnimatedView } from '@/components/uniwind';

type Option = string | { value: string; label: string };

type SegmentedControlProps = {
  options: Option[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
  testID?: string;
};

export function SegmentedControl({
  options = [],
  value,
  onChange,
  className = '',
  testID,
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

  // Must stay in sync with the p-[3px] / top-[3px] / bottom-[3px] classes below.
  const padding = 3;
  const segmentWidth = (containerWidth - padding * 2) / n;
  const thumbTranslateX = useSharedValue(padding);
  const thumbWidth = useSharedValue(0);

  useEffect(() => {
    if (containerWidth <= 0) {
      return;
    }

    const timing = {
      duration: motion.base,
      easing: Easing.bezier(0.22, 0.61, 0.36, 1),
    };
    thumbTranslateX.value = withTiming(padding + idx * segmentWidth, timing);
    thumbWidth.value = withTiming(segmentWidth, timing);
  }, [containerWidth, idx, segmentWidth, thumbTranslateX, thumbWidth]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: thumbTranslateX.value,
      },
    ],
    width: thumbWidth.value,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      testID={testID}
      onLayout={onLayout}
      className={`flex-row p-[3px] bg-surface-sunk rounded-full border border-border-soft ${className}`}
    >
      {containerWidth > 0 && (
        <AnimatedView
          className="absolute top-[3px] bottom-[3px] bg-accent rounded-full"
          style={thumbStyle}
        />
      )}
      {opts.map(o => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            testID={`segment-${o.value}`}
            onPress={() => onChange?.(o.value)}
            className="flex-1 h-[38px] items-center justify-center rounded-full"
          >
            <Text
              className={`text-sm font-semibold capitalize ${
                on ? 'text-accent-foreground' : 'text-text-secondary'
              }`}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
