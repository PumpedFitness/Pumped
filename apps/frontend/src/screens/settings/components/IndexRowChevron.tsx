import { View } from 'react-native';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';

// v2 index-row trailing affordance: a 32px #F1EFEC circle holding a chevron.
// (README section 4 — "32px #F1EFEC circle with chevron".)
export function IndexRowChevron() {
  return (
    <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F1EFEC]">
      <ClayIcon name="chevron" size={16} color={colors.ink2} />
    </View>
  );
}
