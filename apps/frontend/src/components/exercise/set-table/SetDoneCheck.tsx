import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@pumped/ui/theme/tokens';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { AnimatedView } from '@pumped/ui/uniwind';
import { ImpactFeedbackStyle } from 'expo-haptics';
import { hapticImpact } from '@/utils/haptics';

type SetDoneCheckProps = {
  isDone: boolean;
};

const EASE_OUT = Easing.out(Easing.cubic);

/**
 * The set-completion check. Marking a set done fills the disc and fades the
 * check in, with one faint ring settling outward; undoing reverses the fill.
 * Mounting an already-done set shows the end state without replaying anything.
 */
export function SetDoneCheck({ isDone }: SetDoneCheckProps) {
  const fill = useSharedValue(isDone ? 1 : 0);
  const tick = useSharedValue(isDone ? 1 : 0);
  const ring = useSharedValue(0);
  const wasDone = useRef(isDone);

  useEffect(() => {
    if (wasDone.current === isDone) {
      return;
    }
    wasDone.current = isDone;
    if (!isDone) {
      tick.value = withTiming(0, { duration: 100 });
      fill.value = withTiming(0, { duration: 160, easing: EASE_OUT });
      return;
    }
    hapticImpact(ImpactFeedbackStyle.Light);
    fill.value = withTiming(1, { duration: 200, easing: EASE_OUT });
    tick.value = withDelay(
      80,
      withTiming(1, { duration: 180, easing: EASE_OUT }),
    );
    ring.value = 0;
    ring.value = withTiming(1, { duration: 420, easing: EASE_OUT });
  }, [isDone, fill, tick, ring]);

  const fillStyle = useAnimatedStyle(() => ({
    opacity: fill.value,
    transform: [{ scale: interpolate(fill.value, [0, 1], [0.8, 1]) }],
  }));
  const tickStyle = useAnimatedStyle(() => ({
    opacity: tick.value,
    transform: [{ scale: interpolate(tick.value, [0, 1], [0.85, 1]) }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 0.2, 1], [0, 0.3, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [1, 1.45]) }],
  }));

  return (
    <View className="h-7 w-7 items-center justify-center">
      <AnimatedView
        pointerEvents="none"
        className="absolute h-7 w-7 rounded-full border border-moss"
        style={ringStyle}
      />
      <View className="absolute h-7 w-7 rounded-full border-2 border-border-soft bg-background" />
      <AnimatedView
        className="absolute h-7 w-7 items-center justify-center rounded-full bg-moss"
        style={fillStyle}
      >
        <AnimatedView style={tickStyle}>
          <ClayIcon name="check" size={15} color={colors.cream} />
        </AnimatedView>
      </AnimatedView>
    </View>
  );
}
