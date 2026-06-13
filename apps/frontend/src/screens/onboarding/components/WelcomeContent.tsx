import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';

const EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

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

export function WelcomeContent() {
  const { t } = useTranslation();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(
      200,
      withTiming(1, { duration: 500, easing: EASE }),
    );
    translateY.value = withDelay(
      200,
      withTiming(0, { duration: 500, easing: EASE }),
    );
  }, [opacity, translateY]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View className="flex-1 justify-center px-6">
      <Animated.View style={contentStyle}>
        <Text className="text-[30px] font-bold text-foreground tracking-[-0.6px] mb-1.5">
          {t('common.appName')}
        </Text>

        <Text className="text-[15px] text-muted leading-[22px] mb-7">
          {t('onboarding.welcome.subtitle')}
        </Text>

        <View className="gap-2.5">
          {WELCOME_CARDS.map((card, i) => (
            <View
              key={i}
              className="bg-surface-card rounded-[22px] border border-border-hairline p-4 flex-row gap-3.5"
            >
              <View className="w-9 h-9 rounded-xl bg-accent-soft items-center justify-center">
                <ClayIcon name={card.icon} size={20} color={colors.accent} />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-foreground mb-[3px]">
                  {t(card.titleKey)}
                </Text>
                <Text className="text-[13.5px] text-muted leading-[19px]">
                  {t(card.bodyKey)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
