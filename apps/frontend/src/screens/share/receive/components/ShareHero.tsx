import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type ShareHeroProps = {
  eyebrow: string;
  title: string;
  meta?: string | null;
  leading?: ReactNode;
};

/** The dark header card at the top of every preview, like the workout detail. */
export function ShareHero({ eyebrow, title, meta, leading }: ShareHeroProps) {
  return (
    <View className="flex-row items-center gap-4 rounded-[24px] bg-moss px-5 py-5">
      {leading}
      <View className="flex-1">
        <Text className="t-eyebrow text-surface-card/70">{eyebrow}</Text>
        <Text className="t-title mt-1 text-surface-card">{title}</Text>
        {meta ? (
          <Text className="t-caption mt-2 text-surface-card/70">{meta}</Text>
        ) : null}
      </View>
    </View>
  );
}
