import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AnimatedView } from '@/components/uniwind';
import { formatElapsedClock } from './sessionTime';

type SessionTimerProps = {
  startedAt: number;
  pausedAt: number | null;
  pausedMs: number;
};

// A leaf that owns the per-second tick so the exercise list never re-renders on
// it. Derives elapsed from timestamps and freezes while paused.
export function SessionTimer({
  startedAt,
  pausedAt,
  pausedMs,
}: SessionTimerProps) {
  const [now, setNow] = useState(() => Date.now());
  const pulse = useSharedValue(1);
  const isPaused = pausedAt != null;

  useEffect(() => {
    if (isPaused) {
      return;
    }
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isPaused]);

  useEffect(() => {
    if (isPaused) {
      pulse.value = 0.35;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [isPaused, pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const elapsed = (pausedAt ?? now) - startedAt - pausedMs;

  return (
    <View className="flex-row items-center gap-1.5">
      <AnimatedView
        className={`h-2 w-2 rounded-full ${
          isPaused ? 'bg-muted' : 'bg-accent'
        }`}
        style={dotStyle}
      />
      <Text className="text-[17px] font-bold text-foreground tabular-nums tracking-[-0.3px]">
        {formatElapsedClock(Math.max(0, elapsed))}
      </Text>
    </View>
  );
}
