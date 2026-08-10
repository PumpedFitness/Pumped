import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useHomescreenStore } from '@/stores/homescreenStore';
import type {
  QuickAction,
  QuickActionOption,
} from './components/QuickActions';
import {
  QUICK_ACTION_KEYS,
  quickActionRegistry,
  type QuickActionKey,
} from './quickActionRegistry';

type UseQuickActions = {
  actions: QuickAction[];
  available: QuickActionOption[];
  add: (key: string) => void;
  remove: (key: string) => void;
};

/**
 * Resolves the user's stored quick-action keys into rendered actions, and the
 * remaining catalog into the add-options shown while editing. Press handlers
 * live here rather than in the registry so the registry stays serialisable.
 */
export function useQuickActions(startSession: () => void): UseQuickActions {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const keys = useHomescreenStore(s => s.quickActions);
  const addQuickAction = useHomescreenStore(s => s.addQuickAction);
  const removeQuickAction = useHomescreenStore(s => s.removeQuickAction);

  const goToTab = useCallback(
    (screen: 'Schedule' | 'Library' | 'History') =>
      navigation.dispatch(
        CommonActions.navigate({ name: 'Main', params: { screen } }),
      ),
    [navigation],
  );

  const handlers: Record<QuickActionKey, () => void> = {
    startWorkout: startSession,
    logLift: startSession,
    timer: startSession,
    weighIn: () => navigation.navigate('AddMetric', { metric: 'weight' }),
    trends: () =>
      navigation.dispatch(CommonActions.navigate({ name: 'Trends' })),
    schedule: () => goToTab('Schedule'),
    library: () => goToTab('Library'),
    history: () => goToTab('History'),
    newExercise: () => navigation.navigate('CreateExercise'),
  };

  return {
    actions: keys.map(key => ({
      key,
      icon: quickActionRegistry[key].icon,
      label: t(`home.quick.${key}`),
      onPress: handlers[key],
    })),
    available: QUICK_ACTION_KEYS.filter(key => !keys.includes(key)).map(key => ({
      key,
      icon: quickActionRegistry[key].icon,
      label: t(`home.quick.${key}`),
    })),
    add: key => addQuickAction(key as QuickActionKey),
    remove: key => removeQuickAction(key as QuickActionKey),
  };
}
