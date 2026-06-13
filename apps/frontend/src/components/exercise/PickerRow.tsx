import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { Card } from '@/components/clay/Card';
import { ClayIcon } from '@/components/icons/ClayIcon';

type PickerRowProps = {
  label: string;
  value: string | undefined;
  placeholder: string;
  onPress: () => void;
  numberOfLines?: number;
};

export function PickerRow({
  label,
  value,
  placeholder,
  onPress,
  numberOfLines,
}: PickerRowProps) {
  return (
    <Card variant="card" radius="xl" pad={0}>
      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between px-4 py-3.5"
      >
        {/* Line-clamped values fill the row width so long text wraps instead
            of pushing the chevron out. */}
        <View className={numberOfLines != null ? 'flex-1' : undefined}>
          <Text className="text-[12.5px] text-muted">{label}</Text>
          <Text
            className={`text-[15px] font-medium mt-0.5 ${
              value ? 'text-foreground' : 'text-muted'
            }`}
            numberOfLines={numberOfLines}
          >
            {value ?? placeholder}
          </Text>
        </View>
        <ClayIcon name="chevron" size={16} color={colors.muted} />
      </Pressable>
    </Card>
  );
}
