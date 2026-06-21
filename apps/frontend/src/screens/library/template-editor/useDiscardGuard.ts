import { useEffect, type MutableRefObject } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

// Guards against leaving the editor with unsaved changes. Intentional
// navigation (save / delete) flips the shared `bypass` ref first so the prompt
// is skipped; a back-swipe or cancel re-dispatches the original action only
// after the user confirms the discard.
export function useDiscardGuard(
  isDirty: boolean,
  bypass: MutableRefObject<boolean>,
) {
  const navigation = useNavigation();
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', event => {
      if (bypass.current || !isDirty) {
        return;
      }
      event.preventDefault();
      Alert.alert(
        t('templateEditor.alerts.discardTitle'),
        t('templateEditor.alerts.discardBody'),
        [
          { text: t('templateEditor.alerts.keepEditing'), style: 'cancel' },
          {
            text: t('templateEditor.alerts.discard'),
            style: 'destructive',
            onPress: () => navigation.dispatch(event.data.action),
          },
        ],
      );
    });
    return unsubscribe;
  }, [navigation, isDirty, t, bypass]);

  return { goBack: () => navigation.goBack() };
}
