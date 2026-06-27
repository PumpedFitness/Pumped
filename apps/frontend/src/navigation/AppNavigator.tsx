import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
import { WidgetPickerScreen } from '@/screens/home/widget-picker/WidgetPickerScreen';
import { CreateExerciseScreen } from '@/screens/library/create-exercise/CreateExerciseScreen';
import { EditExerciseScreen } from '@/screens/library/edit-exercise/EditExerciseScreen';
import { ExerciseSelectionScreen } from '@/screens/schedule/exercise-selection/ExerciseSelectionScreen';
import { CurrentWorkoutScreen } from '@/screens/schedule/current-workout/CurrentWorkoutScreen';
import { WorkoutPlaceholderScreen } from '@/screens/schedule/placeholder/WorkoutPlaceholderScreen';
import { WorkoutTemplateEditorScreen } from '@/screens/library/template-editor/WorkoutTemplateEditorScreen';
import { ExerciseSetEditorScreen } from '@/screens/library/exercise-set-editor/ExerciseSetEditorScreen';
import { SetTypeEditorScreen } from '@/screens/library/set-type-editor/SetTypeEditorScreen';
import { ScheduleEditorScreen } from '@/screens/schedule/schedule-editor/ScheduleEditorScreen';
import { MetricHistoryScreen } from '@/screens/tracking/metric-history/MetricHistoryScreen';
import { AddMetricScreen } from '@/screens/tracking/add-metric/AddMetricScreen';
import { CompletedWorkoutScreen } from '@/screens/history/completed-workout/CompletedWorkoutScreen';
import { CsvImportScreen } from '@/screens/settings/csv-import/CsvImportScreen';
import { ImportHistoryScreen } from '@/screens/settings/import-history/ImportHistoryScreen';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme/tokens';
import type {
  EditableExercise,
  ExerciseEditResult,
  ExerciseSelectionResult,
} from '@/types/exercise';

export type MetricKind = 'weight' | 'bodyFat';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  WidgetPicker: undefined;
  MetricHistory: { metric: MetricKind };
  CompletedWorkout: { workoutId: string };
  AddMetric: { metric: MetricKind };
  WorkoutTemplateEditor:
    | {
        templateId?: string;
        exerciseSelection?: ExerciseSelectionResult;
        exerciseEdit?: ExerciseEditResult;
      }
    | undefined;
  ExerciseSetEditor: {
    exercise: EditableExercise;
    name: string;
    returnRouteKey: string;
  };
  SetTypeEditor: { setTypeId?: string } | undefined;
  ScheduleEditor: { scheduleId?: string } | undefined;
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
  WorkoutPlaceholder: undefined;
  CsvImport: undefined;
  ImportHistory: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const pumped: typeof DefaultTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.ink,
    border: colors.line,
    primary: colors.accent,
    notification: colors.accent,
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
          name="MetricHistory"
          component={MetricHistoryScreen}
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
          name="ExerciseSetEditor"
          component={ExerciseSetEditorScreen}
          // gestureEnabled:false — the unsaved-changes guard uses a beforeRemove
          // listener, which native-stack's swipe-to-dismiss races (the screen is
          // removed natively before JS can prompt). Exit via Cancel/Done instead.
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="SetTypeEditor"
          component={SetTypeEditorScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="ScheduleEditor"
          component={ScheduleEditorScreen}
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
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="WorkoutPlaceholder"
          component={WorkoutPlaceholderScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="CsvImport"
          component={CsvImportScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ImportHistory"
          component={ImportHistoryScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
