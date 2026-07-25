import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { PumpedLogoMark } from '@/components/brand/PumpedLogoMark';
import { colors } from '@pumped/ui/theme/tokens';

// Timeline (ms): mark lifts in → cards fly in one by one.
const CARDS_START = 700;
const CARD_STAGGER = 130;

const WELCOME_CARDS = [
  {
    icon: 'target',
    titleKey: 'onboarding.welcome.cards.offline.title',
    bodyKey: 'onboarding.welcome.cards.offline.body',
  },
  {
    icon: 'bolt',
    titleKey: 'onboarding.welcome.cards.free.title',
    bodyKey: 'onboarding.welcome.cards.free.body',
  },
  {
    icon: 'settings',
    titleKey: 'onboarding.welcome.cards.options.title',
    bodyKey: 'onboarding.welcome.cards.options.body',
  },
] as const;

type WelcomeCardProps = {
  icon: string;
  title: string;
  body: string;
  delay: number;
};

function WelcomeCard({ icon, title, body, delay }: WelcomeCardProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withSpring(1, { damping: 15, stiffness: 130, mass: 0.9 }),
    );
  }, [progress, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 28 },
      { scale: 0.96 + progress.value * 0.04 },
    ],
  }));

  return (
    <Animated.View
      style={style}
      className="bg-surface-card rounded-[22px] border border-border-hairline p-4 flex-row gap-3.5"
    >
      <View className="w-9 h-9 rounded-xl bg-accent-soft items-center justify-center">
        <ClayIcon name={icon} size={20} color={colors.accent} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-foreground mb-[3px]">
          {title}
        </Text>
        <Text className="text-[13.5px] text-muted leading-[19px]">{body}</Text>
      </View>
    </Animated.View>
  );
}

export function WelcomeContent() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 justify-center px-6">
      <View className="items-center mb-12">
        <PumpedLogoMark size={132} delay={250} />
      </View>

      <View className="gap-2.5">
        {WELCOME_CARDS.map((card, i) => (
          <WelcomeCard
            key={i}
            icon={card.icon}
            title={t(card.titleKey)}
            body={t(card.bodyKey)}
            delay={CARDS_START + i * CARD_STAGGER}
          />
        ))}
      </View>
    </View>
  );
}
