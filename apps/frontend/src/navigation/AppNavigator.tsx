import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { WidgetPickerScreen } from '../screens/home/WidgetPickerScreen';
import { CreateExerciseScreen } from '../screens/workout/CreateExerciseScreen';
import { EditExerciseScreen } from '../screens/workout/EditExerciseScreen';
import { ExerciseLibraryScreen } from '../screens/workout/ExerciseLibraryScreen';
import { ExerciseSelectionScreen } from '../screens/workout/ExerciseSelectionScreen';
import { CurrentWorkoutScreen } from '../screens/workout/CurrentWorkoutScreen';
import { WorkoutPlaceholderScreen } from '../screens/workout/WorkoutPlaceholderScreen';
import { WorkoutTemplateEditorScreen } from '../screens/workout/WorkoutTemplateEditorScreen';
import { WeightHistoryScreen } from '../screens/tracking/WeightHistoryScreen';
import { BodyFatHistoryScreen } from '../screens/tracking/BodyFatHistoryScreen';
import { AddMetricScreen } from '../screens/tracking/AddMetricScreen';
import { CompletedWorkoutScreen } from '../screens/history/CompletedWorkoutScreen';
import { useAuthStore } from '../stores/authStore';
import type { ExerciseSelectionResult } from '../types/exercise';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  WidgetPicker: undefined;
  WeightHistory: undefined;
  BodyFatHistory: undefined;
  CompletedWorkout: { workoutId: string };
  AddMetric: { metric: 'weight' | 'bodyFat' };
  WorkoutTemplateEditor:
    | {
        templateId?: string;
        exerciseSelection?: ExerciseSelectionResult;
      }
    | undefined;
  CurrentWorkout:
    | {
        exerciseSelection?: ExerciseSelectionResult;
      }
    | undefined;
  ExerciseSelection: {
    selectedExerciseIds: string[];
    returnRouteKey: string;
  };
  CreateExercise: undefined;
  EditExercise: { exerciseId: string };
  ExerciseLibrary: undefined;
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
          name="CompletedWorkout"
          component={CompletedWorkoutScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="AddMetric"
          component={AddMetricScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="WorkoutTemplateEditor"
          component={WorkoutTemplateEditorScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="CurrentWorkout"
          component={CurrentWorkoutScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ExerciseSelection"
          component={ExerciseSelectionScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="CreateExercise"
          component={CreateExerciseScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="EditExercise"
          component={EditExerciseScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="ExerciseLibrary"
          component={ExerciseLibraryScreen}
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
