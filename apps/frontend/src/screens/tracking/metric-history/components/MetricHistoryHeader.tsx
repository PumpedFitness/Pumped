import { View, Text, Pressable } from 'react-native';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';

type MetricHistoryHeaderProps = {
  title: string;
  onBack: () => void;
  onAdd: () => void;
};

export function MetricHistoryHeader({
  title,
  onBack,
  onAdd,
}: MetricHistoryHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 h-[52px]">
      <Pressable
        onPress={onBack}
        className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
      >
        <ClayIcon name="back" size={22} color={colors.ink} />
      </Pressable>

      <Text className="text-[17px] font-bold text-foreground">{title}</Text>

      <Pressable
        onPress={onAdd}
        className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
      >
        <ClayIcon name="plus" size={22} color={colors.accent} />
      </Pressable>
    </View>
  );
}
