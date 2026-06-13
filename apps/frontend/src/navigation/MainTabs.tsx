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

export type MainTabParamList = {
  Home: undefined;
  Plan: undefined;
  Library: undefined;
  History: undefined;
  Profile: undefined;
};

const Tab = createMaterialTopTabNavigator<MainTabParamList>();

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
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Plan" component={PlanScreen} />
        <Tab.Screen name="Library" component={LibraryScreen} />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ swipeEnabled: false }}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
}
