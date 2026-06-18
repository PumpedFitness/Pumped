import type { ComponentType, ReactNode } from 'react';
import { View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SFSymbol } from 'sf-symbols-typescript';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { ScheduleScreen } from '@/screens/schedule/ScheduleScreen';
import { LibraryScreen } from '@/screens/library/LibraryScreen';
import { HistoryScreen } from '@/screens/history/HistoryScreen';
import { ProfileScreen } from '@/screens/settings/ProfileScreen';
import { ConnectedCurrentWorkoutOverlay } from '@/components/workout/current-workout-overlay';
import { ConnectedTourOverlay } from '@/components/tour';
import type { IconName } from '@/components/icons/ClayIcon';
import { screenTestID } from './testIDs';

export type MainTabParamList = {
  Home: undefined;
  Schedule: undefined;
  Library: undefined;
  History: undefined;
  Profile: undefined;
};

// Screen components receive navigation/route props injected by React Navigation
// (heterogeneous and per-screen); the wrapper only forwards them through, so the
// props are intentionally untyped here — React Navigation validates them at the
// Tab.Screen boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ScreenComponent = ComponentType<any>;

export type TabLabelKey =
  | 'tabs.home'
  | 'tabs.schedule'
  | 'tabs.library'
  | 'tabs.history'
  | 'tabs.user';

export type TabDef = {
  name: keyof MainTabParamList;
  component: ScreenComponent;
  labelKey: TabLabelKey;
  // iOS SF Symbol (idle / focused) — used by the native bar.
  sf: SFSymbol;
  sfFocused: SFSymbol;
  // Vector ClayIcon — used by the JS bar on Android (Fresco can't render the
  // vector-XML drawables the native bar expects, so Android uses a JS bar).
  icon: IconName;
};

const TABS: TabDef[] = [
  {
    name: 'Home',
    component: HomeScreen,
    labelKey: 'tabs.home',
    sf: 'house',
    sfFocused: 'house.fill',
    icon: 'home',
  },
  {
    name: 'Schedule',
    component: ScheduleScreen,
    labelKey: 'tabs.schedule',
    sf: 'calendar',
    sfFocused: 'calendar',
    icon: 'calendar',
  },
  {
    name: 'Library',
    component: LibraryScreen,
    labelKey: 'tabs.library',
    sf: 'dumbbell',
    sfFocused: 'dumbbell.fill',
    icon: 'dumbbell',
  },
  {
    name: 'History',
    component: HistoryScreen,
    labelKey: 'tabs.history',
    sf: 'clock.arrow.circlepath',
    sfFocused: 'clock.arrow.circlepath',
    icon: 'history',
  },
  {
    name: 'Profile',
    component: ProfileScreen,
    labelKey: 'tabs.user',
    sf: 'person.crop.circle',
    sfFocused: 'person.crop.circle.fill',
    icon: 'user',
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

export const SCREENS = TABS.map(tab => ({
  ...tab,
  component: withScreenTestID(tab.name, tab.component),
}));

/**
 * Shared chrome around either tab navigator: the background container with the
 * top safe-area inset, plus the overlays that float above all tab screens.
 */
export function TabsScaffold({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ConnectedCurrentWorkoutOverlay visible={isFocused} />
      {children}
      <ConnectedTourOverlay />
    </View>
  );
}
