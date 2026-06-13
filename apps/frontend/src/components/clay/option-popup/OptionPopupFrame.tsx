import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type OptionPopupFrameProps = {
  visible: boolean;
  title: string;
  text: string;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
};

export function OptionPopupFrame({
  visible,
  title,
  text,
  children,
  footer,
  onClose,
}: OptionPopupFrameProps) {
  const { t } = useTranslation();

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        accessibilityViewIsModal
        className="flex-1 items-center justify-center px-5"
      >
        <Pressable
          accessibilityLabel={t('common.closePopup')}
          accessibilityRole="button"
          className="absolute inset-0 bg-black/60"
          onPress={onClose}
        />

        <View className="w-full max-w-md rounded-[28px] border border-border-hairline bg-surface-card px-5 py-6 shadow-2xl">
          <Text className="t-title text-center">{title}</Text>
          <Text className="t-body mt-2 text-center text-text-secondary">
            {text}
          </Text>
          {children}
          {footer}
        </View>
      </View>
    </Modal>
  );
}
