import { Text } from 'react-native';

type IndexScreenHeaderProps = {
  title: string;
};

// v2 index-screen title (README section 4 — "screen title (800 32/1.1)").
export function IndexScreenHeader({ title }: IndexScreenHeaderProps) {
  return (
    <Text className="text-[32px] font-[800] text-foreground tracking-[-0.64px] leading-[1.1]">
      {title}
    </Text>
  );
}
