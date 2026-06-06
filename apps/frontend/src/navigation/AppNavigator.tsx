import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { WidgetPickerScreen } from '../screens/WidgetPickerScreen';
import { useAuthStore } from '../stores/authStore';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  WidgetPicker: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const pumped: typeof DefaultTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    background: '#EAE3D5',
    card: '#F7F2E8',
    text: '#34362C',
    border: 'rgba(52, 54, 44, 0.09)',
    primary: '#C67B52',
    notification: '#C67B52',
  },
};

export function AppNavigator() {
  const hasOnboarded = useAuthStore(s => s.hasOnboarded);

  return (
    <NavigationContainer theme={pumped}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={hasOnboarded ? 'Main' : 'Onboarding'}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="WidgetPicker"
          component={WidgetPickerScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
