import type { ComponentType } from 'react';
import { Platform, View } from 'react-native';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SFSymbol } from 'sf-symbols-typescript';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { ScheduleScreen } from '@/screens/schedule/ScheduleScreen';
import { LibraryScreen } from '@/screens/library/LibraryScreen';
import { HistoryScreen } from '@/screens/history/HistoryScreen';
import { ProfileScreen } from '@/screens/settings/ProfileScreen';
import { ConnectedCurrentWorkoutOverlay } from '@/components/workout/current-workout-overlay';
import { ConnectedTourOverlay } from '@/components/tour';
import { colors } from '@/theme/tokens';
import { screenTestID } from './testIDs';

export type MainTabParamList = {
  Home: undefined;
  Schedule: undefined;
  Library: undefined;
  History: undefined;
  Profile: undefined;
};

const Tab = createNativeBottomTabNavigator<MainTabParamList>();

// Screen components receive navigation/route props injected by React Navigation
// (heterogeneous and per-screen); the wrapper only forwards them through, so the
// props are intentionally untyped here — React Navigation validates them at the
// Tab.Screen boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ScreenComponent = ComponentType<any>;

type TabLabelKey =
  | 'tabs.home'
  | 'tabs.schedule'
  | 'tabs.library'
  | 'tabs.history'
  | 'tabs.user';

type TabDef = {
  name: keyof MainTabParamList;
  component: ScreenComponent;
  labelKey: TabLabelKey;
  // SF Symbol for iOS (idle / focused); Android drawable resource name.
  sf: SFSymbol;
  sfFocused: SFSymbol;
  androidIcon: string;
};

const TABS: TabDef[] = [
  {
    name: 'Home',
    component: HomeScreen,
    labelKey: 'tabs.home',
    sf: 'house',
    sfFocused: 'house.fill',
    androidIcon: 'ic_tab_home',
  },
  {
    name: 'Schedule',
    component: ScheduleScreen,
    labelKey: 'tabs.schedule',
    sf: 'calendar',
    sfFocused: 'calendar',
    androidIcon: 'ic_tab_calendar',
  },
  {
    name: 'Library',
    component: LibraryScreen,
    labelKey: 'tabs.library',
    sf: 'dumbbell',
    sfFocused: 'dumbbell.fill',
    androidIcon: 'ic_tab_dumbbell',
  },
  {
    name: 'History',
    component: HistoryScreen,
    labelKey: 'tabs.history',
    sf: 'clock.arrow.circlepath',
    sfFocused: 'clock.arrow.circlepath',
    androidIcon: 'ic_tab_history',
  },
  {
    name: 'Profile',
    component: ProfileScreen,
    labelKey: 'tabs.user',
    sf: 'person.crop.circle',
    sfFocused: 'person.crop.circle.fill',
    androidIcon: 'ic_tab_user',
  },
];

// Wrap a screen in a testID'd container so each tab exposes a stable Android
// `resource-id` (screen-home, screen-library, …) for e2e assertions. `collapsable`
// keeps the wrapper from being flattened out of the native view tree, which
// would drop the testID. Built once at module scope so screen identity is
// stable across renders (an inline wrapper would remount on every render).
function withScreenTestID(
  name: keyof MainTabParamList,
  Component: ScreenComponent,
): ScreenComponent {
  function ScreenWithTestID(props: object) {
    return (
      <View testID={screenTestID(name)} collapsable={false} className="flex-1">
        <Component {...props} />
      </View>
    );
  }
  ScreenWithTestID.displayName = `ScreenWithTestID(${name})`;
  return ScreenWithTestID;
}

const SCREENS = TABS.map(tab => ({
  ...tab,
  component: withScreenTestID(tab.name, tab.component),
}));

export function MainTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ConnectedCurrentWorkoutOverlay visible={isFocused} />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
        }}
      >
        {SCREENS.map(({ name, component, labelKey, sf, sfFocused, androidIcon }) => (
          <Tab.Screen
            key={name}
            name={name}
            component={component}
            options={{
              tabBarLabel: t(labelKey),
              // Keep the glass bar (with labels) fixed on scroll. The native bar
              // only offers an all-or-nothing collapse-to-pill minimize, which
              // we don't want, so disable it.
              tabBarMinimizeBehavior: 'none',
              tabBarIcon: ({ focused }) =>
                Platform.OS === 'ios'
                  ? { type: 'sfSymbol', name: focused ? sfFocused : sf }
                  : { type: 'image', source: { uri: androidIcon } },
            }}
          />
        ))}
      </Tab.Navigator>
      <ConnectedTourOverlay />
    </View>
  );
}
