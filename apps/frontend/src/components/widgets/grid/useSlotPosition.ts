import { useEffect } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import type { Point } from './widgetGridGeometry';

const POSITION_TRANSITION_MS = 220;

/**
 * Keeps a widget's top-left corner in sync with its slot in the grid.
 *
 * Outside a drag the slot is assigned rather than animated. The first
 * correction lands a frame after mount, when the fallback row height gives way
 * to the measured one, and a `withTiming` issued that early is dropped before
 * it reaches the UI thread — which froze tall widgets on top of their
 * neighbours. There is nothing to ease over at that point anyway: the widget
 * has not been seen in the wrong place yet.
 *
 * `held` covers the two cases where the corner is driven from elsewhere: the
 * widget under the finger, and the one still settling into its dropped slot.
 */
export function useSlotPosition(point: Point, animate: boolean, held: boolean) {
  const baseX = useSharedValue(point.x);
  const baseY = useSharedValue(point.y);

  useEffect(() => {
    if (held) return;
    if (!animate) {
      baseX.value = point.x;
      baseY.value = point.y;
      return;
    }
    baseX.value = withTiming(point.x, { duration: POSITION_TRANSITION_MS });
    baseY.value = withTiming(point.y, { duration: POSITION_TRANSITION_MS });
  }, [animate, baseX, baseY, held, point.x, point.y]);

  return { baseX, baseY };
}
