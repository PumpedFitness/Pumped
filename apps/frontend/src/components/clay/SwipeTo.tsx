import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { ClayIcon, type IconName } from '@/components/icons/ClayIcon';
import { AnimatedView } from '@/components/uniwind';
import { GestureDetector } from 'react-native-gesture-handler';
import { colors } from '@/theme/tokens';
import {
  armThresholdFor,
  REST_WIDTH,
  useSwipeGesture,
  type SwipeAction,
  type SwipeActionHandler,
  type SwipeActionResult,
  type SwipeColor,
  type SwipeFrom,
} from './useSwipeGesture';

export type {
  SwipeAction,
  SwipeActionHandler,
  SwipeActionResult,
  SwipeColor,
  SwipeFrom,
};

// Named fills resolved to concrete tokens so the action surface renders
// identically regardless of which tailwind color utilities are wired.
const COLOR_FILL: Record<SwipeColor, string> = {
  danger: colors.danger,
  accent: colors.accent,
  warning: colors.warning,
  success: colors.success,
  moss: colors.moss,
};

type SwipeActionLayerProps = {
  translateX: SharedValue<number>;
  width: SharedValue<number>;
  from: SwipeFrom;
  fill: string;
  icon: IconName;
  subtitle?: string;
  contentColor: string;
};

// The action affordance: non-interactive and invisible at rest (so it never
// bleeds through a translucent row), fading + scaling in as the swipe reveals
// it. Anchored to the edge the row is dragged towards. Only reveals for its own
// direction, so two layers can coexist without bleeding into each other.
function SwipeActionLayer({
  translateX,
  width,
  from,
  fill,
  icon,
  subtitle,
  contentColor,
}: SwipeActionLayerProps) {
  const revealOf = (offset: number) => {
    'worklet';
    // Left action is revealed by a positive (rightward) drag; right by negative.
    return from === 'left' ? Math.max(0, offset) : Math.max(0, -offset);
  };

  const layerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      revealOf(translateX.value),
      [0, 12],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const contentStyle = useAnimatedStyle(() => {
    const reveal = revealOf(translateX.value);
    return {
      opacity: interpolate(reveal, [0, 28], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(
            reveal,
            [0, REST_WIDTH, armThresholdFor(width.value)],
            [0.6, 1, 1.12],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <AnimatedView
      className={`absolute inset-0 flex-row items-center ${
        from === 'right' ? 'justify-end pr-7' : 'justify-start pl-7'
      }`}
      style={[layerStyle, { backgroundColor: fill }]}
      pointerEvents="none"
    >
      <AnimatedView className="items-center justify-center gap-1" style={contentStyle}>
        <ClayIcon name={icon} size={22} color={contentColor} />
        {subtitle ? (
          <Text
            className="text-[11px] font-semibold"
            style={{ color: contentColor }}
          >
            {subtitle}
          </Text>
        ) : null}
      </AnimatedView>
    </AnimatedView>
  );
}

type SwipeToProps = {
  children: ReactNode;
  /** Action revealed by dragging the row right (swiped from the left edge). */
  left?: SwipeAction;
  /** Action revealed by dragging the row left (swiped from the right edge). */
  right?: SwipeAction;
  borderRadius?: number;
};

// A single pan gesture that can expose an action on either or both edges. See
// useSwipeGesture for why one gesture is required rather than nesting two.
export function SwipeTo({
  children,
  left,
  right,
  borderRadius = 0,
}: SwipeToProps) {
  const {
    gesture,
    translateX,
    width,
    containerStyle,
    contentStyle,
    onLayout,
    openSide,
    isCommitting,
    commit,
  } = useSwipeGesture({ left, right });

  return (
    <AnimatedView
      className="overflow-hidden"
      style={[containerStyle, { borderRadius }]}
      onLayout={onLayout}
      pointerEvents={isCommitting ? 'none' : undefined}
    >
      {right ? (
        <SwipeActionLayer
          translateX={translateX}
          width={width}
          from="right"
          fill={COLOR_FILL[right.color ?? 'danger']}
          icon={right.icon}
          subtitle={right.subtitle}
          contentColor={right.contentColor ?? '#fff'}
        />
      ) : null}
      {left ? (
        <SwipeActionLayer
          translateX={translateX}
          width={width}
          from="left"
          fill={COLOR_FILL[left.color ?? 'warning']}
          icon={left.icon}
          subtitle={left.subtitle}
          contentColor={left.contentColor ?? '#fff'}
        />
      ) : null}

      <GestureDetector gesture={gesture}>
        <AnimatedView style={contentStyle}>{children}</AnimatedView>
      </GestureDetector>

      {openSide ? (
        <Pressable
          className={`absolute bottom-0 top-0 ${
            openSide === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{ width: REST_WIDTH }}
          accessible={false}
          onPress={() => commit(openSide)}
        />
      ) : null}
    </AnimatedView>
  );
}
