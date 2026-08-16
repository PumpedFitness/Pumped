import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { openCurrentWorkout } from '@/navigation/openCurrentWorkout';
import { useCurrentWorkout } from './useCurrentWorkout';
import { useHomeWidgetData } from './useHomeWidgetData';

/**
 * "Begin training now", wherever it is pressed from.
 *
 * A running session is resumed rather than replaced, and a day with nothing
 * queued hands over to the library instead of failing silently — the button
 * that says "start" always leads somewhere you can start.
 */
export function useStartSession(): () => void {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { nextSession } = useHomeWidgetData();
  const { currentWorkout, startTemplateWorkout } = useCurrentWorkout();

  return useCallback(() => {
    if (currentWorkout) {
      openCurrentWorkout(navigation);
      return;
    }
    const templateId = nextSession?.templateId;
    if (!templateId) {
      navigation.dispatch(
        CommonActions.navigate({ name: 'Main', params: { screen: 'Library' } }),
      );
      return;
    }
    try {
      startTemplateWorkout(templateId);
      openCurrentWorkout(navigation);
    } catch (error) {
      Alert.alert(
        t('plan.alerts.startFailedTitle'),
        error instanceof Error ? error.message : t('common.tryAgain'),
      );
    }
  }, [currentWorkout, navigation, nextSession, startTemplateWorkout, t]);
}
