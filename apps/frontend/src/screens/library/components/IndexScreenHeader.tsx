import { Text, View } from 'react-native';

type IndexScreenHeaderProps = {
  kicker: string;
  title: string;
};

// v2 index-screen chrome: a muted kicker above an 800/32 screen title.
// (README section 4 — "kicker (muted 12) → screen title (800 32/1.1)".)
export function IndexScreenHeader({ kicker, title }: IndexScreenHeaderProps) {
  return (
    <View className="gap-[7px]">
      <Text className="text-[12px] font-semibold text-muted leading-[1]">
        {kicker}
      </Text>
      <Text className="text-[32px] font-[800] text-foreground tracking-[-0.64px] leading-[1.1]">
        {title}
      </Text>
    </View>
  );
}
