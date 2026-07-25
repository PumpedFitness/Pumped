import { Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

type EditBannerProps = {
  text: string;
};

/** Edit-mode banner — accent-tint, rises in. README §1 "Edit mode". */
export function EditBanner({ text }: EditBannerProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(260)}
      className="flex-row items-center gap-[8px] rounded-[20px] bg-accent-soft px-[16px] py-[13px]"
    >
      <View className="h-[7px] w-[7px] rounded-full bg-accent" />
      <Text className="flex-1 text-[12px] font-[600] text-[#A84324]">{text}</Text>
    </Animated.View>
  );
}
