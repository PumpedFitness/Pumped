import { useEffect } from 'react';
import { View } from 'react-native';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors, shadows } from '@pumped/ui/theme/tokens';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { AnimatedView } from '@pumped/ui/uniwind';

type CompletionBadgeProps = {
  /** Fires as the medallion arrives — pair the success haptic with it. */
  onReveal?: () => void;
};

const EASE_OUT = Easing.out(Easing.cubic);
// Starts once the screen's fade-in has mostly played, so the reveal is seen.
const ENTER_DELAY_MS = 220;
const ENTER_MS = 420;

/**
 * The hero of the workout-complete screen: an accent medallion that settles
 * in, sets its check, and sends a single faint ring outward. One motion, then
 * still — no loops competing with the stats below.
 */
export function CompletionBadge({ onReveal }: CompletionBadgeProps) {
  const enter = useSharedValue(0);
  const tick = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(
      ENTER_DELAY_MS,
      withTiming(1, { duration: ENTER_MS, easing: EASE_OUT }),
    );
    tick.value = withDelay(
      ENTER_DELAY_MS + 200,
      withTiming(1, { duration: 260, easing: EASE_OUT }),
    );
    ring.value = withDelay(
      ENTER_DELAY_MS + 240,
      withTiming(1, { duration: 900, easing: EASE_OUT }),
    );
    const revealTimer = setTimeout(() => onReveal?.(), ENTER_DELAY_MS + 240);
    return () => clearTimeout(revealTimer);
  }, [enter, tick, ring, onReveal]);

  const medallionStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: interpolate(enter.value, [0, 1], [0.92, 1]) }],
  }));
  const tickStyle = useAnimatedStyle(() => ({
    opacity: tick.value,
    transform: [{ scale: interpolate(tick.value, [0, 1], [0.9, 1]) }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 0.15, 1], [0, 0.35, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [1, 1.35]) }],
  }));

  return (
    <View className="h-[180px] w-[180px] items-center justify-center">
      <AnimatedView
        pointerEvents="none"
        className="absolute h-[124px] w-[124px] rounded-full border border-accent"
        style={ringStyle}
      />
      <AnimatedView
        className="h-[124px] w-[124px] items-center justify-center rounded-full bg-accent"
        style={[shadows.hero, medallionStyle]}
      >
        <View className="h-[96px] w-[96px] items-center justify-center rounded-full border-2 border-[rgba(255,255,255,0.28)]">
          <AnimatedView style={tickStyle}>
            <ClayIcon name="check" size={54} color={colors.cream} />
          </AnimatedView>
        </View>
      </AnimatedView>
    </View>
  );
}
