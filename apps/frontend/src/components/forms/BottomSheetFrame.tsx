import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

const StyledGestureHandlerRootView = withUniwind(GestureHandlerRootView);

type BottomSheetFrameProps = {
  visible: boolean;
  accessibilityLabel: string;
  children: ReactNode;
  onClose: () => void;
};

export function BottomSheetFrame({
  visible,
  accessibilityLabel,
  children,
  onClose,
}: BottomSheetFrameProps) {
  return (
    <Modal
      animationType="none"
      navigationBarTranslucent
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      {visible && (
        <StyledGestureHandlerRootView className="flex-1">
          <View className="absolute inset-0">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={accessibilityLabel}
              className="absolute inset-0 bg-black/35"
              onPress={onClose}
            />

            <Animated.View
              entering={SlideInDown.duration(220)}
              className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-background"
            >
              {children}
            </Animated.View>
          </View>
        </StyledGestureHandlerRootView>
      )}
    </Modal>
  );
}
