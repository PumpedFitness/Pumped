import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AnimatedView } from '@/components/uniwind';
import { colors, motion } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import {
  formatRestClock,
  REST_STEP_SECONDS,
  restRingPercentage,
} from './restTimerModel';

// Swipe the bar down past this (or fling faster) to dismiss the rest.
const DISMISS_DISTANCE = 52;
const DISMISS_VELOCITY = 600;

export type RestTimerPillProps = {
  visible: boolean;
  isRunning: boolean;
  remainingMs: number;
  totalMs: number;
  onToggle: () => void;
  onAddSeconds: (deltaSeconds: number) => void;
  onSkip: () => void;
  onExpand: () => void;
  // Whether tapping the bar opens the full-screen timer. Off once the user has
  // chosen "Never show again".
  canExpand: boolean;
};

type StepButtonProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
};

function StepButton({ label, accessibilityLabel, onPress }: StepButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="h-9 min-w-[44px] items-center justify-center rounded-full bg-[rgba(243,238,226,0.1)] px-3 active:bg-[rgba(243,238,226,0.22)]"
    >
      <Text className="text-[12.5px] font-bold text-cream tabular-nums">
        {label}
      </Text>
    </Pressable>
  );
}

export function RestTimerPill({
  visible,
  isRunning,
  remainingMs,
  totalMs,
  onToggle,
  onAddSeconds,
  onSkip,
  onExpand,
  canExpand,
}: RestTimerPillProps) {
  const { t } = useTranslation();
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Swipe down to dismiss (end) the rest. activeOffsetY keeps button taps and
  // the expand tap working — only a real downward drag grabs the gesture.
  const dismiss = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetY(-8)
    .onUpdate(event => {
      'worklet';
      translateY.value = Math.max(0, event.translationY);
      opacity.value = interpolate(
        translateY.value,
        [0, DISMISS_DISTANCE * 2],
        [1, 0.35],
        Extrapolation.CLAMP,
      );
    })
    .onEnd(event => {
      'worklet';
      if (
        event.translationY > DISMISS_DISTANCE ||
        event.velocityY > DISMISS_VELOCITY
      ) {
        translateY.value = withTiming(120, { duration: motion.fast });
        opacity.value = withTiming(0, { duration: motion.fast }, finished => {
          if (finished) {
            runOnJS(onSkip)();
          }
        });
        return;
      }
      translateY.value = withTiming(0, {
        duration: motion.fast,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: motion.fast });
    });

  const barStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) {
    return null;
  }

  const remainingPercent = restRingPercentage(remainingMs, totalMs);

  // Time + label. The whole block is the expand target when full screen is on.
  const readout = (
    <>
      <View className="flex-row items-center gap-1.5">
        <View
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: colors.accent }}
        />
        <Text className="text-[10px] font-bold uppercase tracking-[1.1px] text-cream-dim">
          {t('currentWorkout.rest.title')}
        </Text>
      </View>
      <Text className="text-[22px] font-bold leading-[26px] text-cream tabular-nums tracking-[-0.5px]">
        {formatRestClock(remainingMs)}
      </Text>
    </>
  );

  return (
    <GestureDetector gesture={dismiss}>
      <AnimatedView
        className="mx-5 mb-2 overflow-hidden rounded-[20px]"
        style={[
          {
            backgroundColor: colors.ink,
            shadowColor: colors.ink,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.22,
            shadowRadius: 16,
            elevation: 6,
          },
          barStyle,
        ]}
      >
        <View className="flex-row items-center gap-2.5 px-4 py-2.5">
          {canExpand ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('currentWorkout.rest.expandA11y')}
              onPress={onExpand}
              className="flex-1 active:opacity-70"
            >
              {readout}
            </Pressable>
          ) : (
            <View className="flex-1">{readout}</View>
          )}

          <StepButton
            label={`-${REST_STEP_SECONDS}`}
            accessibilityLabel={t('currentWorkout.rest.subtractA11y', {
              seconds: REST_STEP_SECONDS,
            })}
            onPress={() => onAddSeconds(-REST_STEP_SECONDS)}
          />
          <StepButton
            label={`+${REST_STEP_SECONDS}`}
            accessibilityLabel={t('currentWorkout.rest.addA11y', {
              seconds: REST_STEP_SECONDS,
            })}
            onPress={() => onAddSeconds(REST_STEP_SECONDS)}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isRunning
                ? t('currentWorkout.rest.pause')
                : t('currentWorkout.rest.resume')
            }
            onPress={onToggle}
            className="h-9 w-9 items-center justify-center rounded-full active:opacity-90"
            style={{ backgroundColor: colors.accent }}
          >
            <ClayIcon
              name={isRunning ? 'pause' : 'play'}
              size={15}
              color={colors.accentInk}
            />
          </Pressable>
        </View>

        {/* Draining progress underline — the remaining share of the rest. */}
        <View
          className="absolute bottom-0 left-0 h-[3px]"
          style={{
            width: `${remainingPercent}%`,
            backgroundColor: colors.accent,
          }}
        />
      </AnimatedView>
    </GestureDetector>
  );
}
