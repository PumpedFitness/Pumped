import { useRef, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Swipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { colors } from '../../theme/tokens';
import { ClayIcon } from '../icons/ClayIcon';

type SwipeToDeleteProps = {
  children: ReactNode;
  onDelete: () => void;
  borderRadius?: number;
};

function RightAction(prog: SharedValue<number>, _drag: SharedValue<number>) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(prog.value, [0, 0.5, 1], [0, 0.8, 1], 'clamp'),
  }));

  return (
    <Reanimated.View style={styles.action}>
      <Reanimated.View style={animatedStyle}>
        <ClayIcon name="trash" size={22} color="#fff" />
      </Reanimated.View>
    </Reanimated.View>
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
      renderRightActions={(prog, drag) => RightAction(prog, drag)}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  action: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.danger,
  },
});
