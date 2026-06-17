import type { ComponentType } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useIsFocused } from '@react-navigation/native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { PlanScreen } from '@/screens/workout/plan/PlanScreen';
import { LibraryScreen } from '@/screens/workout/library/LibraryScreen';
import { HistoryScreen } from '@/screens/history/HistoryScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { ConnectedCurrentWorkoutOverlay } from '@/components/workout/current-workout-overlay';
import { AppBar } from './AppBar';
import { screenTestID } from './testIDs';

export type MainTabParamList = {
  Home: undefined;
  Plan: undefined;
  Library: undefined;
  History: undefined;
  Profile: undefined;
};

const Tab = createMaterialTopTabNavigator<MainTabParamList>();

// Screen components receive navigation/route props injected by React Navigation
// (heterogeneous and per-screen); the wrapper only forwards them through, so the
// props are intentionally untyped here — React Navigation validates them at the
// Tab.Screen boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ScreenComponent = ComponentType<any>;

type TabScreen = {
  name: keyof MainTabParamList;
  component: ScreenComponent;
  swipeEnabled?: boolean;
};

// Wrap a screen in a testID'd container so each tab exposes a stable Android
// `resource-id` (screen-home, screen-plan, …) for e2e assertions. `collapsable`
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

const SCREENS: TabScreen[] = (
  [
    { name: 'Home', component: HomeScreen },
    { name: 'Plan', component: PlanScreen },
    { name: 'Library', component: LibraryScreen },
    { name: 'History', component: HistoryScreen, swipeEnabled: false },
    { name: 'Profile', component: ProfileScreen },
  ] satisfies TabScreen[]
).map(s => ({ ...s, component: withScreenTestID(s.name, s.component) }));

export function MainTabs() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ConnectedCurrentWorkoutOverlay visible={isFocused} />
      <Tab.Navigator
        tabBar={props => <AppBar {...props} />}
        tabBarPosition="bottom"
        screenOptions={{
          swipeEnabled: true,
          animationEnabled: true,
        }}
      >
        {SCREENS.map(({ name, component, swipeEnabled }) => (
          <Tab.Screen
            key={name}
            name={name}
            component={component}
            options={swipeEnabled === false ? { swipeEnabled: false } : undefined}
          />
        ))}
      </Tab.Navigator>
    </View>
  );
}
