import { Alert } from 'react-native';
import type { TFunction } from 'i18next';
import type { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import type {
  CurrentWorkoutExercise,
  CurrentWorkoutSet,
} from '@/stores/currentWorkoutModel';

type RemoveSet = ReturnType<typeof useCurrentWorkout>['removeSet'];
type RemoveExercise = ReturnType<typeof useCurrentWorkout>['removeExercise'];

// Resolves true once the set is removed, false if the user cancels — so a
// swipe-to-delete row can spring back instead of vanishing on a declined
// confirmation. Done sets prompt; not-yet-done sets remove immediately.
export function requestRemoveSet(
  t: TFunction,
  exercise: CurrentWorkoutExercise,
  set: CurrentWorkoutSet,
  removeSet: RemoveSet,
): Promise<boolean> {
  if (!set.isDone) {
    removeSet(exercise.id, set.id);
    return Promise.resolve(true);
  }
  return new Promise<boolean>(resolve => {
    Alert.alert(
      t('currentWorkout.alerts.removeSetTitle'),
      t('currentWorkout.alerts.removeSetBody'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: () => {
            removeSet(exercise.id, set.id);
            resolve(true);
          },
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

// Same contract as requestRemoveSet: resolves false on cancel so the swipe row
// can restore. Only prompts when the exercise has completed sets to lose.
export function requestRemoveExercise(
  t: TFunction,
  exercise: CurrentWorkoutExercise,
  removeExercise: RemoveExercise,
): Promise<boolean> {
  const remove = () => removeExercise(exercise.id);
  if (!exercise.sets.some(set => set.isDone)) {
    remove();
    return Promise.resolve(true);
  }
  return new Promise<boolean>(resolve => {
    Alert.alert(
      t('currentWorkout.alerts.removeExerciseTitle'),
      t('currentWorkout.alerts.removeExerciseBody'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: () => {
            remove();
            resolve(true);
          },
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
