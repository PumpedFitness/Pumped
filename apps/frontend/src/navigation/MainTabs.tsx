import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ProgressScreen} from '../screens/ProgressScreen';
import Svg, {Path, Circle} from 'react-native-svg';

export type MainTabParamList = {
  Workout: undefined;
  History: undefined;
  Progress: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function PlaceholderScreen({title}: {title: string}) {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-foreground text-lg font-semibold">{title}</Text>
    </View>
  );
}

function WorkoutPlaceholder() {
  return <PlaceholderScreen title="Workout" />;
}

function HistoryPlaceholder() {
  return <PlaceholderScreen title="History" />;
}

function ProfilePlaceholder() {
  return <PlaceholderScreen title="Profile" />;
}

function TabIcon({name, color, size}: {name: string; color: string; size: number}) {
  switch (name) {
    case 'Workout':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M2 12h2M20 12h2M6 6v12M9 6v12M15 6v12M18 6v12M6 12h12" />
        </Svg>
      );
    case 'History':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx={12} cy={12} r={9} />
          <Path d="M12 7v5l3 2" />
        </Svg>
      );
    case 'Progress':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
        </Svg>
      );
    case 'Profile':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx={12} cy={8} r={4} />
          <Path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
        </Svg>
      );
    default:
      return null;
  }
}

export function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({color, size}) => (
          <TabIcon name={route.name} color={color} size={size} />
        ),
        tabBarActiveTintColor: '#F4F5F6',
        tabBarInactiveTintColor: '#6F767D',
        tabBarStyle: {
          backgroundColor: '#0F1113',
          borderTopColor: '#1F2327',
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.66,
          textTransform: 'uppercase',
        },
      })}>
      <Tab.Screen name="Workout" component={WorkoutPlaceholder} />
      <Tab.Screen name="History" component={HistoryPlaceholder} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfilePlaceholder} />
    </Tab.Navigator>
  );
}
