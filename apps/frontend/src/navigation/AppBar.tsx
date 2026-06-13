import { useState, useCallback } from 'react';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ClayIcon, type IconName } from '@/components/icons/ClayIcon';
import { AnimatedView } from '@/components/uniwind';
import { colors, shadows } from '@/theme/tokens';
import type { MainTabParamList } from './MainTabs';

type TabLabelKey =
  | 'tabs.home'
  | 'tabs.plan'
  | 'tabs.library'
  | 'tabs.history'
  | 'tabs.you';

export const TAB_CONFIG: {
  name: keyof MainTabParamList;
  icon: IconName;
  labelKey: TabLabelKey;
}[] = [
  { name: 'Home', icon: 'home', labelKey: 'tabs.home' },
  { name: 'Plan', icon: 'calendar', labelKey: 'tabs.plan' },
  { name: 'Library', icon: 'dumbbell', labelKey: 'tabs.library' },
  { name: 'History', icon: 'history', labelKey: 'tabs.history' },
  { name: 'Profile', icon: 'settings', labelKey: 'tabs.you' },
];

const EASE = Easing.bezier(0.25, 0.1, 0.25, 1);
const DURATION = 300;

type TabLayout = { x: number; width: number };

function getInitials(name: string): string {
  if (!name.trim()) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type AppBarProps = MaterialTopTabBarProps;

export function AppBar({ state, navigation }: AppBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { profile } = useUserProfile();
  const initials = getInitials(profile.name);
  const [layouts, setLayouts] = useState<TabLayout[]>([]);
  const ready = layouts.filter(Boolean).length === TAB_CONFIG.length;
  const activeIdx = state.index;

  const onTabLayout = useCallback((i: number, x: number, width: number) => {
    setLayouts(prev => {
      const next = [...prev];
      next[i] = { x, width };
      return next;
    });
  }, []);

  const bubbleStyle = useAnimatedStyle(() => {
    const target = layouts[activeIdx];
    if (!ready || !target) return { opacity: 0 };
    return {
      opacity: 1,
      transform: [
        {
          translateX: withTiming(target.x, {
            duration: DURATION,
            easing: EASE,
          }),
        },
      ],
      width: withTiming(target.width, { duration: DURATION, easing: EASE }),
    };
  }, [activeIdx, ready, layouts]);

  return (
    <View
      className="absolute left-4 right-4 h-16 bg-moss rounded-full flex-row items-center justify-around px-2"
      style={[{ bottom: insets.bottom + 8 }, shadows.nav]}
    >
      <AnimatedView
        className="absolute top-[9px] bottom-[9px] left-0 rounded-full bg-[rgba(243,238,226,0.16)]"
        style={bubbleStyle}
      />

      {TAB_CONFIG.map((tab, i) => {
        const active = activeIdx === i;
        const isAvatar = tab.name === 'Profile';
        return (
          <Pressable
            key={tab.name}
            accessibilityLabel={t(tab.labelKey)}
            onPress={() => navigation.navigate(tab.name)}
            onLayout={e => {
              const { x, width } = e.nativeEvent.layout;
              onTabLayout(i, x, width);
            }}
            className="h-[46px] px-4 rounded-full flex-row items-center gap-2"
          >
            {isAvatar && initials ? (
              <View
                className={
                  'w-[26px] h-[26px] rounded-[13px] items-center justify-center ' +
                  (active ? 'bg-cream' : 'bg-[rgba(243,238,226,0.35)]')
                }
              >
                <Text
                  className={
                    'text-[10px] font-bold ' +
                    (active ? 'text-moss' : 'text-[rgba(243,238,226,0.7)]')
                  }
                >
                  {initials}
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
