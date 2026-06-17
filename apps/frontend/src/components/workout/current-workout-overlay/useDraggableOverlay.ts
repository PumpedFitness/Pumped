import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Gesture } from 'react-native-gesture-handler';
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '@/theme/tokens';
import {
  useCurrentWorkoutOverlayStore,
  type OverlaySide,
} from '@/stores/currentWorkoutOverlayStore';

export const COLLAPSED_WIDTH = 76;
export const MAX_CARD_WIDTH = 354;
export const CARD_HEIGHT = 126;

// Hold (long-press) feel.
const HELD_SCALE = 1.07;
const LONG_PRESS_MS = 220;
// Below this finger travel a touch still counts as a tap and reaches the
// children (open/expand/collapse) instead of arming the drag.
const PAN_ACTIVATION = 8;
// Resting vertical room left below the card so it never sits under the tab bar.
const BOTTOM_RESERVE = 120;
// Springs mirror SwipeToDelete's tactile snap.
const DRAG_SPRING = { damping: 22, stiffness: 240, mass: 0.7 } as const;
const SIDE_SPRING = { damping: 26, stiffness: 280, mass: 0.7 } as const;
// Hard sideways fling that flips the resting edge regardless of finger position.
const FLING_VELOCITY = 900;

function fireImpact(style: Haptics.ImpactFeedbackStyle) {
  // Best-effort: a simulator/older device no-ops, and a not-yet-rebuilt native
  // module throws synchronously — neither should ever break the gesture.
  try {
    Haptics.impactAsync(style).catch(() => {});
  } catch {
    // expo-haptics native module unavailable until the app is rebuilt.
  }
}

type DraggableOverlayArgs = {
  visible: boolean;
  collapsed: boolean;
  cardWidth: number;
};

// Owns the hold-to-enlarge + drag + sticky side-switch gesture for the current
// workout overlay, keeping the rendering component small. Returns the composed
// gesture, the animated transform style, and the resting edge for layout.
export function useDraggableOverlay({
  visible,
  collapsed,
  cardWidth,
}: DraggableOverlayArgs) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Persisted resting position (which edge + how far down).
  const side = useCurrentWorkoutOverlayStore(state => state.side);
  const setSide = useCurrentWorkoutOverlayStore(state => state.setSide);
  const offsetY = useCurrentWorkoutOverlayStore(state => state.offsetY);
  const setOffsetY = useCurrentWorkoutOverlayStore(state => state.setOffsetY);

  // Horizontal collapse/expand AND the edge the card hugs are both expressed
  // through `translateX`: the card is laid out full-bleed and shifted to rest
  // flush against whichever edge `side` selects, then collapse hides all but
  // the ring on that same edge.
  const translateX = useSharedValue(0);
  // Live vertical drag offset (relative to the default top position).
  const translateY = useSharedValue(offsetY);
  // Grows while the card is held.
  const scale = useSharedValue(1);
  // Snapshot for the active drag.
  const startY = useSharedValue(offsetY);
  // Mirrors `side` inside worklets so the pan can flip it mid-gesture without a
  // React round-trip; kept in sync with the store below.
  const sideShared = useSharedValue<number>(side);

  // Vertical travel is clamped so the card can never leave the screen: 0 keeps
  // it at its default top, and the max drops it just above the tab bar.
  const maxOffsetY = Math.max(
    0,
    windowHeight - insets.top - insets.bottom - 68 - CARD_HEIGHT - BOTTOM_RESERVE,
  );

  // Resting X for the collapsed/expanded state on the current side. On the
  // right edge the card slides right (positive); on the left it slides left.
  function restingX(isCollapsed: boolean, currentSide: number): number {
    'worklet';
    const hidden = currentSide === 1 ? -1 : 1;
    if (isCollapsed) {
      return hidden * (cardWidth - COLLAPSED_WIDTH);
    }
    return 0;
  }

  useEffect(() => {
    sideShared.value = side;
  }, [side, sideShared]);

  useEffect(() => {
    if (!visible) {
      // Nothing renders while hidden (the component returns null), so an exit
      // animation can never play — just park the card off-screen on its resting
      // edge so the next show slides in from that edge.
      translateX.value = side === 1 ? -cardWidth : cardWidth;
      translateY.value = offsetY;
      scale.value = 1;
      return;
    }

    // Inlined resting-X so the effect needn't depend on the `restingX` closure.
    const hidden = side === 1 ? -1 : 1;
    const targetX = collapsed ? hidden * (cardWidth - COLLAPSED_WIDTH) : 0;
    translateX.value = withTiming(targetX, {
      duration: motion.slow,
      easing: Easing.out(Easing.cubic),
    });
  }, [
    cardWidth,
    collapsed,
    offsetY,
    side,
    scale,
    translateX,
    translateY,
    visible,
  ]);

  const persistSide = (next: OverlaySide) => {
    setSide(next);
    fireImpact(Haptics.ImpactFeedbackStyle.Light);
  };

  const persistOffsetY = (next: number) => {
    setOffsetY(next);
  };

  const onHoldStart = () => {
    fireImpact(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Long-press: enlarges the card + medium haptic. Stays active for the whole
  // hold so the simultaneous pan can drag while it's held.
  const longPress = Gesture.LongPress()
    .minDuration(LONG_PRESS_MS)
    .maxDistance(10_000)
    .onStart(() => {
      'worklet';
      scale.value = withSpring(HELD_SCALE, DRAG_SPRING);
      runOnJS(onHoldStart)();
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withSpring(1, DRAG_SPRING);
    });

  // Pan: vertical drag + horizontal side switch. Only steals the touch once the
  // finger has moved past PAN_ACTIVATION, so a plain tap still reaches the
  // children (open / expand / collapse).
  const pan = Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_MS)
    .minDistance(PAN_ACTIVATION)
    .onStart(() => {
      'worklet';
      startY.value = translateY.value;
    })
    .onUpdate(event => {
      'worklet';
      // Vertical drag, clamped on-screen.
      const nextY = startY.value + event.translationY;
      translateY.value = Math.min(maxOffsetY, Math.max(0, nextY));

      // Side switch: once the finger crosses the screen midline (or flings hard
      // sideways) flip to that edge. Hysteresis comes free from the midline.
      const fingerX = event.absoluteX;
      const midline = windowWidth / 2;
      const flung = Math.abs(event.velocityX) > FLING_VELOCITY;
      let nextSide = sideShared.value;
      if (fingerX < midline || (flung && event.velocityX < 0)) {
        nextSide = 1;
      } else if (fingerX > midline || (flung && event.velocityX > 0)) {
        nextSide = 0;
      }
      if (nextSide !== sideShared.value) {
        sideShared.value = nextSide;
        translateX.value = withSpring(restingX(collapsed, nextSide), SIDE_SPRING);
        runOnJS(persistSide)(nextSide as OverlaySide);
      }
    })
    .onEnd(() => {
      'worklet';
      // Settle vertical resting offset + persist it.
      const resting = Math.min(maxOffsetY, Math.max(0, translateY.value));
      translateY.value = withSpring(resting, DRAG_SPRING);
      runOnJS(persistOffsetY)(resting);
      // Re-settle on the chosen edge.
      translateX.value = withSpring(
        restingX(collapsed, sideShared.value),
        SIDE_SPRING,
      );
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withSpring(1, DRAG_SPRING);
    });

  // Hold + drag run together; both yield to a quick tap on the children.
  const gesture = Gesture.Simultaneous(longPress, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return { gesture, animatedStyle, side };
}
