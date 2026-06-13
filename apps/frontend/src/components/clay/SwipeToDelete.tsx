import { useRef, type ReactNode } from 'react';
import Swipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { AnimatedView } from '@/components/uniwind';

type SwipeToDeleteProps = {
  children: ReactNode;
  onDelete: () => void;
  borderRadius?: number;
};

type RightActionProps = {
  prog: SharedValue<number>;
  drag: SharedValue<number>;
};

function RightAction({ prog }: RightActionProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(prog.value, [0, 0.5, 1], [0, 0.8, 1], 'clamp'),
  }));

  return (
    <AnimatedView className="flex-1 justify-center items-center bg-danger">
      <AnimatedView style={animatedStyle}>
        <ClayIcon name="trash" size={22} color="#fff" />
      </AnimatedView>
    </AnimatedView>
  );
}

export function SwipeToDelete({
  children,
  onDelete,
  borderRadius = 0,
}: SwipeToDeleteProps) {
  const swipeableRef = useRef<SwipeableMethods>(null);

  const handleOpen = () => {
    swipeableRef.current?.reset();
    onDelete();
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={120}
      overshootFriction={8}
      enableTrackpadTwoFingerGesture
      dragOffsetFromRightEdge={20}
      containerStyle={{ borderRadius }}
      onSwipeableOpen={handleOpen}
      renderRightActions={(prog, drag) => (
        <RightAction prog={prog} drag={drag} />
      )}
    >
      {children}
    </Swipeable>
  );
}
