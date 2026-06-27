import { Alert } from 'react-native';
import type { TFunction } from 'i18next';

// Confirms a history workout deletion before committing. Resolves `true` once the
// workout has been deleted, or `false` if the user cancels — letting the swipe row
// spring back instead of being removed.
export function confirmDeleteWorkout(
  t: TFunction,
  workoutName: string,
  deleteWorkout: () => void,
): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    Alert.alert(
      t('history.alerts.deleteTitle', { name: workoutName }),
      t('history.alerts.deleteBody'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteWorkout();
            resolve(true);
          },
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
