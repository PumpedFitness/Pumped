import { StackActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './AppNavigator';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function openCurrentWorkout(navigation: RootNavigation) {
  const hasCurrentWorkoutRoute = navigation
    .getState()
    .routes.some(route => route.name === 'CurrentWorkout');

  if (hasCurrentWorkoutRoute) {
    navigation.dispatch(StackActions.popTo('CurrentWorkout'));
    return;
  }

  navigation.navigate('CurrentWorkout');
}
