import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { IconName } from '@/components/icons/ClayIcon';

// Result returned by an action. `false` cancels the commit and springs the row
// back (e.g. a declined confirmation, or a non-destructive toggle); anything
// else commits and the row slides away.
export type SwipeActionResult = boolean | void | Promise<boolean | void>;
export type SwipeActionHandler = () => SwipeActionResult;

export type SwipeFrom = 'left' | 'right';
export type SwipeColor = 'danger' | 'accent' | 'warning' | 'success' | 'moss';

// A single swipe action bound to one edge. `left` is revealed by dragging the
// row right; `right` by dragging it left.
export type SwipeAction = {
  action: SwipeActionHandler;
  color?: SwipeColor;
  icon: IconName;
  subtitle?: string;
  /** Tint of the icon + subtitle. Defaults to white for contrast on the fill. */
  contentColor?: string;
};

// Resting reveal width (the action strip shown after a short swipe). The
// spring/timing curves are tuned to mirror the iOS list swipe feel.
export const REST_WIDTH = 92;
// Hysteresis band so sub-pixel jitter at the arm boundary can't machine-gun
// the taptic feedback.
const ARM_HYSTERESIS = 16;
const OPEN_SPRING = { damping: 22, stiffness: 240, mass: 0.7 } as const;
const CLOSE_SPRING = { damping: 26, stiffness: 280, mass: 0.7 } as const;
const COMMIT_DURATION = 200;
// A fling only short-circuits the distance threshold when it's both fast and
// already well into the swipe — these destructive actions have no confirm step,
// so a casual flick must never commit.
const FLING_VELOCITY = 1400;
// Fraction of the arm threshold the row must already be revealed past before a
// fling is allowed to commit. Keeps a quick flick from the rest strip safe.
const FLING_MIN_REVEAL = 0.6;

// Full-swipe arms once the row is dragged most of the way across — deliberately
// far, since committing fires immediately with no confirmation. Never arms
// before the rest strip is well clear of the resting position.
export function armThresholdFor(width: number) {
  'worklet';
  return Math.max(width * 0.7, REST_WIDTH + 96);
}

function fireImpact(armed: boolean) {
  // Best-effort: a simulator/older device no-ops, and a not-yet-rebuilt native
  // module throws synchronously — neither should ever break the swipe.
  try {
    Haptics.impactAsync(
      armed
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light,
    ).catch(() => {});
  } catch {
    // expo-haptics native module unavailable until the app is rebuilt.
  }
}

type SwipeGestureArgs = {
  left?: SwipeAction;
  right?: SwipeAction;
};

type SwipeGestureState = {
  gesture: ReturnType<typeof Gesture.Exclusive>;
  translateX: SharedValue<number>;
  width: SharedValue<number>;
  containerStyle: ReturnType<typeof useAnimatedStyle>;
  contentStyle: ReturnType<typeof useAnimatedStyle>;
  onLayout: (event: LayoutChangeEvent) => void;
  openSide: SwipeFrom | null;
  isCommitting: boolean;
  commit: (side: SwipeFrom) => void;
};

