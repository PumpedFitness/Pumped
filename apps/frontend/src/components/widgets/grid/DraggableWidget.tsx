import { useCallback, useLayoutEffect, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  type SharedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';

const LONG_PRESS_MS = 350;
const EDITING_LONG_PRESS_MS = 120;
const PRE_HOLD_MOVEMENT_LIMIT = 12;
const DROP_SETTLE_MS = 300;

function createWidgetPanGesture(editing: boolean) {
  return Gesture.Pan()
    .failOffsetY([-PRE_HOLD_MOVEMENT_LIMIT, PRE_HOLD_MOVEMENT_LIMIT])
    .activateAfterLongPress(editing ? EDITING_LONG_PRESS_MS : LONG_PRESS_MS);
}

type DraggableWidgetProps = {
  id: string;
  editing: boolean;
  children: React.ReactNode;
  dragging: boolean;
  settling: boolean;
  settlePoint: { x: number; y: number };
  baseX: SharedValue<number>;
  baseY: SharedValue<number>;
  onDragStart: () => void;
  onDragMove: (id: string, translationX: number, translationY: number) => void;
  onDragPosition: (absoluteY: number) => void;
  onDragFinalize: () => void;
  onSettleComplete: () => void;
  onRemove: (id: string) => void;
  scrollOffset: SharedValue<number>;
};

export function DraggableWidget({
  id,
  editing,
  children,
  dragging,
  settling,
  settlePoint,
  baseX,
  baseY,
  onDragStart,
  onDragMove,
  onDragPosition,
  onDragFinalize,
  onSettleComplete,
  onRemove,
  scrollOffset,
}: DraggableWidgetProps) {
  const { t } = useTranslation();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const active = useSharedValue(false);
  const dragStartScrollOffset = useSharedValue(0);

  useAnimatedReaction(
    () => scrollOffset.value,
    (offset, previousOffset) => {
      if (!active.value || offset === previousOffset) return;
      runOnJS(onDragMove)(
        id,
        translateX.value,
        translateY.value + offset - dragStartScrollOffset.value,
      );
    },
    [id, onDragMove],
  );

  useLayoutEffect(() => {
    if (settling) {
      translateX.value = withTiming(settlePoint.x - baseX.value, {
        duration: DROP_SETTLE_MS,
      });
      translateY.value = withTiming(
        settlePoint.y - baseY.value,
        { duration: DROP_SETTLE_MS },
        finished => {
          if (finished) {
            baseX.value = settlePoint.x;
            baseY.value = settlePoint.y;
            translateX.value = 0;
            translateY.value = 0;
            runOnJS(onSettleComplete)();
          }
        },
      );
      return;
    }
    if (!dragging) {
      translateX.value = 0;
      translateY.value = 0;
    }
  }, [
    dragging,
    baseX,
    baseY,
    onSettleComplete,
    settlePoint.x,
    settlePoint.y,
    settling,
    translateX,
    translateY,
  ]);
  const startDrag = useCallback(() => {
    onDragStart();
  }, [onDragStart]);

  const gesture = useMemo(
    () =>
      createWidgetPanGesture(editing)
        .onStart(() => {
          active.value = true;
          dragStartScrollOffset.value = scrollOffset.value;
          scale.value = withSpring(1.01);
          runOnJS(startDrag)();
        })
        .onUpdate(event => {
          const scrollDelta = scrollOffset.value - dragStartScrollOffset.value;
          translateX.value = event.translationX;
          translateY.value = event.translationY;
          runOnJS(onDragMove)(
            id,
            event.translationX,
            event.translationY + scrollDelta,
          );
          runOnJS(onDragPosition)(event.absoluteY);
        })
        .onFinalize(() => {
          if (!active.value) return;
          translateY.value += scrollOffset.value - dragStartScrollOffset.value;
          dragStartScrollOffset.value = scrollOffset.value;
          active.value = false;
          scale.value = withSpring(1);
          runOnJS(onDragFinalize)();
        }),
    [
      active,
      dragStartScrollOffset,
      editing,
      id,
      onDragFinalize,
      onDragMove,
      onDragPosition,
      scale,
      scrollOffset,
      startDrag,
      translateX,
      translateY,
    ],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    zIndex: active.value ? 10 : 0,
    transform: [
      { translateX: translateX.value },
      {
        translateY:
          translateY.value +
          (active.value ? scrollOffset.value - dragStartScrollOffset.value : 0),
      },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        {children}
        {editing && (
          <View className="absolute -right-2 -top-2">
            <Pressable
              accessibilityLabel={t('home.removeWidget')}
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => onRemove(id)}
              className="h-7 w-7 items-center justify-center rounded-full bg-foreground active:opacity-80"
            >
              <ClayIcon name="x" size={15} color={colors.cream} />
            </Pressable>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}
