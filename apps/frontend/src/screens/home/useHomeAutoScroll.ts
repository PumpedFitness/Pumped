import { useCallback, useRef } from 'react';
import type {
  ScrollView,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

const AUTO_SCROLL_EDGE = 104;
const MAX_AUTO_SCROLL_SPEED = 14;

/** Edge auto-scroll while dragging widgets — extracted from the grid screen. */
export function useHomeAutoScroll(
  scrollRef: React.RefObject<ScrollView | null>,
  scrollY: SharedValue<number>,
  windowHeight: number,
) {
  const scrollYRef = useRef(0);
  const contentHeightRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const speedRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    speedRef.current = 0;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const run = useCallback(() => {
    const maxOffset = Math.max(
      0,
      contentHeightRef.current - viewportHeightRef.current,
    );
    const next = Math.max(
      0,
      Math.min(maxOffset, scrollYRef.current + speedRef.current),
    );
    if (next !== scrollYRef.current) {
      scrollYRef.current = next;
      scrollY.value = next;
      scrollRef.current?.scrollTo({ y: next, animated: false });
    }
    if (speedRef.current !== 0 && next > 0 && next < maxOffset) {
      frameRef.current = requestAnimationFrame(run);
    } else {
      frameRef.current = null;
    }
  }, [scrollRef, scrollY]);

  const onDragPosition = useCallback(
    (absoluteY: number) => {
      const fromBottom = windowHeight - absoluteY;
      let speed = 0;
      if (fromBottom < AUTO_SCROLL_EDGE) {
        speed =
          ((AUTO_SCROLL_EDGE - Math.max(0, fromBottom)) / AUTO_SCROLL_EDGE) *
          MAX_AUTO_SCROLL_SPEED;
      } else if (absoluteY < AUTO_SCROLL_EDGE) {
        speed =
          -((AUTO_SCROLL_EDGE - Math.max(0, absoluteY)) / AUTO_SCROLL_EDGE) *
          MAX_AUTO_SCROLL_SPEED;
      }
      speedRef.current = speed;
      if (speed === 0) {
        stop();
      } else if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(run);
      }
    },
    [run, stop, windowHeight],
  );

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    viewportHeightRef.current = event.nativeEvent.layout.height;
  }, []);

  const onContentSizeChange = useCallback((_w: number, height: number) => {
    contentHeightRef.current = height;
  }, []);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.y;
      scrollYRef.current = offset;
      scrollY.value = offset;
    },
    [scrollY],
  );

  return { stop, onDragPosition, onLayout, onContentSizeChange, onScroll };
}
