import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { PumpedLogoMark } from '@/components/brand/PumpedLogoMark';

// Timeline (ms): logo sketches in → headline words punch in → tagline + badges
// → ambience bars rise and keep breathing.
const WORDS_START = 900;
const WORD_STAGGER = 140;
const BARS_START = 1500;

// Skyline of effort: relative bar heights, tallest is "today".
const BARS = [0.35, 0.55, 0.42, 0.7, 0.5, 0.88, 1];
const BAR_MAX_HEIGHT = 92;

type HeadlineWordProps = { word: string; delay: number; accent: boolean };

function HeadlineWord({ word, delay, accent }: HeadlineWordProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withSpring(1, { damping: 16, stiffness: 160, mass: 0.8 }),
    );
  }, [progress, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 26 }],
  }));

  return (
    <Animated.View style={style}>
      <Text
        className={
          'text-[44px] font-[800] tracking-[-0.9px] leading-[50px] ' +
          (accent ? 'text-accent' : 'text-foreground')
        }
      >
        {word}
      </Text>
    </Animated.View>
  );
}

type AmbienceBarProps = { height: number; delay: number; strongest: boolean };

function AmbienceBar({ height, delay, strongest }: AmbienceBarProps) {
  const rise = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    rise.value = withDelay(
      delay,
      withSpring(1, { damping: 15, stiffness: 120 }),
    );
    breathe.value = withDelay(
      delay + 700,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [rise, breathe, delay]);

  const style = useAnimatedStyle(() => ({
    height: height * BAR_MAX_HEIGHT * rise.value + breathe.value * 6,
  }));

  return (
    <Animated.View
      style={style}
      className={
        'flex-1 rounded-full ' +
        (strongest ? 'bg-accent' : 'bg-[rgba(27,26,24,0.08)]')
      }
    />
  );
}

export function WelcomeContent() {
  const { t } = useTranslation();
  const words = t('onboarding.welcome.headline').split(' ');

  return (
    <View className="flex-1 px-7">
      <View className="flex-1 justify-center">
        <PumpedLogoMark size={96} delay={150} />

        <View className="mt-9 flex-row flex-wrap gap-x-[10px]">
          {words.map((word, i) => (
            <HeadlineWord
              key={`${word}-${i}`}
              word={word}
              delay={WORDS_START + i * WORD_STAGGER}
              accent={i === words.length - 1}
            />
          ))}
        </View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(
            WORDS_START + words.length * WORD_STAGGER + 100,
          )}
        >
          <Text className="text-[16px] text-muted mt-5 leading-[24px]">
            {t('onboarding.welcome.tagline')}
          </Text>
          <Text className="text-[12px] font-semibold uppercase tracking-[1.6px] text-muted mt-6">
            {t('onboarding.welcome.badges')}
          </Text>
        </Animated.View>
      </View>

      <View className="flex-row items-end gap-2 h-[100px] mb-2">
        {BARS.map((height, i) => (
          <AmbienceBar
            key={i}
            height={height}
            delay={BARS_START + i * 70}
            strongest={i === BARS.length - 1}
          />
        ))}
      </View>
    </View>
  );
}
