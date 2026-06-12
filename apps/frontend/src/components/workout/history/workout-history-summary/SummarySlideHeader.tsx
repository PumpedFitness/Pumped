import { Text, View } from 'react-native';
import { colors } from '../../../../theme/tokens';
import { ClayIcon, type IconName } from '../../../icons/ClayIcon';

type SummarySlideHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: IconName;
};

export function SummarySlideHeader({
  eyebrow,
  title,
  description,
  icon,
}: SummarySlideHeaderProps) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <View className="flex-1">
        <Text className="t-eyebrow text-cream-dim">{eyebrow}</Text>
        <Text className="mt-1 text-[25px] font-bold tracking-[-0.5px] text-cream">
          {title}
        </Text>
        <Text className="t-caption mt-1 text-cream-dim">{description}</Text>
      </View>
      <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-white/10">
        <ClayIcon name={icon} size={21} color={colors.cream} />
      </View>
    </View>
  );
}
