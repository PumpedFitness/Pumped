import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ClayIcon } from '../icons/ClayIcon';
import { colors, radii } from '../../theme/tokens';

const EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

const WELCOME_CARDS: {
  icon: 'target' | 'bolt' | 'settings';
  title: string;
  body: string;
}[] = [
  {
    icon: 'target',
    title: 'Offline first',
    body: "We hate it when you can't use an app without internet, so you can use this app anytime.",
  },
  {
    icon: 'bolt',
    title: 'Always free',
    body: 'All offline features stay free forever.',
  },
  {
    icon: 'settings',
    title: 'Lots of options',
    body: 'We like to minmax our workouts to make more gains, so we added a bunch of stuff to achieve this.',
  },
];

export function WelcomeContent() {
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
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
      <Animated.View style={contentStyle}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: colors.ink,
            letterSpacing: -0.6,
            marginBottom: 6,
          }}
        >
          PUMPED
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: colors.muted,
            lineHeight: 22,
            marginBottom: 28,
          }}
        >
          Your lifting companion.{'\n'}Track every rep, own every gain.
        </Text>

        <View style={{ gap: 10 }}>
          {WELCOME_CARDS.map((card, i) => (
            <View
              key={i}
              style={{
                backgroundColor: colors.card,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.line,
                padding: 16,
                flexDirection: 'row',
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: radii.sm,
                  backgroundColor: colors.accentSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ClayIcon name={card.icon} size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: colors.ink,
                    marginBottom: 3,
                  }}
                >
                  {card.title}
                </Text>
                <Text
                  style={{
                    fontSize: 13.5,
                    color: colors.muted,
                    lineHeight: 19,
                  }}
                >
                  {card.body}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
