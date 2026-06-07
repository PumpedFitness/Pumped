import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { ExerciseSelectionScreen } from '../screens/ExerciseSelectionScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { WorkoutPlaceholderScreen } from '../screens/WorkoutPlaceholderScreen';
import { WorkoutTemplateEditorScreen } from '../screens/WorkoutTemplateEditorScreen';
import { WidgetPickerScreen } from '../screens/WidgetPickerScreen';
import { WeightHistoryScreen } from '../screens/WeightHistoryScreen';
import { BodyFatHistoryScreen } from '../screens/BodyFatHistoryScreen';
import { useAuthStore } from '../stores/authStore';
import type { ExerciseSelectionResult } from '../types/exercise';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  WidgetPicker: undefined;
  WeightHistory: undefined;
  BodyFatHistory: undefined;
  WorkoutTemplateEditor:
    | {
        templateId?: string;
        exerciseSelection?: ExerciseSelectionResult;
      }
    | undefined;
  ExerciseSelection: {
    selectedExerciseIds: string[];
    returnRouteKey: string;
  };
  WorkoutPlaceholder: undefined;
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
        <Stack.Screen
          name="WeightHistory"
          component={WeightHistoryScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="BodyFatHistory"
          component={BodyFatHistoryScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="WorkoutTemplateEditor"
          component={WorkoutTemplateEditorScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ExerciseSelection"
          component={ExerciseSelectionScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="WorkoutPlaceholder"
          component={WorkoutPlaceholderScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
