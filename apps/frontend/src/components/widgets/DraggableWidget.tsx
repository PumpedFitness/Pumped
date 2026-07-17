import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';

const LONG_PRESS_MS = 350;

type DraggableWidgetProps = {
  id: string;
  editing: boolean;
  layoutX: number;
  layoutY: number;
  children: React.ReactNode;
  onDragStart: () => void;
  onDragMove: (id: string, absoluteX: number, absoluteY: number) => void;
  onDrop: () => void;
  onRemove: (id: string) => void;
};

export function DraggableWidget({
  id,
  editing,
  layoutX,
  layoutY,
  children,
  onDragStart,
  onDragMove,
  onDrop,
  onRemove,
}: DraggableWidgetProps) {
  const { t } = useTranslation();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const active = useSharedValue(false);
  const compensationX = useSharedValue(0);
  const compensationY = useSharedValue(0);
  const draggingRef = useRef(false);
  const previousLayoutRef = useRef({ x: layoutX, y: layoutY });

  useEffect(() => {
    const previous = previousLayoutRef.current;
    if (draggingRef.current) {
      compensationX.value += previous.x - layoutX;
      compensationY.value += previous.y - layoutY;
    }
    previousLayoutRef.current = { x: layoutX, y: layoutY };
  }, [compensationX, compensationY, layoutX, layoutY]);

  const startDrag = useCallback(() => {
    draggingRef.current = true;
    onDragStart();
  }, [onDragStart]);

  const stopDrag = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(LONG_PRESS_MS)
        .onStart(() => {
          active.value = true;
          scale.value = withSpring(1.01);
          runOnJS(startDrag)();
        })
        .onUpdate(event => {
          translateX.value = event.translationX;
          translateY.value = event.translationY;
          runOnJS(onDragMove)(id, event.absoluteX, event.absoluteY);
        })
        .onEnd(() => {
          runOnJS(onDrop)();
        })
        .onFinalize(() => {
          active.value = false;
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          compensationX.value = withSpring(0);
          compensationY.value = withSpring(0);
          scale.value = withSpring(1);
          runOnJS(stopDrag)();
        }),
    [
      active,
      compensationX,
      compensationY,
      id,
      onDragMove,
      onDrop,
      scale,
      startDrag,
      stopDrag,
      translateX,
      translateY,
    ],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    zIndex: active.value ? 10 : 0,
    transform: [
      { translateX: translateX.value + compensationX.value },
      { translateY: translateY.value + compensationY.value },
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
