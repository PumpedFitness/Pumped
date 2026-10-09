import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import {
  Easing,
  type SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AnimatedView } from '@pumped/ui/uniwind';
import { PumpedLogoMark } from './PumpedLogoMark';

type LaunchScreenProps = {
  /** True once the app behind is mounted and safe to reveal. */
  ready: boolean;
  /** Called after the exit animation; unmount the screen then. */
  onFinished: () => void;
};

type LoadingDotProps = {
  index: number;
  visible: SharedValue<number>;
};

const EASE_OUT = Easing.out(Easing.cubic);
const LOGO_DRAW_MS = 900;
// Long enough for the logo to finish drawing, so a fast launch still lands
// the brand moment instead of flashing it.
const MIN_VISIBLE_MS = 1100;
// Only a slow launch (big migration) gets the "still working" dots.
const DOTS_AFTER_MS = 1600;

function LoadingDot({ index, visible }: LoadingDotProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withDelay(
      index * 180,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 450, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 450, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
  }, [pulse, index]);

  const style = useAnimatedStyle(() => ({
    opacity: visible.value * interpolate(pulse.value, [0, 1], [0.25, 0.8]),
  }));

  return (
    <AnimatedView
      className="h-1.5 w-1.5 rounded-full bg-accent"
      style={style}
    />
  );
}

/**
 * Branded launch: picks up from the native splash (same ground color), fades
 * the logo tile in while its "P" pencils itself on, brings the wordmark up
 * beneath it, then dissolves to reveal the app once it is ready.
 */
export function LaunchScreen({ ready, onFinished }: LaunchScreenProps) {
  const [minElapsed, setMinElapsed] = useState(false);
  const enter = useSharedValue(0);
  const wordmark = useSharedValue(0);
  const exit = useSharedValue(0);
  const dots = useSharedValue(0);

  useEffect(() => {
    enter.value = withTiming(1, { duration: 500, easing: EASE_OUT });
    wordmark.value = withDelay(
      350,
      withTiming(1, { duration: 450, easing: EASE_OUT }),
    );
    dots.value = withDelay(DOTS_AFTER_MS, withTiming(1, { duration: 300 }));
    const timer = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [enter, wordmark, dots]);

  useEffect(() => {
    if (!ready || !minElapsed) {
      return;
    }
    dots.value = withTiming(0, { duration: 120 });
    exit.value = withTiming(
      1,
      { duration: 360, easing: Easing.inOut(Easing.quad) },
      finished => {
        if (finished) {
          runOnJS(onFinished)();
        }
      },
    );
  }, [ready, minElapsed, exit, dots, onFinished]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: 1 - exit.value,
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      {
        scale:
          interpolate(enter.value, [0, 1], [0.94, 1]) *
          interpolate(exit.value, [0, 1], [1, 1.04]),
      },
    ],
  }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmark.value,
    transform: [{ translateY: interpolate(wordmark.value, [0, 1], [8, 0]) }],
  }));

  return (
    <AnimatedView
      pointerEvents={ready && minElapsed ? 'none' : 'auto'}
      className="absolute inset-0 items-center justify-center bg-[#EAE3D5]"
      style={screenStyle}
      accessibilityLabel="Pumped"
    >
      <AnimatedView style={logoStyle}>
        <PumpedLogoMark size={112} delay={150} duration={LOGO_DRAW_MS} />
      </AnimatedView>
      <AnimatedView className="mt-6" style={wordmarkStyle}>
        <Text className="text-[34px] font-black tracking-[-1px] text-foreground">
          Pumped
        </Text>
      </AnimatedView>
      <View className="absolute bottom-24 flex-row gap-2">
        {[0, 1, 2].map(index => (
          <LoadingDot key={index} index={index} visible={dots} />
        ))}
      </View>
    </AnimatedView>
  );
}
