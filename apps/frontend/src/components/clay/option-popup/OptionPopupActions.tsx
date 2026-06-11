import { Pressable, Text, View } from 'react-native';

type CancelActionProps = {
  onClose: () => void;
};

export function CancelAction({ onClose }: CancelActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="mt-5 min-h-11 items-center justify-center"
      onPress={onClose}
    >
      <Text className="t-label text-text-muted">Cancel</Text>
    </Pressable>
  );
}

type ConfirmationActionsProps = CancelActionProps & {
  confirmLabel: string;
  disabled: boolean;
  onConfirm: () => void;
};

export function ConfirmationActions({
  confirmLabel,
  disabled,
  onClose,
  onConfirm,
}: ConfirmationActionsProps) {
  return (
    <View className="mt-5 flex-row gap-3">
      <Pressable
        accessibilityRole="button"
        className="min-h-12 flex-1 items-center justify-center rounded-full border border-border-hairline bg-surface-card"
        onPress={onClose}
      >
        <Text className="t-label">Cancel</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        className={`min-h-12 flex-1 items-center justify-center rounded-full ${
          disabled ? 'bg-surface-sunk' : 'bg-accent'
        }`}
        disabled={disabled}
        onPress={onConfirm}
      >
        <Text
          className={`t-label ${
            disabled ? 'text-muted' : 'text-accent-foreground'
          }`}
        >
          {confirmLabel}
        </Text>
      </Pressable>
    </View>
  );
}
