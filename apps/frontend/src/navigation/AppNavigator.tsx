import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainTabs} from './MainTabs';
import {LoginScreen} from '../screens/LoginScreen';
import {ActiveWorkoutScreen} from '../screens/ActiveWorkoutScreen';
import {HistoryDetailScreen} from '../screens/HistoryDetailScreen';
import {ExercisePickerScreen} from '../screens/ExercisePickerScreen';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  ActiveWorkout: undefined;
  HistoryDetail: undefined;
  ExercisePicker: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const pumped: typeof DefaultTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: '#0F1113',
    card: '#0F1113',
    text: '#F4F5F6',
    border: '#1F2327',
    primary: '#D4A574',
    notification: '#D4A574',
  },
};

export function AppNavigator() {
  return (
    <NavigationContainer theme={pumped}>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="ActiveWorkout"
          component={ActiveWorkoutScreen}
          options={{animation: 'slide_from_bottom'}}
        />
        <Stack.Screen
          name="HistoryDetail"
          component={HistoryDetailScreen}
          options={{animation: 'slide_from_right'}}
        />
        <Stack.Screen
          name="ExercisePicker"
          component={ExercisePickerScreen}
          options={{animation: 'slide_from_bottom', presentation: 'modal'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
