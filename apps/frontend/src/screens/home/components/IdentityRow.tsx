import { Text, View } from 'react-native';

type IdentityRowProps = {
  initials: string;
  dateLabel: string;
  blockStatus: string;
};

const AVATAR_SHADOW = {
  shadowColor: '#1B1A18',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.07,
  shadowRadius: 12,
  elevation: 2,
} as const;

/**
 * Identity row — avatar (initials) + date/block status. README §1.1.
 * The edit affordance lives in the footer, below the widget grid, so the top
 * of the screen carries orientation only.
 */
export function IdentityRow({
  initials,
  dateLabel,
  blockStatus,
}: IdentityRowProps) {
  return (
    <View className="flex-row items-center gap-[12px]">
      <View
        className="h-[42px] w-[42px] items-center justify-center rounded-full bg-[#DAD7D2]"
        style={AVATAR_SHADOW}
      >
        <Text className="text-[13px] font-[700] text-muted">{initials}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-[12px] font-[500] text-muted">{dateLabel}</Text>
        <Text
          className="mt-[6px] text-[15px] font-[700] text-foreground"
          numberOfLines={1}
        >
          {blockStatus}
        </Text>
      </View>
    </View>
  );
}
