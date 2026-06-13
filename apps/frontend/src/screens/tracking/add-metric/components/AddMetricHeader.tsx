import { View, Pressable } from 'react-native';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';

type AddMetricHeaderProps = {
  onClose: () => void;
  onSave: () => void;
};

export function AddMetricHeader({ onClose, onSave }: AddMetricHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 h-14">
      <Pressable
        onPress={onClose}
        className="w-11 h-11 rounded-full bg-surface-sunk items-center justify-center active:opacity-60"
      >
        <ClayIcon name="x" size={20} color={colors.ink} />
      </Pressable>

      <Pressable
        onPress={onSave}
        className="w-11 h-11 rounded-full bg-accent items-center justify-center active:opacity-80"
      >
        <ClayIcon name="check" size={20} color={colors.cream} />
      </Pressable>
    </View>
  );
}