// Owns the single bidirectional pan that powers <SwipeTo>. Using one gesture
// (rather than nesting two swipeables) is essential: nested gesture detectors
// fight over the horizontal pan in the RNGH arena and the inner one wins, which
// silently breaks the outer edge's swipe.
export function useSwipeGesture({
  left,
  right,
}: SwipeGestureArgs): SwipeGestureState {
  const hasLeft = !!left;
  const hasRight = !!right;

  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const width = useSharedValue(0);
  const opacity = useSharedValue(1);
  // 1 while the drag is past the full-swipe arm threshold (drives haptics).
  const armed = useSharedValue(0);
  // Latches once an action is committed so it can only fire once.
  const committing = useSharedValue(0);
  // Which edge is currently resting open (drives tap-to-close + commit strip).
  const [openSide, setOpenSide] = useState<SwipeFrom | null>(null);
  // Freezes interaction during the commit/confirm window so a stray touch
  // can't cancel it and strand the row.
  const [isCommitting, setIsCommitting] = useState(false);

  const runAction = (side: SwipeFrom): SwipeActionResult => {
    const cfg = side === 'left' ? left : right;
    return cfg ? cfg.action() : false;
  };

  const commit = (side: SwipeFrom) => {
    if (committing.value === 1) {
      return;
    }
    committing.value = 1;
    setIsCommitting(true);
    setOpenSide(null);
    armed.value = 0;
    const dir = side === 'left' ? 1 : -1;

    const finish = (committed: boolean) => {
      if (committed) {
        // Slide the row away; it unmounts once its data is removed.
        opacity.value = withTiming(0, { duration: COMMIT_DURATION });
        translateX.value = withTiming(dir * width.value, {
          duration: COMMIT_DURATION,
        });
        return;
      }
      // The action declined (a cancelled confirmation or a non-destructive
      // toggle) — restore the row so it can never be stranded off-screen.
      committing.value = 0;
      setIsCommitting(false);
      translateX.value = withSpring(0, CLOSE_SPRING);
    };

    // Supports both an immediate commit (void/true) and a deferred confirmation
    // that resolves false on cancel; the gesture stays frozen until it settles.
    Promise.resolve()
      .then(() => runAction(side))
      .then(result => finish(result !== false))
      .catch(() => finish(false));
  };

  const close = () => {
    setOpenSide(null);
    armed.value = 0;
    translateX.value = withSpring(0, CLOSE_SPRING);
  };

  const settleOpen = (side: SwipeFrom) => {
    setOpenSide(side);
    armed.value = 0;
    const dir = side === 'left' ? 1 : -1;
    translateX.value = withSpring(dir * REST_WIDTH, OPEN_SPRING);
  };

  const pan = Gesture.Pan()
    .enabled(!isCommitting)
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onStart(() => {
      'worklet';
      // Snapshot the live position so dragging from any rest/animating state
      // is frame-accurate — never derived from React state.
      startX.value = translateX.value;
    })
    .onUpdate(event => {
      'worklet';
      const next = startX.value + event.translationX;
      // Clamp to whichever edges actually have an action: can't drag past a
      // missing action, and never past fully-open in either direction.
      const minX = hasRight ? -width.value : 0;
      const maxX = hasLeft ? width.value : 0;
      translateX.value = Math.min(maxX, Math.max(minX, next));

      const reveal = Math.abs(translateX.value);
      const arm = armThresholdFor(width.value);
      let nextArmed = armed.value;
      if (armed.value === 0 && reveal >= arm) {
        nextArmed = 1;
      } else if (armed.value === 1 && reveal <= arm - ARM_HYSTERESIS) {
        nextArmed = 0;
      }
      if (nextArmed !== armed.value) {
        armed.value = nextArmed;
        runOnJS(fireImpact)(nextArmed === 1);
      }
    })
    .onEnd(event => {
      'worklet';
      const offset = translateX.value;
      const reveal = Math.abs(offset);
      const arm = armThresholdFor(width.value);
      const side: SwipeFrom = offset >= 0 ? 'left' : 'right';
      const dir = offset >= 0 ? 1 : -1;
      // A fling towards the open edge only commits when it's both fast and
      // already most of the way to the arm threshold — never from a near-closed
      // flick, since there's no confirmation behind it.
      const armsByFling =
        event.velocityX * dir > FLING_VELOCITY &&
        reveal >= arm * FLING_MIN_REVEAL;
      if (reveal >= arm || armsByFling) {
        runOnJS(commit)(side);
        return;
      }
      if (reveal >= REST_WIDTH / 2) {
        runOnJS(settleOpen)(side);
        return;
      }
      runOnJS(close)();
    });

  // Only active while open, so a closed row's taps still reach its children.
  const tap = Gesture.Tap()
    .enabled(openSide !== null && !isCommitting)
    .onEnd(() => {
      'worklet';
      runOnJS(close)();
    });

  const gesture = Gesture.Exclusive(pan, tap);

  const onLayout = (event: LayoutChangeEvent) => {
    width.value = event.nativeEvent.layout.width;
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return {
    gesture,
    translateX,
    width,
    containerStyle,
    contentStyle,
    onLayout,
    openSide,
    isCommitting,
    commit,
  };
}
