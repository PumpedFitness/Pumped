import { useMemo } from 'react';
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
  children: React.ReactNode;
  onDragStart: () => void;
  onDrop: (id: string, absoluteX: number, absoluteY: number) => void;
  onRemove: (id: string) => void;
};

export function DraggableWidget({
  id,
  editing,
  children,
  onDragStart,
  onDrop,
  onRemove,
}: DraggableWidgetProps) {
  const { t } = useTranslation();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const active = useSharedValue(false);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(LONG_PRESS_MS)
        .onStart(() => {
          active.value = true;
          scale.value = withSpring(1.04);
          runOnJS(onDragStart)();
        })
        .onUpdate(event => {
          translateX.value = event.translationX;
          translateY.value = event.translationY;
        })
        .onEnd(event => {
          runOnJS(onDrop)(id, event.absoluteX, event.absoluteY);
        })
        .onFinalize(() => {
          active.value = false;
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          scale.value = withSpring(1);
        }),
    [active, id, onDragStart, onDrop, scale, translateX, translateY],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    zIndex: active.value ? 10 : 0,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
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
