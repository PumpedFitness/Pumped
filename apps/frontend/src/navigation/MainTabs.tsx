import { useState, useCallback } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAuthStore } from '../stores/authStore';
import { AppShell } from '../components/AppShell';
import { HomeScreen } from '../screens/HomeScreen';
import { ClayIcon, type IconName } from '../components/icons/ClayIcon';
import { colors, radii, shadows } from '../theme/tokens';

export type MainTabParamList = {
  Home: undefined;
  Plan: undefined;
  Progress: undefined;
  You: undefined;
};

const Tab = createMaterialTopTabNavigator<MainTabParamList>();

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <AppShell showTabBar style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.ink, fontSize: 18, fontWeight: '600' }}>{title}</Text>
    </AppShell>
  );
}

function PlanPlaceholder() {
  return <PlaceholderScreen title="Plan" />;
}

function ProgressPlaceholder() {
  return <PlaceholderScreen title="Progress" />;
}

function YouPlaceholder() {
  const navigation = useNavigation();
  const resetOnboarding = useAuthStore(s => s.resetOnboarding);

  return (
    <AppShell showTabBar style={{ alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Text style={{ color: colors.ink, fontSize: 18, fontWeight: '600' }}>You</Text>
      <Pressable
        onPress={() => {
          resetOnboarding();
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Onboarding' }] }),
          );
        }}
        style={({ pressed }) => ({
          backgroundColor: pressed ? colors.cardSunk : colors.card,
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.line,
        })}
      >
        <Text style={{ color: colors.danger, fontSize: 15, fontWeight: '600' }}>
          Reset Onboarding
        </Text>
      </Pressable>
    </AppShell>
  );
}

const TAB_CONFIG: { name: keyof MainTabParamList; icon: IconName; label: string }[] = [
  { name: 'Home', icon: 'home', label: 'Home' },
  { name: 'Plan', icon: 'calendar', label: 'Plan' },
  { name: 'Progress', icon: 'pulse', label: 'Progress' },
  { name: 'You', icon: 'settings', label: 'You' },
];

const EASE = Easing.bezier(0.25, 0.1, 0.25, 1);
const DURATION = 300;

type TabLayout = { x: number; width: number };

function AppBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [layouts, setLayouts] = useState<TabLayout[]>([]);
  const ready = layouts.length === TAB_CONFIG.length;
  const activeIdx = state.index;

  const onTabLayout = useCallback(
    (i: number, x: number, width: number) => {
      setLayouts(prev => {
        const next = [...prev];
        next[i] = { x, width };
        return next;
      });
    },
    [],
  );

  const bubbleStyle = useAnimatedStyle(() => {
    if (!ready) return { opacity: 0 };
    const target = layouts[activeIdx];
    return {
      opacity: 1,
      transform: [
        {
          translateX: withTiming(target.x, { duration: DURATION, easing: EASE }),
        },
      ],
      width: withTiming(target.width, { duration: DURATION, easing: EASE }),
    };
  }, [activeIdx, ready, layouts]);

  return (
    <View
      style={[
        {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: insets.bottom + 8,
          height: 64,
          backgroundColor: colors.moss,
          borderRadius: radii.pill,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingHorizontal: 8,
        },
        shadows.nav,
      ]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 9,
            bottom: 9,
            left: 0,
            borderRadius: radii.pill,
            backgroundColor: 'rgba(243, 238, 226, 0.16)',
          },
          bubbleStyle,
        ]}
      />

      {TAB_CONFIG.map((tab, i) => {
        const active = activeIdx === i;
        const isAvatar = tab.name === 'You';
        return (
          <Pressable
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            onLayout={e => {
              const { x, width } = e.nativeEvent.layout;
              onTabLayout(i, x, width);
            }}
            style={{
              height: 46,
              paddingHorizontal: 16,
              borderRadius: radii.pill,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {isAvatar ? (
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: active ? colors.cream : 'rgba(243, 238, 226, 0.35)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: active ? colors.moss : 'rgba(243, 238, 226, 0.7)',
                  }}
                >
                  AK
                </Text>
              </View>
            ) : (
              <ClayIcon
                name={tab.icon}
                size={22}
                stroke={active ? 2.1 : 1.8}
                color={active ? colors.cream : 'rgba(243, 238, 226, 0.55)'}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <Tab.Navigator
        tabBar={props => <AppBar {...props} />}
        tabBarPosition="bottom"
        screenOptions={{
          swipeEnabled: true,
          animationEnabled: true,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Plan" component={PlanPlaceholder} />
        <Tab.Screen name="Progress" component={ProgressPlaceholder} />
        <Tab.Screen name="You" component={YouPlaceholder} />
      </Tab.Navigator>
    </View>
  );
}
