import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Portal } from 'heroui-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AnimatedView } from '@/components/uniwind';
import { colors, motion } from '@/theme/tokens';
import { RingGauge } from '@/components/clay/RingGauge';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { RestTimerControls } from './RestTimerControls';
import { formatRestClock, restRingPercentage } from './restTimerModel';

// Distinct from the floating workout overlay's portal so they never clobber.
const PORTAL_NAME = 'rest-timer-overlay';

// Drag the screen down past this (or fling faster) to minimize to the bar.
const MINIMIZE_DISTANCE = 120;
const MINIMIZE_VELOCITY = 800;

export type RestTimerOverlayProps = {
  visible: boolean;
  isRunning: boolean;
  remainingMs: number;
  totalMs: number;
  onToggle: () => void;
  onAddSeconds: (deltaSeconds: number) => void;
  onSkip: () => void;
  onMinimize: () => void;
  onNeverShowAgain: () => void;
};

export function RestTimerOverlay({
  visible,
  isRunning,
  remainingMs,
  totalMs,
  onToggle,
  onAddSeconds,
  onSkip,
  onMinimize,
  onNeverShowAgain,
}: RestTimerOverlayProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);

  // Drag down anywhere to minimize to the bottom bar; button taps still work
  // because the pan only activates on a deliberate downward drag.
  const minimize = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetY(-8)
    .onUpdate(event => {
      'worklet';
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd(event => {
      'worklet';
      if (
        event.translationY > MINIMIZE_DISTANCE ||
        event.velocityY > MINIMIZE_VELOCITY
      ) {
        runOnJS(onMinimize)();
        return;
      }
      translateY.value = withTiming(0, {
        duration: motion.base,
        easing: Easing.out(Easing.cubic),
      });
    });

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <Portal name={PORTAL_NAME}>
      {/* Opaque scrim covers the screen and intercepts touches (no fall-through).
          Fades in as it takes over the screen, and back out on dismiss. Drag
          down to minimize. */}
      <GestureDetector gesture={minimize}>
        <AnimatedView
          entering={FadeIn.duration(motion.base)}
          exiting={FadeOut.duration(motion.fast)}
          className="absolute inset-0 items-center justify-center px-8"
          style={[{ backgroundColor: 'rgba(34, 36, 28, 0.94)' }, dragStyle]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('currentWorkout.rest.minimizeA11y')}
            onPress={onMinimize}
            className="absolute right-5 h-11 w-11 items-center justify-center rounded-full bg-[rgba(243,238,226,0.08)] active:bg-[rgba(243,238,226,0.16)]"
            style={{ top: insets.top + 8 }}
          >
            <ClayIcon name="chevronDown" size={20} color={colors.cream} />
          </Pressable>

          <Text className="t-eyebrow text-cream-dim">
            {t('currentWorkout.rest.title')}
          </Text>

          <View className="mt-6">
            <RingGauge
              value={restRingPercentage(remainingMs, totalMs)}
              size={248}
              thickness={14}
              trackColor="rgba(243, 238, 226, 0.16)"
              fillColor={colors.accent}
              centerColor="transparent"
            >
              <Text className="text-[58px] font-bold text-cream tabular-nums tracking-[-1px]">
                {formatRestClock(remainingMs)}
              </Text>
            </RingGauge>
          </View>

          <View className="mt-10 w-full">
            <RestTimerControls
              isRunning={isRunning}
              onToggle={onToggle}
              onAddSeconds={onAddSeconds}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('currentWorkout.rest.skip')}
            onPress={onSkip}
            className="mt-6 h-11 items-center justify-center rounded-full px-6 active:opacity-70"
          >
            <Text className="t-label text-cream-dim">
              {t('currentWorkout.rest.skip')}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('currentWorkout.rest.neverShowAgain')}
            onPress={onNeverShowAgain}
            className="absolute flex-row items-center gap-1.5 px-6 py-2 active:opacity-70"
            style={{ bottom: insets.bottom + 16 }}
          >
            <ClayIcon name="x" size={13} color={colors.creamDim} />
            <Text className="text-[12.5px] font-medium text-cream-dim">
              {t('currentWorkout.rest.neverShowAgain')}
            </Text>
          </Pressable>
        </AnimatedView>
      </GestureDetector>
    </Portal>
  );
}
